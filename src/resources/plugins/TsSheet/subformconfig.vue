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
      formDataQueue: [], //表单队列
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
      let formConfig = this.$refs.sheet.getFormConfig();
      this.$set(this.formDataQueue[this.formDataQueue.length - 1], 'formConfig', formConfig);
      this.isFormLoaded = false;
      this.currentFormUuid = this.currentFormItem.uuid;
      //保存子组件导航
      this.formDataQueue.push({
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
      if (index && index != this.formDataQueue.length - 2) {
        return;
      }
      this.errorData = this.$refs.sheet.validConfig();
      if (!this.$utils.isEmpty(this.errorData)) {
        return;
      }
      let formConfig = this.$refs.sheet.getFormConfig();
      this.isFormLoaded = false;
      this.formDataQueue.pop();
      this.currentFormData = this.formDataQueue[this.formDataQueue.length - 1];
      if (this.currentFormData.formConfig && this.currentFormData.formConfig.tableList) {
        this.currentFormData.formConfig.tableList.forEach(t => {
          if (t.component) {
            if (t.component.uuid === this.currentFormUuid) {
              this.$set(t.component, 'formData', {});
              this.$set(t.component.formData, 'formConfig', formConfig);
            } else if (t.component.handler === 'formtab' || t.component.handler === 'formcollapse') {
              t.component.component.forEach(s => {
                if (s.uuid === this.currentFormUuid) {
                  this.$set(s, 'formData', {});
                  this.$set(s.formData, 'formConfig', formConfig);
                }
              });
            }
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
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
