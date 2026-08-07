<template>
  <div class="process-task-search-config">
    <TsFormItem :label="$t('term.workbench.itemsperpage')" labelPosition="top">
      <TsFormSelect
        :value="pageSize"
        :dataList="pageSizeDataList"
        :clearable="false"
        :transfer="true"
        @change="value => setConfig('pageSize', value)"
      ></TsFormSelect>
    </TsFormItem>

    <ProcessTaskConditionConfig
      :value="config.conditionConfig"
      @change="value => setConfig('conditionConfig', value)"
    ></ProcessTaskConditionConfig>

    <ProcessTaskTheadConfig
      :value="config.theadList"
      @change="value => setConfig('theadList', value)"
    ></ProcessTaskTheadConfig>
  </div>
</template>

<script>
import {
  PROCESS_TASK_PAGE_SIZE_LIST,
  normalizePageSize
} from '../utils/process-task-search.js';

export default {
  name: 'ProcessTaskSearchConfig',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    ProcessTaskConditionConfig: () => import('./process-task-condition-config.vue'),
    ProcessTaskTheadConfig: () => import('./process-task-thead-config.vue')
  },
  props: {
    widget: { type: Object, default: () => ({}) },
    definition: { type: Object, default: () => ({}) },
    setConfig: { type: Function, required: true }
  },
  computed: {
    config() {
      return this.widget.config || {};
    },
    pageSize() {
      return normalizePageSize(this.config.pageSize);
    },
    pageSizeDataList() {
      return PROCESS_TASK_PAGE_SIZE_LIST.map(value => ({
        value,
        text: this.$t('term.workbench.itemsperpageoption', { count: value })
      }));
    }
  }
};
</script>
