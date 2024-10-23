<template>
  <div v-if="errorList.length === 0">
    <TsFormCheckbox
      ref="formitem"
      :readonly="readonly"
      :disabled="disabled"
      :value="actualValue"
      :dataList="dataList"
      :vertical="config.direction === 'vertical'"
      :validateList="validateList"
      :readonlyTextIsHighlight="readonlyTextIsHighlight"
      :isClearEchoFailedDefaultValue="isClearEchoFailedDefaultValue"
      :isCustomValue="isCustomValue"
      @change="
        val => {
          setValue(val);
        }
      "
    ></TsFormCheckbox>
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
import TsFormCheckbox from '@/resources/plugins/TsForm/TsFormCheckbox';
export default {
  name: '',
  components: {
    TsFormCheckbox
  },
  extends: base,
  mixins: [validmixin],
  props: {
    readonly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
      dataList: [],
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
    },
    getData() {
      if (this.config.dataSource === 'matrix') {
        if (this.config.matrixUuid && this.config.mapping && this.config.mapping.value && this.config.mapping.text) {
          const params = {
            matrixUuid: this.config.matrixUuid,
            valueField: this.config.mapping.value,
            textField: this.config.mapping.text
          };
          if (this.filter) {
            params.filterList = this.$utils.deepClone(this.filter);
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
          this.$api.framework.matrix.getMatrixDataForSelect(params).then(res => {
            this.dataList = res.Return.dataList;
            this.$nextTick(() => {
              this.$emit('resize');
            });
          });
        } else {
          this.dataList = [];
          this.$nextTick(() => {
            this.$emit('resize');
          });
        }
      } else {
        this.dataList = this.validatedDataList;
        this.$nextTick(() => {
          this.$emit('resize');
        });
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
    actualValue() {
      if (!this.$utils.isEmpty(this.value)) { //将this.value 改成 this.$utils.isEmpty 解决值为0的时候，被清空的问题
        if (!(this.value instanceof Array)) {
          return [this.value];
        } else {
          return this.value;
        }
      }
      return null;
    }
  },
  watch: {
    filter: {
      handler: function(val, oldVal) {
        if (!this.isFirst && !this.$utils.isEmpty(val) && !this.$utils.isSame(val, oldVal)) {
          //改变过滤条件，清空选项
          if (!this.disabled && !this.readonly) {
            this.setValue([]);
          }
        }
        this.getData();
        this.isFirst = false;
      },
      deep: true
    },
    config: {
      handler: function(val) {
        this.getData();
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped></style>
