<template>
  <div :style="viewportStyle">
    <div v-if="!schema.items" class="text-tip">请先设置数组元素类型。</div>
    <template v-else>
      <!-- 复用用户管理的行尾悬浮栏及横向滚动，行操作不再占用字段左侧空间。 -->
      <TsTable
        :theadList="theadList"
        :tbodyList="rowList"
        keyName="id"
        :fixedHeader="false"
        :showPager="false"
        :canSelectRow="false"
        data-array-table
      >
        <template v-for="field in tableFields" :slot="field.key" slot-scope="{row}">
          <!-- 行键和字段名共同稳定单元格，移动后保留 JSON 原文本及非法输入草稿。 -->
          <!-- 固定控件外框为当前字号的九个汉字宽度，错误在同一宽度内换行。 -->
          <div
            :key="field.key"
            data-default-control-width
            style="width: 9em; min-width: 9em; max-width: 9em; white-space: normal; overflow-wrap: anywhere"
            @click.stop
          >
            <ValueCell
              :key="`${row.id}:${field.key}:${field.column.type}`"
              ref="valueCells"
              :value="cellValue(row.value, field.column)"
              :schema="field.column"
              :disabled="disabled"
              :showRemove="false"
              :showValueHints="false"
              :deferValidation="deferValidation"
              :path="cellPath(rowList.indexOf(row), field.column)"
              @change="changeCell(rowList.indexOf(row), field.column, $event)"
              @open="openCell(rowList.indexOf(row), field.column, field.index)"
            ></ValueCell>
          </div>
        </template>
        <!-- 只读尾列仅承接剩余宽度，不渲染占位文字或操作入口。 -->
        <template slot="defaultSpacer"><span></span></template>
        <template v-if="!disabled" slot="action" slot-scope="{row}">
          <div class="tstable-action">
            <ul class="tstable-action-ul">
              <li data-array-add-row @click.stop="addRow(rowList.indexOf(row))">添加</li>
              <li data-array-copy-row @click.stop="copyRow(rowList.indexOf(row))">复制</li>
              <li data-array-delete-row @click.stop="deleteRow(rowList.indexOf(row))">删除</li>
              <li :class="{ disable: rowList.indexOf(row) === 0 }" data-array-move-up @click.stop="moveRow(rowList.indexOf(row), -1)">上移</li>
              <li :class="{ disable: rowList.indexOf(row) === rowList.length - 1 }" data-array-move-down @click.stop="moveRow(rowList.indexOf(row), 1)">下移</li>
            </ul>
          </div>
        </template>
      </TsTable>
      <span
        v-if="!disabled && !rowList.length"
        class="text-href tsfont-plus"
        :class="{ disable: disabled }"
        data-array-add-first
        @click="addRow()"
      >新增行</span>
    </template>
  </div>
</template>
<script>
import TsTable from './default-value-table.js';
import isEqual from 'lodash/isEqual';
import ValueBase from './value-base.js';
import ValueCell from './value-cell.vue';
import { setAtPath, hasOwn } from './editor-utils.js';
import { cloneJson, createDefaultValue, normalizeDefaultType } from '../integration-default-utils.js';
export default {
  components: { TsTable, ValueCell },
  extends: ValueBase,
  props: {
    columnKeys: { type: Object, default: () => ({}) },
    deferValidation: { type: Boolean, default: false }
  },
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
    valueCells() {
      // 插槽内循环引用由 Vue 汇集，稳定行列键保证排序、改名仍保留各单元格校验阶段。
      const cells = this.$refs.valueCells;
      return Array.isArray(cells) ? cells : cells ? [cells] : [];
    },
    flushInputs() { this.valueCells().forEach(cell => cell.flushInput()); },
    validateForSubmit() {
      // 不用 every 短路，让全部必填错误都在本次确定后显现。
      const results = this.valueCells().map(cell => cell.validateForSubmit());
      return results.every(Boolean);
    },
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
      // 临时行键与值分离，相同基础值可独立编辑和排序；行键不写入默认值配置。
      return { id: ++this.rowSequence, value: cloneJson(value) };
    },
    syncRows(value) {
      const rows = Array.isArray(value) ? value : [];
      // 自身编辑后的同值回显保留行键，真正的外部更新则用新副本同步，避免覆盖来源。
      if (!isEqual(rows, this.rows)) {
        // 结构改名、删除仅替换每行值，不重建单元格，保留 JSON 原文本和非法草稿。
        this.rowList = rows.map((row, index) => {
          const previous = this.rowList[index];
          if (!previous) return this.createRow(row);
          previous.value = cloneJson(row);
          return previous;
        });
      }
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
      // 仅替换本地值副本，保留包装对象身份，同一轮多字段输入仍可定位当前行。
      const rows = this.rowList.slice();
      rows[index].value = setAtPath(rows[index].value, this.objectItems ? [column.name] : [], value);
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
    },
    copyRow(index) {
      if (this.disabled || !this.rowList[index]) return;
      // 复制值使用深副本和新行键，避免对象、数组的后续编辑影响来源。
      const rows = this.rowList.slice();
      rows.splice(index + 1, 0, this.createRow(this.rowList[index].value));
      this.changeRows(rows);
    },
    moveRow(index, offset) {
      const target = index + offset;
      if (this.disabled || (offset !== -1 && offset !== 1) || !this.rowList[index] || target < 0 || target >= this.rowList.length) return;
      // 仅移动行记录，保留临时键和单元格草稿，首末边界同时在方法内拦截。
      const rows = this.rowList.slice();
      const [row] = rows.splice(index, 1);
      rows.splice(target, 0, row);
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
    columns() { return this.objectItems ? (this.schema.items.children || []) : [this.schema.items]; },
    tableFields() {
      // 内部列键不使用业务字段名，避免 action、selection 等名称占用公共表格插槽。
      return this.columns.map((column, index) => ({ key: `arrayField${this.objectItems && Object.prototype.hasOwnProperty.call(this.columnKeys, column.name) ? this.columnKeys[column.name] : index}`, column, index }));
    },
    theadList() {
      // 数据列宽由局部表格按九字控件宽度计算，不再受表头长度或可用空间均分影响。
      const actionWidth = this.disabled ? 0 : 24;
      const fields = this.tableFields.map(field => ({
        key: field.key,
        uuid: field.key,
        title: this.objectItems ? field.column.name : '值',
        isRequired: field.column.isRequired === 1 || field.column.isRequired === true
      }));
      if (!this.disabled) fields.push({ key: 'action', width: actionWidth });
      else fields.push({ key: 'defaultSpacer', title: '', width: 24 });
      return fields;
    }
  },
  watch: {
    value: { handler: 'syncRows', deep: true, immediate: true }
  }
};
</script>
