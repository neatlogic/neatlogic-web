export default {
  provide() {
    return {
      getFormDataForWatch: () => this.formDataForWatch,
      extraFormItemList: this.frozenExtraFormItemList,
      extendConfigList: this.frozenExtendConfigList,
      formItemList: this.frozenFormItemList,
      referenceFormItemList: this.frozenReferenceFormItemList,
      externalData: this.frozenExternalData,
      isClearSpecifiedAttr: this.isClearSpecifiedAttr,
      isClearEchoFailedDefaultValue: true,
      isCustomValue: true,
      showStatusIcon: false,
      readonly: this.readonly,
      disabled: this.disabled,
      mode: 'read'
    };
  },
  data() {
    return {
      reactionValuesMap: {}, // { extraUuid: { uuid: value } }
      clonedExtrasMap: {}
    };
  },
  methods: {
    reactionWatch() {
      this.reactionValuesMap = {};
      this.extraList.forEach(extra => {
        const deps = this.reactionDepsMap[extra.uuid] || [];
        this.$set(this.reactionValuesMap, extra.uuid, {});
        this.$set(this.clonedExtrasMap, extra.uuid, this.$utils.deepClone(extra));
        deps.forEach(uuid => {
          this.$set(this.reactionValuesMap[extra.uuid], uuid, this.formData[uuid]);
          this.$watch(
            () => this.formData[uuid],
            (newVal, oldVal) => {
              if (newVal !== oldVal) {
                this.$set(this.reactionValuesMap[extra.uuid], uuid, newVal);
              }
            }
          );
        });
      });
    },
    changeRow(rowData) {
      const { value, extraUuid = '', row = {} } = rowData || {};
      if (!this.$utils.isSame(value, row[extraUuid])) {
        if (!row.hasOwnProperty(extraUuid)) {
          this.$set(row, extraUuid, value); // 修复条件赋值不生效问题
        } else {
          row[extraUuid] = value;
        }
      }
    },
    getCurrentRowData(currentRowData) {
      const { reactionData = {}, rowData = {} } = currentRowData || {};
      this.$nextTick(() => {
        if (reactionData) {
          Object.assign(rowData, reactionData);
        }
      });
    }
  },
  computed: {
    getReactionData() {
      return (extra, row) => {
        if (!extra || !row) return {};
        const deps = this.reactionDepsMap[extra.uuid] || [];
        if (!deps.length) return {};
        const result = {};
        deps.forEach(uuid => {
          result[uuid] = this.formData.hasOwnProperty(uuid)
            ? this.formData[uuid]
            : row[uuid];
        });
        return result;
      };
    },
    getExpressionData() {
      return (extra) => {
        const { handler, config = {} } = extra || {};
        const { expression } = config || {};
        let resultData = {};
        if (handler === 'formexpression') {
          resultData = this.handleExpressionData({expression: expression, formData: this.formData});
        }
        return resultData;
      };
    },
    reactionDepsMap() {
      let map = {};
      this.extraList.forEach(extra => {
        if (extra?.uuid) {
          map[extra.uuid] = [];
        }
        const reactionValue = extra.reaction || {};
        for (const action in reactionValue) {
          const reaction = reactionValue[action];
          if (this.$utils.isEmpty(reaction)) continue;
          if (action !== 'filter') {
            let ruleList = [];
            if (Array.isArray(reaction)) {
              ruleList = reaction;
            } else {
              ruleList.push(reaction);
            }
            ruleList.forEach(item => {
              (item.conditionGroupList || []).forEach(group => {
                (group.conditionList || []).forEach(cond => {
                  const uuid = (cond.formItemUuid || '').split('#')[0];
                  if (uuid) {
                    map[extra.uuid].push(uuid);
                  }
                });
              });
              // 处理动态值
              if (item.type === 'dynamic') {
                const valueUuid = (item.value || '').split('#')[0];
                map[extra.uuid].push(valueUuid);
              }
            });
          } else {
            (reaction.ruleList || []).forEach(rule => {
              const uuid = (rule.formItemUuid || '').split('#')[0];
              if (uuid) {
                map[extra.uuid].push(uuid);
              }
            });
          }
        }
        // 处理下拉组件表格依赖
        if (extra?.config?.dataSource && extra?.config?.dataSource === 'formtableinputer' && extra.config.formtableinputerUuid) {
          map[extra.uuid].push(extra.config.formtableinputerUuid);
        }
        //内嵌表格
        const {dataConfig = []} = extra.config || {};
        if (dataConfig.length > 0) {
          dataConfig.forEach(d => {
            const innerReactionValue = d.reaction || {};
            for (const action in innerReactionValue) {
              const reactionRule = innerReactionValue[action];
              if (!reactionRule) continue;
              if (action !== 'filter') {
                let ruleList = [];
                if (Array.isArray(reactionRule)) {
                  ruleList = reactionRule;
                } else {
                  ruleList.push(reactionRule);
                }
                ruleList.forEach(item => {
                  (item.conditionGroupList || []).forEach(group => {
                    (group.conditionList || []).forEach(cond => {
                      const uuid = (cond.formItemUuid || '').split('#')[0];
                      if (uuid) {
                        map[extra.uuid].push(uuid);
                      }
                    });
                  });
                  // 处理动态值
                  if (item.type === 'dynamic') {
                    const valueUuid = (item.value || '').split('#')[0];
                    map[extra.uuid].push(valueUuid);
                  }
                });
              } else {
                (reactionRule.ruleList || []).forEach(rule => {
                  const uuid = (rule.formItemUuid || '').split('#')[0];
                  if (uuid) {
                    map[extra.uuid].push(uuid);
                  }
                });
              }
            }
          });
        }
      });
      return map;
    },
    frozenFormItemList() {
      return Object.freeze([...this.formItemList || []]);
    },
    frozenReferenceFormItemList() {
      return Object.freeze([...(this.referenceFormItemList || [])]);
    },
    frozenExtraFormItemList() {
      return Object.freeze([...this.$utils.deepClone(this.config.dataConfig) || []]);
    },
    frozenExtendConfigList() {
      return Object.freeze([...this.extendConfigList || []]);
    },
    frozenExternalData() {
      return Object.freeze({ ...this.externalData || {} });
    }
  }
};
