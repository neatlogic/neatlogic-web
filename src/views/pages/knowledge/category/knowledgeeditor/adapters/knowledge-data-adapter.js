import utils from '@/resources/assets/js/util.js';
import { marked } from 'marked';

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

const CONTENT_FILE_HANDLER_SET = new Set(['image', 'video', 'file']);
const LEGACY_FILE_HANDLER = ['insert', 'File'].join('');

function getDownloadFileId(url = '') {
  const value = String(url || '');
  if (!value) {
    return null;
  }
  const query = value.split('#')[0].split('?').slice(1).join('?');
  if (!query) {
    return null;
  }
  const idList = query.split('&').map(param => {
    const [key, ...rest] = param.split('=');
    return key === 'id' ? rest.join('=') : null;
  }).filter(Boolean);
  const id = idList.pop();
  if (!id) {
    return null;
  }
  try {
    return decodeURIComponent(id);
  } catch (error) {
    return id;
  }
}

function normalizeDownloadUrl(url) {
  const value = String(url || '');
  if (/^(https?:)?\/\//.test(value) || /^(blob|data):/.test(value) || value.startsWith('/')) {
    return value;
  }
  if (value) {
    return `/${value.replace(/^\/+/, '')}`;
  }
  return '';
}

function getLineFileId(item = {}) {
  if (!CONTENT_FILE_HANDLER_SET.has(item.handler) && item.handler !== LEGACY_FILE_HANDLER) {
    return null;
  }
  const config = item.config || {};
  if (item.handler === 'file' || item.handler === LEGACY_FILE_HANDLER) {
    return config.id || getDownloadFileId(config.url);
  }
  return config.id || getDownloadFileId(config.src || config.url || config.value);
}

function mergeFileIdList(...fileIdListGroup) {
  const result = [];
  const idSet = new Set();
  fileIdListGroup.flat().forEach(id => {
    if (id === null || id === undefined || id === '') {
      return;
    }
    const key = String(id);
    if (idSet.has(key)) {
      return;
    }
    idSet.add(key);
    result.push(id);
  });
  return result;
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

function markdownToHtml(markdown = '') {
  try {
    return marked.parse(String(markdown || ''), {
      gfm: true,
      breaks: false
    });
  } catch (error) {
    return `<p>${escapeHtml(markdown)}</p>`;
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
    if (child.type === 'table') {
      return tableNodeToHtml(child);
    }
    return blockNodeToHtml(child);
  }).join('<br>');
}

function attrsToHtml(attrs = {}) {
  return Object.keys(attrs).filter(key => attrs[key] !== null && attrs[key] !== undefined && attrs[key] !== '').map(key => `${key}="${escapeHtml(attrs[key])}"`).join(' ');
}

function normalizeStyle(style) {
  return String(style || '').trim().replace(/;$/, '');
}

function joinStyle(styleList = []) {
  return styleList.map(normalizeStyle).filter(Boolean).join(';');
}

function getStyleValue(style = '', name = '') {
  const match = String(style || '').match(new RegExp(`${name}\\s*:\\s*([^;]+)`, 'i'));
  return match ? match[1].trim() : null;
}

function removeStyleProperties(style = '', propertyList = []) {
  const propertySet = new Set(propertyList.map(property => property.toLowerCase()));
  return String(style || '').split(';').map(item => item.trim()).filter(item => {
    const property = item.split(':')[0]?.trim().toLowerCase();
    return property && !propertySet.has(property);
  }).join(';');
}

function getNodeTextAlign(node = {}) {
  const textAlign = node.attrs?.textAlign;
  return textAlign || null;
}

function getCellTextAlign(cell = {}) {
  const contentNode = (cell.content || []).find(child => getNodeTextAlign(child));
  return getNodeTextAlign(contentNode);
}

