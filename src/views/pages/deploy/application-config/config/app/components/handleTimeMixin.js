export default {
  methods: {
    setMaintenanceWindowValue(timeRange) {
      // 将[1,2] 转成 ['1,2']
      let value = [];
      if (timeRange && timeRange.length > 1) {
        value = [`${timeRange[0]},${timeRange[1]}`];
      }
      return value;
    },
    handleMaintenanceWindowValue(timeRange) {
      // 将['1,2'] 转成 [1,2]
      let value = [];
      if (timeRange && timeRange.length > 0) {
        let v = timeRange[0] ? timeRange[0].split(',') : [];
        if (v && v.length > 1) {
          value = [v[0], v[1]];
        }
      }
      return value;
    },
    handleTimerange(timeRange) {
      // 将'1,2' 转成 '1~2'
      let value = '';
      if (timeRange) {
        value = timeRange.replace(/,/, '~');
      }
      return value;
    }
  }
};
