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
      :actionCount="4"
    >
      <template slot="name" slot-scope="{ row }">
        <!-- 字段名称不参与撑宽；固定列名只省略展示，输入仍保留完整内容。 -->
        <div data-default-control-width style="width: 9em; min-width: 9em; max-width: 9em; white-space: normal; overflow-wrap: anywhere">
          <ParamText v-if="readOnlyTable" :value="row.column.name"></ParamText>
          <TsFormInput
            v-else
            :ref="`column-name-${row.uuid}`"
            :value="row.column.name"
            :disabled="disabled || fixed"
            @change="changeColumn(columnRows.indexOf(row), 'name', $event)"
            @on-blur="commitColumnName(columnRows.indexOf(row), $event)"
          ></TsFormInput>
          <div v-if="row.error" class="text-error" data-column-name-error>{{ row.error }}</div>
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
      <!-- 固定结构和只读表格也铺满正文，尾部只留白，不出现操作栏。 -->
      <template slot="defaultSpacer"><span></span></template>
      <template v-if="canModify" slot="action" slot-scope="{ row }">
        <div class="tstable-action" data-column-actions>
          <ul class="tstable-action-ul">
            <li data-column-add @click.stop="addColumn(columnRows.indexOf(row))">添加</li>
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
import { defaultTypeList, selectableDefaultTypeList } from './index.js';
import DefaultTypeSelect from './default-type-select.js';
import TsTable from './default-value-table.js';
import ParamText from './param-text.vue';

