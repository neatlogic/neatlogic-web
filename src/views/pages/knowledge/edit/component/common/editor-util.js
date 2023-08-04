import {BTNLIST, TAGLIST} from '@/views/pages/knowledge/edit/component/common/editor-config.js';
import utils from '@/resources/assets/js/util.js';
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
  comGetTargetCom(node, nameList) { //获取当前焦点的组件对应的dom 或者vue对象
    nameList = nameList || TAGLIST;
    function getParent(node) {
      if (!node) {
        return null;
      } else if (nameList.indexOf(node.nodeName.toLowerCase()) >= 0) {
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
    return result && document.getElementById('rightSider').contains(result) ? result : null;
  },
  comToolBtnStatus() { //获取选中区域，高亮的标签
    let list = {'h1': 'h1', 'h2': 'h2', 'b': 'b', 'i': 'i', 'ol': 'ol', 'ul': 'ul', 'a.innera': 'innerA', 'a.outera': 'outerA', 'span.line-through': 'u', 'p.img': 'img'};//'innerA', 'outerA' 需要特殊处理
    let specialList = ['file', 'search', 'tag', 'repeal', 'recover'];
    let range = this.comGetCursor();
    let frag = range.cloneContents();
    let toolActiveList = [];
    range.collapsed && (list = {'h1': 'h1', 'h2': 'h2', 'ol': 'ol', 'ul': 'ul'});//没有选中需要高亮的按钮
    //active
    for (let key in list) {
      if (frag.querySelector(key)) {
        toolActiveList.push(list[key]);
      }
    }
    //通过父类来判断
    function getAllParent(node, list) {
      if (node && node.tagName && TAGLIST.indexOf(node.tagName.toLowerCase()) < 0) {
        list.push(node);
        getAllParent(node.parentNode, list);
      } else {
        return;
      } 
    }
    let $parent = range.commonAncestorContainer;
    $parent && $parent.nodeType == 3 && ($parent = $parent.parentNode);
    if ($parent && $parent.nodeType == 1) {
      var parentList = [];
      getAllParent($parent, parentList);
      parentList.forEach(item => {
        let sel = item.tagName.toLowerCase() + (item.className ? '.' + item.className : '');
        if (list[sel] && toolActiveList.indexOf(list[sel]) < 0) {
          toolActiveList.push(list[sel]);
        }
      });
    }
    //access
    let $target = this.comGetTargetCom(range.startContainer);
    let toolAccessList = $target ? BTNLIST[$target.nodeName.toLowerCase()] || specialList : specialList;
    toolActiveList.forEach(item => {
      if (BTNLIST[item]) {
        toolAccessList = BTNLIST[item].filter(t => toolAccessList.includes(t));
      }
    });
    if (range.collapsed && BTNLIST.collapsedList) { //如果没有选中的文案 collapsedList里面包含不可选中的按钮
      toolAccessList = toolAccessList.filter(item => BTNLIST.collapsedList.indexOf(item) < 0);
    }
    return {toolAccessList: toolAccessList, toolActiveList: toolActiveList || []};
  },
  comInsertAfter: function(node, newNode) { //在节点后面加入新节点 同时设置焦点
    if (node) {
      node.nextSibling ? node.parentNode.insertBefore(newNode, node.nextSibling) : node.parentNode ? node.parentNode.appendChild(newNode) : '';
    }
    this.comSetfocus(newNode);
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
    $target = $target && $target.nodeType == 3 ? this.comGetTargetCom($target) : $target; 
    $target && $target.click();
  },
  comSetfocusByRange(rangeConfig) { //通过已有的range 来设置光标 
    let sel = null;
    if (window.getSelection) { 
      sel = window.getSelection();
    } else if (document.selection) { 
      sel = document.selection.createRange();
    }
    try {
      let range = document.createRange();
      range.selectNode(rangeConfig.commonAncestorContainer);
      range.selectNodeContents(rangeConfig.commonAncestorContainer);
      range.setStart(rangeConfig.startContainer, rangeConfig.startOffset);
      range.setEnd(rangeConfig.startContainer, rangeConfig.startOffset);
      sel.removeAllRanges();
      sel.addRange(range);
      let $focusNode = this.comGetTargetCom(rangeConfig.startContainer);
      $focusNode && $focusNode.click();
    } catch (err) {
      console.log('没有找到焦点元素');
    }
  },
  createDom(config, innerDom) {
    let newNode = document.createElement(config.handler);
    newNode.innerHTML = config.content;
    newNode.setAttribute('data_id', config.uuid);
    newNode.setAttribute('is_add', 'true');
    if (innerDom && innerDom.childNodes.length > 0) {
      newNode.innerHTML = '';
      for (let i = 0; innerDom.childNodes.length > 0;) {
        newNode.appendChild(innerDom.childNodes[i]);
      }
    }
    return newNode;
  },
  comBase64ToFile(base64) { //base64转为文件
    let arr = base64.split(','); 
    if (arr[0].split(';')[0] == 'base64') { //判断是base64编码
      let type = arr[0].match(/:(.*?);/)[1]; 
      let bstr = window.atob(arr[1]); 
      let n = bstr.length; 
      let u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], fileName, {type});
    }
    return false;
  },
  comRemoveMark($target) { //删除目标元素中的mark元素
    $target = $target.cloneNode(true);
    if ($target.querySelector('mark')) {
      $target.children.forEach(child => {
        let $mark = child.querySelectorAll('mark');
        if ($mark && $mark.length > 0) {
          child.innerHTML = child.innerHTML.replace(/<mark[\s\S]*?>([\s\S]*?)<\/mark>/g, '$1');
        }
      });
    }
    return $target;
  },
  changeNodeType($target, config) { //改变target的的类型和文案等
    let range = this.comGetCursor();
    // let activeRange = {startContainer: range.startContainer, startOffset: range.startOffset, commonAncestorContainer: range.commonAncestorContainer};
    let newNode = this.createDom(config);
    this.comInsertAfter($target, newNode);
    $target.remove();
    // this.comSetfocusByRange(activeRange); 
    newNode.click();
    
    return newNode;
  },
  insertAfter: function(node, newNode) {
    return node.nextSibling
      ? node.parentNode.insertBefore(newNode, node.nextSibling)
      : node.parentNode ? node.parentNode.appendChild(newNode) : '';
  },
  comAppendSelfFocus($target) { //把自身子元素放到父元素里面，位置相同 ，光标位置不变
    let textNode = document.createTextNode('');
    $target.appendChild(textNode);
    let activeRange = {startContainer: textNode, startOffset: 0, commonAncestorContainer: textNode};
    let $parent = $target.parentNode;
    let childrenList = $parent.childNodes;
    let $clone = $parent.cloneNode();
    $clone.innerHTML = '';
    this.insertAfter($parent, $clone);
    for (let c = 0; c < childrenList.length;) {
      let item = childrenList[c];
      if (item == $target) {
        for (let inner = 0; inner < item.childNodes.length;) {
          $clone.appendChild(item.childNodes[inner]);
        }
        c++;
      } else {
        $clone.appendChild(item);
      }
    }
    $parent.remove();
    this.comSetfocusByRange(activeRange);
  },
  appendText(text, $target, name) {
    text = text.split('\n');
    if (text.length > 1) {
      let $insertDom = $target;
      text.forEach(item => {
        let newNode = this.createDom({ handler: name || 'p', uuid: utils.setUuid(), content: item });
        this.insertAfter($insertDom, newNode);
        $insertDom = newNode;
      });
      $target.innerText.replace('\n', '') == '' && $target.remove();
      return $insertDom;
    }
  }
};