function mergeTextAlignStyle(style = '', textAlign = null) {
  if (!textAlign) {
    return normalizeStyle(style);
  }
  const nextStyle = removeStyleProperties(style, ['text-align']);
  return joinStyle([
    nextStyle,
    textAlign ? `text-align:${textAlign}` : ''
  ]);
}

function toNumber(value) {
  const number = Number.parseInt(value, 10);
  return Number.isNaN(number) ? null : number;
}

function formatHeight(height) {
  const value = toNumber(height);
  return value ? `height:${value}px` : '';
}

function getTableStyle(config = {}) {
  return config.tableStyle || getDefaultTableStyle();
}

function getTableCss(tableStyle = {}) {
  return typeof tableStyle === 'string' ? tableStyle : tableStyle.table;
}

function getEditableTableCss(config = {}) {
  const tableCss = getTableCss(getTableStyle(config));
  return config.headerList?.length ? removeStyleProperties(tableCss, ['width', 'min-width']) : tableCss;
}

function getRowStyle(config = {}, rowIndex = 0) {
  const tableStyle = getTableStyle(config);
  return joinStyle([
    tableStyle.tr,
    formatHeight(config.lefterList?.[rowIndex]?.height)
  ]);
}

function getCellStyle(config = {}, cell = {}) {
  const tableStyle = getTableStyle(config);
  const tdStyle = removeStyleProperties(tableStyle.td, ['border-bottom']);
  const cellStyle = removeStyleProperties(cell.cellStyle, ['border-bottom']);
  return joinStyle([
    tdStyle,
    cellStyle
  ]);
}

function getColwidth(headerList = [], startCol = 0, colspan = 1, fallbackWidth = null) {
  const widthList = Array.from({ length: colspan }).map((_, index) => {
    const width = toNumber(headerList[startCol + index]?.width);
    return width || null;
  });
  if (widthList.some(Boolean)) {
    return widthList.map(width => width || toNumber(fallbackWidth) || 200);
  }
  const fallback = toNumber(fallbackWidth);
  return fallback ? [fallback] : null;
}

function getColumnWidths(rows = [], colCount = 0) {
  const widths = Array.from({ length: colCount }).map(() => null);
  rows.forEach(row => {
    let colIndex = 0;
    (row.content || []).forEach(cell => {
      const attrs = cell.attrs || {};
      const colspan = attrs.colspan || 1;
      const colwidth = attrs.colwidth || [];
      for (let index = 0; index < colspan; index++) {
        if (!widths[colIndex + index] && colwidth[index]) {
          widths[colIndex + index] = colwidth[index];
        }
      }
      colIndex += colspan;
    });
  });
  return widths;
}

function tableNodeToHtml(node = {}, className = 'sheet-table') {
  const tableAttrs = node.attrs || {};
  const tableStyle = tableAttrs.tableStyle || getDefaultTableStyle();
  const rows = (node.content || []).map(row => {
    const cells = (row.content || []).map(cell => {
      const attrs = cell.attrs || {};
      const tagName = cell.type === 'tableHeader' ? 'th' : 'td';
      const textAlignStyle = getCellTextAlign(cell);
      const style = [
        mergeTextAlignStyle(attrs.cellStyle, textAlignStyle),
        attrs.background ? `background:${attrs.background}` : '',
        attrs.verticalAlign ? `vertical-align:${attrs.verticalAlign}` : ''
      ].filter(Boolean).join(';');
      const htmlAttrs = attrsToHtml({
        colspan: attrs.colspan > 1 ? attrs.colspan : null,
        rowspan: attrs.rowspan > 1 ? attrs.rowspan : null,
        style
      });
      return `<${tagName}${htmlAttrs ? ` ${htmlAttrs}` : ''}>${tableCellToHtml(cell)}</${tagName}>`;
    }).join('');
    const rowAttrs = attrsToHtml({
      style: row.attrs?.rowStyle || tableStyle.tr
    });
    return `<tr${rowAttrs ? ` ${rowAttrs}` : ''}>${cells}</tr>`;
  }).join('');
  const htmlAttrs = attrsToHtml({
    class: className,
    style: tableAttrs.style || getTableCss(tableStyle)
  });
  return `<table${htmlAttrs ? ` ${htmlAttrs}` : ''}><tbody>${rows}</tbody></table>`;
}

