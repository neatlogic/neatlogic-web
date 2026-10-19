<template>
  <div class="tstable-container border radius-md">
    <table class="tstable-body">
      <thead><tr><th>字段</th><th>默认值</th></tr></thead>
      <tbody class="tbody-main">
        <tr v-for="(column, index) in schema.children || []" :key="index">
          <td :class="{ 'require-label': column.isRequired === 1 || column.isRequired === true }">{{ column.name }}</td>
          <td>
            <ValueCell
              :value="fieldValue(column)"
              :schema="column"
              :disabled="disabled"
              :path="path + '.' + column.name"
              @change="changeField(column, $event)"
              @open="openField(column, index)"
            ></ValueCell>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import ValueBase from './value-base.js';
import ValueCell from './value-cell.vue';
import { setAtPath, hasOwn } from './editor-utils.js';
export default {
  components: { ValueCell },
  extends: ValueBase,
  methods: {
    fieldValue(column) { return hasOwn(this.value, column.name) ? this.value[column.name] : undefined; },
    changeField(column, value) { this.updateValue(setAtPath(this.value || {}, [column.name], value)); },
    openField(column, index) {
      // 子级在现有编辑区切换，避免连续弹出多个对话框。
      if (!this.disabled) this.$emit('navigate', { valuePath: [column.name], schemaPath: ['children', index], label: column.name });
    }
  }
};
</script>
