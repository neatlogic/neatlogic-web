<template>
  <div>
    <TsForm ref="formMain" :item-list="formConfig">
    </TsForm>
  </div>
</template>
<script>
export default {
  name: '',
  components: { TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {
    config: {
      type: Object
    }
  },
  data() {
    return {
      myConfig: {defaultValue: ''},
      formConfig: {
        defaultValue: {
          type: 'datetimerange',
          label: this.$t('page.defaultvalue'),
          transfer: true,
          format: this.config.tsFormDatePickerFormat,
          valueType: 'format',
          value: null
        }
      }
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
