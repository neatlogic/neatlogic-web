<template>
  <div class="CenterDetail">
    <div
      id="CenterDetailMain"
      ref="mainBody"
      class="form-main"
    >
      <div ref="mainBodyinner">
        <!-- 工单信息 -->
        <div ref="commonMain" class="common-main">
          <Tabs
            v-model="tabValue"
            class="block-tabs"
            :animated="false"
            name="tab1"
            @on-click="initHeight()"
          >
            <TabPane
              :label="getTabPaneLabel('Reportcontent')"
              name="report"
              class="tab-content"
              tab="tab1"
              :style="setContentHeight(contentHeight)"
            >
              <div v-if="haveProcessTask(haveComment, startHandler, formConfig, processTaskConfig)" class="pt-nm pb-nm">
                <div class="pl-nm pr-nm">
                  <Report
                    ref="taskReport"
                    :processTaskConfig="processTaskConfig"
                    :actionConfig="actionConfig"
                    :processTaskId="processTaskId"
                    :processTaskStepId="processTaskStepId"
                
                    @saveTaskD="saveTaskD"
                    @upActivityList="updateStepActive()"
                  >
                    <template v-if="startHandler=='changecreate'" v-slot:changeStep>
                      <!-- 变更 -->
                      <div v-if="handler == 'changecreate' && (actionConfig.complete || (handlerStepInfo.changeStepList && handlerStepInfo.changeStepList.length >0))" class="report-changecreate border-color">
                        <ChangecreateStep ref="changeStepList" :isComplete="actionConfig.complete? true: false" :handlerStepInfo="handlerStepInfo"></ChangecreateStep>
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
                <div v-if="!$utils.isEmpty(formConfig)" id="form" class="form-view">
                  <div v-if="haveComment || startHandler=='changecreate'" class="form-line border-color">
                    <div
                      class="text-tip-active form-show bg-op border-color"
                      :class="isShowForm ? 'tsfont-down' : 'tsfont-up'"
                      @click="showForm"
                    ></div>
                  </div>
                  <template v-if="formConfig._type == 'new'">
                    <TsSheet
                      v-show="isShowForm"
                      ref="formSheet"
                      mode="read"
                      :value="formConfig"
                      :data="processTaskConfig.formAttributeDataMap"
                      :disabled="!actionConfig.save || !formEdit"
                      class="pl-sm pr-sm"
                      @emit="formSheetEmitData"
                    ></TsSheet>
                  </template>
                  <template v-else>
                    <FormPreview
                      v-show="isShowForm"
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
                  <div v-if="haveComment || startHandler=='changecreate'" class="form-line border-color">
                    <div
                      class="text-tip-active form-show bg-op border-color"
                      :class="isShowForm ? 'tsfont-down' : 'tsfont-up'"
                      @click="showForm"
                    ></div>
                  </div>
                  <FormPreviewHtml
                    v-show="isShowForm"
                    ref="FormPreview"
                    class="block-content"
                    lass="order-list"
                    :processTaskId="processTaskId"
                  ></FormPreviewHtml>
                </div>
              </div>
              <!-- 步骤信息 -->
              <div v-if="processTaskStepConfig && handler != 'timer'" class="step-main" :class="{'border-color step-line':haveProcessTask(haveComment, startHandler, formConfig, processTaskConfig)}">
                <Tabs                  
                  v-model="TabsVal"
                  class="block-tabs2"
                  :animated="false"
                  name="tab2"
                >
                  <TabPane
                    v-if="isShowStep"
                    :label="$t('term.process.stepinfor')"
                    name="step"
                    tab="tab2"
                    class="padding"
                  >
                    <!-- 变更创建s -->
                    <slot name="changecreate"></slot>
                    <!-- 变更创建end -->
                    <!-- 变更处理s -->
                    <slot name="changehandle"></slot>
                    <!-- 变更处理end -->
                    <!-- 自动化节点s -->
                    <slot name="autoexec"></slot>
                    <!-- 自动化节点end -->
                    <!-- 回复 -->
                    <div v-if="handler != 'event' && (actionConfig.comment || (processTaskStepConfig && processTaskStepConfig.commentList && processTaskStepConfig.commentList.length > 0))" id="content" class="reply-box-margin-bottom order-list comment-box">
                    
                      <div :class="[processTaskStepConfig && processTaskStepConfig.commentList && processTaskStepConfig.commentList.length > 0 ? 'comment-tip' : '']">
                        <span>{{ $t('page.reply') }}</span>
                      </div>
                      <div v-if="processTaskStepConfig && processTaskStepConfig.commentList && processTaskStepConfig.commentList.length > 0" class="comment-list">
                        <div
                          v-for="(pcomment, pindex) in processTaskStepConfig.commentList"
                          :key="pindex"
                          class="order-comment"
                        >
                          <div class="step-userimg">
                            <UserCard v-bind="pcomment.fcuVo" :iconSize="24" hideName></UserCard>
                          </div>
                          <div class="comment-detail">
                            <div class="user-name text-grey">
                              <UserCard v-bind="pcomment.fcuVo" hideAvatar></UserCard>
                            </div>
                            <div v-if="!pcomment.editContent">
                              <div v-imgViewer v-html="pcomment.content"></div>
                              <div v-if="pcomment.fileList && pcomment.fileList.length > 0">
                                <TsRow>
                                  <Col v-for="(file, flindex) in pcomment.fileList" :key="flindex" span="12">
                                    <div class="file-list-down">
                                      <span class="tsfont-attachment text-grey">{{ file.name }}</span>
                                      <i v-download="downurl(file.id)" class="tsfont-download text-action text-padding"></i>
                                    </div>
                                  </Col>
                                </TsRow>
                              </div>
                              <div v-if="pcomment.isDeletable == 1 || pcomment.isEditable == 1" class="comment-btn">
                                <Button v-if="pcomment.isEditable == 1" size="small" @click="editComment(pcomment)">{{ $t('button.add') }}</Button>
                                <Button v-if="pcomment.isDeletable == 1" size="small" @click="delComment(pcomment.id)">{{ $t('button.delete') }}</Button>
                              </div>
                              <div class="text-grey fz10 comment-time">{{ pcomment.fcd | formatDate }}</div>
                            </div>
                            <div v-show="pcomment.editContent" class="comment-content">
                              <div class="order-list">
                                <TsCkeditor v-model="pcomment.content" width="100%" :showIconToggle="true"></TsCkeditor>
                              </div>
                              <TsUpLoad
                                ref="uploadFile"
                                styleType="button"
                                :defaultList="pcomment.fileList"
                                className="smallUpload"
                                :dataType="handler == 'changecreate'||handler == 'changehandle'?'change':'itsm'"
                                :multiple="uploadMultiple"
                                @getFileList="res => handleSuccess(res, pindex)"
                                @remove="res => commentRemoveTastFile(res, pindex)"
                              ></TsUpLoad>
                              <div class="comment-btn">
                                <Button size="small" @click="cancelComment(pcomment, pindex)">{{ $t('button.cancel') }}</Button>
                                <Button size="small" type="primary" @click="completeComment(pcomment, pindex)">{{ $t('page.complete') }}</Button>
                              </div>
                            </div>
                            <div class="comment-border dividing-color"></div>
                          </div>
                        </div>
                      </div>
                      <div v-if="actionConfig.comment" class="center-detail-upload-wrap">
                        <span class="attachment-text title">{{ $t('page.accessory') }}</span>
                        <TsUpLoad
                          ref="uploadFileComment"
                          className="smallUpload"
                          styleType="text"
                          :dataType="handler == 'changecreate'||handler == 'changehandle'?'change':'itsm'"
                          rowSpan="24"
                          :multiple="uploadMultiple"
                          :defaultList="commentObj.fileList && commentObj.fileList.length > 0?commentObj.fileList :[]"
                          @getFileList="getFileList"
                          @remove="removeCommentFile"
                        ></TsUpLoad>
                      </div>
                      <div v-if="actionConfig.comment" class="reply-template-position-box">
                        <div class="reply-template-position">
                          <!-- 回复模板start -->
                          <div class="content-template">
                            <div class="comment-modules">
                              <Poptip
                                v-model="replyVisible"
                                placement="top-end"
                                width="750"
                                transfer
                                popperClass="reply-poptip"
                              >
                                <span class="text-href">
                                  {{ $t('page.replytemplate') }}
                                </span>
                                <div slot="content">
                                  <ReplyTemplate :content="commentObj.content" @selectTemplate="selectTemplate"></ReplyTemplate>
                                </div>
                              </Poptip>
                            </div>
                          </div>
                        </div>
                      </div>
                     
                      <div v-if="actionConfig.comment">
                        <div>
                          <TsCkeditor
                            ref="taskStepContent"
                            v-model="commentObj.content"
                            :showIconToggle="true"
                            width="100%"
                            :validateList="isRequiredContent? validateList : []"
                            @change="commentContent"
                          ></TsCkeditor>
                        </div>
                        <!-- <div class="comment-save">
                          <Button v-if="actionConfig.save" @click="saveTaskD()">{{ actionConfig.save }}</Button>
                          <Button
                            v-if="actionConfig.comment"
                            type="primary"
                            :disabled="isDisableCommet"
                            :title="isDisableCommet ? '回复框或附件不为空时允许点击' : null"
                            @click="comment"
                          >{{ actionConfig.comment }}</Button>
                        </div> -->
                      </div> 
                    </div>
                    <!-- 回复 end-->
                    <!-- 事件s -->
                    <slot name="event"></slot>
                    <!-- 事件_end -->
                    <!-- auto回调 -->
                    <slot name="automatic"></slot>
                    <!-- auto回调 end-->
                  </TabPane>
                  <TabPane
                    v-if="isShowStep && processTaskStepConfig && processTaskStepConfig.processTaskStepSubtaskList && processTaskStepConfig.processTaskStepSubtaskList.length > 0"
                    :label="subTasklabel(processTaskStepConfig.processTaskStepSubtaskList)"
                    name="subStep"
                    tab="tab2"
                  >
                    <!-- 子任务 -->
                    <SubtaskDetail
                      :processTaskId="processTaskId"
                      :processTaskStepId="processTaskStepId"
                      :list="processTaskStepConfig.processTaskStepSubtaskList"
                      :replaceableTextConfig="replaceableTextConfig"
                      @addAssist="addAssist"
                      @getStepStatusList="getStepStatusList"
                    ></SubtaskDetail>
                    <!-- 子任务end -->
                  </TabPane>
                  <!-- 子任务策略 -->
                  <TabPane      
                    v-for="subStep in taskConfigList"
                    :key="subStep.id"   
                    :label="subTask(subStep)"
                    :name="'subTask' + subStep.id"
                    tab="tab2"
                  >
                    <StrategyDetail
                      :processTaskId="processTaskId"
                      :processTaskStepId="processTaskStepId"
                      :actionConfig="actionConfig"
                      :config="subStep"
                      @getStepList="getStepList"
                    ></StrategyDetail>
                  </TabPane>
                </Tabs>
              </div>
              <!-- 用户评分 -->
              <ScoreEdit
                v-if="processTaskConfig.scoreTemplateVo"
                :processTaskConfig="processTaskConfig"
                :actionConfig="actionConfig"
                :processTaskId="processTaskConfig.id"
              ></ScoreEdit>
              <slot name="replyBtn"></slot>
            </TabPane>
            <TabPane
              :label="renderStepList()"
              name="step"
              class="padding tab-content"
              tab="tab1"
              :style="setContentHeight(contentHeight)"
            >
              <div v-if="stepData && stepData.length > 0" class="activity-log-content">
                <StepOverview
                  :processTaskId="processTaskId"
                  :processTaskStepId="processTaskStepId"
                  :defaultStepData="stepData"
                  :currentStepId="defaultProcessTaskStepId"
                  :processTaskConfig="processTaskConfig"
                ></StepOverview>
              </div>
              <Loading v-else :loadingShow="true" type="fix"></Loading>
            </TabPane>
            <TabPane
              id="CurrentProcessTaskStep"
              :label="renderactivity()"
              name="activity"
              class="padding tab-content"
              tab="tab1"
              :style="setContentHeight(contentHeight)"
            >
              <div class="activity-log-content">
                <Loading :loadingShow="activityLoading" type="fix"></Loading>
                <ActivityOverview :defaultActiveData="activeData"></ActivityOverview>
              </div>
            </TabPane>
            <TabPane
              :label="getTabPaneLabel('Relationlist')"
              name="relevance"
              class="tab-content"
              tab="tab1"
            >
              <RelationDetail
                :processTaskConfig="processTaskConfig"
                :relationAuth="actionConfig.tranferreport"
                :contentHeight="contentHeight"
                @upActivityList="updateStepActive()"
              ></RelationDetail>
            </TabPane>
            <template v-if="actionConfig.markrepeat || repeatList.length > 0">
              <TabPane
                :label="$t('term.process.repeatedevent')"
                name="markrepeat"
                class="tab-content"
                tab="tab1"
              >
                <MarkRepeat
                  :processTaskId="processTaskId"
                  :actionConfig="actionConfig"
                  :contentHeight="contentHeight"
                  :repeatList="repeatList"
                  @closeRepeatTab="closeRepeatTab"
                ></MarkRepeat>
              </TabPane>
            </template>
            <!-- 附件清单 -->
            <FileTable ref="processTaskFile" :processTaskId="processTaskId" :contentHeight="contentHeight"></FileTable>
          </Tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TsCkeditor from '@/resources/plugins/TsCkeditor/TsCkeditor.vue';
