import { marked } from 'marked';

marked.setOptions({
  breaks: true,
  gfm: true,
});

export default function MarkdownRenderer({ text, className = '' }) {
  if (!text) return null;
  const html = marked.parse(text);
  return (
    <div
      className={`markdown-body ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
