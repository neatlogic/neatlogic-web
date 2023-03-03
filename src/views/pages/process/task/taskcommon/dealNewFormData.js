export default {
  methods: {
    initNewFormConfig(formSceneUuid, formConfig) {
      let data = this.$utils.deepClone(formConfig);
      let formItemList = [];
      if (formSceneUuid && formSceneUuid != this.formConfig.uuid) {
        let sceneConfig = this.formConfig.sceneList.find(item => item.uuid === formSceneUuid);
        if (sceneConfig) {
          if (formConfig.tableList) {
            formConfig.tableList.forEach(item => {
              if (item.component) {
                formItemList.push(item.component);
              }
            });
          }
          sceneConfig.tableList.forEach(item => {
            if (item.component && item.component.inherit) {
              let component = formItemList.find(c => c.uuid === item.component.uuid);
              if (component) {
                this.$set(item, 'component', component);
              }
            }
          });
          this.$set(sceneConfig, 'formWidth', formConfig.formWidth);
          data = sceneConfig;
        }
      }
      return data;
    },
    async formValid(validConifg) {
      let errorMap = await this.$refs.formSheet.validData(validConifg);
      let isValid = true;
      if (!this.$utils.isEmpty(errorMap)) {
        isValid = false;
      }
      return isValid;
    }
  },
  computed: {
    
  }
};
