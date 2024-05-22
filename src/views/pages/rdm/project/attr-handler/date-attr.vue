<template>
  <div>
    <TsFormDatePicker
      ref="handler"
      border="border"
      :transfer="true"
      :value="valueLocal"
      :readonly="readonly"
      :type="mode == 'input' ? 'date' : 'daterange'"
      format="yyyy-MM-dd"
      :validateList="validateList"
      @change="changeValue"
      @change-label="(text, selectedList) => $emit('changeLabel', text, selectedList)"
    ></TsFormDatePicker>
  </div>
</template>
<script>
import { AttrBase } from './base-attr.js';
export default {
  name: '',
  components: {
    TsFormDatePicker: () => import('@/resources/plugins/TsForm/TsFormDatePicker')
  },
  extends: AttrBase,
  props: {},
  data() {
    return {};
  },
  beforeCreate() {},
  created() {
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
    formatDate(val) {
      const d = new Date(val);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const day = d.getDate();
      return year + '-' +
        (month < 10 ? '0' + month : month) + '-' +
        (day < 10 ? '0' + day : day);
    },
    valid() {
      return this.$refs['handler'].valid();
    },
    changeValue(val) {
      if (val) {
        if (val instanceof Array) {
          this.$emit('setValue', val, val);
        } else {
          const timestr = this.formatDate(val);
          this.$emit('setValue', [timestr], [timestr]);
        }
      } else {
        this.$emit('setValue', null, null);
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
    valueLocal() {
      if (this.mode === 'input') {
        if (this.valueList && this.valueList.length > 0) {
          return this.valueList[0];
        }
      } else if (this.mode === 'search') {
        //搜索模式返回的是数组
        return this.valueList;
      }
      return null;
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
