<template>
  <div v-if="errorList.length === 0">
    <TsFormSelect
      ref="formitem"
      v-bind="setting"
      :transfer="true"
      :readonly="readonly"
      :disabled="disabled"
      :value="actualValue"
      :validateList="validateList"
      :readonlyTextIsHighlight="readonlyTextIsHighlight"
      :isClearEchoFailedDefaultValue="isClearEchoFailedDefaultValue"
      :isCustomValue="isCustomValue"
      border="border"
      search
      @first="addRow"
      @change="
        (val, valueObject, selectItem) => {
          setValue(selectItem);
        }
      "
    >
    </TsFormSelect>
    <!-- 新增数据为true+矩阵类型是自定义矩阵，下拉框，才有新增数据按钮 -->
    <RowEditDialog
      v-if="isShowRowEditDialog"
      :matrixUuid="matrixUuid"
      @close="()=>{
        matrixUuid = '';
        isShowRowEditDialog = false;
      }"
    ></RowEditDialog>
  </div>
  <div v-else class="text-grey">
    <ul>
      <li v-for="(error, index) in errorList" :key="index">{{ error }}</li>
    </ul>
  </div>
</template>
<script>
import base from './base.vue';
import validmixin from './common/validate-mixin.js';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
export default {
  name: '',
  components: {
    TsFormSelect,
    RowEditDialog: () => import('@/views/pages/framework/matrix/components/row-edit.vue')
  },
  extends: base,
  mixins: [validmixin],
  props: {
    readonly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
      isFirst: true,
      initFilter: this.$utils.deepClone(this.filter),
      isShowRowEditDialog: false,
      matrixUuid: ''
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
    validConfig() {
      return this.validConfigForListItem();
    },
    addRow() {
      let {matrixUuid = ''} = this.config || {};
      if (this.$utils.isEmpty(matrixUuid)) {
        return false;
      }
      this.isShowRowEditDialog = true;
      this.matrixUuid = matrixUuid;
    },
    transformPropertyToString(value, uuid = 'text') {
      if (this.$utils.isEmpty(value)) return '';

      if (Array.isArray(value)) {  
        return value.map(item => this.transformPropertyToString(item))
          .filter(itemValue => !this.$utils.isEmpty(itemValue))
          .join(' ');
      } else if (typeof value === 'object') {  
        return value[uuid];  
      } else {   
        return value;  
      }
    }
  },
  filter: {},
  computed: {
    errorList() {
      const errorList = [];
      this.validConfig().forEach(error => {
        if (!errorList.includes(error.error)) {
          errorList.push(error.error);
        }
      });
      return errorList;
    },
    validatedDataList() {
      const dataList = [];
      if (this.config.dataList && this.config.dataList.length > 0) {
        this.config.dataList.forEach(d => {
          let isValid = false;
          const data = {};
          const value = d.value || d.value === 0 ? d.value : null;
          const text = d.text || d.text === 0 ? d.text : null;
          if (value != null && text != null) {
            data.value = value;
            data.text = text;
            isValid = true;
          } else if (value == null && text != null) {
            data.value = text;
            data.text = text;
            isValid = true;
          } else if (value != null && text == null) {
            data.value = value;
            data.text = value;
            isValid = true;
          }
          if (isValid && !dataList.find(dd => dd.value == data.value)) {
            dataList.push(data);
          }
        });
      }
      return dataList;
    },
    setting() {
      const setting = {};
      if (this.config.isMultiple) {
        setting.multiple = this.config.isMultiple;
      }
      setting.placeholder = this.config.placeholder;
      setting.sperateText = this.config.sperateText || '、';
      setting.isAutoSelectdOnlyValue = this.config.isAutoSelectdOnlyValue || false;
      if (this.config.dataSource === 'matrix') {
        setting.dynamicUrl = '/api/rest/matrix/column/data/search/forselect';
        setting.rootName = 'dataList';
        const params = { matrixUuid: this.config.matrixUuid, filterList: []};
        if (!this.$utils.isEmpty(this.filter)) {
          params.filterList = this.$utils.deepClone(this.filter);
        }
        if (this.config.isAddData && !this.$utils.isEmpty(this.config.matrixUuid)) {
          setting.firstLi = true;
          setting.firstText = this.$t('dialog.title.addtarget', {'target': this.$t('page.data')});
        }
        if (this.config.mapping) {
          params.keywordColumn = this.config.mapping.text;
          params.valueField = this.config.mapping.value;
          params.textField = this.config.mapping.text;
        }
        if (this.config.sourceColumnList && this.config.sourceColumnList.length > 0) {
          this.config.sourceColumnList.forEach(sourceColumn => {
            if (!this.$utils.isEmpty(sourceColumn.valueList) && sourceColumn.column && sourceColumn.expression) {
              const newValueList = sourceColumn.valueList.filter(v => !this.$utils.isEmpty(v));
              if (!this.$utils.isEmpty(newValueList)) {
                params.filterList.push({
                  uuid: sourceColumn.column,
                  expression: sourceColumn.expression,
                  valueList: newValueList
                });
              }
            }
          });
        }
        //隐藏属性过滤
        if (!this.$utils.isEmpty(this.config.hiddenFieldList)) {
          params.hiddenFieldList = this.$utils.mapArray(this.config.hiddenFieldList, 'value');
        }
        setting.params = params;
      } else if (this.config.dataSource === 'formtableinputer') {
        setting.dataList = [];
        let list = [];
        if (this.config.formtableinputerUuid && !this.$utils.isEmpty(this.formData) && !this.$utils.isEmpty(this.formData[this.config.formtableinputerUuid])) {
          list = this.$utils.deepClone(this.formData[this.config.formtableinputerUuid]);
          if (!this.$utils.isEmpty(list)) {
            list.forEach(item => {
              if (this.config.mapping && !this.$utils.isEmpty(item)) {
                const valueUuid = this.config.mapping.value.split('##')[0];
                const textUuid = this.config.mapping.text.split('##')[0];
                const value = this.transformPropertyToString(item[valueUuid]);
                const text = this.transformPropertyToString(item[textUuid]);
                if (!this.$utils.isEmpty(value) && !this.$utils.isEmpty(text)) {
                  let findValue = setting.dataList.find(d => d.value === value);
                  if (this.$utils.isEmpty(findValue)) {
                    let obj = {
                      value: value,
                      text: text
                    };
                    setting.dataList.push(this.$utils.deepClone(obj));
                  }
                }
              }
            });
          }
        }
        if (!this.$utils.isEmpty(this.value)) {
          if (this.$utils.isEmpty(setting.dataList)) {
            this.setValue(null);
          } else {
            let newValue = null;
            if (Array.isArray(this.value)) {
              newValue = this.value.filter(v => {
                return setting.dataList.find(d => d.value === v.value);
              });
              if (!this.$utils.isSame(this.value, newValue)) {
                this.setValue(newValue);
              }
            } else {
              if (!setting.dataList.find(d => d.value === this.value.value)) {
                this.setValue(null);
              }
            }
          }
        }
      } else {
        setting.showName = 'text';
        setting.dataList = this.validatedDataList;
      }
      return setting;
    },
    actualValue() {
      if (this.value) {
        if (!this.config.isMultiple && this.value instanceof Array && this.value.length > 0) {
          return this.value[0];
        } else {
          return this.value;
        }
      }
      return null;
    }
  },
  watch: {
    filter: {
      handler(val) {
        if (!this.isFirst && !this.$utils.isEmpty(val) && !this.$utils.isSame(val, this.initFilter)) {
          //改变过滤条件，清空选项
          if (!this.disabled && !this.readonly) {
            this.setValue(null);
          }
        }
        this.initFilter = this.$utils.deepClone(val);
        this.isFirst = false;
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped></style>
