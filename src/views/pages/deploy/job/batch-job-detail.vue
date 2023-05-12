<template>
  <div>
    <TsContain>
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="text-action tsfont-left" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <div>
          <span>{{ jobData.name }}</span>
          <span class="ml-md">
            <Status
              v-if="jobData.status"
              :statusName="jobData.statusName"
              :statusValue="jobData.status"
              class="job-status"
            ></Status>
          </span>
          <span v-if="jobData.reviewStatus && jobData.reviewStatus !== 'passed'" class="ml-md">
            <Status :statusName="jobData.reviewStatusName" :statusValue="jobData.reviewStatus" class="job-status"></Status>
          </span>
        </div>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <span v-if="canEdit" class="action-item tsfont-edit" @click="toEdit()">{{ $t('page.edit') }}</span>
          <span v-if="canVerify" class="action-item">
            <Button type="error" @click="refuseJob()">{{ $t('page.reject') }}</Button>
          </span>
          <span v-if="canVerify" class="action-item">
            <Button type="success" @click="accessJob()">{{ $t('page.passed') }}</Button>
          </span>
          <span v-if="canValid" class="action-item">
            <Button type="success" @click="validJob()">{{ $t('page.verify') }}</Button>
          </span>
          <span v-if="canRun" class="action-item">
            <Button type="primary" @click="runJob()">{{ $t('page.execute') }}</Button>
          </span>
          <span v-if="canTakeOver" class="action-item">
            <Button type="primary" @click="takeOverJob()">{{ $t('page.takeover') }}</Button>
          </span>
        </div>
      </template>
      <template v-slot:content>
        <div>
          <Row
            v-for="(lane, lindex) in jobData.laneList"
            :key="lindex"
            type="flex"
            class="radius-lg bg-op padding mb-nm lane-container"
          >
            <Col
              v-for="(group, gindex) in lane.groupList"
              :key="gindex"
              :xs="8"
              :sm="8"
              :md="6"
              :lg="6"
            >
              <div class="group-grid">
                <div>
                  <div class="grouptitle-grid">
                    <div class="pl-sm text-info h2">#{{ gindex + 1 }}</div>
                    <div
                      v-if="canGroupRun(group)"
                      class="pr-sm text-href"
                      style="text-align:right"
                      @click="runGroup(group)"
                    ><span class="h2 tsfont-play-o"></span></div>
                  </div>
                  <div
                    v-for="job in group.jobList"
                    :key="job.id"
                    :class="group.status !== 'pending' ? job.status : ''"
                    class="cursor job-container card-hover-shadow radius-sm block-border padding margin-sm"
                    @click="toJob(job.id)"
                  >
                    <div class="job-status">
                      <Status v-if="group.status !== 'pending'" :statusValue="job.status" :statusName="job.statusName"></Status>
                    </div>
                    <div class="mb-xs">
                      <span>{{ job.envName }}</span>
                      <span v-if="job.version" class="ml-md text-grey">{{ $t('page.versions') }}:{{ job.version }}</span>
                    </div>
                    <div class="mb-xs">{{ job.appSystemAbbrName }}</div>
                    <div class="mb-xs">{{ job.appModuleAbbrName }}</div>
                    <div v-if="job.phaseList && job.phaseList.length > 0" class="overflow">
                      <PhaseBar :jobId="job.id" :phaseList="job.phaseList"></PhaseBar>
                    </div>
                  </div>
                </div>
                <div class="divider-container padding-sm">
                  <div class="divider border-base-right"></div>
                  <div v-if="gindex < lane.groupList.length - 1 && canResumeGroup(group, lane.groupList[gindex + 1])" class="btn-container bg-op pt-sm pb-sm">
                    <div class="tsfont-play-s text-href h1" @click="resumeGroup(group)"></div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </template>
    </TsContain>
    <ExecutePolicyDialog
      v-if="isExecuteDialogShow"
      :id="executeTargetId"
      :action="executeAction"
      @close="closeExecuteDialog"
    ></ExecutePolicyDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    Status: resolve => require(['@/resources/components/Status/CommonStatus.vue'], resolve),
    ExecutePolicyDialog: resolve => require(['./execute-policy-dialog.vue'], resolve),
    PhaseBar: resolve => require(['./phase-bar.vue'], resolve)
  },
  props: {},
  data() {
    const _this = this;
    return {
      id: null,
      timmer: null,
      batchtimmer: null,
      executeAction: 'job',
      executeTargetId: null,
      isExecuteDialogShow: false,
      currentGroup: null,
      currentLane: null,
      jobData: {},
      jobEndStatusList: ['completed', 'aborted', 'ignored', 'failed', 'checked'] //终点状态节点列表，非终点状态列表的需要定时刷新。
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.query['id']) {
      this.id = parseInt(this.$route.query['id']);
      this.getJobById();
    }
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    this.clearTimmer();
    this.clearBatchTimmer();
  },
  destroyed() {},
  methods: {
    toJob(jobId) {
      this.$router.push({ path: '/job-detail?id=' + jobId });
    },
    toEdit() {
      this.$router.push({ path: '/batch-job-edit', query: { id: this.jobData.id } });
    },
    runGroup(group) {
      this.executeTargetId = group.id;
      this.executeAction = 'group';
      this.isExecuteDialogShow = true;
    },
    resumeGroup(group) {
      this.executeTargetId = group.id;
      this.executeAction = 'resumegroup';
      this.isExecuteDialogShow = true;
    },
    getJobById() {
      if (this.id) {
        this.$api.deploy.job.getBatchJobById(this.id).then(res => {
          this.jobData = res.Return;
          if (!this.jobEndStatusList.includes(this.jobData.status)) {
            this.refreshBatchJobStatus();
          }
          if (this.jobData.laneList && this.jobData.laneList.length > 0) {
            const newIdList = [];
            this.jobData.laneList.forEach(lane => {
              if (lane.groupList && lane.groupList.length > 0) {
                lane.groupList.forEach(group => {
                  if ((group.status === 'running' || group.status === 'pending') && group.jobList && group.jobList.length > 0) {
                    group.jobList.forEach(job => {
                      if (!this.jobEndStatusList.includes(job.status)) {
                        newIdList.push(job.id);
                      }
                    });
                  }
                });
              }
            });
            this.refreshJobStatus(newIdList);
          }
        });
      }
    },
    isWaitGroupShow(lane, group) {
      const index = lane.groupList.findIndex(d => d === group);
      if (index > 0 && group.jobList.length > 0) {
        return true;
      }
      return false;
    },
    refuseJob() {
      this.$createDialog({
        title: this.$t('dialog.title.updateconfirm'),
        content: this.$t('term.deploy.rejectbatchjobconfirm'),
        'on-ok': vnode => {
          this.$api.deploy.job.saveReviewStatus(this.jobData.id, 'failed').then(res => {
            if (res.Status == 'OK') {
              this.jobData = res.Return;
            }
          }).finally(() => {
            vnode.isShow = false;
          });
        }
      });
    },
    accessJob() {
      this.$createDialog({
        title: this.$t('dialog.title.updateconfirm'),
        content: this.$t('term.deploy.passbatchjobconfirm'),
        'on-ok': vnode => {
          this.$api.deploy.job.saveReviewStatus(this.jobData.id, 'passed').then(res => {
            if (res.Status == 'OK') {
              this.jobData = res.Return;
            }
          }).finally(() => {
            vnode.isShow = false;
          });
        }
      });
    },
    validJob() {
      if (this.canValid) {
        this.$api.deploy.job.validJob(this.jobData.id).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.executesuccess'));
            this.getJobById();
          }
        });
      }
    },
    runJob() {
      if (this.canRun) {
        this.executeTargetId = this.jobData.id;
        this.executeAction = 'job';
        this.isExecuteDialogShow = true;
      }
    },
    takeOverJob() {
      if (this.canTakeOver) {
        this.$api.deploy.job.takeOverJob(this.jobData.id).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.executesuccess'));
            this.getJobById();
          }
        });
      }
    },
    closeExecuteDialog(needRefresh) {
      this.isExecuteDialogShow = false;
      if (needRefresh) {
        this.getJobById();
      }
    },
    clearTimmer() {
      if (this.timmer) {
        clearTimeout(this.timmer);
        this.timmer = null;
      }
    },
    clearBatchTimmer() {
      if (this.batchtimmer) {
        clearTimeout(this.batchtimmer);
        this.batchtimmer = null;
      }
    },
    refreshBatchJobStatus() {
      this.clearBatchTimmer();
      this.$api.deploy.job.getBatchJobStatusById(this.id).then(res => {
        const jobStatus = res.Return;
        this.$set(this.jobData, 'status', jobStatus.status);
        this.$set(this.jobData, 'statusName', jobStatus.statusName);
        if (jobStatus && !this.jobEndStatusList.includes(jobStatus.status)) {
          this.batchtimmer = setTimeout(() => {
            this.refreshBatchJobStatus();
          }, 5000);
        }
      });
    },
    refreshJobStatus(idList) {
      if (idList && idList.length > 0) {
        this.clearTimmer();
        this.$api.deploy.job.getGroupJobList(idList).then(res => {
          const groupList = res.Return;
          const newIdList = [];
          if (groupList && groupList.length > 0 && this.jobData.laneList && this.jobData.laneList.length > 0) {
            for (let i = 0; i < this.jobData.laneList.length; i++) {
              const lane = this.jobData.laneList[i];
              if (lane.groupList && lane.groupList.length > 0) {
                for (let j = 0; j < lane.groupList.length; j++) {
                  const group = lane.groupList[j];
                  if ((group.status === 'running' || group.status === 'pending') && group.jobList && group.jobList.length > 0) {
                    for (let k = 0; k < group.jobList.length; k++) {
                      const job = group.jobList[k];
                      const newGroup = groupList.find(d => d.id === group.id);
                      if (newGroup) {
                        this.$set(group, 'status', newGroup.status);
                        this.$set(group, 'statusName', newGroup.statusName);
                        if (newGroup.jobList && newGroup.jobList.length > 0) {
                          const newJob = newGroup.jobList.find(d => d.id === job.id);
                          if (newJob) {
                            this.$set(job, 'status', newJob.status);
                            this.$set(job, 'statusName', newJob.statusName);
                            this.$set(job, 'phaseList', newJob.phaseList);
                          }
                          if (!this.jobEndStatusList.includes(job.status)) {
                            newIdList.push(job.id);
                          }
                        }
                        //如果状态跳变有短时间隙，在发现组状态已完成后，需要触发一次全面刷新，检查是否有进行中的作业。
                        if (newGroup.status === 'completed' || newGroup.status === 'waitInput') {
                          this.getJobById();
                          return;
                        }
                      }
                    }
                  }
                }
              }
            }
            if (newIdList.length > 0) {
              this.timmer = setTimeout(() => {
                this.refreshJobStatus(newIdList);
              }, 5000);
            }
          }
        });
      }
    }
  },
  filter: {},
  computed: {
    canValid() {
      if (this.jobData.isCanCheck === 1 && !this.$utils.isEmpty(this.jobData)) {
        if (this.jobData.laneList && this.jobData.laneList.length > 0) {
          for (let i = 0; i < this.jobData.laneList.length; i++) {
            const lane = this.jobData.laneList[i];
            if (lane.groupList && lane.groupList.length > 0) {
              for (let j = 0; j < lane.groupList.length; j++) {
                const group = lane.groupList[j];
                if (group.jobList && group.jobList.length > 0) {
                  if (group.jobList.find(d => d.status === 'completed')) {
                    return true;
                  }
                }
              }
            }
          }
        }
      }
      return false;
    },
    canEdit() {
      if (!this.$utils.isEmpty(this.jobData)) {
        if (this.jobData.isCanEdit === 1) {
          return true;
        }
      }
      return false;
    },
    canVerify() {
      if (this.$AuthUtils.hasRole(['BATCHDEPLOY_VERIFY']) && this.jobData.reviewStatus === 'waiting') {
        return true;
      }
      return false;
    },
    canRun() {
      if (!this.$utils.isEmpty(this.jobData)) {
        if (this.jobData.isCanExecute === 1) {
          return true;
        }
      }
      return false;
    },
    canTakeOver() {
      if (!this.$utils.isEmpty(this.jobData)) {
        if (this.jobData.isCanTakeOver == 1) {
          return true;
        }
      }
      return false;
    },
    canResumeGroup() {
      return (group, nextGroup) => {
        if (this.jobData.isCanGroupExecute === 1) {
          if (group && nextGroup) {
            if ((group.status === 'waitInput' || group.status === 'failed') && nextGroup.status === 'pending') {
              return true;
            }
          }
        }
        return false;
      };
    },
    canGroupRun() {
      return group => {
        if (this.jobData.isCanGroupExecute === 1) {
          if (group) {
            //if (group.status !== 'running') {
            if (group.jobList && group.jobList.length > 0) {
              for (let i = 0; i < group.jobList.length; i++) {
                const job = group.jobList[i];
                if (job.status === 'waitInput' || job.status === 'running') {
                  return false;
                }
              }
            }
            return true;
            //}
          }
        }
        return false;
      };
    },
    jobIdList() {
      const idList = [];
      if (this.jobData.laneList && this.jobData.laneList.length > 0) {
        this.jobData.laneList.forEach(lane => {
          if (lane.groupList && lane.groupList.length > 0) {
            lane.groupList.forEach(group => {
              if (group.jobList && group.jobList.length > 0) {
                group.jobList.forEach(job => {
                  idList.push(job.id);
                });
              }
            });
          }
        });
      }
      return idList;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
@import './batch-job-detail.less';
.lane-grid {
  width: 100%;
  display: grid;
  grid-template-columns: 25% 25% 25% 25%;
}
.group-grid {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: auto 30px;
}
.grouptitle-grid {
  width: 100%;
  display: grid;
  grid-template-columns: auto auto;
}
.divider-container {
  position: relative;
}
.divider {
  width: 1px;
  height: 100%;
  margin: auto;
}
.btn-container {
  position: absolute;
  top: 20%;
  left: 0px;
  width: 100%;
  text-align: center;
}
.lane-container {
  position: relative;
  .remove-lane-btn {
    visibility: hidden;
    position: absolute;
    font-size: 16px;
    right: -8px;
    top: -10px;
  }
}
.lane-container:hover {
  .remove-lane-btn {
    visibility: visible;
  }
}
.job-container {
  position: relative;
  .remove-job-btn {
    visibility: hidden;
    position: absolute;
    right: -8px;
    top: -8px;
  }
  .job-status {
    position: absolute;
    top: 15px;
    right: 15px;
  }
}
.job-container:hover {
  .remove-job-btn {
    visibility: visible;
  }
}
</style>
