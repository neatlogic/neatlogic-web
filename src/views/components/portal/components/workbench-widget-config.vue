<template>
  <div class="workbench-widget-config">
    <TsFormItem
      v-for="schema in configSchema"
      :key="schema.name"
      :label="schema.label"
      labelPosition="top"
    >
      <TsFormSwitch
        v-if="schema.type === 'switch'"
        :value="getConfigValue(schema.name)"
        :trueValue="1"
        :falseValue="0"
        :showStatus="true"
        @on-change="value => setConfig(schema.name, value)"
      ></TsFormSwitch>
      <Slider
        v-else-if="schema.type === 'slider'"
        :value="getConfigValue(schema.name)"
        :min="schema.min"
        :max="schema.max"
        :step="schema.step || 1"
        @input="value => setConfig(schema.name, value)"
      ></Slider>
      <TsFormSelect
        v-else-if="schema.type === 'select'"
        :value="getConfigValue(schema.name)"
        :dataList="schema.dataList"
        :transfer="true"
        @change="value => setConfig(schema.name, value)"
      ></TsFormSelect>
      <TsFormInput
        v-else
        :value="getConfigValue(schema.name)"
        :type="schema.type"
        :min="schema.min"
        :max="schema.max"
        @change="value => setConfig(schema.name, value)"
      ></TsFormInput>
    </TsFormItem>
    <NoData v-if="configSchema.length === 0" text="该组件没有独立配置"></NoData>
  </div>
</template>

<script>
export default {
  name: 'PortalWorkbenchWidgetConfig',
  components: {
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  props: {
    widget: { type: Object, default: () => ({}) },
    definition: { type: Object, default: () => ({}) },
    setConfig: { type: Function, required: true }
  },
  methods: {
    getConfigValue(name) {
      return this.widget.config && this.widget.config[name];
    }
  },
  computed: {
    configSchema() {
      return this.definition.configSchema || [];
    }
  }
};
</script>
