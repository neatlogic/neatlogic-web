import Range from '../range/Range';
import editorUtils from '@/views/pages/knowledge/edit/component/common/editor-util.js';
import {$t} from '@/resources/init.js';

export default {
  inject: {
    $fn: {
      default: {}
    }
  },
  props: [],
  methods: {
    okDialog(config) {
      //添加链接
      if (this.aTool.id == 'innerA') {
        const data = {
          knowledgeDocumentId: config.id
        };
        this.$api.knowledge.knowledge.getDocument(data).then(res => {
          if (res.Status === 'OK') {
            let url = HOME + `/knowledge.html#/knowledge-detail?knowledgeDocumentId=${res.Return.id}&status=passed`;
            this.range.applyInlineStyle(this.aTool.name, { 
              href: url, 
              class: this.aTool.className, 
              id: config.id, 
              name: res.Return.title, 
              target: '_blank',
              title: $t('term.knowledge.toinsidelink') + res.Return.title 
            });
          }
        });
      } else if (this.aTool.id == 'outerA') {
        this.range.applyInlineStyle(this.aTool.name, { 
          href: config.url, 
          class: this.aTool.className, 
          target: '_blank',
          title: config.title 
        });
      }
      this.$fn.setHistory();
      this.range.select();
      this.showDialog = false;
    },
    closeDialog() {
      //关闭添加链接的弹框
      console.log('closeDialog');
    },
    comGetCursor() {
      //获取光标
      return editorUtils.comGetCursor();
    },
    comChangeType(tool) {
      //工具栏中改变选中文案的标签
      let _this = this;
      let range = null;
      let $target = editorUtils.comGetTargetCom();
      if (!$target) { //如果选中的文案不属于编辑框内则放回
        return false;
      }
      if (tool.id == 'i' || tool.id == 'b' || tool.id == 'u') {
        //变粗 斜体
        range = getRange();
        if (range.collapsed) { //如果没有选中文案
          return;
        }
        
        tool.isActive ? range.removeInlineStyle(tool.name, tool.className) : range.applyInlineStyle(tool.name, { class: tool.className });
        range.select(); 
        this.$fn.setHistory();
        this.$parent.changeToolBtn();  
      } else if (tool.id == 'innerA' || tool.id == 'outerA') {
        //链接
        range = getRange();
        if (range.collapsed) { //如果没有选中文案
          this.$Message.warning({
            background: true,
            content: '请先划词选中内容'
          });
          return;
        }
        if (tool.isActive) {
          range.removeInlineStyle(tool.name, tool.className);
          range.select();   
          this.$parent.changeToolBtn();
          this.$fn.setHistory();
        } else {
          this.aTool = tool;
          this.showDialog = true;
          this.range = range;
          let userSelection = window.getSelection ? window.getSelection() : document.selection.createRange();
          this.innerText = userSelection.toString();
        } 
      } else if (tool.id == 'h1' || tool.id == 'h2') {
        this.setH(tool, $target);
      }
    },
    setH(tool, $target) { //设置 标题一 标题二
      let range = this.comGetCursor();
      let _this = this;
      if (tool.isActive) { //激活状态 把标题转为p标签
        if (range.collapsed) {
          editorUtils.changeNodeType($target, {handler: 'p', content: $target.innerHTML, uuid: this.$utils.setUuid()});
          _this.$fn.setHistory();
        } else {
          let hdom = range.cloneContents().querySelectorAll(tool.id); 
          if (hdom.length == 0) {
            hdom = [this.getTarget(range.startContainer)];
          }
          hdom && hdom.forEach(item => {
            editorUtils.changeNodeType($target, {handler: 'p', content: $target.innerHTML, uuid: this.$utils.setUuid()});
            _this.$fn.setHistory();
          });
        }
      } else {
        //把其他组件转换为标签
        $target = $target || document.querySelector(`#rightSider [data_id="${this.focusUuid}"]`);
        let content = document.querySelector(`[data_id="${this.focusUuid}"]`).innerText;
        let handler = $target.nodeName.toLowerCase();
        if (handler == 'h1' || handler == 'h2') { //标题层级互换
          editorUtils.changeNodeType($target, {handler: tool.id, content: content, uuid: this.$utils.setUuid()});
          this.$fn.setHistory();
        } else { //其他转化为标题
          let text = content.replace('\n', '');
          let str = range.toString().replace('\n', '');
          if (text == str || range.collapsed) {
            //修改组件对应的type类型
            editorUtils.changeNodeType($target, {handler: tool.id, content: content, uuid: this.$utils.setUuid()});
            this.$fn.setHistory();
          } else if (str) {
            this.changeSelectDom(range, tool);
          }
        }
      }
    },
    changeSelectDom(range, tool) {
      let list = ['h1', 'h2', 'ul', 'ol', 'select', 'p'];
      let $dom = range.cloneContents();
      let tag = list.find(item => {
        if ($dom.querySelector(item)) {
          return true;
        } else {
          return false;
        }
      });
      let $target = this.getTarget(range.startContainer);
      if (tag) { //夸多个标签，只修改开始对应的元素
        this.splitDom($target, range, tool, true);
      } else {
        if (!editorUtils.comGetTargetCom(range.startContainer)) { //选中的是否在编辑区域
          return false;
        }
        this.splitDom($target, range, tool);
      }
    },
    getTarget(node) {
      //获取当前焦点的组件对应的dom 或者vue对象
      return editorUtils.comGetTargetCom(node);
    },
    splitDom($target, range, tool, isAstride) { //isAstride代表选择是否夸标签
      //添加标志标签
      let _this = this;
      let str = range.toString();//获取选中的文案
      let $br = document.createElement('span');
      $br.className = 'mark';
      !isAstride && range.deleteContents();
      range.insertNode($br);
      //获取需要补充的标签 
      let nameList = [];
      let isWhile = true;
      let parent = $br.parentNode;
      while (isWhile) {
        let breakName = ['p'];
        if (breakName.indexOf(parent.nodeName.toLowerCase()) >= 0) {
          isWhile = false;
          break;
        }
        nameList.push(parent.nodeName.toLowerCase());
        parent = parent.parentNode;
      }
      //添加元素
      let innerHTML = $target.innerHTML;
      let nodeList = innerHTML.split('<span class="mark"></span>');
      let $insetTarget = $target;
      if (nodeList[0]) {
        nameList.forEach(item => {
          nodeList[0] = nodeList[0] + '</' + item + '>';
        });
        let $div = document.createElement('div');
        $div.innerHTML = nodeList[0];
        if ($div.innerText) {
          let newNode = editorUtils.createDom({handler: $target.nodeName.toLowerCase(), uuid: this.$utils.setUuid(), content: nodeList[0]});
          editorUtils.insertAfter($insetTarget, newNode);
          $insetTarget = newNode;
        }
      }
      if (!isAstride) {
        let newNode = editorUtils.createDom({handler: tool.id, uuid: this.$utils.setUuid(), content: str});
        editorUtils.insertAfter($insetTarget, newNode);
        $insetTarget = newNode;
      }

      if (nodeList[1]) {
        nameList.forEach(item => {
          nodeList[1] = '<' + item + '>' + nodeList[1];
        });
        let $div = document.createElement('div');
        $div.innerHTML = nodeList[1];
        if ($div.innerText) {
          let com = {handler: $target.nodeName.toLowerCase(), uuid: this.$utils.setUuid(), content: nodeList[1]};
          if (isAstride) {
            com = {handler: tool.id, uuid: this.$utils.setUuid(), content: $div.innerText};
          }
          let newNode = editorUtils.createDom(com);
          editorUtils.insertAfter($insetTarget, newNode);
        }
      }
      $target.remove();
      this.$fn.setHistory();
    }
  }
};

let getRange = () => {
  let me = window;
  let range = new Range(me.document);

  let sel = window.getSelection();
  if (sel && sel.type != 'None' && sel.rangeCount) {
    let firstRange = sel.getRangeAt(0);
    let lastRange = sel.getRangeAt(sel.rangeCount - 1);
    range.setStart(firstRange.startContainer, firstRange.startOffset).setEnd(lastRange.endContainer, lastRange.endOffset);
  }
  return range;
};
