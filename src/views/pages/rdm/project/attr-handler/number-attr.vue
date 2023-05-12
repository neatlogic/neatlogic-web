<template>
  <div>
    <TsFormInput
      ref="handler"
      type="number"
      :value="valueLocal"
      :border="border"
      :readonly="readonly"
      :validateList="validateList"
      @change="changeValue"
    ></TsFormInput>
  </div>
</template>
<script>
import { AttrBase } from './base-attr.js';
export default {
  name: '',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
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
      this.$emit('setValue', [val], [val]);
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
