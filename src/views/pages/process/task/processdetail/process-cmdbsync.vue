<template>
  <div class="taskdetail-autoexec">
    <Loading :loadingShow="taskLoading" type="fix"></Loading>
    <TsContain
      :siderWidth="260"
      :isSiderHide="!isOrderLeft"
      :sessionName="sessionName"
    >
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
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
          ></NavTop>
          <div class="toolbar-right">
            <div class="action-group">
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
                  <i class="tsfont-topo"></i>
                </Tooltip>
              </span>
              <!-- 工单关注 -->
              <span
                :class="{disable: disabledConfig.focusing}"
                class="action-item"
                @click="updateFocus"
              >
                <Tooltip v-if="processTaskConfig.isFocus" :content="$t('term.process.notfocustask')" theme="light">
                  <i :class="['text-danger', 'tsfont-heart-s']"></i>
                </Tooltip>
                <Tooltip v-else :content="$t('term.process.focustask')" theme="light">
                  <i :class="['text-danger', 'tsfont-heart-o']"></i>
                </Tooltip>
              </span>
              <!-- 更多操作 -->
              <span v-if="isMoreAction" class="action-item">
                <Dropdown trigger="click" placement="bottom-end">
                  <span class="tsfont-option-vertical"></span>
                  <DropdownMenu slot="list">
                    <!-- 撤回_start -->
                    <DropdownItem v-if="actionConfig.retreat" :disabled="disabledConfig.retreating" @click.native="retreatTaskStep">
                      {{ actionConfig.retreat }}
                    </DropdownItem>
                    <!-- 撤回_end -->
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
                    <!-- 恢复_start -->
                    <DropdownItem v-if="actionConfig.urge" :disabled="disabledConfig.urging" @click.native="urgeTask">
                      {{ actionConfig.urge }}
                    </DropdownItem>
                    <!-- 恢复_end -->
                    <!-- 复制上报 -->
                    <DropdownItem v-if="actionConfig.copyprocesstask" @click.native="copyProcessTask">
                      {{ actionConfig.copyprocesstask }}
                    </DropdownItem>
                    <!-- 复制上报 -->
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
                  :title="selectBackConfig.name ? selectBackConfig.flowDirection + selectBackConfig.name : null"
                  @click="backTask"
                >{{ actionConfig.back }}</Button>
              </span>
              <!-- 回退_end -->
              <!-- 流转_start -->
              <span v-if="actionConfig.complete" class="action-item">
                <!-- 接下来步骤大于1个，弹窗选择 -->
                <Button
                  v-if="nextStepList.length > 1"
                  icon="tsfont tsfont-refresh"
                  type="primary"
                  :disabled="disabledConfig.completing"
                  @click="completeTask"
                >{{ actionConfig.complete }}</Button>
                <!-- 接下来步骤1个 直接选择-->
                <Button
                  v-else-if="nextStepList.length == 1"
                  icon="tsfont tsfont-refresh"
                  type="primary"
                  :disabled="disabledConfig.completing"
                  :title="nextStepList[0].name ? nextStepList[0].flowDirection + nextStepList[0].name : null"
                  @click="completeStep(nextStepList[0])"
                >
                  <div class="overflow" style="max-width:150px">{{ nextStepList[0].aliasName || actionConfig.complete }}</div>
                </Button>
              </span>
              <!-- 流转_end -->
              <!-- 评分前回退 -->
              <span v-if="actionConfig.redo" class="action-item">
                <Button
                  icon="tsfont tsfont-reply"
                  @click="redoTask"
                >{{ actionConfig.redo }}</Button>
              </span>
            </div>
          </div>
        </div>
      </template>
      <template v-slot:sider>
        <slot></slot>
      </template>
      <template v-slot:content>
        <div class="task-main">
          <template v-if="(processTaskStepRemindList && processTaskStepRemindList.length > 0) || (processTaskConfig.tranferReportProcessTaskList && processTaskConfig.tranferReportProcessTaskList.length > 0)">
            <!-- 提示：回退，转交，转报等 -->
            <TaskAlert :list="processTaskStepRemindList" :tranferReportProcessTaskList="processTaskConfig.tranferReportProcessTaskList" @getTaskAlertHeight="(taskHeight) => taskAlertHeight = taskHeight"></TaskAlert>
          </template>
          <TsContain
            :rightWidth="290"
            :hasContentPadding="false"
            hideHeader
            :isRightSiderHide="!isOrderRight"
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
                  :slotList="[{ name: 'cmdbsync', label: '配置项同步' }]"
                  :actionConfig="actionConfig"
                  :formConfig="formConfig"
                  :processTaskConfig="processTaskConfig"
                  :processTaskStepConfig="processTaskStepConfig"
                  :formEdit="formEdit"
                  :showActive="showActive"
                  :startProcessTaskStep="startProcessTaskStep"
                  :defaultProcessTaskId="processTaskId"
                  :defaultProcessTaskStepId="processTaskStepId"
                  :replaceableTextConfig="replaceableTextConfig"
                  :priorityList="priorityList"
                  :defaultTabValue="isShowCmdbsync? 'cmdbsync' : ''"
                  @update="update"
                  @changeDisableCommet="(val)=>{
                    isDisableCommet = val
                  }"
                >
                  <template v-if="isShowCmdbsync" v-slot:cmdbsync>
                    <!-- 配置项 -->
                    <CmdbsyncDetail :errorList="handlerStepInfo.errorList" :tbodyList="!$utils.isEmpty(handlerStepInfo.tableList)?handlerStepInfo.tableList[0].tbodyList:[]" :handlerStepInfo="handlerStepInfo"></CmdbsyncDetail>
                  </template>
                  <div slot="replyBtn">
                    <!-- 回退/流转按钮 -->
                    <FooterOperationBtn
                      :actionConfig="actionConfig"
                      :nextStepList="nextStepList"
                      :disabledConfig="disabledConfig"
                      :backStepList="backStepList"
                      :selectBackConfig="selectBackConfig"
                      :currentProcessTaskStep="processTask.currentProcessTaskStep"
                      :isDisableCommet="isDisableCommet"
                      @completeTask="completeTask"
                      @completeStep="completeStep"
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
      :title="actionConfig.complete"
      @on-ok="completeOk"
    >
      <template>
        <div class="step-list" style="max-height:400px">
          <div v-if="selectStepConfig">
            <StepSelect :id="selectStepConfig.id" :list="nextStepList" @selecStep="selecStep"></StepSelect>
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
    <!-- 转报 -->
    <RanferreportDialog v-if="actionConfig.tranferreport" :isShow.sync="ranferreportModel" :processTaskConfig="processTaskConfig"></RanferreportDialog>
    <RedoDialog :isShow.sync="redoModel" :processTaskConfig="processTaskConfig"></RedoDialog>
  </div>
