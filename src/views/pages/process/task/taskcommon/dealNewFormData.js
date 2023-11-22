export default {
  methods: {
    initNewFormConfig(formSceneUuid, formConfig) {
      let data = this.$utils.deepClone(formConfig);
      let formItemList = [];
      let currentSceneUuid = formSceneUuid || formConfig.defaultSceneUuid || this.formConfig.uuid;
      if (currentSceneUuid && currentSceneUuid != this.formConfig.uuid) {
        let sceneConfig = this.formConfig.sceneList.find(item => item.uuid === currentSceneUuid);
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
      let errorMap = '';
      if (this.$refs.formSheet && this.$refs.formSheet instanceof Array) {
        errorMap = await this.$refs.formSheet[0].validData(validConifg); // 解决工单中心固定tab页面，当 ref 和 v-for 一起使用时，得到的 ref 将会是一个包含了对应数据源的这些子组件的数组
      } else {
        errorMap = await (this.$refs.formSheet && this.$refs.formSheet.validData(validConifg));
      }
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
