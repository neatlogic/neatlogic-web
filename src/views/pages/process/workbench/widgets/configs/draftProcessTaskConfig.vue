<template>
  <div class="draft-process-task-config">
    <TsFormItem label="每页展示条数" labelPosition="top">
      <TsFormSelect
        :value="pageSize"
        :dataList="pageSizeDataList"
        :clearable="false"
        :transfer="true"
        @change="value => setConfig('pageSize', value)"
      ></TsFormSelect>
    </TsFormItem>

    <TsFormItem label="时间范围" labelPosition="top">
      <TimeSelect
        :value="startTimeCondition"
        :transfer="true"
        :clearable="true"
        @change="changeTimeRange"
      ></TimeSelect>
    </TsFormItem>

    <ProcessTaskTheadConfig
      :value="config.theadList"
      :portalWidgetName="portalWidgetName"
      :handler="theadHandler"
      @change="value => setConfig('theadList', value)"
    ></ProcessTaskTheadConfig>
  </div>
</template>

<script>
import {
  DRAFT_PROCESS_TASK_WIDGET_NAME,
  PROCESS_TASK_PAGE_SIZE_LIST,
  PROCESS_TASK_THEAD_HANDLER,
  createTimeRangeConditionConfig,
  normalizePageSize
} from '../utils/process-task-search.js';

export default {
  name: 'DraftProcessTaskConfig',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TimeSelect: () => import('@/resources/components/TimeSelect/TimeSelect.vue'),
    ProcessTaskTheadConfig: () => import('./process-task-thead-config.vue')
  },
  props: {
    widget: { type: Object, default: () => ({}) },
    definition: { type: Object, default: () => ({}) },
    setConfig: { type: Function, required: true }
  },
  methods: {
    changeTimeRange(startTimeCondition) {
      this.setConfig('conditionConfig', createTimeRangeConditionConfig({ startTimeCondition }));
    }
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
        text: value + ' 条/页'
      }));
    },
    startTimeCondition() {
      return this.config.conditionConfig && this.config.conditionConfig.startTimeCondition;
    },
    portalWidgetName() {
      return DRAFT_PROCESS_TASK_WIDGET_NAME;
    },
    theadHandler() {
      return PROCESS_TASK_THEAD_HANDLER;
    }
  }
};
</script>
