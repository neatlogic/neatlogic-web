<template>
  <div>
    <TsFormRadio
      v-model="type"
      :dataList="dataList"
      @on-change="typeChange"
    ></TsFormRadio>
    <template v-if="type==='strExpression'">
      <Tag
        v-for="(item, index) in list"
        :key="index"
        :closable="true"
        @on-close="deleteAttr(index)"
      >
        <span>{{ getLabel(item) }}</span>
        <span class="tsfont-edit cursor" @click="editAttr(item, index)"></span>
      </Tag>
      <span>
        <Poptip
          v-model="isPopShow"
          :transfer="true"
          placement="right"
          width="400"
        >
          <span class="text-href tsfont-plus" @click="addAttr()"></span>
          <div slot="content" class="api">
            <div>
              <Tabs v-model="mappingMode" :animated="false" @on-click="changetab()">
                <TabPane :label="$t('page.constant')" name="constant">
                  <TsFormInput
                    ref="value_constant"
                    v-model="currentData.value"
                    border="border"
                    :validateList="mappingMode === 'constant'? validateList : []"
                  ></TsFormInput>
                </TabPane>
                <TabPane :label="$t('term.process.formcommonitem')" name="formCommonComponent">
                  <TsFormSelect
                    ref="value_formCommonComponent"
                    v-model="currentData.value"
                    :dataList="formCommonComponentList"
                    textName="label"
                    valueName="uuid"
                    border="border"
                    :validateList="mappingMode === 'formCommonComponent'? validateList : []"
                    transfer
                  ></TsFormSelect>
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
    </template>
    <div v-else>
      <Poptip
        trigger="hover"
        word-wrap
        width="550"
        title="属性列表"
        :transfer="true"
      >
        <span class="tsfont-question-o">{{ $t('page.help') }}</span>
        <div slot="content">
          <div v-if="formAttrList && formAttrList.length > 0" style="max-height: 350px; overflow: auto">
            <ConditionAttrList :formAttrList="formAttrList"></ConditionAttrList>
          </div>
        </div>
      </Poptip>
      <TsCodemirror
        v-model="jsValue"
        codeMode="javascript"
        height="auto"
        placeholder="请填写ES5脚本，最后返回表达式的值value，范例：return value"
        @change="changeJsValue"
      ></TsCodemirror>
    </div>
    <div v-if="isHasMessageError" class="text-error">{{ $t('form.validate.required', {'target': $t('term.cmdb.expression')}) }}</div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsCodemirror: () => import('@/resources/plugins/TsCodemirror/TsCodemirror'),
    ConditionAttrList: () => import('./condition-attr-list.vue')
  },
  props: {
    formItemUuid: { //当前组件uuid
      type: String,
      default: ''
    },
    attrUuid: { //当前属性uuid
      type: String,
      default: ''

    },
    formItemList: { //表单组件列表
      type: Array,
      default: () => []
    },
    value: {
      type: Object,
      default: () => {}
    },
    isRequired: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      type: 'strExpression',
      dataList: [
        {
          text: '字段拼接',
          value: 'strExpression'
        },
        {
          text: 'js脚本转换',
          value: 'jsExpression'
        }
      ],
      expression: {},
      list: [],
      jsValue: null,
      isPopShow: false,
      mappingMode: 'constant',
      currentData: {},
      currentIndex: null,
      validateList: ['required'],
      isHasMessageError: false,
      whiteList: ['formtext', 'formdate', 'formtime', 'formselect', 'formradio', 'formnumber'],
      formAttrList: [],
      mapping: {
        formtext: '文本框',
        formdate: '日期',
        formtime: '时间',
        formselect: '下拉框',
        formradio: '单选框',
        formnumber: '复选框',
        formtableinputer: '表格输入组件',
        formtableselector: '表格选择组件'
      }
    };
  },
  beforeCreate() {},
  created() {
    this.init();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init() {
      let formAttrList = [];
      const processItem = (item, parentLabel) => {
        if (this.whiteList.includes(item.handler) && (!item.config || !item.config.isMultiple)) {
          const label = parentLabel ? `${parentLabel}.${item.label}` : item.label;
          formAttrList.push({
            handler: item.handler,
            handlerName: this.mapping[item.handler],
            label
          });
        }
      };
      this.formItemList.forEach((item) => {
        if (item.uuid === this.formItemUuid) {
          (item.config?.dataConfig || []).forEach((subItem) => {
            processItem(subItem, item.label);
          });
        } else {
          processItem(item);
        }
      });
      this.formAttrList = formAttrList;
    },
    typeChange() {
      this.list = [];
      this.jsValue = null;
      this.setValue();
    },
    changetab() {
      this.currentData = {};
    },
    deleteAttr(index) {
      this.isPopShow = false;
      this.$delete(this.list, index);
      this.setValue();
    },
    editAttr(item, index) {
      this.currentData = this.$utils.deepClone(item);
      this.currentIndex = index;
      this.mappingMode = this.currentData.mappingMode;
      this.isPopShow = true;
    },
    addAttr() {
      this.mappingMode = 'constant';
      this.currentIndex = null;
      this.currentData = {};
    },
    cancel() {
      this.isPopShow = false;
      this.currentIndex = null;
      this.currentData = {};
    },
    confirm() {
      let isValid = true;
      if (this.$refs[`value_${this.mappingMode}`]) {
        isValid = this.$refs[`value_${this.mappingMode}`].valid();
      }
      if (this.$refs[`column_${this.mappingMode}`]) {
        isValid = this.$refs[`column_${this.mappingMode}`].valid() && isValid;
      }
      if (isValid) {
        this.isPopShow = false;
        this.$set(this.currentData, 'mappingMode', this.mappingMode);
        if (this.currentIndex === null) {
          this.list.push(this.currentData);
        } else {
          this.$set(this.list, this.currentIndex, this.currentData);
        }
       
        this.isHasMessageError = false;
        if (!this.$utils.isSame(this.list, this.valueList)) {
          this.setValue();
        }
      }
    },
    valid() {
      let isValid = true;
      if (this.isRequired && this.$utils.isEmpty(this.expression)) {
        isValid = false;
      }
      this.isHasMessageError = !isValid;
      return isValid;
    },
    changeJsValue(val) {
      this.setValue();
    },
    setValue() {
      const data = {
        type: this.type,
        list: this.list,
        jsValue: this.jsValue
      };
      this.expression = data;
      this.$emit('setConfig', data);
    }
  },
  filter: {},
  computed: {
    formCommonComponentList() {
      let dataList = [];
      let list = [];
      if (this.formItemList && this.formItemList.length > 0) {
        //表单普通组件(表格外的组件)
        dataList = this.formItemList.filter(item => {
          return item.uuid != this.attrUuid && this.whiteList.includes(item.handler);
        });
        //当前表格组件属性列表(表格输入/表格选择组件)
        const findItem = this.formItemList.find(item => item.uuid === this.formItemUuid);
        if (findItem) {
          const dataConfig = findItem?.config?.dataConfig || [];
          dataConfig.forEach((d) => {
            if (this.whiteList.includes(d.handler)) {
              dataList.push({
                ...d,
                label: findItem.label + '.' + d.label
              });
            } 
          });
        }

        dataList.forEach(item => {
          let obj = {
            label: item.label,
            uuid: item.uuid
          };
          let children = [];
          //下拉框组件隐藏属性
          if (!this.$utils.isEmpty(item.config) && !this.$utils.isEmpty(item.config.hiddenFieldList)) {
            item.config.hiddenFieldList.forEach(a => {
              children.push({
                label: item.label + '.' + a.text,
                uuid: item.uuid + '#' + a.value
              });
            });
          }
          //过滤多选
          if (!item.config || !item.config.isMultiple) {
            list.push(obj);
            if (!this.$utils.isEmpty(children)) {
              list.push(...children);
            }
          }
        });
      }
      return list;
    },
    getLabel() {
      return (item) => {
        let label = item.value;
        if (item.mappingMode === 'formCommonComponent') {
          let findCommon = this.formCommonComponentList.find(f => f.uuid === item.value);
          if (findCommon) {
            label = findCommon.label;
          }
        }
        return label;
      };
    }
  },
  watch: {
    value: {
      handler(val) {
        if (!this.$utils.isSame(val, this.expression)) {
          this.expression = val;
          const config = this.$utils.deepClone(val) || {};
          this.list = config.list || [];
          this.type = config.type || 'strExpression';
          this.jsValue = config.jsValue || '';
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less">
</style>
