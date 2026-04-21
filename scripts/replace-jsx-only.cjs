const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src');
const map = require('./i18n-map-clean.json');
const entries = Object.entries(map).sort((a, b) => b[0].length - a[0].length);

function hasChinese(s) { return /[\u4e00-\u9fff]/.test(s); }
function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir)) {
    const f = path.join(dir, e);
    if (fs.statSync(f).isDirectory()) out.push(...walk(f));
    else if (/\.(jsx|js)$/.test(e)) out.push(f);
  }
  return out;
}

const done = new Set([
  'components/Layout.jsx','components/LanguageSwitcher.jsx','contexts/I18nContext.jsx','main.jsx',
  'pages/TryCreatePage.jsx','pages/AgentChatPage.jsx','pages/ChatPage.jsx','pages/TraceDashboardPage.jsx',
  'components/ChapterVersionSelect.jsx','components/FitnessBars.jsx','components/LogPanel.jsx',
]);

for (const file of walk(SRC)) {
  const rel = path.relative(SRC, file);
  if (rel.startsWith('i18n/')) continue;
  if (done.has(rel)) continue;

  let content = fs.readFileSync(file, 'utf-8');
  if (!hasChinese(content)) continue;

  const lines = content.split('\n');
  let modified = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (!hasChinese(line)) continue;
    if (/^\s*import\s/.test(line) || /^\s*\/\//.test(line) || /console\./.test(line)) continue;

    // JSX text nodes: >...<
    for (const [text, key] of entries) {
      if (!line.includes(text)) continue;
      const re = new RegExp(`>([^<>]*${esc(text)}[^<>]*)<`, 'g');
      line = line.replace(re, () => `>{t('${key}')}<`);
    }

    // JSX attributes: prop="..." or prop='...'
    for (const [text, key] of entries) {
      if (!line.includes(text)) continue;
      const reD = new RegExp(`\\b(\\w+)=\"([^\"]*${esc(text)}[^\"]*)\"`, 'g');
      const reS = new RegExp(`\\b(\\w+)='([^']*${esc(text)}[^']*)'`, 'g');
      line = line.replace(reD, (_, attr) => `${attr}={t("${key}")}`);
      line = line.replace(reS, (_, attr) => `${attr}={t('${key}')}`);
    }

    if (line !== lines[i]) { lines[i] = line; modified = true; }
  }

  if (!modified) continue;
  content = lines.join('\n');

  if (!content.includes('useI18n') && content.includes('export')) {
    const imports = content.split('\n').filter(l => /^\s*import\s/.test(l));
    if (imports.length) {
      const last = imports[imports.length - 1];
      const rp = path.relative(path.dirname(file), path.join(SRC, 'contexts')).replace(/\\/g, '/');
      const ip = rp.startsWith('.') ? rp : './' + rp;
      content = content.replace(last, last + `\nimport { useI18n } from '${ip}/I18nContext';`);
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
