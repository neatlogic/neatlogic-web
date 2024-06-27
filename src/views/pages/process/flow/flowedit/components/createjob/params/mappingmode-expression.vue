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
              <TabPane v-if="isShowFormTableComponent && jopPolicy!='single'" :label="$t('term.framework.formtableinputercomponent')" name="formTableComponent">
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
  name: 'MappingmodeExpression',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  props: {
    allFormitemList: {
      type: Array,
      default: () => []
    },
    valueList: {
      type: Array,
      default: () => []
    },
    mappingDataList: {
      type: Array,
      default: () => []
    },
    formCommonComponentList: {
      type: Array,
      default: () => []
    },
    formTableComponentList: {
      type: Array,
      default: () => []
    },
    isRequired: {
      type: Boolean,
      default: false
    },
    jopPolicy: String //作业策略（单次、批量）
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
        this.$emit('setConfig', this.expression);
        this.isHasMessageError = false;
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
    isShowFormTableComponent() {
      return this.mappingDataList.find(item => item.value === 'formTableComponent');
    },
    getFormTableAttrList() {
      return (value) => {
        let dataList = [];
        if (value) {
          let findTable = this.allFormitemList.find(item => item.uuid === value);
          if (findTable && findTable.config && findTable.config.dataConfig) {
            findTable.config.dataConfig.forEach(d => {
              if (d.handler !== 'formtable') {
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
