
<template>
  <div class="taskdetail-timer">
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
              <span v-if="isMoreAction">
                <Dropdown trigger="click" placement="bottom-end">
                  <span class="tsfont-option-vertical action-item"></span>
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
              <!-- 重审 -->
              <span v-if="actionConfig.reapproval" class="action-item">
                <Button
                  v-if="actionConfig.reapproval"
                  icon="tsfont tsfont-rotate-right"
                  @click="reapprovalTask"
                >{{ actionConfig.reapproval }}</Button>
              </span>
              <!-- 重审end -->
              <!-- 流转_start -->
              <span v-if="actionConfig.complete" class="action-item">
                <Button
                  icon="tsfont tsfont-refresh"
                  type="primary"
                  :disabled="disabledConfig.completing"
                  :title="nextStepList[0].name ? nextStepList[0].flowDirection+nextStepList[0].name : null"
                  @click="completeTask()"
                >
                  <div class="overflow" style="max-width:150px">{{ nextStepList[0].aliasName || actionConfig.complete }}</div>
                </Button>
              </span>
              <!-- 流转_end -->
            </div>
          </div>
        </div>
      </template>
      <template v-slot:sider>
        <slot></slot>
      </template>
      <template v-slot:content>
        <div class="task-main">
          <TimterAlert :processTaskStepConfig="processTaskStepConfig" @updateTask="toTask(processTaskId, nestStepId)"></TimterAlert>
          <TsContain
            :rightWidth="290"
            :hasContentPadding="false"
            hideHeader
            :isRightSiderHide="!isOrderRight"
            :rightBtn="true"
            @rightSiderToggle="rightSiderToggle"
          >
            <template v-slot:content>
              <div v-if="actionConfig.pocesstaskview && processTaskConfig && startProcessTaskStep">
                <CenterDetail
                  ref="TaskCenterDetail"
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
                  @update="update"
                >
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
      :title="actionConfig.complete"
      @on-ok="completeOk"
    >
      <template>
        <div class="step-list" style="max-height:400px">
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
    <!-- 转报 -->
    <RanferreportDialog v-if="actionConfig.tranferreport" :isShow.sync="ranferreportModel" :processTaskConfig="processTaskConfig"></RanferreportDialog>
  </div>
</template>
<script>
import '@/views/pages/process/flow/topoComponent/index.js';
import clipboard from '@/resources/directives/clipboard.js';
import detailmixin from './detailmixin.js';
export default {
  name: '',
  tagComponent: 'taskDeal', //主要用来标识是上报页面，为表单修改优先级做标志
  components: {
    TsDialog: resolve => require(['@/resources/plugins/TsDialog/TsDialog.vue'], resolve),
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve),
    CenterDetail: resolve => require(['./workorder/CenterDetail.vue'], resolve),
    LookSitemapDialog: resolve => require(['./workorder/actiondialog/lookSitemap.vue'], resolve),
    TransferDialog: resolve => require(['./workorder/actiondialog/transfer.vue'], resolve),
    RightSetting: resolve => require(['./workorder/RightSetting.vue'], resolve),
    RanferreportDialog: resolve => require(['./workorder/actiondialog/tranferreport.vue'], resolve),
    NavTop: resolve => require(['./navTop.vue'], resolve),
    StepSelect: resolve => require(['@/views/pages/process/task/processdetail/workorder/common/step-select.vue'], resolve),
    TimterAlert: resolve => require(['@/views/pages/process/task/processdetail/workorder/alert/timer-alert.vue'], resolve)
  },
  filters: {
  },
  directives: {
    clipboard
  },
  mixins: [detailmixin],
  props: {
  },
  data() {
    return {
      ranferreportModel: false, // 转报弹框
      transferStepList: [], //转交步骤列表
      transferId: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getAllData();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getMessage() { 
      //单独处理当前步骤特有信息
    },
    async completeTask() { //定时节点强制流转时：弹框需要填写原因
      //流转
      this.completeList.forEach(item => {
        if (item.name == 'content') {
          item.validateList = ['required'];
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
    updateActiveStep() {
      //更新活动和步骤
      return this.$refs.TaskCenterDetail.updateStepActive();
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
  overflow-y: hidden !important;
}
</style>
