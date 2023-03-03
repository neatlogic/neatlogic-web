<template>
  <div class="automatic-audit" :class="((item.processTaskStepData && !$utils.isEmpty(item.processTaskStepData.requestAudit)) || !$utils.isEmpty(item.commentList)) ? 'block-border radius-lg padding' : ''">
    <StepLogCommon
      v-if="item && !$utils.isEmpty(item.commentList)"
      :item="item"
      :isShowBorder="false"
      class="pb-nm"
    ></StepLogCommon>
    <div v-if="item.processTaskStepData && !$utils.isEmpty(item.processTaskStepData.requestAudit)" class="request-audit">
      <div v-if="item.processTaskStepData.isStepUser == 1">
        <div class="flex-between pb-sm">
          <span>调用记录</span>
          <CommonStatus
            v-if="item.processTaskStepData.requestAudit.status"
            :statusName="item.processTaskStepData.requestAudit.status.text"
            :statusValue="item.processTaskStepData.requestAudit.status.value"
          ></CommonStatus>
        </div>
      </div>
      <div>
        <AutoDetail
          :defaultStepData="item.processTaskStepData.requestAudit"
          :isStepUser="item.processTaskStepData.isStepUser"
          :isShowFailed="item.processTaskStepData.requestAudit.status.value=='failed'?true:false"
          type="requestAudit"
        ></AutoDetail>
      </div>
      <div v-if="item.processTaskStepData && !$utils.isEmpty(item.processTaskStepData.callbackAudit)" class="pt-nm">
        <div v-if="item.processTaskStepData.isStepUser == 1" class="flex-between pb-sm">
          <span>回调记录</span>
          <CommonStatus
            v-if="item.processTaskStepData.callbackAudit.status"
            :statusName="item.processTaskStepData.callbackAudit.status.text"
            :statusValue="item.processTaskStepData.callbackAudit.status.value"
          ></CommonStatus>
        </div>
        <div>
          <AutoDetail
            :defaultStepData="item.processTaskStepData.callbackAudit"
            :isStepUser="item.processTaskStepData.isStepUser"
            :isShowFailed="item.processTaskStepData.callbackAudit.status.value=='failed'?true:false"
            type="callbackAudit"
          ></AutoDetail>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    AutoDetail: resolve => require(['../../taskdetail-auto.vue'], resolve),
    CommonStatus: resolve => require(['@/resources/components/Status/CommonStatus.vue'], resolve),
    StepLogCommon: resolve => require(['./step-log-common'], resolve)

  },
  filters: {},
  props: {
    item: Object
  },
  data() {
    return {
      actionText: {
        // 动作文案
        start: '开始',
        accept: '',
        update: '修改',
        abortprocessTask: '取消',
        recoverprocessTask: '恢复',
        complete: '完成',
        retreat: '撤回',
        save: '暂存',
        transfer: '转交',
        comment: '回复',
        createsubtask: '创建子任务',
        back: '回退',
        pocesstaskview: '查看',
        urge: '催办',
        pause: '暂停',
        recover: '恢复工单步骤',
        tranferreport: '转报',
        copyprocesstask: '复制上报',
        redo: '评分之前回退',
        markrepeat: '标记重复事件',
        reapproval: '重审',
        createtask: '创建任务（新的子任务）',
        retreatcurrentstep: '撤回'
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
    getActionText(customButtonTextList, type) {
      let actionText = '';
      if (!this.$utils.isEmpty(customButtonTextList)) {
        let item = customButtonTextList.find(item => item.name == type);
        if (!this.$utils.isEmpty(item)) {
          actionText = item.value || item.text;
        }
      }
      return actionText || this.actionText[type];
    }
  },
  computed: {},
  watch: {}

};

</script>
<style lang='less' scoped>
.automatic-audit {
  .avatar-box {
    display: flex;
    flex-direction: column;
    .avatar {
      margin-bottom: 4px;
    }
  }
}
</style>
