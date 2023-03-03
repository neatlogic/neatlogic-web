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
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
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
            {value: 'yyyy-MM-dd', text: 'yyyy-MM-dd'},
            {value: 'yyyy-MM', text: 'yyyy-MM'}, 
            {value: 'yyyy', text: 'yyyy'}],
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
        this.myConfig = val || {format: 'yyyy-MM-dd'};
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
