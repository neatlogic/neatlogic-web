<template>
  <div class="CenterDetail">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <!-- 头部描述内容 -->
    <div v-if="haveProcessTask(haveComment, startHandler, formConfig, processTaskConfig)" class="mb-nm">
      <div class="padding bg-op radius-lg" style="min-height: 100px">
        <Report
          ref="taskReport"
          :processTaskConfig="processTaskConfig"
          :actionConfig="actionConfig"
          :processTaskId="processTaskId"
          :processTaskStepId="processTaskStepId"
          @saveTaskD="saveTaskD"
          @upActivityList="updateStepActive()"
        >
          <template v-if="startHandler == 'changecreate'" v-slot:changeStep>
            <!-- 变更 -->
            <div v-if="handler == 'changecreate' && (actionConfig.complete || (handlerStepInfo.changeStepList && handlerStepInfo.changeStepList.length > 0))" class="report-changecreate border-color">
              <ChangecreateStep ref="changeStepList" :isComplete="actionConfig.complete ? true : false" :handlerStepInfo="handlerStepInfo"></ChangecreateStep>
            </div>
            <div v-else>
              <ChangeDetail
                ref="changeStepList"
                :defaultProcessTaskStepId="defaultProcessTaskStepId"
                :handlerStepInfo="handlerStepInfo"
                :changeStepList="changeStepList"
                :isEditStepworker="isEditStepworker"
                class="pt-md"
                @updateStepActive="updateStepActive"
              ></ChangeDetail>
            </div>
            <!-- 变更 -->
          </template>
        </Report>
      </div>
    </div>
    <!-- 描述end -->
    <!-- 中间选项卡内容 -->
    <div v-if="!loadingShow" ref="commonMain" class="common-main">
      <Tabs
        v-model="tabValue"
        class="block-tabs"
        :animated="false"
        name="tab1"
      >
        <TabPane
          v-if="hasForm"
          :label="render => getTabPaneLabel(render, 'report', 'ContentDetails')"
          name="report"
          class="tab-content"
          tab="tab1"
        >
          <!-- 内容详情 -->
          <div v-if="haveProcessTask(haveComment, startHandler, formConfig, processTaskConfig)" class="pt-nm pb-nm">
            <div v-if="!$utils.isEmpty(formConfig)" id="form" class="form-view">
              <template v-if="formConfig._type == 'new'">
                <TsSheet
                  ref="formSheet"
                  mode="read"
                  :value="formConfig"
                  :data="processTaskConfig.formAttributeDataMap"
                  :readonly="!actionConfig.save || !formEdit"
                  class="pl-sm pr-sm"
                  @emit="formSheetEmitData"
                  @updateHiddenComponentList="updateHiddenComponentList"
                ></TsSheet>
              </template>
              <template v-else>
                <FormPreview
                  ref="FormPreview"
                  :content="filterCustommergeprocess(formConfig)"
                  :isEdit="formEdit"
                  :isReadonly="actionConfig.save ? false : true"
                  :stephidetrList="stephidetrList"
                  :stepreadtrList="stepreadtrList"
                  :formAttributeHideList="formAttributeHideList"
                ></FormPreview>
              </template>
            </div>
            <div v-else-if="processTaskConfig.isHasOldFormProp == 1" class="form-view">
              <FormPreviewHtml
                ref="FormPreview"
                class="block-content"
                lass="order-list"
                :processTaskId="processTaskId"
              ></FormPreviewHtml>
            </div>
          </div>
        </TabPane>
        <TabPane
          v-if="fixedPageTab.changeDetails && ($slots.changecreate || $slots.changehandle)"
          :label="render => renderTabPaneLabel(render, 'changeDetails', $t('term.process.changedetail'))"
          name="changeDetails"
          class="tab-content"
          tab="tab1"
        >
          <div class="padding">
            <!-- 变更创建s -->
            <slot name="changecreate"></slot>
            <!-- 变更创建end -->
            <!-- 变更处理s -->
            <slot name="changehandle"></slot>
            <!-- 变更处理end -->
          </div>
        </TabPane>
        <TabPane
          v-if="fixedPageTab.autoexec && $slots.autoexec"
          :label="render => renderTabPaneLabel(render, 'autoexec', $t('page.autoexec'))"
          name="autoexec"
          class="tab-content"
          tab="tab1"
        >
          <div class="padding">
            <!-- 自动化节点s -->
            <slot name="autoexec"></slot>
            <!-- 自动化节点end -->
          </div>
        </TabPane>
        <TabPane
          v-if="fixedPageTab.automatic && $slots.automatic"
          :label="render => renderTabPaneLabel(render, 'automatic', $t('term.process.automaticprocessing'))"
          name="automatic"
          class="tab-content"
          tab="tab1"
        >
          <div class="padding">
            <!--  auto回调 -->
            <slot name="automatic"></slot>
            <!--  auto回调 -->
          </div>
        </TabPane>
        <template v-for="subStep in taskConfigList">
          <TabPane
            v-if="fixedPageTab[`subTask${subStep.id}`]"
            :key="subStep.id"
            :label="subTask(subStep)"
            :name="'subTask' + subStep.id"
            tab="tab1"
          >
            <!-- 子任务策略 -->
            <StrategyDetail
              :processTaskId="processTaskId"
              :processTaskStepId="processTaskStepId"
              :actionConfig="actionConfig"
              :config="subStep"
              @getStepList="getStepList"
            ></StrategyDetail>
            <!-- 子任务策略end -->
          </TabPane>
        </template>

        <TabPane
          v-if="fixedPageTab.step"
          :label="renderStepList()"
          name="step"
          class="padding tab-content"
          tab="tab1"
        >
          <!--步骤日志 -->
          <div v-if="stepData && stepData.length > 0">
            <StepOverview
              :processTaskId="processTaskId"
              :processTaskStepId="processTaskStepId"
              :defaultStepData="stepData"
              :currentStepId="defaultProcessTaskStepId"
              :processTaskConfig="processTaskConfig"
            ></StepOverview>
          </div>
        </TabPane>
        <TabPane
          v-if="fixedPageTab.activity"
          id="CurrentProcessTaskStep"
          :label="renderactivity()"
          name="activity"
          class="padding tab-content"
          tab="tab1"
        >
          <!-- 时间线 -->
          <ActivityOverview :defaultActiveData="activeData" :formConfig="formConfig"></ActivityOverview>
        </TabPane>
        <TabPane
          v-if="showRelationDetail(actionConfig.tranferreport, processTaskConfig.processTaskRelationCount) && fixedPageTab.relevance"
          :label="render => getTabPaneLabel(render, 'relevance', 'Relationlist')"
          name="relevance"
          class="tab-content"
          tab="tab1"
        >
          <!-- 关联工单 -->
          <RelationDetail :processTaskConfig="processTaskConfig" :relationAuth="actionConfig.tranferreport" @upActivityList="updateStepActive()"></RelationDetail>
        </TabPane>
        <TabPane
          v-if="(actionConfig.markrepeat || repeatList.length > 0) && fixedPageTab.markrepeat"
          :label="render => renderTabPaneLabel(render, 'markrepeat', $t('term.process.repeatedevent'))"
          name="markrepeat"
          class="tab-content"
          tab="tab1"
        >
          <!-- 重复事件 -->
          <MarkRepeat
            :processTaskId="processTaskId"
            :actionConfig="actionConfig"
            :repeatList="repeatList"
            @closeRepeatTab="closeRepeatTab"
          ></MarkRepeat>
        </TabPane>
        <TabPane
          v-if="hasAccessoriesList && fixedPageTab.file"
          :label="render => renderTabPaneLabel(render, 'file', $t('term.process.accessorieslist'))"
          name="file"
          class="padding tab-content"
          tab="tab1"
        >
          <!-- 附件清单 -->
          <AccessoriesList ref="processTaskFile" :processTaskId="processTaskId" @update:value="updateAccessoriesList"></AccessoriesList>
        </TabPane>
        <TabPane
          v-if="fixedPageTab.reportingHistory"
          :label="render => renderTabPaneLabel(render, 'reportingHistory', $t('term.process.reportinghistory'))"
          name="reportingHistory"
          class="padding tab-content"
          tab="tab1"
        >
          <!-- 上报历史 -->
          <ReportingHistory v-if="tabValue == 'reportingHistory'" :processTaskConfig="processTaskConfig"></ReportingHistory>
        </TabPane>
      </Tabs>
    </div>
    <!-- 中间选项卡内容end -->

    <!-- 固定页面tab -->
    <div
      v-for="(item, index) in fixedPageList"
      :key="index"
      class="bg-op radius-lg mt-nm mb-nm padding"
      :class="item.tabValue == 'step' ? 'common-main' : ''"
    >
      <template v-if="item.tabValue == 'report'">
        <!-- 内容详情 -->
        <div>
          <span>{{ item.label }}</span>
          <span class="tsfont-pin-angle-s text-primary cursor pl-xs" :title="$t('page.cancelfixedpage')" @click="cancelFixedPage('report')"></span>
        </div>
        <div v-if="haveProcessTask(haveComment, startHandler, formConfig, processTaskConfig)" class="pt-nm pb-nm">
          <div v-if="!$utils.isEmpty(formConfig)" id="form" class="form-view">
            <template v-if="formConfig._type == 'new'">
              <TsSheet
                ref="formSheet"
                mode="read"
                :value="formConfig"
                :data="processTaskConfig.formAttributeDataMap"
                :readonly="!actionConfig.save || !formEdit"
                class="pl-sm pr-sm"
                @emit="formSheetEmitData"
              ></TsSheet>
            </template>
            <template v-else>
              <FormPreview
                ref="FormPreview"
                :content="filterCustommergeprocess(formConfig)"
                :isEdit="formEdit"
                :isReadonly="actionConfig.save ? false : true"
                :stephidetrList="stephidetrList"
                :stepreadtrList="stepreadtrList"
                :formAttributeHideList="formAttributeHideList"
              ></FormPreview>
            </template>
          </div>
          <div v-else-if="processTaskConfig.isHasOldFormProp == 1" class="form-view">
            <FormPreviewHtml
              ref="FormPreview"
              class="block-content"
              lass="order-list"
              :processTaskId="processTaskId"
            ></FormPreviewHtml>
          </div>
        </div>
      </template>
      <template v-else-if="item.tabValue.indexOf('subTask') != -1">
        <div class="mb-xs">
          <span>{{ item.label }}</span>
          <span class="tsfont-pin-angle-s text-primary cursor pl-xs" :title="$t('page.cancelfixedpage')" @click="cancelFixedPage(item.tabValue)"></span>
        </div>
        <StrategyDetail
          :processTaskId="processTaskId"
          :processTaskStepId="processTaskStepId"
          :actionConfig="actionConfig"
          :config="getStrategyConfig(item.tabValue)"
          @getStepList="getStepList"
        ></StrategyDetail>
      </template>
      <template v-else-if="item.tabValue == 'changeDetails'">
        <div class="mb-xs">
          <span>{{ item.label }}</span>
          <span class="tsfont-pin-angle-s text-primary cursor pl-xs" :title="$t('page.cancelfixedpage')" @click="cancelFixedPage(item.tabValue)"></span>
        </div>
        <div class="padding">
          <!-- 变更创建s -->
          <slot name="changecreate"></slot>
          <!-- 变更创建end -->
          <!-- 变更处理s -->
          <slot name="changehandle"></slot>
          <!-- 变更处理end -->
        </div>
      </template>
      <template v-else-if="item.tabValue == 'automatic'">
        <div class="mb-xs">
          <span>{{ item.label }}</span>
          <span class="tsfont-pin-angle-s text-primary cursor pl-xs" :title="$t('page.cancelfixedpage')" @click="cancelFixedPage(item.tabValue)"></span>
        </div>
        <div class="padding">
          <slot name="automatic"></slot>
        </div>
      </template>
      <template v-else>
        <div class="mb-xs">
          <span>{{ item.label }}</span>
          <span class="tsfont-pin-angle-s text-primary cursor pl-xs" :title="$t('page.cancelfixedpage')" @click="cancelFixedPage(item.tabValue)"></span>
        </div>
        <Component
          :is="item.tabValue"
          :processTaskId="processTaskId"
          :processTaskStepId="processTaskStepId"
          :defaultStepData="stepData"
          :currentStepId="defaultProcessTaskStepId"
          :processTaskConfig="processTaskConfig"
          :defaultActiveData="activeData"
          :relationAuth="actionConfig.tranferreport"
          :actionConfig="actionConfig"
          :repeatList="repeatList"
          :handlerStepInfo="autoexechandlerStepInfo"
          :formConfig="formConfig"
          @closeRepeatTab="closeRepeatTab"
          @upActivityList="updateStepActive()"
        ></Component>
      </template>
    </div>

    <!-- 底部内容 -->
    <div ref="footerReply">
      <!-- 用户评分 -->
      <ScoreEdit
        v-if="processTaskConfig.scoreTemplateVo"
        :processTaskConfig="processTaskConfig"
        :actionConfig="actionConfig"
        :processTaskId="processTaskConfig.id"
      ></ScoreEdit>
      <!-- 用户评分end -->

      <!-- 回复 -->
      <ReplyContent
        ref="replyContent"
        :handler="handler"
        :actionConfig="actionConfig"
        :commentObj="commentObj"
        :processTaskStepConfig="processTaskStepConfig"
        :isDisableCommet.sync="isDisableCommet"
      ></ReplyContent>
      <slot name="replyBtn"></slot>
      <!-- 回复end -->
    </div>
    <!-- 底部内容end -->
  </div>
