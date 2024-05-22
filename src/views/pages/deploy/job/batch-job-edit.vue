<template>
  <div>
    <TsContain>
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="text-action tsfont-left" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <span>
          <TsFormInput
            ref="inputName"
            v-model="jobData.name"
            border="border"
            :validateList="[{ name: 'required', message: ' ' }]"
            :maxlength="50"
            :width="450"
          ></TsFormInput>
        </span>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <span v-if="canEdit" class="action-item tsfont-auth" @click="editAuth()">{{ $t('page.authority') }}</span>
          <span v-if="canEdit" class="action-item tsfont-save" @click="save()">{{ $t('page.save') }}</span>
          <span v-if="canDelete" class="action-item tsfont-trash-o" @click="deleteJob()">{{ $t('page.delete') }}</span>
          <span v-if="canEdit && $AuthUtils.hasRole(['BATCHDEPLOY_VERIFY'])" class="action-item">
            <Button type="primary" @click="submit()">{{ $t('page.submit') }}</Button>
          </span>
          <span v-if="canEdit && !$AuthUtils.hasRole(['BATCHDEPLOY_VERIFY'])" class="action-item">
            <Button type="primary" @click="submit()">{{ $t('page.submitaudit') }}</Button>
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
            <span class="cursor tsfont-close-o remove-lane-btn text-grey" @click="removeLane(lane)"></span>
            <Col
              v-for="(group, gindex) in lane.groupList"
              :key="gindex"
              :xs="8"
              :sm="8"
              :md="6"
              :lg="6"
            >
              <div class="group-grid">
                <div class="divider-container padding-sm">
                  <div class="divider border-base-right"></div>
                  <div v-if="isAddGroupShow(lane, group) || isWaitGroupShow(lane, group)" class="btn-container bg-op pt-sm pb-sm">
                    <div v-if="isAddGroupShow(lane, group)" class="cursor tsfont-plus-o text-grey h3" @click="addGroup(lane, group)"></div>
                    <div
                      v-if="isWaitGroupShow(lane, group)"
                      :class="getNeedWaitClass(lane, group)"
                      class="cursor tsfont-pause-s  h3"
                      @click="toggleGroupNeedWait(lane, group)"
                    ></div>
                  </div>
                </div>
                <div>
                  <div class="grouptitle-grid">
                    <div class="pl-sm text-info">#{{ gindex + 1 }}</div>
                    <div class="pr-sm text-href" style="text-align:right" @click="showJobDialog(lane, group)"><span class="tsfont-plus">{{ $t('term.autoexec.job') }}</span></div>
                  </div>
                  <draggable
                    v-model="group.jobList"
                    :group="{ name: 'group_' + gindex, pull: true, put: true }"
                    chosenClass="item-selected"
                    ghostClass="bg-grey"
                    animation="300"
                    style="cursor:move"
                    @end="endDrag"
                  >
                    <transition-group style="min-height:120px;display: block;">
                      <div v-for="job in group.jobList" :key="job.id" class="job-container card-hover-shadow radius-sm block-border padding margin-sm">
                        <span class="cursor tsfont-close-o remove-job-btn text-grey" @click="removeJob(lane, group, job)"></span>
                        <div class="mb-xs">
                          <span>{{ job.envName }}</span>
                          <span v-if="job.version" class="ml-md text-grey">{{ $t('page.versions') }}:{{ job.version }}</span>
                        </div>
                        <div class="mb-xs">{{ job.appSystemAbbrName }}</div>
                        <div class="mb-xs">{{ job.appModuleAbbrName }}</div>
                        <div v-if="job.scenarioName" class="mb-xs"><Tag>{{ job.scenarioName }}</Tag></div>
                      </div>
                    </transition-group>
                  </draggable>
                </div>
              </div>
            </Col>
          </Row>
        </div>
        <div class="mt-nm item-selected padding-sm radius-md cursor" style="text-align:center;width:400px;" @click="addLane()">
          <span class="tsfont-plus"></span>
          <span>{{ $t('term.deploy.batchchannel') }}</span>
        </div>
      </template>
    </TsContain>
    <JobDialog v-if="isJobDialogShow" :excludeIdList="jobIdList" @close="closeJobDialog"></JobDialog>
    <AuthDialog v-if="isAuthDialogShow" :authList="jobData.authList" @close="closeAuthDialog"></AuthDialog>
    <TsDialog
      v-if="isCommitDialogShow"
      :title="$t('page.submitaudit')"
      type="modal"
      :isShow="true"
      @on-close="closeCommitDialog"
    >
      <template v-slot>
        <div>
          <TsForm ref="form" v-model="jobData" :item-list="formConfig"></TsForm>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="closeCommitDialog()">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import draggable from 'vuedraggable';