import TsUpLoad from '@/resources/components/UpLoad/UpLoad.vue';
import FormPreview from '@/resources/components/FormMaker/formview/form-view.vue';
import FormPreviewHtml from '@/resources/components/FormMaker/formview/form-view-html.vue';
import ReplyTemplate from './reply/reply-template';
import Report from '@/views/pages/process/task/processdetail/workorder/report/report';
import imgViewer from '@/resources/directives/img-viewer.js';
import scrollHidden from '@/resources/directives/scroll-hidden.js';
import download from '@/resources/directives/download.js';
import dealFormMix from '@/views/pages/process/task/taskcommon/dealNewFormData.js';

export default {
  name: 'CenterDetail',
  components: {
    TsUpLoad,
    FormPreview,
    FormPreviewHtml,
    TsCkeditor,
    Report,
    ActivityOverview: resolve => require(['./activity/activity-overview.vue'], resolve),
    StepOverview: resolve => require(['./taskstep/step-overview.vue'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    SubtaskDetail: resolve => require(['./subtask/subtask-detail.vue'], resolve),
    StrategyDetail: resolve => require(['./strategy/strategy-detail.vue'], resolve),
    ReplyTemplate,
    RelationDetail: resolve => require(['./relation/relation-detail.vue'], resolve),
    ChangeDetail: resolve => require(['./change/change-detail.vue'], resolve),
    ChangecreateStep: resolve => require(['./change/changecreate-detail'], resolve),
    ScoreEdit: resolve => require(['./score/score-edit.vue'], resolve),
    MarkRepeat: resolve => require(['./markrepeat/mark-repeat.vue'], resolve),
    FileTable: resolve => require(['./file-table'], resolve),
    TsSheet: resolve => require(['@/resources/plugins/TsSheet/TsSheet.vue'], resolve)
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
    priorityList: { //优先级列表
      type: Array,
      default: () => []
    }
  },
  data() {
    let _this = this;
    let showFormValueConfig = _this.processTaskConfig.formAttributeDataMap;
    return {
      toolbar: [],
      tabValue: 'report',
      TabsVal: 'step', // 步骤tab默认显示名称
      isStepRequired: 0, //回复必填：1必填，0非必填
      validateList: ['required'],
      commentList: [], //回复列表（用于编辑前后对比）
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
      activityLoading: true,
      fileIdList: null, //回复文件上传列表
      taskFileUuidList: null, //工单文件上传
      uploadMultiple: true,
      processTaskId: _this.defaultProcessTaskId, //工单id
      processTaskStepId: _this.defaultProcessTaskStepId, //步骤id
      auditId: null, //活动id
      formValueConfig: showFormValueConfig, //表单值
      buttonLog: '1', //活动日志
      activeData: [], //按活动分
      stepContent: null, //描述
      selectStepId: _this.defaultProcessTaskStepId,
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
      replyVisible: false, //回复模板弹框
      commentTemplateId: null, //选中的回复模板
      isShowForm: true, //展示表单
      contentHeight: '100px',
      startHandler: 'omnipotent', //开始节点的类型：omnipotent(普通节点)、changecreate(变更创建)
      handler: 'omnipotent', //处理节点类型
      isShowStep: false,
      repeatList: [], //重复事件列表
      tabLabelReplaceableTextConfig: {
        replaceableReportcontent: this.$t('term.process.reportcontent'), // 接口返回替换文案列表为空时默认值：上报内容
        replaceableSteplist: this.$t('term.process.steplog'), // 接口返回替换文案列表为空时默认值：步骤日志
        replaceableAuditlist: this.$t('term.process.activitylog'), // 接口返回替换文案列表为空时默认值：活动日志
        replaceableRelationlist: this.$t('term.process.reltask') // 接口返回替换文案列表为空时默认值：关联工单
      },
      stepSortIcon: false, // 步骤排序(true正序，false倒序)
      taskConfigList: [] //子任务策略
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
    let _this = this;
    _this.$nextTick(() => {
      _this.timerForm = setInterval(() => {
        if (_this.$refs.FormPreview) {
          _this.$refs.FormPreview.updateFormval(_this.processTaskConfig.formAttributeDataMap);
          _this.$nextTick(() => {
            _this.$emit('update', _this.getData());
          });
        }
        _this.taskLoading = false;
        _this.clear();
      }, 1000);

      if (this.processTaskStepConfig && this.processTaskStepConfig.commentTemplate && !this.commentObj.content) {
        this.commentObj.content = this.processTaskStepConfig.commentTemplate.content;
        this.commentTemplateId = this.processTaskStepConfig.commentTemplate.id;
      }
      this.initHeight();
      window.addEventListener('resize', _this.initHeight);
    });
  },
  beforeDestroy() {
    let _this = this;
    window.removeEventListener('resize', _this.initHeight);
  },
  methods: {
    getTabPaneLabel(labelName) {
      // 获取工单中心tab文案信息
      let replaceableTextList = Object.values(this.replaceableTextConfig);
      if (replaceableTextList && replaceableTextList.length > 0) {
        replaceableTextList.forEach((item) => {
          this.tabLabelReplaceableTextConfig[item.name] = item.value || item.text;
        });
      }
      return this.tabLabelReplaceableTextConfig[`replaceable${labelName}`];
    },
    filterCustommergeprocess(formConfig) {
      // 过滤苏州银行定制批量合并上报组件
      let data = this.$utils.deepClone(formConfig);
      if (formConfig && formConfig.controllerList instanceof Array && formConfig.controllerList.length > 0 && process.env.VUE_APP_LOGINTITLE == 'neatlogic') {
        let arr = formConfig.controllerList.filter((val) => {
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
      }
      if (processTaskStepConfig && processTaskStepConfig.commentList && processTaskStepConfig.commentList.length > 0) {
        let commentList = JSON.parse(JSON.stringify(processTaskStepConfig.commentList));
        commentList.forEach(item => {
          this.$set(item, 'editContent', false);
        });
        this.commentList = commentList;
      }
      //变更
      let handlerStepInfo = null;
      if (processTaskStepConfig && processTaskStepConfig.handlerStepInfo) {
        handlerStepInfo = processTaskStepConfig.handlerStepInfo;
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
      //展示步骤信息isShowStep
      if (this.actionConfig.complete || this.actionConfig.comment) {
        this.isShowStep = true;
      } else if (processTaskStepConfig) {
        //子任务
        if (processTaskStepConfig.processTaskStepSubtaskList && processTaskStepConfig.processTaskStepSubtaskList.length > 0) {
          this.isShowStep = true;
        }
        //回复
        if (processTaskStepConfig.commentList && processTaskStepConfig.commentList.length > 0) {
          this.isShowStep = true;
        }
        //auto回调
        if (processTaskStepConfig.processTaskStepData && processTaskStepConfig.processTaskStepData.isStepUser == 1) {
          this.isShowStep = true;
        }
        //变更 
        if (this.changeStepList && this.changeStepList.length > 0) {
          this.isShowStep = true;
        }
      }

      if (!this.isShowStep && this.taskConfigList.length > 0) {
        this.TabsVal = 'subTask' + this.taskConfigList[0].id;
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
      this.$api.process.processtask
        .getAuditList(data)
        .then(res => {
          if (res.Status == 'OK') {
            let activeList = res.Return;
            this.activityLoading = false;
            this.activeData.splice(0);
            activeList.forEach(active => {
              if (active.auditDetailList && active.auditDetailList.length > 0) {
                this.$set(active, 'isShow', false);
              }
            });
            this.activeData = activeList;
          }
        })
        .catch(error => {});
    },

    getStepStatusList() {
      //步骤状态
      let data = {
        processTaskId: this.processTaskId
      };
      this.$api.process.processtask
        .getStepStatusList(data)
        .then(res => {
          if (res.Status == 'OK') {
            this.stepData = res.Return;
            !this.stepSortIcon && this.stepData.reverse();
            if (this.stepData && this.stepData.length > 0) {
              this.stepData.forEach(item => {
                this.$set(item, 'isShow', false);
              });
            }
          }
        })
        .catch(error => {});
    },
    saveTaskD() {
      //暂存
      if (this.actionConfig.save) {
        let data = this.getData();
        this.$api.process.processtask.saveTaskDetail(data).then(res => {
          if (res.Status == 'OK') {
            this.auditId = res.Return;
            this.$emit('update', data);
            this.$Message.success(this.$t('page.saved', {target: this.$utils.getCurrenttime('HH:mm:ss')}));
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
        formData = this.$refs.formSheet.getFormData();
        hidecomponentList = this.$refs.formSheet.getHiddenComponents();
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
      if (this.$refs.taskStepContent && this.$refs.taskStepContent.currentValue) {
        val = this.$refs.taskStepContent.currentValue;
      }
      if (this.isRequiredContent) {
        this.$refs.taskStepContent.valid();
      }
      //步骤内容值
      return val;
    },
    async comment() {
      let _this = this;
      let complete = await _this.submitComment();
      if (complete) {
        _this.saveTaskD();
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

        let _this = this;
        this.$api.process.processtask.commentTask(data).then(res => {
          if (res.Status == 'OK') {
            let commentList = res.Return.commentList || [];
            _this.processTaskStepConfig.commentList = commentList;
            _this.commentList = commentList;
            _this.getActivityList();
            _this.getStepStatusList();
            _this.auditId = null;
            _this.$refs.uploadFileComment.handleClearFiles();
            _this.$refs.taskStepContent.currentValue = '';
            _this.$set(_this.commentObj, 'content', '');
            _this.$set(_this.commentObj, 'fileList', []);
            _this.fileIdList = [];
            _this.isDisableCommet = true;
            resolve(_this.isDisableCommet);
          }
        });
      });
    },
    delComment(id) {
      //回复列表：删除
      let data = {
        id: id
      };
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('page.replycontent')}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.process.processtask
            .deleteComment(data)
            .then(res => {
              if (res.Status == 'OK') {
                let commentList = res.Return.commentList || [];
                this.processTaskStepConfig.commentList = commentList;
                this.commentList = commentList;
                this.getActivityList();
                this.getStepStatusList();
              }
            })
            .catch(error => {});
          vnode.isShow = false;
        },
        'on-cancel': vnode => {
          vnode.isShow = false;
        }
      });
    },
    editComment(obj) {
      //回复列表：编辑
      this.$set(obj, 'editContent', true);
    },
    completeComment(obj, index) {
      //回复列表：完成
      let data = {
        id: obj.id,
        content: obj.content,
        fileIdList: []
      };
      if (obj.content) {
        this.$set(data, 'content', obj.content);
      }
      if (obj.fileList && obj.fileList.length > 0) {
        let fileIdList = [];
        obj.fileList.forEach(item => {
          fileIdList.push(item.id);
        });
        this.$set(data, 'fileIdList', fileIdList);
      }
      this.$api.process.processtask
        .editComment(data)
        .then(res => {
          if (res.Status == 'OK') {
            let commentList = res.Return.commentList || [];
            this.processTaskStepConfig.commentList = commentList;
            this.commentList = commentList;
            this.getActivityList();
            this.getStepStatusList();
          }
        })
        .catch(error => {});
    },
    cancelComment(item, index) {
      //回复列表：取消
      let obj = this.commentList.find(d => d.id == item.id);
      if (obj) {
        this.$set(item, 'editContent', false);
        this.$set(item, 'content', obj.content);
        this.$set(item, 'fileList', obj.fileList);
      }
    },
    handleSuccess(res, index) {
      this.processTaskStepConfig.commentList[index].fileList = res;
    },
    commentRemoveTastFile(res, index) {
      this.processTaskStepConfig.commentList[index].fileList = res;
    },
    commentContent(val) {
      if (val && val.trim()) {
        this.$set(this.commentObj, 'content', val);
        this.isDisableCommet = false;
      } else {
        if (this.fileIdList && this.fileIdList.length > 0) {
          this.isDisableCommet = false;
        } else {
          this.isDisableCommet = true;
        }
      }
    },
    async getcompleteValid() {
      //流转验证表单
      let validList = [];
      let isValidForm = true;
      if (this.$refs.FormPreview) {
        isValidForm = await this.$refs.FormPreview.getFormval({processTaskId: this.processTaskId});
      } else if (this.$refs.formSheet) {
        isValidForm = this.formValid(this.processTaskConfig);
      }
      if (!isValidForm) {
        validList.push({
          focus: '#form',
          icon: 'tsfont-close-o',
          iconColor: '#FF625A',
          msg: this.$t('message.content.process.complete', {target: this.$t('term.process.form')}),
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
          this.$set(priorityConfig, 'msg', this.$t('message.content.process.success', {target: this.$t('page.priority')}),);
          this.$set(priorityConfig, 'type', 'success');
        } else if (!this.processTaskConfig.priorityUuid) {
          this.$set(priorityConfig, 'icon', 'tsfont-close-o');
          this.$set(priorityConfig, 'iconColor', '#FF625A');
          this.$set(priorityConfig, 'msg', this.$t('message.content.process.prioritymsg', {target: this.$t('page.priority')}));
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
    getFileList(val) {
      //获取上传文件列表
      let fileList = val;
      if (fileList && fileList.length > 0) {
        this.$set(this.commentObj, 'fileList', fileList);
        let newArray = [];
        fileList.forEach(item => {
          let fileId = item.id;
          newArray.push(fileId);
        });
        this.fileIdList = newArray;
        this.isDisableCommet = false;
      } else {
        if (!this.commentObj.content) {
          this.isDisableCommet = true;
        } else {
          this.isDisableCommet = false;
        }
      }
    },
    removeCommentFile(val) {
      let _this = this;
      this.$set(_this.commentObj, 'fileList', val);
      if (val && val.length > 0) {
        _this.fileIdList = val.map(item => {
          return item.id;
        });
        _this.isDisableCommet = false;
      } else {
        _this.fileIdList = [];
        if (!_this.commentObj.content) {
          _this.isDisableCommet = true;
        } else {
          _this.isDisableCommet = false;
        }
      }
    },
    //排序
    timeSort() {
      this.timeSortIcon = !this.timeSortIcon;
      this.activeData.reverse();
    },
    //获取回复的内容和附件
    getComment() {},
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
      let _this = this;
      _this.stephidetrList = [];
      _this.stepreadtrList = [];
      this.formAttributeHideList = this.processTaskConfig.formAttributeHideList;
      let authorityList = this.processTaskConfig.formConfigAuthorityList || [];//流程图表单授权
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
                  // if (current.action == 'read') {
                  //   form['isReadonly'] = true;
                  // }
                  if (current.action == 'edit') {
                    form['isReadonly'] = false;
                  }
                }
              });
            } else {
              if (current.action == 'hide') {
                _this.stephidetrList = _this.$utils.concatArr(_this.stephidetrList, current.attributeUuidList);
                _this.stephidetrList = _this.stephidetrList.map(item => parseInt(item)); //把string类型转成number
              }
              // if (current.action == 'read') {
              //   _this.stepreadtrList = _this.$utils.concatArr(_this.stepreadtrList, current.attributeUuidList);
              // }

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
          // console.log(formComlist);
        }
      } catch (error) {
        //
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
    //选中回复模板
    selectTemplate(val) {
      this.commentTemplateId = val.id;
      this.commentObj.content = val.content;
      this.replyVisible = false;
    },
    renderactivity() {
      let _this = this;
      return h => {
        return h(
          'div',
          {
            class: ['activity-log-tab', 'tab-padding']
          },
          [
            h('span', {
              class: ['text-action', 'tsfont', 'sort-icon', 'text-grey', { 'select-icon-left': this.tabValue == 'activity' && this.timeSortIcon }, { 'select-icon-right': this.tabValue == 'activity' && !this.timeSortIcon }],
              on: {
                click: _this.timeSort
              }
            }),
            h('span', _this.getTabPaneLabel('Auditlist'))
          ]
        );
      };
    },
    showForm() {
      this.isShowForm = !this.isShowForm;
    },
    initHeight() {
      this.contentHeight = window.innerHeight - (this.$refs.commonMain ? this.$refs.commonMain.getBoundingClientRect().top : 0) - 16 - 32;
    },
    subTasklabel(list) {
      let number = list.length;
      let label = this.$t('term.process.subtask');
      if (this.replaceableTextConfig['replaceable_subtask']) {
        label = this.replaceableTextConfig['replaceable_subtask'].value || this.replaceableTextConfig['replaceable_subtask'].text;
      }
      return (h) => {
        return h('div', [
          h('span', label),
          h('span',
            {
              class: ['bg-error', 'subTask-label', 'ivu-btn-error']
            },   
            number
          )
        ]);
      };
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
    renderStepList() {
      let _this = this;
      return h => {
        return h(
          'div',
          {
            class: ['activity-log-tab', 'tab-padding']
          },
          [
            h('span', {
              class: ['text-action', 'tsfont', 'sort-icon', 'text-grey', { 'select-icon-left': this.tabValue == 'step' && this.stepSortIcon }, { 'select-icon-right': this.tabValue == 'step' && !this.stepSortIcon }],
              on: {
                click: _this.stepListSort
              }
            }),
            h('span', _this.getTabPaneLabel('Steplist'))
          ]
        );
      };
    },
    stepListSort() {
      this.stepSortIcon = !this.stepSortIcon;
      this.stepData.reverse();
      localStorage.setItem('stepSortIcon', this.stepSortIcon);
    },
    getTaskConfigList(list) { //子任务策略，权限过滤
      let arr = [];
      if (list && list.length > 0) {
        list.forEach(item => {
          if (item.processTaskStepTaskList && item.processTaskStepTaskList.length > 0) {
            if (this.actionConfig.complete) { //有流转权限时，可查看子任务策略
              arr.push(item);
            } else { 
              //无权限时，仅可查看自己需要处理的策略任务
              let isReplyable = false;
              let processTaskStepTaskList = [];
              item.processTaskStepTaskList.forEach((s) => {
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
          } else if (this.actionConfig.createtask) { //子任务策略创建权限
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
            } if (Array.isArray(data.changePriority)) {
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
          } else if (list.length == 0) { //优先级不存在时提示
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
    }
  },
  computed: {
    subTask(h) {
      return (item) => {
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
          return h('div', [
            h('span', item.name),
            temData && temData.length ? h('span', { class: ['subTask-label', 'bg-error', 'text-op']}, temData.length) : null
          ]);
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
    setContentHeight() {
      return height => {
        return { height: typeof height == 'number' ? height + 'px' : height };
      };
    },
    isRequiredContent() { //回复必填判断
      let valid = false;
      if (this.isStepRequired) {
        if (!this.processTaskStepConfig.commentList.length) {
          valid = true;
        } else if (this.processTaskStepConfig.commentList.length) {
          let startTime = this.processTaskStepConfig.startTime;
          let lcd = this.processTaskStepConfig.commentList[0].lcd; 
          startTime > lcd && (valid = true);
        }
      }
      return valid;
    },
    haveProcessTask() { //存在工单信息：上报内容和表单
      return (haveComment, startHandler, formConfig, processTaskConfig) => {
        let haveContent = false;
        if (haveComment || startHandler == 'changecreate' || !this.$utils.isEmpty(formConfig) || (processTaskConfig && processTaskConfig.isHasOldFormProp == 1)) {
          haveContent = true;
        }
        return haveContent;
      };
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
          }, 500);
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
        // console.log(this.commentObj,'this.commentObj');
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
.center-detail-upload-wrap {
  position: relative;
  margin-top: 10px;
  .attachment-text {
    display: inline-block;
    margin-right: 16px;
    font-size: 13px;
  }
  /deep/ .ivu-upload {
    position: absolute;
    top: 0;
    left: 9px;
  }
}
.reply-template-position-box {
  position: relative;
  width: 100%;
  height: 10px;
  .reply-template-position {
    // 回复模板
    position: absolute;
    top: -17px;
    right: 0px;
  }
}

.reply-box-margin-bottom {
  margin-bottom: 14px !important;
}
.comment-box{
  .comment-tip {
    padding-bottom: 10px;
  }
  .comment-content{
    padding-bottom:16px
  }
  .content-template{
    position: relative;
    /deep/ .template-pop{
      position:absolute;
      right:120px;
    }
  }
  .comment-save{
    width: 100%;
    text-align: right;
    padding-bottom: 16px;
  > button {
      margin-left: 16px;
    }
  }
  .reply-input{
    padding: 7px 10px;
    width: 340px;
    border:1px solid;
    cursor: pointer;
    font-size: 12px;
  }
  .comment-time{
    padding-top: 10px
  }
}
/deep/ .subTask-label{
  font-size: 12px;
  margin-left: 4px;
  border-radius: 16px;
  padding: 2px 6px;
}
.report-changecreate {
  border-top:1px solid;
  padding-top: 16px;
  margin-top: 16px;
}
</style>
