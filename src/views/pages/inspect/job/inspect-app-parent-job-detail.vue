<template>
  <div class="inspect-app-parent-detail">
    <TsContain>
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="text-action tsfont-left" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <div class="parent-title">
          <strong class="overflow" :title="parentJob.name">{{ parentJob.name }}</strong>
          <Divider v-if="parentJob.execUser || parentJob.status" type="vertical" class="parent-title-divider" />
          <UserCard v-if="parentJob.execUser" :uuid="parentJob.execUser"></UserCard>
          <Divider v-if="parentJob.execUser && parentJob.status" type="vertical" class="parent-title-divider" />
          <div v-if="parentJob.status">
            <Status :statusName="parentJob.statusName" :statusValue="parentJob.status"></Status>
          </div>
        </div>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <span v-if="detail.isCanCheck" class="action-item">
            <Button type="success" :loading="validLoading" @click="validJob">{{ $t('page.verify') }}</Button>
          </span>
          <span v-if="detail.isCanExecute" class="action-item">
            <Button type="primary" @click="openExecuteDialog">{{ $t('page.execute') }}</Button>
          </span>
          <span v-if="detail.isCanAbort" class="action-item">
            <Button type="warning" :loading="abortLoading" @click="abortJob">{{ $t('page.abort') }}</Button>
          </span>
          <span
            v-download="downloadConfig"
            v-download:prevent="!detail.reportReady || downloadLoading"
            class="action-item tsfont-download"
            :class="{'text-disabled': !detail.reportReady || downloadLoading}"
            :title="!detail.reportReady ? $t('term.inspect.reportnotready') : ''"
          >{{ $t('term.inspect.downloadreport') }}</span>
        </div>
      </template>
      <template v-slot:content>
        <Loading :loadingShow="loadingShow" type="fix"></Loading>
        <div class="summary-grid mb-nm">
          <div v-for="item in summaryList" :key="item.key" class="summary-item bg-op radius-lg padding">
            <div class="text-grey">{{ item.label }}</div>
            <div class="summary-value" :class="item.className">{{ item.value }}</div>
          </div>
        </div>
        <Row v-if="childJobList.length" :gutter="16" type="flex">
          <Col
            v-for="job in childJobList"
            :key="job.id"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
            class="mb-nm"
          >
            <div
              class="job-card bg-block block-border radius-lg padding cursor card-hover-shadow"
              :class="job.status"
              @click="toChildJob(job.id)"
            >
              <div class="job-card-title">
                <strong class="overflow" :title="getJobName(job)">{{ getJobName(job) }}</strong>
                <Status :statusName="job.statusName" :statusValue="job.status" type="text"></Status>
              </div>
              <div class="job-meta text-grey">
                <span>{{ $t('page.assets') }}: {{ job.assetCount || 0 }}</span>
                <span>{{ $t('page.timecost') }}: {{ job.costTime || '-' }}</span>
                <span>{{ $t('page.starttime') }}: {{ formatTime(job.startTime) }}</span>
                <span>{{ $t('page.endtime') }}: {{ formatTime(job.endTime) }}</span>
              </div>
              <div v-if="job.phaseList && job.phaseList.length" class="job-phase overflow">
                <PhaseBar :jobId="job.id" :phaseList="job.phaseList"></PhaseBar>
              </div>
              <div class="job-progress">
                <Liquid :percent="job.completionRate || 0" :size="7" :config="getProgressConfig(job)"></Liquid>
              </div>
            </div>
          </Col>
        </Row>
        <NoData v-else-if="!loadingShow"></NoData>
      </template>
    </TsContain>
    <RefireJobDialog
      v-if="isExecuteDialogShow"
      :id="parentJobId"
      @close="closeExecuteDialog"
    ></RefireJobDialog>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
