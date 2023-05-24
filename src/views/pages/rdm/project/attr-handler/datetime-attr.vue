<template>
  <div>
    <TsFormDatePicker
      ref="handler"
      border="border"
      :transfer="true"
      :value="valueLocal"
      :readonly="readonly"
      :type="mode == 'input' ? 'datetime' : 'datetimerange'"
      :format="format"
      valueType="format"
      :validateList="validateList"
      @change="changeValue"
    ></TsFormDatePicker>
  </div>
</template>
<script>
import { AttrBase } from './base-attr.js';
export default {
  name: '',
  components: {
    TsFormDatePicker: resolve => require(['@/resources/plugins/TsForm/TsFormDatePicker'], resolve)
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
      return this.$refs['handler'].valid();
    },
    formatDate(val) {
      const d = new Date(val);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const day = d.getDate();
      const hour = d.getHours();
      const min = d.getMinutes();
      const sec = d.getSeconds();
      return year + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day) + ' ' + (hour < 10 ? '0' + hour : hour) + ':' + (min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec);
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
    },
    format() {
      return this.attrConfig?.config?.format || 'yyyy-MM-dd HH:mm:ss';
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
