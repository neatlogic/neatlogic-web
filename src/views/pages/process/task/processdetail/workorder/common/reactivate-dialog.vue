<template>
  <div>
    <TsDialog
      :title="$t('term.process.reactivatestep')"
      type="modal"
      :isShow="true"
      :loading="okLoading"
      @on-ok="save()"
      @on-close="closeDialog()"
    >
      <template v-slot>
        <div class="step-list">
          <div class="pb-sm">
            <TsFormRadio
              v-model="stepId"
              :dataList="stepList"
              textName="name"
              valueName="id"
            ></TsFormRadio>
          </div>
          <TsFormItem :label="$t('page.reason')" labelPosition="top">
            <TsCkeditor v-model="content"></TsCkeditor>
          </TsFormItem>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    TsCkeditor: () => import('@/resources/plugins/TsCkeditor/TsCkeditor.vue')
  },
  props: {
    processTaskId: [Number, String]
  },
  data() {
    return {
      okLoading: false,
      stepId: null,
      stepList: [],
      content: ''
    };
  },
  beforeCreate() {},
  created() {
    this.getStepList();
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
    getStepList() {
      this.$api.process.process.getCanreactivatestepList({processTaskId: this.processTaskId}).then(res => {
        if (res.Status == 'OK') {
          this.stepList = res.Return || [];
          this.stepId = this.stepList[0].id;
        }
      });
    },
    save() {
      const data = {
        processTaskId: this.processTaskId,
        processTaskStepId: this.stepId,
        content: this.content
      };
      this.okLoading = true;
      this.$api.process.process.getManualinterventionStep(data).then(res => {
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
      }).finally(() => {
        this.okLoading = false;
      });
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
