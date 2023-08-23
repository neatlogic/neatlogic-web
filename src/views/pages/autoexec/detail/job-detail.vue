<template>
  <div class="job-detail border-radius">
    <TsContain :siderWidth="258" :enableCollapse="true">
      <template v-slot:navigation>
        <span class="tsfont-left text-action" @click="$back(prevPath.router)">{{ $getFromPage(prevPath.name) }}</span>
      </template>
      <template v-slot:topLeft>
        <div class="action-group">
          <span class="block-item">{{ jobData.name }}</span>
          <Divider type="vertical" style="margin:0px" />
          <span class="action-item">
            <UserCard :uuid="jobData.execUser"></UserCard>
          </span>
          <span><Status
            v-if="jobData.status"
            :statusName="jobData.statusName"
            :statusValue="jobData.status"
            class="job-status"
          ></Status></span>
        </div>
      </template>
      <template v-slot:topRight>
        <div class="div-btn-contain action-group">
          <span v-if="jobData.extraInfo && jobData.extraInfo.isHasLock == 1" class="tsfont-lock text-action action-item text-warning" @click="globalLockShow">{{ $t('term.autoexec.resourcelock') }}</span>
          <span class="action-item tsfont-console" @click="isShowConsoleLogDialog = true">{{ $t('term.autoexec.controlpanel') }}</span>
          <span class="action-item tsfont-config" @click="openShowParam">{{ $t('page.param') }}</span>
          <span class="action-item">
            <Dropdown trigger="hover" placement="bottom">
              <span class="tsfont-option-horizontal"></span>
              <DropdownMenu slot="list">
                <DropdownItem>
                  <div>
                    <span v-if="!downloadLoading" v-download="exportJob" class="action-item">{{ $t('term.autoexec.exportjob') }}</span>
                    <span v-if="downloadLoading" class="action-item disable" :title="$t('page.downloadloadingtip')">
                      <Icon type="ios-loading" size="18" class="loading icon-right"></Icon>
                      {{ $t('term.autoexec.exportjob') }}
                    </span>
                  </div>
                </DropdownItem>
                <DropdownItem v-if="jobData.isCanExecute || jobData.isCanTakeOver" @click.native="copyJob()">
                  <div>
                    {{ $t('term.autoexec.copyjob') }}
                  </div>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </span>
          <span v-if="jobData.isCanTakeOver" class="action-item">
            <Button type="primary" @click="takeoverFn">{{ $t('page.takeover') }}</Button>
          </span>
          <template v-if="jobData.isCanExecute">
            <span v-for="action in statusActionMapping[jobData.status]" :key="action" class="action-item">
              <Button
                v-if="action == 'pause'"
                :type="actionMap[action].type"
                ghost
                @click="actionMap[action].fn"
              >{{ actionMap[action].text }}</Button>
              <Button v-else :type="actionMap[action].type" @click="actionMap[action].fn">{{ actionMap[action].text }}</Button>
            </span>
          </template>
        </div>
      </template>
      <template v-slot:sider>
        <PhaseList :phaseList="jobData.phaseList" @change="changePhase"></PhaseList>
      </template>
      <template v-slot:content>
        <div>
          <div v-if="jobData.extraInfo" class="pb-nm">
            <ExtrainfoDetail :config="jobData.extraInfo"></ExtrainfoDetail>
          </div>
          <div
            :is="currentPhase.execMode + 'Content'"
            v-if="currentPhase && isReady"
            :jobData="jobData"
            :phaseData="currentPhase"
            class="currentPhase-detail radius-lg"
            :style="{'--height': offsetHeight }"
            @refresh="refresh"
          ></div>
        </div>
      </template>
    </TsContain>
    <!-- 参数 -->
    <JobParamDialog v-if="isShowJobParam" :id="jobData.id" @close="isShowJobParam = false"></JobParamDialog>
    <!-- 重跑 -->
    <RefireJobDialog v-if="isShowRerunDialog" :id="jobData.id" @close="closeRerunDialog"></RefireJobDialog>
    <!-- 控制台 -->
    <ConsoleLogDialog v-if="isShowConsoleLogDialog" :jobData="jobData" @close="closeConsoleLogDialog"></ConsoleLogDialog>
    <!-- 资源锁 -->
    <LockDialog
      v-if="isShowResourceLockDialog"
      :keywordParam="lockSearchParam"
      :selectedApp="lockSearchParam"
      @close="globalLockClose"
    ></LockDialog>
  </div>
