<template>
  <div>
    <TsFormInput
      ref="handler"
      :value="value"
      :disabled="disabled"
      :validateList="validateList"
      type="textarea"
      @change="setData"
    ></TsFormInput>
  </div>
</template>
<script>
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
export default {
  name: '',
  components: {
    TsFormInput
  },
  props: {
    disabled: {type: Boolean, default: false},
    propConfig: { type: Object },
    attrData: { type: Object },
    valueList: { type: Array }
  },
  data() {
    return {
      validateList: []
    };
  },
  beforeCreate() {},
  created() {
    if (this.attrData) {
      if (this.attrData.isRequired || this.attrData.isCiUnique) {
        this.validateList.push('required');
      }
      if (this.attrData.validConfig && this.attrData.validConfig.regex) {
        this.validateList.push({ name: 'regex', pattern: this.attrData.validConfig.regex });
      }
    }
  },
  beforeMount() {},
  mounted() {
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    setData(val) {
      this.$emit('setData', [val]);
      this.$emit('setValue', [val]);
    },
    valid() {
      //验证数据合法性
      const handler = this.$refs['handler'];
      return handler.valid();
    }
  },
  filter: {},
  computed: {
    value: function() {
      if (this.valueList && this.valueList.length > 0) {
        return this.valueList[0];
      } else {
        if (this.propConfig) {
          return this.propConfig.value;
        } else {
          return '';
        }
      }
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
