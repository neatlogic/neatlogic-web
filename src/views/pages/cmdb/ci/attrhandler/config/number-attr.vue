<template>
  <div>
    <TsForm :item-list="formConfig" :clearable="false"></TsForm>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {
    config: { type: Object }
  },
  data() {
    const _this = this;
    return {
      myConfig: {},
      formConfig: {
        format: {
          type: 'select',
          label: '小数位',
          dataList: [
            { value: 'auto', text: '自动' },
            { value: '1', text: '1' },
            { value: '2', text: '2' },
            { value: '3', text: '3' },
            { value: '4', text: '4' }
          ],
          transfer: true,
          onChange: val => {
            this.setConfig('format', val);
          }
        },
        isMetric: {
          type: 'switch',
          label: '另存为性能数据',
          trueValue: 1,
          falseValue: 0,
          onChange: val => {
            this.setConfig('isMetric', val);
          }
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
    setConfig(key, value) {
      this.$set(this.myConfig, key, value);
      this.$emit('setConfig', this.myConfig);
    }
  },
  filter: {},
  computed: {},
  watch: {
    config: {
      handler: function(val) {
        this.myConfig = Object.assign({ format: 'auto', isMetric: 0 }, val || {});
        if (this.myConfig) {
          for (const k in this.myConfig) {
            if (this.formConfig[k]) {
              this.formConfig[k].value = this.myConfig[k];
            }
          }
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less"></style>
