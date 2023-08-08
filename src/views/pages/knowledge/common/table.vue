<template>
  <section
    ref="container"
    :data_id="uuid"
    type="table"
    class="tssheet-container"
    :class="{ resizing: !!resizeColumn || !!resizeRow || isDragging }"
    @contextmenu.prevent
    @mousemove="doDrag"
    @mouseup="endResize"
    @click="
      event => {
        isContextMenuShow = false;
        event.stopPropagation();
      }
    "
    @mouseleave="endResize"
  >
    <div v-if="mode === 'edit'" ref="editorTable" class="editor-table">
      <div class="tool bg-op shadow">
        <div class="tssheet-toolbar">
          <div class="action-group">
            <span class="action-item tsfont-trash-s" :title="$t('dialog.title.deletetarget', {target: $t('page.table')})" @click="removeItem">
            </span>
            <span class="action-item">
              <Dropdown placement="bottom-start">
                <span class="text-action">
                  <span style="width:50px;display:inline-block">{{ getFontSize() }}</span>
                  <Icon type="ios-arrow-down"></Icon>
                </span>
                <DropdownMenu slot="list">
                  <DropdownItem @click.native="setStyle({ 'font-size': '12px' })"><span style="font-size:12px">{{ $t('page.small') }}</span></DropdownItem>
                  <DropdownItem @click.native="setStyle({ 'font-size': '14px' })"><span style="font-size:14px">{{ $t('page.medium') }}</span></DropdownItem>
                  <DropdownItem @click.native="setStyle({ 'font-size': '16px' })"><span style="font-size:16px">{{ $t('page.big') }}</span></DropdownItem>
                  <DropdownItem @click.native="setStyle({ 'font-size': '18px' })"><span style="font-size:18px">{{ $t('page.maximum') }}</span></DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </span>
            <span><Divider type="vertical" /></span>
            <span class="h3 action-item tsfont-bold" :class="{ 'text-info': getStyle('font-weight') == 'bold' }" @click="setStyle({ 'font-weight': getStyle('font-weight') == 'bold' ? 'normal' : 'bold' })"></span>
            <span><Divider type="vertical" /></span>
            <span class="action-item">
              <Poptip
                trigger="hover"
                word-wrap
                :transfer="true"
                width="250"
              >
                <span class="h3 tsfont-font-color" :class="getColorClass('color')"></span>
                <div slot="content">
                  <ul>
                    <li
                      v-for="(color, index) in colorList"
                      :key="index"
                      class="cursor color-item ml-sm mb-sm"
                      :class="[color + 'bg', { selected: hasClass(color + 'color') }]"
                      @click="setClass(color + 'color')"
                    ></li>
                  </ul>
                </div>
              </Poptip>
            </span>
            <span><Divider type="vertical" /></span>
            <span class="action-item">
              <Poptip
                trigger="hover"
                word-wrap
                :transfer="true"
                width="250"
              >
                <span class="h3 tsfont-font-bg" :class="getColorClass('bg')"></span>
                <div slot="content">
                  <ul>
                    <li
                      v-for="(color, index) in colorList"
                      :key="index"
                      class="cursor color-item ml-sm mb-sm"
                      :class="[color + 'bg', { selected: hasClass(color + 'bg') }]"
                      @click="setClass(color + 'bg')"
                    ></li>
                  </ul>
                </div>
              </Poptip>
            </span>
            <span><Divider type="vertical" /></span>
            <span class="h3 action-item tsfont-vertical-top" :class="{ 'text-info': getStyle('vertical-align') == 'top' }" @click="setStyle({ 'vertical-align': 'top' })"></span>
            <span class="h3 action-item tsfont-vertical-middle" :class="{ 'text-info': getStyle('vertical-align') == 'middle' }" @click="setStyle({ 'vertical-align': 'middle' })"></span>
            <span class="h3 action-item tsfont-vertical-bottom" :class="{ 'text-info': getStyle('vertical-align') == 'bottom' }" @click="setStyle({ 'vertical-align': 'bottom' })"></span>
            <span><Divider type="vertical" /></span>
            <span class="h3 action-item tsfont-horizontal-left" :class="{ 'text-info': getStyle('text-align') == 'left' }" @click="setStyle({ 'text-align': 'left' })"></span>
            <span class="h3 action-item tsfont-horizontal-center" :class="{ 'text-info': getStyle('text-align') == 'center' }" @click="setStyle({ 'text-align': 'center' })"></span>
            <span class="h3 action-item tsfont-horizontal-right" :class="{ 'text-info': getStyle('text-align') == 'right' }" @click="setStyle({ 'text-align': 'right' })"></span>
            <span class="h3 action-item tsfont-horizontal-justify" :class="{ 'text-info': getStyle('text-align') == 'justify' }" @click="setStyle({ 'text-align': 'justify' })"></span>
            <span v-if="canFallback || canForward"><Divider type="vertical" /></span>
            <span v-if="canFallback" class="h3 action-item tsfont-reply" @click="fallback()"></span>
            <span v-if="canForward" class="h3 action-item tsfont-revover" @click="forward()"></span>
          </div>
        </div>
      </div>
    </div>
    <div
      ref="tableContainer"
      style="position:relative;"
      :class="{ editmode: mode === 'edit' }"
      :style="{ height: mode === 'edit'?containerHeight:'100%' }"
      @scroll="
        event => {
          scrollContainer(event);
        }
      "
    >
      <table v-if="mode === 'edit'" class="tssheet-main-shadow-head" :style="{ top: scrollTop + 'px', width: tableSize.width + 'px' }">
        <thead>
          <tr>
            <th :style="{ height: minHeight + 'px', width: minWidth + 'px' }">&nbsp;</th>
            <th
              v-for="(head, index) in tableConfig.headerList"
              :key="index"
              class="thead-th"
              :class="{ selected: !!head._selected }"
              :style="{ width: head.width + 'px' }"
              @mouseup="isDragging = false"
              @mouseenter="multipleSelectColumn(index)"
              @mousedown="
                event => {
                  if (mode === 'edit') {
                    if (event.buttons === 1) {
                      clearSelectedRowCol();
                      isDragging = true;
                      selectColumn(index);
                      multipleSelectColumn(index);
                    }
                  }
                }
              "
            >
              <div
                v-if="mode === 'edit'"
                class="horizontal-resize-handler"
                @mousedown.stop="
                  event => {
                    startResize(event, 'h', index);
                  }
                "
              ></div>
              <span>
                <!-- 水平轴头部文案 -->
                {{ getHeadText(index) }}
              </span>
            </th>
          </tr>
        </thead>
      </table>
      <table v-if="mode === 'edit'" class="tssheet-main-shadow-left" :style="{ left: scrollLeft + 'px', height: tableSize.height + 'px' }">
        <thead>
          <tr>
            <th :style="{ height: minHeight + 'px', width: minWidth + 'px' }"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(left, rowindex) in shownLefterList" :key="rowindex">
            <th
              class="thead-th"
              style="position:relative"
              :class="{ selected: !!left._selected }"
              :style="{ height: left.height + 'px' }"
              @mousedown="
                event => {
                  if (mode === 'edit') {
                    if (event.buttons === 1) {
                      clearSelectedRowCol();
                      isDragging = true;
                      selectRow(left.index);
                      multipleSelectRow(left.index);
                    }
                  }
                }
              "
              @mouseup="isDragging = false"
              @mouseenter="multipleSelectRow(left.index)"
            >
              <div
                v-if="mode === 'edit'"
                class="vertical-resize-handler"
                @mousedown.stop="
                  event => {
                    startResize(event, 'v', left.index);
                  }
                "
              ></div>
              <!-- 行号 -->
              {{ left.index + 1 }}
              <div v-if="isHideRow(left.index)" class="corner-bottom-icon text-grey tsfont-eye-off"></div>
            </th>
          </tr>
        </tbody>
      </table>
      <table
        class="tssheet-main"
        :class="{ 'bg-op': mode === 'edit' }"
        :style="{ width:mode==='edit'?tableSize.width + 'px': containerWidth + 'px', height: tableSize.height + 'px', margin: mode==='edit'? 0 : '0 auto' }"
      >
        <colgroup>
          <col v-if="mode === 'edit'" :style="{ width: minWidth + 'px' }" />
          <col
            v-for="(head, index) in tableConfig.headerList"
            :ref="'header' + index"
            :key="index"
            :style="{ width:mode==='edit'? head.width + 'px': tdWidth(head.width) }"
          />
        </colgroup>
        <thead v-if="mode === 'edit'">
          <tr>
            <th :style="{ height: minHeight + 'px' }"></th>
            <th v-for="(head, index) in tableConfig.headerList" :key="index" class="thead-th"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(left, rowindex) in shownLefterList"
            :ref="'lefter' + rowindex"
            :key="rowindex"
            :style="{ height: left.height + 'px' }"
          >
            <th v-if="mode === 'edit'" class="thead-th">
              {{ left.index + 1 }}
            </th>
            <td
              v-for="(cell, cindex) in rowCells(left.index)"
              :key="cindex"
              :class="{ read: mode !== 'edit', selected: !!cell._selected || dropCell === cell, handler: !!cell._isHandler, ...cell.class }"
              :colspan="cell.colspan"
              :rowspan="getActualRowSpan(cell)"
              :style="cell.style"
              @dragover.prevent
              @dragenter="activeDropContainer(cell)"
              @mouseenter="
                event => {
                  if(mode === 'edit' && event.buttons === 1)
                    multipleSelectCell(cell, event)
                }
              "
              @mousedown="
                event => {
                  if (mode === 'edit') {
                    clearSelectedRowCol();
                    if (event.buttons === 1) {
                      selectCell(cell);
                      isDragging = true;
                    } else if (event.buttons === 2) {
                      if (!cell._selected) {
                        selectCell(cell, true);
                      }
                      showContextMenu(event);
                    }
                  }
                }
              "
              @mouseup="isDragging = false"
            >
              <div v-if="$utils.isEmpty(cell.component)">
                <textarea
                  v-if="mode === 'edit'"
                  v-model="cell.content"
                  class="content-inputer padding-xs"
                  :class="{...cell.class}"
                  :style="cell.style"
                  @input="adjustCellHeight($event, left)"
                  @keydown.enter="adjustCellHeight($event, left)"
                ></textarea>
                <div
                  v-else
                  class="content-inputer padding-xs"
                  :class="{...cell.class}"
                  :style="cell.style"
                  style="word-wrap: break-word;"
                >
                  {{ cell.content }}
                </div>
              </div>
              <div v-if="!cell._isHandler && cell.border">
                <div style="border-top-width:1px;border-top-style:solid;position:absolute;top:-1px;left:0px;height:1px;width:100%" :class="cell.border"></div>
                <div style="border-bottom-width:1px;border-bottom-style:solid;position:absolute;bottom:-1px;left:0px;height:1px;width:100%" :class="cell.border"></div>
                <div style="border-left-width:1px;border-left-style:solid;position:absolute;top:0px;left:-1px;height:100%;width:1px" :class="cell.border"></div>
                <div style="border-right-width:1px;border-right-style:solid;position:absolute;top:0px;right:-1px;height:100%;width:1px" :class="cell.border"></div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="resizeColumn && mode === 'edit'" :style="{ top: resizerPosition.top + 'px', left: resizerPosition.left + 'px' }" class="horizontal-resizer"></div>
      <div v-if="resizeRow && mode === 'edit'" :style="{ top: resizerPosition.top + 'px', left: resizerPosition.left + 'px' }" class="vertical-resizer"></div>
      <div v-if="isContextMenuShow && mode === 'edit'" :style="{ top: contextMenuPosition.top + 'px', left: contextMenuPosition.left + 'px' }" class="tssheet-context-menu padding-sm">
        <Dropdown trigger="custom" :visible="isContextMenuShow">
          <DropdownMenu slot="list">
            <DropdownItem v-if="canMerge" class="cursor" @click.native="mergeCell">{{ $t('page.merge') }}</DropdownItem>
            <DropdownItem v-if="canSplit" class="cursor" @click.native="splitCell">{{ $t('page.cancelmerge') }}</DropdownItem>
            <DropdownItem
              v-if="canClear"
              :divided="canMerge || canSplit"
              class="cursor"
              @click.native="clearCell"
            >{{ $t('page.clearcontent') }}</DropdownItem>
            <DropdownItem
              v-if="canClearStyle"
              :divided="(canMerge || canSplit) && !canClear"
              class="cursor"
              @click.native="clearCellStyle"
            >{{ $t('page.clearstyle') }}</DropdownItem>
            <DropdownItem :divided="canMerge || canSplit || canClear || canClearStyle" class="cursor" @click.native="insertRow('prepend')">{{ $t('term.framework.insetup') }}</DropdownItem>
            <DropdownItem class="cursor" @click.native="insertRow('append')">{{ $t('term.framework.insetdown') }}</DropdownItem>
            <DropdownItem class="cursor" @click.native="insertColumn('prepend')">{{ $t('term.framework.insetleft') }}</DropdownItem>
            <DropdownItem class="cursor" @click.native="insertColumn('append')">{{ $t('term.framework.insetright') }}</DropdownItem>
            <DropdownItem class="cursor" divided @click.native.prevent="deleteRow()">{{ $t('term.framework.delrow') }}</DropdownItem>
            <DropdownItem class="cursor" @click.native="deleteColumn()">{{ $t('term.framework.delcol') }}</DropdownItem>
            <DropdownItem
              v-if="hasCopy"
              class="cursor"
              divided
              @click.native="copyCell()"
            >{{ $t('page.copy') }}(ctrl+c)</DropdownItem>
            <DropdownItem v-if="hasCopy" class="cursor" @click.native="cutCell()">{{ $t('page.cut') }}(ctrl+x)</DropdownItem>
            <DropdownItem
              v-if="hasPaste"
              :divided="!hasCopy"
              class="cursor"
              @click.native="pasteCell()"
            >{{ $t('page.paste') }}(ctrl+v)</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  </section>
