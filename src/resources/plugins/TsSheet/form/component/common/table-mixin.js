export default {
  methods: {
    validTableTbodyListData({ pageSize, readonly = false, disabled = false, theadList = [], tbodyList = [], validateMap = {}, formData = {}, formItem = {}, executeReaction } = {}) { // 验证表格数据（数据校验）
      let errorList = [];
      if (readonly || disabled || this.$utils.isEmpty(tbodyList)) {
        return errorList;
      }
      tbodyList.forEach((row, index) => {
        const pageCount = Math.ceil((index + 1) / pageSize);
        const mergedFormData = Object.assign({}, formData || {}, row);
        theadList.forEach(th => {
          errorList = this._handleTbodyValidErrorInfoList({row, mergedFormData, pageCount, columnAttrConfig: th, errorList, formItem: formItem, validateMap: validateMap, executeReaction: executeReaction});
        });
        //内嵌table
        Object.keys(row).forEach(key => {
          const findTheadItem = theadList.find(th => th.key === key);
          if (findTheadItem?.config && !this.$utils.isEmpty(findTheadItem.config.dataConfig)) {
            if (!this.$utils.isEmpty(row[key])) {
              for (let i = 0; i < row[key].length; i++) {
                let item = row[key][i];
                findTheadItem.config.dataConfig.forEach(dc => {
                  const innerTableData = Object.assign({}, mergedFormData, item);
                  const innerTableItem = {
                    key: dc.uuid,
                    title: `${findTheadItem.title}.${dc.label}`,
                    reaction: dc.reaction
                  };
                  errorList = this._handleTbodyValidErrorInfoList({row: item, mergedFormData: innerTableData, pageCount: pageCount, columnAttrConfig: innerTableItem, errorList: errorList, formItem: formItem, validateMap: validateMap, executeReaction: executeReaction});
                });
              }
            }
          }
        });
      });
      return errorList;
    },
    validTableAttrUnique({ pageSize, config = {}, formItem = {}, tbodyList = [] } = {}) {
      // 校验属性是否唯一
      let errorList = [];
      const { uniqueRuleConfig = [], dataConfig = [] } = config || {};
      const { label = '', uuid = '' } = formItem || {};
      if (uniqueRuleConfig.length == 0) {
        //如果存在设置唯一标识的字段则校验是否重复
        const uniqueRuleList = dataConfig.filter((v) => v.config && v.config['isUnique']);
        if (!this.$utils.isEmpty(uniqueRuleList)) {
          let existMap = {};
          tbodyList.forEach((row, index) => {
            const pageCount = Math.ceil((index + 1) / pageSize);
            if (!this.$utils.isEmpty(row)) {
              Object.keys(row).forEach((key) => {
                const findUnunique = uniqueRuleList.find(d => d.uuid === key);
                let value = row[key];
                if (!this.$utils.isEmpty(value)) {
                  if (Array.isArray(value)) {
                    value = this.$utils.mapArray(value, 'text').join('_');
                  } else if (typeof value === 'object') {
                    value = value['text'];
                  }
                  if (findUnunique) {
                    if (existMap[key] && existMap[key].includes(value)) {
                      let findItem = errorList.find(d => d.attrUuid === key);
                      if (findItem && !findItem.errorPageList.find(d => d === pageCount)) {
                        findItem.errorPageList.push(pageCount);
                        findItem.errorPageList = findItem.errorPageList.sort(this.$utils.sortNumber());
                        findItem.error = `${label}：第${findItem.errorPageList.join(',')}页【${findUnunique.label}】属性必须唯一`;
                      } else {
                        errorList.push({ uuid: uuid, attrUuid: key, errorPageList: [pageCount], error: `${label}：第${pageCount}页【${findUnunique.label}】属性必须唯一` });
                      }
                    } else {
                      existMap[key] = existMap[key] ? [...existMap[key], value] : [value];
                    }
                  }
                }
              });
            }
          });
        }
        return errorList;
      } else {
        //组合属性是否唯一
        let attrLabel = dataConfig.filter((v) => v['uuid'] && uniqueRuleConfig.includes(v['uuid']) && v.label).map((item) => item.label).join(',');
        let tempValue = '';
        let existList = [];
        tbodyList.forEach((row) => {
          const pageCount = Math.ceil((index + 1) / pageSize);
          if (!this.$utils.isEmpty(row)) {
            tempValue = '';
            Object.keys(row).forEach((key, index) => {
              if (uniqueRuleConfig.includes(key) && row[key]) {
                tempValue += `${JSON.stringify(row[key])}${index < uniqueRuleConfig.length - 1 ? '_' : ''}`;
              }
            });
            if (tempValue) {
              if (existList.includes(tempValue)) {
                let findItem = errorList.find(d => d.uuid === uniqueRuleConfig[0]);
                if (findItem && !findItem.errorPageList.find(d => d === pageCount)) {
                  findItem.errorPageList.push(pageCount);
                  findItem.errorPageList = findItem.errorPageList.sort(this.$utils.sortNumber());
                  findItem.error = `${label}：第${findItem.errorPageList.join(',')}页【${attrLabel}】属性必须唯一`;
                } else {
                  errorList.push({ uuid: uniqueRuleConfig[0], errorPageList: [pageCount], error: `${label}：第${pageCount}页【${attrLabel}】属性必须唯一` });
                }
              } else {
                existList.push(tempValue);
              }
            }
          }
        });
        return errorList;
      }
    },
    _handleTbodyValidErrorInfoList({row, mergedFormData, pageCount, columnAttrConfig = {}, errorList = [], formItem = {}, validateMap = {}, executeReaction}) { //获取校验错误列表
      const { title, key, reaction } = columnAttrConfig || {};
      const { key: formItemKey, label: formItemLabel } = formItem || {};
      const reactionValid = this._validReaction(reaction, mergedFormData, executeReaction);
      let isValid = true;
      let errorInfoList = errorList || [];
      if (!reactionValid.isDisable && validateMap && validateMap[key]) {
        const validateList = validateMap[key]?.validateList;
        if (!this.$utils.isEmpty(validateList)) {
          isValid = this.$utils.validParamValue(row[key], validateList);
        }
      }
      if (!isValid || (this.$utils.isEmpty(row[key]) && reactionValid.isRequired)) {
        let findItem = errorInfoList.find(d => d.attrUuid === key);
        if (!findItem) {
          errorInfoList.push({
            errorPageList: [pageCount],
            label: title,
            uuid: formItemKey,
            attrUuid: key,
            error: formItemLabel + '：第' + pageCount + '页' + this.$t('message.completerequired', {'target': '【' + title + '】'})
          });
        } else {
          if (!findItem.errorPageList.find(d => d === pageCount)) {
            findItem.errorPageList.push(pageCount);
            findItem.errorPageList = findItem.errorPageList.sort(this.$utils.sortNumber());
            findItem.error = formItemLabel + '：第' + findItem.errorPageList.join(',') + '页' + this.$t('message.completerequired', {'target': '【' + title + '】'});
          }
        }
      }
      return errorInfoList;
    },
    _validReaction(reaction, formData, executeReaction) {
      // 联动规则必填校验
      let reactionMap = {
        mask: false,
        hide: false,
        readonly: false,
        disable: false
      };
      let isRequired = false;
      let isDisable = false;
      if (!this.$utils.isEmpty(reaction)) {
        for (let key in reaction) {
          const reactionObj = reaction[key];
          if (!this.$utils.isEmpty(reactionObj)) {
            const result = typeof executeReaction == 'function' && executeReaction(reactionObj, formData, {}, reaction);
            if (reactionMap.hasOwnProperty(key)) {
              reactionMap[key] = result;
            }
            if (key === 'required') {
              isRequired = result;
            }
          }
        }
        // 当 mask、hide、readonly、disable 中任意一个为 true 时，设置 isDisable 为 true，isRequired 为 false
        for (let key in reactionMap) {
          if (reactionMap[key]) {
            isDisable = true;
            break;
          }
        }
      }
      // 当 isDisable 为 true 时，不用校验必填，设置 isRequired 为 false,
      if (isDisable) {
        isRequired = false;
      }
      return {
        isDisable: isDisable,
        isRequired: isRequired
      };
    }
  }
};
