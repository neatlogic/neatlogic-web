<template>
  <div>
    <TsDialog
      type="modal"
      :isShow.sync="stepDialog"
      @on-ok="okStep"
      @on-cancel="cancleSetp"
      @on-close="close"
    >
      <template v-slot:header>
        <div>{{ dialogTitle }}</div>
      </template>
      <template v-slot>
        <div>
          <TsForm ref="stepDialogForm" :item-list="stepDialogForm" :label-width="60">
            <template v-slot:actionType>
              <div>
                <RadioGroup v-model="actionType" vertical>
                  <Radio label="abortchangestep">
                    <span>{{ $t('term.process.ignorecurrentstep') }}</span>
                  </Radio>
                  <Radio label="pausechange">
                    <span>{{ $t('term.process.pausechange') }}</span>
                  </Radio>
                </RadioGroup>
              </div>
            </template>
          </TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm.vue')
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    config: {
      type: Object,
      default: null
    },
    defaultProcessTaskStepId: { //工单步骤id
      type: [String, Number],
      default: null
    }
  },
  data() {
    let _this = this;
    return {
      processTaskId: null,
      processTaskStepId: null,
      dialogTitle: this.$t('term.process.cancelchangestep'),
      stepDialogForm: [
        {
          type: 'slot',
          name: 'actionType',
          width: '90%'
        },
        {
          type: 'ckeditor',
          name: 'content',
          width: '90%',
          value: '',
          label: this.$t('page.reply'),
          validateList: ['required']
        }
      ],
      actionType: 'abortchangestep'
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.processTaskId = this.$route.query.processTaskId;
    this.processTaskStepId = this.defaultProcessTaskStepId;
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    toTask() {
      this.$router.push({
        path: '/task-detail',
        query: {
          processTaskId: this.processTaskId,
          processTaskStepId: this.processTaskStepId,
          type: Date.now()
        }
      });
    },
    okStep() {
      if (!this.$refs.stepDialogForm.valid()) {
        return;
      }
      let formData = this.$refs.stepDialogForm.getFormValue();
      let data = {
        changeStepId: this.config.id,
        content: formData.content,
        changeAction: this.actionType
      };
      this.$api.process.processtask.changeStepAbort(data).then(res => {
        if (res.Status == 'OK') {
          this.toTask();
        }
      });
      this.stepDialog = false;
    },
    cancleSetp() {
      this.stepDialog = false;
      this.$emit('close', this.notifyDialog);
    },
    close(needRefresh) {
      this.stepDialog = needRefresh;
      this.$emit('close', needRefresh);
    }
  },
  filter: {},
  computed: {},
  watch: {
    isShow: {
      handler(val) {
        if (val) {
          this.stepDialog = val;
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang='less'>
</style>
