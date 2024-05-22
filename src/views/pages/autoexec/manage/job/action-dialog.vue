<template>
  <div>
    <TsDialog
      type="modal"
      :isShow="true"
      :title="editTitle"
      @on-ok="okUpdate"
      @on-close="closeDialog"
    >
      <template v-if="editType=='planStartTime'">
        <TsFormItem :label="$t('page.plantime')" :required="true" labelWidth="80">
          <TsFormDatePicker
            ref="formValid"
            v-model="planStartTime"
            v-bind="itemList.planStartTime"
          ></TsFormDatePicker>
        </TsFormItem>
      </template>
      <template v-else-if="editType=='triggerType'">
        <TsFormItem :label="$t('term.autoexec.triggertype')" :required="true" labelWidth="80">
          <TsFormSelect
            ref="formValid"
            v-model="triggerType"
            v-bind="itemList.triggerType"
          ></TsFormSelect>
        </TsFormItem>
      </template>
      <template v-else-if="editType=='takeover'">
        {{ $t('dialog.content.takeoverjobconfirm', {target: $t('term.autoexec.job')}) }}
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormDatePicker: () => import('@/resources/plugins/TsForm/TsFormDatePicker')
  },
  props: {
    editType: String,
    jobConfig: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    let _this = this;
    return {
      editTitle: '',
      planStartTime: null,
      triggerType: null,
      itemList: {
        planStartTime: {
          type: 'datetime',
          transfer: true,
          label: this.$t('page.plantime'),
          desc: this.$t('term.autoexec.taskexpirationtip'),
          selectableRange: () => {
            const now = new Date().getTime();
            return [now + 5 * 60 * 1000, 0];
          },
          validateList: ['required']
        },
        triggerType: {
          type: 'select',
          transfer: true,
          label: this.$t('term.autoexec.triggertype'),
          dataList: [],
          validateList: ['required']
        }
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.initData();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    initData() {
      if (this.editType == 'planStartTime') {
        this.editTitle = this.$t('dialog.title.edittarget', {target: this.$t('page.plantime') });
        this.planStartTime = this.jobConfig.planStartTime;
      } else if (this.editType == 'triggerType') {
        this.getTriggerTypeLit();
        this.editTitle = this.$t('dialog.title.edittarget', {target: this.$t('term.autoexec.triggertype') });
        this.triggerType = this.jobConfig.triggerType;
      } else if (this.editType == 'takeover') {
        this.editTitle = this.$t('term.autoexec.takeoverjob');
      }
    },
    getTriggerTypeLit() { //触发方式
      let data = {enumClass: 'JobTriggerType'};
      this.$api.common.getSelectList(data).then(res => {
        if (res.Status == 'OK') {
          this.itemList.triggerType.dataList = res.Return || [];
        }
      });
    },
    okUpdate() {
      if (this.$refs.formValid && !this.$refs.formValid.valid()) {
        return;
      }
      let data = {
        jobId: this.jobConfig.id
      };
      if (this.editType == 'takeover') { //接管
        this.$api.autoexec.job.takeoverJob(data).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.executesuccess'));
          }
        }).finally(() => {
          this.$emit('updateData', true);
        });
      } else { //修改计划时间、触发方式
        if (this.editType == 'planStartTime') {
          this.$set(data, 'planStartTime', this.planStartTime);
        } else if (this.editType == 'triggerType') {
          this.$set(data, 'triggerType', this.triggerType);
        }
        this.$api.autoexec.job.updatePlanJob(data).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.executesuccess'));
          }
        }).finally(() => {
          this.$emit('updateData', true);
        });
      }
    },
    closeDialog() {
      this.$emit('updateData', false);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
