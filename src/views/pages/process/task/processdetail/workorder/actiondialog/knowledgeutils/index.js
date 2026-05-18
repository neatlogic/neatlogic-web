import { transformTableDom } from './transform-table-dom';

export function createEditorFromDom(dom) {
  const cloned = dom.cloneNode(true);
  transformTableDom(cloned);
  normalizeKnowledgeDom(cloned);
  return cloned.outerHTML;
}

function normalizeKnowledgeDom(root) {
  removeCommentNodes(root);
  flattenTabs(root);
  removeRuntimeNodes(root);
  normalizeTableActionColumn(root);
  normalizeAttributes(root);
}

function removeCommentNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT);
  const nodes = [];
  while (walker.nextNode()) {
    nodes.push(walker.currentNode);
  }
  nodes.forEach(node => node.remove());
}

function removeRuntimeNodes(root) {
  const selectors = [
    'script',
    'style',
    'object',
    'input',
    'textarea',
    '.custom-scrollbar-box',
    '.scroll-bar',
    '.table-resize-line',
    '.ivu-tabs-ink-bar',
    '.ivu-tabs-nav-prev',
    '.ivu-tabs-nav-next',
    '.ivu-tabs-context-menu',
    '.ivu-dropdown',
    '.btn-hideaction',
    '.tstable-action',
    '.action-div'
  ].join(',');

  root.querySelectorAll(selectors).forEach(el => el.remove());
}

function flattenTabs(root) {
  root.querySelectorAll('.ivu-tabs').forEach(tabs => {
    const fragment = document.createDocumentFragment();
    tabs.querySelectorAll('.ivu-tabs-tab').forEach(tab => {
      const title = tab.querySelector('h4');
      if (title) {
        fragment.appendChild(title.cloneNode(true));
      }
      Array.from(tab.children).forEach(child => {
        if (child.tagName?.toLowerCase() !== 'h4') {
          fragment.appendChild(child.cloneNode(true));
        }
      });
    });
    tabs.replaceWith(fragment);
  });
}

function normalizeTableActionColumn(root) {
  root.querySelectorAll('th[data-key="action"], td.action-tr').forEach(cell => {
    const row = cell.parentElement;
    if (!row) {
      cell.remove();
      return;
    }
    const index = Array.from(row.children).indexOf(cell);
    cell.remove();
    const table = row.closest('table');
    if (!table || index < 0) {
      return;
    }
    table.querySelectorAll('tr').forEach(tr => {
      const target = tr.children[index];
      if (target && target.matches('th,td') && !target.textContent.trim()) {
        target.remove();
      }
    });
  });
}

function normalizeAttributes(root) {
  const allowedAttrs = new Set([
    'href',
    'target',
    'colspan',
    'rowspan',
    'width',
    'height',
    'title',
    'class',
    'style',
    'data-type',
    'data-value',
    'data-max'
  ]);

  [root, ...root.querySelectorAll('*')].forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      if (/^data-v-/.test(attr.name) || !allowedAttrs.has(attr.name)) {
        el.removeAttribute(attr.name);
      }
    });

    normalizeClass(el);
    normalizeStyle(el);
  });
}

function normalizeClass(el) {
  const keepClassList = Array.from(el.classList || []).filter(className => {
    return [
      'ck-content',
      'img-viewer',
      'sheet-table',
      'tssheet-main',
      'tstable-body',
      'table-main',
      'tsform-readonly',
      'pre',
      'text-href'
    ].includes(className);
  });

  if (keepClassList.length) {
    el.setAttribute('class', keepClassList.join(' '));
  } else {
    el.removeAttribute('class');
  }
}

function normalizeStyle(el) {
  const style = el.getAttribute('style');
  if (!style) {
    return;
  }

  const keepStyle = style
    .split(';')
    .map(item => item.trim())
    .filter(item => {
      if (!item || item.includes('undefined')) {
        return false;
      }
      return /^(width|height|text-align|vertical-align|background|background-color|border|border-collapse|table-layout)\s*:/i.test(item);
    })
    .join('; ');

  if (keepStyle) {
    el.setAttribute('style', keepStyle);
  } else {
    el.removeAttribute('style');
  }
}
