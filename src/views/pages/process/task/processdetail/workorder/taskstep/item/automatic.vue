<template>
  <div class="automatic-audit" :class="((item.processTaskStepData && !$utils.isEmpty(item.processTaskStepData.requestAudit)) || !$utils.isEmpty(item.commentList)) ? 'padding' : ''">
    <StepLogCommon
      v-if="item && !$utils.isEmpty(item.commentList)"
      :item="item"
      :isShowBorder="false"
      class="pb-nm"
    ></StepLogCommon>
    <div v-if="item.processTaskStepData && !$utils.isEmpty(item.processTaskStepData.requestAudit)" class="request-audit">
      <div v-if="item.processTaskStepData.isStepUser == 1">
        <div class="pb-sm">
          <span class="pr-nm">{{ $t('term.process.callrecord') }}</span>
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
        <div v-if="item.processTaskStepData.isStepUser == 1" class="pb-sm">
          <span class="pr-nm">{{ $t('term.process.callbackrecord') }}</span>
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
    AutoDetail: () => import('../../taskdetail-auto.vue'),
    CommonStatus: () => import('@/resources/components/Status/CommonStatus.vue'),
    StepLogCommon: () => import('./step-log-common')

  },
  filters: {},
  props: {
    item: Object
  },
  data() {
    return {
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
