<template>
  <div>
    <TsFormInput
      ref="text"
      :value="valueLocal"
      :border="border"
      :readonly="readonly"
      :validateList="validateList"
      @change="changeValue"
      @change-label="(text, selectedList) => $emit('changeLabel', text, selectedList)"
    ></TsFormInput>
  </div>
</template>
<script>
import { AttrBase } from './base-attr.js';
export default {
  name: '',
  components: {
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
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
      return this.$refs['text'].valid();
    },
    changeValue(val) {
      if (val != null && val.trim() != '') {
        this.$emit('setValue', [val], [val]);
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
