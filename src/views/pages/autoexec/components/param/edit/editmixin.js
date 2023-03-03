export default {
  props: {
    config: Object,
    defaultValue: [String, Boolean, Object, Array, Number],
    value: [String, Boolean, Object, Array, Number],
    readonly: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    isRequired: {
      //是否必填，抽离出原组件的必填信息进行覆盖，当此选项为1时覆盖原来的config的validList里的required
      type: [Number, Boolean]
    },
    setValidComponentsList: { //设置需要校验规则的组件类型列表
      type: Array,
      default: () => []
    }

  },
  data() {
    return {
    };
  },
  mounted() {
  },
  beforeDestroy() {

  },
  methods: {
    updateval(val) {
      this.$emit('change', val);
    },
    valid() {
      if (this.$refs.item && this.$refs.item.valid) {
        return this.$refs.item.valid();
      } else {
        return true;
      }
    }
  },
  computed: {
    getSetting() {
      let setting = Object.assign({}, this.config);
      setting.validateList = setting.validateList || [];
      if (typeof this.isRequired == 'boolean') {
        //当从别的判断带过来的关于这个组件是否必填的选项时，进行原来required的覆盖
        if (this.isRequired && setting.validateList.indexOf('required') < 0) {
          setting.validateList.push('required');
        } else if (!this.isRequired && setting.validateList.indexOf('required') > -1) {
          setting.validateList = setting.validateList.filter(v => {
            return v != 'required';
          });
        }
      }
      return setting;
    }
  },
  watch: {
  }
};
