<template>
  <TsFormInput
    ref="formitem"
    type="password"
    border="border"
    :placeholder="config.placeholder"
    :maxlength="config.maxLength"
    :readonly="readonly"
    :disabled="disabled"
    :value="actualValue"
    :validateList="validateList"
    :readonlyTextIsHighlight="readonlyTextIsHighlight"
    @change="
      val => {
        setValue(val);
      }
    "
  ></TsFormInput>
</template>
<script>
import base from './base.vue';
import validmixin from './common/validate-mixin.js';
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';

export default {
  name: '',
  components: {
    TsFormInput
  },
  extends: base,
  mixins: [validmixin],
  props: {
    readonly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },
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
  },
  filter: {},
  computed: {
    actualValue() {
      if (this.value) {
        if (this.value instanceof Array && this.value.length > 0) {
          return this.value[0];
        } else {
          return this.value;
        }
      }
      return null;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped></style>
