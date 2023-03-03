<template>
  <div class="activity-step">
    <div class="step-left">
      <!-- <span class="ts-angle-up left-btn-step" v-if="stepData.length>1"></span> -->
      <ul>
        <li class="item-li" :class="{active: selectStepId === 0}" @click="selectStepId = 0">
          <div class="item-li-dot"></div>
          <div class="item-li-content">
            全部
          </div>
        </li>
        <li
          v-for="(item, index) of stepData"
          :key="index"
          class="item-li"
          :class="{'active': item.id == selectStepId}"
          :title="item.id == currentStepId ? '当前步骤' : ''"
          @click.stop="selectStep(item)"
        >
          <div v-if="item.id==currentStepId" class="item-li-current tsfont-location"></div>
          <div v-else class="item-li-dot"></div>
          <div class="item-li-content">
            <div class="overflow" :title="item.name">{{ item.name }}</div>
            <CommonStatus
              v-if="item.statusVo"
              :statusName="item.statusVo.text"
              :statusValue="item.statusVo.status"
              type="text"
              class="fz10"
            ></CommonStatus>
          </div>
        </li>
      </ul>
      <!-- <span class="ts-angle-down right-btn-step" v-if="stepData.length>1"></span> -->
    </div>
    <div class="step-right">
      <div
        v-for="(item, index) of stepData"
        v-show="selectStepId ===0 || selectStepId == item.id"
        :key="index"
        class="step-right-list mb-lg"
      >
        <div class="step-title">
          <div class="name-box">
            <CommonStatus
              v-if="item.statusVo"
              :statusName="item.statusVo.text"
              :statusValue="item.statusVo.status"
              class="step-status"
            ></CommonStatus>
            <span class="name overflow" :title="item.name">{{ item.name }}</span>
            <span v-if="item.slaTimeList && getOvertimeList(item.slaTimeList).length" class="pl-sm sla-time">
              <SlaTime :slaTimeList="getOvertimeList(item.slaTimeList)"></SlaTime>
            </span>
          </div>
          <div style="display: flex;align-items: flex-start;">
            <div>
              <UserCard
                v-if="item.majorUser && item.majorUser.userVo"
                v-bind="item.majorUser.userVo"
                :iconSize="24"
              ></UserCard>
              <div v-else-if="item.workerList && item.workerList.length == 1" class="worker-list-box">
                <UserCard
                  v-for="userItem in item.workerList"
                  :key="userItem.workerValue"
                  v-bind="userItem.worker"
                  :iconSize="24"
                ></UserCard>
              </div>
              <span class="text-tip handle-man-text">{{ ((item.majorUser && item.majorUser.userVo) || (item.workerList && item.workerList.length == 1)) ? '' : '未分派' }}</span>
              
            </div>
            <Poptip
              v-model="item.isShowPoptip"
              placement="left"
              transfer
              width="250"
            >
              <span class="text-action text-more pl-sm" :class="((item.majorUser && item.majorUser.userVo) || (item.workerList && item.workerList.length == 1)) ? '' : 'text-more-mt'" @click.stop="openPoptip(item)">...</span>
              <ul slot="content">
                <li>
                  <span class="text-grey pr-xs">激活时间</span>
                  <span v-if="item.activeTime" :title="item.activeTime | formatDate">
                    {{ item.activeTime | formatDate }}
                  </span>
                  <span v-else>-</span>
                </li>
                <li>
                  <span class="text-grey pr-xs">开始时间</span>
                  <span v-if="item.startTime" :title="item.startTime | formatDate">
                    {{ item.startTime | formatDate }}
                  </span>
                  <span v-else>-</span>
                </li>
                <li>
                  <span class="text-grey pr-xs">结束时间</span>
                  <span v-if="item.endTime" :title="item.endTime | formatDate">
                    {{ item.endTime | formatDate }}
                  </span>
                  <span v-else>-</span>
                </li>
                <li v-if="item.handler =='event' && item.handlerStepInfo">
                  <span class="text-grey pr-xs">归档类型</span>
                  <span class="time-date">
                    {{ item.handlerStepInfo.eventTypeNamePath || '-' }}
                  </span>
                </li>
              </ul>
            </Poptip>
          </div>
        </div>
        <div v-if="isTabShow(item)" class="step-toggle mt-md">
          <div
            class="btn-toggle text-action pl-md pr-md"
            :class="!item.isShow ? 'active' : ''"
            @click="item.isShow = false"
          >
            <div class="tab-box">
              <span class="tab-text" :class="!item.isShow ? 'tab-text-active' : ''">操作</span>
              <div v-if="!item.isShow" class="tabs-ink-bar"></div>
            </div>
          </div>
          <div
            v-if="item.taskConfigList && getTaskConfigList(item.taskConfigList).length > 0"
            class="btn-toggle text-action"
            :class="item.isShow == 1 ? 'active' : ''"
            @click="item.isShow = 1"
          >
            <div class="tab-box">
              <span class="tab-text" :class="item.isShow == 1 ? 'tab-text-active' : ''">子任务策略</span>
              <div v-if="item.isShow == 1" class="tabs-ink-bar"></div>
            </div>
          </div>
          <div
            v-if="item.handlerStepInfo && item.handlerStepInfo.changeStepList && item.handlerStepInfo.changeStepList.length>0"
            class="btn-toggle text-action"
            :class="item.isShow ==2? 'active' : ''"
            @click="item.isShow = 2"
          >
            <div class="tab-box">
              <div>
                <span class="tab-text" :class="item.isShow == 2 ? 'tab-text-active' : ''">变更步骤</span>
                <span class="sub-number">{{ item.handlerStepInfo.changeStepList.length }}</span>
              </div>
              <div v-if="item.isShow == 2" class="tabs-ink-bar"></div>
            </div>
          </div>
          <!-- <div
            v-if="item.handlerStepInfo && item.handlerStepInfo.phaseList "
            class="btn-toggle text-action"
            :class="item.isShow ==3? 'active' : ''"
            @click="item.isShow = 3"
          >
            <span>作业</span>
            <div v-if="item.isShow == 3" class="tabs-ink-bar"></div>
          </div> -->
        </div>
        <div :class="item.isView != 1 ? 'hide-step' : ''">
          <div v-show="!item.isShow" class="step-comment" :class="!isTabShow(item) ? 'mt-md' : '' ">
            <div v-if="item.handler == 'autoexec' && item.handlerStepInfo" class="sub-description border-color padding">
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
                        <span class="text-grey" style="padding-right:10px">处理人</span>
                        <span>
                          <UserCard v-bind="change.workerVo" style="display: inline-block;" hideAvatar></UserCard>
                        </span>
                      </Col>
                      <Col span="8">
                        <span class="text-grey" style="padding-right:10px">计划开始时间</span>
                        <span>{{ change.planStartDate || '-' }}</span>
                      </Col>
                      <Col span="8">
                        <span class="text-grey" style="padding-right:10px">时间窗口</span>
                        <span v-if="change.startTimeWindow || change.endTimeWindow">{{ change.startTimeWindow || '~' }} - {{ change.endTimeWindow || '~' }}</span>
                        <span v-else>-</span>
                      </Col>
                    </TsRow>
                    <TsRow>
                      <Col span="8">
                        <span class="text-grey" style="padding-right:10px">实际开始时间</span>
                        <span v-if="change.startTime">{{ change.startTime | formatDate }}</span>
                        <span v-else>-</span>
                      </Col>
                      <Col span="8">
                        <span class="text-grey" style="padding-right:10px">实际结束时间</span>
                        <span v-if="change.endTime">{{ change.endTime | formatDate }}</span>
                        <span v-else>-</span>
                      </Col>
                    </TsRow>
                    <div class="change-commet">
                      <span class="change-commet-label text-grey" style="padding-right:10px">附件</span>
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
                      <span class="change-commet-label text-grey" style="padding-right:10px">描述</span>
                      <div v-if="change.content">
                        <div v-html="change.content"></div>
                      </div>
                      <div v-else>-</div>
                    </div>
                  </div>
                </div>
                <div
                  v-for="scomment in change.commentList"
                  :key="scomment.id"
                  class="comment-list"
                >
                  <div class="avatar-date-box">
                    <div class="avatar-box">
                      <UserCard
                        v-bind="scomment.fcuVo"
                        class="avatar"
                        :iconSize="24"
                        hideName
                      ></UserCard>
                      <UserCard v-bind="scomment.fcuVo" class="user-name" hideAvatar></UserCard>
                    </div>
                    <div>
                      <div class="text-grey pb-xs date-text">{{ scomment.fcd | formatDate }}</div>
                      <div v-html="scomment.content"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
    // TsAvatar: resolve => require(['components/TsAvatar/TsAvatar'], resolve),
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
      selectStepId: 0 // 0代表所有步骤
    };
  },
  methods: {
    openPoptip(item) {
      this.$set(item, 'isShowPoptip', !item.isShowPoptip);
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
    }
  }
};
</script>
<style lang='less' scoped>
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
.text-more {
  display: inline-block;
  font-size: 20px;
  margin-top: -8px;
}
.text-more-mt {
  margin-top: -12px;
}
.comment-list {
  .avatar-date-box {
    display: flex;
    padding-left: 37px;
    .avatar-box {
      display: flex;
      flex-direction: column;
      align-items: center;
    .avatar {
      display: inline-block;
      margin-bottom: 4px;
      margin-right: 0;
     }
    }
    .date-text {
      display: inline-block;
      margin-top: 2px;
    }
  }
}
.sla-time {
  display: inline-block;
}
</style>
