<template>
  <div
    id="rightSider"
    class="edit-component-wrap"
    contenteditable 
    @click.stop="handlerClick" 
    @keydown="handlerKeydown" 
    @keyup="handlerKeyup" 
    @paste="handlerPaste" 
    @input="handlerInput"
    @compositionstart="handlerCompositionstart"
    @compositionend="handlerCompositionend"
    @drop.prevent 
    @mousemove="handlerMousemove" 
    @mouseout="handlerMouseout"
    @blur="handlerBlur"
  >
    <div
      :is="'item-' + list.handler"
      v-for="list in componentList"
      :key="list.uuid"
      :ref="list.uuid"
      :config="list.config"
      :handler="list.handler"
      :uuid="list.uuid"
      :content="list.content"
      :changeFocue="changeFocue"
      :content-data="$t('form.placeholder.pleaseinput')"
    ></div>
  </div> 
</template>
<script>
import items from '../component/index.js';
import editorUtils from '@/views/pages/knowledge/edit/component/common/editor-util.js';
import { BTNLIST, TITLELIST } from '@/views/pages/knowledge/edit/component/common/editor-config.js';//公共配置
import Vue from 'vue';
export default {
  name: 'EditComponent',
  tagComponent: 'EditComponent',
  provide() {
    let _this = this;
    return {
      $parentTop: _this
    };
  },
  inject: {
    $fn: {
      default: {}
    }
  },
  components: {
    ...items
  },
  filters: {},
  props: {
    dataList: {
      type: Array,
      default: () => []
    },
    historyRange: Object
  },
  data() {
    let _this = this;
    return {
      componentList: [], //渲染頁面的插件
      newdataList: [], //中途修改之后更改的数据 主要是用來记录
      focusUuid: '',
      changeFocue: ''
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() { 
    this.scrollTop = false;
  },
  beforeUpdate() {},
  updated() {
    //删除由于手动添加节点导致的多余的节点
    let $scroll = document.querySelector('.scrollContian');
    if (this.scrollTop && this.scrollTop != $scroll.scrollTop) {
      $scroll.scrollTop = this.scrollTop;
      this.scrollTop = null;
    }
  },
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    addComponent(component, topUuid) {
      //添加组件 topUuid:需要在哪个组件下面添加，需要添加的组件
      let focusCom = null;
      topUuid = topUuid || this.focusUuid || this.newdataList[this.newdataList.length - 1].uuid;
      let $insertDom = document.querySelector(`#rightSider [data_id="${topUuid}"]`);
      if (!$insertDom) {
        return;
      }
      if (Array.isArray(component)) {
        if ($insertDom) {
          component.forEach(a => {
            this.changeFocue = a.uuid;
            let itemVue = this.addItem(a, $insertDom);
            this.refVue = this.refVue || {};
            this.refVue[a.uuid] = itemVue.$children[0];
            $insertDom = itemVue.$el;
          });
        }
      } else {
        this.changeFocue = component.uuid;
        let itemVue = this.addItem(component, $insertDom);
        this.refVue = this.refVue || {};
        this.refVue[component.uuid] = itemVue.$children[0];
        if ($insertDom.nodeName.toLowerCase() == 'p' && ($insertDom.innerHTML == '<br>' || $insertDom.innerHTML == '' || $insertDom.innerText.replace('\n', '') == '')) {
          $insertDom.remove();
        }
      }
      this.$parent.setHistory();
    },
    addItem(itemData, $insertDom, isAppend) {
      let _this = this;
      var ItemComponent = Vue.extend({
        provide() {
          return {
            $fn: _this.$fn,
            $parentTop: _this
          };
        },
        components: {
          ...items
        },
        data: function() {
          return {
            itemData: itemData,
            changeFocue: _this.changeFocue
          };
        },
        template: `<item-${itemData.handler} :ref="itemData.uuid" :config="itemData.config" :handler="itemData.handler" :uuid="itemData.uuid" :content="itemData.content" :changeFocue="changeFocue" is_add="true"></item-${itemData.handler}>`
      });
      let $newDom = editorUtils.createDom({handler: 'div'});
      !isAppend ? editorUtils.insertAfter($insertDom, $newDom) : $insertDom.appendChild($newDom);
      return new ItemComponent().$mount($newDom);
    },
    removeComponent(item, uuid) {
      this.refVue && delete this.refVue[uuid];
    },
    handlerBlur() {
      // this.focusUuid = ''; 在添加突变时会导致找不到对应的位置
    },
    handlerClick(e) { //设置焦点元素和高亮工具栏
      let $target = editorUtils.comGetTargetCom() || e.target;
      if ($target) {
        let uuid = $target.getAttribute('data_id');
        this.focusUuid == uuid && this.$parent.changeToolBtn();
        this.focusUuid = uuid || '';
      } else {
        this.focusUuid = '';
      }
    },
    handlerMouseout(e) {
      let $target = editorUtils.comGetTargetCom();
      if ($target) {
        let uuid = $target.getAttribute('data_id');
        this.focusUuid == uuid && this.$parent.changeToolBtn();
        this.focusUuid = uuid || '';
      } else {
        this.focusUuid = '';
      }
    },
    handlerKeydown(e) { //1、撤销  还原的历史操作  2、删除（最前面一行添加一行数据）  3、enter 特殊组件后面添加一行数据  
      let targetVue = null;
      let _this = this;
      let $target = editorUtils.comGetTargetCom() || null;
      //历史记录操作
      if (e.ctrlKey == true && e.keyCode == 90) {
        //Ctrl+Z  撤销
        this.$parent.dealHistory('historyList');
        e.preventDefault();
      } else if (e.ctrlKey == true && e.keyCode == 89) {
        //Ctrl+y 还原
        this.$parent.dealHistory('backList');
        e.preventDefault();
      }

      if (!$target) { //目标不存时后面的操作不用
        return;
      }
      let targetUuid = $target.getAttribute('data_id');
      _this.setTimeChangeMenuList && clearTimeout(_this.setTimeChangeMenuList) && (_this.setTimeChangeMenuList = null);//清除获取menuList 定时作业
      if (e.keyCode == '8' || e.keyCode == '46' || (e.ctrlKey == true && e.keyCode == 88)) { //删除组件操作  backSpace delete  ctr+x
        let range = editorUtils.comGetCursor();
        let hasTag = null;//选中删除的文案里面是否有
        if (range.collapsed) { //起点和终点相同
          let liList = ['ul', 'ol'];//列表的删除需要做特殊处理
          if ($target && (e.keyCode == '8' || e.keyCode == '46') && liList.indexOf($target.nodeName.toLowerCase()) >= 0) {
            this.ulDelete(e, $target);
          } else if (($target && (e.keyCode == '8' || e.keyCode == '46') && ($target.innerHTML == '<br>' || $target.innerHTML == '' || $target.innerText.replace('\n', '') == ''))) {
            let $parent = document.getElementById('rightSider');
           
            if ($parent.children.length == 1) { //删除只剩下一个元素时，让第一个元素始终为p
              e.preventDefault();
              if ($parent.children[0].nodeName.toLowerCase() != 'p') {
                let config = { handler: 'p', uuid: targetUuid, content: ''};
                let newEl = editorUtils.createDom(config);
                editorUtils.insertAfter($target, newEl);
                $target.remove();
                editorUtils.comSetfocus(newEl, true);
              }
            } else {
              let $preNode = $target.previousSibling;
              if ($preNode && $preNode.nodeName.toLowerCase() == 'section') { //如果上一个节点是selection等复杂组件，需要特殊处理
                $target.remove();
                $preNode.click();
                e.preventDefault();
              }
            }
          }
        }
      } else if (e.keyCode == '13') { //enter
        $target.__vue__ && (targetVue = $target.__vue__);
        if ($target.nodeName == 'P') {
          let _this = this;
          setTimeout(($target) => {
            let newEl = $target.nextSibling;
            if ($target.previousSibling && $target.previousSibling.getAttribute('data_id') == targetUuid) {
              newEl = $target;
            }
            if (newEl) {
              let newUuid = _this.$utils.setUuid();
              newEl.setAttribute('data_id', newUuid);
              newEl.setAttribute('is_add', 'true');
            }
          }, 1, $target);
        } else if (TITLELIST.indexOf($target.nodeName.toLowerCase()) >= 0) {
          this.hEnter(e, $target);
        } else if ($target.nodeName == 'OL' || $target.nodeName == 'UL') {
          this.ulEnter(e, $target);
        }
        this.changeHoverClass(targetUuid);
      } 
      _this.setTimeChangeMenuList = setTimeout(function() { //更新menuList 数据
        _this.changeMenuList(); 
        _this.setTimeChangeMenuList = null;
      }, 250);
    },
    handlerInput(e) { //主要是记录历史数据
      let _this = this;
      if (this.timeoutInput) {
        clearTimeout(this.timeoutInput);
        this.timeoutInput = null;
      }
      !this.isComposition && (this.timeoutInput = setTimeout(function() {
        _this.$parent.setHistory();
      }, 200));
    },
    handlerCompositionstart() { //中文的输入监听开始
      this.isComposition = true;
    },
    handlerCompositionend() { //中文的数据结束，需要记录历史
      this.isComposition = false;
      this.$parent.setHistory();
    },
    handlerMousemove() {
      this.changeHoverClass(null);
    },

    handlerKeyup(e) { //设置焦点元素
      if (e.keyCode == '13') { //enter
        //记录历史记录
        if (this.timeoutInput) {
          clearTimeout(this.timeoutInput);
          this.timeoutInput = null;
        }
        //设置焦点元素
        this.$parent.setHistory();
      }

      //这里的删除新增元素，主要是用于全选之后在删除
      if (e.keyCode == '8' || e.keyCode == '46' || (e.ctrlKey == true && e.keyCode == 88)) { 
        let $parent = document.getElementById('rightSider');
        let $children = $parent.querySelector(':not(br)');
        if (!$children) { //删除只剩下一个元素时，让第一个元素始终为p
          let config = { handler: 'p', uuid: this.$utils.setUuid(), content: ''};
          let newEl = editorUtils.createDom(config);
          $parent.innerHTML = '';
          $parent.appendChild(newEl);
          editorUtils.comSetfocus(newEl, true);
        } 
      } 

      //搜索值存在时的mark处理
      let _this = this;
      let $tool = _this.$parent.$refs.tool;
      if ($tool.search.findValue) {
        // $tool.clearSearch();
        if ($tool.search.findValue) {
          $tool.handlerSearch(600);
        }
      }

      //根据键盘事件 设置 focusUuid的值
      if (e.keyCode == '8' || e.keyCode == '46' || (e.ctrlKey == true && e.keyCode == 88)) {
        let _this = this;
        _this.delTimeout && clearTimeout(_this.delTimeout);
        this.delTimeout = setTimeout(function() {
          let $target = editorUtils.comGetTargetCom();
          if (!$target) {
            return true;
          }
          _this.focusUuid = $target.getAttribute('data_id');
          _this.delTimeout = null;
        }, 200);
      } else if (e.keyCode == '38' || e.keyCode == '40' || e.keyCode == '13') {
        //up  down enter
        let $target = editorUtils.comGetTargetCom();
        if (!$target) {
          return true;
        }
        this.delTimeout && clearTimeout(this.delTimeout);
        _this.focusUuid = $target.getAttribute('data_id');
      }
    },
    handlerPaste(e) {
      let _this = this;
      //backSpace delete  ctr+x 
      let range = editorUtils.comGetCursor();
      range.deleteContents();
      let pastedText = null;
      let clipboardData = window.clipboardData && window.clipboardData.getData ? window.clipboardData : e.clipboardData;
      pastedText = clipboardData.getData('text/html');
      let $target = editorUtils.comGetTargetCom();
      if (clipboardData.files && clipboardData.files.length > 0) { //添加文件，主要是图片
        Array.from(clipboardData.files).forEach(file => {
          file.type.indexOf('image') >= 0 && this.uploadePasteImage(file);
        });
        e.preventDefault();
        return false;
      } else if (!pastedText) { //存文本的粘贴 利用浏览器粘贴
        pastedText = clipboardData.getData('text/plain');
        pastedText = pastedText.split('\n');
        if (pastedText.length > 1) {
          let $insertDom = editorUtils.appendText(clipboardData.getData('text/plain'), $target);
          editorUtils.comSetfocus($insertDom, true);
          e.preventDefault();
        }
        this.$parent.setHistory();
        return;
      }
      let $el = document.createElement('div');
      $el.innerHTML = pastedText.replace(/<br>/g, '\n'); 
      if ($el && $el.children.length > 0) {
        let excludeList = ['img', 'table', 'style', 'meta', 'script']; //排除的标签
        let list = [];
        excludeList.forEach(exc => {
          if (excludeList.indexOf($el.nodeName.toLowerCase()) >= 0) {
            $el.parentNode.removeChild($el);
          } else {
            $el.querySelectorAll(exc).forEach($exc => {
              $exc.parentNode.removeChild($exc);
            });
          }
        });
        debugger;
        if ($el.children.length == 1) {
          //如果只有一个子元素则直接拼接上去
          let textEle = document.createTextNode($el.innerText);
          range.insertNode(textEle);
          editorUtils.comSetfocus(textEle, true);
        } else if ($el.children.length > 1) {
          //如果有多个子元素，着添加多个组件，同时存在中间换行也要添加元素
          this.breakTag();
          list = this.pasteMoreDom($el);
        }
        let $target = editorUtils.comGetTargetCom() || document.getElementById('rightSider').children[0];
        if (list && list.length > 0) {
          let $insertDom = $target;
          list.forEach(item => {
            let newNode = editorUtils.createDom(item);
            editorUtils.insertAfter($insertDom, newNode);
            $insertDom = newNode;
          });
          this.focusUuid = list[list.length - 1].uuid;
          if ($target.nodeName.toLowerCase() == 'p' && $target.innerText.replace('\n', '') == '') {
            $target.remove();
          }
          editorUtils.comSetfocus($insertDom, true); 
          this.$parent.setHistory();
        }
        e.preventDefault();
        return false;
      } else {
        let $insertDom = editorUtils.appendText($el.innerText.trim(), $target);
        editorUtils.comSetfocus($insertDom, true);
        this.$parent.setHistory();
      }
      e.preventDefault();
    },
    pasteMoreDom($el) {
      let textList = ['p', 'h1', 'h2']; //需要的标签
      let ulList = ['ul', 'ol'];
      let $div = document.createElement('div');
      let list = [];
      Array.from($el.children).forEach((item, index) => {
        let nodeName = item.nodeName.toLowerCase();
        let content = item.innerText;
        if (textList.indexOf(nodeName) >= 0 || ulList.indexOf(nodeName) >= 0) {
          list = list.concat(this.dealMoreDom($div));
          $div = document.createElement('div');
        }

        if (textList.indexOf(nodeName) >= 0) {
          item.innerHTML = item.innerHTML.replace(/<br>/g, '\n'); 
          content = item.innerText;
          content.split('\n').forEach(cc => {
            list.push({ handler: nodeName, uuid: this.$utils.setUuid(), content: cc });
          });
        } else if (ulList.indexOf(nodeName) >= 0) {
          content = '';
          let $li = item.querySelectorAll('li');
          $li && $li.forEach(li => {
            content = content + '<li>' + li.innerText + '</li>';
          });
          list.push({ handler: nodeName, uuid: this.$utils.setUuid(), content: content });
        } else {
          $div.appendChild(item.cloneNode(true));
        }
      });
      list = list.concat(this.dealMoreDom($div));
      return list;
    },
    dealMoreDom(div) {
      let list = [];
      div.innerHTML = div.innerHTML.replace(/<br>/g, '\n'); 
      if (div.innerText) {
        let arr = div.innerText.split('\n') || [];
        arr.forEach(item => {
          list.push({ handler: 'p', uuid: this.$utils.setUuid(), content: item });
        });
      }
      return list;
    },
    breakTag() {
      let $target = editorUtils.comGetTargetCom();
      if (!$target || $target.innerText == '') {
        return;
      }
      let range = editorUtils.comGetCursor();
      range.deleteContents();
      range.insertNode(document.createElement('br'));
      let htmlList = $target.innerHTML.split('<br>');
      $target.innerHTML = htmlList[0];
      if (htmlList[1] != '') {
        let tag = TITLELIST.indexOf($target.nodeName.toLowerCase()) >= 0 ? (tag = $target.nodeName.toLowerCase()) : 'p';
        let config = { handler: tag, uuid: this.$utils.setUuid(), content: htmlList[1] || '' };
        let newNode = editorUtils.createDom(config);
        editorUtils.comInsertAfter($target, newNode);
      }
    },
    uploadePasteImage(file) { //上传通过粘贴添加的图片
      let uuid = this.$utils.setUuid();
      let formData = new FormData();
      formData.append('file', file);
      formData.append('param', 'file');
      formData.append('type', 'knowledge');
      formData.append('responseType', 'blob');
      this.$api.knowledge.knowledge.uploadFile(formData).then(res => {
        let config = {
          url: res.Return.url,
          title: res.Return.name,
          name: res.Return.name
        };
        this.addComponent({ uuid: uuid, handler: 'img', content: '', config: config});
      });
    },
    ulEnter(e, $target) { //ul li 对应的 enter事件
      if (e.keyCode == '13') {
        //enter
        let $li = editorUtils.comGetTargetCom('', ['li']);
        let textContent = $li ? $li.textContent : ''; //获取li的值
        if (textContent == '' && $target.lastChild == $li) {
          //回车判断li是否为空
          //为空时调用父组件，生成一个新的段落
          $li.remove();
          let uuid = this.$utils.setUuid();
          let config = { handler: 'p', uuid: uuid, content: '' };
          let $target = editorUtils.comGetTargetCom(document.querySelector(`ul[data_id="${this.uuid}"]`));
          let newNode = editorUtils.createDom(config);
          editorUtils.comInsertAfter($target, newNode);
          e.preventDefault();
        } else if (textContent == '') {
          e.preventDefault(); 
        }
      }
    },
    ulDelete(e, $target) { //ul ol 里面的li对应的删除事件 因为第一个li删除需要变成p标签
      let liTarget = editorUtils.comGetTargetCom(null, ['li']);
      let preEl = liTarget.previousSibling;
      let range = editorUtils.comGetCursor();
      if ((range.startContainer == liTarget || range.startContainer == liTarget.childNodes[0]) && range.startOffset == 0 && !preEl) { //位于开始位置 而且是第一个li元素
        let newNode = editorUtils.createDom({handler: 'p', content: liTarget.innerHTML, uuid: this.$utils.setUuid()});
        $target.parentNode.insertBefore(newNode, $target);
        editorUtils.comSetfocus(newNode);
        $target.removeChild(liTarget);
        $target.children.length == 0 && $target.remove();
        e.preventDefault();
      }
    },
    hEnter(e, $target) {
      let _this = this;
      if (e.keyCode == '13') { //enter
        let range = editorUtils.comGetCursor();
        range.deleteContents();
        range.insertNode(document.createElement('br')); 
        let htmlList = $target.innerHTML.split('<br>');
        $target.innerHTML = htmlList[0];
        let config = {handler: 'p', uuid: _this.$utils.setUuid(), content: htmlList[1] || ''};
        if (htmlList[1]) {
          config.handler = $target.nodeName.toLowerCase();
        }
        let newNode = editorUtils.createDom(config);
        editorUtils.comInsertAfter($target, newNode);
        e.preventDefault();
      }
      this.changeMenuList();
    },
    changeMenuList() {
      //获取所有组件数据
      let _this = this;
      let list = [];
      let uuidList = [];
      //克隆并且删除高亮数据
      let $target = document.getElementById('rightSider');
      $target = editorUtils.comRemoveMark($target);
      let arr = Array.from($target.children);
      arr.forEach(el => { //直接从页面获取元素
        let targetUuid = el.getAttribute('data_id') || '';
        if (uuidList.indexOf(targetUuid) >= 0) {
          return;
        }
        uuidList.push(targetUuid);
        let handler = el.nodeName.toLowerCase();
        if (el && el.nodeName != 'SECTION') {
          let content = el.innerHTML;
          TITLELIST.indexOf(handler) >= 0 ? (content = el.innerText) : ''; //目录标题的拿取text值
          ['ul', 'ol'].indexOf(handler) >= 0 && !el.querySelector('li') ? (content = '<li>' + el.innerHTML + '</li>') : ''; //有序列表无限列表需要判断是否有li
          list.push({uuid: targetUuid, handler: handler, content: content.replace(/&nbsp;/g, ' ') });
        } else if (el && el.nodeName == 'SECTION') { //针对特殊布局
          handler = el.getAttribute('type') || '';
          let config = {handler: handler, content: el.innerHTML, uuid: targetUuid, config: {} };
          let data = null; 
          let targetVue = el.__vue__ ? el.__vue__ : _this.$refs[targetUuid] ? _this.$refs[targetUuid][0] : this.refVue ? this.refVue[targetUuid] : null;
          targetVue && (data = targetVue.getContent());
          if (data) {
            config.config = Object.assign({}, data.config);
            data.content !== null && (config.content = data.content);
          }
          list.push(Object.assign({}, config));
        }
      });
      this.$emit('change-menuList', list);
      return list;
    },
    changeHoverClass(val) { //主要是用于改变聚焦框的位子
      let target = document.querySelectorAll(`#rightSider .itemInput`);
      target && target.forEach(item => this.$utils.toggleClass(item, 'itemInput', 'remove'));
      if (val) {
        target = document.querySelector(`#rightSider`);
        this.$utils.toggleClass(target, 'isInput', 'add');
        target = document.querySelector(`#rightSider [data_id="${val}"]`);
        this.$utils.toggleClass(target, 'itemInput', 'add');
      } else {
        target = document.querySelector(`#rightSider`);
        this.$utils.toggleClass(target, 'isInput', 'remove');
      }
    }
  },
  computed: {},
  watch: {
    focusUuid: {
      handler(newValue, oldValue) {
        let $new = document.querySelector(`#rightSider [data_id="${newValue}"]`);
        let $old = document.querySelector(`#rightSider [data_id="${oldValue}"]`);
        if ($new && TITLELIST.indexOf($new.nodeName.toLowerCase()) >= 0 || $old && TITLELIST.indexOf($old.nodeName.toLowerCase()) >= 0) {
          this.changeMenuList();
        }
        this.$emit('change-focue', newValue);
        this.changeHoverClass(newValue);
      }
    },
    dataList: {
      handler(newValue, oldValue) {
        let comList = [];
        if (newValue && newValue.length > 0) {
          comList = this.$utils.deepClone(newValue); //中途修改之后更改的数据
        } else {
          comList = [];
        }
        let $insertDom = document.querySelector(`#rightSider`);
        //  let $insertDom ='';
        let list = ['p', 'h1', 'h2', 'ul', 'ol'];
        this.refVue = this.refVue || {};
      
        for (let key in this.refVue) {
          this.refVue[key].$destroy();
        }
        this.refVue = {};
        if ($insertDom) {
          $insertDom.innerHTML = '';
          comList.forEach(item => {
            if (list.indexOf(item) >= 0) {
              let newNode = editorUtils.createDom(item);
              $insertDom.appendChild(newNode);
            } else {
              let itemVue = this.addItem(item, $insertDom, true);
              this.refVue[item.uuid] = itemVue.$children[0];
            }
          });
          //每次更新数据时需要判断是否需要进行搜索 mark 标识的
          let $tool = this.$parent.$refs.tool;
          if ($tool.search.findValue) {
            // $tool.clearSearch();
            if ($tool.search.findValue) {
              $tool.handlerSearch(600);
            }
          }
        } else {
          this.componentList = comList;
        }
        document.querySelector('.scrollContian') && (this.scrollTop = document.querySelector('.scrollContian').scrollTop);
      },
      immediate: true,
      deep: true
    },
    historyRange: {
      handler(historyRange) {
        if (historyRange) {
        //历史记录对应的焦点元素
          let sel = null;
          if (window.getSelection) {
            sel = window.getSelection();
          } else if (document.selection) {
            sel = document.selection.createRange();
          }
          sel.removeAllRanges();
          let range = document.createRange();
          range.collapse();
          let startContainer = historyRange.startContainer.childNodes;
          let node = startContainer.length > 0 ? startContainer[startContainer.length - 1] : null;
          if (document.getElementById('rightSider').contains(node)) {
            range.setStart(node, historyRange.startOffset);
            sel.addRange(range);
          } else {
            node = document.querySelector('[data_id="' + historyRange.uuid + '"]');
            node && (node = childParent(node, true));
            if (node) {
              range.setStart(node, node.nodeValue ? node.nodeValue.length : 0);
              sel.addRange(range);
            }
          }
          if (node) {
            let $target = editorUtils.comGetTargetCom(node);
            $target && $target.click();
          }
        } else {
          document.getElementById('rightSider').children[0].click();
        }
      }
    }
  }
};

function childParent(node, isLast) {
  if (node.nodeType == 3) {
    return node;
  } else if (node.childNodes.length > 0) {
    node = isLast ? node.childNodes[node.childNodes.length - 1] : node.childNodes[0];
    return childParent(node);
  } else {
    return node;
  }
}
</script>
<style lang="less" scoped>
.edit-component-wrap {
  /deep/ i {
   font-style: italic; // 解决全局样式把i标签默认倾斜样式去掉，导致知识库设置i标签倾斜样式无效的问题
 }
}
</style>

