<template>
  <div class="personal-process-task-overview-config">
    <TsFormItem label="时间范围" labelPosition="top">
      <TimeSelect
        :value="startTimeCondition"
        :isMore="true"
        :transfer="true"
        :clearable="false"
        @change="changeTimeRange"
      ></TimeSelect>
    </TsFormItem>

    <!-- <TsFormItem label="显示状态进度" labelPosition="top">
      <TsFormSwitch
        :value="config.showTrend"
        :trueValue="1"
        :falseValue="0"
        :showStatus="true"
        @on-change="value => setConfig('showTrend', value)"
      ></TsFormSwitch>
    </TsFormItem> -->
  </div>
</template>

<script>
const DEFAULT_START_TIME_CONDITION = {
  timeRange: '1',
  timeUnit: 'year'
};

export default {
  name: 'PersonalProcessTaskOverviewConfig',
  components: {
    TimeSelect: () => import('@/resources/components/TimeSelect/TimeSelect.vue'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem')//,
    // TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
  },
  props: {
    widget: { type: Object, default: () => ({}) },
    definition: { type: Object, default: () => ({}) },
    setConfig: { type: Function, required: true }
  },
  methods: {
    changeTimeRange(startTimeCondition) {
      this.setConfig('startTimeCondition', startTimeCondition || { ...DEFAULT_START_TIME_CONDITION });
    }
  },
  computed: {
    config() {
      return this.widget.config || {};
    },
    startTimeCondition() {
      return this.config.startTimeCondition || DEFAULT_START_TIME_CONDITION;
    }
  }
};
</script>
