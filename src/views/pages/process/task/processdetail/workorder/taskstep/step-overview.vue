<template>
  <div class="step-overview-container">
    <div class="step-left-margin mb-md" :class="expandAll ? ' pr-nm' : 'pr-18'" @click="expandAll = !expandAll">
      <span :class="expandAll ? 'tsfont-down' : 'tsfont-right'" class="text-href">{{ expandAll?$t('page.putawayall'):$t('page.expandall') }}</span>
    </div>
    <div class="activity-step">
      <Timeline>
        <TimelineItem v-for="(item, index) of stepData" :key="index">
          <div class="step-title">
            <div class="header-info-box parent">
              <CommonStatus
                v-if="item.statusVo"
                :statusName="item.statusVo.text"
                :statusValue="item.statusVo.status"
                class="step-status"
              ></CommonStatus>
              <div
                class="child-node-name cursor"
                :class="!item.expand ? 'child-node-name-wrap' : ''"
                :title="item.name"
                @click="expandChange(item, index)"
              >
                <span :class="item.expand ? 'tsfont-down' : 'tsfont-right'" class="overflow node-name icon-right">{{ item.name }}</span>
              </div>
              <div class="user-header-wrap ml-sm mr-sm">
                <UserCard
                  v-if="item.majorUser && item.majorUser.userVo"
                  v-bind="item.majorUser.userVo"
                  :iconSize="24"
                ></UserCard>
                <div v-else-if="item.workerList && item.workerList.length == 1">
                  <UserCard
                    v-for="userItem in item.workerList"
                    :key="userItem.workerValue"
                    v-bind="userItem.worker"
                    :iconSize="24"
                  ></UserCard>
                </div>
                <span v-if="!hasUnassigned(item)" class="text-tip ml-sm" :class="(item.startTime || item.endTime) ? 'mr-sm' : ''">
                  {{ $t('term.process.unassigned') }}
                </span>
                <div v-if="item.startTime || item.endTime" :class="hasUnassigned(item) ? 'ml-sm' : ''">
                  <span v-if="item.startTime"> {{ item.startTime | formatDate }}&nbsp;-&nbsp;</span>
                  <span v-if="item.endTime">{{ item.endTime | formatDate }}</span>
                </div>
              </div>
              <!-- 工单状态=【已取消】时，不显示时效 -->
              <SlaTime v-if="item.slaTimeList && getOvertimeList(item.slaTimeList).length && item.status != 'succeed' && processTaskConfig.status != 'aborted'" :slaTimeList="getOvertimeList(item.slaTimeList)"></SlaTime>
            </div>

            <div v-if="isTabShow(item)" class="parent"></div>
            <ButtonGroup
              v-if="item.expand && isTabShow(item)"
              shape="circle"
              size="small"
              class="child-button"
            >
              <Button :type="!item.isShow?'primary':'default'" @click="item.isShow = false">
                <span :class="item.isShow?'text-action': ''"> {{ $t('page.action') }}</span>
              </Button>
              <Button
                v-if="item.taskConfigList && getTaskConfigList(item.taskConfigList).length > 0"
                :type="item.isShow == 1?'primary':'default'"
                @click="item.isShow = 1"
              >
                <span :class="item.isShow == 1?'':'text-action'"> {{ $t('term.process.subtask') }}</span>
              </Button>
              <Button
                v-if="item.handlerStepInfo && item.handlerStepInfo.changeStepList && item.handlerStepInfo.changeStepList.length>0"
                :type="item.isShow == 2?'primary':'default'"
                @click="item.isShow = 2"
              >
                <span :class="item.isShow == 2?'':'text-action'"> {{ $t('term.process.changedetail') }}</span>
              </Button>
            </ButtonGroup>
          </div>
          <div v-show="item.expand">
            <div :class="item.isView != 1 ? 'hide-step' : ''">
              <div v-show="!item.isShow" class="step-comment" :class="!isTabShow(item) ? 'mt-md' : '' ">
                <div v-if="item.handler == 'autoexec' && item.handlerStepInfo" class="sub-description border-color">
                  <JobDetail :handlerStepInfo="item.handlerStepInfo"></JobDetail>
                </div>
                <div v-else class="description step-auditList">
                  <stepitems
                    :is="getSteptype(item)"
                    :item="item"
                  ></stepitems>
                </div>
              </div>
              <!-- 子任务策略节点 -->
              <div v-show="item.isShow == 1" class="sub-description border-color padding" :class="!isTabShow(item) ? 'mt-md' : '' ">
                <div v-if="item.taskConfigList && getTaskConfigList(item.taskConfigList).length > 0">
                  <Tabs                  
                    class="block-span"
                    :animated="false"
                    name="tab2"
                  >
                    <TabPane      
                      v-for="subStep in getTaskConfigList(item.taskConfigList)"
                      :key="subStep.id"   
                      :label="subStep.name"
                      :name="'subTask' + subStep.id"
                      tab="tab2"
                    >
                      <StrategyDetailReadonly
                        :processTaskId="processTaskId"
                        :processTaskStepId="processTaskStepId"
                        :config="subStep"
                      ></StrategyDetailReadonly>
                    </TabPane>
                  </Tabs>
                </div>
              </div>
              <div v-show="item.isShow == 2" class="sub-description border-color pb-sm" :class="!isTabShow(item) ? 'mt-md' : '' ">
                <div v-if="item.handlerStepInfo && item.handlerStepInfo.changeStepList && item.handlerStepInfo.changeStepList.length>0">
                  <div v-for="change in item.handlerStepInfo.changeStepList" :key="change.id" class="step-auditList sub-list dividing-color">
                    <div class="padding">
                      <div class="pb-sm flex-between">
                        <div>
                          <span class="step-handler-icon" :class="item.handler =='changecreate'?'tsfont-addchange':'tsfont-changing'"></span>
                          <span>{{ change.name }}</span>
                          <span class="text-grey">.{{ change.code }}</span>
                        </div>
                        <CommonStatus
                          v-if="change.statusVo"
                          :statusName="change.statusVo.text"
                          :statusValue="change.statusVo.status"
                        ></CommonStatus>
                      </div>
                      <div class="step-infor">
                        <TsRow>
                          <Col span="8">
                            <span class="text-grey" style="padding-right:10px">{{ $t('term.process.dealwithuser') }}</span>
                            <span>
                              <UserCard v-bind="change.workerVo" style="display: inline-block;" hideAvatar></UserCard>
                            </span>
                          </Col>
                          <Col span="8">
                            <span class="text-grey" style="padding-right:10px">{{ $t('term.process.planstartdate') }}</span>
                            <span>{{ change.planStartDate || '-' }}</span>
                          </Col>
                          <Col span="8">
                            <span class="text-grey" style="padding-right:10px">{{ $t('term.process.startTimeWindow') }}</span>
                            <span v-if="change.startTimeWindow || change.endTimeWindow">{{ change.startTimeWindow || '~' }} - {{ change.endTimeWindow || '~' }}</span>
                            <span v-else>-</span>
                          </Col>
                        </TsRow>
                        <TsRow>
                          <Col span="8">
                            <span class="text-grey" style="padding-right:10px">{{ $t('term.process.actualstarttime') }}</span>
                            <span v-if="change.startTime">{{ change.startTime | formatDate }}</span>
                            <span v-else>-</span>
                          </Col>
                          <Col span="8">
                            <span class="text-grey" style="padding-right:10px">{{ $t('term.process.actualendtime') }}</span>
                            <span v-if="change.endTime">{{ change.endTime | formatDate }}</span>
                            <span v-else>-</span>
                          </Col>
                        </TsRow>
                        <div class="change-commet">
                          <span class="change-commet-label text-grey" style="padding-right:10px">{{ $t('page.accessory') }}</span>
                          <div v-if="change.fileList && change.fileList.length>0">
                            <div
                              v-for="changeFile in change.fileList"
                              :key="changeFile.id"
                              v-download="downurl('/api/binary/file/download',changeFile.id)"
                              class="text-action"
                            >
                              {{ changeFile.name }}
                              <i class="tsfont-download text-padding"></i>
                            </div>
                          </div>
                          <div v-else>-</div>
                        </div>
                        <div class="change-commet">
                          <span class="change-commet-label text-grey" style="padding-right:10px">{{ $t('page.description') }}</span>
                          <div v-if="change.content">
                            <div v-html="change.content"></div>
                          </div>
                          <div v-else>-</div>
                        </div>
                      </div>
                    </div>

                    <div class="ml-40">
                      <Timeline>
                        <TimelineItem
                          v-for="scomment in change.commentList"
                          :key="scomment.id"
                          class="comment-list"
                        >
                          <div class="avatar-date-box ">
                            <div class="avatar-box inb pb-xs">
                              <UserCard v-bind="scomment.fcuVo" class="user-name parent" hideAvatar></UserCard>
                              <UserCard
                                v-bind="scomment.fcuVo"
                                class="avatar child-avatar"
                                :iconSize="24"
                                hideName
                              ></UserCard>
                            </div>
                            <div class="text-grey ml-md inb">{{ scomment.fcd | formatDate }}</div>
                          </div>
                          <div style="margin-left:20px;" v-html="scomment.content"></div>
                        </TimelineItem>
                      </Timeline>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TimelineItem>
      </Timeline>
    </div>
  </div>

