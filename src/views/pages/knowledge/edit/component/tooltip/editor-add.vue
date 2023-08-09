<template>
  <div
    v-click-outside:false="onClickOutside"
    v-click-outside:false.mousedown="onClickOutside" 
    v-click-outside:false.touchstart="onClickOutside" 
    class="editor-add bg-op border-color" 
    :style="getStyle"
  >
    <div @click.stop>
      <Dropdown
        transfer
        trigger="click"
        :visible="isShow"
      >
        <div class="span-add" :title="$t('dialog.title.addtarget', {target: $t('page.component')})">
          <span class="tsfont-plus"></span>
        </div>
        <template v-if="showDialog">
          <DropdownMenu slot="list">
            <template v-for="(tool,index) in dataList">
              <DropdownItem v-if="tool.type !='table'" :key="index" @click.native="addFn(tool)">
                <div :class="[tool.icon,{'active':tool.isActive}]" class="tool tool-icon">{{ tool.title }}</div>
              </DropdownItem>
              <Dropdown
                v-else
                :key="index"
                placement="right"
                transfer
                transfer-class-name="table-select"
                @click.native.stop
              >
                <DropdownItem>
                  <span :class="[tool.icon]">{{ tool.title }}</span>
                  <Icon type="ios-arrow-forward"></Icon>
                </DropdownItem>
                <DropdownMenu slot="list">
                  <DropdownItem>
                    <div>
                      <div class="tooltip-title">
                        <div v-if="tableRow">{{ tableRow }}x{{ tableCol }}</div>
                      </div>
                      <div class="table-grid" @click="selectTable()">
                        <div v-for="row in num" :key="row" class="row">
                          <div
                            v-for="col in num"
                            :key="col"
                            class="cell bg-tip-grey"
                            :class="{'bg-info-grey':tableRow && row <= tableRow && col <= tableCol }"
                            @mouseover="drag(row, col)"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </template>
          </DropdownMenu>
        </template>
      </Dropdown>
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
    return {
      isShow: false,
      dataList: [{
        type: 'ul',
        title: this.$t('page.unorderedlist'),
        icon: 'tsfont-list'
      }, {
        type: 'ol',
        title: this.$t('page.orderedlist'),
        icon: 'tsfont-orderlist'
      }, {
        type: 'img',
        title: this.$t('page.image'),
        icon: 'tsfont-addimg'
      }, {
        type: 'code',
        title: this.$t('page.code'),
        icon: 'tsfont-code'
      },
      {
        type: 'table',
        title: this.$t('page.table'),
        icon: 'tsfont-chart-table'
      },
      {
        type: 'mardown',
        title: 'markdown',
        icon: 'tsfont-memcached'
      }],
      range: null,
      showDialog: true,
      tableRow: 0,
      tableCol: 0,
      num: 10
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
      if (tool.type === 'table') {
        return;
      }
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
    },
    drag(row, col) {
      this.$set(this, 'tableRow', row);
      this.$set(this, 'tableCol', col);
    },
    selectTable() {
      this.$parent.addComponent({uuid: this.$utils.setUuid(), handler: 'table', content: '', config: {row: this.tableRow, col: this.tableCol}});
      this.$set(this, 'tableRow', null);
      this.$set(this, 'tableCol', null);
      this.showDialog = false;
      this.$nextTick(() => {
        this.showDialog = true;
      });
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
  min-height: 24px;
  top:0px;
  left: 8px;
  .span-add{
    width: 20px;
    height: 20px;
    line-height: 20px;
    text-align: center;
    cursor: pointer;
    // position: relative;
    font-size: 16px;
    display: block;
    // float: left;
    opacity: 0.8;
    color: #fff;
  }
}
.tooltip-title {
  display: flex;
  justify-content: space-between;
}
.table-grid {
  display: grid;
  gap: 2px;
  .row {
    display: grid;
    grid-template-columns: repeat(10,auto);
    gap: 2px;
  }
  .cell {
    width: 14px;
    height: 14px;
  }
}
.table-select {
  .ivu-dropdown-item:hover {
      background-color: transparent !important;
  }
}
</style>
