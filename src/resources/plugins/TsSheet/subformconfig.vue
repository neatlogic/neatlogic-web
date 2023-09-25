<script>
export default {
  name: '',
  components: {
  },
  props: {},
  data() {
    return {
      pathList: [],
      pathUuidList: [],
      isSubForm: false,
      subFormData: { 
        pathUuidList: [],
        formConfig: {}
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    editSubForm() {
      //校验成功才能继续编辑表单子组件
      this.errorData = this.$refs.sheet.validConfig();
      if (!this.$utils.isEmpty(this.errorData)) {
        return;
      }
      this.isFormLoaded = false;
      //保存子组件导航
      if (!this.pathUuidList || !this.pathUuidList.includes(this.currentFormItem.uuid)) {
        this.pathUuidList.push(this.currentFormItem.uuid);
        this.pathList.push(this.currentFormItem);
      }
      if (!this.currentFormItem.formData) {
        this.$set(this.currentFormItem, 'formData', {
          pathUuidList: this.pathUuidList,
          formConfig: {}
        });
      }
      this.subFormData = this.currentFormItem.formData;
      this.currentFormItem = null;
      this.isSubForm = true;
      this.$nextTick(() => {
        this.isFormLoaded = true;
      });
    },
    clickNav(item, index) {
      this.errorData = this.$refs.sheet.validConfig();
      if (!this.$utils.isEmpty(this.errorData)) {
        return;
      }
      this.isFormLoaded = false;
      if (item) {
        if (index < this.pathList.length - 1) {
          this.subFormData = this.pathList[index].formData;
          this.pathList = this.pathList.slice(0, index + 1);
          this.pathUuidList = this.pathUuidList.slice(0, index + 1);
        }
      } else {
        this.pathList = [];
        this.pathUuidList = [];
        this.isSubForm = false;
      }
      this.currentFormItem = null;
      this.clearSelectedComponent(this.formData.formConfig.tableList);
      this.$nextTick(() => {
        this.isFormLoaded = true;
      });
    },
    clearSelectedComponent(tableList) {
      tableList.forEach(item => {
        if (item._isHandler) {
          this.$delete(item, '_isHandler');
        }
        if (item._selected) {
          this.$delete(item, '_selected');
        }
        if (item.component && item.component.formData) {
          this.clearSelectedComponent(item.component.formData.formConfig.tableList);
        }
      });
    },
    updateFormData(tableList, pathUuidList) { 
      tableList.forEach(item => {
        if (item.component && item.component.uuid && pathUuidList.includes(item.component.uuid)) {
          if (pathUuidList.length > 1) {
            pathUuidList.splice(0, 1);
            item.component.formData && this.updateFormData(item.component.formData.formConfig.tableList, pathUuidList);
          } else {
            //保存当前子表单数据
            let formConfig = this.$refs.sheet.getFormConfig();
            formConfig.tableList.forEach(d => {
              if (d._selected) {
                this.$delete(d, '_selected');
              }
            });
            let formData = {
              formConfig: formConfig,
              pathUuidList: this.pathUuidList
            };
            this.$set(item.component, 'formData', formData);
          }
        }
      });
    },
    backPre() {
      this.isSubForm = false;
      this.isFormLoaded = false;
      this.updateFormData(this.formData.formConfig.tableList, this.subFormData.pathUuidList);
      // if (this.pathUuidList.length > 0) {
      // this.subFormData = this.formDataList[this.pathUuidList.length - 1].formData;
      // this.pathUuidList.splice(this.pathUuidList.length - 1, 1);
      // this.formDataList.splice(this.formDataList.length - 1, 1);
      // this.isSubForm = true;
      // }
      this.currentFormItem = null;
      this.$nextTick(() => {
        this.isFormLoaded = true;
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