</template>
<script>
import editorMixins from '@/views/pages/knowledge/edit/component/common/mixins.js';
export default {
  name: '',
  components: {},
  mixins: [editorMixins],
  props: {
    init: {
      type: Array,
      default: () => {
        return [4, 4];
      }
    }, //如果data为空，则使用此参数初始化表格[row,col]
    mode: {
      type: String, //edit编辑模式|read使用模式
      default: 'edit',
      validator(value) {
        return ['edit', 'read'].includes(value);
      }
    },
    data: { type: [Object, Array] }, //表单数据
    formHighlightData: {
      type: Object,
      default: function() {
        return {};
      }
    },
    uuid: String,
    content: String,
    config: Object // 双向绑定的值
  },
  data() {
    return {
      copyedCell: null, //已复制的单元格，包含component或content
      defaultWidth: 200,
      minWidth: 50,
      minHeight: 45,
      scrollTop: 0,
      scrollLeft: 0,
      recoverQueue: [], //数据队列，用于重做和撤销
      containerHeight: '',
      containerWidth: 100,
      isDragging: false,
      isContextMenuShow: false,
      dropCell: null, //接受拖放的单元格
      resizeColumn: null, //正在改变宽度的列
      resizeRow: null, //正在改变高度的行
      resizerPosition: { top: 0, left: 0 }, //水平垂直线共用
      contextMenuPosition: { top: 0, left: 0 }, //右键菜单位置
      tableConfig: { reaction: { hiderow: [], displayrow: [] } }, //隐藏|显示行支持多套规则，因此是数组
      componentIndex: 1,
      formData: {}, //表单控件的值，key是控件uuid
      fontSizeList: [
        { value: '12px', text: this.$t('page.small') },
        { value: '14px', text: this.$t('page.medium') },
        { value: '16px', text: this.$t('page.big') },
        { value: '18px', text: this.$t('page.maximum') }
      ],
      colorList: ['color-picker-th-', 'color-picker-', 'color-picker-border-', 'color-picker-tip-', 'color-picker-text-', 'color-picker-info-', 'color-picker-warning-', 'color-picker-success-', 'color-picker-error-', 'color-picker-info-grey-', 'color-picker-warning-grey-', 'color-picker-success-grey-', 'color-picker-error-grey-', 'color-picker-form-sheet-style-setting-']
    };
  },
  beforeCreate() {},
  created() {
    this.initSheet();
    this.initReactionWatch();
  },
  beforeMount() {},
  mounted() {
    this.$nextTick(() => {
      this.calcContainerHeight();
    });
   
    window.addEventListener('resize', this.calcContainerHeight);
    window.addEventListener('keydown', this.windowKeypress);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    window.removeEventListener('resize', this.calcContainerHeight);
    window.removeEventListener('keydown', this.windowKeypress);
  },
  destroyed() {},
  methods: {
    adjustCellHeight(event, cell) {
      /**
       * 根据内容的高度设置单元格的高度
       * 没有高度时，使用默认值，
       * 原有当前行的高度比现在当前行高度高，使用原有，否则使用当前高度值
       *  */
      const targetTextarea = event.target;
      const lefterList = this.tableConfig.lefterList;

      this.$nextTick(() => {
        const cellIndex = cell.index;
        const newHeight = targetTextarea.scrollHeight < 45 ? 45 : Math.max(lefterList[cellIndex].height, targetTextarea.scrollHeight);
        const targetItem = lefterList.find((item, lefterIndex) => lefterIndex == cellIndex);
        if (targetItem) {
          targetItem.height = newHeight;
        }
      });
    },
    getContent() {
      // 外部调用，获取内容
      const data = this.$utils.deepClone(this.tableConfig);
      data.tableList.forEach(cell => {
        for (let k in cell) {
          if (k.startsWith('_')) {
            this.$delete(cell, k);
          }
        }
        //递归消除所有comonent的私有属性
        if (cell.component) {
          let component = cell.component;
          let componentList = [component];
          while (componentList.length > 0) {
            const subComponentList = [];
            componentList.forEach(com => {
              for (let k in com) {
                if (k.startsWith('_')) {
                  this.$delete(com, k);
                }
              }
              if (com.component) {
                subComponentList.push(...com.component);
              }
            });
            componentList = subComponentList;
          }
        }
      });
      this.$set(data, '_type', 'new'); //标识新表单
      return {
        config: {
          ...data
        }
      };
    },
    cutCell() {
      if (this.handlerCell) {
        this.copyedCell = {};
        if (this.handlerCell.content) {
          this.copyedCell.content = this.handlerCell.content;
          this.$delete(this.handlerCell, 'content');
        } else if (this.handlerCell.component) {
          this.copyedCell.component = this.handlerCell.component;
          this.$delete(this.handlerCell, 'component');
        }
      }
    },
    copyCell() {
      if (this.handlerCell) {
        this.copyedCell = {};
        if (this.handlerCell.content) {
          this.copyedCell.content = this.$utils.deepClone(this.handlerCell.content);
        } else if (this.handlerCell.component) {
          this.copyedCell.component = this.$utils.deepClone(this.handlerCell.component);
          this.copyedCell.component.uuid = this.$utils.setUuid(); //重新生成组件uuid
        }
      }
    },
    pasteCell() {
      if (this.copyedCell && this.handlerCell) {
        if (this.handlerCell.component || this.handlerCell.content) {
          this.$createDialog({
            title: this.$t('page.warning'),
            content: this.$t('message.framework.pastecelltip'),
            'on-ok': vnode => {
              if (this.copyedCell.content) {
                this.$set(this.handlerCell, 'content', this.copyedCell.content);
                this.$delete(this.handlerCell, 'component');
              } else if (this.copyedCell.component) {
                this.$set(this.handlerCell, 'component', this.copyedCell.component);
                this.$delete(this.handlerCell, 'content');
              }
              this.copyedCell = null;
              vnode.isShow = false;
            }
          });
        } else {
          if (this.copyedCell.content) {
            this.$set(this.handlerCell, 'content', this.copyedCell.content);
            this.$delete(this.handlerCell, 'component');
          } else if (this.copyedCell.component) {
            this.$set(this.handlerCell, 'component', this.copyedCell.component);
            this.$delete(this.handlerCell, 'content');
          }
          this.copyedCell = null;
        }
      }
    },
    clearSelectedRowCol() {
      this.dropCell = null;
      this.tableConfig.headerList.forEach(d => {
        if (d._isHandler) {
          this.$delete(d, '_isHandler');
        }
        if (d._selected) {
          this.$delete(d, '_selected');
        }
      });
      this.tableConfig.lefterList.forEach(d => {
        if (d._isHandler) {
          this.$delete(d, '_isHandler');
        }
        if (d._selected) {
          this.$delete(d, '_selected');
        }
      });
    },
    //初始化表格
    initSheet() {
      if (this.config && this.config.lefterList && this.config.headerList && this.config.tableList) {
        /**
         * 编辑模式下，直接将外部数据赋值给config，这样在外部对数据做了修改，也能触发表格控件发生变化。
         * 只读模式下，采用深度拷贝，避免表单渲染过程中数据变化导致外部数据也产生变化。
         **/
        if (this.mode !== 'edit') {
          this.tableConfig = this.$utils.deepClone(this.config);
        } else {
          this.tableConfig = this.config;
        }
        this.tableConfig.lefterList.forEach(d => {
          if (d.height < this.minHeight) {
            d.height = this.minHeight;
          }
        });
        this.tableConfig.headerList.forEach(d => {
          if (d.width < this.minWidth) {
            d.width = this.minWidth;
          }
        });
        if (this.mode === 'edit' || !this.tableConfig.hiddenRowList) {
          this.$set(this.tableConfig, 'hiddenRowList', []);
        }
        this.componentIndex = this.tableConfig.tableList.filter(d => !!d.component && !this.$utils.isEmpty(d.component)).length;
      } else {
        this.initTable();
      }
    },
    //重做
    forward() {
      if (this.canForward) {
        const currentIndex = this.recoverQueue.findIndex(d => d.isInUse);
        if (currentIndex > -1 && currentIndex < this.recoverQueue.length - 1) {
          this.recoverQueue[currentIndex].isInUse = false;
          const historyData = this.recoverQueue[currentIndex + 1];
          this.tableConfig = historyData.sheetData;
          if (currentIndex + 1 == this.recoverQueue.length - 1) {
            this.recoverQueue.splice(currentIndex + 1, 1);
          } else {
            historyData.isInUse = true;
          }
        }
      }
      this.$emit('updateItemList', '', '', this.tableConfig);
    },
    //撤销
    fallback() {
      if (this.canFallback) {
        const currentIndex = this.recoverQueue.findIndex(d => d.isInUse);
        if (currentIndex == -1) {
          //第一次fallback把最新状态放入历史队列
          const index = this.recoverQueue.length - 1;
          this.addHistory(true);
          const historyData = this.recoverQueue[index];
          historyData.isInUse = true;
          this.tableConfig = historyData.sheetData;
        } else if (currentIndex > 0) {
          this.recoverQueue[currentIndex].isInUse = false;
          const historyData = this.recoverQueue[currentIndex - 1];
          historyData.isInUse = true;
          this.tableConfig = historyData.sheetData;
        }
        this.isReady = true;
      }
      this.$emit('updateItemList', '', '', this.tableConfig);
    },
    //给恢复队列增加历史数据
    addHistory(isFallback) {
      const currentSheetData = this.$utils.deepClone(this.tableConfig);
      if (this.recoverQueue.length > 0) {
        const lastSheetData = this.recoverQueue[this.recoverQueue.length - 1].sheetData;
        if (this.$utils.isSame(currentSheetData, lastSheetData)) {
          return;
        }
      }
      //如果已经是恢复途中，则把isInUse后面的数据先清除再Push
      const inUseIndex = this.recoverQueue.findIndex(d => d.isInUse);
      if (inUseIndex > -1) {
        this.recoverQueue.length = inUseIndex;
      }
      this.recoverQueue.push({
        sheetData: currentSheetData,
        isInUse: false
      });
      //如果不是fallback而产生的数据，这时候需要清空所有isInUse状态，让数据回到原始状态而不是恢复状态
      if (!isFallback) {
        this.recoverQueue.forEach(element => {
          element.isInUse = false;
        });
      }
      //最多保留10个记录
      if (this.recoverQueue.length > 10) {
        this.recoverQueue.shift();
      }
    },
    initTable() {
      //使用init初始化表格
      if (this.init && this.init.length == 2) {
        const row = this.config?.row || this.init[0];
        const col = this.config?.col || this.init[1];
        this.$set(this.tableConfig, 'headerList', []);
        this.$set(this.tableConfig, 'lefterList', []);
        this.$set(this.tableConfig, 'tableList', []);
        this.$set(this.tableConfig, 'hiddenRowList', []);
        for (let c = 0; c < col; c++) {
          this.tableConfig.headerList.push({ width: this.defaultWidth });
        }
        for (let r = 0; r < row; r++) {
          this.tableConfig.lefterList.push({ height: this.minHeight });
        }
        if (this.config && !this.$utils.isEmpty(this.config.tableList)) {
          this.$set(this.tableConfig, 'tableList', this.config.tableList);
        } else {
          for (let r = 0; r < row; r++) {
            for (let c = 0; c < col; c++) {
              this.tableConfig.tableList.push({ row: r, col: c });
            }
          }
        }
      }
    },
    activeDropContainer(cell) {
      this.dropCell = cell;
    },
    calcContainerHeight() {
      const container = this.$refs.tableContainer;
      if (container) {
        const rect = container.getBoundingClientRect();
        this.initContainerWidth(rect.width);
      }
    },
    initContainerWidth(val) { //表单宽度
      let width = val;
      if (!width) {
        const container = this.$refs.tableContainer;
        if (container) {
          const rect = container.getBoundingClientRect();
          width = rect.width;
        }
      }
      if (this.config && !this.$utils.isEmpty(this.config.formWidth)) {
        if (this.config.formWidth.type === 'inherit') {
          this.containerWidth = this.tableSize.width;
        } else if (this.config.formWidth.type === '%') {
          this.containerWidth = width * this.config.formWidth.width / 100;
        } else if (this.config.formWidth.type === 'px') {
          this.containerWidth = this.config.formWidth.width;
        }
      } else {
        this.containerWidth = width;
      }
    },
    scrollContainer(event) {
      this.scrollTop = event.target.scrollTop;
      this.scrollLeft = event.target.scrollLeft;
    },
    //组件变化时修正单元格尺寸
    resizeCell(row, col, needReset) {
      if (row != null) {
        const lefter = this.tableConfig.lefterList[row];
        if (needReset) {
          lefter.height = this.minHeight; //先重置高度
        }
      }

      this.$nextTick(() => {
        if (row != null) {
          const lefter = this.tableConfig.lefterList[row];
          const lrect = this.$refs['lefter' + row] && this.$refs['lefter' + row][0] ? this.$refs['lefter' + row][0].getBoundingClientRect() : {};
          if (lrect.height > lefter.height) {
            lefter.height = Math.max(lrect.height, this.minHeight);
          }
        }
        if (col != null) {
          const header = this.tableConfig.headerList[col];
          const hrect = this.$refs['header' + col] && this.$refs['header' + col][0] ? this.$refs['header' + col][0].getBoundingClientRect() : {};
          if (this.mode === 'edit' && hrect.width > header.width) {
            header.width = hrect.width;
          }
        }
      });
    },
    //获取真正的rowspan，排除隐藏行
    getActualRowSpan(cell) {
      if (this.tableConfig.hiddenRowList.length > 0 && cell.rowspan && cell.rowspan > 1) {
        let rowspan = cell.rowspan;
        for (let i = cell.row + 1; i < cell.row + cell.rowspan; i++) {
          if (this.tableConfig.hiddenRowList.includes(i)) {
            rowspan -= 1;
          }
        }
        return rowspan;
      }
      return cell.rowspan;
    },
    //提供外部使用，返回表单数据
    getFormData() {
      const formItemList = [];
      for (let key in this.formData) {
        const formitem = this.formItemList.find(d => d.uuid === key);
        if (formitem) {
          formItemList.push({ attributeUuid: key, handler: formitem.handler, dataList: this.formData[key] });
        }
      }
      return formItemList;
    },
    //是否包含class
    hasClass(classname) {
      for (let i = 0; i < this.selectedCell.length; i++) {
        const cell = this.selectedCell[i];
        if (cell.class) {
          return !!cell.class[classname];
        }
      }
      return false;
    },
    //返回单元格字体大小
    getFontSize() {
      let fz = this.$t('page.medium');
      for (let i = 0; i < this.selectedCell.length; i++) {
        const cell = this.selectedCell[i];
        if (cell.style && cell.style['font-size']) {
          if (cell.style['font-size'] === '12px') {
            fz = this.$t('page.small');
          } else if (cell.style['font-size'] === '16px') {
            fz = this.$t('page.big');
          } else if (cell.style['font-size'] === '18px') {
            fz = this.$t('page.maximum');
          }
          break;
        }
      }
      return fz;
    },
    //根据联动配置初始化watch
    initReactionWatch() {
      let needWatch = false;
      if (this.tableConfig.reaction) {
        for (let key in this.tableConfig.reaction) {
          if (this.tableConfig.reaction[key].some(d => !this.$utils.isEmpty(d)) > 0) {
            needWatch = true;
            break;
          }
        }
      }
      if (needWatch && this.formData) {
        this.$watch(
          'formDataForWatch',
          (newVal, oldVal) => {
            for (let key in this.tableConfig.reaction) {
              this.tableConfig.reaction[key].forEach(reaction => {
                if (this.mode !== 'edit' && reaction.rows && reaction.rows.length > 0) {
                  if (key === 'hiderow') {
                    reaction.rows.forEach(row => {
                      this.displayRow(row);
                    });
                  } else if (key === 'displayrow') {
                    reaction.rows.forEach(row => {
                      this.hideRow(row);
                    });
                  }
                }
              });
            }
          },
          { deep: true, immediate: true }
        );
      }
    },
    //隐藏行
    hideRow(row) {
      if (!this.tableConfig.hiddenRowList.includes(row)) {
        this.tableConfig.hiddenRowList.push(row);
      }
    },
    //显示行
    displayRow(row) {
      const index = this.tableConfig.hiddenRowList.findIndex(d => d === row);
      if (index > -1) {
        this.tableConfig.hiddenRowList.splice(index, 1);
      }
    },
    //获取字体颜色类
    getColorClass(type) {
      for (let i = 0; i < this.selectedCell.length; i++) {
        const cell = this.selectedCell[i];
        if (cell.class) {
          for (let key in cell.class) {
            if (key.startsWith('color-') && key.endsWith(type)) {
              return key;
            }
          }
        }
      }
      return '';
    },
    //获取选中单元格边框风格
    getBorder() {
      for (let i = 0; i < this.selectedCell.length; i++) {
        const cell = this.selectedCell[i];
        if (cell.border) {
          return cell.border.substr(0, cell.border.lastIndexOf('-')) + '-color';
        }
      }
      return '';
    },
    //获取选中单元格风格
    getStyle(stylename) {
      for (let i = 0; i < this.selectedCell.length; i++) {
        const cell = this.selectedCell[i];
        if (cell.style && cell.style[stylename]) {
          return cell.style[stylename];
        }
      }
      return '';
    },
    //设置风格
    setStyle(style) {
      this.selectedCell.forEach(cell => {
        if (cell.style) {
          cell.style = Object.assign(cell.style, style);
        } else {
          this.$set(cell, 'style', this.$utils.deepClone(style));
        }
      });
      this.$forceUpdate();
    },
    //设置风格样式类
    setClass(classname) {
      const type = classname.substr(classname.lastIndexOf('-') + 1);
      this.selectedCell.forEach(cell => {
        if (cell.class) {
          let hasClass = false;
          for (let key in cell.class) {
            if (key.startsWith('color-') && key.endsWith(type)) {
              hasClass = true;
              this.$delete(cell.class, key);
              if (key !== classname) {
                this.$set(cell.class, classname, true);
              }
            }
          }
          if (!hasClass) {
            this.$set(cell.class, classname, true);
          }
        } else {
          this.$set(cell, 'class', {});
          this.$set(cell.class, classname, true);
        }
      });
      this.$forceUpdate();
    },
    //设置单元格边框颜色
    setBorder(border) {
      this.selectedCell.forEach(cell => {
        if (cell.border === border) {
          this.$delete(cell, 'border');
        } else {
          this.$set(cell, 'border', border);
        }
      });
      this.$forceUpdate();
    },
    //激活单元格为可输入状态
    focusCell(cell) {
      if (!cell.component && cell === this.handlerCell) {
        this.$set(cell, '_isEditing', true);
      }
    },
    deleteFormItem(item) { //删除组件
      if (item.component) {
        this.addHistory();
        this.$emit('removeComponent', item.component.uuid);
        this.$delete(item, 'content');
        this.$delete(item, 'component');
      }
    },
    //清空单元格内容
    clearCell() {
      if (this.handlerCell) {
        this.addHistory();
        if (this.handlerCell.component) {
          this.$emit('removeComponent', this.handlerCell.component.uuid);
        }
        this.$delete(this.handlerCell, 'content');
        this.$delete(this.handlerCell, 'component');
      }
    },
    //清空单元格格式
    clearCellStyle() {
      this.addHistory();
      this.selectedCell.forEach(cell => {
        this.$delete(cell, 'style');
        this.$delete(cell, 'class');
      });
    },
    //删除一行
    deleteRow() {
      if (this.selectedCell.length > 0) {
        let startRow = Number.MAX_VALUE;
        let endRow = -1;
        this.selectedCell.forEach(cell => {
          if (startRow > cell.row) {
            startRow = cell.row;
          }
          if (endRow < cell.row + (cell.rowspan || 1)) {
            endRow = cell.row + (cell.rowspan || 1);
          }
        });
        this.addHistory();
        for (let index = endRow - 1; index >= startRow; index--) {
          this.tableConfig.lefterList.splice(index, 1);
          for (let i = this.tableConfig.tableList.length - 1; i >= 0; i--) {
            const cell = this.tableConfig.tableList[i];
            const row = cell.row;
            if (row === index) {
              this.tableConfig.tableList.splice(i, 1);
            } else if (row < index && cell.rowspan && row + cell.rowspan > index) {
              cell.rowspan = cell.rowspan - 1;
            } else if (row > index) {
              cell.row = row - 1;
            }
          }
        }
        this.unselectCell();
        this.$emit('updateItemList', '', '', this.tableConfig);
      }
    },
    //删除一列
    deleteColumn() {
      if (this.selectedCell.length > 0) {
        let startCol = Number.MAX_VALUE;
        let endCol = -1;
        this.selectedCell.forEach(cell => {
          if (startCol > cell.col) {
            startCol = cell.col;
          }
          if (endCol < cell.col + (cell.colspan || 1)) {
            endCol = cell.col + (cell.colspan || 1);
          }
        });
        this.addHistory();
        for (let index = endCol - 1; index >= startCol; index--) {
          this.tableConfig.headerList.splice(index, 1);
          for (let i = this.tableConfig.tableList.length - 1; i >= 0; i--) {
            const cell = this.tableConfig.tableList[i];
            const col = cell.col;
            if (col === index) {
              this.tableConfig.tableList.splice(i, 1);
            } else if (col < index && cell.colspan && col + cell.colspan > index) {
              cell.colspan = cell.colspan - 1;
            } else if (col > index) {
              cell.col = col - 1;
            }
          }
        }
        this.unselectCell();
        this.$emit('updateItemList', '', '', this.tableConfig);
      }
    },
    //插入一行
    insertRow(direction) {
      if (this.handlerCell) {
        this.addHistory();
        let rindex = -1;
        if (direction === 'prepend') {
          rindex = this.handlerCell.row;
        } else if (direction === 'append') {
          rindex = this.handlerCell.row + (this.handlerCell.rowspan || 1);
        }
        if (rindex >= 0) {
          this.tableConfig.lefterList.push({ height: this.minHeight });
          this.tableConfig.tableList.forEach(cell => {
            if (cell.row >= rindex) {
              cell.row = cell.row + 1;
            } else if (cell.rowspan > 1 && cell.row < rindex && ((cell.row + cell.rowspan >= rindex && direction === 'prepend') || (cell.row + cell.rowspan > rindex && direction === 'append'))) {
              cell.rowspan = cell.rowspan + 1;
            }
          });
          this.tableConfig.headerList.forEach((head, cindex) => {
            this.tableConfig.tableList.push({ row: rindex, col: cindex });
          });
        }
        this.unselectCell();
      }
    },
    //插入一列
    insertColumn(direction) {
      if (this.handlerCell) {
        this.addHistory();
        let cindex = -1;
        if (direction === 'prepend') {
          cindex = this.handlerCell.col;
        } else if (direction === 'append') {
          cindex = this.handlerCell.col + (this.handlerCell.colspan || 1);
        }
        if (cindex >= 0) {
          this.tableConfig.headerList.push({ width: this.defaultWidth });
          this.tableConfig.tableList.forEach(cell => {
            if (cell.col >= cindex) {
              cell.col = cell.col + 1;
            } else if (cell.colspan > 1 && cell.col < cindex && ((cell.col + cell.colspan >= cindex && direction === 'prepend') || (cell.col + cell.colspan > cindex && direction === 'append'))) {
              cell.colspan = cell.colspan + 1;
            }
          });
          this.tableConfig.lefterList.forEach((left, rindex) => {
            this.tableConfig.tableList.push({ row: rindex, col: cindex });
          });
        }
        this.unselectCell();
      }
    },
    //显示右键菜单
    showContextMenu(event) {
      this.contextMenuPosition.left = event.clientX - this.parentX + this.calculateScroll(this.$refs.tableContainer)[1];
      let top = event.clientY - this.parentY + this.calculateScroll(this.$refs.tableContainer)[0];
      if (this.handlerCell.content) {
        event.clientY - this.parentY > 400 && (top -= 360);
      } else if (this.handlerCell.component) {
        event.clientY - this.parentY > 350 && (top -= 320);
      } else if (!this.handlerCell.content && !this.handlerCell.component) {
        event.clientY - this.parentY > 250 && (top -= 210);
      }
      this.contextMenuPosition.top = top;
      this.isContextMenuShow = true;
    },
    //多选行
    multipleSelectRow(lefterIndex) {
      if (this.isDragging && this.handlerRow) {
        const startLefterIndex = this.tableConfig.lefterList.findIndex(d => d === this.handlerRow);
        const minIndex = Math.min(startLefterIndex, lefterIndex);
        const maxIndex = Math.max(startLefterIndex, lefterIndex);
        this.tableConfig.lefterList.forEach((d, index) => {
          if (index >= minIndex && index <= maxIndex) {
            this.$set(d, '_selected', true);
          } else {
            this.$delete(d, '_selected');
          }
        });
        const firstCell = this.cellList.find(cell => cell.row <= startLefterIndex && cell.row + (cell.rowspan || 1) > startLefterIndex && this.columnCells(cell.col).includes(cell));
        const rowCellList = [];
        this.cellList.forEach(cell => {
          if (cell.row <= lefterIndex && cell.row + (cell.rowspan || 1) > lefterIndex) {
            if (this.columnCells(cell.col).includes(cell)) {
              rowCellList.push(cell);
            }
          }
        });
        //按column优先级进行排序
        rowCellList.sort((a, b) => {
          if (a.col != b.col) {
            return a.col - b.col;
          } else {
            return a.row - b.row;
          }
        });
        const lastCell = rowCellList[rowCellList.length - 1];
        this.selectCell(firstCell);
        this.multipleSelectCell(lastCell);
      }
    },
    //多选列
    multipleSelectColumn(headerIndex) {
      if (this.isDragging && this.handlerCol) {
        const startHeaderIndex = this.tableConfig.headerList.findIndex(d => d === this.handlerCol);
        const minIndex = Math.min(startHeaderIndex, headerIndex);
        const maxIndex = Math.max(startHeaderIndex, headerIndex);
        this.tableConfig.headerList.forEach((d, index) => {
          if (index >= minIndex && index <= maxIndex) {
            this.$set(d, '_selected', true);
          } else {
            this.$delete(d, '_selected');
          }
        });
        const firstCell = this.cellList.find(cell => cell.col <= startHeaderIndex && cell.col + (cell.colspan || 1) > startHeaderIndex);
        const rowCellList = [];
        this.cellList.forEach(cell => {
          if (cell.col <= headerIndex && cell.col + (cell.colspan || 1) > headerIndex) {
            //if (this.columnCells(cell.col).includes(cell)) {
            rowCellList.push(cell);
            //}
          }
        });
        //按column优先级进行排序
        rowCellList.sort((a, b) => {
          if (a.col != b.col) {
            return a.col - b.col;
          } else {
            return a.row - b.row;
          }
        });
        const lastCell = rowCellList[rowCellList.length - 1];
        this.selectCell(firstCell);
        this.multipleSelectCell(lastCell);
      }
    },
    selectRow(index) {
      const row = this.tableConfig.lefterList[index];
      this.tableConfig.lefterList.forEach(lefter => {
        this.$set(lefter, '_isHandler', false);
      });
      this.$set(row, '_isHandler', true);
    },
    //选择整列
    selectColumn(index) {
      const col = this.tableConfig.headerList[index];
      this.tableConfig.headerList.forEach(header => {
        this.$set(header, '_isHandler', false);
      });
      this.$set(col, '_isHandler', true);
    },
    //合并单元格
    mergeCell() {
      if (this.selectedCell.length > 1) {
        const ok = () => {
          this.addHistory();
          const startCell = this.selectedCell[0];
          const endCell = this.selectedCell[this.selectedCell.length - 1];
          this.$set(startCell, 'rowspan', endCell.row - startCell.row + (endCell.rowspan || 1));
          this.$set(startCell, 'colspan', endCell.col - startCell.col + (endCell.colspan || 1));
          for (let i = 1; i < this.selectedCell.length; i++) {
            const cell = this.selectedCell[i];
            this.$delete(cell, 'content');
            this.$delete(cell, 'component');
            this.$set(cell, 'rowspan', 1);
            this.$set(cell, 'colspan', 1);
          }
          this.selectCell(startCell, true);
        };
        let componentList = [];
        for (let i = 1; i < this.selectedCell.length; i++) {
          const cell = this.selectedCell[i];
          if (cell.content) {
            componentList.push(cell.content);
          } else if (cell.component) {
            componentList.push(cell.component.label);
          }
        }
        if (componentList.length > 0) {
          this.$createDialog({
            title: this.$t('page.tip'),
            content: `${this.$t('message.framework.clearcelltip')}：<br>${componentList.join('<br>')}`,
            'on-ok': vnode => {
              ok();
              vnode.isShow = false;
            }
          });
        } else {
          ok();
        }
      }
    },
    //分拆单元格
    splitCell() {
      if (this.selectedCell.length === 1) {
        this.addHistory();
        this.$set(this.selectedCell[0], 'rowspan', 1);
        this.$set(this.selectedCell[0], 'colspan', 1);
      }
    },
    //批量选中单元格
    multipleSelectCell(cell) {
      if (this.handlerCell && this.isDragging) {
        let minRow = Math.min(this.handlerCell.row, cell.row);
        let minCol = Math.min(this.handlerCell.col, cell.col);
        let maxRow = Math.max(this.handlerCell.row + (this.handlerCell.rowspan || 1), cell.row + (cell.rowspan || 1));
        let maxCol = Math.max(this.handlerCell.col + (this.handlerCell.colspan || 1), cell.col + (cell.colspan || 1));

        const selectCellList = [this.handlerCell, cell];
        let hasNew = true;
        while (hasNew) {
          hasNew = false;
          for (let i = 0; i < this.cellList.length; i++) {
            const c = this.cellList[i];

            if (!selectCellList.includes(c)) {
              const cMinRow = c.row;
              const cMinCol = c.col;
              const cMaxRow = c.row + (c.rowspan || 1);
              const cMaxCol = c.col + (c.colspan || 1);

              let isHit = false;
              if (cMaxRow > minRow && cMaxCol > minCol && cMaxRow <= maxRow && cMaxCol <= maxCol) {
                isHit = true;
              } else if (cMaxRow > minRow && cMinCol > minCol && cMaxRow < maxRow && cMinCol < maxCol) {
                isHit = true;
              } else if (cMinRow > minRow && cMaxCol > minCol && cMinRow < maxRow && cMaxCol < maxCol) {
                isHit = true;
              } else if (cMinRow > minRow && cMinCol > minCol && cMinRow < maxRow && cMinCol < maxCol) {
                isHit = true;
              } else if (cMinRow <= minRow && cMinCol > minCol && cMaxRow >= maxRow && cMaxCol < maxCol) {
                isHit = true;
              }
              if (isHit) {
                minRow = Math.min(minRow, cMinRow);
                minCol = Math.min(minCol, cMinCol);
                maxRow = Math.max(maxRow, cMaxRow);
                maxCol = Math.max(maxCol, cMaxCol);
                selectCellList.push(c);
                hasNew = true;
              }
            }
          }
        }
        this.cellList.forEach(c => {
          if (selectCellList.includes(c)) {
            this.$set(c, '_selected', true);
          } else {
            this.$set(c, '_selected', false);
          }
        });
      }
    },
    //选中一个单元格,isForce=true代表强行重选，用于合并单元格后重新选中，刷新数据
    selectCell(cell, isForce) {
      //if (isForce || !this.handlerCell || this.handlerCell !== cell) {
      this.selectedCell.forEach(cell => {
        this.$delete(cell, '_selected');
      });
      this.$set(cell, '_selected', true);
      if (this.handlerCell) {
        this.$set(this.handlerCell, '_isEditing', false);
        this.$set(this.handlerCell, '_isHandler', false);
      }
      this.$set(cell, '_isHandler', true);
      this.$emit('selectCell', cell, cell.component);
      //}
    },
    //取消选中单元格
    unselectCell() {
      this.selectedCell.forEach(cell => {
        this.$set(cell, '_selected', false);
      });
      if (this.handlerCell) {
        this.$set(this.handlerCell, '_isEditing', false);
        this.$set(this.handlerCell, '_isHandler', false);
      }
    },
    endResize() {
      this.resizeColumn = null;
      this.resizeRow = null;
    },
    doDrag(event) {
      if (this.resizeColumn) {
        const deltaX = event.movementX;
        const width = this.resizeColumn.width + deltaX;
        if (width >= this.minWidth) {
          const index = this.tableConfig.headerList.findIndex(d => d === this.resizeColumn);
          this.resizeColumn.width = width;
          this.resizerPosition.top = 0;
          this.resizerPosition.left = this.resizerPosition.left + deltaX;
          //有些组件宽度压缩不了，需要重新修正宽度
          this.resizeCell(null, index);
        }
      } else if (this.resizeRow) {
        const deltaY = event.movementY;
        const height = this.resizeRow.height + deltaY;
        if (height >= this.minHeight) {
          const index = this.tableConfig.lefterList.findIndex(d => d === this.resizeRow);
          this.resizeRow.height = height;
          this.resizerPosition.left = 0;
          this.resizerPosition.top = this.resizerPosition.top + deltaY;
          //有些组件高度压缩不了，需要重新修正高度
          this.resizeCell(index);
        }
      } else if (this.handlerCell) {
        //
      }
    },
    startResize(event, type, index) {
      const targetRect = event.target.getBoundingClientRect();
      if (type === 'h') {
        const w = targetRect.width;
        const x = targetRect.x;
        this.resizerPosition.left = x - this.parentX + w + this.calculateScroll(this.$refs.tableContainer)[1];
        this.resizeColumn = this.tableConfig.headerList[index];
      } else {
        const h = targetRect.height;
        const y = targetRect.y;
        this.resizerPosition.top = y - this.parentY + h + this.calculateScroll(this.$refs.tableContainer)[0];
        this.resizeRow = this.tableConfig.lefterList[index];
      }
    },
    calculateScroll(e) {
      if (e) {
        const [scrollTop, scrollLeft] = this.calculateScroll(e.parentNode);
        return [(e.scrollTop || 0) + scrollTop, (e.scrollLeft || 0) + scrollLeft];
      } else {
        return [0, 0];
      }
    },
    getHeadText(index) {
      const min = 65;
      const max = 90;
      while (min + index > max) {
        index = index - (max - min);
      }
      return String.fromCharCode(min + index);
    },
    //检查当前单元格是否在其他单元格的span范围
    checkCellIsInSpan(cell) {
      for (let i = 0; i < this.spanCells.length; i++) {
        const spancell = this.spanCells[i];
        if (spancell.row <= cell.row && spancell.row + (spancell.rowspan || 1) >= cell.row + (cell.rowspan || 1) && spancell.col <= cell.col && spancell.col + (spancell.colspan || 1) >= cell.col + (cell.colspan || 1) && spancell != cell) {
          return true;
        }
      }
      return false;
    },
    isHideRow(index) {
      if (this.tableConfig.reaction && this.tableConfig.reaction.hiderow) {
        for (let i = 0; i < this.tableConfig.reaction.hiderow.length; i++) {
          const hiderow = this.tableConfig.reaction.hiderow[i];
          if (hiderow.rows && hiderow.rows.length > 0 && hiderow.rows.includes(index)) {
            return true;
          }
        }
      }
      return false;
    },
    windowKeypress(event) {
      if (event.key == 'c' && event.ctrlKey) {
        //复制组件
        if (!event.target._value && this.hasCopy) {
          this.copyCell();
        }
      } else if (event.key == 'v' && event.ctrlKey) {
        //粘贴组件
        if (!event.target._value && this.hasPaste) {
          this.pasteCell();
        }
      } else if (event.key == 'x' && event.ctrlKey) {
        //剪切组件
        if (!event.target._value && this.hasCopy) {
          this.cutCell();
        }
      }
    }
  },
  filter: {},
  computed: {
    hasCopy() {
      if (this.handlerCell && this.handlerCell.component && !this.$utils.isEmpty(this.handlerCell.component) && !this.handlerCell.component.hasOwnProperty('inherit')) {
        return true;
      }
      return false;
    },
    hasPaste() {
      return !!this.copyedCell;
    },
    getCellWidth() {
      return cell => {
        let width = 0;
        const colspan = cell.colspan || 1;
        for (let i = 0; i < colspan; i++) {
          width += this.tableConfig.headerList[cell.col + i].width;
        }
        return width - 2; //减掉左右边框的宽度;
      };
    },
    //如果reaction直接监听formData，由于都是同一个对象，所以watch无法获取前后值变化，需要用此计算属性转换一下数据
    formDataForWatch() {
      return JSON.parse(JSON.stringify(this.formData));
    },
    //由于condition的valueList类型是数组，所以不能直接在script中以字符串的方式复制
    conditionData() {
      return uuid => {
        const conditionData = {};
        if (this.tableConfig.reaction) {
          for (let key in this.tableConfig.reaction) {
            const reactionList = this.tableConfig.reaction[key];
            if (reactionList && reactionList.length > 0) {
              reactionList.forEach(reaction => {
                if (reaction && !this.$utils.isEmpty(reaction) && reaction.conditionGroupList) {
                  reaction.conditionGroupList.forEach(cg => {
                    if (cg.conditionList) {
                      cg.conditionList.forEach(c => {
                        conditionData[c.uuid] = c.valueList;
                      });
                    }
                  });
                }
              });
            }
          }
        }
        return conditionData[uuid];
      };
    },
    tableSize() {
      let size = { width: 0, height: 0 };
      //1代表一侧的边框宽度
      this.tableConfig.headerList.forEach(h => {
        size.width += h.width;
      });

      this.shownLefterList.forEach(h => {
        size.height += h.height;
      });
      //2代表lefter和header的左右或上下边框宽度总和
      if (this.mode === 'edit') {
        size.width = size.width + this.minWidth + 1;
        size.height = size.height + this.minHeight + 1;
      }
      return size;
    },
    //计算实际需要显示的行
    shownLefterList() {
      const lefterList = [];
      this.tableConfig.lefterList.forEach((left, index) => {
        if (!this.tableConfig.hiddenRowList.includes(index)) {
          const newLeft = this.$utils.deepClone(left);
          newLeft.index = index;
          lefterList.push(newLeft);
        }
      });
      if (this.mode !== 'edit') {
        //只读模式，从下面消除所有没有设置组件的单元格
        for (let i = lefterList.length - 1; i >= 0; i--) {
          if (!this.tableConfig.tableList.find(cell => cell.row === i && (cell.component || cell.content || this.checkCellIsInSpan(cell)))) {
            lefterList.splice(i, 1);
          }
        }
      }
      return lefterList;
    },
    //是否允许合并
    canMerge() {
      return this.selectedCell.length > 1;
    },
    //是否允许分拆
    canSplit() {
      if (this.selectedCell.length != 1) {
        return false;
      } else {
        const cell = this.selectedCell[0];
        return (cell.rowspan && cell.rowspan > 1) || (cell.colspan && cell.colspan > 1);
      }
    },
    //是否允许清空内容
    canClear() {
      if (this.selectedCell.length != 1) {
        return false;
      } else {
        const cell = this.selectedCell[0];
        return (cell.hasOwnProperty('content') && cell.content != null && cell.content != '') || (cell.hasOwnProperty('component') && !this.$utils.isEmpty(cell.component));
      }
    },
    //是否允许清空单元格格式
    canClearStyle() {
      if (this.selectedCell.length > 0) {
        for (let i = 0; i < this.selectedCell.length; i++) {
          const cell = this.selectedCell[i];
          if (cell.hasOwnProperty('style') || cell.hasOwnProperty('class')) {
            return true;
          }
        }
      }
      return false;
    },
    //经过排序的所有单元格列表
    cellList() {
      const tableList = this.tableConfig.tableList;
      tableList.sort((a, b) => {
        if (a.row != b.row) {
          return a.row - b.row;
        } else {
          return a.col - b.col;
        }
      });
      return tableList;
    },
    handlerRow() {
      //开始拖拽的行
      for (let i = 0; i < this.tableConfig.lefterList.length; i++) {
        const lefter = this.tableConfig.lefterList[i];
        if (lefter._isHandler) {
          return lefter;
        }
      }
      return null;
    },
    handlerCol() {
      //开始拖拽的列
      for (let i = 0; i < this.tableConfig.headerList.length; i++) {
        const header = this.tableConfig.headerList[i];
        if (header._isHandler) {
          return header;
        }
      }
      return null;
    },
    handlerCell() {
      //开始拖拽的单元格
      for (let i = 0; i < this.cellList.length; i++) {
        const cell = this.cellList[i];
        if (cell._isHandler) {
          return cell;
        }
      }
      return null;
    },
    selectedCell() {
      const tableList = [];
      this.cellList.forEach(d => {
        if (d._selected) {
          tableList.push(d);
        }
      });
      tableList.sort((a, b) => {
        if (a.row != b.row) {
          return a.row - b.row;
        } else {
          return a.col - b.col;
        }
      });
      return tableList;
    },
    parentX() {
      return this.$refs.tableContainer.getBoundingClientRect().x;
    },
    parentY() {
      return this.$refs.tableContainer.getBoundingClientRect().y;
    },
    spanCells() {
      //返回所有设置了rowspan或colspan的单元格
      const tableList = [];
      this.cellList.forEach(cell => {
        if ((cell.colspan && cell.colspan > 1) || (cell.rowspan && cell.rowspan > 1)) {
          if (!this.tableConfig.hiddenRowList.includes(cell.row)) {
            tableList.push(cell);
          }
        }
      });
      tableList.sort((a, b) => {
        if (a.row != b.row) {
          return a.row - b.row;
        } else {
          return a.col - b.col;
        }
      });
      return tableList;
    },
    //每一列应该显示的单元格
    columnCells() {
      return columnindex => {
        //每一行应该返回的单元格数据
        const tableList = [];
        this.cellList.forEach(cell => {
          if (cell.col == columnindex) {
            if (!this.checkCellIsInSpan(cell)) {
              tableList.push(cell);
            }
          }
        });
        return tableList;
      };
    },
    //每一行应该显示的单元格数据
    rowCells() {
      return rowindex => {
        const tableList = [];
        this.cellList.forEach(cell => {
          if (cell.row == rowindex) {
            // tableList.push(cell);
            if (!this.checkCellIsInSpan(cell)) {
              tableList.push(cell);
            }
          }
        });
        return tableList;
      };
    },
    rowCount() {
      //总行数
      let rowcount = 0;
      this.cellList.forEach(cell => {
        rowcount = Math.max(rowcount, cell.row + (cell.rowspan || 1));
      });
      return rowcount;
    },
    //能否回退
    canFallback() {
      const index = this.recoverQueue.findIndex(d => d.isInUse);
      if (index == -1 || index > 0) {
        if (this.recoverQueue.length > 1) {
          return true;
        } else if (this.recoverQueue.length == 1) {
          const currentSheetData = this.$utils.deepClone(this.tableConfig);
          const lastSheetData = this.recoverQueue[0].sheetData;
          if (!this.$utils.isSame(currentSheetData, lastSheetData)) {
            return true;
          }
        }
      }
      return false;
    },
    //能否重做
    canForward() {
      if (
        this.recoverQueue.findIndex(d => {
          return d.isInUse;
        }) > -1 &&
        this.recoverQueue.findIndex(d => {
          return d.isInUse;
        }) !=
          this.recoverQueue.length - 1
      ) {
        return true;
      }
      return false;
    },
    tdWidth() {
      return (header, cell) => {
        let width = header || 0;
        if (cell) {
          const colspan = cell.colspan || 1;
          for (let i = 0; i < colspan; i++) {
            width += this.tableConfig.headerList[cell.col + i].width;
          }
          width -= 2;
        } 
        return (width / this.tableSize.width * this.containerWidth) + 'px';
      };
    }
  },
  watch: {
    tableConfig: {
      handler: function(newVal, oldVal) {
        if (oldVal && !this.$utils.isEmpty(oldVal) && newVal) {
          this.$emit('input', newVal);
        }
      },
      deep: true
    },
    data: {
      handler: function(val) {
        if (val && val instanceof Array) {
          //将后台的数据格式转换回原始的数据格式
          this.formData = {};
          val.forEach(element => {
            this.$set(this.formData, element.attributeUuid, element.dataList);
          });
        } else if (val && val instanceof Object) {
          this.formData = this.$utils.deepClone(val);
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
@import './table.less';
  .editor-table{
    position: relative;
  }
  .tssheet-container {
    padding: 10px;
    &:hover {
      .tool {
        display: block;
      }
    }
    .tool {
      position: absolute;
      top: -36px !important;
      left: 0px !important;
      z-index: 30;
      box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.2);
      border-radius: 2px;
      padding: 5px;
      display: none;
      &>span{
          padding: 7px 8px;
          cursor: pointer;
      }
   }
  }
</style>
