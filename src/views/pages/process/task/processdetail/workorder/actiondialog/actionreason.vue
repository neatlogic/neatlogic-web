<template>
  <div>
    <TsDialog
      :title="title"
      type="modal"
      :isShow.sync="isShowModal"
      :okBtnDisable="okBtnDisable"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TsForm
            ref="formConfig"
            :itemList="formList"
            labelPosition="top"
          ></TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    processTaskId: Number, //工单id
    processTaskStepId: Number, //步骤id
    actionList: Array,
    isShow: {type: Boolean, default: false},
    taskActionType: String
  },
  data() {
    return {
      isShowModal: false,
      formList: [
        {
          type: 'ckeditor',
          name: 'content',
          value: '',
          width: '95%',
          label: this.$t('page.reason'),
          validateList: ['required']
        }
      ],
      okBtnDisable: false
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
    okDialog() {
      let formConfig = this.$refs.formConfig;
      if (formConfig.valid()) {
        this.okBtnDisable = true;
        let data = {
          processTaskId: this.processTaskId,
          content: formConfig.getFormValue().content
        };
        this[this.taskActionType](data);
      }
    },
    closeDialog() {
      this.$emit('update:isShow', false);
    },
    toTask(processTaskId, processTaskStepId) {
      //刷新
      this.$router.push({
        path: '/task-detail',
        query: {
          processTaskId: processTaskId,
          processTaskStepId: processTaskStepId,
          type: Date.now()
        }
      });
    },
    abortprocessTask(data) { //取消工单
      this.$api.process.processtask.cancelTaskDetail(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.toTask(this.processTaskId);
        }
      }).finally(() => {
        this.okBtnDisable = false;
      });
    },
    recoverprocessTask(data) { //恢复工单
      this.$api.process.processtask.recoverTaskDetail(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.toTask(this.processTaskId, this.processTaskStepId);
        }
      }).finally(() => {
        this.okBtnDisable = false;
      });
    },
    pause(data) { //暂停步骤
      data.processTaskStepId = this.processTaskStepId;
      this.$api.process.processtask.pauseTaskStep(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.toTask(this.processTaskId, this.processTaskStepId);
        }
      }).finally(() => {
        this.okBtnDisable = false;
      });
    },
    recover(data) { //恢复步骤
      data.processTaskStepId = this.processTaskStepId;
      this.$api.process.processtask.recoverTaskStep(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.toTask(this.processTaskId, this.processTaskStepId);
        }
      }).finally(() => {
        this.okBtnDisable = false;
      });
    }
  },
  filter: {},
  computed: {
    title() {
      let text = this.$t('page.reason');
      if (this.actionList && this.actionList.length > 0) {
        let findItem = this.actionList.find(item => item.value === this.taskActionType);
        if (findItem) {
          text = findItem.text;
        }
      }
      return text;
    }
  },
  watch: {
    isShow(val) {
      this.isShowModal = val;
    }
  }
};
</script>
<style lang="less">
</style>
