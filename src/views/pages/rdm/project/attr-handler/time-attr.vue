<template>
  <div>
    <TsFormDatePicker
      ref="handler"
      border="border"
      :transfer="true"
      :value="valueLocal"
      :readonly="readonly"
      type="time"
      format="HH:mm:ss"
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
    valid() {
      return this.$refs['handler'].valid();
    },
    changeValue(val) {
      if (val) {
        this.$emit('setValue', [val.toString()], [val.toString()]);
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
