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
            v-model="pipelineData.name"
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
          <span v-if="canDelete" class="action-item tsfont-trash-o" @click="deleteJob()">{{ $t('page.delete') }}</span>
          <span v-if="canEdit" class="action-item"><Button type="primary" @click="save()">{{ $t('page.save') }}</Button></span>
        </div>
      </template>
      <template v-slot:content>
        <div>
          <Loading v-if="isLoading" :loadingShow="isLoading" type="fix"></Loading>
          <Row
            v-for="(lane, lindex) in pipelineData.laneList"
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
                    <div class="pr-sm text-href" style="text-align:right" @click="showJobDialog(lane, group)"><span class="tsfont-plus">{{ $t('term.deploy.jobtemplate') }}</span></div>
                  </div>
                  <draggable
                    v-model="group.jobTemplateList"
                    :group="{ name: 'group_' + gindex, pull: true, put: true }"
                    chosenClass="item-selected"
                    ghostClass="bg-grey"
                    animation="300"
                    style="cursor:move"
                    @end="endDrag"
                  >
                    <transition-group style="min-height:120px;display: block;">
                      <div v-for="job in group.jobTemplateList" :key="job.id || job.uuid" class="job-container card-hover-shadow radius-sm block-border padding margin-sm">
                        <span class="cursor tsfont-edit edit-job-btn text-grey" @click="editJob(job)"></span>
                        <span class="cursor tsfont-close-o remove-job-btn text-grey" @click="removeJob(lane, group, job)"></span>
                        <div class="mb-xs">{{ job.envName }}</div>
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
          <span class="tsfont-plus">{{ $t('term.deploy.batchchannel') }}</span>
        </div>
      </template>
    </TsContain>
    <JobTemplateDialog
      v-if="isJobTemplateDialogShow"
      :id="currentJob&&currentJob.id"
      :job="currentJob"
      :type="pipelineData.type"
      :appSystemId="pipelineData.appSystemId"
      @close="closeJobTemplateDialog"
      @insert="addJobTemplate"
      @update="updateJobTemplate"
    ></JobTemplateDialog>
    <AuthDialog v-if="isAuthDialogShow" :authList="pipelineData.authList" @close="closeAuthDialog"></AuthDialog>
  </div>
</template>
<script>
import draggable from 'vuedraggable';

