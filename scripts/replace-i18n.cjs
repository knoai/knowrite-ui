/**
 * Replace Chinese text with t() calls across all source files.
 */
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'src');
const map = require('./i18n-map-clean.json');

// Sort by length descending to avoid partial matches
const entries = Object.entries(map).sort((a, b) => b[0].length - a[0].length);

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

function containsChinese(str) {
  return /[\u4e00-\u9fff]/.test(str);
}

function isInsideJSXAttribute(line, idx) {
  // Simple heuristic: before idx, there's a = and no > after it
  const before = line.slice(0, idx);
  const after = line.slice(idx);
  return /=\s*["']?$/.test(before) || /="[^"]*$/.test(before) || /='[^']*$/.test(before);
}

function isInsideJSXText(line, idx) {
  const before = line.slice(0, idx);
  const after = line.slice(idx);
  return />[^<]*$/.test(before) && /^[^<>]*</.test(after);
}

function replaceInLine(line, text, key) {
  let result = line;
  let idx = result.indexOf(text);
  while (idx !== -1) {
    const before = result.slice(0, idx);
    const after = result.slice(idx + text.length);

    // Determine context
    let replacement;
    if (isInsideJSXAttribute(result, idx)) {
      // JSX attribute: prop="中文" -> prop={t('key')}
      // Check if the text is inside quotes after an =
      const attrMatch = before.match(/(\w+)=(["'])$/);
      if (attrMatch) {
        // Remove the opening quote before the text
        replacement = `{t('${key}')}`;
        result = before.slice(0, -1) + replacement + after.replace(/^["']/, '');
      } else {
        replacement = `{t('${key}')}`;
        result = before + replacement + after;
      }
    } else if (isInsideJSXText(result, idx)) {
      // JSX text node: >中文< -> >{t('key')}<
      replacement = `{t('${key}')}`;
      result = before + replacement + after;
    } else {
      // JS string context
      // Check if wrapped in quotes
      const isQuoted = (before.endsWith('"') || before.endsWith("'") || before.endsWith('`')) &&
                       (after.startsWith('"') || after.startsWith("'") || after.startsWith('`'));
      if (isQuoted) {
        replacement = `t('${key}')`;
        result = before.slice(0, -1) + replacement + after.slice(1);
      } else {
        // Not in quotes, just replace inline
        replacement = `t('${key}')`;
        result = before + replacement + after;
      }
    }

    idx = result.indexOf(text);
  }
  return result;
}

for (const file of walkDir(SRC_DIR)) {
  const rel = path.relative(SRC_DIR, file);
  if (rel.startsWith('i18n/')) continue;

  let content = fs.readFileSync(file, 'utf-8');
  if (!containsChinese(content)) continue;

  const originalContent = content;
  const lines = content.split('\n');
  let modified = false;

  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!containsChinese(line)) continue;
    // Skip import lines and comment lines
    if (/^\s*import\s/.test(line)) continue;
    if (/^\s*\/\//.test(line)) continue;

    let newLine = line;
    for (const [text, key] of entries) {
      if (!newLine.includes(text)) continue;
      newLine = replaceInLine(newLine, text, key);
    }
    if (newLine !== line) {
      lines[i] = newLine;
      modified = true;
    }
  }

  if (!modified) continue;

  content = lines.join('\n');

  // Add import for useI18n if not present
  if (!content.includes('useI18n')) {
    // Find the last import line and add after it
    const importLines = content.split('\n').filter(l => /^\s*import\s/.test(l));
    if (importLines.length > 0) {
      const lastImport = importLines[importLines.length - 1];
      const relativePath = path.relative(path.dirname(file), path.join(SRC_DIR, 'contexts')).replace(/\\/g, '/');
      const importPath = relativePath.startsWith('.') ? relativePath : './' + relativePath;
      const newImport = `import { useI18n } from '${importPath}/I18nContext';`;
      content = content.replace(lastImport, lastImport + '\n' + newImport);
    }
  }

  // Add const { t } = useI18n(); in component functions
  // Find export function ComponentName( patterns and add after opening brace
  if (content.includes('useI18n') && !content.includes('const { t } = useI18n()')) {
    // Try to add in the first export function or const Component
    const funcPattern = /(export\s+(default\s+)?function\s+\w+\s*\([^)]*\)\s*\{)/;
    const arrowPattern = /(export\s+(default\s+)?const\s+\w+\s*=\s*(\([^)]*\)|\w+)\s*=>\s*\{)/;
    const match = content.match(funcPattern) || content.match(arrowPattern);
    if (match) {
      const insert = match[1] + '\n  const { t } = useI18n();';
      content = content.replace(match[1], insert);
    }
  }

  fs.writeFileSync(file, content, 'utf-8');
  console.log(`Modified: ${rel}`);
}

console.log('Done replacing Chinese text with t() calls');
