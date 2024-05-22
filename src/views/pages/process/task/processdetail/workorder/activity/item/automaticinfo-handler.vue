<template>
  <div v-if="config" class="flex-start align-start">
    <div class="left-label-text text-grey">
      {{ config.typeName }}
    </div>
    <div class="automatic-config">
      <div v-if="automaticConfig.requestAudit" class="pb-nm">
        <div class="automatic-title">
          <span class="pr-nm">{{ $t('term.process.callrecord') }}</span>
          <CommonStatus
            v-if="automaticConfig.requestAudit.status"
            :statusName="automaticConfig.requestAudit.status.text"
            :statusValue="automaticConfig.requestAudit.status.value"
            class="automatic-status"
          ></CommonStatus>
        </div>
        <AutoDetail :defaultStepData="automaticConfig.requestAudit" :isShowFailed="automaticConfig.requestAudit.status && automaticConfig.requestAudit.status.value == 'failed' ? true : false" type="requestAudit"></AutoDetail>
      </div>
      <div v-if="automaticConfig.callbackAudit">
        <div class="automatic-title">
          <span class="pr-nm">{{ $t('term.process.callbackrecord') }}</span>
          <CommonStatus
            v-if="automaticConfig.callbackAudit.status"
            :statusName="automaticConfig.callbackAudit.status.text"
            :statusValue="automaticConfig.callbackAudit.status.value"
            class="automatic-status"
          ></CommonStatus>
        </div>
        <AutoDetail :defaultStepData="automaticConfig.callbackAudit" :isShowFailed="automaticConfig.callbackAudit.status && automaticConfig.callbackAudit.status.value == 'failed' ? true : false" type="callbackAudit">></AutoDetail>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    AutoDetail: () => import('@/views/pages/process/task/processdetail/workorder/taskdetail-auto.vue'),
    CommonStatus: () => import('@/resources/components/Status/CommonStatus.vue')
  },
  props: {
    config: Object
  },
  data() {
    return {
      automaticConfig: {}
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init() {
      if (this.config && this.config.newContent) {
        this.automaticConfig = JSON.parse(this.config.newContent);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.automatic-config {
  flex: 1;
}
</style>
