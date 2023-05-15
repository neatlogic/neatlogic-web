<template>
  <div class="taskdetail-changehandle">
    <Loading :loadingShow="taskLoading" type="fix"></Loading>
    <TsContain
      :leftWidth="260"
      :isSiderHide="!isOrderLeft"
      :sessionName="sessionName"
    >
      <template v-slot:navigation>
        <span class="tsfont-left text-action" @click="$back(prevPath.router)">{{ $getFromPage(prevPath.name) }}</span>
      </template>
      <template v-slot:topLeft>
        <div class="taskdetail-top">
          <NavTop
            :prevPath="prevPath"
            :processTaskConfig="processTaskConfig"
            :isEditTitle="isEditTitle"
            :taskTitle="processTaskConfig.title"
            :actionConfig="actionConfig"
            @isTslayout="isTslayout"
            @editTitle="editTitle"
            @changeTitle="changeTitle"
            @toPrevpath="toPrevpath"
          ></NavTop>
          <div class="toolbar-right">
            <div class="action-group">
              <!-- 变更按钮 -->
              <!-- 处理_start -->
              <span
                v-if="actionStepconfig.startchange"
                :class="{disable: changeDisableConfig.starting}"
                class="tsfont-play-o action-item"
                @click="startchange"
              >{{ actionStepconfig.startchange }}</span>
              <span
                v-if="actionStepconfig.pausechange"
                :class="{disable: changeDisableConfig.pausing}"
                class="tsfont-pause-o action-item"
                @click="pausechange"
              >{{ actionStepconfig.pausechange }}</span>
              <span
                v-if="actionStepconfig.recoverchange"
                :class="{disable: changeDisableConfig.recoverring}"
                class="action-item tsfont-play-o"
                @click="recoverchange"
              >{{ actionStepconfig.recoverchange }}</span>
              <span
                v-if="actionStepconfig.restartchange"
                :class="{disable: changeDisableConfig.restarting}"
                class="tsfont-play-o action-item"
                @click="restartchange"
              >{{ actionStepconfig.restartchange }}</span>
              <!-- 处理_end -->
              <!-- 开始_start -->
              <span
                v-if="actionConfig.start"
                :class="{disable: disabledConfig.starting}"
                class="action-item tsfont-play-o"
                @click="startTaskStep('start')"
              >{{ actionConfig.start }}</span>
              <!-- 开始_end -->
              <!-- accept_start -->
              <span
                v-if="actionConfig.accept"
                :class="{disable: disabledConfig.accepting}"
                class="action-item tsfont-play-o"
                @click="startTaskStep('accept')"
              >{{ actionConfig.accept }}</span>
              <!-- accept_end -->
              <!-- 暂存、保存_start -->
              <span
                v-if="actionConfig.save"
                :class="{disable: disabledConfig.saving}"
                class="action-item tsfont-save"
                @click="saveTaskData()"
              >{{ actionConfig.save }}</span>
              <!-- 暂存、保存_end -->
              <!-- 转交_start -->
              <span
                v-if="actionConfig.transfer"
                :class="{disable: disabledConfig.transferring}"
                class="action-item tsfont-arrow-corner-right"
                @click="transferTask"
              >{{ actionConfig.transfer }}</span>
              <!-- 转交_end -->
              <!-- 暂停步骤 -->
              <span
                v-if="actionConfig.pause"
                :class="{disable: disabledConfig.pausing}"
                class="action-item tsfont-pause"
                @click="pauseStep"
              >{{ actionConfig.pause }}</span>
              <!-- 恢复步骤 -->
              <span
                v-if="actionConfig.recover"
                :class="{disable: disabledConfig.recoverstep}"
                class="action-item tsfont-play-o"
                @click="recoverStep"
              >{{ actionConfig.recover }}</span>
              <!-- 查看流程图_start -->
              <span v-if="!pocesstaskview" class="action-item" @click="lookSitemap">
                <Tooltip :content="$t('term.process.viewflowchart')" theme="light">
                  <i class="ts-sitemap"></i>
                </Tooltip>
              </span>
              <!-- 工单关注 -->
              <span
                :class="{disable: disabledConfig.focusing}"
                class="action-item"
                @click="updateFocus"
              >
                <Tooltip v-if="processTaskConfig.isFocus" :content="$t('term.process.notfocustask')" theme="light">
                  <i :class="['text-danger', 'ts-heart-s']"></i>
                </Tooltip>
                <Tooltip v-else :content="$t('term.process.focustask')" theme="light">
                  <i :class="['text-danger', 'ts-heart']"></i>
                </Tooltip>
              </span>
              <!-- 更多操作 -->
              <span v-if="isMoreAction" class="action-item">
                <Dropdown trigger="click" placement="bottom-end">
                  <span class="ts-option-vertical"></span>
                  <DropdownMenu slot="list">
                    <!-- 撤回_start -->
                    <DropdownItem v-if="actionConfig.retreat" :disabled="disabledConfig.retreating" @click.native="retreatTaskStep">
                      {{ actionConfig.retreat }}
                    </DropdownItem>
                    <!-- 撤回_end -->
                    <!-- 添加子任务_start -->
                    <DropdownItem v-if="actionConfig.createsubtask" :disabled="disabledConfig.subtasking" @click.native="addAssist">
                      {{ actionConfig.createsubtask }}
                    </DropdownItem>
                    <!-- 添加子任务_end -->
                    <!--转报  -->
                    <DropdownItem v-if="actionConfig.tranferreport" @click.native="openRanferreport">
                      {{ actionConfig.tranferreport }}
                    </DropdownItem>
                    <!-- 取消_start -->
                    <DropdownItem v-if="actionConfig.abortprocessTask" :disabled="disabledConfig.aborting" @click.native="cancelTask">
                      {{ actionConfig.abortprocessTask }}
                    </DropdownItem>
                    <!-- 取消_end -->
                    <!-- 恢复_start -->
                    <DropdownItem v-if="actionConfig.recoverprocessTask" :disabled="disabledConfig.recovertask" @click.native="recoverTask">
                      {{ actionConfig.recoverprocessTask }}
                    </DropdownItem>
                    <!-- 恢复_end -->
                    <!-- 催办_start -->
                    <DropdownItem v-if="actionConfig.urge" :disabled="disabledConfig.urging" @click.native="urgeTask">
                      {{ actionConfig.urge }}
                    </DropdownItem>
                    <!-- 催办_end -->
                    <!-- 复制上报 -->
                    <DropdownItem v-if="actionConfig.copyprocesstask" @click.native="copyProcessTask">
                      {{ actionConfig.copyprocesstask }}
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </span>
              <!-- 回退s -->
              <span v-if="actionConfig.back && backStepList.length > 1" class="action-item">
                <Button      
                  icon="tsfont tsfont-reply"
                  @click="backTask"
                >{{ actionConfig.back }}</Button>
              </span>
              <span v-if="actionConfig.back && backStepList.length == 1" class="action-item">
                <Button           
                  style="max-width:180px"
                  class="overflow"
                  icon="tsfont tsfont-reply"
                  :title="selectBackConfig.name ? selectBackConfig.flowDirection+selectBackConfig.name : null"
                  @click="backTask"
                >{{ actionConfig.back }}</Button>
              </span>
              <!-- 回退_end -->
              
              <!-- 流转_start -->
              <span v-if="actionStepconfig.succeedchange" class="action-item">
                <Button
                  icon="tsfont tsfont-check-o"
                  @click="succeedchange"
                >{{ actionStepconfig.succeedchange }}</Button>
              </span>
              <span v-if="actionStepconfig.failedchange" class="action-item">
                <Button
                  icon="tsfont tsfont-danger-o"
                  @click="failedchange"
                >{{ actionStepconfig.failedchange }}</Button>
              </span>
              <!-- 流转_end -->
            </div>
          </div>
        </div>
      </template>
      <template v-slot:left>
        <slot></slot>
      </template>
      <template v-slot:content>
        <div class="task-main">
          <template v-if="(processTaskStepRemindList && processTaskStepRemindList.length > 0) || (processTaskConfig.tranferReportProcessTaskList && processTaskConfig.tranferReportProcessTaskList.length > 0)">
            <TaskAlert :list="processTaskStepRemindList" :tranferReportProcessTaskList="processTaskConfig.tranferReportProcessTaskList" @getTaskAlertHeight="(taskHeight) => taskAlertHeight = taskHeight"></TaskAlert>
          </template>
          <TsContain
            :rightWidth="290"
            :hasContentPadding="false"
            hideHeader
            :isSiderHide="!isOrderRight"
            siderPosition="right"
            :rightBtn="true"
            @rightSiderToggle="rightSiderToggle"
          >
            <template v-slot:content>
              <div
                v-if="actionConfig.pocesstaskview && processTaskConfig && startProcessTaskStep"
                class="pt-nm"
                style="overflow-y: scroll;"
                :style="{height: `calc(100% - ${taskAlertHeight}px)`}"
              >
                <CenterDetail
                  ref="TaskCenterDetail"
                  handler="changehandle"
                  :actionConfig="actionConfig"
                  :formConfig="formConfig"
                  :processTaskConfig="processTaskConfig"
                  :processTaskStepConfig="processTaskStepConfig"
                  :formEdit="formEdit"
                  :showActive="showActive"
                  :addAssist="addAssist"
                  :startProcessTaskStep="startProcessTaskStep"
                  :defaultProcessTaskId="processTaskId"
                  :defaultProcessTaskStepId="processTaskStepId"
                  :replaceableTextConfig="replaceableTextConfig"
                  :priorityList="priorityList"
                  :hasPendingTasks="hasPendingTasks"
                  @update="update"
                  @changeDisableCommet="(val)=>{
                    isDisableCommet = val
                  }"
                >
                  <template v-slot:changehandle>
                    <div v-if="startProcessTaskStep.handler != 'changecreate'" id="changeInfo">
                      <ChangeDispatch
                        :processTaskId="processTaskId"
                        :processTaskStepId="processTaskStepId"
                        handler="changehandle"
                        :actionConfig="actionConfig"
                        :handlerStepInfo="handlerStepInfo"
                        :isEditchange="isEditchange"
                        @updataActive="updateActiveStep()"
                      >
                      </ChangeDispatch>
                      <ChangeDetail
                        ref="changeStepList"
                        :defaultProcessTaskStepId="processTaskStepId"
                        :handlerStepInfo="handlerStepInfo"
                        :changeStepList="changeStepList"
                        :isEditStepworker="isEditStepworker"
                        @updateStepActive="updateActiveStep()"
                      ></ChangeDetail>
                    </div>
                  </template>
                  <div slot="replyBtn">
                    <!-- 回退/流转按钮 -->
                    <FooterOperationBtn
                      nodeType="changeHandle"
                      :actionStepconfig="actionStepconfig"
                      :actionConfig="actionConfig"
                      :nextStepList="nextStepList"
                      :disabledConfig="changeDisableConfig"
                      :backStepList="backStepList"
                      :selectBackConfig="selectBackConfig"
                      :isDisableCommet="isDisableCommet"
                      @startchange="startchange"
                      @succeedchange="succeedchange"
                      @failedchange="failedchange"
                      @backTask="backTask"
                      @comment="comment"
                    ></FooterOperationBtn>
                  </div>
                </CenterDetail>
              </div>
            </template>
            <template v-slot:right>
              <RightSetting
                ref="RightSetting"
                :actionConfig="actionConfig"
                :addAssist="addAssist"
                :processTaskConfig="processTaskConfig"
                :replaceableTextConfig="replaceableTextConfig"
                :isOrderRight="isOrderRight"
                :priorityList="priorityList"
                @updateActiveStep="updateActiveStep"
              ></RightSetting>
            </template>
          </TsContain>
        </div>
      </template>
    </TsContain>
    <!-- 流转 -->
    <TsDialog
      type="modal"
      :isShow.sync="completeModal"
      :className="stepDialogClass"
      :title="completeDialogtitle"
      @on-ok="completeOk"
    >
      <template>
        <div class="step-list" style="max-height:400px">
          <div v-if="selectStepConfig">
            <StepSelect
              v-if="nextStepList && nextStepList.length>1"
              :id="selectStepConfig.id"
              :list="nextStepList"
              @selecStep="selecStep"
            ></StepSelect>
            <div v-if="assignableWorkerStepList.length > 0" class="pb-nm">
              <TsFormItem
                v-for="(item, index) in assignableWorkerStepList"
                :key="index"
                :label="$t('term.process.selectaskuser', {target: item.name})"
                :validateList="item.isRequired ? validateList : []"
                class="input-border"
                labelPosition="top"
              >
                <UserSelect
                  v-model="item.value"
                  transfer
                  :groupList=" item.groupList && item.groupList.length > 0 ? item.groupList :assignGroupList"
                  :rangeList="item.rangeList"
                  :validateList="item.isRequired ? validateList : []"
                ></UserSelect>
              </TsFormItem>
            </div>
          </div>
          <TsForm ref="completeForm" :itemList="completeList" labelPosition="top"></TsForm>
        </div>
      </template>
    </TsDialog>
    <!-- 转交 -->
    <TransferDialog
      :isShow.sync="transferModal"
      :processTaskId="processTaskId"
      :processTaskStepId="processTaskStepId"
      :content="transferContent"
    ></TransferDialog>
    <!-- 查看流程图 -->
    <LookSitemapDialog
      ref="isLookSitemap"
      :lookSitemapModel="lookSitemapModel"
      :stepDialogClass="stepDialogClass"
      :tsDialoglookSitemap="tsDialoglookSitemap"
      :sitemapTitle="sitemapTitle"
      :tooltipStyle="tooltipStyle"
      :stepTooltip="stepTooltip"
    ></LookSitemapDialog>
    <!-- 添加子任务 -->
    <TsDialog
      type="modal"
      :isShow.sync="assistModal"
      :title="isEdit ? $t('page.edit') : $t('page.build')"
      :okBtnDisable="disabledConfig.subtasking"
      @on-ok="assistOk()"
      @on-close="assistModal = false"
    >
      <template>
        <div style="width:90%">
          <TsForm
            ref="assistForm"
            :itemList="assistList"
            type="type"
            labelPosition="right"
          ></TsForm>
        </div>
      </template>
    </TsDialog>
    <!-- 校验 -->
    <div v-if="validCardOpen" class="tsscroll-container valid-main">
      <Card style="width:100%;" :padding="0">
        <p slot="title">{{ $t('page.validate') }}</p>
        <a slot="extra" href="javascript:void(0);" @click.prevent="validCardOpen = false">
          <Icon custom="tsfont-close text-title"></Icon>
        </a>
        <CellGroup style="max-height: 340px; overflow: auto;">
          <Cell
            v-for="(item, index) in validList"
            :key="index"
            :title="item.msg"
            @click.native="validItemClick(item.focus)"
          >
            <Icon
              slot="icon"
              :custom="item.icon"
              size="20"
              :color="item.iconColor"
            ></Icon>
          </Cell>
        </CellGroup>
      </Card>
    </div>
    <!-- 撤回 -->
    <TsDialog
      type="modal"
      :isShow.sync="retreatModal"
      :title="actionConfig.retreat"
      :className="stepDialogClass"
      @on-ok="retreatOk"
    >
      <template>
        <div class="step-list">
          <TsForm ref="retreatForm" :itemList="retreatConfig" labelPosition="top">
            <template v-slot:processTaskStepId>
              <StepSelect :id="retreatId" :list="retreatList" @selecStep="retreatStep"></StepSelect>
            </template>
          </TsForm>
        </div>
      </template>
    </TsDialog>
    <!-- 开始 处理-->
    <TsDialog
      type="modal"
      :isShow.sync="startModal"
      class="vertical-center-modal"
      :hasHeader="false"
      :hasFooter="false"
      :className="stepDialogClass"
    >
      <template>
        <div class="submitModelBox">
          <p class="text-grey text-line">{{ $t('term.process.pleselectprioritystep') }}</p>
          <div v-for="(st, stindex) in startList" :key="stindex" class="submit-btn-list">
            <Button
              size="large"
              style="width:190px;"
              class="overflow"
              @click="selecStartStep(st)"
            >{{ st.name }}</Button>
          </div>
        </div>
      </template>
    </TsDialog>
    <!-- 回退 -->
    <TsDialog
      type="modal"
      :isShow.sync="backModal"
      :className="stepDialogClass"
      :title="actionConfig.back"
      @on-ok="backOk"
    >
      <template>
        <div class="step-list">
          <TsForm ref="backForm" :itemList="backList" labelPosition="top">
            <template v-slot:step>
              <StepSelect :id="selectBackConfig.id" :list="backStepList" @selecStep="(val)=>{selecStep(val, 'back')}"></StepSelect>
            </template>
          </TsForm>
        </div>
      </template>
    </TsDialog>
    <TsDialog
      type="modal"
      :isShow.sync="assignModal"
      :className="stepDialogClass"
      :title="assignTitle"
      @on-ok="assignOk"
    >
      <template>
        <TsFormItem
          v-for="(item, index) in assignableWorkerStepList"
          :key="index"
          :label="item.name"
          :labelWidth="150"
          :validateList="item.isRequired ? validateList : []"
          class="input-border"
        >
          <UserSelect
            v-model="item.value"
            transfer
            :groupList=" item.groupList && item.groupList.length > 0 ? item.groupList :assignGroupList"
            :rangeList="item.rangeList"
            :validateList="item.isRequired ? validateList : []"
            width="90%"
          ></UserSelect>
        </TsFormItem>
      </template>
    </TsDialog>
    <!-- 变更暂停 -->
    <TsDialog
      type="modal"
      :isShow.sync="pausechangeModal"
      :className="stepDialogClass"
      :title="$t('term.process.changesuspension')"
      @on-ok="okPausechange"
    >
      <template>
        <TsForm
          ref="pausechangeForm"
          :itemList="pausechangeForm"
          type="type"
          labelPosition="top"
        ></TsForm>
      </template>
    </TsDialog>
    <!-- 转报 -->
    <RanferreportDialog v-if="actionConfig.tranferreport" :isShow.sync="ranferreportModel" :processTaskConfig="processTaskConfig"></RanferreportDialog>
  </div>
