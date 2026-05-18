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

export { normalizeDocumentVoToDoc };

export function compareDocumentVos(oldDocumentVo = {}, newDocumentVo = {}) {
  const oldEditorData = normalizeDocumentVoToDoc(oldDocumentVo);
  const newEditorData = normalizeDocumentVoToDoc(newDocumentVo);
  const { oldBlocks, newBlocks } = compareBlockList(
    oldEditorData.content?.content || [],
    newEditorData.content?.content || []
  );

  return {
    oldCompareDoc: createCompareDoc(cloneData(oldEditorData), oldBlocks),
    newCompareDoc: createCompareDoc(cloneData(newEditorData), newBlocks)
  };
}
