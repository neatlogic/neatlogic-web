<template>
  <div :style="viewportStyle">
    <div v-if="!schema.items" class="text-tip">请先设置数组元素类型。</div>
    <template v-else>
      <!-- 复用表格输入的容器和列布局，数组操作集中在左侧，不加入勾选列。 -->
      <div class="tstable-container border bg-grey radius-lg tstable-no-fixedHeader">
        <!-- 共用表格滚动容器，表头和数据一起横向滚动，编辑权限不影响滚动。 -->
        <div class="tstable-main" data-array-scroll>
          <table class="tstable-body">
            <thead>
              <tr>
                <th>{{ $t('page.dragrow') }}</th>
                <th>{{ $t('page.action') }}</th>
                <th v-for="(column, index) in columns" :key="index">
                  <span :class="{ 'require-label': column.isRequired === 1 || column.isRequired === true }">{{ objectItems ? column.name : '值' }}</span>
                </th>
              </tr>
            </thead>
            <Draggable
              :value="rowList"
              :disabled="disabled"
              :animation="150"
              tag="tbody"
              handle="[data-array-drag]"
              class="tbody-main"
              draggable="[data-array-row]"
              @input="changeRows"
            >
              <tr v-for="(row, rowIndex) in rowList" :key="row.id" data-array-row>
                <td>
                  <span class="tsfont-drag cursor-pointer" :class="{ disable: disabled }" data-array-drag></span>
                </td>
                <td>
                  <div class="flex-start">
                    <span
                      class="tsfont-plus text-action mr-nm"
                      :class="{ disable: disabled }"
                      data-array-add-row
                      @click.stop="addRow(rowIndex)"
                    ></span>
                    <span
                      class="tsfont-close text-action mr-nm"
                      :class="{ disable: disabled }"
                      data-array-delete-row
                      @click.stop="deleteRow(rowIndex)"
                    ></span>
                  </div>
                </td>
                <td v-for="(column, columnIndex) in columns" :key="columnIndex" @click.stop>
                  <!-- 数组基础单元格仅保留输入控件，隐藏提示和移除入口，不隐式补写空值。 -->
                  <ValueCell
                    :value="cellValue(row.value, column)"
                    :schema="column"
                    :disabled="disabled"
                    :showRemove="false"
                    :showValueHints="false"
                    :path="cellPath(rowIndex, column)"
                    @change="changeCell(rowIndex, column, $event)"
                    @open="openCell(rowIndex, column, columnIndex)"
                  ></ValueCell>
                </td>
              </tr>
            </Draggable>
          </table>
        </div>
      </div>
      <span
        v-if="!rowList.length"
        class="text-href tsfont-plus"
        :class="{ disable: disabled }"
        data-array-add-first
        @click="addRow()"
      >新增行</span>
    </template>
  </div>
