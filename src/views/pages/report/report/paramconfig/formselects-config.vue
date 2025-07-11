<template>
  <div>
    <TsForm ref="formMain" :item-list="formConfig">
      <template slot="reactionFilter">
        <ReactionFilter
          ref="reactionFilterRef"
          :matrixAttrUuidList="matrixAttrUuidList"
          :rowData="rowData"
          :paramList="paramList"
          :reactionFilterList="reactionFilterList"
        ></ReactionFilter>
      </template>
    </TsForm>
  </div>
</template>
<script>
import BaseConfig from '@/views/pages/report/report/paramconfig/base.vue';
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  extends: BaseConfig,
  data() {
    return {
      myConfig: { matrix: '', valueKey: '', textKey: '' },
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
          onChange: (val) => {
            this.currentMatrix = val;
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
        },
        reactionFilter: {
          name: 'reactionFilter',
          type: 'slot',
          label: '联动过滤'
        }
      },
      currentMatrix: null,
      matrixAttrUuidList: [],
      reactionFilterList: []
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
    const { reactionFilterList = [] } = this.config || {};
    if (reactionFilterList?.length > 0) {
      this.reactionFilterList = reactionFilterList;
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {},
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
              const { tbodyList = [] } = res?.Return || {};
              this.formConfig.valueKey.dataList = tbodyList;
              this.formConfig.textKey.dataList = tbodyList;
              this.matrixAttrUuidList = tbodyList;
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
