import {
  getChangedTextRanges,
  getNodeText,
  markAllText,
  markTextRange
} from './text-diff.js';

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function getBlockUuid(block = {}) {
  return block.attrs && block.attrs.blockUuid;
}

function removeTemporaryCompareData(value) {
  if (Array.isArray(value)) {
    return value.map(item => removeTemporaryCompareData(item));
  }
  if (!value || typeof value !== 'object') {
    return value;
  }
  const nextValue = {};
  Object.keys(value).forEach(key => {
    if (key === 'compareChangeType') {
      return;
    }
    if (key === 'marks') {
      nextValue[key] = (value[key] || []).filter(mark => mark.type !== 'compareMark');
      return;
    }
    nextValue[key] = removeTemporaryCompareData(value[key]);
  });
  return nextValue;
}

function isDefaultAttr(key, value) {
  if (value === null || value === undefined || value === '') {
    return true;
  }
  if (key === 'align' && value === 'left') {
    return true;
  }
  if (key === 'textAlign' && value === 'left') {
    return true;
  }
  if (key === 'verticalAlign' && value === 'top') {
    return true;
  }
  if ((key === 'colspan' || key === 'rowspan' || key === 'start') && value === 1) {
    return true;
  }
  if (key === 'uploading' && value === false) {
    return true;
  }
  if (key === 'controls' && value === true) {
    return true;
  }
  if (key === 'language' && value === 'text') {
    return true;
  }
  return false;
}

function isLegacyRenderAttr(key) {
  return [
    'className',
    'codeMode',
    'value',
    'url',
    'row',
    'col',
    'headerList',
    'lefterList',
    'tableList',
    'tableStyle'
  ].includes(key);
}

function isMediaBlock(block = {}) {
  return block.type === 'image' || block.type === 'video' || block.type === 'file';
}

function isCallout(block = {}) {
  return block.type === 'callout';
}

function isMediaDisplayAttr(key) {
  return key === 'width' || key === 'height' || key === 'align' || key === 'aspectRatio';
}

function normalizeCompareData(value, parentKey = '', options = {}) {
  if (Array.isArray(value)) {
    const nextValue = value.map(item => normalizeCompareData(item, parentKey, options)).filter(item => {
      return item !== undefined && !(Array.isArray(item) && item.length === 0);
    });
    if (parentKey === 'marks') {
      return nextValue.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    }
    return nextValue;
  }
  if (!value || typeof value !== 'object') {
    return value;
  }
  const nextValue = {};
  Object.keys(value).sort().forEach(key => {
    if (key === 'blockUuid' || key === 'blockType') {
      return;
    }
    if (parentKey === 'attrs' && isLegacyRenderAttr(key)) {
      return;
    }
    if (options.ignoreMediaDisplayAttrs && parentKey === 'attrs' && isMediaDisplayAttr(key)) {
      return;
    }
    const nextItem = normalizeCompareData(value[key], key, options);
    if (key === 'attrs' && (!nextItem || Object.keys(nextItem).length === 0)) {
      return;
    }
    if (key === 'marks' && (!nextItem || nextItem.length === 0)) {
      return;
    }
    if (key === 'content' && (!nextItem || nextItem.length === 0)) {
      return;
    }
    if (parentKey === 'attrs' && isDefaultAttr(key, nextItem)) {
      return;
    }
    nextValue[key] = nextItem;
  });
  return Object.keys(nextValue).length ? nextValue : undefined;
}

function serializeBlock(block = {}, options = {}) {
  const normalizeOptions = {
    ...options,
    ignoreMediaDisplayAttrs: options.ignoreMediaDisplayAttrs && isMediaBlock(block)
  };
  return JSON.stringify(normalizeCompareData(removeTemporaryCompareData(block), '', normalizeOptions) || {});
}

function getMediaBlockIdentity(block = {}) {
  const attrs = block.attrs || {};
  if (block.type === 'image') {
    const src = attrs.src || attrs.url || attrs.value;
    return src ? `image:${src}` : '';
  }
  if (block.type === 'video') {
    const src = attrs.src || attrs.recordUuid || attrs.value;
    return src ? `video:${src}` : '';
  }
  if (block.type === 'file') {
    return attrs.url ? `file:${attrs.url}` : '';
  }
  return '';
}

