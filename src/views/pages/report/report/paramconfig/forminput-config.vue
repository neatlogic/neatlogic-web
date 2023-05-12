<template>
  <div>
    <TsForm ref="formMain" :item-list="formConfig">
    </TsForm>
  </div>
</template>
<script>
export default {
  name: '',
  components: { TsForm: resolve =>
    require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    config: {
      type: Object
    }
  },
  data() {
    const _this = this;
    return {
      myConfig: {length: '', defaultValue: ''},
      formConfig: {
        defaultValue: {
          type: 'text',
          label: this.$t('page.defaultvalue')
        }, 
        length: {
          type: 'text',
          label: this.$t('page.length')
        }}
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    //由于父组件是通过component :is的方式加载，所以每次打开都会执行mouted方法
    for (const k in this.formConfig) {
      this.formConfig[k].value = this.config[k];
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    setConfig: function() {
      return this.$refs['formMain'].getFormValue();
    }
  },
  filter: {},
  computed: {},
  watch: {
  }
};
</script>
<style lang="less">
</style>
