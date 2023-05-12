<template>
  <div class="schedule-add">
    <TsContain>
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>{{ $t('dialog.title.addtarget', {target: $t('term.autoexec.timingjob')}) }}</template>
      <template v-slot:topRight>
        <div class="action-group">
          <span v-if="current == 0" class="action-item">
            <Button type="primary" ghost @click="next(current+1)">{{ $t('page.thenextstep') }}</Button>
          </span>
          <template v-if="current > 0">
            <span class="action-item">
              <Button
                type="primary"
                class="mr-md"
                ghost
                @click="next(current -= 1)"
              >{{ $t('page.previousstep') }}</Button>
            </span>
            <span class="action-item">
              <Button type="primary" @click="saveTimeJob()">{{ $t('page.save') }}</Button>
            </span>
          </template>
        </div>
      </template>
      <template v-slot:content>
        <div class="job-content">
          <div class="step">
            <Steps :current="current">
              <Step
                v-for="(litem,lindex) in stepList"
                :key="lindex"
                :title="litem"
                @click.native="next(lindex)"
              >
              </Step>
            </Steps>
          </div>
          <div class="content">
            <div v-show="current===0" class="base-content pb-nm">
              <JobBaseInfo id="jobBaseinfo" ref="jobBaseinfo"></JobBaseInfo>
            </div>
            <div v-show="current===1" class="padding">
              <JobParams ref="jobParams" :baseParams="baseParams"></JobParams>
            </div>
          </div>
        </div>
      </template>
    </TsContain>
    <!--校验 -->
    <PublishingValid v-model="isShowValidDialog" :validList="validList" @jumpToItem="jumpToItem"></PublishingValid>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    JobBaseInfo: resolve => require(['./components/job-base-info.vue'], resolve),
    JobParams: resolve => require(['./components/job-params.vue'], resolve),
    PublishingValid: resolve => require(['@/views/pages/deploy/job/publishing/publishing-valid'], resolve)
  },
  props: {},
  data() {
    return {
      current: 0,
      stepList: [this.$t('page.basicinfo'), this.$t('term.autoexec.jobparam')],
      baseParams: {},
      isShowValidDialog: false,
      validList: []
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
    next(current) {
      if (this.$refs.jobBaseinfo && !this.$refs.jobBaseinfo.valid()) {
        return;
      }
      this.baseParams = this.$refs.jobBaseinfo.saveBaseData();
      this.current = current;
    },
    getScheduleData() {
      let data = {
        config: {}
      };
      if (this.$refs.jobBaseinfo) {
        Object.assign(data, this.$refs.jobBaseinfo.saveBaseData());
      }
      if (this.$refs.jobParams) {
        this.$set(data, 'config', this.$refs.jobParams.saveJobData());
      }
      return data;
    },
    valid() {
      let isValid = true;
      this.validList = [];
      if (this.$refs.jobBaseinfo && !this.$refs.jobBaseinfo.valid()) {
        this.validList.push({
          text: this.$t('term.deploy.basicinfonotwaritecompletevalid'),
          type: 'error',
          id: '#jobBaseinfo',
          current: 'basicInfo'
        });
        isValid = false;
      }
      if (this.$refs.jobParams && this.$refs.jobParams.valid().length > 0) {
        isValid = false;
        let jobParamsValidList = this.$refs.jobParams.valid();
        this.validList.push(...jobParamsValidList);
      }
      return isValid;
    },
    saveTimeJob() {
      if (!this.valid()) {
        this.isShowValidDialog = true;
        return false;
      }
      let data = this.getScheduleData();
      this.$api.deploy.schedule.saveSchedule(data).then(res => {
        if (res.Status == 'OK') {
          this.$skipHistory();
          this.$router.push({
            path: '/schedule-job-edit',
            query: {
              id: res.Return.id
            }
          });
        }
      });
    },
    jumpToItem(obj) { //定位参数，校验定位
      this.current = obj.current == 'basicInfo' ? 0 : 1;
      this.$utils.jumpTo(obj.id);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.schedule-add {
  position: relative;
}
.job-content {
  .step {
    width: 50%;
    margin: 0 auto;
    padding: 16px 0;
  }
  .content {
    height: calc(100vh - 174px);
    overflow-y: auto;
  }
  .base-content {
    width: 60%;
    margin: 0 auto;
  }
}
</style>
