
<template>
  <div v-if="isShow" class="information-box">
    <div class="bg-op padding radius-lg">
      <div class="h4 cursor" :class="showStep ? 'pb-nm' : ''" @click="showStep = !showStep">
        <span :class="showStep ? 'tsfont-down' : 'tsfont-right'" class="icon-right">{{ $t('term.process.currentstep') }}</span>
      </div>
      <div v-show="showStep">
        <Carousel
          v-if="isShow"
          v-model="value"
          trigger="hover"
          arrow="never"
          :dots="stepList && stepList.length < 2 ? 'none' : 'inside'"
          class="Carousel"
        >
          <template v-if="isShow">
            <CarouselItem v-for="(object,sindex) in stepList" :key="sindex">
              <div v-for="(item, index) in getStepInformationList(object)" :key="'step'+index" class="information-list">
                <template v-if="item.value == 'majorUser'">
                  <div class="infor-left text-grey overflow">{{ item.title }}</div>
                  <div class="infor-right">
                    <UserCard v-bind="item.textConfig.userVo" :iconSize="20"></UserCard>
                    <span v-if="object.originalUserVo">
                      <span style="vertical-align: bottom;">（{{ $t('term.process.act') }}</span>
                      <UserCard v-bind="object.originalUserVo" :iconSize="20"></UserCard>
                      <span style="vertical-align: bottom;">）</span>
                    </span>
                  </div>
                </template>
                <template v-else-if="item.value == 'workerList' && item.textConfig.length > 0">
                  <div v-if="item.textConfig.length > 0" class="infor-left text-grey overflow">{{ item.title }}</div>
                  <div class="infor-right">
                    <span class="minoruser-list">
                      <span><UserCard
                        v-for="(user, uindex) in item.textConfig"
                        :key="uindex"
                        v-bind="user.worker"
                        :iconSize="20"
                        class="minoruser-item"
                      ></UserCard></span>
                    </span>
                  </div>
                </template>
                <template v-else-if="item.value == 'statusVo'">
                  <div class="infor-left text-grey overflow">{{ item.title }}</div>
                  <div class="infor-right">
                    {{ item.textConfig.text }}
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
              <div v-for="(sla, slaIndex) in slaTimeList" :key="slaIndex" class="information-list">
                <div class="infor-left text-grey overflow" :title="sla.name.length > 6 ? sla.name : ''">{{ sla.name }}</div>
                <div class="infor-right">
                  <div v-if="sla.status == 'doing'" class="time-height">
                    <span v-if="sla.timeLeft >= 0" class="text-success">{{ $t('page.remainingtime') }}</span>
                    <span v-else class="text-danger">{{ $t('page.overtime') }}</span>
                    <span v-if="sla.slaTimeDisplayMode == 'workTime'" :class="getClassName(sla.timeLeft)">
                      {{ sla.timeLeft | formatTimeCost({unitNumber: 3, language: 'zh', separator: ' ', unit: 'minute' }) }}
                    </span>
                    <span v-else-if="sla.slaTimeDisplayMode == 'naturalTime'" :class="getClassName((sla.expireTime - baseTime))">
                      {{ (sla.expireTime - baseTime) | formatTimeCost({unitNumber: 3, language: 'zh', separator: ' ', unit: 'minute' }) }}
                    </span>
                    <span v-else class="text-danger">
                      {{ (baseTime - sla.expireTime) | formatTimeCost({unitNumber: 3, language: 'zh', separator: ' ', unit: 'minute' }) }}
                    </span>
                  </div>
                  <div v-else-if="sla.status == 'pause'">
                    <!-- 暂停 -->
                    <span v-if="sla.timeLeft >= 0" class="text-success">{{ $t('page.remainingtime') }}</span>
                    <span v-else class="text-danger">{{ $t('page.overtime') }}</span>
                    <span v-if="sla.slaTimeDisplayMode == 'workTime'" :class="getClassName(sla.timeLeft)">
                      {{ sla.timeLeft | formatTimeCost({unitNumber: 3, language: 'zh', separator: ' ', unit: 'minute' }) }}
                    </span>
                    <span v-else-if="sla.slaTimeDisplayMode == 'naturalTime'" :class="getClassName((sla.expireTime - baseTime))">
                      {{ (sla.expireTime - baseTime) | formatTimeCost({unitNumber: 3, language: 'zh', separator: ' ', unit: 'minute' }) }}
                    </span>
                    <span v-else class="text-danger">
                      {{ (baseTime - sla.expireTime) | formatTimeCost({unitNumber: 3, language: 'zh', separator: ' ', unit: 'minute' }) }}
                    </span>
                  </div>
                  <div v-else-if="sla.status == 'done'">
                    <!-- 完成 -->
                    <span class="text-warning">{{ $t('page.timecost') }}</span>
                    <span class="text-warning">
                      {{ (sla.timeSum - sla.timeLeft) | formatTimeCost({unitNumber: 3, separator: ' ', unit: 'minute' }) }}
                    </span>
                  </div>
                  <div class="text-tip fz10">{{ getSlaStatus(sla.status, sla.expireTime) }}</div>
                  <div v-if="sla.delayList && sla.delayList.length > 0">
                    <StepSlaDelay :dataList="sla.delayList"></StepSlaDelay>
                  </div>
                </div>
              </div>
            </CarouselItem>
          </template>
        </Carousel>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue'),
    StepSlaDelay: () => import('@/views/pages/process/task/processdetail/workorder/step-sla-delay.vue')
  },
  filters: {},
  props: {},
  data() {
    return {
      baseTime: Date.now(),
      value: 0,
      stepList: [],
      processTaskId: null,
      defaultProcessTaskStep: [
        //步骤信息
        {
          title: this.$t('term.process.stepname'),
          value: 'name',
          textConfig: null
        },
        {
          title: this.$t('term.process.dealwithuser'),
          value: 'majorUser',
          textConfig: null
        },
        {
          title: this.$t('term.process.pendinguser'),
          value: 'workerList',
          textConfig: null
        },
        {
          title: this.$t('term.process.stepstatus'),
          value: 'statusVo',
          textConfig: null
        },
        {
          title: this.$t('term.process.changestatus'),
          value: 'changeStatusVo',
          textConfig: null
        },
        {
          title: this.$t('page.activationtime'),
          value: 'activeTime',
          textConfig: null
        },
        {
          title: this.$t('page.starttime'),
          value: 'startTime',
          textConfig: null
        },
        {
          title: this.$t('page.endtime'),
          value: 'endTime',
          textConfig: null
        },
        {
          title: this.$t('page.timeout'),
          value: 'expireTime',
          textConfig: null
        }
      ],
      processTaskStepId: null,
      isShow: false,
      showStep: true
    };
  },
  beforeCreate() {},
  created() {
    this.processTaskId = parseInt(this.$route.query.processTaskId);
    this.$route.query.processTaskStepId && (this.processTaskStepId = parseInt(this.$route.query.processTaskStepId));
  },
  beforeMount() {},
  mounted() {
    this.getStepStatusList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getStepStatusList() {
      //步骤
      this.isShow = false;
      let data = {
        processTaskId: this.processTaskId
      };
      this.$api.process.processtask.getStepStatusList(data).then(res => {
        if (res.Status == 'OK') {
          let list = res.Return || [];
          let stepDataList = list.filter(i => {
            return i.isActive == 1 && (i.status == 'pending' || i.status == 'running');
          });
          if (stepDataList.length > 0) {
            let findIndex = -1;
            this.stepList = this.$utils.deepClone(stepDataList);
            this.processTaskStepId && (findIndex = this.stepList.findIndex(f => f.id == this.processTaskStepId));
            findIndex > -1 && (this.value = findIndex);
            this.isShow = true;
          }
        }
      });
    },
    getSlaStatus(type, expireTime) {
      let statusObj = {
        'doing': (this.$utils.getDateByFormat(expireTime)) + this.$t('term.process.deadline'),
        'done': this.$t('page.completed'),
        'pause': this.$t('page.paused')
      };
      return statusObj[type] || '';
    }
  },
  computed: {
    getStepInformationList() {
      return data => {
        let config = this.$utils.deepClone(data);
        let stepInfoList = this.$utils.deepClone(this.defaultProcessTaskStep);
        let list = [];
        stepInfoList.forEach(item => {
          if (config[item.value]) {
            item.textConfig = config[item.value];
            if (!Array.isArray(config[item.value])) {
              list.push(item);
            } else if (Array.isArray(config[item.value]) && config[item.value].length > 0) {
              list.push(item);
            }
          }
          if (item.value == 'changeStatusVo' && config.handlerStepInfo && config.handlerStepInfo.statusVo) {
            //变更状态
            item.textConfig = config.handlerStepInfo.statusVo.text;
            list.push(item);
          }
        });
        return list;
      };
    },
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
    slaTimeList() {
      this.baseTime = Date.now();
      return this.$store.state.slaTimeList;
    },
    getClassName() {
      return (remainTime) => remainTime >= 0 ? 'text-success' : 'text-danger';
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.Carousel {
  width: 248px;
  height: auto;
  /deep/.ivu-carousel-item {
    padding: 0 1px;
  }
  /deep/.ivu-carousel-dots {
    bottom: 0px;
    position: relative;
    li {
      margin: 0 6px;
      padding: 0px;

      button {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
    }
  }
}
.information-list {
  display: flex;
  align-items: flex-start;
  padding-bottom: 16px;
  &:last-child{
    padding-bottom: 10px;
  }
  .infor-left {
    font-size: 12px;
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
</style>