</template>

<script>
import '@/views/pages/process/flow/topoComponent/index.js';
import clipboard from '@/resources/directives/clipboard.js';
import { mapGetters, mapMutations } from 'vuex';
import detailmixin from './detailmixin.js';
import FooterOperationBtn from './workorder/footer-operation-btn.vue'; // 底部操作按钮组件

let Vm;

export default {
  //工单处理
  name: '',
  tagComponent: 'taskDeal', //主要用来标识是上报页面，为表单修改优先级做标志
  components: {
    TsDialog: resolve => require(['@/resources/plugins/TsDialog/TsDialog.vue'], resolve),
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve),
    CenterDetail: resolve => require(['./workorder/CenterDetail.vue'], resolve),
    RightSetting: resolve => require(['./workorder/RightSetting.vue'], resolve),
    LookSitemapDialog: resolve => require(['./workorder/actiondialog/lookSitemap.vue'], resolve),
    TransferDialog: resolve => require(['./workorder/actiondialog/transfer.vue'], resolve),
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem.vue'], resolve),
    UserSelect: resolve => require(['@/resources/components/UserSelect/UserSelect.vue'], resolve),
    RanferreportDialog: resolve => require(['./workorder/actiondialog/tranferreport.vue'], resolve),
    NavTop: resolve => require(['./navTop.vue'], resolve),
    TaskAlert: resolve => require(['@/views/pages/process/task/processdetail/workorder/alert/top-alert.vue'], resolve),
    ChangeDispatch: resolve => require(['@/views/pages/process/task/processdetail/workorder/change/change-dispatch.vue'], resolve),
    ChangeDetail: resolve => require(['@/views/pages/process/task/processdetail/workorder/change/change-detail.vue'], resolve),
    StepSelect: resolve => require(['@/views/pages/process/task/processdetail/workorder/common/step-select.vue'], resolve),
    FooterOperationBtn
  },
  directives: {
    clipboard
  },
  mixins: [detailmixin],
  props: {},
  data() {
    return {   
      // taskForm: null, //工单表单查看权限
      completeDialogtitle: this.$t('term.process.circulation'),
      //变更
      actionStepconfig: {
        editchangestep: null, //"编辑"
        batcheditchangestepworker: null, //"批量编辑处理人"
        startchange: null, //"开始"
        succeedchange: null, //"确认成功"
        failedchange: null, //"确认失败"
        pausechange: null, // "暂停"
        recoverchange: null, //"恢复"
        restartchange: null //"重做"
      },
      changeId: null,
      changeCompletetype: null,
      // 变更暂停弹框
      pausechangeModal: false,
      pausechangeForm: [
        //暂停
        {
          type: 'ckeditor',
          name: 'content',
          value: '',
          width: '95%',
          label: this.$t('page.reason'),
          validateList: ['required']
        }
      ],
      ranferreportModel: false, // 转报弹框
      transferStepList: [], //转交步骤列表
      transferId: null,
      changeDisableConfig: {
        starting: null, //"开始"
        pausing: null, // "暂停"
        recoverring: null, //"恢复"
        restarting: null //"重做"
      },
      handlerStepInfo: null,
      changeStepList: [],
      isEditchange: false,
      isEditStepworker: false,
      taskAlertHeight: 0 // taskAlert高度
    };
  },
  created() {
  },
  mounted() {
    this.getAllData();
    Vm = this;
  },
  beforeDestroy() {
    clearInterval(this.timer);
    this.timer = null;
  },
  methods: {
    getMessage() {
      //变更处理
      let handlerStepInfo = this.processTaskStepConfig.handlerStepInfo;
      if (handlerStepInfo) {
        this.changeId = handlerStepInfo.id || null;
        this.handlerStepInfo = handlerStepInfo;
        this.changeStepList = handlerStepInfo.changeStepList;
        if (handlerStepInfo.actionList && handlerStepInfo.actionList.length > 0) {
          let changeActionList = handlerStepInfo.actionList;
          changeActionList.forEach(item => {
            for (let j in this.actionStepconfig) {
              if (j == item.value) {
                this.actionStepconfig[j] = item.text;
              }
            }
          });
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
    },
    async completeTask() {
      //流转
      let val = this.$refs.TaskCenterDetail ? this.$refs.TaskCenterDetail.getTaskStepContent() : null;
      this.completeList[0].value = val;
      if (this.changeCompletetype == 'succeedchange') {
        this.completeDialogtitle = this.$t('term.process.successcirculation');
      } else if (this.changeCompletetype == 'failedchange') {
        this.completeDialogtitle = this.$t('term.process.failedcirculation');
      } else if (this.isStepRequired === 0) {
        this.completeList[0].validateList = [];
      }
      let isValid = await this.taskValid();
      if (isValid) {
        this.nextStepList.length && this.selecStep(this.nextStepList[0]);
        this.completeModal = true;
      }
    },
    async completeOk() {
      //流转完成
      let completeForm = this.$refs.completeForm;
      if (completeForm.valid()) {
        await this.saveTaskData(true);
        let obj = completeForm.getFormValue();
        let isSave = true;
        for (let i = 0; i < this.assignableWorkerStepList.length; i++) {
          if (this.assignableWorkerStepList[i].isRequired == 1 && !this.assignableWorkerStepList[i].value.length) {
            isSave = false;
            this.$Notice.error({
              title: this.$t('form.placeholder.pleaseselect', {target: this.$t('term.process.stepuser')}),
              duration: 1.5
            });
            break;
          }
        }
        if (isSave) {
          let data = {
            processTaskId: this.processTaskId,
            processTaskStepId: this.processTaskStepId,
            nextStepId: this.selectStepConfig.id,
            content: obj.content,
            action: 'complete',
            changeId: this.changeId,
            changeAction: this.changeCompletetype
          };
          if (this.assignableWorkerStepList.length > 0) {
            let userArr = [];
            this.assignableWorkerStepList.forEach(a => {
              if (a.value && a.value.length > 0) {
                let userObj = {};
                userObj.processTaskStepId = a.id;
                userObj.workerList = a.value;
                userArr.push(userObj);
              }
            });
            if (userArr.length > 0) {
              data.assignWorkerList = userArr;
            }
          }
          if (!this.disabledConfig.completing) {
            this.disabledConfig.completing = true;
            this.$api.process.processtask.complete(data).then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.executesuccess'));
                this.completeModal = false;
                this.toTask(this.processTaskId);
              }
            }).catch(error => {
              this.disabledConfig.completing = false;
            });
          }
        }
      }
    },
    saveCompleData() {
      if (!this.disabledConfig.completing) {
        let conntent = this.$refs.TaskCenterDetail ? this.$refs.TaskCenterDetail.getTaskStepContent() : null;
        let data = {
          processTaskId: this.processTaskId,
          processTaskStepId: this.processTaskStepId,
          nextStepId: this.nestStepId,
          content: conntent,
          action: 'complete',
          changeId: this.changeId,
          changeAction: this.changeCompletetype
        };
        if (this.assignableWorkerStepList.length > 0) {
          let userArr = [];
          this.assignableWorkerStepList.forEach(a => {
            if (a.value && a.value.length > 0) {
              let userObj = {};
              userObj.processTaskStepId = a.id;
              userObj.workerList = a.value;
              userArr.push(userObj);
            }
          });
          if (userArr.length > 0) {
            data.assignWorkerList = userArr;
          }
        }
        this.disabledConfig.completing = true;
        this.$api.process.processtask.complete(data).then(res => {
          this.disabledConfig.completing = false;
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.executesuccess'));
            this.toTask(this.processTaskId);
          }
        }).catch(error => {
          this.disabledConfig.completing = false;
        });
      }
    },
    //变更操作
    startchange() {
      if (!this.changeDisableConfig.starting) {
        this.changeDisableConfig.starting = true;
        let data = {
          changeId: this.changeId
        };
        this.$api.process.processtask.changeStart(data).then(res => {
          this.changeDisableConfig.starting = false;
          if (res.Status == 'OK') {
            this.toTask(this.processTaskId, this.processTaskStepId);
          }
        }).catch(error => {
          this.changeDisableConfig.starting = false;
        });
      }
    },
    // changeCirculation() {
    //   let id = this.nextStepList[0].id;
    //   this.completeStep(id);
    // },
    succeedchange() {
      this.changeCompletetype = 'succeedchange';
      // if (this.nextStepList.length > 1) {
      //   this.completeTask();
      // } else {
      //   this.changeCirculation();
      // }
      //变更流转都需要写明原因
      this.selectStepConfig = this.nextStepList[0];
      this.completeTask();
    },
    failedchange() {
      this.changeCompletetype = 'failedchange';
      // if (this.nextStepList.length > 1) {
      //   this.completeTask();
      // } else {
      //   this.changeCirculation();
      // }
      this.selectStepConfig = this.nextStepList[0];
      this.completeTask();
    },
    async changeCompleteOk() {
      await this.saveTaskData(true);
      let obj = completeForm.getFormValue();
      let data = {
        processTaskId: this.processTaskId,
        processTaskStepId: this.processTaskStepId,
        nextStepId: this.selectStepConfig.id,
        content: obj.content,
        action: 'complete',
        changeId: this.changeId,
        changeAction: this.changeCompletetype
      };
      this.$api.process.processtask.complete(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.completeModal = false;
          this.toTask(this.processTaskId);
        }
      });
    },
    //暂停变更
    pausechange() {
      let content = this.$refs.TaskCenterDetail ? this.$refs.TaskCenterDetail.getTaskStepContent() : null;
      this.pausechangeForm[0].value = content;
      this.pausechangeModal = true;
    },
    okPausechange() {
      if (!this.changeDisableConfig.pausing) {
        let pausechangeForm = this.$refs.pausechangeForm;
        if (pausechangeForm.valid()) {
          let data = {
            content: this.pausechangeForm[0].value,
            changeId: this.changeId
          };
          this.changeDisableConfig.pausing = true;
          this.$api.process.processtask.changePause(data).then(res => {
            this.changeDisableConfig.pausing = false;
            if (res.Status == 'OK') {
              this.toTask(this.processTaskId, this.processTaskStepId);
            }
          }).catch(error => {
            this.changeDisableConfig.pausing = false;
          });
        }
      }
    },
    recoverchange() { //恢复
      if (!this.changeDisableConfig.recoverring) {
        this.changeDisableConfig.recoverring = true;
        let data = {
          changeId: this.changeId
        };
        this.$api.process.processtask.changeRecover(data).then(res => {
          this.changeDisableConfig.recoverring = false;
          if (res.Status == 'OK') {
            this.toTask(this.processTaskId, this.processTaskStepId);
          }
        }).catch(error => {
          this.changeDisableConfig.recoverring = false;
        });
      }
    },
    restartchange() { //重做
      if (!this.changeDisableConfig.restarting) {
        this.changeDisableConfig.restarting = true;
        let data = {
          changeId: this.changeId
        };
        this.$api.process.processtask.changeRestart(data).then(res => {
          this.changeDisableConfig.restarting = true;
          if (res.Status == 'OK') {
            this.toTask(this.processTaskId, this.processTaskStepId);
          }
        }).catch(error => {
          this.changeDisableConfig.restarting = false;
        });
      }
    }
  },
  computed: {
    isMoreAction() {
      //更多操作按钮
      let actionConfig = this.actionConfig;
      let moreAction = false;
      if (actionConfig.createsubtask || actionConfig.retreat || actionConfig.abortprocessTask || actionConfig.recoverprocessTask || actionConfig.urge || actionConfig.tranferreport || actionConfig.copyprocesstask) {
        moreAction = true;
      }
      return moreAction;
    },
    hasPendingTasks() {
      // 变更详情是否有待处理任务
      let hasTask = false;
      if (!this.$utils.isEmpty(this.changeStepList) && this.changeStepList.find((item) => item.status == 'pending')) {
        hasTask = true;
      }
      return hasTask;
    }
  },

  watch: {}
};
</script>
<style lang="less" scoped>
.task-title{
  font-size: 16px;
}
.task-main{
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: hidden;
}
.channel-type{
  padding: 4px 12px;
  margin-right: 4px;
  border-radius: 20px;
}
/deep/ .ivu-layout-content{
  overflow-y: scroll !important;
}
.line-bottom{
  border-bottom: 1px solid;
  padding-top: 16px;
  margin-bottom: 16px;
}
</style>
