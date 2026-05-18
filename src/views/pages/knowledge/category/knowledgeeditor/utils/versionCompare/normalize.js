import {
  EMPTY_TIPTAP_DOC,
  knowledgePayloadToTiptap
} from '@/views/pages/knowledge/category/knowledgeeditor/adapters/knowledge-data-adapter.js';

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

const LEGACY_COMPARE_KEYS = new Set([
  'changeType',
  'compareChangeType',
  'lineNumber'
]);

const LEGACY_COMPARE_CLASS_LIST = [
  'knowledge-compare-mark',
  'knowledge-compare-block',
  'knowledge-compare-insert',
  'knowledge-compare-delete',
  'knowledge-compare-update',
  'bg-insert',
  'bg-delete',
  'bg-update',
  'line-through'
];

function removeCompareClass(value = '') {
  return String(value || '').replace(/\sclass="([^"]*)"/g, (match, className = '') => {
    const nextClassName = className
      .split(/\s+/)
      .filter(item => item && !LEGACY_COMPARE_CLASS_LIST.includes(item))
      .join(' ');
    return nextClassName ? ` class="${nextClassName}"` : '';
  });
}

function removeLegacyCompareHtml(value = '') {
  if (typeof value !== 'string') {
    return value;
  }
  return removeCompareClass(value)
    .replace(/\sdata-compare-change-type="[^"]*"/g, '')
    .replace(/<(s|strike|del)(\s[^>]*)?>/gi, '')
    .replace(/<\/(s|strike|del)>/gi, '');
}

function removeLegacyCompareData(value) {
  if (Array.isArray(value)) {
    return value.map(item => removeLegacyCompareData(item));
  }
  if (!value || typeof value !== 'object') {
    return typeof value === 'string' ? removeLegacyCompareHtml(value) : value;
  }

  const nextValue = {};
  Object.keys(value).forEach(key => {
    if (LEGACY_COMPARE_KEYS.has(key)) {
      return;
    }
    if (key === 'marks') {
      nextValue[key] = (value[key] || [])
        .filter(mark => mark.type !== 'compareMark' && mark.type !== 'strike')
        .map(mark => removeLegacyCompareData(mark));
      return;
    }
    nextValue[key] = removeLegacyCompareData(value[key]);
  });
  return nextValue;
}

function safeParseJson(value) {
  if (typeof value !== 'string') {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
}

function isTiptapDoc(value) {
  return !!(value && value.type === 'doc' && Array.isArray(value.content));
}

function normalizeFileList(documentVo = {}) {
  if (Array.isArray(documentVo.fileList)) {
    return documentVo.fileList;
  }
  if (Array.isArray(documentVo.attachmentList)) {
    return documentVo.attachmentList;
  }
  if (Array.isArray(documentVo.fileVoList)) {
    return documentVo.fileVoList;
  }
  return (documentVo.fileIdList || []).map(id => ({ id }));
}

function getContentDoc(documentVo = {}) {
  const content = safeParseJson(documentVo.content);
  if (isTiptapDoc(documentVo)) {
    return documentVo;
  }
  if (isTiptapDoc(content)) {
    return content;
  }
  return null;
}

export function normalizeDocumentVoToDoc(documentVo = {}) {
  const cleanDocumentVo = removeLegacyCompareData(documentVo || {});
  const contentDoc = getContentDoc(cleanDocumentVo);
  if (contentDoc) {
    return {
      title: cleanDocumentVo.title || '',
      content: cloneData(removeLegacyCompareData(contentDoc)),
      tagList: cleanDocumentVo.tagList || [],
      fileList: normalizeFileList(cleanDocumentVo),
      meta: {
        knowledgeDocumentId: cleanDocumentVo.knowledgeDocumentId || cleanDocumentVo.id || null,
        knowledgeDocumentVersionId: cleanDocumentVo.knowledgeDocumentVersionId || null,
        knowledgeDocumentTypeUuid: cleanDocumentVo.knowledgeDocumentTypeUuid || null,
        source: cleanDocumentVo.source || 'knowledge-compare',
        invokeId: cleanDocumentVo.invokeId || null
      }
    };
  }

  const editorData = knowledgePayloadToTiptap(cleanDocumentVo || {});
  return {
    ...editorData,
    content: editorData.content || cloneData(EMPTY_TIPTAP_DOC)
  };
}