</template>
<script>
import Draggable from 'vuedraggable';
import isEqual from 'lodash/isEqual';
import ValueBase from './value-base.js';
import ValueCell from './value-cell.vue';
import { setAtPath, hasOwn } from './editor-utils.js';
import { cloneJson, createDefaultValue, normalizeDefaultType } from '../integration-default-utils.js';
export default {
  components: { Draggable, ValueCell },
  extends: ValueBase,
  data() {
    return { rowList: [], rowSequence: 0, viewportWidth: null };
  },
  mounted() {
    // 使用主参数区域的可视边界，不能以已被宽数组撑开的单元格宽度作为依据。
    this.widthBoundary = this.$el.closest('[data-integration-param-container]') || this.$el.parentElement;
    if (window.ResizeObserver && this.widthBoundary) {
      this.widthObserver = new window.ResizeObserver(this.updateViewportWidth);
      this.widthObserver.observe(this.widthBoundary);
      if (this.$el.parentElement !== this.widthBoundary) this.widthObserver.observe(this.$el.parentElement);
    }
    window.addEventListener('resize', this.updateViewportWidth);
    this.$nextTick(this.updateViewportWidth);
  },
  updated() {
    // 切换子级、字段结构和展开区域后，重新计算当前编辑器的左侧缩进。
    this.updateViewportWidth();
  },
  beforeDestroy() {
    if (this.widthObserver) this.widthObserver.disconnect();
    window.removeEventListener('resize', this.updateViewportWidth);
  },
  methods: {
    updateViewportWidth() {
      const boundary = this.widthBoundary;
      if (!boundary || !boundary.clientWidth || !this.$el) return;
      const offset = this.$el.getBoundingClientRect().left - boundary.getBoundingClientRect().left - boundary.clientLeft + boundary.scrollLeft;
      let rightInset = parseFloat(window.getComputedStyle(boundary).paddingRight) || 0;
      // 保留所属面板和单元格已有右内边距，避免滚动条最右端被外层容器裁切。
      for (let parent = this.$el.parentElement; parent && parent !== boundary; parent = parent.parentElement) {
        const style = window.getComputedStyle(parent);
        rightInset += (parseFloat(style.paddingRight) || 0) + (parseFloat(style.borderRightWidth) || 0);
      }
      const width = Math.max(0, Math.floor(boundary.clientWidth - offset - rightInset));
      if (this.viewportWidth !== width) this.viewportWidth = width;
    },
    createRow(value) {
      // 临时行键与值分离，相同的基础值也能稳定拖动；行键不写入默认值配置。
      return { id: ++this.rowSequence, value: cloneJson(value) };
    },
    syncRows(value) {
      const rows = Array.isArray(value) ? value : [];
      // 自身编辑后的同值回显保留行键，真正的外部更新则用新副本同步，避免覆盖来源。
      if (!isEqual(rows, this.rows)) this.rowList = rows.map(this.createRow);
    },
    changeRows(rows) {
      if (this.disabled) return;
      this.rowList = rows;
      this.updateValue(cloneJson(this.rows));
    },
    cellValue(row, column) { return this.objectItems ? (hasOwn(row, column.name) ? row[column.name] : undefined) : row; },
    cellPath(index, column) { return `${this.path} 第 ${index + 1} 行${this.objectItems ? '的 ' + column.name : '的值'}`; },
    changeCell(index, column, value) {
      if (this.disabled || !this.rowList[index]) return;
      // 单元格编辑仅替换本地值副本，保留当前行的键和其余行的顺序。
      const rows = this.rowList.slice();
      rows[index] = { ...rows[index], value: setAtPath(rows[index].value, this.objectItems ? [column.name] : [], value) };
      this.changeRows(rows);
    },
    openCell(index, column, columnIndex) {
      if (this.disabled) return;
      this.$emit('navigate', {
        valuePath: this.objectItems ? [index, column.name] : [index],
        schemaPath: this.objectItems ? ['items', 'children', columnIndex] : ['items'],
        label: `第 ${index + 1} 行${this.objectItems ? ' → ' + column.name : ''}`
      });
    },
    addRow(index = this.rowList.length - 1) {
      if (this.disabled || !this.schema.items) return;
      // 加号在当前行后插入按元素类型初始化的新行，空数组从第一行开始。
      const rows = this.rowList.slice();
      rows.splice(index + 1, 0, this.createRow(createDefaultValue(this.schema.items)));
      this.changeRows(rows);
    },
    deleteRow(index) {
      if (this.disabled || !this.rowList[index]) return;
      const rows = this.rowList.slice();
      rows.splice(index, 1);
      this.changeRows(rows);
    }
  },
  computed: {
    viewportStyle() {
      // 首次测量前不让宽表参与父级自动表格的固有宽度计算，随后使用可视宽度边界。
      return this.viewportWidth === null ? { width: '0px', minWidth: '100%' } : { width: `${this.viewportWidth}px` };
    },
    rows() { return this.rowList.map(row => row.value); },
    objectItems() { return this.schema.items && normalizeDefaultType(this.schema.items.type) === 'object'; },
    columns() { return this.objectItems ? (this.schema.items.children || []) : [this.schema.items]; }
  },
  watch: {
    value: { handler: 'syncRows', deep: true, immediate: true }
  }
};
</script>
