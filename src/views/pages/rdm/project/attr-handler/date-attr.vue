<template>
  <div>
    <TsFormDatePicker
      ref="handler"
      border="border"
      :transfer="true"
      :value="valueLocal"
      :readonly="readonly"
      type="date"
      format="yyyy-MM-dd"
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
    TsFormDatePicker: resolve =>
      require(['@/resources/plugins/TsForm/TsFormDatePicker'], resolve)
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
        const timestr = this.formatDate(val);
        this.$emit('setValue', [timestr], [timestr]);
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
      if (this.valueList && this.valueList.length > 0) {
        return this.valueList[0];
      }
      return null;
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
