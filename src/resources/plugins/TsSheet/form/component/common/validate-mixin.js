export default {
  methods: {
    //针对所有组建的基本校验逻辑
    validDataForAllItem() {
      const errorList = [];
      if (this.config.isRequired) {
        if (this.value == null || typeof this.value === 'undefined' || this.$utils.isEmpty(this.value)) {
          errorList.push({uuid: this.formItem.uuid, error: this.formItem.label + '的值不能为空'});
        }
      }
      return errorList;
    },
    //针对select,radio,checkbox的配置校验逻辑
    validConfigForListItem() {
      const errorList = [];
      let hasNull = false; //是否含有空的静态数据
      if (this.config.dataSource === 'static') {
        //验证是否有数据
        if ((!this.config.dataList || this.config.dataList.filter(d => d.value != '').length === 0)) {
          errorList.push({ field: 'dataList', error: '请至少添加一个静态数据源下拉选项' });
        }
        //验证数据是否有重复
        if (this.config.dataList && this.config.dataList.length > 0) {
          const validateRepeatData = (_dataList) => {
            for (let i = 0; i < _dataList.length; i++) {
              const d = _dataList[i];
              if (d.children && d.children.length > 0) {
                return validateRepeatData(d.children);
              }
              if (_dataList.find(dd => dd != d && dd.value == d.value)) {
                return false;
              }
            }
            return true;
          };
          if (!validateRepeatData(this.config.dataList)) {
            errorList.push({ field: 'dataList', error: '静态数据选项存在重复数据，请重新编辑' });
          }

          this.config.dataList.forEach((item, a) => {
            if (item.value == '' && !hasNull) {
              hasNull = true;
              errorList.push({ field: 'dataList', error: '静态数据源：值不可以为空' });
            }
            if (item.text == '' && !hasNull) {
              hasNull = true;
              errorList.push({ field: 'dataList', error: '静态数据源：显示值不可以为空' });
            }
          });
        }
      } else if (this.config.dataSource === 'matrix') {
        if (!this.config.matrixUuid) {
          errorList.push({field: 'matrixUuid', error: '请选择矩阵'});
        }
        if (!this.config.mapping.value) {
          errorList.push({field: 'mapping', error: '请选择值字段映射'});
        }
        if (!this.config.mapping.text) {
          errorList.push({field: 'mapping', error: '请选择显示文字字段映射'});
        }
        if (this.config.sourceColumnList && this.config.sourceColumnList.length > 0) {
          for (let i = 0; i < this.config.sourceColumnList.length; i++) {
            if (this.$utils.isEmpty(this.config.sourceColumnList[i].column) || this.$utils.isEmpty(this.config.sourceColumnList[i].expression) || (this.config.sourceColumnList[i].expression != 'is-null' && this.config.sourceColumnList[i].expression != 'is-not-null' && this.$utils.isEmpty(this.config.sourceColumnList[i].valueList))) {
              errorList.push({ field: 'sourceColumnList', error: '请填写完整过滤条件' });
              break;
            }
          }
        }
      }
      return errorList;
    }
  }
};
