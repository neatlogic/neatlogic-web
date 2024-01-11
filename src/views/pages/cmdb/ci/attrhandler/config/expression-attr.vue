<template>
  <div>
    <TsForm :item-list="formConfig">
      <template v-slot:expression>
        <div>
          <Tag
            v-for="(attr, index) in myConfig.expression"
            :key="index"
            :closable="true"
            @on-close="deleteAttr(index)"
          >
            <span>{{ getName(attr) }}</span>
            <span class="tsfont-edit cursor" @click="editAttr(attr, index)"></span>
          </Tag>
          <span>
            <Poptip
              v-model="isPopShow"
              :transfer="true"
              placement="right"
              width="300"
            >
              <a href="javascript:void(0)" class="tsfont-plus" @click="addAttr()"></a>
              <div slot="content" class="api">
                <div>
                  <Tabs v-model="type" :animated="false">
                    <TabPane :label="$t('page.attribute')" name="attr">
                      <TsFormSelect
                        v-model="currentAttr"
                        :dataList="dataList"
                        transfer
                        border="border"
                      ></TsFormSelect>
                      <div v-if="hasAttrError" class="text-error">请选择属性</div>
                    </TabPane>
                    <TabPane :label="$t('page.constant')" name="const">
                      <TsFormInput v-model="currentConst" border="border"></TsFormInput>
                      <div v-if="hasConstError" class="text-error">请填写常量</div>
                    </TabPane>
                  </Tabs>
                  <div style="text-align: right" class="mt-md">
                    <Button class="mr-xs" size="small" @click="cancel()">{{ $t('page.cancel') }}</Button>
                    <Button type="primary" size="small" @click="confirm()">{{ $t('page.confirm') }}</Button>
                  </div>
                </div>
              </div>
            </Poptip>
          </span>
        </div>
      </template>
    </TsForm>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  props: {
    ciId: { type: Number },
    config: { type: Object }
  },
  data() {
    return {
      isPopShow: false,
      myConfig: {},
      dynamicFormatList: [],
      dataList: [],
      type: 'attr',
      formConfig: {
        expression: {
          type: 'slot',
          label: '表达式'
        }
      },
      currentAttr: null,
      currentConst: null,
      hasAttrError: false,
      hasConstError: false,
      currentIndex: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getExpressionList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    addAttr() {
      this.type = 'attr';
      this.currentConst = null;
      this.currentAttr = null;
      this.hasConstError = false;
      this.hasAttrError = false;
      this.currentIndex = null;
    },
    editAttr(attr, index) {
      this.isPopShow = true;
      this.hasConstError = false;
      this.hasAttrError = false;
      if (attr.startsWith('{') && attr.endsWith('}')) {
        this.type = 'attr';
        this.currentAttr = attr;
        this.currentConst = null;
      } else {
        this.type = 'const';
        this.currentConst = attr;
        this.currentAttr = null;
      }
      this.currentIndex = index;
    },
    deleteAttr(index) {
      this.$delete(this.myConfig.expression, index);
      this.isPopShow = false;
    },
    cancel() {
      this.isPopShow = false;
    },
    confirm() {
      let value;
      if (this.type === 'attr') {
        this.hasConstError = false;
        if (!this.currentAttr) {
          this.hasAttrError = true;
          return;
        }
        value = this.currentAttr;
      } else {
        this.hasAttrError = false;
        if (!this.currentConst) {
          this.hasConstError = true;
          return;
        }
        value = this.currentConst;
      }

      if (!this.myConfig.expression) {
        this.$set(this.myConfig, 'expression', []);
      }
      if (this.currentIndex === null) {
        this.myConfig.expression.push(value);
      } else {
        this.$set(this.myConfig.expression, this.currentIndex, value);
      }
      this.isPopShow = false;
    },
    getName(item) {
      if (item.indexOf('{') == -1 && item.indexOf('}') == -1) {
        return item;
      } else {
        const element = this.dataList.find(d => d.value === item);
        if (element) {
          return element.text;
        }
      }
      return '';
    },
    getExpressionList() {
      this.$api.cmdb.ci.getExpressionAttrRelByCiId(this.ciId).then(res => {
        this.dataList = res.Return;
      });
    }
  },
  filter: {},
  computed: {},
  watch: {
    myConfig: {
      handler: function(val) {
        this.$emit('setConfig', val);
      },
      deep: true
    },
    config: {
      handler: function(val) {
        this.myConfig = val || {};
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
<style lang="less"></style>