let columnSequence = 0;
export default {
  components: {
    TsTable,
    ParamText,
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput.vue'),
    TsFormSelect: DefaultTypeSelect,
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch.vue')
  },
  props: {
    columns: { type: Array, default: () => [] },
    fixedColumns: { type: Array, default: () => [] },
    disabled: { type: Boolean, default: false },
    readonlyFixed: { type: Boolean, default: false },
    columnKeys: { type: Object, default: () => ({}) }
  },
  data() {
    return { columnRows: [] };
  },
  methods: {
    createColumnRow(column, committed = true) {
      // 页面身份独立于列名，新增空字段先留在编辑草稿，不进入下方有效结构。
      return { uuid: committed && Object.prototype.hasOwnProperty.call(this.columnKeys, column.name) ? this.columnKeys[column.name] : `default-column-${++columnSequence}`, column: cloneJson(column), committedName: committed ? column.name : null, error: '' };
    },
    acceptedColumns() {
      return this.columnRows.filter(row => row.committedName !== null).map(row => ({ ...cloneJson(row.column), name: row.committedName }));
    },
    identities() {
      return this.columnRows.filter(row => row.committedName !== null).map(row => ({ id: row.uuid, name: row.committedName }));
    },
    emitColumns(kind, previousNames = {}, removedNames = []) {
      const fields = this.identities().map(field => ({ ...field, previousName: Object.prototype.hasOwnProperty.call(previousNames, field.id) ? previousNames[field.id] : field.name }));
      this.$emit('change', this.acceptedColumns(), { kind, fields, removedNames });
      this.$emit('identities', fields);
    },
    nameError(index, useCommitted = false) {
      const row = this.columnRows[index];
      const name = row && row.column.name;
      if (typeof name !== 'string' || !name.trim()) return '列名不能为空';
      if (this.columnRows.some((other, otherIndex) => otherIndex !== index && (other.column.name === name || (useCommitted && other.committedName === name)))) return '列名不能重复';
      return '';
    },
    commitColumnName(index, value) {
      if (!this.canModify || !this.columnRows[index]) return true;
      const row = this.columnRows[index];
      if (value !== undefined) this.$set(row.column, 'name', value);
      row.error = this.nameError(index, true);
      if (row.error) return false;
      if (row.committedName === row.column.name) return true;
      const previousNames = { [row.uuid]: row.committedName };
      row.committedName = row.column.name;
      this.emitColumns('name', previousNames);
      return true;
    },
    flushColumns() {
      if (!this.canModify) return true;
      // 确定时同步检查全部名称，即使当前输入还未触发失焦，也不能静默丢弃空字段。
      this.columnRows.forEach(row => {
        const reference = this.$refs[`column-name-${row.uuid}`];
        const input = Array.isArray(reference) ? reference[0] : reference;
        // 直接读取当前控件草稿，避免点击确定与最后一次输入/失焦处于同一更新周期。
        if (input && Object.prototype.hasOwnProperty.call(input, 'currentValue')) {
          const value = input.currentValue;
          this.$set(row.column, 'name', typeof value === 'string' ? value.trim() : value);
        }
      });
      this.columnRows.forEach((row, index) => { row.error = this.nameError(index); });
      if (this.columnRows.some(row => row.error)) return false;
      const previousNames = {};
      let changed = false;
      this.columnRows.forEach(row => {
        previousNames[row.uuid] = row.committedName;
        changed = changed || row.committedName !== row.column.name;
        row.committedName = row.column.name;
      });
      if (changed) this.emitColumns('name', previousNames);
      return true;
    },
    typeName(type) { const option = defaultTypeList.find(item => item.value === type); return option ? option.text : type; },
    changeColumn(index, key, value) {
      if (!this.canModify || !this.columnRows[index]) return;
      // 通用字段更新也不能绕过类型选择限制，历史值仅可保留或改成允许的类型。
      if (key === 'type' && !this.types.some(item => item.value === value)) return;
      const row = this.columnRows[index];
      this.$set(row.column, key, value);
      if (key === 'name') {
        // 输入时只更新上方草稿，合法名称必须在失焦或确定时才联动。
        row.error = '';
      } else if (row.committedName !== null) this.emitColumns('property');
    },
    changeType(index, type) {
      if (!this.canModify || !this.columnRows[index] || !this.types.some(item => item.value === type)) return;
      const row = this.columnRows[index];
      const previous = row.column;
      row.column = { name: previous.name, isRequired: previous.isRequired, type };
      if (row.committedName !== null) this.emitColumns('type');
    },
    addColumn(index) {
      if (!this.canModify) return;
      const position = Number.isInteger(index) ? index + 1 : this.columnRows.length;
      this.columnRows.splice(position, 0, this.createColumnRow({ name: '', type: 'string', isRequired: 0 }, false));
    },
    deleteColumn(index) {
      if (!this.canModify || !this.columnRows[index]) return;
      const [row] = this.columnRows.splice(index, 1);
      // 删除立即从弹窗有效结构隐藏，关联数据只在独立草稿内移除。
      if (row.committedName !== null) this.emitColumns('delete', {}, [row.committedName]);
    },
    moveColumn(index, offset) {
      const target = index + offset;
      if (!this.canModify || !this.columnRows[index] || !this.columnRows[target] || ![-1, 1].includes(offset)) return;
      const row = this.columnRows.splice(index, 1)[0];
      this.columnRows.splice(target, 0, row);
      this.emitColumns('move');
    }

  },
  computed: {
    types() { return selectableDefaultTypeList; },
    fixed() { return this.fixedColumns.length > 0; },
    readOnlyTable() { return this.fixed && this.readonlyFixed; },
    canModify() { return !this.disabled && !this.fixed; },
    theadList() {
      // 开关与操作栏维持原有紧凑尺寸，文本控件列由局部表格统一计算宽度。
      const headers = [{ key: 'name', title: '列名' }, { key: 'type', title: '类型' }, { key: 'isRequired', title: '必填', width: 72 }];
      if (this.canModify) headers.push({ key: 'action', width: 24 });
      else headers.push({ key: 'defaultSpacer', title: '', width: 24 });
      return headers;
    }
  },
  watch: {
    columns: {
      immediate: true,
      deep: true,
      handler(columns) {
        // 同值确认不覆盖尚未失焦的名称及新增空行；外部恢复仍按已提交名称复用身份。
        if (JSON.stringify(columns) === JSON.stringify(this.acceptedColumns())) return;
        const remaining = this.columnRows.slice();
        this.columnRows = columns.map(column => {
          const index = remaining.findIndex(row => row.committedName === column.name);
          const row = index >= 0 ? remaining.splice(index, 1)[0] : this.createColumnRow(column);
          row.column = cloneJson(column);
          row.committedName = column.name;
          return row;
        });
        this.$emit('identities', this.identities());
      }
    }
  }
};
</script>
