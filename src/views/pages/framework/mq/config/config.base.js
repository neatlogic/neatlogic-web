export const ConfigBase = {
  props: {
    config: { type: Object }
  },
  data() {
    return {
      configLocal: null
    };
  },
  created() {
    this.configLocal = this.config ? this.$utils.deepClone(this.config) : {};
  },
  methods: {
  },
  beforeDestroy() {
  },
  watch: {
    configLocal: {
      handler: function(val) {
        this.$emit('setConfig', val);
      },
      deep: true
    }
  }
};