export default {
  name: '',
  components: {
    draggable,
    JobTemplateDialog: () => import('./edit-jobtemplate-dialog.vue'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    AuthDialog: () => import('./auth-dialog.vue')
  },
  props: {},
  data() {
    const _this = this;
    return {
      id: null,
      currentJob: null,
      currentGroup: null,
      currentLane: null,
      isLoading: false,
      isJobTemplateDialogShow: false,
      isAuthDialogShow: false,
      pipelineData: {
        type: 'global'
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
            this.$set(this.pipelineData, 'triggerType', val);
            if (val === 'manual') {
              this.$set(this.formConfig.planStartTime, 'isHidden', true);
            } else {
              this.$set(this.formConfig.planStartTime, 'isHidden', false);
            }
          }
        },
        planStartTime: {
          label: this.$t('page.plantime'),
          transfer: true,
          type: 'datetime',
          format: 'yyyy-MM-dd HH:mm',
          desc: this.$t('term.deploy.tasktimelimitfiveminutes'),
          selectableRange: () => {
            const now = new Date().getTime();
            return [now + 5 * 60 * 1000, 0];
          },
          validateList: ['required'],
          onChange: val => {
            this.$set(this.pipelineData, 'planStartTime', val);
          }
        }
      }
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.query['type']) {
      this.pipelineData.type = this.$route.query['type'];
    }
    if (this.$route.query['appSystemId']) {
      this.$set(this.pipelineData, 'appSystemId', parseInt(this.$route.query['appSystemId']));
    }
    if (this.$route.query['id']) {
      this.id = parseInt(this.$route.query['id']);
      this.getPipelineById();
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
    editJob(job) {
      this.currentJob = job;
      this.isJobTemplateDialogShow = true;
    },
    editAuth() {
      this.isAuthDialogShow = true;
    },
    showJobDialog(lane, group) {
      this.currentJob = null;
      this.currentLane = lane;
      this.currentGroup = group;
      this.isJobTemplateDialogShow = true;
    },
    addJob(lane, group, jobTemplateList) {
      if (!group.jobTemplateList) {
        this.$set(group, 'jobTemplateList', []);
      }
      group.jobTemplateList.push(...jobTemplateList);
      //在最后添加一个空group
      if (lane.groupList[lane.groupList.length - 1] == group) {
        lane.groupList.push({ jobTemplateList: [] });
      }
    },
    removeJob(lane, group, job) {
      const index = group.jobTemplateList.findIndex(d => d === job);
      if (index >= 0) {
        group.jobTemplateList.splice(index, 1);
      }
      if (group.jobTemplateList.length == 0 && lane.groupList.length > 1) {
        const gindex = lane.groupList.findIndex(d => d === group);
        if (gindex >= 0) {
          lane.groupList.splice(gindex, 1);
        }
      }
    },
    addLane() {
      if (!this.pipelineData.laneList) {
        this.$set(this.pipelineData, 'laneList', []);
      }
      this.pipelineData.laneList.push({
        groupList: [{ jobTemplateList: [] }]
      });
    },
    addGroup(lane, group) {
      const index = lane.groupList.findIndex(d => d === group);
      if (index >= 0) {
        lane.groupList.splice(index, 0, { jobTemplateList: [] });
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
      const index = this.pipelineData.laneList.findIndex(d => d === lane);
      if (index >= 0) {
        this.pipelineData.laneList.splice(index, 1);
      }
    },
    endDrag() {
      //遍历所有通道，去掉没用的分组
      for (let i = this.pipelineData.laneList.length - 1; i >= 0; i--) {
        const lane = this.pipelineData.laneList[i];
        if (lane.groupList.length == 0 || lane.groupList[lane.groupList.length - 1].jobTemplateList.length > 0) {
          lane.groupList.push({ jobTemplateList: [] });
        }
        for (let g = lane.groupList.length - 1; g >= 0; g--) {
          const group = lane.groupList[g];
          if (group.jobTemplateList.length == 0 && g < lane.groupList.length - 1) {
            lane.groupList.splice(g, 1);
          }
        }
      }
    },
    getPipelineById() {
      if (this.id) {
        this.isLoading = true;
        this.$api.deploy.pipeline.getPipelineById(this.id).then(res => {
          this.pipelineData = res.Return;
          //在每个通道最后都增加一个空组
          this.pipelineData.laneList.forEach(lane => {
            lane.groupList.push({ jobTemplateList: [] });
          });
        }).finally(() => {
          this.isLoading = false;
        });
      }
    },
    updateJobTemplate(jobTemplateData) {
      console.log(JSON.stringify(jobTemplateData, null, 2));
      if (!this.$utils.isEmpty(this.currentGroup)) {
        const index = this.currentGroup.jobTemplateList.findIndex(job => { job.id === jobTemplateData.id || job.uuid === jobTemplateData.uuid; });
        if (index > -1) {
          this.$set(this.currentGroup.jobTemplateList, index, jobTemplateData);
        }
      }
      this.closeJobTemplateDialog();
    },
    addJobTemplate(jobTemplateList) {
      if (jobTemplateList) {
        console.log(JSON.stringify(jobTemplateList, null, 2));
        this.addJob(this.currentLane, this.currentGroup, jobTemplateList);
      }
      this.closeJobTemplateDialog();
    },
    closeJobTemplateDialog() {
      this.isJobTemplateDialogShow = false;
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
        this.pipelineData.authList = authObjList;
      }
    },
    isWaitGroupShow(lane, group) {
      const index = lane.groupList.findIndex(d => d === group);
      if (index > 0 && group.jobTemplateList.length > 0) {
        return true;
      }
      return false;
    },
    isAddGroupShow(lane, group) {
      const index = lane.groupList.findIndex(d => d === group);
      if (group.jobTemplateList.length > 0 && (index == 0 || (index > 0 && lane.groupList[index - 1].jobTemplateList.length > 0))) {
        return true;
      }
      return false;
    },
    save() {
      const form = this.$refs['form'];
      if (!form || form.valid()) {
        const inputName = this.$refs['inputName'];
        if (inputName && inputName.valid()) {
          if (this.jobIdList.length == 0) {
            this.$Message.info(this.$t('term.deploy.atleastaddajob'));
            return fales;
          }
          this.$api.deploy.pipeline.savePipeline(this.pipelineData).then(res => {
            if (res.Status == 'OK') {
              this.pipelineData = res.Return;
              this.$Message.success(this.$t('message.savesuccess'));
              //重新刷新数据时需要在每个通道后面都增加一个空组
              this.pipelineData.laneList.forEach(lane => {
                lane.groupList.push({ jobTemplateList: [] });
              });
            }
          });
        }
      }
    },
    deleteJob() {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.pipelineData.name}),
        'on-ok': vnode => {
          this.$api.deploy.pipeline
            .deletePipeline(this.pipelineData.id).then(res => {
              if (res.Status == 'OK') {
                vnode.isShow = false;
                this.$Message.success(this.$t('message.deletesuccess'));
                this.$router.push({ path: '/pipeline-manage' });
              }
            });
        }
      });
    }
  },
  filter: {},
  computed: {
    canDelete() { //global:全局流水线授权限(PIPELINE_MODIFY)控制;  appsystem:应用流水线不授权限(PIPELINE_MODIFY)控制
      if ((this.$AuthUtils.hasRole(['PIPELINE_MODIFY']) || (this.pipelineData.type === 'appsystem')) && this.pipelineData.id && this.pipelineData.reviewStatus !== 'waiting') {
        return true;
      }
      return false;
    },
    canEdit() {
      if ((this.$AuthUtils.hasRole(['PIPELINE_MODIFY']) || (this.pipelineData.type === 'appsystem')) && (!this.pipelineData.id || this.pipelineData.reviewStatus !== 'waiting')) {
        return true;
      }
      return false;
    },
    jobIdList() {
      const idList = [];
      if (this.pipelineData.laneList && this.pipelineData.laneList.length > 0) {
        this.pipelineData.laneList.forEach(lane => {
          if (lane.groupList && lane.groupList.length > 0) {
            lane.groupList.forEach(group => {
              if (group.jobTemplateList && group.jobTemplateList.length > 0) {
                group.jobTemplateList.forEach(job => {
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
    right: 0px;
    top: 0px;
  }
  .edit-job-btn{
    visibility: hidden;
    position: absolute;
    right: 20px;
    top: 0px;
  }
}
.job-container:hover {
  .remove-job-btn,.edit-job-btn {
    visibility: visible;
  }
}
</style>
