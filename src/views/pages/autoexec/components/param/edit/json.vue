<template>
  <TsFormInput
    ref="item"
    :value="currentValue"
    :readonly="readonly"
    :disabled="disabled"
    v-bind="getSetting"
    :rows="1"
    border="border"
    @on-change="updateval"
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
    // value: [String, Object]
  },
  data() {
    return {
      currentValue: ''
    };
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
    updateval(val) {
      this.currentValue = val;
      this.$emit('change', val);
    }
  },
  filter: {},
  computed: {
    getSetting() {
      let setting = this.$utils.deepClone(this.config);
      Object.assign(setting, {
        rows: 1, type: 'textarea'
      });
      if (!this.disabled) {
        setting.validateList = [].concat(setting.validateList || []);
        setting.validateList.push({
          name: 'json',
          message: this.$t('form.validate.correctjson'),
          trigger: 'blur',
          validator(rule, value, _this) {
            let isValid = true;
            if (value.trim()) {
              try {
                let data = JSON.parse(value);
                if (typeof data != 'object' || data === null) {
                  throw new Error();
                }
              } catch (res) {
                isValid = false;
              }
            }
            return isValid;
          }
        });
      }
      if (typeof this.isRequired == 'boolean') {
        //当从别的判断带过来的关于这个组件是否必填的选项时，进行原来required的覆盖
        if (this.isRequired && setting.validateList && setting.validateList.indexOf('required') < 0) {
          setting.validateList.push('required');
        } else if (!this.isRequired && setting.validateList && setting.validateList.indexOf('required') > -1) {
          setting.validateList = setting.validateList.filter(v => {
            return v != 'required';
          });
        }
      }     
      return setting;
    }
  },
  watch: {
    value: {
      handler(val) {
        if (val) {
          if (val != this.currentValue) {
            if (typeof val == 'object') {
              this.currentValue = JSON.stringify(val, null, '\t');
            } else if (typeof val == 'string') { 
              this.currentValue = val;
            }
          }
        } else {
          this.currentValue = '';
        }
      },
      immediate: true,
      deep: true
    }
  }
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
/deep/ textarea{
  padding: 4px 8px !important;
}
</style>
