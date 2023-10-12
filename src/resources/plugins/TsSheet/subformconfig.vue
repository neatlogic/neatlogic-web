<script>
export default {
  name: '',
  components: {
  },
  props: {},
  data() {
    return {
      currentFormData: {
        formConfig: {}
      },
      pathList: [], //表单列队
      currentFormUuid: null
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
      this.currentFormUuid = this.currentFormItem.uuid;
      //保存子组件导航
      this.pathList.push({
        ...this.currentFormItem.formData,
        label: this.currentFormItem.label,
        uuid: this.currentFormItem.uuid
      });
      if (!this.currentFormItem.formData) {
        this.$set(this.currentFormData, 'formConfig', {});
      } else {
        this.currentFormData = this.currentFormItem.formData;
      }
      this.formData = this.currentFormData;

      this.currentFormItem = null;
      this.$nextTick(() => {
        this.isFormLoaded = true;
      });
    },
    backPreFormData(item, index) {
      if (index && index != this.pathList.length - 2) {
        return;
      }
      this.errorData = this.$refs.sheet.validConfig();
      if (!this.$utils.isEmpty(this.errorData)) {
        return;
      }
      let formConfig = this.$refs.sheet.getFormConfig();
      this.isFormLoaded = false;
      this.pathList.pop();
      this.currentFormData = this.pathList[this.pathList.length - 1];
      if (this.currentFormData.formConfig.tableList) {
        this.currentFormData.formConfig.tableList.forEach(t => {
          if (t.component && t.component.uuid === this.currentFormUuid) {
            this.$set(t.component, 'formData', {});
            this.$set(t.component.formData, 'formConfig', formConfig);
            // this.$set(t.component.formData, 'uuid', item.uuid);
          }
        });
      }
      this.formData = this.currentFormData;
      if (item.uuid) {
        this.currentFormUuid = item.uuid;
      }
      this.clearSelectedComponent(this.formData.formConfig.tableList);
      this.$nextTick(() => {
        this.isFormLoaded = true;
        this.currentFormItem = null;
      });
    },
    clearSelectedComponent(tableList) {
      tableList && tableList.forEach(item => {
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
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
