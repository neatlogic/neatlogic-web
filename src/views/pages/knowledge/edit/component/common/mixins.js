import editorUtils from '@/views/pages/knowledge/edit/component/common/editor-util.js';
import { $t } from '@/resources/init.js';
export default {
  inject: {
    $fn: {
      default: {}
    },
    $parentTop: {
      default: {}
    }
  },
  props: {
    changeFocue: String
  },
  mounted() {
    this.$nextTick(function() {
      if (this.uuid == this.changeFocue) {
        this.$el && this.$el.click();
        this.$refs.editorSpan && this.$refs.editorSpan.focus();
        this.$parentTop.changeFocue = '';
      }
    });
  },
  methods: {
    removeItem() {
      let isLast = false;
      let $focus = this.$el ? this.$el.previousSibling || this.$el.nextSibling : null;
      this.$el && this.$el.previousSibling && (isLast = true);
      if ($focus && $focus.nodeName.toLowerCase() == 'section') {
        $focus.click();
      } else if ($focus) {
        editorUtils.comSetfocus($focus, isLast);
      }
      this.$fn.setHistory();
      this.$parentTop.removeComponent(this);
      this.$destroy();
      this.$el && this.$el.remove();
    },
    comClick() {
      this.$parentTop.focusUuid = this.uuid;
      this.$fn.changeToolBtn({
        toolAccessList: ['file', 'search', 'tag', 'repeal', 'recover'],
        toolActiveList: []
      });
    },
    comFocus(component, last) { //设置元素获取焦点
      let $focus = document.querySelector(`${component.handler}[data_id="${component.uuid}"]`);
      $focus.focus();
      if (last) {
        if (window.getSelection) { //ie11 10 9 ff safari
          let range = window.getSelection(); //创建range
          range.selectAllChildren($focus); //range 选择obj下所有子内容
          range.collapseToEnd(); //光标移至最后
        } else if (document.selection) { //ie10 9 8 7 6 5
          let range = document.selection.createRange(); //创建选择对象
          range.moveToElementText($focus); //range定位到obj
          range.collapse(false); //光标移至最后
          range.select();
        }
      }
    },
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
    comSetfocus($target, islast) { //设置元素获取焦点
      $target = $target || document.querySelector(`[data_id="${this.focusUuid}"]`);
      if ($target) {
        let sel = null;
        if (window.getSelection) { 
          sel = window.getSelection();
        } else if (document.selection) { 
          sel = document.selection.createRange();
        }
        document.getElementById('rightSider').focus();
        let range = document.createRange();
        range.selectNode($target);
        range.selectNodeContents($target);
        sel.removeAllRanges();
        sel.addRange(range);
        islast ? range.collapse() : sel.collapseToStart();
      }
    },
    complexComHandlerKeydown(e) {
      if (e.keyCode == '8' || e.keyCode == '46') { //删除操作
        this.removeItem();
      } else if (e.keyCode == '13') { //新增节点
        //enter
        let config = { handler: 'p', uuid: this.$utils.setUuid(), content: ''};
        let newEl = editorUtils.createDom(config);
        editorUtils.comInsertAfter(this.$el, newEl);
        editorUtils.comSetfocus(newEl, true);
      } else if (e.keyCode == '38' || e.keyCode == '40' || e.keyCode == '39' || e.keyCode == '37') { //上下左右
        return true;
      } 
      e.target.innerHTML = '';
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  },
  watch: {},
  computed: {
    baseLanguageT() {
      // 解决edit-component组件，使用Vue.extend注册组件，拿不到vue实例的this.$t问题
      return (value, targetObj = {}) => {
        return $t(value, targetObj);
      };
    }
  }
};
