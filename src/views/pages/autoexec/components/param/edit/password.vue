<template>
  <TsFormInput
    ref="item"
    type="password"
    :value="value"
    :readonly="readonly"
    :disabled="disabled"
    v-bind="getSetting"
    :showPassword="showPassword"
    border="border"
    @on-change="updateval"
    @on-blur="onBlurValue"
    @on-focus="onFocusValue"
  ></TsFormInput>
</template>

<script>
import comMixin from './editmixin.js';
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
export default {
  name: '',
  components: {
    TsFormInput
  },
  mixins: [comMixin],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    //  value: [String, Number]
  },
  data() {
    return {
      showPassword: true,
      currentValue: ''
    };
  },

  beforeCreate() {},

  created() {},

  beforeMount() {},

  mounted() {
    if (this.defaultValue && this.defaultValue != '') {
      this.showPassword = false;
      this.currentValue = this.defaultValue;
    }
  },

  beforeUpdate() {},

  updated() {},

  activated() {},

  deactivated() {},

  beforeDestroy() {},

  destroyed() {},

  methods: {
    updateval(val) {
      this.showPassword = true;
      this.currentValue = val;
      this.$emit('change', val);
    },
    onFocusValue() {
      if (!this.showPassword) {
        this.$emit('change', '');
        this.showPassword = true;
      }
    },
    onBlurValue() {
      if (this.value == '') {
        this.showPassword = false;
        this.$emit('change', this.currentValue);
      }
    }
   
  },

  filter: {},

  computed: {},

  watch: {}
};
</script>
<style lang="less" scoped>
/deep/ .tsform-input-readonly {
  opacity: 1;
  cursor: text;
  .tsform-readonly {
    cursor: text;
  }
}
</style>
