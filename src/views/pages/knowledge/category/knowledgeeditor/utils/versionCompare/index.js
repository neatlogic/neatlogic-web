import { normalizeDocumentVoToDoc } from './normalize.js';
import { compareBlockList } from './block-diff.js';

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function createCompareDoc(editorData = {}, content = []) {
  return {
    ...editorData,
    content: {
      ...(editorData.content || { type: 'doc' }),
      type: 'doc',
      content
    },
    meta: {
      ...(editorData.meta || {}),
      source: 'knowledge-compare'
    }
  };
}

function getTagText(tag) {
  if (tag === null || tag === undefined) {
    return '';
  }
  if (typeof tag === 'object') {
    return String(tag.name || tag.text || tag.label || tag.value || '').trim();
  }
  return String(tag).trim();
}

function getTagCompareList(currentTagList = [], oppositeTagList = [], side) {
  const oppositeTagSet = new Set((oppositeTagList || []).map(getTagText).filter(Boolean));
  return (currentTagList || []).map(tag => {
    const text = getTagText(tag);
    return {
      text,
      changeType: text && !oppositeTagSet.has(text) ? side === 'old' ? 'delete' : 'insert' : ''
    };
  }).filter(tag => tag.text);
}

function withTagCompareMeta(editorData = {}, oppositeEditorData = {}, side) {
  return {
    ...editorData,
    meta: {
      ...(editorData.meta || {}),
      tagCompareList: getTagCompareList(editorData.tagList, oppositeEditorData.tagList, side)
    }
  };
}

export { normalizeDocumentVoToDoc };

export function compareDocumentVos(oldDocumentVo = {}, newDocumentVo = {}) {
  const oldEditorData = normalizeDocumentVoToDoc(oldDocumentVo);
  const newEditorData = normalizeDocumentVoToDoc(newDocumentVo);
  const { oldBlocks, newBlocks } = compareBlockList(
    oldEditorData.content?.content || [],
    newEditorData.content?.content || []
  );

  return {
    oldCompareDoc: createCompareDoc(withTagCompareMeta(cloneData(oldEditorData), newEditorData, 'old'), oldBlocks),
    newCompareDoc: createCompareDoc(withTagCompareMeta(cloneData(newEditorData), oldEditorData, 'new'), newBlocks)
  };
}
