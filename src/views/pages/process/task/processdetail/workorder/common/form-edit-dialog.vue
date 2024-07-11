<template>
  <div>
    <TsDialog
      :title="$t('dialog.title.edittarget',{'target':$t('page.form')})"
      type="slider"
      width="large"
      :isShow="true"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TsSheet
            ref="formSheet"
            mode="read"
            :value="formConfig"
            :data="processTaskConfig.formAttributeDataMap"
          ></TsSheet>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsSheet: () => import('@/resources/plugins/TsSheet/TsSheet.vue')
  },
  props: {
    processTaskConfig: Object
  },
  data() {
    return {
      formConfig: {}
    };
  },
  beforeCreate() {},
  created() {
    this.initConfig();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    initConfig() {
      if (this.processTaskConfig && this.processTaskConfig.formConfig) {
        let formConfig = this.$utils.deepClone(this.processTaskConfig.formConfig) || {};
        //清除组件只读属性
        const attrList = ['isMask', 'isReadOnly', 'isDisabled', 'isHide', 'mask', 'hide', 'disabled', 'readonly', 'disable'];
        formConfig.readOnly = false;
        formConfig.reaction = {};
        formConfig.tableList.forEach(item => {
          if (item.component) {
            if (item.component.config) {
              Object.keys(item.component.config).forEach(key => {
                if (attrList.indexOf(key) > -1) {
                  item.component.config[key] = false;
                }
              });
            }
            if (!this.$utils.isEmpty(item.component.reaction)) {
              Object.keys(item.component.reaction).forEach(key => {
                if (attrList.indexOf(key) > -1) {
                  item.component.reaction[key] = {};
                }
              });
            }
          }
        });
        this.formConfig = formConfig;
      }
    },
    async okDialog() {
      let errorMap = null;
      if (this.$refs.formSheet) {
        errorMap = await this.$refs.formSheet.validData();
      }
      if (!this.$utils.isEmpty(errorMap)) {
        return;
      }
      let data = {
        processTaskId: this.processTaskConfig.id,
        formAttributeDataList: this.$refs.formSheet.getFormData(),
        formExtendAttributeDataList: this.$refs.formSheet.getFormExtendData()
      };
      this.$api.process.processtask.updateProcessForm(data).then(res => {
        if (res.Status === 'OK') {
          //刷新页面
          this.$skipHistory();
          this.$router.push({
            path: '/task-detail',
            query: {
              processTaskId: this.processTaskConfig.id,
              type: Date.now()
            }
          });
        }
      });
    },
    closeDialog() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