function getDefaultTableStyle() {
  return {
    table: 'table-layout:fixed;border-collapse:collapse;width:100%;text-align:left;border:none;',
    tr: 'height:42px',
    td: ''
  };
}

// 将 Tiptap 表格节点转换为旧知识库 table 配置，保证新编辑器保存后仍能兼容旧详情页渲染。
function tableNodeToConfig(node = {}) {
  const rows = node.content || [];
  const attrs = node.attrs || {};
  const tableList = [];
  let colCount = 0;
  rows.forEach((row, rowIndex) => {
    let colIndex = 0;
    (row.content || []).forEach(cell => {
      const attrs = cell.attrs || {};
      const colspan = attrs.colspan || 1;
      const rowspan = attrs.rowspan || 1;
      const cellStyle = mergeTextAlignStyle(attrs.cellStyle, getCellTextAlign(cell));
      tableList.push({
        row: rowIndex,
        col: colIndex,
        rowspan,
        colspan,
        content: tableCellToHtml(cell),
        background: attrs.background || null,
        verticalAlign: attrs.verticalAlign || null,
        cellStyle: cellStyle || null,
        isHeader: cell.type === 'tableHeader' ? 1 : 0
      });
      colIndex += colspan;
    });
    colCount = Math.max(colCount, colIndex);
  });
  const columnWidths = getColumnWidths(rows, colCount);
  return {
    row: rows.length,
    col: colCount,
    headerList: Array.from({ length: colCount }).map((col, index) => ({ width: columnWidths[index] || 200 })),
    lefterList: rows.map(row => ({
      height: row.attrs?.rowHeight || toNumber(getStyleValue(row.attrs?.rowStyle, 'height')) || 45
    })),
    tableList,
    tableStyle: attrs.tableStyle || getDefaultTableStyle()
  };
}

function listToHtml(node = {}) {
  return (node.content || []).map(item => {
    const paragraph = (item.content || []).find(child => child.type === 'paragraph');
    return `<li>${inlineToHtml(paragraph?.content || [])}</li>`;
  }).join('');
}

function blockChildrenToHtml(content = []) {
  return content.map(node => blockNodeToHtml(node)).join('');
}

function blockNodeToHtml(node = {}) {
  const attrs = node.attrs || {};
  if (node.type === 'heading') {
    const level = attrs.level || 1;
    return `<h${level}>${inlineToHtml(node.content || [])}</h${level}>`;
  }
  if (node.type === 'paragraph') {
    return `<p>${inlineToHtml(node.content || [])}</p>`;
  }
  if (node.type === 'bulletList') {
    return `<ul>${listToHtml(node)}</ul>`;
  }
  if (node.type === 'orderedList') {
    return `<ol>${listToHtml(node)}</ol>`;
  }
  if (node.type === 'blockquote') {
    return `<blockquote>${blockChildrenToHtml(node.content || [])}</blockquote>`;
  }
  if (node.type === 'codeBlock') {
    return `<pre><code>${escapeHtml(nodeText(node))}</code></pre>`;
  }
  if (node.type === 'table') {
    return tableNodeToHtml(node);
  }
  return inlineToHtml(node.content || []) || escapeHtml(nodeText(node));
}

function taskListToConfig(node = {}) {
  return {
    contentList: (node.content || []).map(item => {
      const paragraph = (item.content || []).find(child => child.type === 'paragraph');
      return {
        checked: !!item.attrs?.checked,
        content: inlineToHtml(paragraph?.content || [])
      };
    })
  };
}

function attrsToConfig(node = {}, config = {}) {
  return {
    ...(node.attrs || {}),
    ...config
  };
}

