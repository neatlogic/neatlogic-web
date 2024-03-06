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
                      <div v-if="hasAttrError" class="text-error">{{ $t('form.placeholder.pleaseselect', { target: $t('page.attribute') }) }}</div>
                    </TabPane>
                    <TabPane :label="$t('page.constant')" name="const">
                      <TsFormInput v-model="currentConst" border="border"></TsFormInput>
                      <div v-if="hasConstError" class="text-error">{{ $t('form.placeholder.pleaseinput', { target: $t('page.constant') }) }}</div>
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
      <template v-slot:script>
        <div>
          <div v-if="expressAttrList.length > 0">
            <span class="fz10 text-grey mr-sm">{{ $t('term.cmdb.selectedattr') }}</span>
            <Tag
              v-for="(attr, index) in expressAttrList"
              :key="index"
              v-clipboard="'$attr[\'' + attr.value + '\']'"
              v-clipboard:success="clipboardSuc"
              class="cursor"
              @click.stop
            >{{ attr.text }}</Tag>
          </div>
          <div>
            <span class="text-grey mr-sm fz10">{{ $t('page.help') }}</span>
            <span class="text-grey fz10">{{ $t('term.cmdb.scripthelp') }}</span>
            <div>
              <TsCodemirror v-model="myConfig.script" codeMode="javascript"></TsCodemirror>
            </div>
          </div>
        </div>
      </template>
    </TsForm>
  </div>
</template>
<script>
import clipboard from '@/resources/directives/clipboard.js';
export default {
  name: '',
  directives: { clipboard },
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsCodemirror: resolve => require(['@/resources/plugins/TsCodemirror/TsCodemirror'], resolve)
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
          label: this.$t('term.cmdb.expression')
        },
        script: {
          type: 'slot',
          label: this.$t('term.cmdb.transformscript')
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
    clipboardSuc() {
      this.$Message.success(this.$t('message.copysuccess'));
    },
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
      } else if (this.type === 'const') {
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
  computed: {
    expressAttrList() {
      const attrList = [];
      if (this.myConfig.expression && this.myConfig.expression.length > 0) {
        this.myConfig.expression.forEach(d => {
          if (d.startsWith('{') && d.endsWith('}')) {
            const data = this.dataList.find(dd => dd.value === d);
            if (data) {
              attrList.push(data);
            }
          }
        });
      }
      return attrList;
    }
  },
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
