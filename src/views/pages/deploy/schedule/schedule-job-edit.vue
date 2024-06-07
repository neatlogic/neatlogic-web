<template>
  <div class="schedule-edit">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain>
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>{{ $t('dialog.title.edittarget', {target: $t('term.autoexec.timingjob')}) }}</template>
      <template v-slot:topRight>
        <Button v-if="initData.editable" type="primary" @click="saveTimeJob()">{{ $t('page.save') }}</Button>
      </template>
      <template v-slot:content>
        <div v-if="!loadingShow">
          <Tabs
            v-model="current"
            class="block-tabs2"
            name="content"
            :animated="false"
            @on-click="changeTabValue"
          >
            <TabPane
              :label="$t('page.basicinfo')"
              name="basicInfo"
              tab="content"
            >
              <div class="time-job-detail-form pl-nm pb-nm">
                <JobBaseInfo
                  id="jobBaseinfo"
                  ref="jobBaseinfo"
                  :labelWidth="100"
                  labelPosition="left"
                  :defaultParams="baseParams"
                  :disabled="!initData.editable"
                ></JobBaseInfo>
              </div>
            </TabPane>
            <TabPane
              :label="$t('term.autoexec.jobparam')"
              name="jobParam"
              tab="content"
            >
              <div class="runner-detail">
                <JobParams ref="jobParams" :baseParams="initData" :disabled="!initData.editable"></JobParams>
              </div>
            </TabPane>
          </Tabs>
        </div>
      </template>
    </TsContain>
    <!--校验 -->
    <PublishingValid v-model="isShowValidDialog" :validList="validList" @jumpToItem="jumpToItem"></PublishingValid>
  </div>
</template>
<script>
export default {
  name: 'ScheduleJobEdit',
  components: {
    JobBaseInfo: () => import('./components/job-base-info.vue'),
    JobParams: () => import('./components/job-params.vue'),
    PublishingValid: () => import('@/views/pages/deploy/job/publishing/publishing-valid')
  },
  props: {},
  data() {
    return {
      loadingShow: true,
      id: null,
      current: 'basicInfo',
      initData: {},
      baseParams: {
        name: null,
        isActive: null,
        cron: null,
        beginTime: null,
        type: null,
        endTime: null
      },
      isShowValidDialog: false,
      validList: []
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.query && this.$route.query.id) {
      this.id = parseInt(this.$route.query.id);
      this.init();
    }
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
    beforeLeaveCompare(oldData) {
      return this.$utils.isSame(oldData, this.getSaveData());
    },
    async beforeLeave() {
      return await this.saveTimeJob();
    },
    async init() {
      await this.getScheduleData();
      this.$addWatchData({id: this.id, config: this.initData.config, ...this.baseParams });
    },
    getScheduleData() {
      return this.$api.deploy.schedule.getSchedule({id: this.id}).then(res => {
        if (res.Status == 'OK') {
          this.initData = res.Return || {};
          Object.keys(this.initData).forEach(key => {
            if (this.baseParams.hasOwnProperty(key)) {
              this.baseParams[key] = this.initData[key];
            }
          });
          if (this.initData.type == 'general') {
            this.$set(this.baseParams, 'appSystemId', this.initData.appSystemId);
            this.$set(this.baseParams, 'appModuleId', this.initData.appModuleId);
          } else if (this.initData.type == 'pipeline') {
            this.$set(this.baseParams, 'pipelineType', this.initData.pipelineType);
            this.$set(this.baseParams, 'pipelineId', this.initData.pipelineId);
          }
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    getSaveData() {
      let data = {
        id: this.id,
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
    async saveTimeJob() {
      let isSuccess = true;
      if (!this.valid()) {
        this.isShowValidDialog = true;
        return false;
      }
      let data = this.getSaveData();
      let res = await this.$api.deploy.schedule.saveSchedule(data);
      if (res.Status == 'OK') {
        this.$Message.success(this.$t('message.savesuccess'));
        this.$addWatchData(data);
      } else {
        isSuccess = false;
      }
      return isSuccess;
    },
    changeTabValue() {

    },
    jumpToItem(obj) { //定位参数，校验定位
      this.current = obj.current == 'basicInfo' ? 'basicInfo' : 'jobParam';
      this.$utils.jumpTo(obj.id);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.schedule-edit{
  position: relative;
}
</style>
