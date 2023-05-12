export default {
  props: {
    setting: Object,
    value: [Array, String],
    isReadonly: Boolean,
    formView: {
      //是否通过form-view页面进行初始化，如果不是则需要把defaultValue值给 value
      type: Boolean,
      default: true
    },
    componentList: {
      //同一个表单的所有组件,主要用来做数据引用
      type: Array,
      default: () => {
        return [];
      }
    },
    knowledgeView: { //区分知识与表单的样式不一致，默认false：样式与表单一致；true:需要调整样式
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      validMesage: ''
    };
  },
  mounted() {

  },
  beforeDestroy() {

  },
  methods: {
    updatethis(val) {
      this.$emit('update', val);
    },
    changeLabel(label) {
      this.$emit('change-label', label);
    }, 
    getMatrixText(value) { //矩阵数据源text
      let textList = [];
      let text = '';
      if (Array.isArray(value)) {
        value.forEach(v => {
          let vText = v.split('&=&');
          textList.push(vText[1]);
        });
        text = textList;
      } else {
        let vText = value.split('&=&');
        text = vText[1];
      }
      return text;
    },
    saveDetailData(data) { //矩阵数据详细信息保存
      let _this = this;
      let typeArr = ['select', 'selects', 'radio', 'checkbox'];
      let detailData = {};
      let dataConfig = _this.setting && _this.setting.config && _this.setting.config.dataConfig ? _this.setting.config.dataConfig : [];
      if (this.selectUuidList.length > 0) {
        this.selectUuidList.forEach(s => {
          detailData[s] = {};
        });
        Object.keys(data).forEach(key => {
          if (detailData[key]) {
            Object.keys(data[key]).forEach(subKey => {
              let config = _this.setting.config.attributeList.find(item => { //扩展属性
                return item.attributeUuid == subKey;
              });
              let obj = data[key][subKey];
              if (obj.type && typeArr.includes(obj.type)) {
                let detailObj = {
                  type: obj.type,
                  text: obj.text || '',
                  value: obj.value || ''
                };
                let dataList = [];
                _this.currentValue[key] && _this.currentValue[key][subKey] && (detailObj.value = _this.currentValue[key][subKey]);
                if (config) { 
                  if (config.attrConfig && config.attrConfig.dataSource == 'matrix') {
                    detailObj.text = _this.getMatrixText(detailObj.value);
                  } else if (config.attrConfig && config.attrConfig.dataList) {
                    dataList = config.attrConfig.dataList || [];
                    detailObj.text = _this.getSelectText(detailObj.value, dataList);
                  }
                } else if (!config && obj.dataList) { //二次编辑
                  let dataConfigItem = dataConfig.find(d => d.uuid == subKey);
                  dataConfigItem && (detailObj.type = dataConfigItem.editType);
                  dataList = obj.dataList;
                  detailObj.text = _this.getSelectText(detailObj.value, dataList);
                }
                this.$set(detailData[key], subKey, detailObj);
              } else if (obj.type) {
                let subKeyValue = _this.currentValue[key] && _this.currentValue[key][subKey] ? _this.currentValue[key][subKey] : obj.value;
                detailData[key][subKey] = {
                  type: obj.type,
                  text: subKeyValue,
                  value: subKeyValue
                };
              }
            });
          }
        });
      }
      return detailData;
    },
    saveIntegrationDetail(data, currentValue) { //集成数据详细信息保存
      let _this = this;
      let detailData = {};
      Object.keys(data).forEach(key => {
        if (currentValue[key]) {
          detailData[key] = {};
          Object.keys(data[key]).forEach(subKey => { //每行的数据
            let obj = _this.getIntegrationText(data, currentValue, key, subKey);
            if (!_this.$utils.isEmptyObj(obj)) detailData[key][subKey] = obj;
          });
        } 
      });
      Object.keys(currentValue).forEach(key => { //可编辑组件数据
        Object.keys(currentValue[key]).forEach(subKey => {
          if (detailData[key] && !detailData[key].hasOwnProperty(subKey)) {
            let obj = _this.getIntegrationText(data, currentValue, key, subKey);
            if (!_this.$utils.isEmptyObj(obj)) detailData[key][subKey] = obj;
          }
        });
      });
      return detailData;
    },
    getIntegrationText(data, currentValue, key, subKey) { //集成数据转换,key表示唯一标识，subKey表示表头信息中的key
      let typeArr = ['select', 'selects', 'radio', 'checkbox'];
      let obj = {};
      let th = this.tableData.theadList.find(item => {
        return item.key == subKey;
      });
      if (th) {
        if (!currentValue[key].hasOwnProperty(subKey)) {
          obj = {
            type: th.type || 'input',
            text: data[key][subKey],
            value: data[key][subKey]
          };
        } else {
          let value = currentValue[key][subKey];
          if (th.type && typeArr.includes(th.type)) {
            let dataList = [];
            dataList = data[key][subKey] && data[key][subKey].dataList ? data[key][subKey].dataList : th.config.dataList;
            let text = '';
            let textList = [];
            if (Array.isArray(value)) {
              dataList.map((d) => {
                if (value.includes(d.value)) textList.push(d.text);
              });
              text = textList;
            } else {
              if (value && dataList.length > 0) {
                let findItem = dataList.find(d => d.value == value);
                findItem && (text = findItem.text);
              }
              // dataList.map((d) => {
              //   if (d.value == value) text = d.text;
              // });
            }
            obj = {
              type: th.type,
              text: text,
              value: value
            };
          } else {
            obj = {
              type: th.type || 'input',
              text: value,
              value: value
            };
          }
        }
      }
      return obj;
    },
    getSelectText(value, dataList) { //单选，多选的text转换
      let text = '';
      let textList = [];
      if (Array.isArray(value)) {
        dataList.map((d) => {
          if (value.includes(d.value)) textList.push(d.text);
        });
        text = textList;
      } else {
        dataList.map((d) => {
          if (d.value == value) text = d.text;
        });
      }
      return text;
    },
    getStaticDetail(dataList) { //处理输入组件数据保存
      let _this = this;
      let typeArr = ['select', 'selects', 'radio', 'checkbox'];
      let objJson = {};
      let selectUuidList = [];
      let extendedData = {};
      let detailData = {};
      dataList.forEach((item, oindex) => {
        let config = item.config || {};
        if (item.attributeUuid) {
          detailData[item.attributeUuid] = {};
          extendedData[item.attributeUuid] = {};
          selectUuidList.push(item.attributeUuid);
        }
        if (config.attributeList && config.attributeList.length > 0) {
          config.attributeList.forEach(async(attr, index) => {
            detailData[item.attributeUuid][attr.attributeUuid] = {};
            extendedData[item.attributeUuid][attr.attributeUuid] = {};
            if (attr.type == 'table') {
              let tableConfig = attr.attrConfig.value;
              let tableDetail = {};
              !this.$utils.isEmptyObj(tableConfig) && Object.keys(tableConfig).forEach(key => {
                if (tableConfig[key]) {
                  tableDetail[key] = {};
                  let attrConfig = attr.attrConfig.attributeList;
                  attrConfig.forEach(td => {
                    tableDetail[key][td.attributeUuid] = {};
                    if (!typeArr.includes(td.type)) {
                      tableDetail[key][td.attributeUuid] = {
                        type: td.type,
                        value: tableConfig[key][td.attributeUuid],
                        text: tableConfig[key][td.attributeUuid]
                      };
                    } else {
                      let dataList = [];
                      let text = '';
                      let textList = [];
                      if (td.attrConfig.dataSource == 'matrix') {
                        text = _this.getMatrixText(tableConfig[key][td.attributeUuid]);
                      } else {
                        td.attrConfig.dataList && (dataList = td.attrConfig.dataList);
                        if (Array.isArray(tableConfig[key][td.attributeUuid])) {
                          dataList.length > 0 && dataList.map((d) => {
                            if (tableConfig[key][td.attributeUuid].includes(d.value)) textList.push(d.text);
                          });
                          text = textList;
                        } else {
                          dataList.length > 0 && dataList.map((d) => {
                            if (d.value == tableConfig[key][td.attributeUuid]) text = d.text;
                          });
                        }
                      }
                      tableDetail[key][td.attributeUuid] = {
                        type: td.type,
                        value: tableConfig[key][td.attributeUuid],
                        text: text
                      };
                    }
                  });
                }
              });
              
              detailData[item.attributeUuid][attr.attributeUuid] = {
                type: attr.type,
                value: tableDetail
              };
              extendedData[item.attributeUuid][attr.attributeUuid] = tableConfig;
            } else if (!typeArr.includes(attr.type)) {
              detailData[item.attributeUuid][attr.attributeUuid] = {
                type: attr.type,
                value: attr.attrConfig.value,
                text: attr.attrConfig.value
              };
              extendedData[item.attributeUuid][attr.attributeUuid] = attr.attrConfig.value;
            } else if (typeArr.includes(attr.type)) {
              let dataList = [];
              let text = '';
              let textList = [];
              if (attr.attrConfig.dataSource == 'matrix') {
                text = _this.getMatrixText(attr.attrConfig.value);
              } else {
                attr.attrConfig.dataList && (dataList = attr.attrConfig.dataList);
                if (Array.isArray(attr.attrConfig.value)) {
                  dataList.length > 0 && dataList.map((d) => {
                    if (attr.attrConfig.value.includes(d.value)) textList.push(d.text);
                  });
                  text = textList;
                } else {
                  dataList.length > 0 && dataList.map((d) => {
                    if (d.value == attr.attrConfig.value) text = d.text;
                  });
                }
              }
              detailData[item.attributeUuid][attr.attributeUuid] = {
                type: attr.type,
                value: attr.attrConfig.value,
                text: text
              };
              extendedData[item.attributeUuid][attr.attributeUuid] = attr.attrConfig.value;
            }
          });
        }
      });
      this.$set(objJson, 'selectUuidList', selectUuidList);
      this.$set(objJson, 'extendedData', extendedData);
      this.$set(objJson, 'detailData', detailData);
      return objJson;
    },
    getFilterCondition(obj) { //过滤条件
      let param = {};
      let config = this.$utils.deepClone(obj);
      if (config.matrixType && config.matrixType == 'cmdbci') {
        let attrFilterList = config.attrFilterList ? config.attrFilterList.map(item => {
          return {
            attrId: item.attrId,
            expression: item.expression,
            valueList: item.valueList
          };
        }) : [];
        let relFilterList = config.relFilterList ? config.relFilterList.map(item => {
          return {
            relId: item.relId,
            expression: item.expression,
            valueList: item.valueList,
            direction: item.direction
          };
        }) : [];
        this.$set(param, 'attrFilterList', attrFilterList);
        this.$set(param, 'relFilterList', relFilterList);
      } else if (config.sourceColumnList && config.sourceColumnList.length > 0) {
        let sourceColumnList = config.sourceColumnList.filter(item => {
          return item.column && !this.$utils.isEmpty(item.valueList);
        });
        Object.assign(param, {
          sourceColumnList: sourceColumnList
        });
      } 
      return param;
    },
    updateFilterList(list) { //更新联动过滤
      let searchList = [];
      let filterList = list || [];
      if (filterList.length > 0) {
        filterList.forEach(item => {
          if (item.uuid && !this.$utils.isEmpty(item.valueList)) {
            searchList.push({
              uuid: item.uuid,
              valueList: item.valueList
            });
          }
        });
      }
      return searchList;
    }
  },
  computed: {

  },
  watch: {

  }
};
