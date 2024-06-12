<template>
  <div>
    <TsDialog
      :isShow="true"
      :title="$t('page.tip')"
      type="slider"
      width="large"
      className="config-dialog"
      @on-ok="ok()"
      @on-close="close()"
    >
      <template v-slot>
        <div>
          <div v-for="(item, index) in configList" :key="index" class="list bg-op radius-sm mb-sm">
            <div class="title">
              <div>#{{ index+1 }}</div>
              <div class="action-btn">
                <span class="tsfont-close pr-sm text-tip-active" @click="delItem(index)"></span>
                <span class="text-tip-active" :class="!item._isHide ? 'tsfont-down' : 'tsfont-up'" @click="changeShow(item)"></span>
              </div>
            </div>
            <div v-show="!item._isHide" class="content border-color padding">
              <TsFormItem label="标签">
                <TsFormInput
                  v-model="item.tag"
                  border="border"
                  :validateList="validateList"
                ></TsFormInput>
              </TsFormItem>
              <TsFormItem label="配置">
                <Tabs :name="'data' + index" :animated="false" @on-click="(name)=>changeTab(name, item)">
                  <TabPane label="数据配置" :name="'dataConfig' + index" :tab="'data' + index">
                    <div v-if="!item._tab || item._tab === 'dataConfig' + index">
                      <TsCodemirror v-model="item.extendConfig" :validateList="validateList"></TsCodemirror>
                    </div>
                  </TabPane>
                  <TabPane label="数据转换" :name="'dataChange' + index" :tab="'data' + index">
                    <div v-if="item._tab === 'dataChange' + index">
                      <TsCodemirror v-model="item.extendMethods" :validateList="validateList"></TsCodemirror>
                    </div>
                  </TabPane>
                  <TabPane label="测试" :name="'dataTest' + index" :tab="'data' + index">
                    <Tabs :name="'test' + index" :animated="false">
                      <TabPane label="测试数据" :name="'ts' + index" :tab="'test' + index">
                        <TsCodemirror v-model="item._currentTestData" codeMode="json"></TsCodemirror>
                        <Button @click="getTest(item)">测试</Button>
                      </TabPane>
                      <TabPane
                        v-if="item._outinputConfig"
                        label="输出配置"
                        :name="'config' + index"
                        :tab="'test' + index"
                      >
                        <TsCodemirror :value="(item._outinputConfig || '')" codeMode="json"></TsCodemirror>
                      </TabPane>
                      <TabPane
                        v-if="item._outinpuData"
                        label="输出值 "
                        :name="'value' + index"
                        :tab="'test' + index"
                      >
                        <TsCodemirror :value="JSON.stringify(item._outinpuData || '')" codeMode="json"></TsCodemirror>
                      </TabPane>
                    </Tabs>
                    <!-- <div v-if="item._tab === 'dataTest' + index">
                        <TsCodemirror v-model="item._currentTestData" codeMode="json"></TsCodemirror>
                        <Button @click="getTest(item)">测试</Button>
                        <div class="pt-nm pb-sm">数据配置：</div>
                        <JsonViewer
                          v-if="item._outinputConfig"
                          :value="item._outinputConfig"
                          copyable
                          boxed
                          theme="border-base radius-sm"
                        ></JsonViewer>
                        <div class="pt-nm pb-sm">数据转换值：</div>
                        <JsonViewer
                          v-if="item._outinpuData"
                          :value="item._outinpuData"
                          copyable
                          boxed
                          theme="border-base radius-sm"
                        ></JsonViewer>
                      </div>  -->
                  </TabPane>
                </Tabs>
              </TsFormItem>
            </div>
          </div>
          <span class="tsfont-plus text-href" @click="addItem()">添加</span>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>

export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsCodemirror: () => import('@/resources/plugins/TsCodemirror/TsCodemirror')
    // JsonViewer: () => import('vue-json-viewer')
  },
  filters: {
  },
  props: {
    formItemList: Array,
    list: Array
  },
  data() {
    return {
      configList: this.$utils.deepClone(this.list) || [],
      validateList: ['required'],
      tagMeathods: {
        
      }
    };
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
    changeShow(item) {
      this.$set(item, '_isHide', !item._isHide);
    },
    changeTab(name, item) {
      if (!item._testData) {
        this.$set(item, '_testData', '');
      }
      this.$set(item, '_tab', name);
    },
    getTest(item) {
      this.$ = {};
      try {
        let currentConfig = null;
        if (item.extendConfig) {
          // eslint-disable-next-line no-eval
          const configMethods = eval('(' + item.extendConfig + ')');
          Object.keys(configMethods).forEach(methodsName => {
            if (typeof configMethods[methodsName] === 'function' && !this.methodsName) {
              this.$[methodsName] = configMethods[methodsName].bind(this);
            }
          });
          currentConfig = this.$.main();
          this.$set(item, '_outinputConfig', currentConfig);
        }
        if (item.extendMethods) {
          // eslint-disable-next-line no-eval
          const dataMethods = eval('(' + item.extendMethods + ')');
          Object.keys(dataMethods).forEach(methodsName => {
            if (typeof dataMethods[methodsName] === 'function' && !this.methodsName) {
              this.$[methodsName] = dataMethods[methodsName].bind(this);
            }
          });
          if (item._currentTestData) {
            this.$set(item, '_outinpuData', this.$.main(currentConfig, JSON.parse(item._currentTestData)));
          }
        }
      } catch (e) {
        if (e instanceof SyntaxError) {
          console.error(`SyntaxError: ${e.message}`);
        } else if (e instanceof EvalError) {
          console.error(`EvalError: ${e.message}`);
        } else {
          console.error(`Error: ${e.message}`);
        }
        const lineMatch = e.stack.match(/<anonymous>:(\d+):\d+/);
        if (lineMatch) {
          const errorLineNumber = parseInt(lineMatch[1]);
          const codeLines = item.extendConfig.split('\n');
          const errorLinesContent = codeLines[errorLineNumber - 1];
          console.log(`Error on line ${errorLineNumber}: ${errorLinesContent}`);
        } else {
          console.error('Could not detarmine error line number');
        }
      }
    },
    addItem() {
      this.configList.push({
        uuid: this.$utils.setUuid(),
        tag: '',
        extendConfig: '',
        extendMethods: ''
      });
    },
    delItem(index) {
      this.configList.splice(index, 1);
    },
    ok() {
      this.configList.forEach(item => {
        for (let k in item) {
          if (k.startsWith('_')) {
            this.$delete(item, k);
          }
        }
      });
      this.$emit('close', this.configList);
    },
    close() {
      this.$emit('close');
    }
    
  },
  computed: {},
  watch: {
  }
};
</script>
<style lang="less" scoped>
.config-dialog {
  .list {
    &:hover {
      .action-btn {
        opacity: 1;
      }
    }
    .action-btn {
      opacity: 0;
    }
    .title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
    }
    .content {
      border-top: 1px solid;
    }
  }
}
</style>
