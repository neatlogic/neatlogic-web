<template>
  <div>
    <TsForm ref="formMain" :item-list="formConfig">
    </TsForm>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve =>
      require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {config: {type: Object} },
  data() {
    const _this = this;
    return {
      myConfig: {matrix: '', valueKey: '', textKey: ''},
      formConfig: {
        matrix: {
          type: 'select',
          name: 'matrix',
          label: this.$t('page.matrix'),
          dynamicUrl: '/api/rest/matrix/search',
          rootName: 'tbodyList',
          textName: 'name',
          valueName: 'uuid',
          transfer: true,
          validateList: ['required'],
          onChange: function(val) {
            _this.currentMatrix = val;
          }
        },
        valueKey: {
          type: 'select',
          label: this.$t('page.valuefield'),
          dataList: this.matrixData,
          textName: 'name',
          valueName: 'uuid',
          transfer: true,
          validateList: ['required']
        },
        textKey: {
          type: 'select',
          label: this.$t('term.report.textfield'),
          dataList: this.matrixData,
          textName: 'name',
          valueName: 'uuid',
          transfer: true,
          validateList: ['required']
        }
      },
      currentMatrix: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() { //由于父组件是通过component :is的方式加载，所以每次打开都会执行mouted方法
    this.myConfig = this.config;
    for (const k in this.formConfig) {
      this.formConfig[k].value = this.myConfig[k];
    }
    this.currentMatrix = this.myConfig['matrix'];
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
    currentMatrix: {
      handler: function(val) {
        if (val) {
          this.$api.report.report.getMatrixAttributeByUuid({
            matrixUuid: val
          }).then(res => {
            if (res.Status == 'OK') {
              this.formConfig.valueKey.dataList = res.Return.tbodyList;
              this.formConfig.textKey.dataList = res.Return.tbodyList;
            }
          });
        }
      }
    }
  }
};
</script>
<style lang="less">
</style>
