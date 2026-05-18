export function transformTableDom(tableEl) {
  removePagination(tableEl);
  transformRate(tableEl);
  transformCodeMirror(tableEl);
  transformExecuteTarget(tableEl);
  flattenCollapsePanel(tableEl);
  flattenTabPane(tableEl);
  normalizeStableDom(tableEl);
  return tableEl;
}

/* 分页 */
function removePagination(tableEl) {
  tableEl.querySelectorAll('.ivu-page').forEach(el => el.remove());
}

/* 评分 */
function transformRate(tableEl) {
  const rates = tableEl.querySelectorAll('.ivu-rate');
  if (!rates.length) return;

  rates.forEach(rate => {
    const value = Number(rate.querySelector('input[type="hidden"]')?.value || 0);

    const max = rate.querySelectorAll('.ivu-rate-star').length || 5;

    const el = document.createElement('span');
    el.textContent = `${value}/${max}`;

    rate.replaceWith(el);
  });
}

/* 代码块 */
const CM_REMOVE_SELECTORS = ['.CodeMirror-gutters', '.CodeMirror-gutter-wrapper', '.CodeMirror-gutter', '.CodeMirror-linenumber', '.CodeMirror-cursors', '.CodeMirror-cursor', '.CodeMirror-measure', '.CodeMirror-scrollbar-filler', '.CodeMirror-gutter-filler', '.CodeMirror-vscrollbar', '.CodeMirror-hscrollbar'].join(',');

function transformCodeMirror(tableEl) {
  // 1. 删除不需要的装饰结构
  tableEl.querySelectorAll(CM_REMOVE_SELECTORS).forEach(el => el.remove());

  // 2. 处理所有 CodeMirror 实例
  tableEl.querySelectorAll('.CodeMirror').forEach(cm => {
    // 收集所有行
    const lines = Array.from(cm.querySelectorAll('.CodeMirror-line')).map(line => line.textContent);

    const codeText = lines.join('\n');

    // 创建一个统一的 pre > code
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.textContent = codeText;
    pre.appendChild(code);

    // 用新的 pre 替换整个 CodeMirror
    cm.replaceWith(pre);
  });
}

// 执行目标
function transformExecuteTarget(tableEl) {
  let resultContent = '';
  // 过滤器
  const combineList = tableEl.querySelectorAll('[data-type="combine-searcher"]');
  if (combineList.length > 0) {
    combineList.forEach(combine => {
      // 找到 combine-searcher-readonly-box
      const knowledge = combine.querySelector('[data-type="combine-searcher-readonly-box"]');

      if (!knowledge) {
        combine.remove(); // 没有就整个删掉
        return;
      }

      // 只保留 combine-searcher-readonly-box
      combine.replaceChildren(knowledge);
    });

    // 然后取值
    const container = tableEl.querySelector('[data-type="combine-searcher-readonly-box"]');
    if (!container) return '';
    resultContent = Array.from(container.children)
      .map(el => el.textContent)
      .filter(Boolean)
      .join(' |  ');
    container.textContent = resultContent;
  }

  // 节点
  const nodeContainer = tableEl.querySelectorAll('[data-type="execution-target"]');

  if (nodeContainer.length > 0) {
    resultContent = Array.from(nodeContainer)
      .map(el => el.textContent)
      .filter(Boolean)
      .join(' | ');
  }

  const appendContent = tableEl.querySelector('[data-type="form-resources"]');
  if (appendContent) {
    appendContent.textContent = resultContent;
  }
}

// 折叠面板组件
function flattenCollapsePanel(tableEl) {
  const containers = tableEl.querySelectorAll('.ivu-collapse');

  containers.forEach(container => {
    const headers = container.querySelectorAll('.ivu-collapse-item > .ivu-collapse-header');

    headers.forEach(oldHeader => {
      const newHeader = document.createElement('h4');
      newHeader.innerHTML = oldHeader.innerHTML;
      newHeader.className = oldHeader.className;
      oldHeader.parentNode.replaceChild(newHeader, oldHeader);
    });
  });
}

// 选项卡
function flattenTabPane(tableEl) {
  const tabs = tableEl.querySelectorAll('.ivu-tabs-tab'); // 所有 tab 标签
  const tabpanes = tableEl.querySelectorAll('.ivu-tabs-tabpane'); // 所有内容 pane

  tabs.forEach((tab, index) => {
    const pane = tabpanes[index];
    if (!pane) return;

    // 处理tab的标签替换成h5的标签
    const oldDiv = tab.querySelector('div');
    if (oldDiv) {
      const h5 = document.createElement('h4');
      h5.innerHTML = oldDiv.innerHTML; // 只保留内容
      oldDiv.parentNode.replaceChild(h5, oldDiv);
    }

    // 把 pane 的所有子节点移动到 tab 下
    while (pane.firstChild) {
      tab.appendChild(pane.firstChild);
    }

    // 删除原 pane
    pane.remove();
  });
}

