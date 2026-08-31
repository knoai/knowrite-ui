import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({
  breaks: true,
  gfm: true,
});

interface MarkdownRendererProps {
  text: string;
  className?: string;
}

export default function MarkdownRenderer({ text, className = '' }: MarkdownRendererProps) {
  if (!text) return null;
  const rawHtml = marked.parse(text) as string;
  const cleanHtml = DOMPurify.sanitize(rawHtml);
  return (
    <div
      className={`markdown-body ${className}`}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
}
