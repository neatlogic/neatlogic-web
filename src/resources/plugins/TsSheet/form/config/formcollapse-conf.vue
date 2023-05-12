<template>
  <div>
    <TsFormItem :label="$t('page.easymode')" labelPosition="left" contentAlign="right">
      <TsFormSwitch
        v-model="config.isSimple"
        :trueValue="true"
        :falseValue="false"
        :disabled="disabled"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem :label="$t('page.accordionmode')" labelPosition="left" contentAlign="right">
      <TsFormSwitch
        v-model="config.isAccordion"
        :trueValue="true"
        :falseValue="false"
        :disabled="disabled"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem :label="$t('page.panel')" labelPosition="top" required>
      <div class="radius-sm padding-md" :class="validClass('panelList')">
        <StaticDataEditor v-model="config.panelList" :disabled="disabled"></StaticDataEditor>
      </div>
    </TsFormItem>
  </div>
</template>
<script>
import base from './base-config.vue';

export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    StaticDataEditor: resolve => require(['./common/static-data-editor.vue'], resolve)
  },
  extends: base,
  props: {},
  data() {
    return {
    };
  },
  beforeCreate() {},
  async created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {},
  filter: {},
  computed: {},
  watch: {}
};
</script>
