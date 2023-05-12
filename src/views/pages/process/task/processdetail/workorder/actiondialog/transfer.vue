<template>
  <div>
    <TsDialog
      type="modal"
      :isShow.sync="isShowModal"
      :title="$t('page.transfer')"
      :okBtnDisable="disabledTransferring"
      className="task-step"
      @on-ok="transferOk"
      @on-close="closeTransferModal"
    >
      <template>
        <div class="step-list">
          <TsForm
            ref="transferForm"
            :itemList="transferList"
            type="type"
            labelPosition="top"
          >
            <template v-slot:processTaskStepId>
              <StepSelect :id="transferId" :list="transferStepList" @selecStep="transferStep"></StepSelect>
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
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve),
    StepSelect: resolve => require(['@/views/pages/process/task/processdetail/workorder/common/step-select.vue'], resolve)
  },
  props: {
    isShow: {type: Boolean, default: false},
    processTaskId: Number,
    processTaskStepId: Number,
    content: String
  },
  data() {
    return {
      isShowModal: false,
      transferId: null,
      transferStepList: [],
      transferList: [
        {
          //转交表单
          type: 'userselect',
          name: 'workerList',
          label: this.$t('term.process.dealwithuser'),
          value: '',
          width: '100%',
          groupList: ['user', 'team', 'role'],
          multiple: false,
          validateList: ['required'],
          transfer: true
        },
        {
          //步骤
          type: 'slot',
          name: 'processTaskStepId',
          label: this.$t('term.process.processsteplist'),
          validateList: ['required'],
          value: ''
        },
        {
          type: 'ckeditor',
          name: 'reason',
          value: '',
          label: this.$t('page.reply'),
          width: '100%',
          validateList: ['required']
        }
      ],
      disabledTransferring: false
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
    transferStep(item) {
      //选择转交步骤
      this.transferId = item.id;
    },
    transferTask() {
      //转交
      this.$api.process.processtask.getTransferablestep(this.processTaskId).then(res => {
        if (res.Status == 'OK') {
          this.transferStepList = res.Return || [];
          let findItem = this.transferStepList.find(item => item.id == this.processTaskStepId);
          if (findItem) {
            this.transferId = this.processTaskStepId;
          } else {
            this.transferId = this.transferStepList[0].id;
          }
          this.transferList.forEach(item => {
            if (item.name == 'reason') {
              item.value = this.content || '';
            }
          });
          this.transferList.forEach(tr => {
            if (tr.name == 'workerList') {
              if (tr.errorMessage) {
                this.$set(tr, 'errorMessage', '');
              }
            }
          });
          // this.isShowModal = true;
        }
      });
    },
    transferOk() {
      if (!this.disabledTransferring) {
        let transferForm = this.$refs.transferForm;
        if (transferForm.valid()) {
          let formList = transferForm.getFormValue();
          let data = {
            processTaskId: this.processTaskId,
            processTaskStepId: this.transferId,
            workerList: formList.workerList,
            content: formList.reason
          };
          this.disabledTransferring = true;
          this.$api.process.processtask.transferTaskDetail(data).then(res => {
            if (res.Status == 'OK') {
              this.$emit('update:isShow', false);
              this.toTask();
            } else {
              this.transferList.forEach(tr => {
                if (tr.name == 'workerList') {
                  tr.errorMessage = res.Message;
                }
              });
            }
          }).catch(error => {
            this.transferList.forEach(tr => {
              if (tr.name == 'workerList') {
                this.$set(tr, 'errorMessage', error.data.Message);
              }
            });
          }).finally(() => {
            this.disabledTransferring = false;
          });
        }
      }
    },
    closeTransferModal() {
      this.transferList.forEach(e => {
        e.value = '';
      });
      this.$emit('update:isShow', false);
    },
    toTask() {
      //刷新
      this.$router.push({
        path: '/task-detail',
        query: {
          processTaskId: this.processTaskId,
          type: Date.now()
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {
    isShow(val) {
      val && this.transferTask();
      this.isShowModal = val;
    }
  }
};
</script>
<style lang="less">
</style>