function normalizeText(text = '') {
  return String(text || '').replace(/\s+/g, '');
}

function getTextBlockIdentity(block = {}) {
  const text = normalizeText(getNodeText(block));
  return text ? `${block.type}:${text}` : '';
}

function isSameBlock(oldBlock, newBlock) {
  return serializeBlock(oldBlock) === serializeBlock(newBlock);
}

function isSameWithoutMediaDisplayAttrs(oldBlock, newBlock) {
  return serializeBlock(oldBlock, { ignoreMediaDisplayAttrs: true }) === serializeBlock(newBlock, { ignoreMediaDisplayAttrs: true });
}

function isSameCalloutText(oldBlock = {}, newBlock = {}) {
  return isCallout(oldBlock) &&
    isCallout(newBlock) &&
    normalizeText(getNodeText(oldBlock)) === normalizeText(getNodeText(newBlock));
}

function isSameVisibleTextBlock(oldBlock = {}, newBlock = {}) {
  if (oldBlock.type !== newBlock.type || isMediaBlock(oldBlock)) {
    return false;
  }
  const oldText = normalizeText(getNodeText(oldBlock));
  const newText = normalizeText(getNodeText(newBlock));
  return !!oldText && oldText === newText;
}

function getCommonSubsequenceLength(oldText = '', newText = '') {
  const oldLength = oldText.length;
  const newLength = newText.length;
  const dp = Array.from({ length: oldLength + 1 }).map(() => Array(newLength + 1).fill(0));
  for (let i = oldLength - 1; i >= 0; i--) {
    for (let j = newLength - 1; j >= 0; j--) {
      dp[i][j] = oldText[i] === newText[j]
        ? dp[i + 1][j + 1] + 1
        : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  return dp[0][0];
}

function getTextSimilarity(oldText = '', newText = '') {
  const oldValue = normalizeText(oldText);
  const newValue = normalizeText(newText);
  const maxLength = Math.max(oldValue.length, newValue.length);
  if (!maxLength) {
    return 1;
  }
  if (oldValue === newValue) {
    return 1;
  }
  return getCommonSubsequenceLength(oldValue, newValue) / maxLength;
}

function getBlockMatchScore(oldBlock = {}, newBlock = {}) {
  if (oldBlock.type !== newBlock.type) {
    return 0;
  }
  if (isSameBlock(oldBlock, newBlock)) {
    return 100;
  }

  const oldMediaIdentity = getMediaBlockIdentity(oldBlock);
  const newMediaIdentity = getMediaBlockIdentity(newBlock);
  if (oldMediaIdentity || newMediaIdentity) {
    return oldMediaIdentity && oldMediaIdentity === newMediaIdentity ? 95 : 0;
  }

  const similarity = getTextSimilarity(getNodeText(oldBlock), getNodeText(newBlock));
  if (similarity === 1) {
    return 85;
  }
  if (similarity >= 0.5) {
    return Math.round(similarity * 80);
  }
  return 0;
}

function withCompareChangeType(block = {}, compareChangeType) {
  return {
    ...block,
    attrs: {
      ...(block.attrs || {}),
      compareChangeType
    }
  };
}

function isCodeBlock(block = {}) {
  return block.type === 'codeBlock';
}

function isTableBlock(block = {}) {
  return block.type === 'table';
}

function getBlockTextContent(block = {}) {
  if (block.content?.length === 1 && block.content[0].type === 'text') {
    return block.content[0].text || '';
  }
  return getNodeText(block);
}

function createCodeBlockSegment(block = {}, text = '', compareChangeType = null, index = 0) {
  const attrs = { ...(block.attrs || {}) };
  if (attrs.blockUuid) {
    attrs.blockUuid = `${attrs.blockUuid}_compare_${index}`;
  }
  if (compareChangeType) {
    attrs.compareChangeType = compareChangeType;
  } else {
    delete attrs.compareChangeType;
  }
  return {
    ...block,
    attrs,
    content: text ? [{ type: 'text', text }] : []
  };
}

function splitCodeBlockByRange(block = {}, range = null, changeType = 'update') {
  if (!range) {
    return [block];
  }
  const text = getBlockTextContent(block);
  const changedText = text.slice(range[0], range[1]);
  const segments = [
    { text: text.slice(0, range[0]), changeType: null },
    { text: changedText.replace(/^\n/, '').replace(/\n$/, ''), changeType },
    { text: text.slice(range[1]), changeType: null }
  ].filter(segment => segment.text);
  return segments.map((segment, index) => createCodeBlockSegment(block, segment.text, segment.changeType, index));
}

function getTableCellList(row = {}) {
  return row.content || [];
}

function hasSameTableShape(oldTable = {}, newTable = {}) {
  const oldRows = oldTable.content || [];
  const newRows = newTable.content || [];
  return oldRows.length === newRows.length && oldRows.every((oldRow, rowIndex) => {
    return getTableCellList(oldRow).length === getTableCellList(newRows[rowIndex]).length;
  });
}

function omitContent(node = {}) {
  const { content, ...restNode } = node;
  return restNode;
}

function isSameComparableNode(oldNode = {}, newNode = {}) {
  return serializeBlock(oldNode) === serializeBlock(newNode);
}

function isSameComparableNodeWithoutContent(oldNode = {}, newNode = {}) {
  return isSameComparableNode(omitContent(oldNode), omitContent(newNode));
}

function isSameComparableContent(oldNode = {}, newNode = {}) {
  return serializeBlock({
    type: 'content',
    content: oldNode.content || []
  }) === serializeBlock({
    type: 'content',
    content: newNode.content || []
  });
}

function parseStyle(style = '') {
  return String(style || '').split(';').reduce((map, item) => {
    const [name, ...valueList] = item.split(':');
    const key = String(name || '').trim().toLowerCase();
    const value = valueList.join(':').trim();
    if (key && value) {
      map[key] = value.replace(/\s+/g, ' ');
    }
    return map;
  }, {});
}

function serializeStyleMap(styleMap = {}) {
  return Object.keys(styleMap).sort().map(key => `${key}:${styleMap[key]}`).join(';');
}

function getAllTableCells(table = {}) {
  return (table.content || []).flatMap(row => getTableCellList(row));
}

function getCommonCellStyleMap(table = {}) {
  const styleMapList = getAllTableCells(table).map(cell => parseStyle(cell.attrs?.cellStyle));
  if (!styleMapList.length) {
    return {};
  }
  return Object.keys(styleMapList[0]).reduce((commonMap, key) => {
    const value = styleMapList[0][key];
    if (styleMapList.every(styleMap => styleMap[key] === value)) {
      commonMap[key] = value;
    }
    return commonMap;
  }, {});
}

function removeCommonStyle(style = '', commonStyleMap = {}) {
  const styleMap = parseStyle(style);
  Object.keys(commonStyleMap).forEach(key => {
    if (styleMap[key] === commonStyleMap[key]) {
      delete styleMap[key];
    }
  });
  return serializeStyleMap(styleMap);
}

function normalizeTableCellForCompare(cell = {}, commonStyleMap = {}) {
  const nextCell = cloneData(cell);
  const attrs = { ...(nextCell.attrs || {}) };
  attrs.cellStyle = removeCommonStyle(attrs.cellStyle, commonStyleMap) || null;
  delete attrs.colwidth;
  nextCell.attrs = attrs;
  return nextCell;
}

function markChangedCellText(oldCell = {}, newCell = {}) {
  const oldText = getNodeText(oldCell);
  const newText = getNodeText(newCell);
  const { oldRange, newRange } = getChangedTextRanges(oldText, newText);
  return {
    oldCell: oldRange ? markTextRange(oldCell, oldRange[0], oldRange[1], newRange ? 'update' : 'delete') : oldCell,
    newCell: newRange ? markTextRange(newCell, newRange[0], newRange[1], oldRange ? 'update' : 'insert') : newCell
  };
}

function markUpdatedTableCell(oldCell = {}, newCell = {}, oldCommonCellStyleMap = {}, newCommonCellStyleMap = {}) {
  const oldComparableCell = normalizeTableCellForCompare(oldCell, oldCommonCellStyleMap);
  const newComparableCell = normalizeTableCellForCompare(newCell, newCommonCellStyleMap);
  const hasAttrsChange = !isSameComparableNodeWithoutContent(oldComparableCell, newComparableCell);
  const hasSameVisibleText = normalizeText(getNodeText(oldComparableCell)) === normalizeText(getNodeText(newComparableCell));
  const hasContentChange = !hasSameVisibleText && !isSameComparableContent(oldComparableCell, newComparableCell);

  if (!hasAttrsChange && !hasContentChange) {
    return {
      hasChange: false,
      oldCell,
      newCell
    };
  }

  const nextOldCell = cloneData(oldCell);
  const nextNewCell = cloneData(newCell);

  if (hasContentChange) {
    const { oldBlocks, newBlocks } = compareBlockList(oldCell.content || [], newCell.content || []);
    nextOldCell.content = oldBlocks;
    nextNewCell.content = newBlocks;
  }

  if (!hasContentChange && getNodeText(oldCell) !== getNodeText(newCell)) {
    const changedCells = markChangedCellText(nextOldCell, nextNewCell);
    nextOldCell.content = changedCells.oldCell.content;
    nextNewCell.content = changedCells.newCell.content;
  }

  return {
    hasChange: true,
    oldCell: hasAttrsChange ? withCompareChangeType(nextOldCell, 'update') : nextOldCell,
    newCell: hasAttrsChange ? withCompareChangeType(nextNewCell, 'update') : nextNewCell
  };
}

function markUpdatedTableCells(oldTable = {}, newTable = {}) {
  if (!hasSameTableShape(oldTable, newTable)) {
    return null;
  }
  let hasChange = false;
  const nextOldTable = cloneData(oldTable);
  const nextNewTable = cloneData(newTable);
  const oldCommonCellStyleMap = getCommonCellStyleMap(oldTable);
  const newCommonCellStyleMap = getCommonCellStyleMap(newTable);
  const cellChangeMap = (oldTable.content || []).map((oldRow, rowIndex) => {
    const newRow = newTable.content[rowIndex];
    return getTableCellList(oldRow).map((oldCell, cellIndex) => {
      const newCell = getTableCellList(newRow)[cellIndex];
      return markUpdatedTableCell(oldCell, newCell, oldCommonCellStyleMap, newCommonCellStyleMap);
    });
  });

  nextOldTable.content = (oldTable.content || []).map((oldRow, rowIndex) => {
    return {
      ...oldRow,
      content: getTableCellList(oldRow).map((oldCell, cellIndex) => {
        const cellChange = cellChangeMap[rowIndex][cellIndex];
        if (!cellChange.hasChange) {
          return oldCell;
        }
        hasChange = true;
        return cellChange.oldCell;
      })
    };
  });

  nextNewTable.content = (newTable.content || []).map((newRow, rowIndex) => {
    return {
      ...newRow,
      content: getTableCellList(newRow).map((newCell, cellIndex) => {
        const cellChange = cellChangeMap[rowIndex][cellIndex];
        if (!cellChange.hasChange) {
          return newCell;
        }
        return cellChange.newCell;
      })
    };
  });

  return hasChange
    ? {
      oldBlocks: [nextOldTable],
      newBlocks: [nextNewTable]
    }
    : null;
}

function markChangedTableRow(row = {}, changeType = 'update') {
  return withCompareChangeType(markAllText(cloneData(row), changeType), changeType);
}

function hasSameRowShape(oldRow = {}, newRow = {}) {
  return getTableCellList(oldRow).length === getTableCellList(newRow).length;
}

function markUpdatedTableRow(oldRow = {}, newRow = {}, oldCommonCellStyleMap = {}, newCommonCellStyleMap = {}) {
  if (!hasSameRowShape(oldRow, newRow)) {
    return {
      oldRow: withCompareChangeType(markTextRange(cloneData(oldRow), 0, getNodeText(oldRow).length, 'update'), 'update'),
      newRow: withCompareChangeType(markTextRange(cloneData(newRow), 0, getNodeText(newRow).length, 'update'), 'update')
    };
  }

  let hasChange = false;
  const cellChangeList = getTableCellList(oldRow).map((oldCell, cellIndex) => {
    const newCell = getTableCellList(newRow)[cellIndex];
    const cellChange = markUpdatedTableCell(oldCell, newCell, oldCommonCellStyleMap, newCommonCellStyleMap);
    hasChange = hasChange || cellChange.hasChange;
    return cellChange;
  });

  if (!hasChange) {
    return {
      oldRow: cloneData(oldRow),
      newRow: cloneData(newRow)
    };
  }

  return {
    oldRow: {
      ...oldRow,
      content: cellChangeList.map((cellChange, index) => {
        return cellChange.hasChange ? cellChange.oldCell : getTableCellList(oldRow)[index];
      })
    },
    newRow: {
      ...newRow,
      content: cellChangeList.map((cellChange, index) => {
        return cellChange.hasChange ? cellChange.newCell : getTableCellList(newRow)[index];
      })
    }
  };
}

function pushUnpairedTableRows(result, oldRows, newRows, oldStart, oldEnd, newStart, newEnd) {
  for (let index = oldStart; index < oldEnd; index++) {
    result.oldRows.push(markChangedTableRow(oldRows[index], 'delete'));
  }
  for (let index = newStart; index < newEnd; index++) {
    result.newRows.push(markChangedTableRow(newRows[index], 'insert'));
  }
}

function markUpdatedTableRows(oldTable = {}, newTable = {}) {
  const oldRows = oldTable.content || [];
  const newRows = newTable.content || [];
  const rowPairs = getFuzzyPairs(oldRows, newRows);

  if (!rowPairs.length) {
    return null;
  }

  const oldCommonCellStyleMap = getCommonCellStyleMap(oldTable);
  const newCommonCellStyleMap = getCommonCellStyleMap(newTable);
  const result = {
    oldRows: [],
    newRows: []
  };
  let oldCursor = 0;
  let newCursor = 0;

  rowPairs.forEach(pair => {
    pushUnpairedTableRows(result, oldRows, newRows, oldCursor, pair.oldIndex, newCursor, pair.newIndex);
    const { oldRow, newRow } = markUpdatedTableRow(
      oldRows[pair.oldIndex],
      newRows[pair.newIndex],
      oldCommonCellStyleMap,
      newCommonCellStyleMap
    );
    result.oldRows.push(oldRow);
    result.newRows.push(newRow);
    oldCursor = pair.oldIndex + 1;
    newCursor = pair.newIndex + 1;
  });

  pushUnpairedTableRows(result, oldRows, newRows, oldCursor, oldRows.length, newCursor, newRows.length);

  return {
    oldBlocks: [{
      ...oldTable,
      content: result.oldRows
    }],
    newBlocks: [{
      ...newTable,
      content: result.newRows
    }]
  };
}

function markUpdatedBlocks(oldBlock = {}, newBlock = {}) {
  if (isTableBlock(oldBlock) && isTableBlock(newBlock)) {
    const updatedTable = markUpdatedTableCells(oldBlock, newBlock);
    if (updatedTable) {
      return updatedTable;
    }
    const updatedTableRows = markUpdatedTableRows(oldBlock, newBlock);
    if (updatedTableRows) {
      return updatedTableRows;
    }
  }
  const oldText = getNodeText(oldBlock);
  const newText = getNodeText(newBlock);
  const { oldRange, newRange } = getChangedTextRanges(oldText, newText);
  const oldChangeType = newRange ? 'update' : 'delete';
  const newChangeType = oldRange ? 'update' : 'insert';
  const nextOldBlocks = oldRange
    ? isCodeBlock(oldBlock)
      ? splitCodeBlockByRange(oldBlock, oldRange, oldChangeType)
      : [withCompareChangeType(markTextRange(oldBlock, oldRange[0], oldRange[1], oldChangeType), 'update')]
    : [oldBlock];
  const nextNewBlocks = newRange
    ? isCodeBlock(newBlock)
      ? splitCodeBlockByRange(newBlock, newRange, newChangeType)
      : [withCompareChangeType(markTextRange(newBlock, newRange[0], newRange[1], newChangeType), 'update')]
    : [newBlock];
  if (!oldRange && !newRange) {
    return {
      oldBlocks: [withCompareChangeType(oldBlock, 'update')],
      newBlocks: [withCompareChangeType(newBlock, 'update')]
    };
  }
  return {
    oldBlocks: nextOldBlocks,
    newBlocks: nextNewBlocks
  };
}

function createUuidMap(blockList = []) {
  return blockList.reduce((map, block, index) => {
    const uuid = getBlockUuid(block);
    if (uuid) {
      map[uuid] = { block, index };
    }
    return map;
  }, {});
}

function getBlockKey(block = {}, oppositeUuidMap = {}) {
  const uuid = getBlockUuid(block);
  if (uuid && oppositeUuidMap[uuid]) {
    return `uuid:${uuid}`;
  }
  const mediaIdentity = getMediaBlockIdentity(block);
  if (mediaIdentity) {
    return `media:${mediaIdentity}`;
  }
  const textIdentity = getTextBlockIdentity(block);
  if (textIdentity) {
    return `text:${textIdentity}`;
  }
  return `signature:${serializeBlock(block)}`;
}

function getLcsPairs(oldKeys = [], newKeys = []) {
  const oldLength = oldKeys.length;
  const newLength = newKeys.length;
  const dp = Array.from({ length: oldLength + 1 }).map(() => Array(newLength + 1).fill(0));
  for (let i = oldLength - 1; i >= 0; i--) {
    for (let j = newLength - 1; j >= 0; j--) {
      dp[i][j] = oldKeys[i] === newKeys[j]
        ? dp[i + 1][j + 1] + 1
        : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const pairs = [];
  let oldIndex = 0;
  let newIndex = 0;
  while (oldIndex < oldLength && newIndex < newLength) {
    if (oldKeys[oldIndex] === newKeys[newIndex]) {
      pairs.push({ oldIndex, newIndex });
      oldIndex += 1;
      newIndex += 1;
    } else if (dp[oldIndex + 1][newIndex] >= dp[oldIndex][newIndex + 1]) {
      oldIndex += 1;
    } else {
      newIndex += 1;
    }
  }
  return pairs;
}

function pushComparedPair(result, oldBlock, newBlock) {
  if (isSameBlock(oldBlock, newBlock) || isSameCalloutText(oldBlock, newBlock)) {
    result.oldBlocks.push(cloneData(oldBlock));
    result.newBlocks.push(cloneData(newBlock));
    return;
  }
  const comparedBlocks = markUpdatedBlocks(cloneData(oldBlock), cloneData(newBlock));
  result.oldBlocks.push(...comparedBlocks.oldBlocks);
  result.newBlocks.push(...comparedBlocks.newBlocks);
}

function pushDeletedBlock(result, block) {
  result.oldBlocks.push(withCompareChangeType(markAllText(cloneData(block), 'delete'), 'delete'));
}

function pushInsertedBlock(result, block) {
  result.newBlocks.push(withCompareChangeType(markAllText(cloneData(block), 'insert'), 'insert'));
}

function pushUnpairedBlocks(result, oldBlockList, newBlockList, oldStart, oldEnd, newStart, newEnd) {
  for (let index = oldStart; index < oldEnd; index++) {
    pushDeletedBlock(result, oldBlockList[index]);
  }
  for (let index = newStart; index < newEnd; index++) {
    pushInsertedBlock(result, newBlockList[index]);
  }
}

function getFuzzyPairs(oldBlockList = [], newBlockList = []) {
  const oldLength = oldBlockList.length;
  const newLength = newBlockList.length;
  const dp = Array.from({ length: oldLength + 1 }).map(() => Array(newLength + 1).fill(0));
  const action = Array.from({ length: oldLength }).map(() => Array(newLength).fill('skipOld'));

  for (let i = oldLength - 1; i >= 0; i--) {
    for (let j = newLength - 1; j >= 0; j--) {
      const pairScore = getBlockMatchScore(oldBlockList[i], newBlockList[j]);
      const pairValue = pairScore ? pairScore + dp[i + 1][j + 1] : -1;
      const skipOldValue = dp[i + 1][j];
      const skipNewValue = dp[i][j + 1];
      const bestValue = Math.max(pairValue, skipOldValue, skipNewValue);
      dp[i][j] = bestValue;
      action[i][j] = bestValue === pairValue
        ? 'pair'
        : skipOldValue >= skipNewValue
          ? 'skipOld'
          : 'skipNew';
    }
  }

  const pairs = [];
  let oldIndex = 0;
  let newIndex = 0;
  while (oldIndex < oldLength && newIndex < newLength) {
    if (action[oldIndex][newIndex] === 'pair') {
      pairs.push({ oldIndex, newIndex });
      oldIndex += 1;
      newIndex += 1;
    } else if (action[oldIndex][newIndex] === 'skipOld') {
      oldIndex += 1;
    } else {
      newIndex += 1;
    }
  }
  return pairs;
}

function flushUnmatchedBlocks(result, oldBlockList, newBlockList, oldStart, oldEnd, newStart, newEnd) {
  const oldChunk = oldBlockList.slice(oldStart, oldEnd);
  const newChunk = newBlockList.slice(newStart, newEnd);
  const fuzzyPairs = getFuzzyPairs(oldChunk, newChunk);

  if (!fuzzyPairs.length) {
    pushUnpairedBlocks(result, oldBlockList, newBlockList, oldStart, oldEnd, newStart, newEnd);
    return;
  }

  let oldCursor = oldStart;
  let newCursor = newStart;
  fuzzyPairs.forEach(pair => {
    const oldIndex = oldStart + pair.oldIndex;
    const newIndex = newStart + pair.newIndex;
    pushUnpairedBlocks(result, oldBlockList, newBlockList, oldCursor, oldIndex, newCursor, newIndex);
    pushComparedPair(result, oldBlockList[oldIndex], newBlockList[newIndex]);
    oldCursor = oldIndex + 1;
    newCursor = newIndex + 1;
  });
  pushUnpairedBlocks(result, oldBlockList, newBlockList, oldCursor, oldEnd, newCursor, newEnd);
}

function canCompareByMediaDisplayOnly(oldBlockList = [], newBlockList = []) {
  return oldBlockList.length === newBlockList.length && oldBlockList.every((oldBlock, index) => {
    const newBlock = newBlockList[index];
    return newBlock && isSameWithoutMediaDisplayAttrs(oldBlock, newBlock);
  });
}

function compareByMediaDisplayOnly(oldBlockList = [], newBlockList = []) {
  return oldBlockList.reduce((result, oldBlock, index) => {
    const newBlock = newBlockList[index];
    if (isSameBlock(oldBlock, newBlock) || isSameCalloutText(oldBlock, newBlock) || isSameVisibleTextBlock(oldBlock, newBlock)) {
      result.oldBlocks.push(cloneData(oldBlock));
      result.newBlocks.push(cloneData(newBlock));
    } else if (isMediaBlock(oldBlock) && isMediaBlock(newBlock)) {
      result.oldBlocks.push(withCompareChangeType(cloneData(oldBlock), 'update'));
      result.newBlocks.push(withCompareChangeType(cloneData(newBlock), 'update'));
    } else {
      result.oldBlocks.push(cloneData(oldBlock));
      result.newBlocks.push(cloneData(newBlock));
    }
    return result;
  }, {
    oldBlocks: [],
    newBlocks: []
  });
}

export function compareBlockList(oldBlockList = [], newBlockList = []) {
  if (canCompareByMediaDisplayOnly(oldBlockList, newBlockList)) {
    return compareByMediaDisplayOnly(oldBlockList, newBlockList);
  }

  const result = {
    oldBlocks: [],
    newBlocks: []
  };
  const oldUuidMap = createUuidMap(oldBlockList);
  const newUuidMap = createUuidMap(newBlockList);
  const oldKeys = oldBlockList.map(block => getBlockKey(block, newUuidMap));
  const newKeys = newBlockList.map(block => getBlockKey(block, oldUuidMap));
  const pairs = getLcsPairs(oldKeys, newKeys);
  let oldCursor = 0;
  let newCursor = 0;

  pairs.forEach(pair => {
    flushUnmatchedBlocks(result, oldBlockList, newBlockList, oldCursor, pair.oldIndex, newCursor, pair.newIndex);
    pushComparedPair(result, oldBlockList[pair.oldIndex], newBlockList[pair.newIndex]);
    oldCursor = pair.oldIndex + 1;
    newCursor = pair.newIndex + 1;
  });

  flushUnmatchedBlocks(result, oldBlockList, newBlockList, oldCursor, oldBlockList.length, newCursor, newBlockList.length);

  return result;
}
