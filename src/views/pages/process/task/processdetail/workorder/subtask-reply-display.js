// 表格显示方式来自策略当前配置；旧配置或未知值保持原来的分开展示。
export function normalizeReplyDisplayMode(mode) {
  return mode === 'combined' ? 'combined' : 'separate';
}

function getButtonText(button) {
  return typeof button === 'string' && button.trim() ? button : '';
}

function removeHtmlWhitespaceEntities(text) {
  // 数字实体按 Unicode 空白判定，命名空白实体直接替换；不解析完整长 HTML。
  return text.replace(/&#(?:[xX]([0-9a-fA-F]+)|([0-9]+));?/g, (entity, hexadecimal, decimal) => {
    const codePoint = parseInt(hexadecimal || decimal, hexadecimal ? 16 : 10);
    return codePoint <= 0x10ffff && /\s/.test(String.fromCodePoint(codePoint)) ? ' ' : entity;
  }).replace(/&(?:nbsp|NonBreakingSpace|ensp|emsp|emsp13|emsp14|numsp|puncsp|thinsp|ThinSpace|hairsp|VeryThinSpace|MediumSpace|ThickSpace|Tab|NewLine);/g, ' ');
}

// 只判断内容是否为空，不创建完整 DOM，避免生成表格摘要前提前解析全部 HTML。
export function hasReplyContent(content) {
  if (typeof content !== 'string' || !content.trim()) return false;
  const tokens = /<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>|<[^>]*>|[^<]+|</gi;
  let match;
  // 遇到首个有效文字或媒体即结束，普通长回复无需扫描后续内容。
  while ((match = tokens.exec(content))) {
    const token = match[0];
    if (/^<(?:img|video|audio|iframe|svg|canvas|hr|object|embed)\b/i.test(token)) return true;
    if (token[0] !== '<' && removeHtmlWhitespaceEntities(token).trim()) return true;
  }
  return false;
}

function parseReplyHtml(content) {
  // template 的内容不会执行脚本或挂到页面；按钮另以文本节点写入。
  const template = document.createElement('template');
  template.innerHTML = content;
  return template;
}

export function getReplyDisplayHtml(content, button, mode) {
  const originalContent = typeof content === 'string' ? content : '';
  if (normalizeReplyDisplayMode(mode) !== 'combined') return hasReplyContent(originalContent) ? originalContent : '';
  const buttonText = getButtonText(button);
  const hasContent = hasReplyContent(originalContent);
  if (!buttonText) return hasContent ? originalContent : '';
  const template = parseReplyHtml(hasContent ? originalContent : '');
  const prefix = document.createTextNode(buttonText + (hasContent ? '。' : ''));
  const firstNode = Array.from(template.content.childNodes).find(node => node.nodeType === 1 || (node.nodeType === 3 && node.textContent.trim()));
  if (firstNode && firstNode.nodeType === 1 && firstNode.tagName === 'P') {
    // 普通段落与操作名称同一行，保留段内加粗、链接等富文本。
    firstNode.insertBefore(prefix, firstNode.firstChild);
  } else if (firstNode && firstNode.nodeType === 1 && /^(ADDRESS|ARTICLE|ASIDE|BLOCKQUOTE|DIV|DL|FIGURE|H[1-6]|HR|OL|PRE|SECTION|TABLE|UL)$/.test(firstNode.tagName)) {
    // 表格、列表等结构不能直接插入文字，在其前方增加普通段落。
    const paragraph = document.createElement('p');
    paragraph.appendChild(prefix);
    template.content.insertBefore(paragraph, firstNode);
  } else {
    template.content.insertBefore(prefix, template.content.firstChild);
  }
  return template.innerHTML;
}

export function getReplyDisplayText(content, button, mode) {
  const html = getReplyDisplayHtml(content, button, mode);
  if (!html) return '';
  const template = parseReplyHtml(html);
  template.content.querySelectorAll('script, style').forEach(node => node.remove());
  return template.content.textContent || '';
}

// 待回复行不影响列显隐；调用方按当前策略填入模式，至少有已回复行时才隐藏操作列。
export function shouldShowReplyActionColumn(rows) {
  const repliedRows = (rows || []).filter(row => {
    // 附件操作可能给待回复行写入 endTime，优先按明确状态判断；旧响应才兼容时间字段。
    if (row.status !== null && row.status !== undefined && row.status !== '') return row.status === 'succeed';
    return row.endTime !== null && row.endTime !== undefined && row.endTime !== '';
  });
  return !repliedRows.length || repliedRows.some(row => normalizeReplyDisplayMode(row.replyDisplayMode) !== 'combined');
}
