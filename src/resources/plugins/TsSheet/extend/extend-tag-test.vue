<template>
  <div v-if="!$utils.isEmpty(extendConfigList)" class="pt-nm">
    <TsFormItem label="请选择扩展数据标签" labelPosition="top">
      <TsFormSelect
        v-model="extendTag"
        :dataList="extendConfigList"
        textName="tag"
        valueName="tag"
        border="border"
        transfer
        @on-change="changeTag()"
      ></TsFormSelect>
    </TsFormItem>
    <div class="pb-nm">
      <Button @click="testExtendData()">测试结果</Button>
    </div>
    <Tabs
      v-if="!$utils.isEmpty(resultData)"
      v-model="resulTab"
      name="result"
      :animated="false"
      @on-click="(name)=>changeResultTab(name)"
    >
      <TabPane
        v-if="resultData._errorConfig || resultData._outinputConfig"
        label="数据配置结果"
        name="configData"
        tab="result"
      >
        <div>
          <Alert v-if="resultData._errorConfig" type="error">
            {{ resultData._errorConfig }}
          </Alert>
          <TsCodemirror
            v-else-if="resulTab == 'configData' && resultData._outinputConfig"
            :value="resultData._outinputConfig"   
            codeMode="json"
            isCopy
          ></TsCodemirror>
        </div>
              
      </TabPane>
      <TabPane
        v-if="resultData._errorData || resultData._outinpuData"
        label="数据转换结果 "
        name="valueData"
        tab="result"
      > <Alert v-if="resultData._errorData" type="error">
          {{ resultData._errorData }}
        </Alert>
        <TsCodemirror
          v-else-if="resulTab ==='valueData'"
          :value="resultData._outinpuData"
          :is-read-only="true"
          codeMode="json"
          isCopy
        ></TsCodemirror>
      </TabPane>
    </Tabs>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsCodemirror: () => import('@/resources/plugins/TsCodemirror/TsCodemirror'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  filters: {
  },
  props: {
    extendConfigList: Array,
    formItemList: Array,
    formData: [Array, Object]
  },
  data() {
    return {
      extendTag: '', //扩展数据标签
      resultData: {},
      resulTab: 'configData'
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
    changeTag() {
      this.resultData = {};
      this.resulTab = 'configData';
    },
    changeResultTab(name) {
      this.resulTab = name;
    },
    testExtendData() {
      if (this.extendTag) {
        let findExtendConfig = this.extendConfigList.find(item => item.tag === this.extendTag); 
        if (findExtendConfig) {
          this.$ = {};
          this.resultData = {};
          let list = null; //消费数据配置列表
          try {
            if (findExtendConfig.extendConfig) {
              // eslint-disable-next-line no-eval
              const configMethods = eval('(' + findExtendConfig.extendConfig + ')');
              Object.keys(configMethods).forEach(methodsName => {
                if (typeof configMethods[methodsName] === 'function' && !this.$.methodsName) {
                  this.$[methodsName] = configMethods[methodsName].bind(this);
                }
              });
              if (this.$.main) {
                list = this.$.main();
                this.$set(this.resultData, '_outinputConfig', JSON.stringify(list, null, 2));
              }
            } else {
              this.$set(this.resultData, '_outinputConfig', '[]');
            }
          } catch (e) {
            let errorConfig = this.$utils.evalWithLineNumber(e, findExtendConfig.extendConfig);
            if (errorConfig) {
              this.$set(this.resultData, '_errorConfig', errorConfig);
            }
          }
          try {
            if (findExtendConfig.extendMethods) {
              this.$ = {};
              // eslint-disable-next-line no-eval
              const dataMethods = eval('(' + findExtendConfig.extendMethods + ')');
              Object.keys(dataMethods).forEach(methodsName => {
                if (typeof dataMethods[methodsName] === 'function' && !this.$.methodsName) {
                  this.$[methodsName] = dataMethods[methodsName].bind(this);
                }
              });
              if (list && this.$.main && !this.$utils.isEmpty(this.formData)) {
                let _outinpuData = this.$.main(list, this.formData);
                this.$set(this.resultData, '_outinpuData', JSON.stringify(_outinpuData, null, 2));
              }
            } else {
              this.$set(this.resultData, '_outinpuData', '[]');
            }
          } catch (e) {
            let errorData = this.$utils.evalWithLineNumber(e, findExtendConfig.extendMethods);
            if (errorData) {
              this.$set(this.resultData, '_errorData', errorData);
            }
          }
        }
      }
    }
  },
  computed: {},
  watch: {}
};
</script>
