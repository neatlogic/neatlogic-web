export const WidgetBaseConfig = {
  props: {
   
  },
  data() {
    return {
      axisFontSizeList: [
        {
          text: '小',
          value: 12
        },
        {
          text: '中',
          value: 16
        },
        {
          text: '大',
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
