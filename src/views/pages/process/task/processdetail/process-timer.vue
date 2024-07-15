
<template>
  <div class="taskdetail-timer">
    <Loading :loadingShow="taskLoading" type="fix"></Loading>
    <TsContain
      v-if="!taskLoading"
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
            <ButtonBar
              :actionConfig="actionConfig"
              :disabledConfig="disabledConfig"
              :processTaskConfig="processTaskConfig"
              :selectBackConfig="selectBackConfig"
              :backStepList="backStepList"
              :nextStepList="nextStepList"
              :pocesstaskview="pocesstaskview"
              @doAction="doAction"
            ></ButtonBar>
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
    ButtonBar: () => import('@/views/pages/process/task/processdetail/workorder/common/button-bar.vue'),
    TsForm: () => import('@/resources/plugins/TsForm/TsForm.vue'),
    CenterDetail: () => import('./workorder/CenterDetail.vue'),
    LookSitemapDialog: () => import('./workorder/actiondialog/lookSitemap.vue'),
    TransferDialog: () => import('./workorder/actiondialog/transfer.vue'),
    RightSetting: () => import('./workorder/RightSetting.vue'),
    RanferreportDialog: () => import('./workorder/actiondialog/tranferreport.vue'),
    NavTop: () => import('./navTop.vue'),
    StepSelect: () => import('@/views/pages/process/task/processdetail/workorder/common/step-select.vue'),
    TimterAlert: () => import('@/views/pages/process/task/processdetail/workorder/alert/timer-alert.vue')
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
