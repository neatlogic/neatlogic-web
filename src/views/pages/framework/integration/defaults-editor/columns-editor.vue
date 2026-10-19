<template>
  <div>
    <div v-if="fixedColumns.length" class="text-tip mb-sm">字段名称、类型及必填要求由处理器提供，只能补充未声明的子级结构。</div>
    <div class="tstable-container border radius-md">
      <table class="tstable-body">
        <thead><tr><th>列名</th><th>类型</th><th>必填</th><th>操作</th></tr></thead>
        <tbody class="tbody-main">
          <tr v-for="(column, index) in columns" :key="index">
            <td><TsFormInput :value="column.name" :disabled="disabled || fixed" @change="changeColumn(index, 'name', $event)"></TsFormInput></td>
            <td>
              <TsFormSelect
                :value="column.type"
                :dataList="types"
                :disabled="disabled || fixed"
                :clearable="false"
                :transfer="true"
                @change="changeType(index, $event)"
              ></TsFormSelect>
            </td>
            <td>
              <TsFormSwitch
                :value="column.isRequired === 1 || column.isRequired === true"
                :true-value="true"
                :false-value="false"
                :disabled="disabled || fixed"
                @change="changeColumn(index, 'isRequired', $event ? 1 : 0)"
              ></TsFormSwitch>
            </td>
            <td>
              <div class="action-group">
                <!-- 复杂字段直接录入 JSON，不再提供子结构配置入口；既有结构继续保留。 -->
                <span
                  v-if="!fixed"
                  class="action-item text-href"
                  :class="{ disable: disabled }"
                  @click="deleteColumn(index)"
                >删除</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <span
      v-if="!fixed"
      class="text-href tsfont-plus"
      :class="{ disable: disabled }"
      @click="addColumn"
    >新增列</span>
  </div>
</template>
<script>
import { cloneJson } from '../integration-default-utils.js';
import { defaultTypeList } from './index.js';
export default {
  components: {
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput.vue'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect.vue'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch.vue')
  },
  props: {
    columns: { type: Array, default: () => [] },
    fixedColumns: { type: Array, default: () => [] },
    disabled: { type: Boolean, default: false }
  },
  methods: {
    changeColumn(index, key, value) {
      if (this.disabled || this.fixed) return;
      const columns = cloneJson(this.columns);
      columns[index][key] = value;
      this.$emit('change', columns);
    },
    changeType(index, type) {
      if (this.disabled || this.fixed) return;
      const columns = cloneJson(this.columns);
      const previous = columns[index];
      // 这里仅更新结构草稿；清空已录入数据需在外层确定结构时统一确认。
      columns[index] = { name: previous.name, isRequired: previous.isRequired, type };
      this.$emit('change', columns);
    },
    addColumn() {
      if (!this.disabled && !this.fixed) this.$emit('change', [...cloneJson(this.columns), { name: '', type: 'string', isRequired: 0 }]);
    },
    deleteColumn(index) {
      if (this.disabled || this.fixed) return;
      const columns = cloneJson(this.columns);
      columns.splice(index, 1);
      this.$emit('change', columns);
    }
  },
  computed: {
    types() { return defaultTypeList; },
    fixed() { return this.fixedColumns.length > 0; }
  }
};
</script>