function createLineItem(handler, node, content, config = {}, options = {}) {
  return {
    handler,
    uuid: getUuid(node.attrs),
    content,
    config: options.mergeAttrs === false ? config : attrsToConfig(node, config)
  };
}

export function tiptapToLineList(doc = EMPTY_TIPTAP_DOC) {
  const lineList = [];
  (doc.content || []).forEach(node => {
    const attrs = node.attrs || {};
    if (node.type === 'heading') {
      lineList.push(createLineItem('heading', node, inlineToHtml(node.content || []), {
        level: attrs.level || 1
      }));
    } else if (node.type === 'paragraph') {
      lineList.push(createLineItem('paragraph', node, inlineToHtml(node.content || [])));
    } else if (node.type === 'bulletList') {
      lineList.push(createLineItem('bulletList', node, listToHtml(node), { className: 'disc' }));
    } else if (node.type === 'orderedList') {
      lineList.push(createLineItem('orderedList', node, listToHtml(node), { className: 'decimal' }));
    } else if (node.type === 'image') {
      lineList.push(createLineItem('image', node, '', {
        blockUuid: attrs.blockUuid,
        blockType: 'image',
        url: attrs.src || attrs.url || attrs.value || '',
        name: attrs.name || '',
        align: attrs.align || 'left',
        width: attrs.width,
        height: attrs.height
      }, { mergeAttrs: false }));
    } else if (node.type === 'file') {
      const url = normalizeDownloadUrl(attrs.url);
      lineList.push(createLineItem('file', node, '', {
        url,
        id: attrs.id || getDownloadFileId(url),
        name: attrs.name || attrs.pathName || '',
        size: attrs.size || null
      }, { mergeAttrs: false }));
    } else if (node.type === 'codeBlock') {
      const content = nodeText(node);
      lineList.push(createLineItem('codeBlock', node, content, {
        value: content,
        codeMode: attrs.language || 'text'
      }));
    } else if (node.type === 'table') {
      const isFormtable = attrs.blockType === 'formtable';
      lineList.push(createLineItem('table', node, isFormtable ? tableNodeToHtml(node) : '', {
        ...tableNodeToConfig(node),
        blockType: isFormtable ? 'formtable' : 'table'
      }));
      // formtable is stored as handler "table" and distinguished by config.blockType.
    } else if (node.type === 'taskList') {
      lineList.push(createLineItem('taskList', node, listToHtml(node), taskListToConfig(node)));
    } else if (node.type === 'blockquote' || node.type === 'callout') {
      lineList.push(createLineItem(node.type, node, blockChildrenToHtml(node.content || [])));
    } else if (node.type === 'horizontalRule') {
      lineList.push(createLineItem('divider', node, '', {
        blockType: 'divider'
      }));
    } else {
      lineList.push(createLineItem(node.type, node, inlineToHtml(node.content || []) || nodeText(node)));
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

const BLOCK_HTML_TAGS = new Set([
  'address',
  'article',
  'aside',
  'blockquote',
  'div',
  'dl',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hr',
  'li',
  'main',
  'nav',
  'ol',
  'p',
  'pre',
  'section',
  'table',
  'ul'
]);

function isBlockHtmlElement(domNode) {
  return !!(domNode && domNode.nodeType === 1 && BLOCK_HTML_TAGS.has(domNode.tagName.toLowerCase()));
}

function hasBlockHtmlElement(domNode) {
  return Array.from(domNode?.children || []).some(child => isBlockHtmlElement(child));
}

function hasDescendantBlockHtmlElement(domNode) {
  return Array.from(domNode?.children || []).some(child => isBlockHtmlElement(child) || hasDescendantBlockHtmlElement(child));
}

function shouldUnwrapBlockContainer(domNode) {
  return domNode?.tagName?.toLowerCase() === 'div' && hasDescendantBlockHtmlElement(domNode);
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
  } else if (tagName === 'span' && domNode.classList?.contains('line-through')) {
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
function getDirectTableRows(tableDom) {
  const sectionRows = Array.from(tableDom.children || []).filter(child => ['thead', 'tbody', 'tfoot'].includes(child.tagName?.toLowerCase())).flatMap(section => {
    return Array.from(section.children || []).filter(child => child.tagName?.toLowerCase() === 'tr');
  });
  return sectionRows.length ? sectionRows : Array.from(tableDom.children || []).filter(child => child.tagName?.toLowerCase() === 'tr');
}

function domTableToTiptapTable(tableDom, attrs = {}) {
  const rows = getDirectTableRows(tableDom);
  const tableStyle = attrs.tableStyle || {
    table: tableDom.getAttribute('style') || null,
    tr: null,
    td: null
  };
  return {
    type: 'table',
    attrs: {
      textAlign: null,
      blockUuid: attrs.blockUuid || utils.setUuid(),
      blockType: attrs.blockType || 'table',
      tableStyle,
      style: attrs.style || getTableCss(tableStyle) || null
    },
    content: rows.map(row => ({
      type: 'tableRow',
      attrs: {
        blockUuid: utils.setUuid(),
        blockType: 'tableRow',
        rowStyle: row.getAttribute('style') || null,
        rowHeight: toNumber(row.style.height)
      },
      content: Array.from(row.children || []).map(cell => {
        const cellTag = cell.tagName.toLowerCase();
        return {
          type: cellTag === 'th' ? 'tableHeader' : 'tableCell',
          attrs: {
            colspan: cell.colSpan || 1,
            rowspan: cell.rowSpan || 1,
            colwidth: null,
            cellStyle: cell.getAttribute('style') || null,
            background: cell.style.backgroundColor || null,
            verticalAlign: cell.style.verticalAlign || 'top'
          },
          content: domTableCellContentToTiptapNodes(cell)
        };
      })
    }))
  };
}

// 把旧 HTML 块拆成 Tiptap 顶层节点；无法识别的 DOM 默认降级为段落，避免转换失败阻断编辑。
function domImageToTiptapNode(domNode, attrs = {}) {
  return {
    type: 'image',
    attrs: {
      ...attrs,
      src: domNode.getAttribute('src') || '',
      name: domNode.getAttribute('alt') || domNode.getAttribute('title') || '',
      align: 'left',
      width: domNode.getAttribute('width') || null,
      height: domNode.getAttribute('height') || null
    }
  };
}

function getOnlyImageChild(domNode) {
  const children = Array.from(domNode.children || []);
  if (children.length !== 1 || children[0].tagName?.toLowerCase() !== 'img') {
    return null;
  }
  return domNode.textContent?.trim() ? null : children[0];
}

function getDomBlockType(domNode) {
  const tagName = domNode.tagName?.toLowerCase();
  if (/^h[1-6]$/.test(tagName)) {
    return `heading${tagName.slice(1)}`;
  }
  return {
    p: 'paragraph',
    ul: 'bulletList',
    ol: 'orderedList',
    pre: 'codeBlock',
    table: 'table',
    img: 'image'
  }[tagName] || 'paragraph';
}

function getDomBlockAttrs(domNode, attrs = {}, index = 0) {
  return {
    ...attrs,
    blockUuid: index === 0 ? (attrs.blockUuid || utils.setUuid()) : utils.setUuid(),
    blockType: attrs.blockType === 'formtable' ? 'formtable' : getDomBlockType(domNode)
  };
}

function domBlockToTiptapNodes(domNode, attrs = {}) {
  if (shouldUnwrapBlockContainer(domNode)) {
    return domChildNodesToTiptapBlocks(domNode);
  }
  return [domBlockToTiptapNode(domNode, attrs)];
}

function domBlockToTiptapNode(domNode, attrs = {}) {
  const tagName = domNode.tagName.toLowerCase();
  if (/^h[1-6]$/.test(tagName)) {
    return {
      type: 'heading',
      attrs: {
        ...attrs,
        level: Number(tagName.slice(1))
      },
      content: domInlineToTiptapNodes(domNode)
    };
  }
  if (tagName === 'p') {
    const imageChild = getOnlyImageChild(domNode);
    if (imageChild) {
      return domImageToTiptapNode(imageChild, attrs);
    }
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
    return domImageToTiptapNode(domNode, attrs);
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
  if (!hasBlockHtmlElement(container)) {
    return [{
      type: 'paragraph',
      attrs,
      content: domInlineToTiptapNodes(container)
    }];
  }
  return blockElements.flatMap((element, index) => domBlockToTiptapNodes(element, getDomBlockAttrs(element, attrs, index)));
}

function createParagraphNode(content = [], attrs = {}) {
  return {
    type: 'paragraph',
    attrs: {
      textAlign: null,
      ...attrs,
      blockUuid: attrs.blockUuid || utils.setUuid(),
      blockType: attrs.blockType || 'paragraph'
    },
    content
  };
}

function domInlineFragmentToTiptapNodes(nodeList = []) {
  const container = document.createElement('div');
  nodeList.forEach(node => container.appendChild(node.cloneNode(true)));
  return domInlineToTiptapNodes(container);
}

function domChildNodesToTiptapBlocks(parentDom) {
  const content = [];
  let inlineNodes = [];
  const flushInlineNodes = () => {
    if (!inlineNodes.length) {
      return;
    }
    const paragraphContent = domInlineFragmentToTiptapNodes(inlineNodes);
    if (paragraphContent.length) {
      content.push(createParagraphNode(paragraphContent));
    }
    inlineNodes = [];
  };
  Array.from(parentDom?.childNodes || []).forEach(child => {
    if (isBlockHtmlElement(child)) {
      flushInlineNodes();
      content.push(...domBlockToTiptapNodes(child, getDomBlockAttrs(child, {
        textAlign: null,
        blockUuid: utils.setUuid()
      })));
    } else if (child.nodeType !== 3 || child.nodeValue.trim() || inlineNodes.length) {
      inlineNodes.push(child);
    }
  });
  flushInlineNodes();
  return content;
}

function domTableCellContentToTiptapNodes(cellDom) {
  if (typeof document === 'undefined' || !cellDom) {
    return [createParagraphNode()];
  }
  const content = domChildNodesToTiptapBlocks(cellDom);
  return content.length ? content : [createParagraphNode()];
}

function htmlToTableCellContentNodes(html = '') {
  if (typeof document === 'undefined') {
    return [createParagraphNode(textNodeFromHtml(html))];
  }
  const container = document.createElement('div');
  container.innerHTML = String(html || '').replace(/<br\s*\/?>/gi, '<br>');
  return domTableCellContentToTiptapNodes(container);
}

function markdownToTiptapNodes(markdown = '', attrs = {}) {
  return htmlToTiptapNodes(markdownToHtml(markdown), attrs);
}

function formtableHtmlToTiptapNodes(html = '', attrs = {}) {
  if (typeof document === 'undefined') {
    return htmlToTiptapNodes(html, attrs);
  }
  const container = document.createElement('div');
  container.innerHTML = String(html || '');
  const tableElements = Array.from(container.querySelectorAll('table')).filter(table => !table.parentElement?.closest('table'));
  if (tableElements.length > 0) {
    return tableElements.map((table, index) => domTableToTiptapTable(table, {
      ...attrs,
      blockUuid: index === 0 ? (attrs.blockUuid || utils.setUuid()) : utils.setUuid(),
      blockType: 'formtable'
    }));
  }
  return htmlToTiptapNodes(html, { ...attrs, blockType: 'formtable' });
}

function textNodeFromHtml(html = '') {
  const text = htmlToText(html);
  return text ? [{ type: 'text', text }] : [];
}

// 旧知识库普通 table 使用 tableList 描述单元格坐标，这里转换为 Tiptap table JSON。
function tableConfigToTiptapNode(item = {}, attrs = {}) {
  const config = item.config || {};
  const tableList = config.tableList || [];
  const tableStyle = getTableStyle(config);
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
      blockType: attrs.blockType || (item.handler === 'formtable' ? 'formtable' : 'table'),
      tableStyle,
      style: attrs.style || getEditableTableCss(config) || null
    },
    content: Array.from({ length: rowCount }).map((row, rowIndex) => ({
      type: 'tableRow',
      attrs: {
        blockUuid: utils.setUuid(),
        blockType: 'tableRow',
        rowStyle: getRowStyle(config, rowIndex),
        rowHeight: toNumber(config.lefterList?.[rowIndex]?.height)
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
            colwidth: getColwidth(config.headerList, colIndex, cell.colspan || 1, cell.width),
            cellStyle: getCellStyle(config, cell),
            background: cell.background || null,
            verticalAlign: cell.verticalAlign || 'top'
          },
          content: htmlToTableCellContentNodes(cell.content || '')
        });
        return cellList;
      }, [])
    }))
  };
}

