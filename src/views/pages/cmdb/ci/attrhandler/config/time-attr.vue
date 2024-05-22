<template>
  <div>
    <TsForm :item-list="formConfig" :clearable="false">
    </TsForm>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {
    config: {type: Object}
  },
  data() {
    const _this = this;
    return {
      myConfig: {},
      formConfig: {
        format: {
          type: 'select',
          label: '格式',
          dataList: [
            {value: 'HH:mm:ss', text: 'HH:mm:ss'},
            {value: 'HH:mm', text: 'HH:mm'},
            {value: 'HH', text: 'HH'}],
          transfer: true,
          onChange: (val) => {
            this.$set(this.myConfig, 'format', val);
          }
        }
      }};
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
  },
  filter: {},
  computed: {
  },
  watch: {
    myConfig: {
      handler: function(val) {
        this.$emit('setConfig', val);
      },
      deep: true
    },
    config: {
      handler: function(val) {
        this.myConfig = val || {format: 'HH:mm:ss'};
        if (this.myConfig) {
          for (const k in this.myConfig) {
            this.formConfig[k].value = this.myConfig[k];
          }
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less">
</style>
