/**
 * Clean extraction of Chinese UI text, filtering out code snippets.
 */
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'src');

function walkDir(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) files.push(...walkDir(full));
    else if (/\.(jsx|js)$/.test(entry)) files.push(full);
  }
  return files;
}

function hasChinese(str) {
  return /[\u4e00-\u9fff]/.test(str);
}

function isCodeSnippet(str) {
  // Filter out strings that contain code
  const codePatterns = [
    /className=/i, /</, />/, /\{/, /\}/,
    /function\s/, /const\s/, /let\s/, /var\s/,
    /import\s/, /export\s/, /return\s/,
    /\$\{/, /=>/, /\(\)/, /\[/, /\]/,
    /\.map\(/, /\.filter\(/, /\.reduce\(/,
    /onClick/, /onChange/, /onSubmit/,
    /useState/, /useEffect/, /useCallback/,
    /NavLink/, /Route/, /Outlet/,
  ];
  return codePatterns.some(p => p.test(str));
}

function sanitizeKey(str) {
  let key = str
    .replace(/[\s，。！？、：；""''（）《》【】\-·\/\n\r\t]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 50)
    .toLowerCase();
  key = key.replace(/[^a-z0-9_]/g, '');
  if (!key) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash) + str.charCodeAt(i);
    key = 't_' + Math.abs(hash).toString(36).slice(0, 8);
  }
  return key;
}

const seen = new Map();

for (const file of walkDir(SRC_DIR)) {
  const rel = path.relative(SRC_DIR, file);
  // Skip i18n files themselves
  if (rel.startsWith('i18n/')) continue;
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*(\/\/|\*|\*\/|\/\*)/.test(line)) continue;

    // Extract from string literals
    const matches = [...line.matchAll(/(['"`])([^'"`]*?[\u4e00-\u9fff][^'"`]*)\1/g)];
    for (const m of matches) {
      const text = m[2].trim();
      if (!text || text.length > 100 || isCodeSnippet(text)) continue;
      const key = sanitizeKey(text);
      if (!seen.has(key)) seen.set(key, { text, count: 0, files: new Set() });
      seen.get(key).count++;
      seen.get(key).files.add(rel);
    }

    // Extract from JSX text nodes
    const jsxMatches = [...line.matchAll(/>([^<>]*?[\u4e00-\u9fff][^<>]*)</g)];
    for (const m of jsxMatches) {
      const text = m[1].trim();
      if (!text || text.startsWith('{') || text.endsWith('}') || text.length > 100 || isCodeSnippet(text)) continue;
      const key = sanitizeKey(text);
      if (!seen.has(key)) seen.set(key, { text, count: 0, files: new Set() });
      seen.get(key).count++;
      seen.get(key).files.add(rel);
    }
  }
}

const entries = Array.from(seen.entries());
const finalEntries = [];
const keyToIndex = new Map();
for (const [key, data] of entries) {
  let finalKey = key;
  let idx = 1;
  while (keyToIndex.has(finalKey)) {
    const existing = finalEntries[keyToIndex.get(finalKey)];
    if (existing.text === data.text) { existing.count += data.count; data.files.forEach(f => existing.files.add(f)); break; }
    finalKey = `${key}_${idx}`;
    idx++;
  }
  if (!keyToIndex.has(finalKey)) {
    keyToIndex.set(finalKey, finalEntries.length);
    finalEntries.push({ key: finalKey, text: data.text, count: data.count, files: data.files });
  }
}

console.log(`Clean extraction: ${finalEntries.length} unique Chinese UI strings`);

let enJs = `export const en = {\n`;
let zhJs = `export const zh = {\n`;

for (const e of finalEntries) {
  zhJs += `  '${e.key}': '${e.text.replace(/'/g, "\\'")}',\n`;
  enJs += `  '${e.key}': '${e.text.replace(/'/g, "\\'")}',\n`;
}
enJs += `};\n`;
zhJs += `};\n`;

fs.writeFileSync(path.join(SRC_DIR, 'i18n', 'en.js'), enJs);
fs.writeFileSync(path.join(SRC_DIR, 'i18n', 'zh.js'), zhJs);

const mapJson = {};
for (const e of finalEntries) mapJson[e.text] = e.key;
fs.writeFileSync(path.join(__dirname, 'i18n-map-clean.json'), JSON.stringify(mapJson, null, 2));

console.log('Wrote clean files');
