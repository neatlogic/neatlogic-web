
<template>
  <thead>
    <tr>
      <th v-if="columnList && columnList.length > 0" style="z-index: 1000; padding: 0;" :style="fixLeft">
        <div class="corner"></div>
      </th>
      <th v-if="canDrag" class="drag-container">
        <slot name="drag-title"></slot>
      </th>
      <th
        v-for="(hitem, hindex) in list"
        :key="hindex"
        :data-key="hitem.key"
        :class="[`th-${hitem.key}`, getReadonlyTheadBgClass, hitem.className]"
        :style="setTh()"
      >
        <template v-if="hitem.key == 'expander'">
          <i class="text-href" :class="getAllExpanderClass" @click.stop="toggleExpandAll"></i>
        </template>
        <template v-if="hitem.key == 'selection'">
          <div
            v-if="!isMain && multiple"
            class="radius-mi"
            :class="getAllsection"
            @click.stop="selectAll()"
          ></div>
        </template>
        <template v-else-if="hitem.key == 'action'">
          <div>{{ hitem.title }}</div>
        </template>
        <template v-else>
          <slot :name="'th-'+hitem.key" :row="hitem">
            <div :key="hitem.key">
              <span v-if="hitem.headerIcon" class="text-action" @click="headerTitleOperation()">
                <!-- 表头添加点击事件和刷新icon -->
                {{ hitem.title }}
                <i :class="hitem.headerIcon"></i>
              </span>
              <span
                v-else
                :style="hitem.style"
                :class="{'require-label':hitem.isRequired}"
                @click.stop="clickHeader(hitem)"
              >{{ hitem.title }}</span>
              <Poptip v-if="hitem.tooltip" transfer trigger="hover">
                <i class="tsfont-info-o text-action"></i>
                <div slot="content" v-html="hitem.tooltip"></div>
              </Poptip>
              <span v-if="getSort(hitem)" :class="setSortclass(hitem,sortConfig)" @click="switchStatus(hitem)"></span>
            </div>
          </slot>
          <div
            v-if="canResize"
            class="btn-resize"
            @mousedown="handleMouseDown(hitem, $event)"
            @mousemove="handleMouseMove(hitem, $event)"
          ></div>
        </template>
      </th>
    </tr>
  </thead>
