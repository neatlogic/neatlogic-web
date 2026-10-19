<template>
  <div>
    <div v-if="fixedColumns.length && !readonlyFixed" class="text-tip mb-sm">字段名称、类型及必填要求由处理器提供，只能补充未声明的子级结构。</div>
    <!-- 复用用户管理的表格悬浮操作，字段行只保留实际配置内容。 -->
    <TsTable
      :theadList="theadList"
      :tbodyList="columnRows"
      keyName="uuid"
      :fixedHeader="false"
      :showPager="false"
      :canSelectRow="false"
    >
      <template slot="name" slot-scope="{ row }">
        <!-- 字段名称不参与撑宽；固定列名只省略展示，输入仍保留完整内容。 -->
        <div data-default-control-width style="width: 9em; min-width: 9em; max-width: 9em; white-space: normal; overflow-wrap: anywhere">
          <ParamText v-if="readOnlyTable" :value="row.column.name"></ParamText>
          <TsFormInput
            v-else
            :value="row.column.name"
            :disabled="disabled || fixed"
            @change="changeColumn(columnRows.indexOf(row), 'name', $event)"
          ></TsFormInput>
        </div>
      </template>
      <template slot="type" slot-scope="{ row }">
        <div data-default-control-width style="width: 9em; min-width: 9em; max-width: 9em; white-space: normal; overflow-wrap: anywhere">
          <ParamText v-if="readOnlyTable" :value="typeName(row.column.type)"></ParamText>
          <TsFormSelect
            v-else
            :value="row.column.type"
            :dataList="types"
            :disabled="disabled || fixed"
            :clearable="false"
            :transfer="true"
            @change="changeType(columnRows.indexOf(row), $event)"
          ></TsFormSelect>
        </div>
      </template>
      <template slot="isRequired" slot-scope="{ row }">
        <span v-if="readOnlyTable">{{ row.column.isRequired === 1 || row.column.isRequired === true ? '是' : '否' }}</span>
        <TsFormSwitch
          v-else
          :value="row.column.isRequired === 1 || row.column.isRequired === true"
          :true-value="true"
          :false-value="false"
          :disabled="disabled || fixed"
          @change="changeColumn(columnRows.indexOf(row), 'isRequired', $event ? 1 : 0)"
        ></TsFormSwitch>
      </template>
      <template v-if="canModify" slot="action" slot-scope="{ row }">
        <div class="tstable-action" data-column-actions>
          <ul class="tstable-action-ul">
            <li data-column-add @click.stop="addColumn(columnRows.indexOf(row))">添加</li>
            <li data-column-copy @click.stop="copyColumn(columnRows.indexOf(row))">复制</li>
            <li data-column-delete @click.stop="deleteColumn(columnRows.indexOf(row))">删除</li>
            <li :class="{ disable: columnRows.indexOf(row) === 0 }" data-column-up @click.stop="moveColumn(columnRows.indexOf(row), -1)">上移</li>
            <li :class="{ disable: columnRows.indexOf(row) === columnRows.length - 1 }" data-column-down @click.stop="moveColumn(columnRows.indexOf(row), 1)">下移</li>
          </ul>
        </div>
      </template>
    </TsTable>
    <span
      v-if="!columnRows.length && canModify"
      class="text-href tsfont-plus"
      data-column-add-first
      @click="addColumn()"
    >新增列</span>
  </div>
</template>
<script>
import { cloneJson } from '../integration-default-utils.js';
import { defaultTypeList } from './index.js';
import TsTable from './default-value-table.js';
import ParamText from './param-text.vue';
export default {
  components: {
    TsTable,
    ParamText,
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput.vue'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect.vue'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch.vue')
  },
  props: {
    columns: { type: Array, default: () => [] },
    fixedColumns: { type: Array, default: () => [] },
    disabled: { type: Boolean, default: false },
    readonlyFixed: { type: Boolean, default: false }
  },
  data() {
    return { columnRows: [], nextRowKey: 0 };
  },
  methods: {
    createColumnRow(column) {
      // 页面行键独立于可编辑列名，仅包装于本地，不混入 schema.children。
      return { uuid: `default-column-${++this.nextRowKey}`, column: cloneJson(column) };
    },
    emitColumns() {
      this.$emit('change', this.columnRows.map(row => cloneJson(row.column)));
    },
    typeName(type) { const option = this.types.find(item => item.value === type); return option ? option.text : type; },
    changeColumn(index, key, value) {
      if (!this.canModify || !this.columnRows[index]) return;
      this.$set(this.columnRows[index].column, key, value);
      this.emitColumns();
    },
    changeType(index, type) {
      if (!this.canModify || !this.columnRows[index]) return;
      const previous = this.columnRows[index].column;
      // 这里只更新结构草稿，是否清空既有默认数据继续由外层确认。
      this.columnRows[index].column = { name: previous.name, isRequired: previous.isRequired, type };
      this.emitColumns();
    },
    addColumn(index) {
      if (!this.canModify) return;
      const position = Number.isInteger(index) ? index + 1 : this.columnRows.length;
      this.columnRows.splice(position, 0, this.createColumnRow({ name: '', type: 'string', isRequired: 0 }));
      this.emitColumns();
    },
    copyColumn(index) {
      if (!this.canModify || !this.columnRows[index]) return;
      // 深拷贝字段子结构但清空列名，既有数据不会自动复制到新字段。
      const column = cloneJson(this.columnRows[index].column);
      column.name = '';
      this.columnRows.splice(index + 1, 0, this.createColumnRow(column));
      this.emitColumns();
    },
    deleteColumn(index) {
      if (!this.canModify || !this.columnRows[index]) return;
      this.columnRows.splice(index, 1);
      this.emitColumns();
    },
    moveColumn(index, offset) {
      const target = index + offset;
      // 方法同时校验边界，置灰入口或程序调用都不能把首末行移出数组。
      if (!this.canModify || !this.columnRows[index] || !this.columnRows[target] || ![-1, 1].includes(offset)) return;
      const row = this.columnRows.splice(index, 1)[0];
      this.columnRows.splice(target, 0, row);
      this.emitColumns();
    }
  },
  computed: {
    types() { return defaultTypeList; },
    fixed() { return this.fixedColumns.length > 0; },
    readOnlyTable() { return this.fixed && this.readonlyFixed; },
    canModify() { return !this.disabled && !this.fixed; },
    theadList() {
      // 开关与操作栏维持原有紧凑尺寸，文本控件列由局部表格统一计算宽度。
      const headers = [{ key: 'name', title: '列名' }, { key: 'type', title: '类型' }, { key: 'isRequired', title: '必填', width: 72 }];
      if (this.canModify) headers.push({ key: 'action', width: 24 });
      return headers;
    }
  },
  watch: {
    columns: {
      immediate: true,
      deep: true,
      handler(columns) {
        // 外层会复制结构草稿；同值回显仍复用临时行键，避免输入控件被重新创建。
        const remaining = this.columnRows.slice();
        this.columnRows = columns.map(column => {
          const index = remaining.findIndex(row => JSON.stringify(row.column) === JSON.stringify(column));
          const row = index >= 0 ? remaining.splice(index, 1)[0] : this.createColumnRow(column);
          row.column = cloneJson(column);
          return row;
        });
      }
    }
  }
};
</script>
