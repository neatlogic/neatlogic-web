export const WidgetBaseConfig = {
  props: {
   
  },
  data() {
    return {
      axisFontSizeList: [
        {
          text: this.$t('term.report.small'),
          value: 12
        },
        {
          text: this.$t('term.report.medium'),
          value: 16
        },
        {
          text: this.$t('term.report.large'),
          value: 20
        }
      ],
      defaultFontSize: 12,
      defaultSizeColor: '#595959'
    };
  },
  methods: {
    getConfigValue(path, defaultValue) {
      if (!path) {
        return defaultValue;
      }
      const keyList = Array.isArray(path) ? path : path.split('.');
      let value = this.config;
      for (let i = 0; i < keyList.length; i++) {
        if (!value || typeof value !== 'object') {
          return defaultValue;
        }
        value = value[keyList[i]];
      }
      return value === undefined || value === null ? defaultValue : value;
    },
    getConfigObject(path) {
      const value = this.getConfigValue(path, {});
      return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    }
  },
  watch: {}
};
