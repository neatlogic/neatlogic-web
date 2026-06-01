import { getKnowledgeDocumentIdFromHref, getKnowledgeLinkType } from './link-utils.js';

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

export function findCalloutNode($pos) {
  for (let d = $pos.depth; d > 0; d--) {
    const node = $pos.node(d);
    if (node.type.name === 'callout') {
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
    const itemNode = $pos.node(d);
    
    if (itemNode.type.name === 'listItem' || itemNode.type.name === 'taskItem') {
      const listNode = $pos.node(d - 1);
      return {
        // 父级信息
        type: listNode.type.name,

        // 子级信息
        node: itemNode,
        attrs: { ...(itemNode.attrs || {}) },
        depth: d,
        pos: $pos.start(d)
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
  isEmpty: '节点的内容是否为空', // 用于判断是否显示编辑按钮还是插入按钮
  pos: '节点的位置',
  node: '节点'
 }
*/
export function getHoverTargetByEvent({ state, $pos}) {
  // 处理原子节点（image、video）
  const atomNode = state.doc.nodeAt($pos.pos);
  const atomNodeList = ['image', 'video', 'file', 'horizontalRule', 'divider'];
  const { attrs: atomAttrs = {} } = atomNode || {};
  const atomNodeName = atomNode?.type?.name;
  if (atomNodeName && atomNodeList.includes(atomNodeName)) {
    return {
      type: atomNodeName,
      attrs: { ...atomAttrs },
      node: atomNode,
      pos: $pos.pos,
      isEmpty: false
    };
  }

  // table
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

  // list
  const { type, node, attrs = {}, pos } = findListNode($pos) || {};
  if (type) {
    return {
      type: type,
      attrs: attrs,
      isEmpty: isNodeEmptyByType(node),
      node: node,
      pos: pos
    };
  }

  // callout
  const callout = findCalloutNode($pos);
  if (callout) {
    return {
      type: 'callout',
      attrs: {...callout.node.attrs },
      isEmpty: isNodeEmptyByType(callout.node),
      node: callout.node,
      pos: callout.pos
    };
  }

  // block
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
    case 'file':
    case 'horizontalRule':
    case 'video':
    case 'table':
    case 'callout':
    case 'divider':
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
export function getTableRowHeights(tableOrWrapperEl) {
  if (!tableOrWrapperEl) return [];

  const tableEl =
    tableOrWrapperEl.tagName === 'TABLE'
      ? tableOrWrapperEl
      : tableOrWrapperEl.querySelector('table');

  if (!tableEl) return [];

  const rows = tableEl.querySelectorAll('tr');

  return Array.from(rows).map(tr => tr.offsetHeight);
}

/* 
 * 获取段落中的链接信息 
 * return {
    text: '链接文本',
    href: '链接地址',
    target: '_blank' // 可选，默认为 '_self'
  }
*/
export function getLinksInfoFromParagraph(paragraphNode, paragraphPos = 0, hoverPos = null) {
  let links = {};
  const { content = {} } = paragraphNode || {};
  const contentList = content.content || [];

  contentList.forEach((child, index) => {
    if (!child.isText || !child.marks?.length) return;

    const linkMark = child.marks.find((mark) => mark.type.name === 'link');
    if (linkMark) {
      const startPosition = paragraphPos + 1 + contentList.slice(0, index).reduce((sum, item) => sum + item.nodeSize, 0);
      const endPosition = startPosition + child.nodeSize;
      if (hoverPos != null && (hoverPos < startPosition || hoverPos >= endPosition)) {
        return;
      }
      const { href = '', target = '', class: className = '' } = linkMark.attrs || {};
      const linkType = getKnowledgeLinkType(href, className);
      links = {
        type: 'link',
        text: child.text,
        href,
        target,
        class: className,
        linkType,
        knowledgeDocumentId: getKnowledgeDocumentIdFromHref(href),
        startPosition,
        endPosition
      };
    }
  });
  return links;
}
