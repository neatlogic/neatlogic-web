<template>
  <div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">{{ $t('term.report.autoscroll') }}</label>
      <div class="ivu-form-item-content">
        <TsFormSwitch
          :value="config.autoscroll"
          :true-value="true"
          :false-value="false"
          @change="
            val => {
              setConfigValue('autoscroll', val);
            }
          "
        ></TsFormSwitch>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve)
  },
  props: { config: { type: Object } },
  data() {
    return {
      myConfig: {},
      formConfig: {
        autoscroll: {
          type: 'switch',
          label: this.$t('term.report.autoscroll')
        }
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    setConfigValue(attrName, attrValue) {
      if (attrName) {
        this.$emit('setConfig', attrName, attrValue);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
