<template>
  <div class="personal-process-task-overview-config">
    <TsFormItem :label="$t('page.timerange')" labelPosition="top">
      <TimeSelect
        :value="startTimeCondition"
        :isMore="true"
        :transfer="true"
        :clearable="false"
        @change="changeTimeRange"
      ></TimeSelect>
    </TsFormItem>
  </div>
</template>

<script>
const DEFAULT_START_TIME_CONDITION = {
  timeRange: '1',
  timeUnit: 'week'
};

export default {
  name: 'PersonalProcessTaskOverviewConfig',
  components: {
    TimeSelect: () => import('@/resources/components/TimeSelect/TimeSelect.vue'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem')
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
