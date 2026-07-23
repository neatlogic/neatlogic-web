<template>
  <div>
    <TsDialog
      :title="$t('page.transfer')"
      type="modal"
      :isShow="true"
      :loading="isSubmitting"
      @on-ok="saveTransferablestep"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div class="step-list">
          <TsForm
            ref="transferForm"
            :itemList="transferList"
            type="type"
            labelPosition="top"
          >
            <template v-slot:eoaStepId>
              <TsFormRadio
                v-model="eoaStepId"
                :dataList="stepList"
                textName="eoaStepName"
                valueName="eoaStepId"
              ></TsFormRadio>
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
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio')
  },
  props: {
    processTaskId: [Number, String]
  },
  data() {
    return {
      transferList: [
        {
          //转交表单
          type: 'userselect',
          name: 'workerList',
          label: this.$t('term.process.dealwithuser'),
          width: '100%',
          groupList: ['user'],
          multiple: true,
          validateList: ['required'],
          transfer: true
        },
        {
          //步骤
          type: 'slot',
          name: 'eoaStepId',
          label: this.$t('term.process.approvalstep'),
          validateList: ['required']
        },
        {
          type: 'ckeditor',
          name: 'content',
          label: this.$t('page.reply'),
          width: '100%',
          validateList: ['required'],
          params: {
            uploadVideoConfig: {
              type: 'itsm'
            }
          }
        }
      ],
      stepList: [],
      eoaStepId: null,
      isSubmitting: false
    };
  },
  beforeCreate() {},
  created() {
    this.getTransferablestepList();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getTransferablestepList() {
      this.$api.process.process.getTransferablestepList({processTaskId: this.processTaskId}).then(res => {
        if (res.Status == 'OK') {
          this.stepList = res.Return.tbodyList;
          this.eoaStepId = this.stepList[0].eoaStepId;
        }
      });
    },
    selecStep(item) {
      this.eoaStepId = item.eoaStepId;
    },
    saveTransferablestep() {
      if (this.isSubmitting) {
        return;
      }
      const transferForm = this.$refs.transferForm;
      if (transferForm.valid()) {
        const formList = transferForm.getFormValue();
        const data = {
          eoaStepId: this.eoaStepId,
          workerList: formList.workerList,
          content: formList.content
        };
        this.isSubmitting = true;
        this.$api.process.process.saveTransferablestep(data)
          .then(res => {
            if (res.Status == 'OK') {
              //刷新页面
              this.$skipHistory();
              this.$router.push({
                path: '/task-detail',
                query: {
                  processTaskId: this.processTaskId,
                  type: Date.now()
                }
              });
            }
          })
          .finally(() => {
            this.isSubmitting = false;
          });
      }
    },
    closeDialog() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
