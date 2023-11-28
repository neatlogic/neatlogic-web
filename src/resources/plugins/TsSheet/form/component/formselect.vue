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
      @change="
        val => {
          setValue(val);
        }
      "
    ></TsFormSelect>
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
    TsFormSelect
  },
  extends: base,
  mixins: [validmixin],
  props: {
    readonly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
      isFirst: true
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
      if (this.config.dataSource === 'matrix') {
        setting.dynamicUrl = '/api/rest/matrix/column/data/search/forselect';
        setting.rootName = 'dataList';
        const params = { matrixUuid: this.config.matrixUuid, filterList: []};
        if (this.filter) {
          params.filterList = this.$utils.deepClone(this.filter);
        }
        if (this.config.mapping) {
          params.keywordColumn = this.config.mapping.text;
          params.valueField = this.config.mapping.value;
          params.textField = this.config.mapping.text;
        }
        if (this.config.sourceColumnList && this.config.sourceColumnList.length > 0) {
          this.config.sourceColumnList.forEach(sourceColumn => {
            if (sourceColumn.valueList && sourceColumn.column && sourceColumn.expression) {
              params.filterList.push({
                uuid: sourceColumn.column,
                expression: sourceColumn.expression,
                valueList: sourceColumn.valueList
              });
            }
          });
        }
        setting.params = params;
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
      handler(val, oldVal) {
        if (!this.isFirst && !this.$utils.isEmpty(val) && !this.$utils.isSame(val, oldVal)) {
          //改变过滤条件，清空选项
          this.setValue(null);
        }
        this.isFirst = false;
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped></style>
