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
                  ref="formItem"
                  v-model="item.tag"
                  border="border"
                  :validateList="validateList"
                ></TsFormInput>
              </TsFormItem>
              <TsFormItem label="配置">
                <Tabs :name="'data' + index" :animated="false" @on-click="(name)=>changeTab(name, item)">
                  <TabPane label="数据配置" :name="'dataConfig' + index" :tab="'data' + index">
                    <div v-if="!item._tab || item._tab === 'dataConfig' + index">
                      <TsCodemirror
                        :id="'code' + index"
                        v-model="item.extendConfig"
                        :validateList="validateList"
                        isCopy
                      ></TsCodemirror>
                    </div>
                  </TabPane>
                  <TabPane label="数据转换" :name="'dataChange' + index" :tab="'data' + index">
                    <div v-if="item._tab === 'dataChange' + index">
                      <TsCodemirror v-model="item.extendMethods" :validateList="validateList" isCopy></TsCodemirror>
                    </div>
                  </TabPane>
                  <TabPane label="测试" :name="'dataTest' + index" :tab="'data' + index">
                    <ExtendTest
                      v-if="item._tab === 'dataTest' + index"
                      :config="item"
                      :formItemList="formItemList"
                    ></ExtendTest>
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
    TsCodemirror: () => import('@/resources/plugins/TsCodemirror/TsCodemirror'),
    ExtendTest: () => import('./extend-test.vue')
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
    addItem() {
      this.configList.push({
        tag: '',
        extendConfig: '',
        extendMethods: ''
      });
    },
    delItem(index) {
      this.configList.splice(index, 1);
    },
    valid() {
      let isValid = true;
      let formItemList = this.$refs.formItem;
      formItemList.forEach(item => {
        if (!item.valid()) {
          isValid = false;
        }
      });
      return isValid;
    },
    ok() {
      if (!this.valid()) {
        return; 
      }
      this.configList.forEach(item => {
        for (let k in item) {
          if (k.startsWith('_')) {
            this.$delete(item, k);
          }
        }
        this.$ = {};
        try {
          let attributeList = [];
          if (item.extendConfig) {
          // eslint-disable-next-line no-eval
            const configMethods = eval('(' + item.extendConfig + ')');
            Object.keys(configMethods).forEach(methodsName => {
              if (typeof configMethods[methodsName] === 'function' && !this.$.methodsName) {
                this.$[methodsName] = configMethods[methodsName].bind(this);
              }
            });
            attributeList = this.$.main();
            this.$set(item, 'attributeList', attributeList);
          }
        } catch (e) {
          console.error(e);
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
