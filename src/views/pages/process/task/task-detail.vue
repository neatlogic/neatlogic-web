<template>
  <div class="taskDetail">
    <loading v-if="loadingShow" :loadingShow="loadingShow" type="fix"></loading>
    <div v-if="taskLoading">
      <Spin fix>
        <div class="taskLading-img"></div>
        <div class="text-primary taskLading-text">{{ $t('term.process.pleasewait') }}</div>
      </Spin>
    </div>
    <div v-if="pocesstaskview">
      <nodeDetail
        :is="handler"
        v-if="!loadingShow"
        ref="nodeDatas"
        :isShowTaskList="isShowTaskList"
        :defaultStartList="defaultStartList"
        :initProcessTaskStepId="processTaskStepId"
        :processTask="processTask"
        :actionList="actionList"
        :isMoreStep="isMoreStep"
        :replaceableTextConfig="replaceableTextConfig"
        class="tasknodedetail"
        @getTastHeight="getTastHeight"
        @updateMenu="updateMenu"
        @operation="operation"
      >
        <div class="workorder-task">
          <div class="task-list">
            <div class="title-top">{{ $t('page.tasklist') }}</div>
            <div class="task-secrch">
              <TsFormInput
                v-model="keyword"
                class="search"
                search
                clearable
                border="border"
              ></TsFormInput>
            </div>
            <div ref="processList" class="task-div">
              <Scroll :on-reach-bottom="handleReachBottom" :loading-text="loadingTip" :height="taskHeight">
                <ul v-if="taskList && taskList.length > 0">
                  <li
                    v-for="(item, index) in taskList"
                    :key="index"
                    class="task-li li-hover radius-md"
                    :class="item.processTaskStepId == processTaskStepId ? 'li-active' : 'bg-block'"
                    @click="toNextTask(item)"
                  >
                    <div>
                      <span class="task-status" :style="{ color: item.statusVo.color }">{{ item.statusVo.text }}</span>
                      <span v-if="item.slaTimeVo" class="tast-time" :class="taskSlaTime(item.slaTimeVo.expireTime) < 0 ? 'text-danger' : 'text-tip'">
                        <Tooltip trasnfer theme="light">
                          <span v-if="item.slaTimeVo.status == 'doing'">
                            <span v-if="taskSlaTime(item.slaTimeVo.expireTime) < 0">{{ $t('page.overtime') }}{{ taskSlaTime(item.slaTimeVo.expireTime) | formatTimeCost({ unitNumber: 3, language: 'zh', separator: ' ' }) }}</span>
                            <span v-else>{{ $t('page.timeremaining') }}{{ taskSlaTime(item.slaTimeVo.expireTime) | formatTimeCost({ unitNumber: 3, language: 'zh', separator: ' ' }) }}</span>
                          </span>
                          <span v-else-if="item.slaTimeVo.status == 'pause'">
                            <span :class="[item.slaTimeVo.timeLeft > 0 ? 'text-warning' :'text-danger']">{{ item.slaTimeVo.timeLeft > 0 ? $t('page.timeremaining') : $t('page.overtime') }}</span>
                            <span v-if="item.slaTimeVo.timeLeft > 0">{{ item.slaTimeVo.timeLeft | formatTimeCost({unitNumber: 3, separator: ' '}) }}  </span>
                            <span v-else>
                              {{ ( - item.slaTimeVo.timeLeft) | formatTimeCost({unitNumber: 3, language: 'zh', separator: ' '}) }}
                            </span>
                          </span>
                          <span v-else-if="item.slaTimeVo.status == 'done'">
                            <span class="text-warning">{{ $t('page.timecost') }}</span>
                            <span>{{ (item.slaTimeVo.timeSum - item.slaTimeVo.timeLeft) | formatTimeCost({unitNumber: 3, language: 'zh',separator: ' '}) }}</span>
                          </span>
                          <div slot="content">
                            <div v-if="item.slaTimeVo.status == 'doing'">
                              <span v-if="taskSlaTime(item.slaTimeVo.expireTime) < 0">{{ $t('page.overtime') }}{{ taskSlaTime(item.slaTimeVo.expireTime)| formatTimeCost }}</span>
                              <span v-else>{{ $t('page.timeremaining') }}{{ taskSlaTime(item.slaTimeVo.expireTime) | formatTimeCost }}</span>
                            </div>
                            <div v-else-if="item.slaTimeVo.status == 'pause'">
                              <span :class="[item.slaTimeVo.timeLeft > 0 ? 'text-warning' :'text-danger']">{{ item.slaTimeVo.timeLeft > 0 ? $t('page.timeremaining') : $t('page.overtime') }}</span>
                              <span v-if="item.slaTimeVo.timeLeft > 0">{{ item.slaTimeVo.timeLeft | formatTimeCost({unitNumber: 3, language: 'zh',separator: ' '}) }}  </span>
                              <span v-else>
                                {{ ( - item.slaTimeVo.timeLeft) | formatTimeCost({unitNumber: 3, language: 'zh', separator: ' '}) }}
                              </span>
                            </div>
                            <div v-else-if="item.slaTimeVo.status == 'done'">
                              <span class="text-warning">{{ $t('page.timecost') }}</span>
                              <span>{{ (item.slaTimeVo.timeSum - item.slaTimeVo.timeLeft) | formatTimeCost({unitNumber: 3, language: 'zh',separator: ' '}) }}</span>
                            </div>
                          </div>
                        </Tooltip>
                      </span>
                    </div>
                    <div class="task-title-box">
                      <div class="number text-tip">
                        {{ item.serialNumber }}
                      </div>
                      <div class="text text-title overflow">
                        {{ item.title }}
                      </div>
                    </div>
                    <div v-if="item.stepName" class="task-step-title overflow">
                      {{ item.stepName }}
                    </div>
                  </li>
                </ul>
                <div v-else>
                  <no-data></no-data>
                </div>
              </Scroll>
            </div>
          </div>
        </div>
      </nodeDetail>
    </div>
    <div v-else>
      <NoData :text="$t('message.noauth')" class="fullNodata"></NoData>
    </div>
    <ActionReasonDialog
      :isShow.sync="isShowReasonDialog"
      :processTaskId="processTaskId"
      :processTaskStepId="processTaskStepId"
      :actionList="actionList"
      :taskActionType="taskActionType"
    ></ActionReasonDialog>
  </div>
