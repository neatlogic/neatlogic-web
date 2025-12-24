/* 
 获取表格节点
 @param {position} 坐标
 @return {Object}
*/
export function findTableNode($pos) {
  for (let d = $pos.depth; d > 0; d--) {
    const node = $pos.node(d);
    if (node.type.name === 'table') {
      return {
        node,
        depth: d,
        pos: $pos.before(d)
      };
    }
  }
  return null;
}

/*
获取有序、无序、任务列表的节点
@param {position} 坐标
@return {Object}
*/

export function findListNode($pos) {
  for (let d = $pos.depth; d > 1; d--) {
    const node = $pos.node(d);
    if (node.type.name === 'listItem' || node.type.name === 'taskItem') {
      const listNode = $pos.node(d - 1);
      return {
        node: listNode,
        depth: d - 1,
        pos: $pos.before(d - 1)
      };
    }
  }
  return null;
}

/*
获取block(paragraph、heading等)节点
@param {position} 坐标
@return {Object}
*/
export function findBlockNode($pos) {
  for (let d = $pos.depth; d > 0; d--) {
    const node = $pos.node(d);
    if (node.isBlock) {
      return {
        node,
        depth: d,
        pos: $pos.before(d)
      };
    }
  }
  return null;
}

/*
 获取节点
 @param {position} 坐标
 @return {
  type: '节点的名称，
  attrs: '节点的属性',
  isEmpty: '节点的内容是否为空',
  node: '节点'
 }
*/
export function getNodeByPos($pos) {
  // 1. table
  const table = findTableNode($pos);
  if (table) {
    return {
      type: 'table',
      attrs: { ...table.node.attrs },
      isEmpty: isNodeEmptyByType(table.node),
      node: table.node,
      pos: table.pos
    };
  }

  // 2. list
  const list = findListNode($pos);
  if (list) {
    return {
      type: list.node.type.name,
      attrs: { ...list.node.attrs },
      isEmpty: isNodeEmptyByType(list.node),
      node: list.node,
      pos: list.pos
    };
  }

  // 3. block
  const block = findBlockNode($pos);
  if (block) {
    return {
      type: block.node.type.name,
      attrs: { ...block.node.attrs },
      isEmpty: isNodeEmptyByType(block.node),
      node: block.node,
      pos: block.pos
    };
  }

  return null;
}

/* 
 判断节点是否为空
 @param {node} 节点
 @return {boolean}
 作用就是鼠标经过当前节点的时候，是显示编辑还是显示插入按钮
*/
export function isNodeEmptyByType(node) {
  if (!node) return false;

  const type = node.type.name;

  switch (type) {
    case 'paragraph':
    case 'heading':
    case 'blockquote':
    case 'codeBlock':
      return isTextBlockEmpty(node);

    case 'bulletList':
    case 'orderedList':
    case 'taskList':
      return isListEmpty(node);

    // ❗ 明确声明：这些节点永远不为空
    case 'image':
    case 'horizontalRule':
    case 'video':
    case 'table':
      return false;

    default:
      return false;
  }
}

/*
 判断文本节点是否为空
 @param {node} 节点
 @return {boolean}
*/
function isTextBlockEmpty(node) {
  if (!node || node.content.size === 0) return true;

  if (
    node.childCount === 1 &&
    node.firstChild.isText &&
    node.firstChild.text.trim() === ''
  ) {
    return true;
  }

  return false;
}

/*
 判断列表节点是否为空
 @param {node} 节点
 @return {boolean}
*/
function isListEmpty(listNode) {
  if (!listNode || listNode.childCount === 0) return true;

  return listNode.content.content.every(item => {
    const content = item.content.content;
    return content.every(isTextBlockEmpty);
  });
}

/**
 * 获取表格每一行的高度
 * @param {*} tableEl 
 * @returns [100, 200, 300] // 每一行的高度
 */
export function getTableRowHeights(tableEl) {
  if (!tableEl) return [];
  return Array.from(tableEl.querySelectorAll('tbody > tr')).map(tr => tr.getBoundingClientRect().height);
}

