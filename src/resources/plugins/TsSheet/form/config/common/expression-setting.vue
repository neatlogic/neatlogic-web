<template>
  <div>
    <Tag
      v-for="(item, index) in expression"
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
              <TabPane v-if="isShowFormTableComponent" :label="$t('term.framework.tablecomponent')" name="formTableComponent">
                <TsRow :gutter="8">
                  <Col :span="12">
                    <TsFormSelect
                      ref="value_formTableComponent"
                      v-model="currentData.value"
                      :dataList="formTableComponentList"
                      textName="label"
                      valueName="uuid"
                      :validateList="mappingMode === 'formTableComponent'? validateList : []"
                      :firstSelect="false"
                      border="border"
                      transfer
                    ></TsFormSelect>
                  </Col>
                  <Col :span="12">
                    <TsFormSelect
                      ref="column_formTableComponent"
                      v-model="currentData.column"
                      :dataList="getFormTableAttrList(currentData.value)"
                      :validateList="mappingMode === 'formTableComponent'? validateList : []"
                      :firstSelect="false"
                      border="border"
                      transfer
                    ></TsFormSelect>
                  </Col>
                </TsRow>
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
    <div v-if="isHasMessageError" class="text-error">{{ $t('form.validate.required', {'target': $t('term.cmdb.expression')}) }}</div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  props: {
    uuid: { //当前组件uuid
      type: String,
      default: ''
    },
    formItemList: {
      type: Array,
      default: () => []
    },
    valueList: {
      type: Array,
      default: () => []
    },
    isRequired: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      expression: [],
      isPopShow: false,
      mappingMode: 'constant',
      currentData: {},
      currentIndex: null,
      validateList: ['required'],
      isHasMessageError: false
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
    changetab() {
      this.currentData = {};
    },
    deleteAttr(index) {
      this.isPopShow = false;
      this.$delete(this.expression, index);
      this.$emit('setConfig', this.expression);
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
          this.expression.push(this.currentData);
        } else {
          this.$set(this.expression, this.currentIndex, this.currentData);
        }
       
        this.isHasMessageError = false;
        if (!this.$utils.isSame(this.expression, this.valueList)) {
          this.$emit('setConfig', this.expression);
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
    }
  },
  filter: {},
  computed: {
    formCommonComponentList() {
      let dataList = [];
      let list = [];
      if (this.formItemList && this.formItemList.length > 0) {
        //表单普通组件
        dataList = this.formItemList.filter(item => {
          return item.handler != 'formtableselector' && item.handler != 'formtableinputer' && item.handler != 'formsubassembly';
        });
       
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
          list.push(obj);
          if (!this.$utils.isEmpty(children)) {
            list.push(...children);
          }
        });
      }
      return list;
    },
    formTableComponentList() { 
      let dataList = [];
      //获取表单输入表格组件
      if (!this.$utils.isEmpty(this.formItemList)) {
        dataList = this.formItemList.filter(item => {
          return item.handler === 'formtableinputer' || item.handler === 'formtableselector';
        });
      }
      return dataList;
    },
    isShowFormTableComponent() {
      return this.formItemList.find(item => item.handler === 'formtableselector' || item.handler === 'formtableinputer');
    },
    getFormTableAttrList() {
      return (value) => {
        let dataList = [];
        if (value) {
          let findTable = this.formItemList.find(item => item.uuid === value);
          if (findTable && findTable.config && findTable.config.dataConfig) {
            findTable.config.dataConfig.forEach(d => {
              if (d.handler !== 'formtable' && d.uuid !== this.uuid) {
                dataList.push({
                  text: d.label,
                  value: d.uuid
                });
              }
            });
          }
        }
        return dataList;
      };
    },
    getLabel() {
      return (item) => {
        let label = item.value;
        if (item.mappingMode === 'formCommonComponent') {
          let findCommon = this.formCommonComponentList.find(f => f.uuid === item.value);
          if (findCommon) {
            label = findCommon.label;
          }
        } else if (item.mappingMode === 'formTableComponent') {
          let findTable = this.formTableComponentList.find(f => f.uuid === item.value);
          if (findTable) {
            label = findTable.label;
            let dataList = this.getFormTableAttrList(item.value);
            let findAttr = dataList.find(d => d.value === item.column);
            if (findAttr) {
              label += '.' + findAttr.text;
            }
          }
        }
        return label;
      };
    }
  },
  watch: {
    valueList: {
      handler(val) {
        if (!this.$utils.isSame(val, this.expression)) {
          this.expression = this.$utils.deepClone(val) || [];
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
