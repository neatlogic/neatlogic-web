export default {
  methods: {
    getAppCiAttrList(dataObj, formConfig, ciName) {
      let formDataList = [];
      for (let i = 0; i < formConfig.length; i++) {
        let item = formConfig[i];
        let data = dataObj[item];
        if (!data) {
          continue;
        }
        formDataList.push(this.handleFormData(item, data, ciName));
      }
      return formDataList;
    },
    handleFormData(item, data, ciName) {
      let formData = {};
      formData.name = item;
      formData.label = data.label;
      formData.type = data.type;
      //是否必填
      let validateList = data.isRequired && data.isRequired == 1 ? ['required'] : [];
      //控件类型
      if (data.type == 'select') {
        formData.url = '/api/rest/deploy/app/attr/search';
        formData.params = {attrName: item, ciName: ciName};
        formData.textName = 'name';
        formData.valueName = 'id';
        formData.transfer = true;
        formData.search = true;
        if (data.isMultiple) {
          formData.multiple = data.isMultiple;
        } else {
          formData.multiple = false;
        }
      } else if (data.type == 'timerange') {
        formData.transfer = true;
        formData.format = 'HH:mm:ss';
      } else if (data.type == 'datetime') {
        formData.transfer = true;
        formData.format = data.format;
      } else if (data.type == 'datetimerange') {
        formData.transfer = true;
        formData.format = data.format;
        formData.type = data.formatType;
      } else if (data.type == 'date') {
        formData.transfer = true;
        formData.format = 'yyyy-MM-dd';
      } else if (data.type == 'time') {
        formData.transfer = true;
        formData.format = 'HH:mm:ss';
      } else if (data.type == 'text') {
        if (item == 'description') {
          formData.type = 'textarea';
          formData.maxlength = 500;
        } else if (item == 'name') {
          validateList.push('name-special');
          formData.maxlength = 50;
        } else if (item == 'abbrName') {
          validateList.push('key-special');
          formData.maxlength = 50;
        } else if (item == 'ip') {
          validateList.push('ip');
        } else if (item == 'port') {
          validateList.push('port');
        }
      }
      formData.validateList = validateList;
      return formData;
    }
  }
};
  