</template>
<script>
import ContentItem from './jobDetail/phase/index.js';
import download from '@/resources/directives/download.js';
export default {
  name: 'ActionDetail',
  components: {
    RefireJobDialog: resolve => require(['./jobDetail/refire-job-dialog.vue'], resolve),
    PhaseList: resolve => require(['./jobDetail/job-phase-list.vue'], resolve),
    ConsoleLogDialog: resolve => require(['./jobDetail/job-console-log-dialog.vue'], resolve),
    JobParamDialog: resolve => require(['./jobDetail/job-param-dialog.vue'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    ...ContentItem,
    Status: resolve => require(['@/resources/components/Status/CommonStatus.vue'], resolve),
    ExtrainfoDetail: resolve => require(['./jobDetail/extrainfo-detail.vue'], resolve),
    LockDialog: resolve => require(['@/views/pages/deploy/job/resourcelock/resourcelock-dialog'], resolve) //资源锁
  },
  filters: {},
  directives: { download },
  data() {
    const _this = this;
    return {
      downloadLoading: false,
      jobData: {}, //作业数据
      jobParam: { jobStatus: 'running' }, //查询作业时的参数
      activePhaseId: null, //当前激活阶段
      fixedPhaseId: null, //当前固定阶段
      timmer: null, //作业状态定时刷新器
      currentPhaseId: null, //当前选中的phaseId
      isShowRerunDialog: false,
      isShowConsoleLogDialog: false,
      isShowResourceLockDialog: false, //资源锁弹框默认不弹框
      idList: [],
      isReady: true, //刷新后用于重置组件，让组件可以重新开始所有刷新
      prevPath: {
        router: '/job-manage',
        name: this.$t('router.autoexec.jobmanage')
      },
      tabsValue: 'jobdetail',
      selectStepId: null,
      isShowJobParam: false, //显示参数弹框
      phaseEndingStatusList: ['completed', 'aborted', 'failed', 'paused'], //终点状态节点列表，非终点状态列表的需要定时刷新。
      statusActionMapping: {
        pending: ['abort'], //未开始：
        running: ['pause', 'abort'], //运行中： 暂停  终止
        aborting: ['abort'], //终止中
        pausing: ['pause', 'abort'], //暂定中
        paused: ['refire'], //已暂停：继续 重跑
        aborted: ['refire'], //已终止：继续 重跑
        completed: ['refire', 'valid'], //已成功：重跑
        failed: ['refire'], //已失败：继续
        ready: ['execute', 'revoke'], //已就绪 撤销 执行
        waitInput: ['abort']
      },
      actionMap: {
        valid: {
          text: this.$t('page.verify'),
          icon: 'tsfont-check-o',
          type: 'success',
          fn: _this.validJob
        },
        abort: {
          text: this.$t('page.abort'),
          icon: 'tsfont-forbid',
          type: 'warning',
          fn: _this.abortJob
        },
        pause: {
          text: this.$t('page.pause'),
          type: 'warning',
          fn: _this.pauseJob
        },
        refire: {
          text: this.$t('page.reexecute'),
          icon: 'tsfont-run',
          type: 'primary',
          fn: _this.refireJob
        },
        execute: {
          text: this.$t('page.execute'),
          icon: 'tsfont-run',
          type: 'primary',
          fn: _this.executeJob
        },
        revoke: {
          text: this.$t('page.revocation'),
          icon: 'tsfont-undo',
          type: 'error',
          fn: _this.revokeJob
        }
      }, lockSearchParam: {
        
      }
    };
  },
  beforeCreate() {},
  async created() {
    if (this.$route.query && this.$route.query.id) {
      this.jobParam.jobId = parseInt(this.$route.query.id);
    }
    //由于共用的jobData参数，所以需要等待作业信息获取完毕才能进行后续查询
    await this.getJobById();
    this.getPhaseList();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    this.clearTimmer();
  },
  destroyed() {},
  methods: {
    async getJobById() {
      await this.$api.autoexec.job.getJobById(this.jobParam.jobId).then(res => {
        this.jobData = res.Return;
        this.lockSearchParam = {
          jobId: this.jobParam.jobId,
          name: !this.jobData.extraInfo || this.jobData.extraInfo.appSystemName
        };
      });
    },
    refresh() {
      this.isReady = false;
      this.getPhaseList(true);
    },
    refireJob() {
      if (this.phaseEndingStatusList.includes(this.jobData.status)) {
        this.isShowRerunDialog = true;
      }
    },
    validJob() {
      this.$createDialog({
        title: this.$t('dialog.title.updateconfirm'),
        content: this.$t('term.autoexec.validatejobtip'),
        'on-ok': vnode => {
          this.$api.autoexec.job.validJob({ jobId: this.jobData.id }).then(res => {
            if (res.Status == 'OK') {
              vnode.isShow = false;
              this.$Message.success(this.$t('message.executesuccess'));
              this.getJobById();
              this.refresh();
            }
          });
        }
      });
    },
    abortJob() {
      this.$createDialog({
        title: this.$t('dialog.title.updateconfirm'),
        content: this.$t('dialog.content.tipconfirm', {target: this.$t('page.abort'), name: this.$t('term.autoexec.job')}),
        'on-ok': vnode => {
          this.$api.autoexec.job.abortJob({ jobId: this.jobData.id }).then(res => {
            if (res.Status == 'OK') {
              vnode.isShow = false;
              this.$Message.success(this.$t('message.executesuccess'));
              this.refresh();
            }
          });
        }
      });
    },
    pauseJob() {
      this.$createDialog({
        title: this.$t('dialog.title.updateconfirm'),
        content: this.$t('dialog.content.tipconfirm', {target: this.$t('page.pause'), name: this.$t('term.autoexec.job')}),
        'on-ok': vnode => {
          this.$api.autoexec.job.pauseJob({ jobId: this.jobData.id }).then(res => {
            if (res.Status == 'OK') {
              vnode.isShow = false;
              this.$Message.success(this.$t('message.executesuccess'));
              this.refresh();
            }
          });
        }
      });
    },
    executeJob() {
      this.$createDialog({
        title: this.$t('dialog.title.updateconfirm'),
        content: this.$t('dialog.content.tipconfirm', {target: this.$t('page.execute'), name: this.$t('term.autoexec.job')}),
        'on-ok': vnode => {
          this.$api.autoexec.job.executeJob({ jobId: this.jobData.id }).then(res => {
            if (res.Status == 'OK') {
              vnode.isShow = false;
              this.$Message.success(this.$t('message.executesuccess'));
              this.refresh();
            }
          });
        }
      });
    },
    revokeJob() {
      this.$createDialog({
        title: this.$t('dialog.title.revocationconfirm'),
        content: this.$t('dialog.content.revocationconfirm', {target: this.$t('term.autoexec.job')}),
        'on-ok': vnode => {
          this.$api.autoexec.job.revokeJob({ jobId: this.jobData.id }).then(res => {
            if (res.Status == 'OK') {
              vnode.isShow = false;
              this.$Message.success(this.$t('message.executesuccess'));
              this.refresh();
            }
          });
        }
      });
    },
    clearTimmer() {
      if (this.timmer) {
        clearTimeout(this.timmer);
        this.timmer = null;
      }
    },
    getPhaseList(isRefresh) {
      this.clearTimmer();
      if (isRefresh) {
        this.jobParam.phaseIdList = [];
      }
      this.$api.autoexec.job
        .getPhaseList(this.jobParam)
        .then(res => {
          this.$set(this.jobData, 'phaseList', res.Return['phaseList']);
          this.$set(this.jobData, 'status', res.Return['status']);
          this.$set(this.jobData, 'statusName', res.Return['statusName']);
          if (this.jobData && this.jobData.extraInfo) {
            this.$set(this.jobData.extraInfo, 'isHasLock', res.Return['isHasLock']);
          }
          if (this.jobData && this.jobData.phaseList) {
            const phaseIdList = [];
            this.jobData.phaseList.forEach(phase => {
              if (!this.phaseEndingStatusList.includes(phase.status)) {
                phaseIdList.push(phase.id);
              }
            });
            if (phaseIdList.length > 0) {
              this.timmer = setTimeout(() => {
                this.refreshPhaseList(phaseIdList);
              }, 5000);
            }
          }
        })
        .finally(() => {
          //重置动作需要重新获取所有阶段状态后才能进行，否则在重跑的情况下会因为上次状态的残留导致某些动作有问题
          if (isRefresh) {
            this.isReady = false;
            this.$nextTick(() => {
              this.isReady = true;
            });
          }
        });
    },
    refreshPhaseList(phaseIdList) {
      this.clearTimmer();
      if (phaseIdList && phaseIdList.length > 0) {
        this.$api.autoexec.job
          .getPhaseList({ jobId: this.jobParam.jobId, phaseIdList: phaseIdList})
          .then(res => {
            if (res.Return['phaseList'] && res.Return['phaseList'].length > 0) {
              res.Return['phaseList'].forEach(phase => {
                const oldPhaseIndex = this.jobData.phaseList.findIndex(d => d.id === phase.id);
                if (oldPhaseIndex >= 0) {
                  this.$set(this.jobData.phaseList, oldPhaseIndex, phase);
                }
              });
            }
            this.$set(this.jobData, 'status', res.Return['status']);
            this.$set(this.jobData, 'statusName', res.Return['statusName']);
            const phaseIdList = [];
            this.jobData.phaseList.forEach(phase => {
              if (!this.phaseEndingStatusList.includes(phase.status)) {
                phaseIdList.push(phase.id);
              }
            });
            if (this.jobData && this.jobData.extraInfo) {
              this.$set(this.jobData.extraInfo, 'isHasLock', res.Return['isHasLock']);
            }
            if (phaseIdList.length > 0) {
              this.timmer = setTimeout(() => {
                this.refreshPhaseList(phaseIdList);
              }, 5000);
            }
          });
      }
    },
    changePhase(phaseId) {
      this.currentPhaseId = phaseId;
      this.isReady = false;
      this.$nextTick(() => {
        this.isReady = true;
      });
    },
    closeRerunDialog(needRefresh) {
      this.isShowRerunDialog = false;
      if (needRefresh) {
        this.refresh();
      }
    },
    close() {
      this.isShowReRun = false;
    },
    openShowParam() {
      this.isShowJobParam = true;
    },
    takeoverFn() {
      this.$createDialog({
        title: this.$t('term.autoexec.takeoverjob'),
        content: this.$t('dialog.content.takeoverjobconfirm', {target: this.$t('term.autoexec.job')}),
        'on-ok': vnode => {
          this.$api.autoexec.job
            .takeoverJob({ jobId: this.jobData.id })
            .then(res => {
              if (res.Status == 'OK') {
                window.location.reload();
                this.$Message.success(this.$t('message.executesuccess'));
              }
            })
            .finally(() => {
              vnode.isShow = false;
            });
        }
      });
    },
    closeConsoleLogDialog() {
      this.isShowConsoleLogDialog = false;
    },
    globalLockShow() {
      this.isShowResourceLockDialog = true;
    },
    globalLockClose() {
      this.isShowResourceLockDialog = false;
    },
    copyJob() { //复制作业
      let path = '';
      if (this.jobData.source == 'test') {
        path = '/test-detail';
      } else if (this.jobData.source == 'deploy' || this.jobData.source == 'deployschedulegeneral') { // deployschedulegeneral 发布定时普通作业
        path = '/job-add';
      } else {
        path = '/runner-detail';
      }
      this.$router.push({
        path: path,
        query: { jobId: this.jobData.id }
      });
    }
  },
  computed: {
    currentPhase() {
      if (this.currentPhaseId && this.jobData.phaseList && this.jobData.phaseList.length > 0) {
        return this.jobData.phaseList.find(d => d.id == this.currentPhaseId);
      }
      return null;
    },
    offsetHeight() {
      return this.jobData && !this.$utils.isEmpty(this.jobData.extraInfo) ? '215px' : '116px';
    },
    exportJob() {
      return {
        url: '/api/binary/autoexec/job/export',
        method: 'post',
        params: { jobId: this.jobParam.jobId},
        changeStatus: status => {
          if (status == 'start') {
            this.downloadLoading = true;
          } else if (status == 'success' || status == 'error') {
            this.downloadLoading = false;
          }
        }
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.job-detail {
  /deep/.job-tab {
    .block-tabs2 > .ivu-tabs-bar {
      background: #fff;
      border-bottom: none;
    }
    .tscontain-container .tscontain-body {
      height: calc(100vh - 56px - 56px - 56px - 12px);
      padding: 0px !important;
    }
    .ivu-layout-content {
      overflow-y: hidden;
    }
  }
  /deep/.goprev-right {
    padding-left: 0px;
  }
}
.job-status {
  margin-right: 10px;
  padding-left: 2px;
  display: inline-block;
}
.action-title {
  display: inline-block;
  > span {
    display: block;
    line-height: normal;
  }
}
.title-top {
  padding-bottom: 10px;
}
.currentPhase-detail {
  height: calc(100vh - var(--height));
  overflow-y: auto;
}
</style>