</template>
<script>
import download from '@/resources/directives/download.js';
import stepitems from './item/index.js';
export default {
  name: 'StepOverview',
  components: {
    ...stepitems,
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    CommonStatus: resolve => require(['@/resources/components/Status/CommonStatus.vue'], resolve),
    StrategyDetailReadonly: resolve => require(['../strategy/strategy-detail-readonly.vue'], resolve),
    JobDetail: resolve => require(['@/views/pages/process/task/processdetail/workorder/autoexec/job-detail.vue'], resolve),
    SlaTime: resolve => require(['./sla-time.vue'], resolve)
  },
  directives: { download },
  props: {
    processTaskId: [String, Number], //工单id
    processTaskStepId: [String, Number], //工单步骤id
    defaultStepData: {
      type: Array,
      default: () => []
    },
    currentStepId: {
      type: [String, Number]
    },
    processTaskConfig: {
      type: Object
    }
  },
  data() {
    return {
      stepData: [],
      selectStepId: 0, // 0代表所有步骤
      expandAll: true
    };
  },
  mounted() {},
  created() {
    this.stepData.forEach((step) => {
      Object.assign(step, {
        expand: true
      });
    });
    this.expandAll = true;
  },
  methods: {
    expandChange(item, index) {
      this.$set(item, 'expand', !item.expand);
      this.$set(this.stepData, index, item);
      let trueList = this.stepData.filter(item => item.expand);
      let falseList = this.stepData.filter(item => !item.expand);
      if (trueList.length && !falseList.length) {
        this.expandAll = true;
      }
      if (falseList.length && !trueList.length) {
        this.expandAll = false;
      }
    },
    selectStep(stepConfig) {
      this.selectStepId = stepConfig.id;
    },
    getTaskConfigList(list) { //子任务策略，权限过滤
      let arr = [];
      if (list && list.length > 0) {
        list.forEach(item => {
          if (item.processTaskStepTaskList && item.processTaskStepTaskList.length > 0) {
            arr.push(item);
          }
        });
      }
      return arr;
    }
  },
  computed: {
    downurl() {
      return function(url, param) {
        return {
          url: url,
          params: { id: param }
        };
      };
    },
    getSteptype() {
      return function(item) {
        let type = '';
        let handler = item.handler;
        if (!stepitems[handler]) {
          type = 'stepLogCommon';
        } else {
          type = handler;
        }
        return type;
      };
    },
    replaceableText() {
      return function(name, replaceableTextList, textName) {
        let text = textName;
        let obj = replaceableTextList.find(i => i.name == name);
        if (obj) {
          text = obj.value || obj.text;
        }
        return text;
      };
    },
    isTabShow() {
      return (item) => {
        return (item.taskConfigList && this.getTaskConfigList(item.taskConfigList).length > 0) || (item.handlerStepInfo && item.handlerStepInfo.changeStepList && item.handlerStepInfo.changeStepList.length > 0);
      };
    },
    getOvertimeList() {
      return (slaTimeList) => {
        let list = [];
        if (slaTimeList && slaTimeList.length) {
          slaTimeList.forEach(item => {
            if (item.status != 'done' || (item.status == 'done' && item.timeLeft < 0)) {
              list.push(item);
            }
          });
        }
        return list;
      };
    },
    hasUnassigned() {
      // 是否有分配处理人
      return (item) => {
        let hasHandlerMan = false;
        if (((item.majorUser && item.majorUser.userVo) || (item.workerList && item.workerList.length == 1))) {
          hasHandlerMan = true;
        }
        return hasHandlerMan;
      };
    }
  },
  watch: {
    defaultStepData: {
      handler(val) {
        if (val && val.length > 0) {
          this.stepData = val;
        }
      },
      deep: true,
      immediate: true
    },
    expandAll: {
      handler(val) {
        this.stepData.forEach((item, index) => {
          this.$set(item, 'expand', val);
          this.$set(this.stepData, index, item);
        });
      }
    }
  }
};
</script>
<style lang='less' scoped>
.step-overview-container {
  overflow: hidden;
  .step-left-margin {
    display: inline-block;
    width: 150px;
    text-align: right;
    &.pr-18 {
      padding-right: 18px; // 处理收起之后，右边不对齐问题
    }
  }
  /deep/ .activity-step {
  margin-left: 150px;
  .step-log-common-box {
   .ivu-timeline-item-tail {
      display: inline-block !important;
    }
    .ivu-timeline-item:last-child {
      .ivu-timeline-item-tail {
      display: none !important;
    }
    }
  }
  .header-info-box {
    display: flex;
    align-items: center;
  }
  .user-header-wrap {
    display: flex;
    align-items: center;
  }
  .parent{
  position: relative;
}
.child-button{
  position: absolute;
  top:-5px;
  right:0;
}
.child-node-name{
  position: absolute;
  top: 2px;
  left: -174px;
  width: 150px;
  padding-right: 16px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  text-align: right;
  &.child-node-name-wrap {
    display: flex;
  }
  .node-name {
    display: inline-block;
    width: 97%;
  }
  .child-avatar{
    position: absolute;
    top: 0px;
    left: -5px;
  }
 }
  .ml-40{
    margin-left:40px;
  }
  .step-handler-icon {
    display: inline-block;
    margin-right: 2px;
    font-size: 19px;
  }
  .change-commet {
    position: relative;
    padding-left: 50px;
    .change-commet-label {
      position: absolute;
      top: 0;
      left: 0;
    }
  }
  .activity-box-list{
    /deep/ .image > img {
      max-width: 100%;
    }
  }
  .step-infor {
    padding-left: 21px;
    >div{
      &:not(:last-child) {
        padding-bottom: 10px;
      }
    }
  }
  .hide-step {
    filter: blur(4px);
  }
  .sub-content{
    padding-top: 10px;
  }
  .comment-list {
    .avatar-date-box {
      padding-left: 20px;
      .avatar-box {
      .avatar {
        display: inline-block;
        margin-bottom: 4px;
        margin-right: 0;
      }
      }
    }
  }
  .inb{
    display: inline-block;
  }
}
}

</style>