// lineList 是当前后台保存协议；新组件内部优先使用 Tiptap JSON，因此所有旧块都先经过这里归一。
function normalizeLineHandler(item = {}) {
  const handler = item.handler || 'paragraph';
  const config = item.config || {};
  if (handler === 'editor' && config.tiptapType) {
    return config.tiptapType === 'highlightBlock' ? 'callout' : config.tiptapType;
  }
  return {
    p: 'paragraph',
    h1: 'heading',
    h2: 'heading',
    img: 'image',
    code: 'codeBlock',
    markdown: 'markdown',
    ul: 'bulletList',
    ol: 'orderedList',
    divider: 'horizontalRule',
    [LEGACY_FILE_HANDLER]: 'file',
    formtable: 'table',
    highlightBlock: 'callout'
  }[handler] || handler;
}

function getLineAttrs(item = {}, handler = 'paragraph') {
  const config = item.config || {};
  const tiptapAttrs = config.tiptapAttrs || {};
  const attrs = {
    textAlign: null,
    ...tiptapAttrs,
    ...config
  };
  delete attrs.tiptapType;
  delete attrs.tiptapAttrs;
  delete attrs.content;
  attrs.blockUuid = attrs.blockUuid || item.uuid || utils.setUuid();
  attrs.blockType = attrs.blockType || tiptapAttrs.blockType || handler;
  if (attrs.blockType === item.handler && handler !== item.handler) {
    attrs.blockType = handler;
  }
  if (handler !== 'table' && handler !== 'formtable' && attrs.blockType !== handler) {
    attrs.blockType = handler;
  }
  if (item.handler === 'formtable' && handler === 'table') {
    attrs.blockType = 'formtable';
  }
  return attrs;
}

