/**
 * Extract Chinese UI text from JSX/JS files and generate i18n translation files.
 * Usage: node scripts/extract-i18n.js
 */
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'src');

// Find all .js/.jsx files recursively
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
  return /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(str);
}

function sanitizeKey(str) {
  // Create a readable key from Chinese text
  let key = str
    .replace(/[\s，。！？、：；""''（）《》【】\-·\/\n\r]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60)
    .toLowerCase();
  // Remove non-ascii chars from key since they're Chinese
  key = key.replace(/[^a-z0-9_]/g, '');
  if (!key) {
    // If key is empty after sanitization, use hash
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash) + str.charCodeAt(i);
    key = 't_' + Math.abs(hash).toString(36);
  }
  return key;
}

const seen = new Map(); // key -> { text, count, files: Set }

for (const file of walkDir(SRC_DIR)) {
  const rel = path.relative(SRC_DIR, file);
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip pure comment lines
    if (/^\s*(\/\/|\*|\*\/|\/\*)/.test(line)) continue;

    // Find string literals with Chinese
    // Match: '...', "...", `...` that contain Chinese
    const matches = [...line.matchAll(/(['"`])([^'"`]*?[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef][^'"`]*)\1/g)];
    for (const m of matches) {
      const text = m[2].trim();
      if (!text) continue;
      const key = sanitizeKey(text);
      if (!seen.has(key)) {
        seen.set(key, { text, count: 0, files: new Set() });
      }
      const entry = seen.get(key);
      entry.count++;
      entry.files.add(rel);
    }

    // Find JSX text nodes: >...< (but not within attributes)
    // Simple approach: find text between > and < that contains Chinese
    const jsxMatches = [...line.matchAll(/>([^<>]*?[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef][^<>]*)</g)];
    for (const m of jsxMatches) {
      const text = m[1].trim();
      if (!text || text.startsWith('{') || text.endsWith('}')) continue;
      const key = sanitizeKey(text);
      if (!seen.has(key)) {
        seen.set(key, { text, count: 0, files: new Set() });
      }
      const entry = seen.get(key);
      entry.count++;
      entry.files.add(rel);
    }
  }
}

// Deduplicate: if same key maps to different texts, add suffix
const finalEntries = [];
const keyToIndex = new Map();
for (const [key, data] of seen) {
  let finalKey = key;
  let idx = 1;
  while (keyToIndex.has(finalKey)) {
    const existing = finalEntries[keyToIndex.get(finalKey)];
    if (existing.text === data.text) {
      // Same text, merge counts
      existing.count += data.count;
      data.files.forEach(f => existing.files.add(f));
      break;
    }
    finalKey = `${key}_${idx}`;
    idx++;
  }
  if (!keyToIndex.has(finalKey)) {
    keyToIndex.set(finalKey, finalEntries.length);
    finalEntries.push({ key: finalKey, text: data.text, count: data.count, files: data.files });
  }
}

console.log(`Found ${finalEntries.length} unique Chinese UI strings`);

// Generate translation files
let enJs = `export const en = {\n`;
let zhJs = `export const zh = {\n`;

for (const e of finalEntries) {
  // For now, put Chinese text as English too (will translate manually)
  // Actually, let's try to auto-translate common patterns
  const enText = e.text; // Placeholder - will be translated
  zhJs += `  '${e.key}': '${e.text.replace(/'/g, "\\'")}',\n`;
  enJs += `  '${e.key}': '${enText.replace(/'/g, "\\'")}',\n`;
}

enJs += `};\n`;
zhJs += `};\n`;

fs.writeFileSync(path.join(SRC_DIR, 'i18n', 'en.js'), enJs);
fs.writeFileSync(path.join(SRC_DIR, 'i18n', 'zh.js'), zhJs);

// Also write a mapping file for replacement
const mapJson = {};
for (const e of finalEntries) {
  mapJson[e.text] = e.key;
}
fs.writeFileSync(path.join(__dirname, 'i18n-map.json'), JSON.stringify(mapJson, null, 2));

console.log('Wrote:');
console.log('  src/i18n/en.js');
console.log('  src/i18n/zh.js');
console.log('  scripts/i18n-map.json');
