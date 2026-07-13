<template>
  <div class="report-filter-list">
    <div class="section-title">
      <span>WHERE</span>
      <Button
        type="text"
        size="small"
        :disabled="!fieldList.length || !paramList.length"
        @click="addFilter"
      >{{ $t('term.report.addcondition') }}</Button>
    </div>
    <div v-if="!fieldList.length" class="text-grey">{{ $t('term.report.dragdatatablefirst') }}</div>
    <div v-else-if="!paramList.length" class="text-grey">{{ $t('term.report.addparamfirst') }}</div>
    <div v-else-if="!filterList.length" class="text-grey">{{ $t('term.report.nofiltercondition') }}</div>
    <div
      v-for="(filter, index) in filterList"
      :key="index"
      class="filter-item"
    >
      <Select
        v-model="filter.fieldKey"
        filterable
        transfer
        :placeholder="$t('term.report.selectfield')"
        @on-change="changeField(filter)"
      >
        <Option
          v-for="field in fieldList"
          :key="field.value"
          :value="field.value"
          :label="field.text"
        >
          <span :title="field.description">{{ field.text }}<span v-if="field.type" class="text-grey"> · {{ field.type }}</span></span>
        </Option>
      </Select>
      <div class="filter-row mt-xs">
        <Select
          v-model="filter.operator"
          transfer
          class="operator-select"
          @on-change="emitChange"
        >
          <Option
            v-for="operator in operatorList"
            :key="operator.value"
            :value="operator.value"
          >{{ operator.text }}</Option>
        </Select>
        <TsFormSelect
          v-model="filter.paramName"
          class="param-select"
          :dataList="paramList"
          :transfer="true"
          :search="true"
          :placeholder="$t('term.report.selectparam')"
          @on-change="emitChange"
        ></TsFormSelect>
        <Button type="text" size="small" @click="removeFilter(index)">{{ $t('page.delete') }}</Button>
      </div>
    </div>
  </div>
</template>
<script>
const OPERATOR_LIST = ['=', '!=', 'LIKE', 'IN', 'BETWEEN', '>', '>=', '<', '<='].map(item => ({
  value: item,
  text: item
}));

export default {
  name: 'ReportFilterList',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect.vue')
  },
  props: {
    value: { type: Array, default: () => [] },
    fieldList: { type: Array, default: () => [] },
    paramList: { type: Array, default: () => [] }
  },
  data() {
    return {
      operatorList: OPERATOR_LIST,
      filterList: []
    };
  },
  methods: {
    getFieldKey(filter) {
      if (!filter) {
        return '';
      }
      const tableAlias = filter.tableAlias || filter.alias;
      const fieldName = filter.fieldName || filter.name;
      return tableAlias && fieldName ? `${tableAlias}.${fieldName}` : '';
    },
    getFieldByKey(fieldKey) {
      return this.fieldList.find(field => field.value === fieldKey) || null;
    },
    normalizeFilterList(list) {
      return (list || []).map(item => {
        const filter = Object.assign({}, item);
        filter.fieldKey = filter.fieldKey || this.getFieldKey(filter);
        const operator = String(filter.operator || '=').toUpperCase();
        filter.operator = this.operatorList.some(item => item.value === operator) ? operator : '=';
        filter.paramName = filter.paramName || (this.paramList[0] || {}).value || '';
        return filter;
      });
    },
    addFilter() {
      const field = this.fieldList[0];
      const param = this.paramList[0];
      if (!field || !param) {
        return;
      }
      this.filterList.push({
        fieldKey: field.value,
        tableAlias: field.tableAlias,
        fieldName: field.fieldName,
        operator: '=',
        paramName: param.value
      });
      this.emitChange();
    },
    changeField(filter) {
      const field = this.getFieldByKey(filter.fieldKey);
      if (field) {
        filter.tableAlias = field.tableAlias;
        filter.fieldName = field.fieldName;
        if (!filter.paramName) {
          filter.paramName = (this.paramList[0] || {}).value || '';
        }
      }
      this.emitChange();
    },
    removeFilter(index) {
      this.filterList.splice(index, 1);
      this.emitChange();
    },
    emitChange() {
      const list = this.filterList
        .map(filter => {
          const field = this.getFieldByKey(filter.fieldKey) || {};
          const tableAlias = filter.tableAlias || field.tableAlias;
          const fieldName = filter.fieldName || field.fieldName;
          return {
            tableAlias: tableAlias,
            fieldName: fieldName,
            operator: filter.operator || '=',
            paramName: filter.paramName
          };
        })
        .filter(filter => filter.tableAlias && filter.fieldName && filter.paramName);
      this.$emit('change', list);
    }
  },
  watch: {
    value: {
      handler(val) {
        const nextList = this.normalizeFilterList(val);
        if (JSON.stringify(nextList) !== JSON.stringify(this.filterList)) {
          this.filterList = nextList;
        }
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.report-filter-list {
  .section-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    font-weight: bold;
  }
  .filter-item {
    margin-bottom: 10px;
  }
  .filter-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .operator-select {
    width: 82px;
    flex: none;
  }
  .param-select {
    min-width: 0;
    flex: 1;
  }
}
</style>
