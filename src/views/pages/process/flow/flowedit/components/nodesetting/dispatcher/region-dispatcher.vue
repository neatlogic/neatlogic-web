<template>
  <div>
    <Loading
      v-if="loadingShow"
      :loadingShow="loadingShow"
    ></Loading>
    <TsForm
      v-else
      ref="form"
      v-model="formData"
      :item-list="formConfig"
      labelPosition="left"
      :labelWidth="80"
      style="width: 100%"
    >
      <template v-slot:mapping>
        <div
          v-for="item in regionAttrs"
          :key="item.name"
          class="flex-start"
        >
          <TsFormItem
            :label="item.label"
            :required="true"
            labelWidth="80"
          > 
            <div class="float-left ">
              <span class="tsfont-arrow-right float-left " style="padding: 0 4px"></span>
              <TsFormSelect
                ref="mapping"
                v-model="item.value"
                class="float-left"
                :dataList="matrixAttrDataList"
                valueName="uniqueIdentifier"
                textName="name"
                transfer
                width="150px"
                border="border"
                :validateList="[{name: 'required', message: ''}]"
                :isNowrap="true"
              ></TsFormSelect>
            </div>
          </TsFormItem>
        </div>
      </template>
    </TsForm>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  props: {
    allFormitemList: {
      // 表单数据
      type: Array,
      default: () => {
        return [];
      }
    },
    value: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data() {
    return {
      formAttributeDataList: [],
      loadingShow: true, // 编辑分派器时，需要重组formItemList，需要等重组完再渲染组件
      formData: {
        matrixUuid: null,
        app: null,
        regionAttrs: []
      },
      isWithoutUniqueIdentifier: false,
      formNameList: ['type', 'dataSource'],
      matrixAttrDataList: [], //矩阵属性数据源
      mapping: [], // 匹配映射
      formConfig: {
        'matrixUuid': {
          validateList: ['required'],
          dynamicUrl: 'api/rest/matrix/search',
          label: this.$t('page.datasources'),
          type: 'select',
          textName: 'name',
          valueName: 'uuid',
          rootName: 'tbodyList',
          transfer: true,
          border: 'border',
          firstSelect: false,
          onChange: value => {
            // 数据来源改变的时候
            this.changeMatrix(value);
          },
          labelWidth: '80'
        },
        'mapping': {
          validateList: ['required'],
          label: this.$t('term.process.matchmapping'),
          labelPosition: 'top',
          type: 'slot',
          tooltip: this.$t('term.framework.regiondispatchermatchtooltips'),
          labelWidth: '100',
          isHidden: true
        },
        'app': {
          label: this.$t('term.framework.regiondispatcherapp'),
          type: 'select',
          textName: 'label',
          valueName: 'uuid',
          border: 'border',
          tooltip: this.$t('term.framework.regiondispatcherapptooltip'),
          labelWidth: '80'
        }
      },
      regionAttrs: [ 
        {
          name: 'regionId',
          label: '地域'
        }, {
          name: 'app',
          label: '业务系统'
        }, {
          name: 'teamId',
          label: '分组'
          
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
  },
  beforeMount() {},
  mounted() {
    this.handleInitData();
  },  
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    async changeMatrix(matrixUuid) {
      //改变矩阵数据
      if (matrixUuid) {
        await this.$api.autoexec.action.getMatrixAttributeByUuid({ matrixUuid: matrixUuid }).then(res => {
          //获取矩阵的属性
          if (res.Status == 'OK') {
            this.matrixAttrDataList = res.Return.tbodyList || [];
            if (this.matrixAttrDataList.some(o => this.$utils.isEmpty(o.uniqueIdentifier))) {
              this.$set(this, 'isWithoutUniqueIdentifier', true);
            } else {
              this.$set(this, 'isWithoutUniqueIdentifier', false);
            }
          }
          this.formConfig.mapping.isHidden = false;
        });
      } else {
        this.formConfig.mapping.isHidden = true;
      }
    },
    async handleInitData() {
      this.formConfig.app.dataList = this.$utils.deepClone(this.allFormitemList);
      // 处理回显初始值
      if (this.$utils.isEmpty(this.value)) {
        this.loadingShow = false;
        return false;
      }
      this.$set(this.formData, 'app', this.value.app);
      this.$set(this.formData, 'matrixUuid', this.value.matrixUuid);
      if (this.formData.matrixUuid) {
        this.formConfig.mapping.isHidden = false;
        await this.changeMatrix(this.value.matrixUuid);
        this.value.regionAttrs.forEach(valueRegionAttr => {
          const regionAttr = this.regionAttrs.find(attr => attr.name === valueRegionAttr.name);
          if (regionAttr) {
            this.$set(regionAttr, 'value', valueRegionAttr.value);
          }
        });
      }
      this.loadingShow = false;
    },
    saveData() {
      this.$refs.form && !this.$refs.form.valid();
      let mappings = this.$refs['mapping'];
      if (!this.$utils.isEmpty(mappings)) {
        for (let i = 0; i < mappings.length; i++) {
          let mapping = mappings[i];
          mapping && !mapping.valid();
        }
      }
      // 提供给外部使用
      let saveData = {
        ...this.formData,
        regionAttrs: this.regionAttrs
      };
      return saveData;
    },
    valid() {
      // 校验，提供给外部使用
      // flow-valid.js还有一个数据校验的方法
      let isValid = true;
      let formList = [this.$refs.mapping, this.$refs.formAttribute];
      for (let key = 0; key < formList.length; key++) {
        if (formList[key] && formList[key].valid && !formList[key].valid()) {
          isValid = false;
        }
      }
      if (this.$refs.form && !this.$refs.form.valid()) {
        isValid = false;
      }
      return isValid;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
