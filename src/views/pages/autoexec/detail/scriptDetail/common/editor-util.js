export default {
  comGetCursor() { //获取光标
    let sel = null;
    let range = document.createRange();
    if (window.getSelection) {
      sel = window.getSelection();
    } else if (document.selection) {
      sel = document.selection.createRange();
    }
    if (sel && sel.type != 'None' && sel.rangeCount) {
      let firstRange = sel.getRangeAt(0);
      let lastRange = sel.getRangeAt(sel.rangeCount - 1);
      range.setStart(firstRange.startContainer, firstRange.startOffset);
      range.setEnd(lastRange.endContainer, lastRange.endOffset);
    }
    return range;
  },
  comGetTargetCom(node) { //获取当前焦点的组件对应的dom 或者vue对象
    function getParent(node) {
      if (!node) {
        return null;
      } else if (node.nodeType !== 3) {
        return node;
      } else {
        return getParent(node.parentNode);
      }
    }
    let $target = null;
    if (!node) {
      let sel = document.createRange();
      if (window.getSelection) {
        sel = window.getSelection();
      } else if (document.selection) {
        sel = document.selection.createRange();
      }
      sel.type != 'None' && ($target = sel.getRangeAt(0).startContainer);
    } else {
      $target = node;
    }
    if (!$target) {
      return null;
    }
    let result = null;
    if ($target.nodeType == 3) {
      result = getParent($target.parentNode);
    } else {
      result = getParent($target);
    }
    return result || null;
  },
  createDom(config, innerDom) {
    let newNode = document.createElement('div');
    newNode.innerText = config.content;
    // newNode.setAttribute('data_id', config.uuid);
    // newNode.setAttribute('is_add', 'true');
    if (innerDom && innerDom.childNodes.length > 0) {
      newNode.innerHTML = '';
      for (let i = 0; innerDom.childNodes.length > 0;) {
        newNode.appendChild(innerDom.childNodes[i]);
      }
    }
    return newNode;
  },
  insertAfter(node, newNode) {
    return node.nextSibling
      ? node.parentNode.insertBefore(newNode, node.nextSibling)
      : node.parentNode ? node.parentNode.appendChild(newNode) : '';
  },
  comSetfocus($target, islast) { //设置元素获取焦点
    if ($target) {
      let sel = null;
      if (window.getSelection) {
        sel = window.getSelection();
      } else if (document.selection) {
        sel = document.selection.createRange();
      }
      let range = document.createRange();
      range.selectNode($target);
      range.selectNodeContents($target);
      sel.removeAllRanges();
      sel.addRange(range);
      islast ? range.collapse() : sel.collapseToStart();
    }
    $target = $target.nodeType == 3 ? this.comGetTargetCom($target) : $target;
    $target && $target.click();
  }
};
