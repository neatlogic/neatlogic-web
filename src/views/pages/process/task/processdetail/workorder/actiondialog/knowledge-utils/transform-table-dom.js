export function transformTableDom(tableEl) {
  removePagination(tableEl);
  transformRate(tableEl);
  transformCodeMirror(tableEl);
  transformExecuteTarget(tableEl);
  flattenCollapsePanel(tableEl);
  flattenTabPane(tableEl);
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

    const el = document.createElement('rate');
    el.dataset.type = 'rate';
    el.dataset.value = value;
    el.dataset.max = max;

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
