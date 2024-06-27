<template>
  <div>
    <Tabs
      v-model="resulTab"
      name="test"
      :animated="false"
      @on-click="(name)=>changeTab(name)"
    >
      <TabPane label="测试数据" name="testData" tab="test">
        <TsCodemirror v-model="initData._currentTestData" codeMode="json" isCopy></TsCodemirror>
        <div class="pt-sm">
          <Button @click="test(initData)">测试</Button>
        </div>
      </TabPane>
      <TabPane
        v-if="initData._errorConfig||initData._outinputConfig"
        label="数据配置结果"
        name="configData"
        tab="test"
      >
        <Alert v-if="initData._errorConfig" type="error">
          {{ initData._errorConfig }}
        </Alert>
        <TsCodemirror
          v-else-if="resulTab == 'configData'"
          :value="initData._outinputConfig"   
          codeMode="json"
          isCopy
        ></TsCodemirror>
      </TabPane>
      <TabPane
        v-if="initData._errorData || initData._outinpuData"
        label="数据转换结果 "
        name="valueData"
        tab="test"
      > <Alert v-if="initData._errorData" type="error">
          {{ initData._errorData }}
        </Alert>
        <TsCodemirror
          v-else-if="resulTab ==='valueData'"
          :value="initData._outinpuData"
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
    TsCodemirror: () => import('@/resources/plugins/TsCodemirror/TsCodemirror')
  },
  props: {
    config: Object,
    formItemList: Array
  },
  data() {
    return {
      initData: {},
      resulTab: ''
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
    changeTab(name) {
      this.resulTab = name;
    },
    test() {
      this.$ = {};
      this.clearData();
      let list = null; //消费数据配置列表
      try {
        if (this.initData.extendConfig) {
          // eslint-disable-next-line no-eval
          const configMethods = eval('(' + this.initData.extendConfig + ')');
          Object.keys(configMethods).forEach(methodsName => {
            if (typeof configMethods[methodsName] === 'function' && !this.$.methodsName) {
              this.$[methodsName] = configMethods[methodsName].bind(this);
            }
          });
          if (this.$.main) {
            list = this.$.main();
            this.$set(this.initData, '_outinputConfig', JSON.stringify(list, null, 2));
          }
        }
      } catch (e) {
        let errorConfig = this.$utils.evalWithLineNumber(e, this.initData.extendConfig);
        if (errorConfig) {
          this.$set(this.initData, '_errorConfig', errorConfig);
        }
      }
      try {
        if (this.initData.extendMethods) {
          this.$ = {};
          // eslint-disable-next-line no-eval
          const dataMethods = eval('(' + this.initData.extendMethods + ')');
          Object.keys(dataMethods).forEach(methodsName => {
            if (typeof dataMethods[methodsName] === 'function' && !this.$.methodsName) {
              this.$[methodsName] = dataMethods[methodsName].bind(this);
            }
          });
          if (list && this.$.main && this.initData._currentTestData) {
            let _outinpuData = this.$.main(list, JSON.parse(this.initData._currentTestData));
            this.$set(this.initData, '_outinpuData', JSON.stringify(_outinpuData, null, 2));
          }
        }
      } catch (e) {
        let errorData = this.$utils.evalWithLineNumber(e, this.initData.extendMethods);
        if (errorData) {
          this.$set(this.initData, '_errorData', errorData);
        }
      }
    },
    clearData() {
      this.$set(this.initData, '_outinputConfig', '');
      this.$set(this.initData, '_errorConfig', '');
      this.$set(this.initData, '_outinpuData', '');
      this.$set(this.initData, '_errorData', '');
    }
  },
  filter: {},
  computed: {},
  watch: {
    config: {
      handler(val) {
        this.initData = val || {};
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less">
</style>