</template>

<script>
import '@/views/pages/process/flow/topoComponent/index.js';
import clipboard from '@/resources/directives/clipboard.js';
import itemDialog from './workorder/actiondialog/index.js';
import detailmixin from './detailmixin.js';
import FooterOperationBtn from './workorder/footer-operation-btn.vue'; // 底部操作按钮组件

export default {
  //工单处理
  name: '',
  tagComponent: 'taskDeal', //主要用来标识是上报页面，为表单修改优先级做标志
  components: {
    TsDialog: () => import('@/resources/plugins/TsDialog/TsDialog.vue'),
    TsForm: () => import('@/resources/plugins/TsForm/TsForm.vue'),
    CenterDetail: () => import('./workorder/CenterDetail.vue'),
    LookSitemapDialog: () => import('./workorder/actiondialog/lookSitemap.vue'),
    RightSetting: () => import('./workorder/RightSetting.vue'),
    NavTop: () => import('./navTop.vue'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem.vue'),
    UserSelect: () => import('@/resources/components/UserSelect/UserSelect.vue'),
    ...itemDialog,
    TaskAlert: () => import('@/views/pages/process/task/processdetail/workorder/alert/top-alert.vue'),
    StepSelect: () => import('@/views/pages/process/task/processdetail/workorder/common/step-select.vue'),
    FooterOperationBtn,
    CmdbsyncDetail: () => import('@/views/pages/process/task/processdetail/workorder/cmdbsync/cmdbsync-detail.vue')
  },
  provide() {
    return {
      $taskBox: this
    };
  },
  directives: {
    clipboard
  },
  mixins: [detailmixin],
  props: {},
  data() {
    return {
      ranferreportModel: false, // 转报弹框
      redoModel: false, //评分工单回退
      transferStepList: [], //转交步骤列表
      transferId: null,
      handlerStepInfo: null,
      taskAlertHeight: 0 // taskAlert高度
    };
  },
  created() {
  },
  mounted() {
    this.getAllData();
  },
  beforeDestroy() {
    clearInterval(this.timer);
    this.timer = null;
  },
  methods: {
    getMessage() {
      //初始化当前步骤:cmdb同步
      if (this.processTaskStepConfig) {
        this.handlerStepInfo = this.processTaskStepConfig.handlerStepInfo || null;
      }
    },
    async completeTask() {
      //流转
      let val = this.$refs.TaskCenterDetail ? this.$refs.TaskCenterDetail.getTaskStepContent() : null;
      this.completeList.forEach(item => {
        if (item.name == 'content') {
          item.value = val;
          if (this.isStepRequired === 0) {
            item.validateList = [];
          }
        }
      });
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
            action: 'complete'
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
              this.disabledConfig.completing = false;
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
          action: 'complete'
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
    //评分前回退
    redoTask() {
      this.redoModel = true;
    }
  },
  computed: {
    isMoreAction() {
      //更多操作按钮
      let actionConfig = this.actionConfig;
      let moreAction = false;
      if (actionConfig.retreat || actionConfig.abortprocessTask || actionConfig.recoverprocessTask || actionConfig.urge || actionConfig.tranferreport || actionConfig.copyprocesstask) {
        moreAction = true;
      }
      return moreAction;
    },
    isShowCmdbsync() {
      return this.handlerStepInfo && (!this.$utils.isEmpty(this.handlerStepInfo.tableList) || !this.$utils.isEmpty(this.handlerStepInfo.errorList));
    }
  },

  watch: {}
};
</script>
<style lang="less" scoped>
.task-main{
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: hidden;
}
/deep/ .ivu-layout-content{
  overflow-y: hidden !important;
}
</style>
