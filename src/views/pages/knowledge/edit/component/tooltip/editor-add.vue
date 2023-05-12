<template>
  <div
    v-click-outside:false="onClickOutside"
    v-click-outside:false.mousedown="onClickOutside" 
    v-click-outside:false.touchstart="onClickOutside" 
    class="editor-add bg-op border-color" 
    :style="getStyle"
  >
    <span class="span-add" :title="$t('dialog.title.addtarget', {target: $t('page.component')})" @mousedown.prevent="isShow=!isShow"></span>
    <div class="contain bg-op border-color bottom-shadow" :class="{'show':isShow}"> 
      <template v-for="(tool,index) in dataList">
        <Tooltip
          :key="index"
          :content="tool.title"
          placement="top"
          :disabled="tool.disabled"
          theme="light"
          :transfer="true"
        >
          <span :class="[tool.icon,{'active':tool.isActive}]" class="tool tool-icon" @mousedown.prevent="addFn(tool)"></span>
        </Tooltip>
      </template>
    </div>
  </div>
</template>
<script>
import { directive as ClickOutside } from '@/resources/directives/v-click-outside-x.js';
import editorUtils from '@/views/pages/knowledge/edit/component/common/editor-util.js';
export default {
  name: '',
  components: {},
  directives: { ClickOutside },
  mixins: [],
  model: {
    prop: 'isShow',
    event: 'change'
  },
  props: {
    focusUuid: String,
    config: Object
  },
  data() {
    let _this = this;
    return {
      isShow: false,
      dataList: [{
        type: 'ul',
        title: this.$t('dialog.title.addtarget', { target: this.$t('page.unorderedlist') }),
        icon: 'tsfont-list'
      }, {
        type: 'ol',
        title: this.$t('dialog.title.addtarget', { target: this.$t('page.orderedlist') }),
        icon: 'tsfont-orderlist'
      }, {
        type: 'img',
        title: this.$t('dialog.title.addtarget', { target: this.$t('page.image') }),
        icon: 'tsfont-addimg'
      }, {
        type: 'table',
        title: this.$t('dialog.title.addtarget', { target: this.$t('page.table') }),
        icon: 'tsfont-chart-table'
      }, {
        type: 'code',
        title: this.$t('dialog.title.addtarget', { target: this.$t('page.code') }),
        icon: 'tsfont-code'
      }],
      range: null,
      showDialog: false
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.setElStyle();
  },
  beforeUpdate() {},
  updated() {
    this.setElStyle();
  },
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    onClickOutside(event) { //点击外部，dropdown消失
      if (this.isShow) {
        const $el = this.$el;
        if ($el === event.target || $el.contains(event.target)) {
          return;
        }
        this.isShow = false;
      } 
    },
    addFn(tool) {
      let $target = document.querySelector(`#rightSider [data_id="${this.focusUuid}"]`);
      let uuid = this.$utils.setUuid();
      if (tool.type == 'img') {
        this.$parent.uploadImg();
      } else if (tool.type == 'ul' || tool.type == 'ol') {
        let newNode = editorUtils.createDom({uuid: uuid, handler: tool.type, content: '<li></li>', config: {}});
        editorUtils.comInsertAfter($target, newNode);
        $target.nodeName == 'P' && $target.innerText.replace('\n', '') == '' && $target.remove();
      } else {
        this.$parent.addComponent({uuid: uuid, handler: tool.type, content: '', config: {}});
      }
      this.isShow = false;
    },
    setElStyle() {
      let $target = document.querySelector(`[data_id="${this.focusUuid}"]`);
      if ($target && this.$el) {
        let $scroll = document.querySelector('.scrollContian.main');
        let cliento = $scroll.getBoundingClientRect();
        let clientr = $target.getBoundingClientRect();
        this.$el.style.top = (clientr.bottom - cliento.top + $scroll.scrollTop - clientr.height) + 'px';
      } 
    }
  },
  filter: {},
  computed: {
    getStyle() {
      let result = {};
      if (this.config) {
        result.top = this.config.top + 'px';
      }
      return result;
    }
  },
  watch: {
    focusUuid: {
      handler(val) {
        if (val) {
          //设置工具栏出现的位置
          this.setElStyle();
        }
        this.isShow = false;
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.editor-add{
  position: absolute;
  z-index: 3;
  border-radius: 2px;
  min-height: 23px;
  top:0px;
  left: 8px;

  .span-add{
    // padding:2px 6px;
    width: 20px;
    height: 20px;
    cursor: pointer;
    position: relative;
    font-size: 20px;
    display: block;
    float: left;
    opacity: 0.8;
    &::before{
     content: '';
    width: 2px;
    height: 10px;
    background: #fff;
    left: 50%;
    top: 50%;
    position: absolute;
    transform: translate(-50%, -50%);
    }
    &::after{
     content: '';
     width: 10px;
     height: 2px;
     background: #fff;
      left: 50%;
    top: 50%;
    position: absolute;
    transform: translate(-50%, -50%);
    }
  }
  .contain{
    display: none;
    left:0px;
    &.show{
      display: block;
      z-index: 3;
      border: 1px solid;
      float: left;
      position: relative;
      top: 50%;
      margin-left: 3px;
      transform: translate(0, -25%);
    }
    .tool{
      display: inline-block;
      cursor: pointer;
      line-height: 2.2;
      padding: 0px 6px;
      margin: 0px 3px;
      &.tool-icon{
        font-size:16px;
      }
    }
  }

}
</style>