export default {
  name: 'InspectAppParentJobDetail',
  directives: { download },
  components: {
    RefireJobDialog: () => import('@/views/pages/autoexec/detail/jobDetail/refire-job-dialog.vue'),
    Liquid: () => import('@/resources/components/SimpleGraph/Liquid.vue'),
    PhaseBar: () => import('@/views/pages/autoexec/components/job-phase-bar.vue'),
    Status: () => import('@/resources/components/Status/CommonStatus.vue'),
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue')
  },
  data() {
    return {
      detail: {},
      loadingShow: false,
      abortLoading: false,
      isExecuteDialogShow: false,
      validLoading: false,
      downloadLoading: false,
      refreshTimer: null
    };
  },
  created() {
    this.getDetail(true);
  },
  beforeDestroy() {
    this.clearRefreshTimer();
  },
  methods: {
    /** 获取父作业详情，并仅在执行期间继续轮询。 */
    async getDetail(showLoading) {
      this.clearRefreshTimer();
      if (showLoading) {
        this.loadingShow = true;
      }
      try {
        const res = await this.$api.inspect.applicationInspect.getInspectAppJobDetail(this.parentJobId);
        this.detail = res.Return || {};
        if (this.parentJob.status && !this.detail.reportReady) {
          this.refreshTimer = setTimeout(() => this.getDetail(false), 5000);
        }
      } finally {
        this.loadingShow = false;
      }
    },
    clearRefreshTimer() {
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
        this.refreshTimer = null;
      }
    },
    abortJob() {
      this.$createDialog({
        title: this.$t('dialog.title.updateconfirm'),
        content: this.$t('term.inspect.appjobdetail.abortconfirm'),
        'on-ok': async vnode => {
          vnode.loading = true;
          this.abortLoading = true;
          try {
            await this.$api.autoexec.job.abortJob({jobId: this.parentJobId});
            vnode.isShow = false;
            this.$Message.success(this.$t('message.executesuccess'));
            await this.getDetail(false);
          } finally {
            vnode.loading = false;
            this.abortLoading = false;
          }
        }
      });
    },
    openExecuteDialog() {
      this.isExecuteDialogShow = true;
    },
    closeExecuteDialog(needRefresh) {
      this.isExecuteDialogShow = false;
      if (needRefresh) {
        this.getDetail(false);
      }
    },
    validJob() {
      this.$createDialog({
        title: this.$t('dialog.title.updateconfirm'),
        content: this.$t('term.autoexec.validatejobtip'),
        'on-ok': async vnode => {
          vnode.loading = true;
          this.validLoading = true;
          try {
            await this.$api.autoexec.job.validJob({jobId: this.parentJobId});
            vnode.isShow = false;
            this.$Message.success(this.$t('message.executesuccess'));
            await this.getDetail(false);
          } finally {
            vnode.loading = false;
            this.validLoading = false;
          }
        }
      });
    },
    toChildJob(jobId) {
      this.$router.push({path: '/job-detail', query: {id: jobId}});
    },
    getJobName(job) {
      return job.route && job.route.name ? job.route.name : job.name;
    },
    getProgressConfig(job) {
      return {status: job.status === 'running' ? 'active' : job.status === 'failed' ? 'wrong' : job.status};
    },
    formatTime(time) {
      return time ? this.$utils.getDateByFormat(time) : '-';
    }
  },
  computed: {
    parentJobId() {
      return Number(this.$route.query.id);
    },
    parentJob() {
      return this.detail.parentJob || {};
    },
    childJobList() {
      return this.detail.childJobList || [];
    },
    summary() {
      return this.detail.summary || {};
    },
    summaryList() {
      return [
        {key: 'total', label: this.$t('page.total'), value: this.summary.total || 0},
        {key: 'assets', label: this.$t('page.assets'), value: this.summary.assetCount || 0},
        {key: 'running', label: this.$t('page.running'), value: this.summary.running || 0, className: 'text-info'},
        {key: 'completed', label: this.$t('page.completed'), value: this.summary.completed || 0, className: 'text-success'},
        {key: 'failed', label: this.$t('page.failed'), value: this.summary.failed || 0, className: 'text-error'}
      ];
    },
    downloadConfig() {
      return {
        url: 'api/binary/inspect/app/report/export',
        method: 'post',
        params: {parentJobId: this.parentJobId},
        changeStatus: status => {
          this.downloadLoading = status === 'start';
        }
      };
    }
  }
};
</script>
<style lang="less">
@import (reference) '~@/resources/assets/css/variable.less';
.inspect-app-parent-detail {
  .parent-title {
    display: flex;
    align-items: center;
    min-width: 0;
    > strong {
      max-width: 360px;
    }
    .parent-title-divider {
      flex: none;
      height: 16px;
      margin: 0 12px;
    }
  }
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(120px, 1fr));
    gap: 16px;
  }
  .summary-value {
    margin-top: 6px;
    font-size: 24px;
    font-weight: 600;
  }
  .job-card {
    min-height: 220px;
    border-top: 7px solid @default-bg-grey;
  }
  .job-card.pending,
  .job-card.waiting,
  .job-card.ready {
    border-top-color: @default-bg-grey;
  }
  .job-card.running,
  .job-card.pausing,
  .job-card.aborting,
  .job-card.waitInput {
    border-top-color: @default-info-bg-color;
  }
  .job-card.completed,
  .job-card.checked {
    border-top-color: @default-success-bg-color;
  }
  .job-card.failed,
  .job-card.paused,
  .job-card.aborted,
  .job-card.revoked {
    border-top-color: @default-error-bg-color;
  }
  .job-card-title {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }
  .job-meta {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px 12px;
    font-size: 12px;
  }
  .job-progress {
    margin-top: 18px;
  }
  .job-phase {
    margin-top: 12px;
  }
  @media (max-width: 900px) {
    .summary-grid {
      grid-template-columns: repeat(2, minmax(120px, 1fr));
    }
  }
}
</style>
