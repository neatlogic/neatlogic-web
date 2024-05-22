<template>
  <div>
    <TsFormSelect
      ref="select"
      :overflow="false"
      :value="valueListLocal"
      :dataList="dataList"
      :readonly="readonly"
      transfer
      :multiple="isMultiple"
      :border="border"
      :validateList="validateList"
      @change="changeValue"
      @change-label="(text, selectedList) => $emit('changeLabel', text, selectedList)"
    ></TsFormSelect>
  </div>
</template>
<script>
import { AttrBase } from './base-attr.js';

export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  extends: AttrBase,
  props: {},
  data() {
    return {};
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
    valid() {
      return this.$refs['select'].valid();
    },
    changeValue(val, opt) {
      if (val instanceof Array) {
        this.$emit('setValue', val, val);
      } else {
        this.$emit('setValue', [val], [val]);
      }
    }
  },
  filter: {},
  computed: {
    validateList() {
      if (this.mode === 'input' && this.attrConfig.isRequired) {
        return [{ name: 'required', message: ' ' }];
      }
      return [];
    },
    valueListLocal() {
      const list = [];
      if (this.valueList && this.valueList.length > 0) {
        this.valueList.forEach(v => {
          if (typeof v != 'object') {
            if (v) {
              list.push(v);
            }
          }
        });
      }
      return list;
    },
    dataList() {
      const dataList = [];
      if (this.attrConfig && this.attrConfig?.config?.members && this.attrConfig.config.members.length > 0) {
        this.attrConfig.config.members.forEach(d => {
          dataList.push({ value: d, text: d });
        });
      }
      return dataList;
    },
    isMultiple() {
      if (this.mode !== 'input' || (this.attrConfig && this.attrConfig?.config?.isMultiple)) {
        return true;
      }
      return false;
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
