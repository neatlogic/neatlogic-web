const ALLOWED_CHANGE_TYPES = ['insert', 'delete', 'update'];

function isAllowedChangeType(changeType) {
  return ALLOWED_CHANGE_TYPES.includes(changeType);
}

export function getNodeText(node = {}) {
  if (node.type === 'text') {
    return node.text || '';
  }
  return (node.content || []).map(child => getNodeText(child)).join('');
}

function appendCompareMark(marks = [], changeType) {
  const nextMarks = (marks || []).filter(mark => mark.type !== 'compareMark');
  if (!isAllowedChangeType(changeType)) {
    return nextMarks;
  }
  nextMarks.push({
    type: 'compareMark',
    attrs: { changeType }
  });
  return nextMarks;
}

function splitTextNode(node, from, to, changeType) {
  const text = node.text || '';
  const segments = [];
  if (from > 0) {
    segments.push({
      ...node,
      text: text.slice(0, from)
    });
  }
  if (to > from) {
    segments.push({
      ...node,
      text: text.slice(from, to),
      marks: appendCompareMark(node.marks, changeType)
    });
  }
  if (to < text.length) {
    segments.push({
      ...node,
      text: text.slice(to)
    });
  }
  return segments.filter(item => item.text);
}

export function markTextRange(node = {}, start = 0, end = 0, changeType = 'update') {
  if (!node || start >= end || !isAllowedChangeType(changeType)) {
    return node;
  }
  let offset = 0;

  function walk(currentNode = {}) {
    if (currentNode.type === 'text') {
      const textLength = (currentNode.text || '').length;
      const nodeStart = offset;
      const nodeEnd = offset + textLength;
      offset = nodeEnd;
      if (end <= nodeStart || start >= nodeEnd) {
        return currentNode;
      }
      return splitTextNode(
        currentNode,
        Math.max(start - nodeStart, 0),
        Math.min(end - nodeStart, textLength),
        changeType
      );
    }
    if (!Array.isArray(currentNode.content)) {
      return currentNode;
    }
    const content = currentNode.content.flatMap(child => {
      const nextChild = walk(child);
      return Array.isArray(nextChild) ? nextChild : [nextChild];
    });
    return {
      ...currentNode,
      content
    };
  }

  return walk(node);
}

export function markAllText(node = {}, changeType = 'update') {
  return markTextRange(node, 0, getNodeText(node).length, changeType);
}

export function getChangedTextRanges(oldText = '', newText = '') {
  if (oldText === newText) {
    return {
      oldRange: null,
      newRange: null
    };
  }
  let prefixLength = 0;
  const minLength = Math.min(oldText.length, newText.length);
  while (prefixLength < minLength && oldText[prefixLength] === newText[prefixLength]) {
    prefixLength += 1;
  }

  let suffixLength = 0;
  while (
    suffixLength < minLength - prefixLength &&
    oldText[oldText.length - suffixLength - 1] === newText[newText.length - suffixLength - 1]
  ) {
    suffixLength += 1;
  }

  const oldEnd = oldText.length - suffixLength;
  const newEnd = newText.length - suffixLength;
  return {
    oldRange: oldEnd > prefixLength ? [prefixLength, oldEnd] : null,
    newRange: newEnd > prefixLength ? [prefixLength, newEnd] : null
  };
}
