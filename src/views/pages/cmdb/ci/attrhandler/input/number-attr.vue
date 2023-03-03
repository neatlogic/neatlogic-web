<template>
  <div>
    <TsFormInput
      ref="handler"
      type="text"
      :value="value"
      maxlength="20"
      :validateList="validateList"
      @change="setData"
      @on-keydown="validInput"
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
    attrData: { type: Object },
    valueList: { type: Array }
  },
  data() {
    return {
      validateList: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (this.attrData) {
      if (this.attrData.isRequired == 1) {
        this.validateList.push('required');
      }
      if (this.attrData.validConfig && this.attrData.validConfig.regex) {
        this.validateList.push({ name: 'regex', pattern: this.attrData.validConfig.regex });
      }
    }
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
    validInput(event, val) {
      if ((val == '' && event.key == '-') || event.key == 'ArrowLeft' || event.key == 'ArrowRight' || event.key == 'Backspace' || (event.keyCode >= 48 && event.keyCode <= 57) || (val.toString().indexOf('.') == -1 && event.key == '.')) {
        event.returnValue = true;
      } else {
        event.returnValue = false;
      }
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
      }
      return '';
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