</template>
<script>
import nodeDetail from './processdetail';
import { mapGetters, mapMutations } from 'vuex';
export default {
  name: '',
  provide() { //有些表单可能需要这些参数，表单里面会接收这些参数
    return {
      channelUuid: null,
      processTaskId: this.$route.query.processTaskId
    };
  },
  components: {
    ...nodeDetail,
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    ActionReasonDialog: resolve => require(['@/views/pages/process/task/processdetail/workorder/actiondialog/actionreason.vue'], resolve)
  },
  props: {},
  data() {
    return {
      isMoreStep: true, //是否有多个可处理的步骤
      defaultStartList: [], //可处理的步骤列表
      actionList: [], //按钮权限列表
      processTask: null, //工单信息
      loadingShow: true,
      taskLoading: false, //工单处理流转等待时提示图标
      handler: null,
      loadComplete: false,
      pocesstaskview: true, //查看权限
      processTaskId: null, //工单id
      processTaskStepId: null, //步骤id
      taskHeight: 1000, //任务列表滚动高度
      loadingTip: this.$t('page.loadingtip'),
      taskList: [], //任务列表
      keyword: null, //任务列表搜索
      processCurrentPage: 1, //任务当前页
      pocessPageCount: null, //任务总页数
      replaceableTextConfig: {}, //文案替换
      setTimeGetData: null, //定时器
      isShowReasonDialog: false,
      taskActionType: ''
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  async mounted() {
    this.$route.query.processTaskId && (this.processTaskId = parseInt(this.$route.query.processTaskId));
    this.$route.query.processTaskStepId && (this.processTaskStepId = parseInt(this.$route.query.processTaskStepId));
    this.getTaskList();
    await this.getAllData();
    let _this = this;
    window.addEventListener('resize', function() {
      if (_this.$refs.processList) {
        _this.taskHeight = _this.$refs.processList.offsetHeight;
      }
    });
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    async getAllData() {
      this.setTimeGetData && clearTimeout(this.setTimeGetData);
      let _this = this;
      let res = await _this.$api.process.processtask.getNextsteplist({ processTaskId: _this.processTaskId});//处理页逻辑：需要等后台处理完下一步骤的接口
      if (res.Return.status == 'ok') {
        _this.defaultStartList = res.Return.tbodyList || [];
        if (!_this.processTaskStepId && _this.defaultStartList.length < 2) {
          _this.isMoreStep = false;
          (_this.defaultStartList.length == 1) && (_this.processTaskStepId = _this.defaultStartList[0].id); //判断是否有可处理的步骤
        }
        _this.getTaskActionObj();
        _this.getMessage();
        this.taskLoading = false;
      } else {
        this.loadingShow = false;
        this.taskLoading = true;
        _this.setTimeGetData = setTimeout(() => {
          _this.setTimeGetData = null;
          _this.getAllData();
        }, 1000 * 3);
      }
    },
    getTaskActionObj() {
      //操作权限
      let _this = this;
      if (this.processTaskId) {
        let data = {
          processTaskId: this.processTaskId,
          processTaskStepId: this.processTaskStepId
        };
        this.$api.process.processtask.getTaskAction(data).then(res => {
          if (res.Status == 'OK') {
            let actionList = res.Return;
            this.actionList = actionList;
          }
        });
      }
    },
    getMessage() {
      //获取工单和步骤信息接口
      let data = {
        processTaskId: this.processTaskId,
        processTaskStepId: this.processTaskStepId
      };
      this.$api.process.processtask.getTaskMessage(data).then(res => {
        if (res.Status == 'OK') {
          let processTask = res.Return.processTask;
          this.processTask = processTask;
          this.$set(this.processTask, 'processTaskRelationCount', res.Return.processTaskRelationCount);
          if (processTask.currentProcessTaskStep) {
            this.handler = processTask.currentProcessTaskStep.handler;
            let replaceableTextList = processTask.currentProcessTaskStep.replaceableTextList || []; //步骤文案替换列表
            if (replaceableTextList.length > 0) {
              replaceableTextList.forEach(i => {
                this.$set(this.replaceableTextConfig, i.name, i);
              });
            }
          } else {
            this.handler = 'omnipotent';
          }
          setTimeout(() => {
            if (this.$refs.processList) {
              this.taskHeight = this.$refs.processList.offsetHeight;
            }
          }, 250);
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    getTaskList() {
      //任务列表s
      let data = {
        currentProcessTaskId: this.processTaskId,
        keyword: this.keyword,
        currentPage: this.processCurrentPage,
        pageSize: 10
      };
      this.$api.process.processtask.getTaskList(data).then(res => {
        if (res.Status == 'OK') {
          let taskList = res.Return.tbodyList;
          if (this.processCurrentPage > 1) {
            taskList.forEach(item => {
              this.taskList.push(item);
            });
          } else {
            this.taskList = taskList;
          }
          this.processPageCount = res.Return.pageCount;
        }
      });
    },
    handleReachBottom: function() {
      //引用滚动加载
      let _this = this;
      if (_this.processCurrentPage) {
        _this.processCurrentPage += 1;
      }

      return new Promise(resolve => {
        setTimeout(() => {
          resolve();
          if (_this.processCurrentPage > 1 && _this.processCurrentPage > _this.processPageCount) {
            _this.loadingTip = _this.$t('page.loadfinish');
            return;
          } else {
            _this.getTaskList();
          }
        }, 1000);
      });
    },
    getTastHeight(val) {
      if (val) {
        this.$nextTick(() => {
          if (this.$refs.processList) {
            this.taskHeight = this.$refs.processList.offsetHeight;
          }
        });
      }
    },
    toNextTask(item) {
      // 切换下一个任务时，判断数据是否有变化，有则弹窗提示用户保留数据
      let isDataChange = this.$refs.nodeDatas ? this.$refs.nodeDatas.isDataChangeSwitchTsak() : false;
      if (!isDataChange) {
        // 没有改变
        this.switchTaskNoSave(item);
      } else {
        this.$createDialog({
          title: this.$t('page.tip'),
          content: this.$t('message.notsavedataupdateredirecttip'),
          btnList: [   
            {
              text: this.$t('page.cancel'),
              fn: vnode => {
                vnode.isShow = false;
              }
            },
            {
              text: this.$t('page.notsave'), // 不保存
              type: 'primary',
              ghost: true,
              fn: vnode => {
                vnode.isShow = false;
                this.switchTaskNoSave(item);
              }
            },
            {
              text: this.$t('page.save'), // 保存
              type: 'primary',
              fn: async vnode => {
                await this.$refs.nodeDatas.saveTaskData(true);
                vnode.isShow = false;
                this.switchTaskNoSave(item);
              }
            }
          ]
        });
      }
    },
    switchTaskNoSave(item) {
      // 切换任务不保存
      this.loadingShow = true;
      this.processTaskId = item.processTaskId;
      this.processTaskStepId = item.processTaskStepId;
      this.$router.push({
        path: '/task-detail',
        query: {
          processTaskId: this.processTaskId,
          processTaskStepId: this.processTaskStepId,
          type: Date.now()
        }
      });
    },
    updateMenu() {
      // 刷新左侧菜单
      this.$store.dispatch('leftMenu/getWorkCenterMenuData');
    },
    operation(type) { //工单取消、工单恢复、步骤暂停、步骤恢复
      this.taskActionType = type;
      this.isShowReasonDialog = true;
    }
  },
  filter: {},
  computed: {
    ...mapGetters('leftTaskMenu', {
      isShowTaskList: 'getIsShowTaskList'
    }),
    taskSlaTime() {
      return expireTime => {
        let nowDate = this.$store.state.now;
        const time = expireTime - nowDate; //时效：截止时间减去当前时间
        return time;
      };
    }
  },
  watch: {
    keyword: function() {
      //这个任务列表筛选的
      this.processCurrentPage = 1;
      setTimeout(() => {
        this.getTaskList();
      }, 300);
    }
  },
  beforeRouteEnter(to, from, next) {
    if (from.fullPath && from.fullPath != '/') {
      let prevsetting = {
        router: from.fullPath,
        name: from.meta.title
      };
      if (from.params) {
        Object.assign(prevsetting, {
          params: from.params
        });
      }
      sessionStorage.setItem('taskdetailPrev', JSON.stringify(prevsetting));
    }
    next();
  },
  beforeRouteLeave(to, from, next, url) {
    sessionStorage.removeItem('taskdetailPrev');
    try {
      if (this.$refs.nodeDatas) {
        this.$refs.nodeDatas.isDraftData(to, from, next, url);
      } else {
        url ? this.$utils.gotoHref(url) : next();
      }
    } catch (error) {
      url ? this.$utils.gotoHref(url) : next();
    }
  }

};
</script>
<style lang='less'>
@import '~@/resources/assets/css/process/taskdispatch.less';
</style>
<style lang='less' scoped>
  .taskLading-img{
    width: 200px;
    height: 160px;
    &::before{
      content: '';
      height: 90%;
      width: 100%;
      top: 0;
      left: 0;
      position: absolute;
      background: url('~img-module/taskLading-default.gif') no-repeat center center;
      background-size: auto 100%;
    }
    .theme-dark & {
      &::before{
        background-image: url('~publics/taskLading-dark.gif');
      }
    }
  }
  .taskLading-text{
    position: relative;
    top: 10px;
  }
</style>
