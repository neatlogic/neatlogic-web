import utils from '@/resources/assets/js/util.js';

export const EMPTY_TIPTAP_DOC = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      attrs: {
        textAlign: null,
        blockUuid: null,
        blockType: 'paragraph'
      }
    }
  ]
};

function getUuid(attrs = {}) {
  return attrs.blockUuid || utils.setUuid();
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function normalizeFileList(payload = {}) {
  if (Array.isArray(payload.fileList)) {
    return payload.fileList;
  }
  return (payload.fileIdList || []).map(id => ({ id }));
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

function markText(text, marks = []) {
  let html = escapeHtml(text);
  marks.forEach(mark => {
    if (mark.type === 'bold') {
      html = `<strong>${html}</strong>`;
    } else if (mark.type === 'italic') {
      html = `<i>${html}</i>`;
    } else if (mark.type === 'strike') {
      html = `<span class="line-through">${html}</span>`;
    } else if (mark.type === 'underline') {
      html = `<u>${html}</u>`;
    } else if (mark.type === 'code') {
      html = `<code>${html}</code>`;
    } else if (mark.type === 'link') {
      html = `<a href="${escapeHtml(mark.attrs?.href)}" target="${escapeHtml(mark.attrs?.target || '_blank')}">${html}</a>`;
    }
  });
  return html;
}

function inlineToHtml(content = []) {
  return content.map(item => {
    if (item.type === 'text') {
      return markText(item.text, item.marks);
    }
    if (item.type === 'hardBreak') {
      return '<br>';
    }
    return escapeHtml(item.text || '');
  }).join('');
}

function nodeText(node = {}) {
  if (node.text) {
    return node.text;
  }
  return (node.content || []).map(child => nodeText(child)).join('');
}

function tableCellToHtml(cell = {}) {
  return (cell.content || []).map(child => {
    if (child.type === 'paragraph' || child.type === 'heading') {
      return inlineToHtml(child.content || []);
    }
    return nodeText(child);
  }).join('<br>');
}

function getDefaultTableStyle() {
  return {
    table: 'table-layout:fixed;border-collapse:collapse;width:100%;text-align:left;border:none;',
    tr: 'height:42px',
    td: 'border-bottom:1px solid #f9f9f9'
  };
}

// 将 Tiptap 表格节点转换为旧知识库 table 配置，保证新编辑器保存后仍能兼容旧详情页渲染。
function tableNodeToConfig(node = {}) {
  const rows = node.content || [];
  const tableList = [];
  let colCount = 0;
  rows.forEach((row, rowIndex) => {
    let colIndex = 0;
    (row.content || []).forEach(cell => {
      const attrs = cell.attrs || {};
      const colspan = attrs.colspan || 1;
      const rowspan = attrs.rowspan || 1;
      tableList.push({
        row: rowIndex,
        col: colIndex,
        rowspan,
        colspan,
        content: tableCellToHtml(cell),
        background: attrs.background || null,
        verticalAlign: attrs.verticalAlign || null,
        isHeader: cell.type === 'tableHeader' ? 1 : 0
      });
      colIndex += colspan;
    });
    colCount = Math.max(colCount, colIndex);
  });
  return {
    row: rows.length,
    col: colCount,
    tableList,
    tableStyle: getDefaultTableStyle()
  };
}

function listToHtml(node = {}) {
  return (node.content || []).map(item => {
    const paragraph = (item.content || []).find(child => child.type === 'paragraph');
    return `<li>${inlineToHtml(paragraph?.content || [])}</li>`;
  }).join('');
}

function createLineItem(handler, node, content, config = {}) {
  return {
    handler,
    uuid: getUuid(node.attrs),
    content,
    config
  };
}

export function tiptapToLineList(doc = EMPTY_TIPTAP_DOC) {
  const lineList = [];
  (doc.content || []).forEach(node => {
    const attrs = node.attrs || {};
    if (node.type === 'heading') {
      const handler = attrs.level === 1 ? 'h1' : attrs.level === 2 ? 'h2' : 'p';
      lineList.push(createLineItem(handler, node, inlineToHtml(node.content || [])));
    } else if (node.type === 'paragraph') {
      lineList.push(createLineItem('p', node, inlineToHtml(node.content || [])));
    } else if (node.type === 'bulletList') {
      lineList.push(createLineItem('ul', node, listToHtml(node), { className: 'disc' }));
    } else if (node.type === 'orderedList') {
      lineList.push(createLineItem('ol', node, listToHtml(node), { className: 'decimal' }));
    } else if (node.type === 'image') {
      lineList.push(createLineItem('img', node, '', {
        url: attrs.src,
        title: attrs.title || '',
        name: attrs.name || '',
        value: attrs.value || '',
        align: attrs.align || 'left',
        width: attrs.width,
        height: attrs.height
      }));
    } else if (node.type === 'codeBlock') {
      lineList.push(createLineItem('code', node, nodeText(node), {
        codeMode: attrs.language || 'text'
      }));
    } else if (node.type === 'table') {
      const handler = attrs.blockType === 'formtable' ? 'formtable' : 'table';
      lineList.push(createLineItem(handler, node, handler === 'formtable' ? { type: 'doc', content: [node] } : '', tableNodeToConfig(node)));
    } else {
      lineList.push(createLineItem('editor', node, inlineToHtml(node.content || []) || nodeText(node), {
        tiptapType: node.type,
        tiptapAttrs: attrs
      }));
    }
  });
  return lineList;
}

function htmlToText(html = '') {
  return String(html).replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '');
}

function appendMark(marks = [], mark) {
  if (!mark) {
    return marks;
  }
  return marks.concat(mark);
}

// 旧知识库的 editor/content/comment 块是 HTML 字符串，这里只保留可安全映射到 Tiptap 的常用行内标记。
function domInlineToTiptapNodes(domNode, marks = []) {
  if (!domNode) {
    return [];
  }
  if (domNode.nodeType === 3) {
    return domNode.nodeValue ? [{ type: 'text', text: domNode.nodeValue, ...(marks.length ? { marks } : {}) }] : [];
  }
  if (domNode.nodeType !== 1) {
    return [];
  }
  const tagName = domNode.tagName.toLowerCase();
  if (tagName === 'br') {
    return [{ type: 'hardBreak' }];
  }
  let nextMarks = marks;
  if (tagName === 'strong' || tagName === 'b') {
    nextMarks = appendMark(nextMarks, { type: 'bold' });
  } else if (tagName === 'em' || tagName === 'i') {
    nextMarks = appendMark(nextMarks, { type: 'italic' });
  } else if (tagName === 'u') {
    nextMarks = appendMark(nextMarks, { type: 'underline' });
  } else if (tagName === 's' || tagName === 'strike' || tagName === 'del') {
    nextMarks = appendMark(nextMarks, { type: 'strike' });
  } else if (tagName === 'code') {
    nextMarks = appendMark(nextMarks, { type: 'code' });
  } else if (tagName === 'a') {
    nextMarks = appendMark(nextMarks, {
      type: 'link',
      attrs: {
        href: domNode.getAttribute('href') || '',
        target: domNode.getAttribute('target') || '_blank'
      }
    });
  }
  return Array.from(domNode.childNodes || []).flatMap(child => domInlineToTiptapNodes(child, nextMarks));
}

// 普通 HTML 表格和工单表单快照都会先归一成 Tiptap table，后续再由统一编辑器承接编辑与保存。
function domTableToTiptapTable(tableDom, attrs = {}) {
  const rows = Array.from(tableDom.querySelectorAll('tr'));
  return {
    type: 'table',
    attrs: {
      textAlign: null,
      blockUuid: attrs.blockUuid || utils.setUuid(),
      blockType: attrs.blockType || 'table'
    },
    content: rows.map(row => ({
      type: 'tableRow',
      attrs: {
        blockUuid: utils.setUuid(),
        blockType: 'tableRow'
      },
      content: Array.from(row.children || []).map(cell => {
        const cellTag = cell.tagName.toLowerCase();
        return {
          type: cellTag === 'th' ? 'tableHeader' : 'tableCell',
          attrs: {
            colspan: cell.colSpan || 1,
            rowspan: cell.rowSpan || 1,
            colwidth: null,
            background: cell.style.backgroundColor || null,
            verticalAlign: cell.style.verticalAlign || 'top'
          },
          content: [{
            type: 'paragraph',
            attrs: {
              textAlign: null,
              blockUuid: utils.setUuid(),
              blockType: 'paragraph'
            },
            content: domInlineToTiptapNodes(cell)
          }]
        };
      })
    }))
  };
}

// 把旧 HTML 块拆成 Tiptap 顶层节点；无法识别的 DOM 默认降级为段落，避免转换失败阻断编辑。
function domBlockToTiptapNode(domNode, attrs = {}) {
  const tagName = domNode.tagName.toLowerCase();
  if (tagName === 'h1' || tagName === 'h2') {
    return {
      type: 'heading',
      attrs: {
        ...attrs,
        level: tagName === 'h1' ? 1 : 2
      },
      content: domInlineToTiptapNodes(domNode)
    };
  }
  if (tagName === 'ul' || tagName === 'ol') {
    return {
      type: tagName === 'ul' ? 'bulletList' : 'orderedList',
      attrs,
      content: Array.from(domNode.children || []).filter(child => child.tagName?.toLowerCase() === 'li').map(li => ({
        type: 'listItem',
        attrs: {
          textAlign: null,
          blockUuid: utils.setUuid(),
          blockType: 'listItem'
        },
        content: [{
          type: 'paragraph',
          attrs: {
            textAlign: null,
            blockUuid: utils.setUuid(),
            blockType: 'paragraph'
          },
          content: domInlineToTiptapNodes(li)
        }]
      }))
    };
  }
  if (tagName === 'pre') {
    return {
      type: 'codeBlock',
      attrs,
      content: [{ type: 'text', text: domNode.textContent || '' }]
    };
  }
  if (tagName === 'table') {
    return domTableToTiptapTable(domNode, attrs);
  }
  if (tagName === 'img') {
    return {
      type: 'image',
      attrs: {
        ...attrs,
        src: domNode.getAttribute('src') || '',
        align: 'left',
        width: domNode.getAttribute('width') || null,
        height: domNode.getAttribute('height') || null
      }
    };
  }
  return {
    type: 'paragraph',
    attrs,
    content: domInlineToTiptapNodes(domNode)
  };
}

// 浏览器环境下尽量结构化解析 HTML；非浏览器环境保留纯文本兜底，方便构建和单测导入。
function htmlToTiptapNodes(html = '', attrs = {}) {
  if (typeof document === 'undefined') {
    return [{
      type: 'paragraph',
      attrs,
      content: textNodeFromHtml(html)
    }];
  }
  const container = document.createElement('div');
  container.innerHTML = String(html || '').replace(/<br\s*\/?>/gi, '<br>');
  const blockElements = Array.from(container.children || []);
  if (blockElements.length === 0) {
    return [{
      type: 'paragraph',
      attrs,
      content: textNodeFromHtml(container.textContent || html)
    }];
  }
  return blockElements.map(element => domBlockToTiptapNode(element, { ...attrs, blockUuid: utils.setUuid() }));
}

function textNodeFromHtml(html = '') {
  const text = htmlToText(html);
  return text ? [{ type: 'text', text }] : [];
}

// 旧知识库普通 table 使用 tableList 描述单元格坐标，这里转换为 Tiptap table JSON。
function tableConfigToTiptapNode(item = {}, attrs = {}) {
  const config = item.config || {};
  const tableList = config.tableList || [];
  const rowCount = config.row || Math.max(...tableList.map(cell => cell.row + 1), 1);
  const colCount = config.col || Math.max(...tableList.map(cell => cell.col + 1), 1);
  const cellMap = {};
  const coveredCellMap = {};
  tableList.forEach(cell => {
    cellMap[`${cell.row}_${cell.col}`] = cell;
    const colspan = cell.colspan || 1;
    const rowspan = cell.rowspan || 1;
    for (let row = 0; row < rowspan; row++) {
      for (let col = 0; col < colspan; col++) {
        if (row || col) {
          coveredCellMap[`${cell.row + row}_${cell.col + col}`] = true;
        }
      }
    }
  });
  return {
    type: 'table',
    attrs: {
      ...attrs,
      blockType: item.handler === 'formtable' ? 'formtable' : 'table'
    },
    content: Array.from({ length: rowCount }).map((row, rowIndex) => ({
      type: 'tableRow',
      attrs: {
        blockUuid: utils.setUuid(),
        blockType: 'tableRow'
      },
      content: Array.from({ length: colCount }).reduce((cellList, col, colIndex) => {
        if (coveredCellMap[`${rowIndex}_${colIndex}`]) {
          return cellList;
        }
        const cell = cellMap[`${rowIndex}_${colIndex}`] || {};
        cellList.push({
          type: cell.isHeader ? 'tableHeader' : 'tableCell',
          attrs: {
            colspan: cell.colspan || 1,
            rowspan: cell.rowspan || 1,
            colwidth: cell.width ? [cell.width] : null,
            background: cell.background || null,
            verticalAlign: cell.verticalAlign || 'top'
          },
          content: [{
            type: 'paragraph',
            attrs: {
              textAlign: null,
              blockUuid: utils.setUuid(),
              blockType: 'paragraph'
            },
            content: textNodeFromHtml(cell.content || '')
          }]
        });
        return cellList;
      }, [])
    }))
  };
}

// lineList 是当前后台保存协议；新组件内部优先使用 Tiptap JSON，因此所有旧块都先经过这里归一。
function lineToTiptapNodes(item = {}) {
  const attrs = {
    textAlign: null,
    blockUuid: item.uuid || utils.setUuid(),
    blockType: item.handler
  };
  if (item.handler === 'h1' || item.handler === 'h2') {
    return [{
      type: 'heading',
      attrs: {
        ...attrs,
        level: item.handler === 'h1' ? 1 : 2
      },
      content: textNodeFromHtml(item.content)
    }];
  }
  if (item.handler === 'img') {
    return [{
      type: 'image',
      attrs: {
        ...attrs,
        src: item.config?.url || '',
        align: item.config?.align || 'left',
        width: item.config?.width || null,
        height: item.config?.height || null
      }
    }];
  }
  if (item.handler === 'code') {
    return [{
      type: 'codeBlock',
      attrs,
      content: textNodeFromHtml(item.content)
    }];
  }
  if (item.handler === 'ul' || item.handler === 'ol') {
    return htmlToTiptapNodes(`<${item.handler}>${item.content || ''}</${item.handler}>`, attrs);
  }
  if (item.handler === 'editor') {
    return htmlToTiptapNodes(item.content, attrs);
  }
  if (item.handler === 'table') {
    return [tableConfigToTiptapNode(item, attrs)];
  }
  if (item.handler === 'formtable') {
    const content = safeParseJson(item.content);
    if (content?.type === 'doc') {
      return (content.content || []).map(node => ({
        ...node,
        attrs: {
          ...(node.attrs || {}),
          blockUuid: node.attrs?.blockUuid || item.uuid || utils.setUuid(),
          blockType: node.attrs?.blockType || 'formtable'
        }
      }));
    }
    if (content?.type === 'table') {
      return [{
        ...content,
        attrs: {
          ...(content.attrs || {}),
          blockUuid: content.attrs?.blockUuid || item.uuid || utils.setUuid(),
          blockType: content.attrs?.blockType || 'formtable'
        }
      }];
    }
    return htmlToTiptapNodes(item.content, { ...attrs, blockType: 'formtable' });
  }
  return [{
    type: 'paragraph',
    attrs,
    content: textNodeFromHtml(item.content)
  }];
}

export function lineListToTiptap(lineList = []) {
  if (!Array.isArray(lineList) || lineList.length === 0) {
    return cloneData(EMPTY_TIPTAP_DOC);
  }
  return {
    type: 'doc',
    content: lineList.flatMap(item => lineToTiptapNodes(item))
  };
}

export function tiptapToKnowledgePayload(editorData = {}) {
  const content = editorData.content || EMPTY_TIPTAP_DOC;
  const fileList = editorData.fileList || [];
  return {
    title: editorData.title || '',
    lineList: tiptapToLineList(content),
    fileIdList: fileList.map(file => file.id).filter(id => id !== null && id !== undefined),
    tagList: editorData.tagList || []
  };
}

// 给旧知识库编辑、历史数据迁移等场景使用：输入 lineList，输出新编辑器的完整数据模型。
export function legacyLineListToEditorData(lineList = [], config = {}) {
  return {
    title: config.title || '',
    content: lineListToTiptap(lineList),
    tagList: config.tagList || [],
    fileList: config.fileList || [],
    meta: {
      source: config.source || 'legacy',
      invokeId: config.invokeId || null,
      knowledgeDocumentId: config.knowledgeDocumentId || config.id || null,
      knowledgeDocumentVersionId: config.knowledgeDocumentVersionId || null,
      knowledgeDocumentTypeUuid: config.knowledgeDocumentTypeUuid || null,
      originalHandlerList: lineList.map(item => item.handler).filter(Boolean)
    }
  };
}

// 给工单转知识预留的转换入口。工单侧仍可按旧方式拼 lineList，接入新编辑器时从这里转换。
export function workorderKnowledgePayloadToEditorData(payload = {}) {
  return legacyLineListToEditorData(payload.lineList || [], {
    ...payload,
    source: payload.source || 'processtask',
    fileList: normalizeFileList(payload)
  });
}

export function knowledgePayloadToTiptap(payload = {}) {
  return {
    title: payload.title || '',
    content: lineListToTiptap(payload.lineList || []),
    tagList: payload.tagList || [],
    fileList: normalizeFileList(payload),
    meta: {
      knowledgeDocumentId: payload.knowledgeDocumentId || payload.id || null,
      knowledgeDocumentVersionId: payload.knowledgeDocumentVersionId || null,
      knowledgeDocumentTypeUuid: payload.knowledgeDocumentTypeUuid || null,
      source: payload.source || 'knowledge',
      invokeId: payload.invokeId || null
    }
  };
}
