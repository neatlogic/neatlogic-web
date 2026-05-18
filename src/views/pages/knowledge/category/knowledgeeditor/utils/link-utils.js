export const KNOWLEDGE_INNER_LINK_CLASS = 'innera';
export const KNOWLEDGE_OUTER_LINK_CLASS = 'outera';
export const KNOWLEDGE_INNER_LINK_PATH = '/knowledge.html#/knowledge-detail';

export function getKnowledgeDocumentIdFromHref(href) {
  const match = String(href || '').match(/[?&]knowledgeDocumentId=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function getInnerKnowledgeHref(knowledgeDocumentId) {
  if (!knowledgeDocumentId) {
    return '';
  }
  const baseUrl = typeof HOME === 'undefined' ? '' : HOME;
  return `${baseUrl}${KNOWLEDGE_INNER_LINK_PATH}?knowledgeDocumentId=${encodeURIComponent(knowledgeDocumentId)}&status=passed`;
}

export function isInnerKnowledgeLink(href, className = '') {
  return hasLinkClass(className, KNOWLEDGE_INNER_LINK_CLASS) || /knowledge\.html#\/knowledge-detail/i.test(href || '');
}

export function getKnowledgeLinkType(href, className = '') {
  return isInnerKnowledgeLink(href, className) ? 'inner' : 'outer';
}

export function getKnowledgeLinkClass(linkType = 'outer') {
  return linkType === 'inner'
    ? `link ${KNOWLEDGE_INNER_LINK_CLASS}`
    : `link ${KNOWLEDGE_OUTER_LINK_CLASS}`;
}

function hasLinkClass(className, expectedClassName) {
  return new RegExp(`(^|\\s)${expectedClassName}(\\s|$)`).test(className || '');
}