</template>
<script>
export default {
  name: 'THead',
  components: {
  },
  filters: {
  },
  props: {
    columnList: Array,
    list: Array,
    sortList: [Boolean, Array],
    canResize: Boolean,
    resizeKey: String,
    canDrag: Boolean,
    tbodyList: Array,
    selectList: Array,
    sortSetting: Object,
    sortConfig: Object,
    keyName: {
      type: String
    },    
    theme: Object, //自定义主题
    isMain: {
      type: Boolean,
      default: false      
    },
    disabled: {
      //true  false  默认为false
      type: Boolean,
      default: false
    },
    multiple: {//是否支持选中多行
      type: Boolean,
      default: true        
    },
    readonlyTextIsHighlight: { // 只读模式下，表格表头背景是否需要高亮
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      scrollLeft: 0,
      draggingColumn: null,
      dragging: false,
      dragState: {}
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {   
  },
  beforeUpdate() {},
  updated() {
  },
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    headerTitleOperation() {
      // 点击表头文字分发点击事件
      this.$emit('headerTitleOperation');
    },
    clickHeader(header) {
      if (header.click && typeof header.click == 'function') {
        header.click(header);
      }
    },
    toggleExpandAll() {
      this.$emit('toggleExpandAll');
    },
    selectAll() {
      if (this.disabled) {
        return;
      }
      this.$emit('selectAll');
    },
    setTh() {
      if (this.theme) {
        let table = this.theme.TsTable;
        if (table) {
          let themeConfig = this.$utils.mergeObj(this.theme.common, table.th);
          return themeConfig;
        }
      }
    },
    checkIsselected(item, index) {
      //检查当前项是否选中,返回：false没有，1～n:选中列表的数组第几个
      let isSelected = false;
      let key = this.keyName || (index + 1);
      if (item && key) {
        if (this.selectList.length > 0) {
          let itemval = item[this.keyName] || index;
          if (this.selectList.indexOf(itemval) > -1) {
            isSelected = this.selectList.indexOf(itemval) + 1;
          }
        }
      }
      return isSelected;
    },
    switchStatus(item) {
      this.$emit('switchStatus', item);
    },
    handleMouseDown(column, event) {
      if (this.draggingColumn) {
        this.dragging = true;

        const table = this.$parent;
        const tableEl = table.$el;
        const tableLeft = tableEl.getBoundingClientRect().left;
        const columnEl = this.$el.querySelector(`.th-${column.key}`);
        const columnRect = columnEl.getBoundingClientRect();
        const minLeft = columnRect.left - tableLeft + 30;

        table.showResizeLine = true;

        this.dragState = {
          startMouseLeft: event.clientX,
          startLeft: columnRect.right - tableLeft,
          startColumnLeft: columnRect.left - tableLeft,
          tableLeft
        };

        const resizeProxy = table.$refs.resizeLine;
        resizeProxy.style.left = this.dragState.startLeft + 'px';

        document.onselectstart = function() {
          return false;
        };
        document.ondragstart = function() {
          return false;
        };

        const handleMouseMove = event => {
          const deltaLeft = event.clientX - this.dragState.startMouseLeft;
          const proxyLeft = this.dragState.startLeft + deltaLeft;

          resizeProxy.style.left = Math.max(minLeft, proxyLeft) + 'px';
        };

        const handleMouseUp = () => {
          if (this.dragging) {
            const { startColumnLeft, startLeft } = this.dragState;

            const finalLeft = parseInt(resizeProxy.style.left, 10);
            const columnWidth = finalLeft - startColumnLeft;
            const _column = table.colsList.find(item => item.key === column.key + 'Width');
            const oldWidth = startLeft - startColumnLeft;
            if (_column) {
              this.$set(_column, 'width', columnWidth);
              this.$set(_column, '_isResize', true);
              const tableWidth = table.$refs.tstable.getBoundingClientRect().width;
              const headers = table.$refs.tstable.querySelectorAll('th');
              headers.forEach((th, index) => {
                // 获取每个表头单元格的宽度
                const width = th.offsetWidth;
                let findTh = table.colsList.find(c => c.key.includes(th.dataset['key']));
                if (findTh && !findTh.width) {
                  this.$set(findTh, 'width', width);
                }
              });
              let width = 0;
              table.colsList.forEach(item => {
                if (item.width) {
                  width += item.width;
                }
              });
              if (width < tableWidth) {
                width = tableWidth + (_column.width - oldWidth);
              }
              this.$set(table, 'totalWidth', width);
              if (this.resizeKey) {
                localStorage.setItem('tstable_' + this.resizeKey, JSON.stringify(table.colsList));
              }
            }
            table.$emit('on-column-width-resize', _column.width, oldWidth, column, event);
            this.dragging = false;
            this.draggingColumn = null;
            this.dragState = {};

            table.showResizeLine = false;
          }

          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
          document.onselectstart = null;
          document.ondragstart = null;
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      }
    },
    handleMouseMove(column, event) {
      let target = event.target;

      while (target && target.tagName !== 'TH') {
        target = target.parentNode;
      }

      if (!column || !this.canResize) return;

      if (!this.dragging) {
        let rect = target.getBoundingClientRect();

        if (rect.width > 12 && rect.right - event.pageX < 8) {
          this.draggingColumn = column;
        } else if (!this.dragging) {
          this.draggingColumn = null;
        }
      }
    }
  },
  computed: {
    fixLeft() {
      let translateStyle = '';
      if (this.scrollLeft && this.scrollLeft > 0) {
        translateStyle = 'translate3d(' + (this.scrollLeft % 2 == 0 ? Math.floor(this.scrollLeft) : Math.floor(this.scrollLeft) - 1) + 'px,0,0)';
      } else {
        translateStyle = 'none';
      }
      return {
        transform: translateStyle
      };
    },
    getAllExpanderClass() {
      let dataList = this.tbodyList;
      let hasUnExpanded = false;
      let hasExpander = false;
      if (dataList && dataList.length > 0) {
        dataList.forEach(element => {
          if (element['#expander'] != false) {
            hasExpander = true;
            if (!element['_expand']) {
              hasUnExpanded = true;
              return false;
            }
          }
        });
      }
      if (hasExpander) {
        if (hasUnExpanded) {
          return 'tsfont-plus-square';
        } else {
          return 'tsfont-minus-square';
        }
      } else {
        return '';
      }
    },
    getAllsection() {
      let allsection = 'tstable-selection';
      let _this = this;
      let dataList = this.tbodyList;
      if (dataList && dataList.length > 0) {
        let alllength = dataList.length;
        let selectedlength = 0;
        dataList.forEach((d, dindex) => {
          if (_this.checkIsselected(d, dindex)) {
            selectedlength = selectedlength + 1;
          }
        });
        if (selectedlength == alllength) {
          allsection += ' selected';
        } else if (selectedlength == 0) {
          allsection += '';
        } else {
          allsection += ' some';
        }
        if (this.disabled) {
          allsection += ' disabled';
        }
      } else {
        allsection += ' disabled';
      }
      return allsection;
    },
    getSort() {
      return function(item) {
        let isSort = false;
        if (this.sortList && this.sortList.length > 0) {
          //排序的可能['a','b'],或者[{a:'ASC'},{b:'DESC'}]
          let isObj = (typeof this.sortList[0] == 'object');
          if (isObj) {
            let sortkeyList = this.sortList.map((s) => {
              return Object.keys(s)[0];
            });
            if (sortkeyList.indexOf(item.key) > -1) {
              isSort = true;
            }
          } else {
            if (this.sortList.indexOf(item.key) > -1) {
              isSort = true;
            }
          }
        }
        return isSort;
      };
    },
    setSortclass() {
      return function(item, config) {
        let classtxt = 'tssort';
        let keyval = '';
        Object.entries(config).forEach(([key, val]) => {
          if (key == item.key) {
            keyval = val;
          }
        });
        if (keyval) {
          for (let i in this.sortSetting) {
            if (keyval === this.sortSetting[i]) {
              classtxt += ' ' + i;
            }
          }
        } else {
          classtxt += ' none';
        }
        return classtxt;
      };
    },
    getReadonlyTheadBgClass() {
      return this.readonlyTextIsHighlight ? 'bg-warning' : '';
    }
  },
  watch: {}
};
</script>
