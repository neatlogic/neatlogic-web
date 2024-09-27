<template>
  <div class="action-group">
    <!-- 开始_start -->
    <span
      v-if="actionConfig.start"
      :class="{ disable: disabledConfig.starting }"
      class="action-item tsfont-play-o"
      @click="doBtnBarAction('startTaskStep', 'start')"
    >{{ actionConfig.start }}</span>
    <!-- 开始_end -->
    <!-- accept_start -->
    <span
      v-if="actionConfig.accept"
      :class="{ disable: disabledConfig.accepting }"
      class="action-item tsfont-play-o"
      @click="doBtnBarAction('startTaskStep', 'accept')"
    >{{ actionConfig.accept }}</span>
    <!-- accept_end -->
    <!-- 暂存、保存_start -->
    <span
      v-if="actionConfig.save"
      :class="{ disable: disabledConfig.saving }"
      class="action-item tsfont-save"
      @click="doBtnBarAction('saveTaskData')"
    >{{ actionConfig.save }}</span>
    <!-- 暂存、保存_end -->
    <!-- 转交_start -->
    <span
      v-if="actionConfig.transfer"
      :class="{ disable: disabledConfig.transferring }"
      class="action-item tsfont-arrow-corner-right"
      @click="doBtnBarAction('transferTask')"
    >{{ actionConfig.transfer }}</span>
    <!-- 转交_end -->
    <!-- 暂停步骤 -->
    <span
      v-if="actionConfig.pause"
      :class="{ disable: disabledConfig.pausing }"
      class="action-item tsfont-pause"
      @click="doBtnBarAction('pauseStep')"
    >{{ actionConfig.pause }}</span>
    <!-- 恢复步骤 -->
    <span
      v-if="actionConfig.recover"
      :class="{ disable: disabledConfig.recoverstep }"
      class="action-item tsfont-play-o"
      @click="doBtnBarAction('recoverStep')"
    >{{ actionConfig.recover }}</span>
    <!-- 查看流程图_start -->
    <!-- <span v-if="!pocesstaskview" class="action-item" @click="doBtnBarAction('lookSitemap')">
      <Tooltip :content="$t('term.process.viewflowchart')" theme="light">
        <i class="tsfont-topo"></i>
      </Tooltip>
    </span>-->
    <span v-if="!pocesstaskview" class="action-item" @click="isShowProcessTaskTopo = true">
      <Tooltip :content="$t('term.process.viewflowchart')" theme="light">
        <i class="tsfont-topo"></i>
      </Tooltip>
    </span>
    <!-- 工单关注 -->
    <span :class="{ disable: disabledConfig.focusing }" class="action-item" @click="doBtnBarAction('updateFocus')">
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
          <DropdownItem v-if="actionConfig.retreat" :disabled="disabledConfig.retreating" @click.native="doBtnBarAction('retreatTaskStep')">
            {{ actionConfig.retreat }}
          </DropdownItem>
          <!-- 撤回_end -->
          <!--转报  -->
          <DropdownItem v-if="actionConfig.tranferreport" @click.native="doBtnBarAction('openRanferreport')">
            {{ actionConfig.tranferreport }}
          </DropdownItem>
          <!-- 取消_start -->
          <DropdownItem v-if="actionConfig.abortprocessTask" :disabled="disabledConfig.aborting" @click.native="doBtnBarAction('cancelTask')">
            {{ actionConfig.abortprocessTask }}
          </DropdownItem>
          <!-- 取消_end -->
          <!-- 恢复_start -->
          <DropdownItem v-if="actionConfig.recoverprocessTask" :disabled="disabledConfig.recovertask" @click.native="doBtnBarAction('recoverTask')">
            {{ actionConfig.recoverprocessTask }}
          </DropdownItem>
          <!-- 恢复_end -->
          <!-- 恢复_start -->
          <DropdownItem v-if="actionConfig.urge" :disabled="disabledConfig.urging" @click.native="doBtnBarAction('urgeTask')">
            {{ actionConfig.urge }}
          </DropdownItem>
          <!-- 恢复_end -->
          <!-- 复制上报 -->
          <DropdownItem v-if="actionConfig.copyprocesstask" @click.native="doBtnBarAction('copyProcessTask')">
            {{ actionConfig.copyprocesstask }}
          </DropdownItem>
          <!-- 编辑表单 -->
          <DropdownItem v-if="processTaskConfig && processTaskConfig.formConfig && $AuthUtils.hasRole('PROCESSTASK_MODIFY')" @click.native="editForm()">
            {{ $t('dialog.title.edittarget',{'target':$t('page.form')}) }}
          </DropdownItem>
          <!-- 转为知识 -->
          <DropdownItem v-if="knowledgeConfig && knowledgeConfig.isTransferKnowledge == 1" @click.native="doBtnBarAction('createKnowledge')">
            {{ $t('term.process.converttoknowdoc') }}
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </span>
    <!-- 重审 -->
    <span v-if="actionConfig.reapproval" class="action-item">
      <Button
        icon="tsfont tsfont-rotate-right"
        @click="doBtnBarAction('reapprovalTask')"
      >{{ actionConfig.reapproval }}</Button>
    </span>
    <!-- 回退s -->
    <span v-if="actionConfig.back && backStepList.length > 1" class="action-item">
      <Button icon="tsfont tsfont-reply" @click="doBtnBarAction('backTask')">{{ actionConfig.back }}</Button>
    </span>
    <span v-if="actionConfig.back && backStepList.length == 1" class="action-item">
      <Button
        style="max-width: 180px"
        class="overflow"
        icon="tsfont tsfont-reply"
        :title="selectBackConfig.name ? selectBackConfig.flowDirection + selectBackConfig.name : null"
        @click="doBtnBarAction('backTask')"
      >{{ actionConfig.back }}</Button>
    </span>
    
    <!-- 按钮插槽 -->
    <slot name="action"></slot>

    <!-- 流转_start -->
    <span v-if="actionConfig.complete" class="action-item">
      <!-- 接下来步骤大于1个，弹窗选择 -->
      <Button
        v-if="nextStepList.length > 1"
        icon="tsfont tsfont-arrow-right"
        type="primary"
        :disabled="disabledConfig.completing"
        @click="doBtnBarAction('completeTask')"
      >{{ actionConfig.complete }}</Button>
      <!-- 接下来步骤1个 直接选择-->
      <Button
        v-else-if="nextStepList.length == 1"
        icon="tsfont tsfont-arrow-right"
        type="primary"
        :disabled="disabledConfig.completing"
        :title="nextStepList[0].name ? nextStepList[0].flowDirection + nextStepList[0].name : null"
        @click="doBtnBarAction('completeStep', nextStepList[0])"
      >
        <div class="overflow" style="max-width: 150px">{{ nextStepList[0].aliasName || actionConfig.complete }}</div>
      </Button>
    </span>
    <!-- 流转_end -->
    <!-- 评分前回退 -->
    <span v-if="getRedoText" class="action-item">
      <Button
        icon="tsfont tsfont-reply"
        @click="doBtnBarAction('redoTask')"
      >{{ getRedoText }}</Button>
    </span>
    <FormEditDialog v-if="isShowFormModal" :processTaskConfig="processTaskConfig" @close="closeFormDialog()"></FormEditDialog>
    <ProcessTaskTopo v-if="isShowProcessTaskTopo" :processTaskId="processTaskConfig.id" @close="isShowProcessTaskTopo=false"></ProcessTaskTopo>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    FormEditDialog: () => import('./form-edit-dialog'),
    ProcessTaskTopo: () => import('@/views/pages/process/task/processdetail/workorder/common/processtask-topo-dialog.vue')
  },
  props: {
    actionConfig: { type: Object },
    disabledConfig: { tpye: Object },
    processTaskConfig: { type: Object },
    selectBackConfig: {type: Object},
    nextStepList: { type: Array },
    backStepList: { type: Array },
    pocesstaskview: {type: Boolean},
    knowledgeConfig: {type: Object}
  },
  data() {
    return {
      isShowFormModal: false,
      isShowProcessTaskTopo: false
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    doBtnBarAction(actionName, ...args) {
      this.$emit('doAction', actionName, ...args);
    },
    editForm() {
      this.isShowFormModal = true;
    },
    closeFormDialog() {
      this.isShowFormModal = false;
    }
  },
  filter: {},
  computed: {
    isMoreAction() {
      //更多操作按钮
      let actionConfig = this.actionConfig;
      let moreAction = false;
      if ((this.processTaskConfig && this.processTaskConfig.formConfig && this.$AuthUtils.hasRole('PROCESSTASK_MODIFY')) || 
      (this.knowledgeConfig && this.knowledgeConfig.isTransferKnowledge == 1) ||
      actionConfig.retreat || actionConfig.abortprocessTask || actionConfig.recoverprocessTask || actionConfig.urge || actionConfig.tranferreport || actionConfig.copyprocesstask) {
        moreAction = true;
      }
      return moreAction;
    },
    getRedoText() {
      // 获取评分前回退文案
      let redoStepConfig = this.processTaskConfig && !this.$utils.isEmpty(this.processTaskConfig.redoStepList) && this.processTaskConfig.redoStepList.find((item) => item.aliasName);
      return redoStepConfig ? redoStepConfig.aliasName : (this.actionConfig.redo || '');
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
