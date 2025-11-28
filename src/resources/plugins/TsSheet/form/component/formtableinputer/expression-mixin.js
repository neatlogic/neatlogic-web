export default {
  methods: {
    handleExpressionData({expression, formData = {}}) {
      let expressionFormData = {};
      const { type = '', jsValue = '', list = [] } = expression || {};
      if (type === 'strExpression') {
        list.forEach(item => {
          if (item.mappingMode === 'formCommonComponent') {
            const uuidList = item.value.split('#');
            const formItemValue = formData[uuidList[0]] || '';
            const uuid = uuidList[0];
            if (!this.$utils.isEmpty(formItemValue)) {
              if (Array.isArray(formItemValue)) {
                let multipleValueList = [];
                formItemValue.forEach(a => {
                  if (typeof a === 'object') {
                    if (uuidList[1]) {
                      multipleValueList.push(a[uuidList[1]]);
                    } else {
                      multipleValueList.push(a['value']);
                    }
                  } else {
                    multipleValueList.push(a);
                  }
                });
                expressionFormData[uuid] = multipleValueList;
              } else if (typeof formItemValue === 'object') {
                if (uuidList[1]) {
                  expressionFormData[uuidList[1]] = formItemValue[uuidList[1]] || '';
                } else {
                  expressionFormData[uuid] = formItemValue;
                }
              } else {
                expressionFormData[uuid] = formItemValue;
              }
            }
          }
        });
      } else if (type === 'jsExpression' && jsValue) {
        expressionFormData = this._getFormlabelMapping(formData);
      }
      return expressionFormData;
    },
    _getFormlabelMapping(formData) {
      let data = {};
      const whiteList = ['formtext', 'formdate', 'formtime', 'formselect', 'formradio', 'formnumber'];
      this.formItemList.forEach(item => {
        if (whiteList.includes(item.handler)) {
          data[item.uuid] = formData[item.uuid];
        } else {
          if (item.config && item.config.dataConfig) {
            const findItem = item.config.dataConfig.find(a => a.uuid === this.formItem.uuid);
            if (findItem) {
              item.config.dataConfig.forEach(a => {
                if (whiteList.includes(a.handler)) {
                  data[a.uuid] = formData[a.uuid];
                }
              });
            }
          }
        }
      });
      return data;
    }
  }
};
