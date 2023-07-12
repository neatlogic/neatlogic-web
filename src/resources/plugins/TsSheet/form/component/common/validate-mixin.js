import { $t } from '@/resources/init.js';
export default {
  methods: {
    //针对所有组建的基本校验逻辑
    validDataForAllItem() {
      const errorList = [];
      if (!this.config.isReadOnly && !this.config.isDisabled && this.config.isRequired) { //只读或者禁用不需要校验
        if (this.value == null || typeof this.value === 'undefined' || this.$utils.isEmpty(this.value)) {
          errorList.push({uuid: this.formItem.uuid, error: this.formItem.label + '：' + $t('form.validate.required', {'target': $t('page.value')})});
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
          errorList.push({ field: 'dataList', error: $t('form.validate.leastonetarget', {'target': $t('page.staticdatasource')}) });
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
            errorList.push({ field: 'dataList', error: $t('message.framework.staticrepeat') });
          }

          this.config.dataList.forEach((item, a) => {
            if (item.value == '' && !hasNull) {
              hasNull = true;
              errorList.push({ field: 'dataList', error: $t('page.staticdatasource') + '：' + $t('form.validate.required', {'target': $t('page.value')}) });
            }
            if (item.text == '' && !hasNull) {
              hasNull = true;
              errorList.push({ field: 'dataList', error: $t('page.staticdatasource') + '：' + $t('form.validate.required', {'target': $t('page.showvalue')}) });
            }
          });
        }
      } else if (this.config.dataSource === 'matrix') {
        if (!this.config.matrixUuid) {
          errorList.push({field: 'matrixUuid', error: $t('form.placeholder.pleaseselect', {'target': $t('page.matrix')})});
        }
        if (!this.config.mapping.value) {
          errorList.push({field: 'mapping', error: $t('form.placeholder.pleaseselect', {'target': $t('term.framework.valfieldmapping')})});
        }
        if (!this.config.mapping.text) {
          errorList.push({field: 'mapping', error: $t('form.placeholder.pleaseselect', {'target': $t('term.framework.showtextfieldmapping')})});
        }
        if (this.config.sourceColumnList && this.config.sourceColumnList.length > 0) {
          for (let i = 0; i < this.config.sourceColumnList.length; i++) {
            if (this.$utils.isEmpty(this.config.sourceColumnList[i].column) || this.$utils.isEmpty(this.config.sourceColumnList[i].expression) || (this.config.sourceColumnList[i].expression != 'is-null' && this.config.sourceColumnList[i].expression != 'is-not-null' && this.$utils.isEmpty(this.config.sourceColumnList[i].valueList))) {
              errorList.push({ field: 'sourceColumnList', error: $t('message.framework.plecompletecondition') });
              break;
            }
          }
        }
      }
      return errorList;
    }
  },
  computed: {
    readonlyTextHighlightClass() {
      // 只读模式下，文案是否需要高亮
      let className = '';
      if (this.readonlyTextIsHighlight) {
        className = 'text-warning';
      }
      return className;
    }
  }
};
