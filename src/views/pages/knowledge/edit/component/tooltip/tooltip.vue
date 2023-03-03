<template>
  <div
    v-click-outside:false="onClickOutside"
    v-click-outside:false.mousedown="onClickOutside" 
    v-click-outside:false.touchstart="onClickOutside" 
    class="editor-tooltip" 
    :style="getStyle"
  >
    <template v-for="(tool,index) in currentDateList">
      <!-- icon类型 -->
      <span
        v-if="tool.type=='icon'"
        :key="index"
        :class="[tool.icon,{'active':tool.isActive}]"
        :title="tool.title"
        class="tool tool-icon"
        @mousedown="handlerClick(tool)"
      ></span>
      <!-- 文案类型 -->
      <span
        v-else-if="tool.type=='title'"
        :key="index"
        :title="tool.title"
        :class="[{'active':tool.isActive}]"
        class="tool "
        @mousedown="handlerClick(tool)"
      >{{ tool.title }}</span>
      <!-- 分割线 -->
      <span
        v-else-if="tool.type=='line'"
        :key="index"
        :title="tool.title"
        class="tool tool-line"
      ></span>
    </template>
    <aDialog :showDialog.sync="showDialog" @on-ok="okDialog" @on-close="closeDialog"></aDialog>
  </div>
</template>
<script>
import { directive as ClickOutside } from '@/resources/directives/v-click-outside-x.js';
import aDialog from './a-dialog.vue';
import toolMixins from '../common/toolMixins.js';
export default {
  name: '',
  components: {aDialog},
  directives: { ClickOutside },
  mixins: [toolMixins],
  model: {
    prop: 'isShow',
    event: 'change'
  },
  props: {
    dataList: Array,
    top: Number,
    left: Number,
    isShow: Boolean,
    focusUuid: String
  },
  data() {
    let _this = this;
    return {
      currentDateList: [],
      range: null,
      showDialog: false
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.changeLeft();
  },
  beforeUpdate() {
    this.changeLeft();
  },
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    handlerClick(tool) {
      this.comChangeType(tool);
      this.$emit('change', false);
    },
    comGetCursor() {
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
    onClickOutside(event) { //点击外部，dropdown消失
      if (this.isShow) {
        const $el = this.$el;
        if ($el === event.target || $el.contains(event.target)) {
          return;
        }
        this.$emit('change', false);
      } 
    },
    addHref(range) {
       
    },
    changeLeft() {
      // let range = _this.comGetCursor();
      // if (range.startContainer) {
      //   if (range.getBoundingClientRect) {
      //     let cliento = document.getElementById('rightSider').getBoundingClientRect();
      //     let clientr = range.getBoundingClientRect();
      //     config.top = clientr.top - cliento.top;
      //     config.left = 0;
      //   } else {
      //     let cliento = document.getElementById('rightSider').getBoundingClientRect();
      //     let clients = null;
      //     if (range.startContainer.nodeType == 3) {
      //       clients = range.startContainer.parentNode.getBoundingClientRect();
      //     } else {
      //       clients = range.startContainer.getBoundingClientRect();
      //     }
      //     config.top = clients.top - cliento.top;
      //     config.left = (range.startOffset * 10 + clients.left) - cliento.left;
      //   }
      // }
    }
  },
  filter: {},
  computed: {
    getStyle() {
      let _this = this;
      return {
        top: _this.top + 'px',
        left: _this.left + 'px'
      };
    }
  },
  watch: {
    dataList: {
      handler() {
        this.currentDateList = this.$utils.deepClone(this.dataList);
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.editor-tooltip{
  position: absolute;
  z-index: 3;
  background: #fff;
  border: 1px solid #ddd;
  .tool{
    display: inline-block;
    cursor: pointer;
    line-height: 2.2;
    padding: 0px 4px;
    margin: 0px 4px;
    &.active{
      color:red;
    }
    &.tool-icon{
      font-size:16px;
    }
    &.tool-line{
      position: relative;
      &::before{
        content: '';
        position: absolute;
        top: 2px;
        bottom: 2px;
        right: 0;
        width: 1px;
        background: #ddd;
        opacity: 0.8;
      }
    }
  }
}
</style>