function normalizeStableDom(root) {
  normalizeReadonlyText(root);
  normalizeTables(root);
  unwrapRedundantContainers(root);
  removeEmptyContainers(root);
  normalizeWhitespaceText(root);
}

function normalizeReadonlyText(root) {
  root.querySelectorAll('.tsform-readonly').forEach(el => {
    if (el.children.length === 0) {
      el.replaceWith(document.createTextNode(el.textContent || ''));
    }
  });
}

function normalizeTables(root) {
  root.querySelectorAll('table').forEach(table => {
    table.querySelectorAll('colgroup').forEach(el => el.remove());
    table.className = 'sheet-table';
    normalizeTableRows(table);
    normalizeTableCells(table);
  });
}

function normalizeTableRows(table) {
  const rows = getDirectTableRows(table);
  const tbody = document.createElement('tbody');
  rows.forEach(row => tbody.appendChild(row));
  Array.from(table.children).forEach(child => child.remove());
  table.appendChild(tbody);
}

function getDirectTableRows(table) {
  return Array.from(table.children).flatMap(child => {
    const tagName = child.tagName?.toLowerCase();
    if (tagName === 'tr') {
      return [child];
    }
    if (['thead', 'tbody', 'tfoot'].includes(tagName)) {
      return Array.from(child.children).filter(item => item.tagName?.toLowerCase() === 'tr');
    }
    return [];
  });
}

function normalizeTableCells(table) {
  table.querySelectorAll('th,td').forEach(cell => {
    normalizeCellStyle(cell);
    unwrapCellBlocks(cell);
  });
}

function normalizeCellStyle(cell) {
  const styleMap = parseStyle(cell.getAttribute('style'));
  if (!styleMap['vertical-align']) {
    styleMap['vertical-align'] = 'top';
  }
  cell.setAttribute('style', serializeStyle(styleMap));
}

function unwrapCellBlocks(cell) {
  Array.from(cell.querySelectorAll('div,span,label')).forEach(el => {
    if (isKeepContainer(el) || el.closest('pre,code,a')) {
      return;
    }
    unwrapElement(el);
  });
}

function unwrapRedundantContainers(root) {
  Array.from(root.querySelectorAll('div,span,label')).forEach(el => {
    if (isKeepContainer(el) || el.closest('pre,code,a')) {
      return;
    }
    if (el.children.length === 0 && !el.textContent.trim()) {
      el.remove();
      return;
    }
    unwrapElement(el);
  });
}

function removeEmptyContainers(root) {
  Array.from(root.querySelectorAll('div,span,label,p,h1,h2,h3,h4,h5,h6')).reverse().forEach(el => {
    if (!el.textContent.trim() && !el.querySelector('table,img,pre,code,br,a,ul,ol')) {
      el.remove();
    }
  });
}

function normalizeWhitespaceText(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }
  textNodes.forEach(node => {
    node.nodeValue = String(node.nodeValue || '').replace(/\u00a0/g, ' ');
  });
}

function isKeepContainer(el) {
  const tagName = el.tagName?.toLowerCase();
  return ['table', 'tbody', 'thead', 'tfoot', 'tr', 'td', 'th', 'ul', 'ol', 'li', 'pre', 'code', 'a', 'img', 'br'].includes(tagName) ||
    el.hasAttribute('data-type');
}

function unwrapElement(el) {
  const parent = el.parentNode;
  if (!parent) {
    return;
  }
  while (el.firstChild) {
    parent.insertBefore(el.firstChild, el);
  }
  el.remove();
}

function parseStyle(style = '') {
  return String(style || '').split(';').reduce((map, item) => {
    const [rawName, ...rawValueList] = item.split(':');
    const name = String(rawName || '').trim().toLowerCase();
    const value = rawValueList.join(':').trim();
    if (name && value && !value.includes('undefined')) {
      map[name] = value.replace(/\s+/g, ' ');
    }
    return map;
  }, {});
}

function serializeStyle(styleMap = {}) {
  return Object.keys(styleMap).sort().map(key => `${key}:${styleMap[key]}`).join(';');
}
