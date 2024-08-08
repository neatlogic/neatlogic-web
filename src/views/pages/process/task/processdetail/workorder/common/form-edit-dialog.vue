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
            :isClearSpecifiedAttr="true"
            :isNeedValid="false"
            @emit="formSheetEmitData"
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
      formConfig: {},
      defaultPriorityUuid: '',
      priorityList: [],
      priorityUuid: ''
    };
  },
  beforeCreate() {},
  created() {
    this.getPriority();
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
      if (this.processTaskConfig) {
        this.defaultPriorityUuid = this.$utils.deepClone(this.processTaskConfig.defaultPriorityUuid);
        if (this.processTaskConfig.formConfig) {
          let formConfig = this.$utils.deepClone(this.processTaskConfig.formConfig) || {};
          //清除组件只读属性
          formConfig.readOnly = false;
          formConfig.reaction = {};
          this.formConfig = formConfig;
        }
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
      if (this.priorityUuid) {
        data.priorityUuid = this.priorityUuid;
      }
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
    },
    getPriority() {
      //获取优先级
      let data = {
        needPage: false,
        channelUuid: this.processTaskConfig.channelUuid
      };
      this.$api.process.priority.search(data).then(res => {
        if (res.Status == 'OK') {
          this.priorityList = res.Return.tbodyList;
        }
      });
    },
    formSheetEmitData(data) {
      let messageConfig = {
        content: '',
        duration: 8,
        top: 50
      };
      if (!this.$utils.isEmpty(data)) {
        //表单联动优先级
        if (!this.$utils.isEmpty(this.priorityList) && !this.$utils.isEmpty(data.changePriority)) {
          let list = [];
          this.priorityList.forEach(item => {
            if (typeof data.changePriority === 'string') {
              if (data.changePriority.includes(item.name)) {
                list.push(item);
              }
            } else if (Array.isArray(data.changePriority)) {
              let changePriority = [];
              data.changePriority.forEach(c => {
                if (typeof c === 'string') {
                  changePriority.push(c);
                } else if (typeof c === 'object' && !this.$utils.isEmpty(c.value)) {
                  changePriority.push(c.value);
                }
              });
              if (changePriority.includes(item.name)) {
                list.push(item);
              }
            } else if (typeof data.changePriority === 'object') {
              if (!this.$utils.isEmpty(data.changePriority.value) && data.changePriority.value.includes(item.name)) {
                list.push(item);
              }
            }
          });
          if (list.length === 1) {
            this.priorityUuid = list[0].uuid;
          } else if (list.length > 1) {
            messageConfig.content = this.$t('term.process.formpriorityrule');
            this.$Message.error(messageConfig);
          } else if (list.length == 0) {
            //优先级不存在时提示
            this.priorityUuid = this.processTaskConfig.defaultPriorityUuid;
          }
        }
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
