
<template>
  <TsFormInput
    ref="item"
    :value="value"
    :readonly="readonly"
    :disabled="disabled"
    v-bind="getSetting"
    border="border"
    @on-change="updateval"
  ></TsFormInput>
</template>
<script>
import comMixin from './editmixin.js';
export default {
  name: '',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  filters: {
  },
  mixins: [comMixin],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
  },
  data() {
    return {
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
      this.$emit('change', val);
    }
    
  },
  computed: {
    getSetting() {
      let setting = this.$utils.deepClone(this.config);  
      if (!this.disabled) {
        Object.assign(setting, {
          type: 'text'
        });
        setting.validateList = [].concat(setting.validateList || []);
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
  watch: {}
};
</script>
