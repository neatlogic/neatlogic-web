<template>
  <div>
    <TsFormItem label="默认值">
      <components
        :is="getType"
        v-model="setting.value"
        v-bind="getInitSetting"
        :transfer="true"
        border="border"
        width="80%"
        @on-change="changeValue"
      ></components>
    </TsFormItem>
  </div>
</template>
<script>
import TsFormItem from '@/resources/plugins/TsForm/TsFormItem';
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
import TsFormDatePicker from '@/resources/plugins/TsForm/TsFormDatePicker';
export default {
  name: '',
  components: {TsFormItem, TsFormInput, TsFormDatePicker},
  filters: {},
  props: {
    type: String,
    setting: Object
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
    validComponent() {
      return true;
    },
    changeValue(value) {
      this.setting.defaultValue = value;
    }
  },
  computed: {
    getType(type) {
      if (this.type == 'textarea' || this.type == 'text' || this.type == 'password') {
        return TsFormInput;
      } else if (this.type == 'time' || this.type == 'date') {
        return TsFormDatePicker;
      }
      return '';
    },
    getInitSetting() {
      let config = {type: this.type};
      if (this.type == 'date') {
        config.format = 'yyyy-MM-dd';
      } else if (this.type == 'textarea' || this.type == 'text') {
        this.type == 'text' ? config.maxlength = 50 : config.maxlength = 500;
      } 
      return config;
    }
  },
  watch: {}
};
</script>
<style lang='less'>
</style>
