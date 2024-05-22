
<template>
  <div class="process-right pt-nm">
    <Loading :loadingShow="rightLoading" type="fix"></Loading>
    <div v-if="processTaskConfig.statusVo" class="task-status">
      <CommonStatus
        v-if="processTaskConfig.statusVo"
        :statusValue="processTaskConfig.statusVo.status"
        :statusName="processTaskConfig.statusVo.text"
        type="tag"
      ></CommonStatus>
    </div>

    <div ref="rightMain" class="right-setting" :style="setContentHeight(rightHeight)">

      <!-- 步骤 -->
      <StepCarousel></StepCarousel>

      <!-- 上报人 -->
      <div v-if="processTaskConfig.ownerVo" class="information-box">
        <div class="bg-op padding radius-lg">
          <div class="h4 cursor" :class="showInfomant ? 'pb-nm' : ''" @click="showInfomant = !showInfomant">
            <span :class="showInfomant ? 'tsfont-down' : 'tsfont-right'" class="icon-right">{{ $t('page.informant') }}</span>
          </div>
          <div v-show="showInfomant">
            <div v-if="processTaskConfig.ownerVo" class="information-list">
              <div class="infor-left"> <UserCard :uuid="processTaskConfig.ownerVo.uuid" :iconSize="32" hideName></UserCard></div>
              <div class="infor-right">
                <div>
                  <UserCard
                    v-bind="processTaskConfig.ownerVo"
                    :nameLength="11"
                    hideAvatar
                    :hideStatusIcon="true"
                  ></UserCard>
                </div>
                <div class="text-grey">{{ processTaskConfig.ownerVo.userId }}</div>
              </div>
            </div>
            <div v-if="processTaskConfig.ownerVo" class="information-list">
              <div class="infor-left text-grey overflow">{{ $t('page.userteam') }}</div>
              <div class="infor-right">
                <template v-if="processTaskConfig.ownerVo.teamList && processTaskConfig.ownerVo.teamList.length > 0">
                  <Tooltip
                    v-for="item in processTaskConfig.ownerVo.teamList"
                    :key="item.id"
                    :max-width="600"
                    theme="light"
                    placement="top"
                    class="pb-sm usergroup-box"
                  >
                    <div class="overflow usergroup-name">{{ item.name }}</div>
                    <div slot="content">
                      <p>{{ item.upwardNamePath }}</p>
                    </div>
                  </Tooltip>
                </template>
                <template v-else>-</template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 基本信息 -->
      <div class="information-box">
        <div class="bg-op padding radius-lg">
          <div class="h4 cursor" :class="showBasic ? 'pb-nm' : ''" @click="showBasic = !showBasic">
            <span :class="showBasic ? 'tsfont-down' : 'tsfont-right'" class="icon-right">{{ $t('page.basicinfo') }}</span>
          </div>
          <div v-show="showBasic">
            <div v-for="(item, index) of taskInformationList" :key="index">
              <div class="information-list">
                <template v-if="item.value == 'serialNumber'">
                  <div class="infor-left text-grey overflow">{{ item.title }}</div>
                  <div class="infor-right">
                    <div v-clipboard="item.textConfig" class="task-id" @click="$Message.success($t('message.copysuccess'))">
                      {{ item.textConfig }}
                      <i class="tsfont-copy text-action"></i>
                    </div>
                  </div>
                </template>
                <template v-else-if="item.value == 'reporterVo'">
                  <div class="infor-left text-grey overflow">{{ item.title }}</div>
                  <div class="infor-right">
                    <UserCard v-bind="processTaskConfig.reporterVo" :iconSize="16"></UserCard>
                  </div>
                </template>
                <template v-else-if="item.value == 'channelPath'">
                  <div class="infor-left text-grey overflow">{{ item.title }}</div>
                  <div class="infor-right">
                    <span v-if="processTaskConfig.channelType" class="channel-type" :style="typeTip(processTaskConfig.channelType.color)">{{ processTaskConfig.channelType.name }}</span>
                    <span>{{ item.textConfig }}</span>
                  </div>
                </template>
                <template v-else-if="item.value == 'priority'">
                  <div class="infor-left text-grey overflow">{{ item.title }}</div>
                  <div
                    v-if="!actionConfig.update"
                    ref="priorityName"
                    class="infor-right"
                    :style="{ color: item.textConfig.color }"
                  >
                    {{ item.textConfig.name || '-' }}
                  </div>
                  <div v-if="actionConfig.update" id="priority" class="infor-right input-border">
                    <TsFormSelect
                      ref="priority"
                      v-model="item.textConfig.uuid"
                      :dataList="priorityList"
                      valueName="uuid"
                      textName="name"
                      size="small"
                      transfer
                      :validateList="['required']"
                      :clearable="false"
                      @on-change="changePriority"
                    ></TsFormSelect>
                  </div>
                </template>
                <template v-else-if="timeShow(item.value)">
                  <div class="infor-left text-grey overflow">{{ item.title }}</div>
                  <div class="infor-right">{{ item.textConfig | formatDate }}</div>
                </template>
                <template v-else>
                  <div class="infor-left text-grey overflow">{{ item.title }}</div>
                  <div class="infor-right">{{ item.textConfig }}</div>
                </template>
              </div>
            </div>
            <div class="information-list clearfix">
              <div class="infor-left text-grey overflow">
                {{ $t('page.tag') }}
              </div>
              <div class="infor-right">
                <WorkLabel
                  :showLogo="false"
                  :list="tagVoList"
                  :canUpdate="!!actionConfig.update"
                  @del="updateTagList"
                  @add="updateTagList"
                ></WorkLabel>
              </div>
            </div>
            <div class="information-list clearfix">
              <div class="infor-left text-grey overflow">{{ $t('term.process.focususer') }}</div>
              <div class="infor-right">
                <UserSelect
                  :value="processTaskConfig.focusUserUuidList"
                  transfer
                  :groupList="['user']"
                  border="border"
                  :readonly="!processTaskConfig.canEditFocusUser"
                  @change="updateFocusUserList"
                />
              </div>
            </div>
            <div v-if="knowledgeConfig && knowledgeConfig.knowledgeDocumentVersion" class="information-list knowledge-box">
              <div class="infor-left text-grey overflow">{{ $t('term.process.relatedknowledge') }}</div>
              <div class="infor-right">
                <div :class="knowledgeConfig.knowledgeDocumentVersion.status == 'passed' ? 'text-href' : ''" class="time-height" @click="gotoKnowledge(knowledgeConfig.knowledgeDocumentVersion.status)">
                  <span>{{ knowledgeConfig.knowledgeDocumentVersion.title }}</span>
                  <span v-if="knowledgeConfig.knowledgeDocumentVersion.status != 'passed'" class="knowledge-style">
                    <CommonStatus
                      :statusValue="knowledgeConfig.knowledgeDocumentVersion.statusVo.value"
                      :statusName="knowledgeConfig.knowledgeDocumentVersion.statusVo.text"
                    ></CommonStatus>
                  </span>
                </div>
                <div v-if="knowledgeConfig.knowledgeDocumentVersion.status == 'submitted'" class="text-tip fz10">
                  <UserCard v-bind="knowledgeConfig.knowledgeDocumentVersion.lcuVo" :iconSize="16" style="vertical-align: bottom;"></UserCard>
                  {{ knowledgeConfig.knowledgeDocumentVersion.lcd | formatDate }} {{ $t('page.submit') }}
                </div>
                <div v-else class="text-tip fz10 overflow" :title="getpath(knowledgeConfig.knowledgeDocumentVersion.path)">
                  {{ getpath(knowledgeConfig.knowledgeDocumentVersion.path) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 评分 -->
      <div v-if="processTaskConfig.scoreInfo" class="information-box">
        <div class="bg-op padding radius-lg">
          <div
            class="h4 cursor"
            :class="showScore ? 'pb-nm' : ''"
            @click="showScore = !showScore"
          >
            <span :class="showScore ? 'tsfont-down' : 'tsfont-right'" class="icon-right">{{ $t('page.score') }}</span>
          </div>
          <div v-show="showScore">
            <ScoreDisplay :scoreConfig="JSON.parse(processTaskConfig.scoreInfo)"></ScoreDisplay>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import clipboard from '@/resources/directives/clipboard.js';
import StepCarousel from './step-carousel.vue';
export default {
  name: '',
  components: {
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    CommonStatus: () => import('@/resources/components/Status/CommonStatus.vue'),
    WorkLabel: () => import('./label/label'),
    UserSelect: () => import('components/UserSelect/UserSelect.vue'),
    ScoreDisplay: () => import('./score/score-display.vue'),
    StepCarousel
  },
  directives: {
    clipboard
  },
  filters: {},
  props: {
    processTaskConfig: Object, //工单基本信息
    actionConfig: Object, //权限按钮
    addAssist: {
      type: Function,
      default: null
    },
    knowledgeConfig: {
      //知识详情
      type: Object,
      default: null
    },
    replaceableTextConfig: Object, //文案替换
    isOrderRight: Boolean,
    priorityList: {//优先级列表
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      slaUpdateTimer: null,
      rightLoading: true,
      processTaskId: null, //工单id
      processTaskStepId: null, //步骤id
      currentProcessTaskStep: null,
      priorityUuid: null, //优先级id
      channelUuid: null, //服务id
      tagVoList: [],
      taskInformationList: [], //工单信息（基本信息）
      defaultProcessTask: [
        //基本信息
        {
          title: this.$t('page.workordernumber'),
          value: 'serialNumber',
          textConfig: null
        },
        {
          title: this.$t('term.process.sourcename'),
          value: 'sourceName',
          textConfig: null
        },
        {
          title: this.$t('page.reportingtime'),
          value: 'startTime',
          textConfig: null
        },
        {
          title: this.$t('term.process.proxy'),
          value: 'reporterVo',
          textConfig: null
        },
        {
          title: this.$t('term.process.reportcatalog'),
          value: 'channelPath',
          textConfig: null
        },
        {
          title: this.$t('page.priority'),
          value: 'priority',
          textConfig: null
        },

        {
          title: this.$t('page.completetime'),
          value: 'endTime',
          textConfig: null
        },
        {
          title: this.$t('page.timecost'),
          value: 'timeCostStr',
          textConfig: null
        },
        {
          title: this.$t('term.process.expiretime'),
          value: 'expireTime',
          textConfig: null
        }
        // {
        //   title: '工单状态',
        //   value: 'statusVo',
        //   textConfig: null
        // }
      ],
      rightHeight: '200px',
      priorityConfig: null, //优先级
      showInfomant: true,
      showBasic: true,
      showScore: true
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.initializeData();
    this.$store.dispatch('setTimer');
    this.$nextTick(() => {
      this.initRightHeight();
      window.addEventListener('resize', this.initRightHeight);
    });
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    this.$store.commit('clearTimer');
    this.$store.commit('setTaskExpire', false);
    window.removeEventListener('resize', this.initRightHeight);
    if (this.slaUpdateTimer) {
      clearTimeout(this.slaUpdateTimer);
      this.slaUpdateTimer = null;
    }
  },
  destroyed() {},
  methods: {
    getSlaStatus(type, expireTime) {
      let statusObj = {
        'doing': (this.$utils.getDateByFormat(expireTime)) + this.$t('term.process.deadline'),
        'done': this.$t('page.completed'),
        'pause': this.$t('page.paused')
      };
      return statusObj[type] || '';
    },
    initializeData() {
      //初始化数据
      this.taskInformationList.splice(0);
      let processTaskConfig = this.processTaskConfig;
      this.processTaskId = processTaskConfig.id;
      this.channelUuid = processTaskConfig.channelUuid;
      let processTaskArr = [];
      if (processTaskConfig.tagVoList && processTaskConfig.tagVoList.length > 0) {
        this.tagVoList = processTaskConfig.tagVoList.map(item => item && item.name);
      }
      if (processTaskConfig.ownerVo && processTaskConfig.reporterVo && processTaskConfig.ownerVo.name == processTaskConfig.reporterVo.name) {
        delete processTaskConfig.reporterVo;
      }
      this.defaultProcessTask.forEach((item, index) => {
        if (processTaskConfig[item.value]) {
          if (item.value == 'priority' && this.processTaskConfig.hasOwnProperty('isNeedPriority') && !this.processTaskConfig.isNeedPriority) {
            item.textConfig = null;
          } else {
            item.textConfig = processTaskConfig[item.value];
            processTaskArr.push(item);
          }
        }
      });
      this.taskInformationList = processTaskArr;
      if (processTaskConfig.currentProcessTaskStep) {
        let processTaskStepConfig = processTaskConfig.currentProcessTaskStep;
        this.currentProcessTaskStep = processTaskConfig.currentProcessTaskStep;
        this.handler = this.currentProcessTaskStep.handler;
        this.processTaskStepId = processTaskStepConfig.id;
      }
      this.rightLoading = false;
    },
    setPriorityByForm(list) {
      //如果list存在则通过list赋值过去 ，list 主要是为了表单规则时修改优先级下拉数据
      //this.priorityList = list;
      let _this = this;
      let priority = null;//优先级数据
      if (list.length == 1) {
        this.taskInformationList.find(item => {
          if (item.value == 'priority') {
            item.textConfig = list[0];
            _this.priorityUuid = item.textConfig.uuid || '';
            priority = list[0];
          }
        });
      } else {
        let priority = this.taskInformationList.find(item => item.value == 'priority');
        priority.textConfig = list.find(d => d.uuid == priority.textConfig.name) || {};
        _this.priorityUuid = priority.textConfig.uuid || '';
        priority = priority.textConfig;
      }
      if (_this.priorityUuid) {
        this.$emit('updateActiveStep', {'priority': priority});
      } else {
        this.$emit('updateActiveStep', {'priority': null});
      }
    },
    valid() {
      if (this.$refs.priority) {
        if (this.$utils.checkType(this.$refs.priority, 'array')) {
          return this.$refs.priority[0] ? this.$refs.priority[0].valid() : true;
        } else {
          return this.$refs.priority ? this.$refs.priority.valid() : true;
        }
      } else if (this.$refs.priorityName) {
        let priority = this.taskInformationList.find(item => item.value == 'priority');
        return !!priority.textConfig.name;
      }
    },
    changePriority(val, valueLabel, obj) {
      //改变优先级
      obj && (this.priorityConfig = this.$utils.deepClone(obj));
      this.priorityUuid = val;
      if (this.priorityUuid) {
        this.updatePriorityUuid();
      }
    },
    updatePriorityUuid() {
      //更新优先级
      let data = {
        processTaskId: this.processTaskId,
        processTaskStepId: this.processTaskStepId,
        priorityUuid: this.priorityUuid
      };
      this.$api.process.processtask.updateWorkData(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.$emit('updateActiveStep', {'priority': this.priorityConfig});
        }
      });
    },
    addAssistP() {
      //添加子任务
      this.addAssist();
    },
    //更新标签
    updateTagList(list) {
      const date = {
        tagList: list.map(item => item.text),
        processTaskId: this.processTaskId
      };
      this.$api.process.processtask.updateWorkData(date).then(res => {
        if (res.Status === 'OK') {
          this.$emit('updateActiveStep');
        }
      });
    },
    updateFocusUserList(list) { //工单关注人
      const data = {
        processTaskId: this.processTaskId,
        focusUserUuidList: list
      };
      // 去抖，防止每次修改工单关注人都调用接口
      clearTimeout(this.updatingFocusUser);
      this.updatingFocusUser = setTimeout(() => {
        this.$api.process.processtask.updateFocusUser(data).then(() => {
          this.$emit('updateActiveStep', 'updateFocusUser');
        });
      }, 1000);
    },
    gotoKnowledge(status) {
      //查看工单知识
      if (status == 'passed') {
        let query = 'knowledgeDocumentId=' + this.knowledgeConfig.knowledgeDocumentVersion.knowledgeDocumentId + '&knowledgeDocumentTypeUuid=' + this.knowledgeConfig.knowledgeDocumentVersion.knowledgeDocumentTypeUuid + '&status=passed';
        window.open(HOME + '/knowledge.html#/knowledge-detail?' + query, '_self');
      }
    },
    initRightHeight() {
      this.rightHeight = window.innerHeight - (this.$refs.rightMain ? this.$refs.rightMain.getBoundingClientRect().top : 0) - 18;
    }
  },
  computed: {
    timeShow() {
      //时间类型展示
      return function(value) {
        let timeList = ['startTime', 'endTime', 'expireTime', 'activeTime'];
        let exp = timeList.find(item => value.includes(item));
        if (typeof exp == 'undefined') {
          return false;
        } else {
          return true;
        }
      };
    },
    getpath() {
      return function(path) {
        let text = '';
        if (path) {
          text = path.join('/');
        }
        return text;
      };
    },
    setContentHeight() {
      return height => {
        return { height: typeof height == 'number' ? height + 'px' : height };
      };
    },
    typeTip() {
      return function(color) {
        return {
          'background-color': color + '23',
          color: color,
          'border-color': color
        };
      };
    }
  },
  watch: {
    processTaskConfig: {
      handler(val) {
        if (val) {
          this.rightLoading = true;
          this.initializeData();
        }
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.process-right{
  position: relative;
  height: 100%;
  overflow: hidden;
  .task-status{
    position: absolute;
    right: 0;
    top: 6px;
  }
  .channel-type{
    font-size: 12px;
    padding: 2px 12px;
    margin-right: 4px;
    border-radius: 20px;
  }
}
.right-setting {
  padding-left: 10px;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  .information-box {
    &:not(:last-of-type) {
      margin-bottom: 16px;
    }
  }
  .information-list {
    display: flex;
    align-items: flex-start;
    padding-bottom: 16px;
    .infor-left {
      line-height: 18px;
      width: 72px;
      text-align: right;
      flex-shrink: 0;
    }

    .infor-right {
      flex-grow:1;
      flex-shrink: 1;
      padding-left: 16px;
      word-break:break-all;
      .usergroup-box {
        width: 95%;
        &:last-child {
        padding-bottom: 0;
       }
      }
      .usergroup-name,
      /deep/ .ivu-tooltip,
       /deep/ .ivu-tooltip-rel{
        max-width: 100%;
      }
      .task-id {
        position: relative;
        display: inline-block;
        vertical-align: unset;
        cursor: copy;
        padding-right: 20px;
        .tsfont-copy {
          position: absolute;
          right: -4px;
          top: 0;
        }
      }
      &.flew-box{
        display: flex;
      }
    }
    .knowledge-style{
      padding-left: 4px;
    }
    .add-assist {
      border: 1px solid;
      padding: 0px 4px 0px 8px;
      border-radius: 2px;
    }
    .minoruser-list {
      padding-right: 4px;
      .minoruser-item {
        position: relative;
        display: inline-block;
        padding-right: 16px;
      }
    }
  }
}
</style>
