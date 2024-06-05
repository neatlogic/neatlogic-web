<template>
  <!-- 流转 -->
  <TsDialog
    type="modal"
    v-bind="dialogConfig"
    :className="stepDialogClass"
    :title="actionConfig.complete"
    @on-ok="retreatOk"
  >
    <template>
      <div class="step-list">
        <TsForm ref="retreatForm" :itemList="retreatConfig" labelPosition="top">
          <template v-slot:processTaskStepId>
            <StepSelect
              :id="retreatId"
              :list="retreatList"
              @selecStep="retreatStep"
            ></StepSelect>
          </template>
        </TsForm>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    StepSelect: () => import('@/views/pages/process/task/processdetail/workorder/common/step-select.vue')
  },
  props: {
    actionConfig: { type: Object },
    disabledConfig: { type: Object },
    retreatList: { type: Array },
    processTaskId: {type: Number}
  },
  data() {
    return {
      retreatId: '', //撤回步骤id
      stepDialogClass: 'task-step', //弹框样式
      dialogConfig: {
        title: this.actionConfig.retreat,
        isShow: true
      },
      retreatConfig: [
        {
          //撤回步骤
          type: 'slot',
          name: 'processTaskStepId',
          label: this.$t('term.process.processsteplist'),
          validateList: ['required'],
          value: ''
        },
        {
          //撤回回复
          type: 'ckeditor',
          name: 'content',
          value: '',
          label: this.$t('page.reply'),
          width: '100%',
          validateList: ['required']
        }
      ]
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
    retreatStep(item) {
      //选择撤回步骤
      this.retreatId = item.id;
    },
    doAction(actionName, ...args) {
      this.$emit('doAction', actionName, ...args);
    },
    close() {
      this.$emit('close');
    },
    retreatOk() {
      //撤回确认
      if (!this.disabledConfig.retreating) {
        let retreatForm = this.$refs.retreatForm;
        if (retreatForm.valid()) {
          let formList = retreatForm.getFormValue();
          this.$set(formList, 'processTaskStepId', this.retreatId);
          this.$set(formList, 'processTaskId', this.processTaskId);
          this.disabledConfig.retreating = true;
          this.$api.process.processtask
            .retreatTask(formList)
            .then(res => {
              this.disabledConfig.retreating = false;
              if (res.Status == 'OK') {
                this.toTask(this.processTaskId);
                this.close();
              }
            })
            .catch(error => {
              this.disabledConfig.retreating = false;
            });
        }
      }
    },
    toTask(taskId, taskStepId) {
      //刷新
      this.$router.push({
        path: '/task-detail',
        query: {
          processTaskId: taskId,
          processTaskStepId: taskStepId,
          type: Date.now()
        }
      });
      this.$emit('updateMenu');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
