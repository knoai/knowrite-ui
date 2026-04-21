const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'src');
const map = require('./i18n-map-clean.json');
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

function hasChinese(str) { return /[\u4e00-\u9fff]/.test(str); }

function getQuoteChar(line, idx) {
  const before = line.slice(0, idx);
  const after = line.slice(idx);
  for (let i = before.length - 1; i >= 0; i--) {
    const c = before[i];
    if (c === "'" || c === '"' || c === '`') {
      if (after.indexOf(c) !== -1) {
        const between = before.slice(i + 1);
        if (!between.includes(c)) return c;
      }
    }
  }
  return null;
}

function isInsideJSXExpr(line, idx) {
  const before = line.slice(0, idx);
  if (!/[<>]/.test(before) && !/[<>]/.test(line.slice(idx))) return false;
  const open = before.lastIndexOf('{');
  const close = before.lastIndexOf('}');
  return open !== -1 && open > close;
}

function isInsideJSXAttr(line, idx) {
  if (isInsideJSXExpr(line, idx)) return false;
  const before = line.slice(0, idx);
  // JSX attribute: prop="..." or prop='...' (no spaces around =)
  // JS assignment: var = '...' (spaces around =)
  if (/\s=\s/.test(before)) return false;
  return /=\s*["']?$/.test(before) || /=\"[^\"]*$/.test(before) || /='[^']*$/.test(before);
}

function isInsideJSXText(line, idx) {
  if (isInsideJSXExpr(line, idx)) return false;
  const b = line.slice(0, idx), a = line.slice(idx);
  return />[^<]*$/.test(b) && /^[^<>]*</.test(a);
}

function replaceInLine(line, text, key) {
  let result = line, idx = result.indexOf(text);
  while (idx !== -1) {
    const before = result.slice(0, idx);
    const after = result.slice(idx + text.length);
    const qc = getQuoteChar(result, idx);
    const tQuote = qc === "'" ? '"' : "'";
    let replacement;

    if (isInsideJSXExpr(result, idx)) {
      replacement = `t(${tQuote}${key}${tQuote})`;
      if (qc) result = before.slice(0, before.lastIndexOf(qc)) + replacement + after.replace(new RegExp(`^[^${qc}]*${qc}`), '');
      else result = before + replacement + after;
    } else if (isInsideJSXAttr(result, idx) && qc) {
      replacement = `{t(${tQuote}${key}${tQuote})}`;
      result = before.slice(0, before.lastIndexOf(qc)) + replacement + after.replace(new RegExp(`^[^${qc}]*${qc}`), '');
    } else if (isInsideJSXText(result, idx)) {
      replacement = `{t('${key}')}`;
      result = before + replacement + after;
    } else if (qc) {
      replacement = `t(${tQuote}${key}${tQuote})`;
      result = before.slice(0, before.lastIndexOf(qc)) + replacement + after.replace(new RegExp(`^[^${qc}]*${qc}`), '');
    } else {
      replacement = `t('${key}')`;
      result = before + replacement + after;
    }
    idx = result.indexOf(text);
  }
  return result;
}

for (const file of walkDir(SRC_DIR)) {
  const rel = path.relative(SRC_DIR, file);
  if (rel.startsWith('i18n/')) continue;
  if (['components/Layout.jsx', 'components/LanguageSwitcher.jsx', 'contexts/I18nContext.jsx', 'main.jsx'].includes(rel)) continue;

  let content = fs.readFileSync(file, 'utf-8');
  if (!hasChinese(content)) continue;

  const lines = content.split('\n');
  let modified = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!hasChinese(line)) continue;
    if (/^\s*import\s/.test(line) || /^\s*\/\//.test(line) || /console\./.test(line)) continue;

    let newLine = line;
    for (const [text, key] of entries) {
      if (!newLine.includes(text)) continue;
      newLine = replaceInLine(newLine, text, key);
    }
    if (newLine !== line) { lines[i] = newLine; modified = true; }
  }

  if (!modified) continue;
  content = lines.join('\n');

  if (!content.includes('useI18n') && content.includes('export')) {
    const importLines = content.split('\n').filter(l => /^\s*import\s/.test(l));
    if (importLines.length > 0) {
      const lastImport = importLines[importLines.length - 1];
      const rp = path.relative(path.dirname(file), path.join(SRC_DIR, 'contexts')).replace(/\\/g, '/');
      const ip = rp.startsWith('.') ? rp : './' + rp;
      content = content.replace(lastImport, lastImport + `\nimport { useI18n } from '${ip}/I18nContext';`);
    }
  }

  if (content.includes('useI18n') && !content.includes('const { t } = useI18n()')) {
    const m = content.match(/(export\s+(default\s+)?function\s+\w+\s*\([^)]*\)\s*\{)/)
         || content.match(/(export\s+(default\s+)?const\s+\w+\s*=\s*(\([^)]*\)|\w+)\s*=>\s*\{)/);
    if (m) content = content.replace(m[1], m[1] + '\n  const { t } = useI18n();');
  }

  fs.writeFileSync(file, content, 'utf-8');
  console.log(`Modified: ${rel}`);
}
console.log('Done');