function legacyTaskContentToList(content = '') {
  const value = String(content || '');
  if (!value) {
    return [];
  }
  const liList = [];
  value.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (match, liContent) => {
    liList.push({
      checked: false,
      content: liContent
    });
    return match;
  });
  if (liList.length) {
    return liList;
  }
  return value.split(/\r?\n/).filter(Boolean).map(text => ({
    checked: false,
    content: text
  }));
}

function taskListConfigToTiptapNode(item = {}, attrs = {}) {
  const taskList = item.config?.contentList || item.config?.content || legacyTaskContentToList(item.content);
  return {
    type: 'taskList',
    attrs,
    content: (taskList.length ? taskList : [{ checked: false, content: '' }]).map(task => ({
      type: 'taskItem',
      attrs: {
        checked: !!task.checked,
        blockUuid: utils.setUuid(),
        blockType: 'taskItem'
      },
      content: htmlToTiptapNodes(task.content || '', {
        textAlign: null,
        blockUuid: utils.setUuid(),
        blockType: 'paragraph'
      })
    }))
  };
}

function lineToTiptapNodes(item = {}) {
  const handler = normalizeLineHandler(item);
  const attrs = getLineAttrs(item, handler);
  if (handler === 'heading') {
    return [{
      type: 'heading',
      attrs: {
        ...attrs,
        level: attrs.level || (item.handler === 'h2' ? 2 : 1)
      },
      content: textNodeFromHtml(item.content)
    }];
  }
  if (handler === 'paragraph' || handler === 'editor') {
    return htmlToTiptapNodes(item.content, attrs);
  }
  if (handler === 'markdown') {
    return markdownToTiptapNodes(item.content, attrs);
  }
  if (handler === 'image') {
    const imageSrc = attrs.src || attrs.url || attrs.value || item.config?.url || item.config?.value || '';
    const imageAttrs = { ...attrs };
    delete imageAttrs.url;
    delete imageAttrs.value;
    delete imageAttrs.title;
    return [{
      type: 'image',
      attrs: {
        ...imageAttrs,
        src: imageSrc,
        align: imageAttrs.align || 'left',
        width: imageAttrs.width || null,
        height: imageAttrs.height || null
      }
    }];
  }
  if (handler === 'video') {
    return [{
      type: 'video',
      attrs: {
        ...attrs,
        src: attrs.src || '',
        controls: attrs.controls !== false,
        width: attrs.width || null,
        height: attrs.height || null,
        aspectRatio: attrs.aspectRatio || null,
        recordUuid: attrs.recordUuid || null
      }
    }];
  }
  if (handler === 'file') {
    const url = normalizeDownloadUrl(attrs.url);
    const fileAttrs = { ...attrs };
    delete fileAttrs.src;
    delete fileAttrs.url;
    delete fileAttrs.value;
    return [{
      type: 'file',
      attrs: {
        ...fileAttrs,
        url,
        id: attrs.id || getDownloadFileId(url),
        name: attrs.name || '',
        size: attrs.size || null,
        sizeText: attrs.sizeText || '',
        recordUuid: attrs.recordUuid || null,
        loading: false,
        error: false
      }
    }];
  }
  if (handler === 'codeBlock') {
    return [{
      type: 'codeBlock',
      attrs: {
        ...attrs,
        language: attrs.language || item.config?.codeMode || 'text'
      },
      content: textNodeFromHtml(item.content)
    }];
  }
  if (handler === 'bulletList' || handler === 'orderedList') {
    const tagName = handler === 'bulletList' ? 'ul' : 'ol';
    return htmlToTiptapNodes(`<${tagName}>${item.content || ''}</${tagName}>`, attrs);
  }
  if (handler === 'table' && attrs.blockType === 'formtable') {
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
    if (item.config?.tableList) {
      return [tableConfigToTiptapNode(item, attrs)];
    }
    return formtableHtmlToTiptapNodes(item.content, { ...attrs, blockType: 'formtable' });
  }
  if (handler === 'table') {
    if (!item.config?.tableList && String(item.content || '').trim()) {
      return htmlToTiptapNodes(item.content, attrs);
    }
    return [tableConfigToTiptapNode(item, attrs)];
  }
  if (handler === 'taskList') {
    return [taskListConfigToTiptapNode(item, attrs)];
  }
  if (handler === 'blockquote' || handler === 'callout') {
    return [{
      type: handler,
      attrs,
      content: htmlToTiptapNodes(item.content, {
        textAlign: null,
        blockUuid: utils.setUuid(),
        blockType: 'paragraph'
      })
    }];
  }
  if (handler === 'horizontalRule' || handler === 'rate') {
    return [{ type: handler, attrs }];
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
  const lineList = tiptapToLineList(content);
  const contentFileIdList = lineList.map(item => getLineFileId(item)).filter(Boolean);
  return {
    title: editorData.title || '',
    lineList,
    fileIdList: mergeFileIdList(contentFileIdList),
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
