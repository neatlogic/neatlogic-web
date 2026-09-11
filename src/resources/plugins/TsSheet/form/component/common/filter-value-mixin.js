// 复用表格列的过滤取值规则，使普通值、选项对象和用户值采用相同的转换方式。
export default { methods: {
  handleFilterValue(value, column, formItem = {}) {
    let tmpText, tmpValue;
    let { handler = '', config = {} } = formItem || {};
    let { dataList = [] } = config;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      tmpText = tmpValue = value;
      if (handler == 'formuserselect') {
        tmpText = tmpValue = this.handleUserSelectValue(value);
      } else if (!this.$utils.isEmpty(dataList)) {
        const findData = dataList.find(f => f.value === value);
        tmpText = findData ? findData.text : value;
      }
    } else if (typeof value === 'object') {
      tmpText = value.text;
      tmpValue = value[column];
      if (handler == 'formuserselect') {
        tmpText = this.handleUserSelectValue(tmpText);
        tmpValue = this.handleUserSelectValue(tmpValue);
      } else if (!this.$utils.isEmpty(dataList) && tmpValue) {
        const findData = dataList.find(f => f[column] === tmpValue);
        tmpText = findData ? findData.text : tmpText;
      }
    }
    return { text: tmpText, value: tmpValue };
  },
  handleUserSelectValue(value) {
    // 处理用户下拉组件的值，去掉前缀
    let prefixList = ['user#', 'team#', 'role#'];
    let currentValue = this.$utils.deepClone(value);
    let uuid = '';
    let parts = [];
    prefixList.some(v => {
      if (!this.$utils.isEmpty(currentValue) && currentValue.includes(v)) {
        parts = currentValue.split(v) || [];
        if (parts.length > 1) {
          uuid = parts[1] || '';
          return true;
        }
      }
      return false;
    });
    return uuid;
  }
} };
