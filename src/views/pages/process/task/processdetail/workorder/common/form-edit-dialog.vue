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
            :isClearSpecificAttr="true"
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
        formConfig.readOnly = false;
        formConfig.reaction = {};
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
