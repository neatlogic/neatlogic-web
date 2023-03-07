
<template>
  <div class="edit-code">
    <div
      ref="codeMain"
      class="bg-code radius-sm padding codeMain"
      :contenteditable="!disabled"
      :style="getStyle"
      @keydown="handlerKeydown" 
      @keyup="handlerKeyup" 
      @paste="handlerPaste"
      @blur="valid"
    >
    </div> 
    <div
      ref="placeholder"
      class="empty-placeholder padding"
      :data-placeholder="placeholder"
      style="display:none"
      @click="handlerClickempty"
    ></div>
    <transition name="fade">
      <span
        v-if="validMesage != ''"
        class="form-error-tip"
        v-html="validMesage"
      ></span>
    </transition>
  </div>
</template>
<script>
import editorUtils from './editor-util.js';
export default {
  name: '',
  components: {
  },
  filters: {
  },
  props: {
    dataList: {
      type: Array,
      default: () => []
    },
    isRequired: {
      type: Boolean,
      default: true
    },
    minHeight: {
      type: Number,
      default: 220
    },
    maxHeight: {
      type: Number
    },
    placeholder: {
      type: String,
      default() {
        return this.$t('form.validate.pleaseinputscriptcontent');
      }
    },
    width: {
      type: [Number, String],
      default: '100%'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      lineList: [],
      newList: [],
      validMesage: ''
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.$nextTick(() => {
      this.initHtml();
    });
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    initHtml() {
      if (!this.$refs.codeMain) {
        return;
      }
      if (this.dataList && this.dataList.length > 0) {
        this.lineList = this.$utils.deepClone(this.dataList);
      } else {
        this.lineList = [{ content: ''}];
      }
      let htmlStr = '';
      this.lineList.forEach(item => {
        htmlStr = htmlStr + `<div class="${item.riskCodeLevel || ''} text-white">${item.content || ''}</div>`;
      });
      this.$refs.codeMain.innerHTML = htmlStr;
      let content = this.$refs.codeMain.innerText.replace(/\n/gi, '');
      this.$refs.placeholder.style.display = content.trim() ? 'none' : 'block';
    },
    handlerKeydown(e) { //最后一个元素不允许删除
      let $target = editorUtils.comGetTargetCom() || null;
      if (e.keyCode == '8' || e.keyCode == '46' || (e.ctrlKey == true && e.keyCode == 88)) { //删除组件操作  backSpace delete  ctr+x
        let $parent = this.$refs.codeMain;
        if ($parent.children.length == 1) { //删除只剩下一个元素时，让第一个元素始终为div
          let range = editorUtils.comGetCursor();
          if (range.collapsed) { //起点和终点相同
            if (($target && (e.keyCode == '8' || e.keyCode == '46') && ($target.innerHTML == '<br>' || $target.innerHTML == '' || $target.innerText.replace('\n', '') == ''))) {
              e.preventDefault();
            }
          }
        }
      } else if (e.keyCode == '13') { //enter  清除对应的class样式
        setTimeout(($target) => {
          let newEl = $target.nextSibling;
          newEl.setAttribute('class', 'text-white');
        }, 1, $target);
      }
      this.$refs.placeholder.style.display = 'none';//对placeholder隐藏
    },
    handlerKeyup(e) { //对placeholder的显示判断
      let _this = this;
      _this.setTimePlaceholder && clearTimeout(_this.setTimePlaceholder);
      this.setTimePlaceholder = setTimeout(() => {
        let $target = _this.$refs.codeMain;
        if ($target.querySelector('div') <= 0) {
          $target.innerHTML = `<div class="text-white"></div>`;
        }
        let content = _this.$refs.codeMain.innerText.replace(/\n/gi, '');
        _this.$refs.placeholder.style.display = content.trim() ? 'none' : 'block';
        _this.setTimePlaceholder = null;
      }, 100);
    },
    handlerPaste(e) { //对粘贴过来的元素进行处理
      let _this = this;
      let range = editorUtils.comGetCursor();
      range.deleteContents();
      let pastedText = null;
      let clipboardData = window.clipboardData && window.clipboardData.getData ? window.clipboardData : e.clipboardData;
     
      pastedText = clipboardData.getData('text/plain');
      let $target = editorUtils.comGetTargetCom();
      if (pastedText) { //存文本的粘贴 利用浏览器粘贴
        pastedText = clipboardData.getData('text/plain');
        pastedText = pastedText.split('\n');
        if (pastedText.length > 1) {
          let $insertDom = $target;
          pastedText.forEach(item => {
            let newNode = editorUtils.createDom({ handler: 'div', uuid: this.$utils.setUuid(), content: item });
            editorUtils.insertAfter($insertDom, newNode);
            $insertDom = newNode;
          });
          $target.innerText.replace('\n', '') == '' && $target.remove();
          editorUtils.comSetfocus($insertDom, true);
        } else if (pastedText.length == 1) {
          let textEle = document.createTextNode(pastedText[0]);
          range.insertNode(textEle);
          editorUtils.comSetfocus(textEle, true);
        }
        e.preventDefault();
        return;
      }
    },
    handlerClickempty() { //因为层级关系导致点击之后文本输入失去焦点
      this.$refs.codeMain.focus();
    },
    getValue() {
      let list = [];
      let $target = this.$refs.codeMain;
      $target.children.forEach(el => { //直接从页面获取元素
        let content = el.innerText;
        list.push({ content: content });
      });
      return list;
    },
    valid() {
      this.newList = this.getValue();
      let isValid = true;
      let content = this.$refs.codeMain.innerText.replace(/\n/gi, '');
      if (content.trim()) {
        this.validMesage = '';
        isValid = true;
      } else {
        this.validMesage = this.$t('form.validate.pleaseinputscriptcontent');
        isValid = false;
      }
      return isValid;
    }
  },
  computed: {
    getStyle() {
      let styleObj = {
        minHeight: this.minHeight + 'px',
        width: this.width
      };
      if (this.maxHeight) {
        styleObj.maxHeight = this.maxHeight + 'px';
      }
      return styleObj;
    }
  },
  watch: {
    dataList: {
      handler(val) {
        this.initHtml();
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/theme.less';
@lineWidth:50px;
@padding-left:16px;
  .edit-code{
    position: relative;
    /deep/.codeMain{
      white-space:pre-wrap;
      overflow: auto;
      counter-reset:section;
      padding-left: @lineWidth;
      position: relative;
      >div{
        min-height: 18px;
        &::before{
          text-align: center;
          width:calc(@lineWidth - @padding-left);
          content:counter(section);
          counter-increment:section;
          position: absolute;
          left: @padding-left;
          color: @default-tip;
        }
      }
    }
    .empty-placeholder{
      position:absolute;
      padding-left: @lineWidth;
      top:0px;
      &::before{
       content:attr(data-placeholder)
      }
    }
    /deep/ .critical{
      background: fade(@error-color, 20%);
    }
    /deep/ .warning{
      background: fade(@warning-color, 20%);
    }
  }
</style>