</template>

<script>
import FormPreview from '@/resources/components/FormMaker/formview/form-view.vue';
import FormPreviewHtml from '@/resources/components/FormMaker/formview/form-view-html.vue';
import Report from '@/views/pages/process/task/processdetail/workorder/report/report';
import imgViewer from '@/resources/directives/img-viewer.js';
import scrollHidden from '@/resources/directives/scroll-hidden.js';
import download from '@/resources/directives/download.js';
import dealFormMix from '@/views/pages/process/task/taskcommon/dealNewFormData.js';
import Component from './CenterDetailComponent/index.js';

export default {
  name: 'CenterDetail',
  components: {
    FormPreview,
    FormPreviewHtml,
    Report,
    ...Component,
    TsSheet: resolve => require(['@/resources/plugins/TsSheet/TsSheet.vue'], resolve),
    ActivityOverview: resolve => require(['./activity/activity-overview.vue'], resolve),
    StepOverview: resolve => require(['./taskstep/step-overview.vue'], resolve),
    StrategyDetail: resolve => require(['./strategy/strategy-detail.vue'], resolve),
    RelationDetail: resolve => require(['./relation/relation-detail.vue'], resolve),
    ChangeDetail: resolve => require(['./change/change-detail.vue'], resolve),
    ChangecreateStep: resolve => require(['./change/changecreate-detail'], resolve),
    ScoreEdit: resolve => require(['./score/score-edit.vue'], resolve),
    MarkRepeat: resolve => require(['./markrepeat/mark-repeat.vue'], resolve),
    AccessoriesList: resolve => require(['./CenterDetailComponent/accessories-list'], resolve), // 附件清单
    ReplyContent: resolve => require(['./CenterDetailComponent/reply-content'], resolve), // 回复内容
    ReportingHistory: resolve => require(['./CenterDetailComponent/reporting-history'], resolve) // 上报历史
  },
  directives: { imgViewer, scrollHidden, download },
  mixins: [dealFormMix],
  props: {
    defaultProcessTaskId: {
      type: [String, Number],
      default: null
    },
    defaultProcessTaskStepId: {
      type: [String, Number],
      default: null
    },
    processTaskConfig: Object, //工单基本信息
    processTaskStepConfig: Object, //步骤基本信息
    actionConfig: Object, //权限
    formConfig: Object, //表单数据
    formEdit: Boolean, //表单是否有编辑权限
    showActive: Boolean, //是否显示活动步骤
    addAssist: {
      type: Function,
      default: null
    },
    startProcessTaskStep: Object, //上报内容
    replaceableTextConfig: Object, //文案替换（子任务）
    priorityList: {
      //优先级列表
      type: Array,
      default: () => []
    },
    // 是否有待处理任务
    hasPendingTasks: {
      type: Boolean,
      default: false
    }
  },
  data() {
    let showFormValueConfig = this.processTaskConfig.formAttributeDataMap;
    return {
      fixedPageTab: {
        report: true,
        step: true,
        activity: true,
        relevance: true,
        markrepeat: true,
        file: true,
        reportingHistory: true,
        changeDetails: true,
        autoexec: true,
        automatic: true // 自动处理节点
      },
      loadingShow: false, // 解决固定页面之后，tab的顺序改变了，不是渲染前的顺序
      fixedPageList: [],
      mouseoverTabName: '', // 鼠标进入事件
      hasAccessoriesList: true,
      toolbar: [],
      tabValue: '', // 不给默认值，默认为第一项的name
      isStepRequired: 0, //回复必填：1必填，0非必填
      validateList: ['required'],
      taskLoading: true,
      haveComment: false, //是否存在上报内容
      defaultTaskFileList: [], //上报附件
      defaultTaskContent: null, //上报内容
      newTaskContent: null,
      isTaskSave: true, //是否回复（上报内容无修改不能回复）
      draftFile: [], //工单上报附件
      timerForm: null,
      isDisableCommet: false,
      commentObj: {
        content: null,
        fileList: null
      },
      fileIdList: null, //回复文件上传列表
      taskFileUuidList: null, //工单文件上传
      processTaskId: this.defaultProcessTaskId, //工单id
      processTaskStepId: this.defaultProcessTaskStepId, //步骤id
      auditId: null, //活动id
      formValueConfig: showFormValueConfig, //表单值
      buttonLog: '1', //活动日志
      activeData: [], //按活动分
      stepContent: null, //描述
      selectStepId: this.defaultProcessTaskStepId,
      timeSortIcon: false, //活动排序
      issubTaskComplete: true,
      processTaskStepSubtaskId: null,
      stepData: [], //按步骤分
      //变更
      handlerStepInfo: null,
      changeStepList: [],
      isEditStepworker: false, //批量编辑处理人
      isEditchange: false, //编辑变更信息
      stephidetrList: [], //当前步骤需要隐藏的行
      stepreadtrList: [], //当前步骤需要只读的行
      formAttributeHideList: [], //表单组件的权限（隐藏列表）
      commentTemplateId: null, //选中的回复模板
      startHandler: 'omnipotent', //开始节点的类型：omnipotent(普通节点)、changecreate(变更创建)
      handler: 'omnipotent', //处理节点类型
      repeatList: [], //重复事件列表
      tabLabelReplaceableTextConfig: {
        replaceableContentDetails: this.$t('page.contentdetail'), // 接口返回替换文案列表为空时默认值：内容详情
        replaceableSteplist: this.$t('term.process.steplog'), // 接口返回替换文案列表为空时默认值：步骤日志
        replaceableTimeLine: this.$t('page.timeline'), // 接口返回替换文案列表为空时默认值：活动线
        replaceableRelationlist: this.$t('term.process.reltask') // 接口返回替换文案列表为空时默认值：关联工单
      },
      stepSortIcon: false, // 步骤排序(true正序，false倒序)
      taskConfigList: [], //子任务策略
      autoexechandlerStepInfo: null, // 自动化信息
      lastFormConfig: null
    };
  },
  created() {
    if (localStorage.getItem('stepSortIcon') && JSON.parse(localStorage.getItem('stepSortIcon'))) {
      this.stepSortIcon = true;
    }
    if (!this.formConfig._type == 'new') {
      this.setStepform();
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.timerForm = setInterval(() => {
        if (this.$refs.FormPreview) {
          this.$refs.FormPreview.updateFormval(this.processTaskConfig.formAttributeDataMap);
          this.$nextTick(() => {
            this.$emit('update', this.getData());
          });
        }
        this.taskLoading = false;
        this.clear();
      }, 1000);

      if (this.processTaskStepConfig && this.processTaskStepConfig.commentTemplate && !this.commentObj.content) {
        this.commentObj.content = this.processTaskStepConfig.commentTemplate.content;
        this.commentTemplateId = this.processTaskStepConfig.commentTemplate.id;
      }
    });
  },
  methods: {
    async validFormRequired() {
      // 首次加载时需要判断表单是否必填，没填写时，需要高亮tab
      let valid = await this.formValid(this.processTaskConfig);
      return valid;
    },
    openTabName(tabValue) {
      // 错误信息时，点击对应的标签，定位到具体的错误内容
      this.tabValue = tabValue;
    },
    updateAccessoriesList(val) {
      this.hasAccessoriesList = true;
      if (this.$utils.isEmpty(val) && val && this.$utils.isEmpty(val.tbodyList)) {
        this.hasAccessoriesList = false;
      }
    },
    filterCustommergeprocess(formConfig) {
      // 过滤银行定制批量合并上报组件
      let data = this.$utils.deepClone(formConfig);
      if (formConfig && formConfig.controllerList instanceof Array && formConfig.controllerList.length > 0 && process.env.VUE_APP_LOGINTITLE == 'neatlogic') {
        let arr = formConfig.controllerList.filter(val => {
          return val.handler != 'custommergeprocess';
        });
        data.controllerList = arr;
        return data;
      } else {
        return data;
      }
    },
    update() {
      //更新初始化数据,主要是 用来对比，因为使用require加载的vue 模块，需要特殊的处理
      this.setTimeUpdata && clearTimeout(this.setTimeUpdata);
      this.setTimeUpdata = setTimeout(() => {
        let allData = this.getData();
        this.$emit('update', allData);
        this.setTimeUpdata = null;
      }, 300);
    },
    initData() {
      this.wipeCenterDetail();
      this.getActivityList();
      this.getStepStatusList();
      this.getTaskComment();
      this.getRepeatList();
      this.$nextTick(() => {
        this.update();
      });
    },
    wipeCenterDetail() {
      this.haveComment = false;
      this.defaultTaskContent = null;
      this.defaultTaskFileList.splice(0);
      this.timeSortIcon = false;
      this.handlerStepInfo = null;
      this.changeStepList = [];
    },
    getTaskComment() {
      //上报内容初始化
      let startProcessTaskStep = this.startProcessTaskStep;
      this.startHandler = startProcessTaskStep.handler;
      if (startProcessTaskStep.comment) {
        this.haveComment = true;
        if (startProcessTaskStep.comment.content) {
          this.defaultTaskContent = startProcessTaskStep.comment.content;
          this.newTaskContent = startProcessTaskStep.comment.content;
        }
        if (startProcessTaskStep.comment.fileList && startProcessTaskStep.comment.fileList.length > 0) {
          this.defaultTaskFileList = startProcessTaskStep.comment.fileList;
        }
        if (!this.actionConfig.update && !startProcessTaskStep.comment.content && startProcessTaskStep.comment.fileList.length == 0) {
          this.haveComment = false;
        }
      }
      //步骤信息
      let processTaskStepConfig = this.processTaskStepConfig;
      if (processTaskStepConfig) {
        this.isStepRequired = processTaskStepConfig.isRequired;
        this.handler = processTaskStepConfig.handler;
        this.taskConfigList = this.getTaskConfigList(processTaskStepConfig.taskConfigList);
        if (!this.$utils.isEmpty(this.taskConfigList)) {
          this.taskConfigList.forEach(item => {
            if (item && item.id) {
              this.fixedPageTab[`subTask${item.id}`] = true;
            }
          });
        }
      }
      //变更
      let handlerStepInfo = null;
      this.autoexechandlerStepInfo = null;
      if (processTaskStepConfig && processTaskStepConfig.handlerStepInfo) {
        handlerStepInfo = processTaskStepConfig.handlerStepInfo;
        this.autoexechandlerStepInfo = processTaskStepConfig.handlerStepInfo;
      } else if (startProcessTaskStep.handlerStepInfo) {
        handlerStepInfo = startProcessTaskStep.handlerStepInfo;
      }
      if (handlerStepInfo) {
        this.handlerStepInfo = handlerStepInfo;
        this.changeStepList = handlerStepInfo.changeStepList;
        if (handlerStepInfo.actionList && handlerStepInfo.actionList.length > 0) {
          let batcheditchangestepworker = handlerStepInfo.actionList.find(h => h.value === 'batcheditchangestepworker');
          let editchange = handlerStepInfo.actionList.find(h => h.value === 'editchange');
          if (batcheditchangestepworker) {
            this.isEditStepworker = true;
          }
          if (editchange) {
            this.isEditchange = true;
          }
        }
      }
      if (this.taskConfigList.length > 0) {
        this.tabValue = 'subTask' + this.taskConfigList[0].id;
      }
    },
    getStepList(data) {
      //刷新子策略数据
      this.taskConfigList = this.getTaskConfigList(data);
      this.updateStepActive();
    },
    clear() {
      clearInterval(this.timerForm);
      this.timerForm = null;
    },
    getActivityList() {
      //活动列表
      let data = {
        processTaskId: this.processTaskId
      };
      this.$api.process.processtask.getAuditList(data).then(res => {
        if (res.Status == 'OK') {
          let activeList = res.Return;
          this.activeData.splice(0);
          activeList.forEach(active => {
            if (active.auditDetailList && active.auditDetailList.length > 0) {
              this.$set(active, 'isShow', false);
            }
          });
          this.activeData = activeList;
        }
      });
    },

    getStepStatusList() {
      //步骤状态
      let data = {
        processTaskId: this.processTaskId
      };
      this.$api.process.processtask.getStepStatusList(data).then(res => {
        if (res.Status == 'OK') {
          this.stepData = res.Return;
          !this.stepSortIcon && this.stepData.reverse();
          if (this.stepData && this.stepData.length > 0) {
            this.stepData.forEach(item => {
              this.$set(item, 'isShow', false);
            });
          }
        }
      });
    },
    saveTaskD() {
      //暂存
      if (this.actionConfig.save) {
        this.knowledgeId = null;
        let data = this.getData();
        this.$api.process.processtask.saveTaskDetail(data).then(res => {
          if (res.Status == 'OK') {
            this.auditId = res.Return;
            this.$emit('update', data);
            this.$Message.success(this.$t('page.saved', { target: this.$utils.getCurrenttime('HH:mm:ss') }));
          }
        });
      }
    },
    getData() {
      //获取暂存数据，用于对比
      let formData = [];
      let hidecomponentList = [];
      let readcomponentList = [];
      let handlerStepInfo = {};
      if (this.$refs.FormPreview) {
        formData = this.$refs.FormPreview.getFormvalNovalid();
        hidecomponentList = this.$refs.FormPreview.getHidecomponent();
        readcomponentList = this.$refs.FormPreview.getReadcomponent();
      } else if (this.$refs.formSheet) {
        formData = this.$refs.formSheet instanceof Array ? this.$refs.formSheet[0].getFormData() : this.$refs.formSheet.getFormData(); // 解决固定tab页面时，v-for 和 ref 一起使用时，ref返回的是数组
        hidecomponentList = this.$refs.formSheet instanceof Array ? this.$refs.formSheet[0].getHiddenComponents() : this.$refs.formSheet.getHiddenComponents();
      }
      if (this.actionConfig.save) {
        let data = {
          processTaskId: this.processTaskId,
          processTaskStepId: this.processTaskStepId,
          formAttributeDataList: formData,
          hidecomponentList: hidecomponentList || [],
          content: this.commentObj.content || '',
          fileIdList: this.fileIdList,
          readcomponentList: readcomponentList || []
        };
        if (this.handler == 'changecreate') {
          if (this.$refs.taskReport) {
            let changecreateInfo = this.$refs.taskReport.getChangecreateData();
            Object.assign(handlerStepInfo, changecreateInfo);
          }
          if (this.$refs.changeStepList) {
            let stepData = this.$refs.changeStepList.saveChangeStepData();
            Object.assign(handlerStepInfo, stepData);
          }
          this.$set(data, 'handlerStepInfo', handlerStepInfo);
        }
        this.rightsettingVue = this.rightsettingVue || getParent(this);
        this.rightsettingVue && (data.priorityUuid = this.rightsettingVue.$refs.RightSetting ? this.rightsettingVue.$refs.RightSetting.priorityUuid : this.processTaskConfig.priorityUuid);
        return data;
      }
    },
    getTaskStepContent() {
      let val = null;
      let taskStepContent = this.$refs.replyContent.$refs.taskStepContent;
      if (taskStepContent && taskStepContent.currentValue) {
        val = taskStepContent.currentValue;
      }
      if (this.isRequiredContent && taskStepContent) {
        taskStepContent.valid();
      }
      //步骤内容值
      return val;
    },
    async comment() {
      let complete = await this.submitComment();
      if (complete) {
        this.saveTaskD();
      }
    },
    submitComment() {
      //回复
      return new Promise((resolve, reject) => {
        let data = {
          processTaskId: this.processTaskId,
          processTaskStepId: this.processTaskStepId,
          content: this.getTaskStepContent(),
          auditId: this.auditId,
          commentTemplateId: this.commentTemplateId || null
        };

        if (this.commentObj.fileList && this.commentObj.fileList.length > 0) {
          let fileIdList = this.commentObj.fileList.map(item => {
            return item.id;
          });
          this.$set(data, 'fileIdList', fileIdList);
        }
        this.$api.process.processtask.commentTask(data).then(res => {
          if (res.Status == 'OK') {
            let commentList = (res.Return && res.Return.commentList) || [];
            this.processTaskStepConfig.commentList = commentList;
            this.getActivityList();
            this.getStepStatusList();
            this.auditId = null;
            this.$refs.replyContent && this.$refs.replyContent.clearReplyValue();
            this.$set(this.commentObj, 'content', '');
            this.$set(this.commentObj, 'fileList', []);
            this.fileIdList = [];
            this.isDisableCommet = true;
            resolve(this.isDisableCommet);
          }
        });
      });
    },
    async getcompleteValid() {
      //流转验证表单
      let validList = [];
      let isValidForm = true;
      if (this.$refs.FormPreview) {
        isValidForm = await this.$refs.FormPreview.getFormval({ processTaskId: this.processTaskId });
      } else if (this.$refs.formSheet) {
        isValidForm = await this.formValid(this.processTaskConfig);
      }
      if (!isValidForm) {
        validList.push({
          focus: '#form',
          icon: 'tsfont-close-o',
          iconColor: '#FF625A',
          msg: this.$t('message.process.complete', { target: this.$t('page.form') }),
          type: 'error'
        });
      }
      this.rightsettingVue = this.rightsettingVue || getParent(this);
      let priorityConfig = {
        focus: '#priority'
      };
      if (this.rightsettingVue && this.processTaskConfig.isNeedPriority) {
        if ((this.rightsettingVue.$refs.RightSetting && this.rightsettingVue.$refs.RightSetting.valid()) || this.processTaskConfig.priorityUuid) {
          this.$set(priorityConfig, 'icon', 'ts-complete');
          this.$set(priorityConfig, 'iconColor', '#81D655');
          this.$set(priorityConfig, 'msg', this.$t('message.process.success', { target: this.$t('page.priority') }));
          this.$set(priorityConfig, 'type', 'success');
        } else if (!this.processTaskConfig.priorityUuid) {
          this.$set(priorityConfig, 'icon', 'tsfont-close-o');
          this.$set(priorityConfig, 'iconColor', '#FF625A');
          this.$set(priorityConfig, 'msg', this.$t('message.process.prioritymsg', { target: this.$t('page.priority') }));
          this.$set(priorityConfig, 'type', 'error');
        }
        validList.push(priorityConfig);
      }
      return validList;
    },
    changeValid() {
      //变更校验
      let validList = [];
      validList = this.$refs.taskReport.changeValid();
      if (this.$refs.changeStepList) {
        let changeStepParam = this.$refs.changeStepList.validParam ? this.$refs.changeStepList.validParam() : [];
        if (changeStepParam.length > 0) {
          validList.push(...changeStepParam);
        }
      }
      return validList;
    },
    //排序
    timeSort() {
      this.timeSortIcon = !this.timeSortIcon;
      this.activeData.reverse();
    },
    //变更
    updataActive() {
      this.getActivityList();
    },
    updateStepActive() {
      //更新活动和步骤
      this.getActivityList();
      this.getStepStatusList();
      //更新附件清单
      this.$refs.processTaskFile && this.$refs.processTaskFile.getAllFileList();
    },
    setStepform() {
      //拼接接口返回当前步骤uuid跟流程的表单授权跟表单的最终结果
      this.stephidetrList = [];
      this.stepreadtrList = [];
      this.formAttributeHideList = this.processTaskConfig.formAttributeHideList;
      let authorityList = this.processTaskConfig.formConfigAuthorityList || []; //流程图表单授权
      try {
        let stepuuid = this.processTaskConfig.currentProcessTaskStep.processStepUuid || this.processTaskConfig.startProcessTaskStep.processStepUuid || null;
        let currentFormlist = this.getCurrentFormauth(stepuuid, authorityList) || [];
        let formComlist = this.formConfig && this.formConfig.controllerList ? this.formConfig.controllerList : [];
        //20201111_zqp_需求修改为流程表单默认只读，编辑配置为可编辑（与原逻辑相反）
        //【流程编辑-表单授权修改】 https://www.tapd.cn/54247054/prong/stories/view/1154247054001003628
        if (formComlist.length > 0) {
          formComlist.forEach(form => {
            form['isReadonly'] = true;
          });
        }
        if (currentFormlist.length > 0 && formComlist.length > 0) {
          currentFormlist.forEach(current => {
            if (current.type == 'component') {
              formComlist.forEach(form => {
                //判断组件数据是数组还是老的字符串
                let isMatch = current.attributeUuidList && (current.attributeUuidList.indexOf(form.uuid) > -1 || current.attributeUuidList.indexOf('all') > -1);
                if (isMatch) {
                  if (current.action == 'hide') {
                    form['isHide'] = true;
                  }
                  if (current.action == 'edit') {
                    form['isReadonly'] = false;
                  }
                }
              });
            } else {
              if (current.action == 'hide') {
                this.stephidetrList = this.$utils.concatArr(this.stephidetrList, current.attributeUuidList);
                this.stephidetrList = this.stephidetrList.map(item => parseInt(item)); //把string类型转成number
              }

              if (current.action == 'edit') {
                try {
                  let tableList = this.formConfig.sheetsConfig.tableList;
                  if (current.attributeUuidList && current.attributeUuidList.length > 0) {
                    let showUuidList = [];
                    tableList.forEach((t, tindex) => {
                      let myT = tindex + 1;
                      if (current.attributeUuidList.indexOf(myT) > -1) {
                        if (t && t.length > 0) {
                          t.forEach(titem => {
                            if (titem && typeof titem == 'object' && titem.component) {
                              showUuidList.push(titem.component.uuid);
                            }
                          });
                        }
                      }
                    });
                    if (showUuidList.length > 0) {
                      formComlist.forEach(form => {
                        if (showUuidList.indexOf(form.uuid) > -1) {
                          form['isReadonly'] = false;
                        }
                      });
                    }
                  }
                } catch (error) {
                  console.info(error);
                }
              }
            }
          });
        }
      } catch (error) {
        console.info(error);
      }
    },
    getCurrentFormauth(uuid, authorityList) {
      //把流程里表单授权提出当前步骤的
      let authList = [];
      if (uuid && authorityList && authorityList.length > 0) {
        let allList = authorityList;
        if (allList.length > 0) {
          authList = allList
            .filter(al => {
              return al.processStepUuidList && al.processStepUuidList.length > 0 && al.processStepUuidList.indexOf(uuid) > -1;
            })
            .map(a => {
              return {
                action: a.action,
                attributeUuidList: a.attributeUuidList || [],
                type: a.type
              };
            });
        }
      }
      return authList;
    },
    renderStepList() {
      // 步骤日志
      let labelName = this.getTabPaneLabel('', 'step', 'Steplist');
      return h => {
        return h(
          'div',
          {
            class: ['activity-log-tab', 'tab-padding'],
            on: { mouseover: () => this.handleMouseover('step'), mouseleave: this.handleMouseleave }
          },
          [
            h('span', {
              class: ['text-action', 'tsfont', 'sort-icon', 'text-grey', { 'select-icon-left': this.tabValue == 'step' && this.stepSortIcon }, { 'select-icon-right': this.tabValue == 'step' && !this.stepSortIcon }],
              on: {
                click: this.stepListSort
              }
            }),
            h('span', labelName),
            h('span', { class: this.mouseoverTabName == 'step' || this.tabValue == 'step' ? 'tsfont tsfont-pin-angle-o pl-sm' : '', attrs: { title: this.$t('page.fixedpage') }, on: { click: e => this.handleFixedPage(e, 'step', labelName) } })
          ]
        );
      };
    },
    renderactivity() {
      // 时间线
      let labelName = this.getTabPaneLabel('', 'activity', 'TimeLine');
      return h => {
        return h(
          'div',
          {
            class: ['activity-log-tab', 'tab-padding'],
            on: { mouseover: () => this.handleMouseover('activity'), mouseleave: this.handleMouseleave }
          },
          [
            h('span', {
              class: ['text-action', 'tsfont', 'sort-icon', 'text-grey', { 'select-icon-left': this.tabValue == 'activity' && this.timeSortIcon }, { 'select-icon-right': this.tabValue == 'activity' && !this.timeSortIcon }],
              on: {
                click: this.timeSort
              }
            }),
            h('span', labelName),
            h('span', { class: this.mouseoverTabName == 'activity' || this.tabValue == 'activity' ? 'tsfont tsfont-pin-angle-o pl-sm' : '', attrs: { title: this.$t('page.fixedpage') }, on: { click: e => this.handleFixedPage(e, 'activity', labelName) } })
          ]
        );
      };
    },
    renderTabPaneLabel(h, tabName, labelName) {
      // tab渲染label
      return h(
        'div',
        {
          on: { mouseover: () => this.handleMouseover(tabName), mouseleave: this.handleMouseleave }
        },
        [h('span', { class: this.hasPendingTasks && tabName == 'changeDetails' ? 'require-label' : '' }, labelName), h('span', { class: this.mouseoverTabName == tabName || this.tabValue == tabName ? 'tsfont tsfont-pin-angle-o pl-sm' : '', attrs: { title: this.$t('page.fixedpage') }, on: { click: e => this.handleFixedPage(e, tabName, labelName) } })]
      );
    },
    getTabPaneLabel(h, tabName, labelName) {
      // 获取工单中心tab文案信息
      let replaceableTextList = Object.values(this.replaceableTextConfig);
      if (replaceableTextList && replaceableTextList.length > 0) {
        replaceableTextList.forEach(item => {
          this.tabLabelReplaceableTextConfig[item.name] = item.value || item.text;
        });
      }
      let tabPanelLabelName = this.tabLabelReplaceableTextConfig[`replaceable${labelName}`];
      if (h) {
        return h('div', { on: { mouseover: () => this.handleMouseover(tabName), mouseleave: this.handleMouseleave } }, [h('span', { class: tabName == 'report' && this.hasFormRequiredTask ? 'require-label' : '' }, tabPanelLabelName), h('span', { class: this.mouseoverTabName == tabName || this.tabValue == tabName ? 'tsfont tsfont-pin-angle-o pl-sm' : '', on: { click: e => this.handleFixedPage(e, tabName, tabPanelLabelName) }, attrs: { title: this.$t('page.fixedpage') } }, '')]);
      } else {
        return tabPanelLabelName;
      }
    },
    handleFixedPage(e, tabValue, labelName) {
      // 固定页面
      e.stopPropagation(); // 阻止冒泡，点击固定页面图标时，不触发tab的onClick事件，阻止tabValue值被改变
      this.loadingShow = true;
      this.fixedPageList.push({
        tabValue: tabValue,
        label: labelName
      });
      if (tabValue && this.fixedPageTab.hasOwnProperty(tabValue)) {
        this.fixedPageTab[tabValue] = false;
      }
      this.$nextTick(() => {
        if (this.tabValue == tabValue) {
          this.tabValue = ''; // 当前选中tab是高亮tab时，固定页面后，设置默认选中第一个tab
        }
        this.loadingShow = false; 
      });
    },
    cancelFixedPage(tabValue) {
      // 取消固定页面
      this.loadingShow = true;
      for (let index = 0; index < this.fixedPageList.length; index++) {
        if (this.fixedPageList[index] && this.fixedPageList[index]['tabValue'] == tabValue) {
          this.fixedPageList.splice(index, 1);
          this.$nextTick(() => {
            this.loadingShow = false; // 取消固定页面时，调整tab顺序为初始化时的顺序
            if (tabValue && this.fixedPageTab.hasOwnProperty(tabValue)) {
              this.fixedPageTab[tabValue] = true;
            }
          });
        }
      }
    },
    handleMouseover(tabValue) {
      this.mouseoverTabName = '';
      if (this.tabValue != tabValue) {
        // 当前选中的tab默认显示固定图钉按钮
        this.mouseoverTabName = tabValue;
      }
    },
    handleMouseleave() {
      // 鼠标离开的时候
      this.mouseoverTabName = '';
    },
    getRepeatList() {
      //重复事件列表
      if (this.processTaskId) {
        let data = {
          needPage: false,
          processTaskId: this.processTaskId
        };
        this.$api.process.processtask.getRepeatList(data).then(res => {
          if (res.Status == 'OK') {
            this.repeatList = res.Return.tbodyList || [];
          }
        });
      }
    },
    closeRepeatTab() {
      this.repeatList = [];
      this.tabValue = 'report';
    },
    stepListSort() {
      this.stepSortIcon = !this.stepSortIcon;
      this.stepData.reverse();
      localStorage.setItem('stepSortIcon', this.stepSortIcon);
    },
    getTaskConfigList(list) {
      //子任务策略，权限过滤
      let arr = [];
      if (list && list.length > 0) {
        list.forEach(item => {
          if (item.processTaskStepTaskList && item.processTaskStepTaskList.length > 0) {
            if (this.actionConfig.complete) {
              //有流转权限时，可查看子任务策略
              arr.push(item);
            } else {
              //无权限时，仅可查看自己需要处理的策略任务
              let isReplyable = false;
              let processTaskStepTaskList = [];
              item.processTaskStepTaskList.forEach(s => {
                let findItem = s.stepTaskUserVoList.find(r => r.isReplyable);
                if (findItem) {
                  isReplyable = true;
                  processTaskStepTaskList.push(s);
                }
              });
              if (isReplyable) {
                this.$set(item, 'processTaskStepTaskList', processTaskStepTaskList);
                arr.push(item);
              }
            }
          } else if (this.actionConfig.createtask) {
            //子任务策略创建权限
            arr.push(item);
          }
        });
      }
      return arr;
    },
    formSheetEmitData(data) {
      let defaultPriorityConfig = null;
      let messageConfig = {
        content: '',
        duration: 8,
        top: 50
      };
      if (!this.$utils.isEmpty(data)) {
        //表单联动优先级
        if (!this.$utils.isEmpty(this.priorityList) && !this.$utils.isEmpty(data.changePriority)) {
          let list = [];
          this.priorityList.forEach(item => {
            if (typeof data.changePriority === 'string') {
              if (data.changePriority.includes(item.name)) {
                list.push(item);
              }
            }
            if (Array.isArray(data.changePriority)) {
              if (data.changePriority.join('/').includes(item.name)) {
                list.push(item);
              }
            }
          });
          if (list.length === 1) {
            defaultPriorityConfig = list[0];
          } else if (list.length > 1) {
            messageConfig.content = this.$t('term.process.formpriorityrule');
            this.$Message.error(messageConfig);
            defaultPriorityConfig = {};
          } else if (list.length == 0) {
            //优先级不存在时提示
            messageConfig.content = this.$t('term.process.formpriorityrule');
            this.$Message.error(messageConfig);
            defaultPriorityConfig = {};
          }
        }
      }
      if (!this.$utils.isEmpty(defaultPriorityConfig)) {
        this.rightsettingVue = this.rightsettingVue || getParent(this);
        if (this.rightsettingVue && this.rightsettingVue.$refs.RightSetting) {
          this.rightsettingVue.$refs.RightSetting.setPriorityByForm([defaultPriorityConfig]);
        }
      }
    },
    showRelationDetail(tranferreport, processTaskRelationCount) {
      return tranferreport || processTaskRelationCount;
    },
    updateHiddenComponentList(formValue, hidecomponentList) {
      // 拿到表单实时更新的值
      this.lastFormConfig = {
        formValue: formValue,
        hidecomponentList: hidecomponentList
      };
    }
  },
  computed: {
    getStrategyConfig() {
      // 根据子任务id获取子任务配置信息
      let config = {};
      return tabValue => {
        let subTaskArr = tabValue.split('subTask'); // subTask634741641125888
        let taskId = '';
        if (subTaskArr && subTaskArr.length > 1) {
          taskId = subTaskArr[1]; // 获取任务id
          if (taskId) {
            config = this.taskConfigList.find(item => item.id == taskId);
          }
        }
        return config;
      };
    },
    subTask(h) {
      // 子任务策略
      return item => {
        let temData = [];
        if (item.processTaskStepTaskList) {
          item.processTaskStepTaskList.forEach(i => {
            if (i.stepTaskUserVoList) {
              for (let j = 0; j < i.stepTaskUserVoList.length; j++) {
                if (i.stepTaskUserVoList[j].isReplyable) {
                  temData.push(i);
                  break;
                }
              }
            }
          });
        }
        return h => {
          return h(
            'div',
            {
              on: { mouseover: () => this.handleMouseover(`subTask${item.id}`), mouseleave: this.handleMouseleave }
            },
            [
              h('span', { class: temData && temData.length ? 'require-label' : '' }, item.name), // 待处理子任务，需要高亮
              h('span', { class: this.mouseoverTabName == `subTask${item.id}` || this.tabValue == `subTask${item.id}` ? 'tsfont tsfont-pin-angle-o pl-sm' : '', on: { click: e => this.handleFixedPage(e, `subTask${item.id}`, item.name) }, attrs: { title: this.$t('page.fixedpage') } }, '')
            ]
          );
        };
      };
    },
    downurl() {
      return id => {
        return {
          url: 'api/binary/file/download',
          params: {
            id: id
          }
        };
      };
    },
    haveProcessTask() {
      //存在工单信息：上报内容和表单
      return (haveComment, startHandler, formConfig, processTaskConfig) => {
        let haveContent = false;
        if (haveComment || startHandler == 'changecreate' || !this.$utils.isEmpty(formConfig) || (processTaskConfig && processTaskConfig.isHasOldFormProp == 1)) {
          haveContent = true;
        }
        return haveContent;
      };
    },
    hasForm() {
      // 流程是否配置表单，无表单不显示内容详情tab
      return !!(this.fixedPageTab.report && this.haveProcessTask(this.haveComment, this.startHandler, this.formConfig, this.processTaskConfig) && !this.$utils.isEmpty(this.formConfig));
    },
    hasFormRequiredTask() {
      /* 【内容详情】tab，表单有处理必填的字段，需要高亮【内容详情tab】 
          拿到表单所有必填的组件，过滤掉被隐藏必填的组件，并且必填字段为空时，需要高亮【内容详情tab】
      */
      let hasFormRequired = false;
      let allRequiredComponentUuidList = []; // 拿到所有必填表单组件的uuid
      let formValue = (this.lastFormConfig && this.lastFormConfig.formValue) || '';
      let requiredFormValue = {};
      let hidecomponentList = (this.lastFormConfig && this.lastFormConfig.hidecomponentList) || []; // 被隐藏必填组件列表
      if (!this.$utils.isEmpty(this.formConfig) && !this.$utils.isEmpty(this.formConfig.tableList)) {
        this.formConfig.tableList.forEach(item => {
          if (item && item.component && item.component.uuid && item.component.config && item.component.config.isRequired) {
            if (this.$utils.isEmpty(hidecomponentList) || (!this.$utils.isEmpty(hidecomponentList) && !hidecomponentList.includes(item.component.uuid))) {
              allRequiredComponentUuidList.push(item.component.uuid); // 拿到显示必填组件uuid列表
            }
          }
        });
        // 拿到必填表单字段的值
        for (let key in formValue) {
          if (key && allRequiredComponentUuidList.includes(key)) {
            requiredFormValue[key] = formValue[key];
          }
        }
        // 过滤表单必填字段，但为空的值
        if (!this.$utils.isEmpty(allRequiredComponentUuidList)) {
          for (let key of allRequiredComponentUuidList) {
            if (!this.$utils.isEmpty(requiredFormValue) && this.$utils.isEmpty(requiredFormValue[key])) {
              hasFormRequired = true;
            }
          }
        }
      }
      return hasFormRequired;
    }
  },
  watch: {
    processTaskConfig: {
      handler(val, oldval) {
        if (val.id && ((oldval && val.id != oldval.id) || !oldval)) {
          this.initData();
        }
        if (val && ((oldval && val.id != oldval.id) || !oldval) && val.formAttributeDataMap) {
          this.$nextTick(() => {
            if (this.$refs.FormPreview) {
              this.$refs.FormPreview.updateFormval(this.processTaskConfig.formAttributeDataMap);
              this.update();
            }
          });
        } else if (val != oldval) {
          this.update();
        }
      },
      deep: true,
      immediate: true
    },
    processTaskStepConfig: {
      handler(val) {
        if (val && val.comment) {
          if ((val.comment.fileList && val.comment.fileList.length > 0) || val.comment.content) {
            this.commentObj = val.comment;
            this.isDisableCommet = false;
          } else {
            this.isDisableCommet = true;
          }
        }
      },
      deep: true,
      immediate: true
    },
    defaultProcessTaskId(val) {
      this.taskLoading = true;
    },
    newTaskContent(val) {
      if (val != this.defaultTaskContent) {
        this.isTaskSave = false;
      } else {
        this.isTaskSave = true;
      }
    },
    draftFile: {
      handler(val) {
        if (val && JSON.stringify(val) != JSON.stringify(this.defaultTaskFileList)) {
          this.isTaskSave = false;
        } else {
          this.isTaskSave = true;
        }
      },
      deep: true
    },
    isDisableCommet: {
      handler(val) {
        this.$emit('changeDisableCommet', val);
      },
      immediate: true,
      deep: true
    }
  }
};
function getParent(node) {
  let list = ['taskDispatch', 'taskDeal'];
  if (node && node.$parent) {
    let tag = node.$parent.$options.tagComponent;
    if (list.indexOf(tag) >= 0) {
      return node.$parent;
    } else if (node.$parent) {
      return getParent(node.$parent);
    } else {
      return false;
    }
  } else {
    return false;
  }
}
</script>
<style lang="less">
@import '~@/resources/assets/css/process/taskdetail.less';
.reply-poptip {
  z-index: 999 !important;
}
</style>
<style lang="less" scoped>
/deep/.ivu-tabs-bar {
  margin-bottom: 0px !important;
}
/deep/ .subTask-label {
  font-size: 12px;
  margin-left: 4px;
  border-radius: 16px;
  padding: 2px 6px;
}
.report-changecreate {
  border-top: 1px solid;
  padding-top: 16px;
  margin-top: 16px;
}
.CenterDetail {
  height: 100%;
  overflow-y: scroll;
}
</style>
