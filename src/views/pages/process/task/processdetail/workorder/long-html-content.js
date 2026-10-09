export const LONG_HTML_THRESHOLD = 40000; // 长HTML内容阈值

export function isLongHtml(content) {
  return typeof content === 'string' && content.length > LONG_HTML_THRESHOLD;
}

// Only inspect a bounded prefix. The result is rendered as text, never as HTML.
export function getLongHtmlPreview(content) {
  const prefix = content.slice(0, 2048);
  const lastTagStart = prefix.lastIndexOf('<');
  const completePrefix = lastTagStart > prefix.lastIndexOf('>') ? prefix.slice(0, lastTagStart) : prefix;
  const text = completePrefix
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
  return text.slice(0, 120);
}
