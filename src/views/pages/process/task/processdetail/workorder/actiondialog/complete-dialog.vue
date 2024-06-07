<template>
  <!-- 流转 -->
  <TsDialog
    type="modal"
    v-bind="dialogConfig"
    :className="stepDialogClass"
    :title="actionConfig.complete"
    @on-ok="completeOk"
  >
    <template>
      <div class="step-list" style="max-height: 400px">
        <div v-if="selectStepConfig">
          <StepSelect
            :id="selectStepConfig.id"
            :list="nextStepList"
            @selecStep="
              (...arg) => {
                doAction('selecStep', ...arg);
              }
            "
          ></StepSelect>
          <div v-if="assignableWorkerStepList.length > 0" class="pb-nm">
            <TsFormItem
              v-for="(item, index) in assignableWorkerStepList"
              :key="index"
              :label="$t('term.process.selectaskuser', { target: item.name })"
              :validateList="item.isRequired ? validateList : []"
              class="input-border"
              labelPosition="top"
            >
              <UserSelect
                v-model="item.value"
                transfer
                :groupList="item.groupList && item.groupList.length > 0 ? item.groupList : assignGroupList"
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
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    UserSelect: () => import('@/resources/components/UserSelect/UserSelect.vue'),
    StepSelect: () => import('@/views/pages/process/task/processdetail/workorder/common/step-select.vue')
  },
  props: {
    actionConfig: { type: Object },
    nextStepList: { type: Array },
    assignableWorkerStepList: { type: Array },
    selectStepConfig: { type: Object },
    completeList: { type: Array }
  },
  data() {
    return {
      stepDialogClass: 'task-step', //弹框样式
      dialogConfig: {
        title: this.actionConfig.complete,
        content: '',
        isShow: true
      }
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
    doAction(actionName, ...args) {
      this.$emit('doAction', actionName, ...args);
    },
    async completeOk() {
      //流转完成
      let completeForm = this.$refs.completeForm;
      if (completeForm.valid()) {
        let obj = completeForm.getFormValue();
        this.$emit('complete', obj);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
