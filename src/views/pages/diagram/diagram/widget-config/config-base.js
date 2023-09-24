//import ThemeUtils from '@/views/pages/framework/theme/themeUtils.js';
export const ConfigBase = {
  components: { TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve) },
  props: {
    form: { type: Array }, //表单定义
    data: { type: Object } //表单数据
  },
  data() {
    return {};
  },
  methods: {},
  beforeDestroy() {},
  watch: {
    data: {
      handler(val) {
        this.$emit('data:update', val);
      },
      deep: true
    }
  }
};
