<template>
  <TsFormInput
    ref="formitem"
    type="text"
    border="border"
    :maxlength="config.maxLength"
    :placeholder="config.placeholder"
    :value="actualValue"
    :readonly="readonly"
    :disabled="disabled"
    :validateList="actualValidateList"
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
  },
  data() {
    return {
    };
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
    validData() {
      const errorList = [];
      if (!this.$refs.formitem.valid()) {
        errorList.push({uuid: this.formItem.uuid, error: this.$refs.formitem.validMesage});
      }
      return errorList;
    }
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
    },
    actualValidateList() {
      let validateList = this.validateList || [];
      if (this.config.validate) {
        validateList.push(this.config.validate);
      }
     
      if (!this.$utils.isEmpty(this.config.regex)) {
        validateList.push({
          name: 'regex', 
          pattern: this.config.regex 
        });
      }
      return validateList; 
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped></style>