export default {
  name: '',
  components: {
    draggable,
    JobDialog: () => import('./select-job-dialog.vue'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    AuthDialog: () => import('./auth-dialog.vue')
  },
  props: {},
  data() {
    const _this = this;
    return {
      id: null,
      currentGroup: null,
      currentLane: null,
      isJobDialogShow: false,
      isCommitDialogShow: false,
      isAuthDialogShow: false,
      jobData: {
        planStartTime: null,
        triggerType: null
      },
      formConfig: {
        triggerType: {
          label: this.$t('page.executionmode'),
          type: 'radio',
          validateList: ['required'],
          dataList: [
            { value: 'manual', text: this.$t('term.deploy.manualtrigger') },
            { value: 'auto', text: this.$t('term.deploy.automaticexecution') }
          ],
          onChange: val => {
            this.$set(this.jobData, 'triggerType', val);
          }
        },
        planStartTime: {
          label: this.$t('page.plantime'),
          transfer: true,
          isHidden: false,
          type: 'datetime',
          valueType: 'timestamp',
          format: 'yyyy-MM-dd HH:mm',
          desc: this.$t('term.deploy.tasktimelimitfiveminutes'),
          selectableRange: () => {
            const now = new Date().getTime();
            return [now + 5 * 60 * 1000, 0];
          },
          validateList: [
            'required'
          ],
          onChange: val => {
            this.$set(this.jobData, 'planStartTime', val);
          }
        }
      }
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.query['id']) {
      this.id = parseInt(this.$route.query['id']);
      this.getJobById();
    }
    if (this.$route.query['name']) {
      this.jobData.name = this.$route.query['name'];
    }
    this.jobData.planStartTime = (new Date()).getTime() + 60 * 10 * 1000; //默认十分钟之后
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
    editAuth() {
      this.isAuthDialogShow = true;
    },
    showJobDialog(lane, group) {
      this.currentLane = lane;
      this.currentGroup = group;
      this.isJobDialogShow = true;
    },
    addJob(lane, group, jobList) {
      if (!group.jobList) {
        this.$set(group, 'jobList', []);
      }
      group.jobList.push(...jobList);
      //在最后添加一个空group
      if (lane.groupList[lane.groupList.length - 1] == group) {
        lane.groupList.push({ jobList: [] });
      }
    },
    removeJob(lane, group, job) {
      const index = group.jobList.findIndex(d => d === job);
      if (index >= 0) {
        group.jobList.splice(index, 1);
      }
      if (group.jobList.length == 0 && lane.groupList.length > 1) {
        const gindex = lane.groupList.findIndex(d => d === group);
        if (gindex >= 0) {
          lane.groupList.splice(gindex, 1);
        }
      }
    },
    addLane() {
      if (!this.jobData.laneList) {
        this.$set(this.jobData, 'laneList', []);
      }
      this.jobData.laneList.push({
        groupList: [{ jobList: [] }]
      });
    },
    addGroup(lane, group) {
      const index = lane.groupList.findIndex(d => d === group);
      if (index >= 0) {
        lane.groupList.splice(index, 0, { jobList: [] });
      }
    },
    toggleGroupNeedWait(lane, group) {
      //needWait要存到上一个group里
      const index = lane.groupList.findIndex(d => d === group);
      if (index > 0) {
        const beforeGroup = lane.groupList[index - 1];
        this.$set(beforeGroup, 'needWait', beforeGroup.needWait ? 0 : 1);
      }
    },
    getNeedWaitClass(lane, group) {
      const index = lane.groupList.findIndex(d => d === group);
      if (index > 0) {
        const beforeGroup = lane.groupList[index - 1];
        return beforeGroup.needWait ? 'text-primary' : 'text-grey';
      }
    },
    removeLane(lane) {
      const index = this.jobData.laneList.findIndex(d => d === lane);
      if (index >= 0) {
        this.jobData.laneList.splice(index, 1);
      }
    },
    endDrag() {
      //遍历所有通道，去掉没用的分组
      for (let i = this.jobData.laneList.length - 1; i >= 0; i--) {
        const lane = this.jobData.laneList[i];
        if (lane.groupList.length == 0 || lane.groupList[lane.groupList.length - 1].jobList.length > 0) {
          lane.groupList.push({ jobList: [] });
        }
        for (let g = lane.groupList.length - 1; g >= 0; g--) {
          const group = lane.groupList[g];
          if (group.jobList.length == 0 && g < lane.groupList.length - 1) {
            lane.groupList.splice(g, 1);
          }
        }
      }
    },
    getJobById() {
      if (this.id) {
        this.$api.deploy.job.getBatchJobById(this.id).then(res => {
          this.jobData = res.Return;
          //在每个通道最后都增加一个空组
          this.jobData.laneList.forEach(lane => {
            lane.groupList.push({ jobList: [] });
          });
        });
      }
    },
    closeJobDialog(jobList) {
      this.isJobDialogShow = false;
      if (jobList) {
        this.addJob(this.currentLane, this.currentGroup, jobList);
      }
    },
    closeAuthDialog(authList) {
      this.isAuthDialogShow = false;
      if (authList) {
        const authObjList = [];
        authList.forEach(auth => {
          const a = auth.split('#');
          authObjList.push({
            type: a[0],
            authUuid: a[1]
          });
        });
        this.jobData.authList = authObjList;
      }
    },
    closeCommitDialog() {
      this.isCommitDialogShow = false;
    },
    isWaitGroupShow(lane, group) {
      const index = lane.groupList.findIndex(d => d === group);
      if (index > 0 && group.jobList.length > 0) {
        return true;
      }
      return false;
    },
    isAddGroupShow(lane, group) {
      const index = lane.groupList.findIndex(d => d === group);
      if (group.jobList.length > 0 && (index == 0 || (index > 0 && lane.groupList[index - 1].jobList.length > 0))) {
        return true;
      }
      return false;
    },
    save() {
      const form = this.$refs['form'];
      if (form) {
        this.jobData.saveMode = 'commit';
      } else {
        this.jobData.saveMode = 'save';
      }
      if (!form || form.valid()) {
        const inputName = this.$refs['inputName'];
        if (inputName && inputName.valid()) {
          if (this.jobIdList.length == 0) {
            this.$Message.info(this.$t('term.deploy.atleastaddajob'));
            return fales;
          }
          this.$api.deploy.job.saveBatchDeployJob(this.jobData).then(res => {
            if (res.Status == 'OK') {
              this.jobData = res.Return;
              this.$Message.success(this.$t('message.savesuccess'));
              this.closeCommitDialog();
              // this.$skipHistory();
              this.$router.push({ path: '/batch-job-detail', query: { id: this.jobData.id } });
            }
          });
        }
      }
    },
    deleteJob() {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('term.deploy.deletebatchjobconfirm'),
        'on-ok': vnode => {
          this.$api.deploy.job.deleteJob(this.jobData.id).then(res => {
            if (res.Status == 'OK') {
              vnode.isShow = false;
              this.$Message.success(this.$t('message.deletesuccess'));
              this.$router.push({ path: '/job-manage' });
            }
          });
        }
      });
    },
    submit() {
      const inputName = this.$refs['inputName'];
      if (inputName && !inputName.valid()) {
        return false;
      }
      this.$set(this.formConfig.triggerType, 'value', this.jobData.triggerType);
      this.isCommitDialogShow = true;
    }
  },
  filter: {},
  computed: {
    canDelete() {
      if (this.$AuthUtils.hasRole(['BATCHDEPLOY_MODIFY']) && this.jobData.id && this.jobData.reviewStatus !== 'waiting') {
        return true;
      }
      return false;
    },
    canEdit() {
      if (this.$AuthUtils.hasRole(['BATCHDEPLOY_MODIFY']) && (!this.jobData.id || this.jobData.reviewStatus !== 'waiting')) {
        return true;
      }
      return false;
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
.lane-grid {
  width: 100%;
  display: grid;
  grid-template-columns: 25% 25% 25% 25%;
}
.group-grid {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 30px auto;
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
    right: 0px;
    top: 0px;
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
}
.job-container:hover {
  .remove-job-btn {
    visibility: visible;
  }
}
</style>
