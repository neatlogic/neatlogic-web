<template>
  <div>
    <div>
      <TsForm
        ref="form"
        v-model="jobData"
        :item-list="formConfig"
        :labelWidth="90"
      >
        <template v-slot:moduleList>
          <Pipeline ref="moduleList" :baseParams="jobData"></Pipeline>
        </template>
      </TsForm>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    Pipeline: () => import('@/views/pages/deploy/schedule/components/params/pipeline.vue')
  },
  props: {
    id: { type: Number }
  },
  data() {
    return {
      jobData: { pipelineId: this.id, appSystemModuleVersionList: [], triggerType: 'manual'},
      pipelineData: {},
      formConfig: {
        name: {
          type: 'text',
          label: this.$t('term.autoexec.jobname'),
          validateList: ['required'],
          maxlength: 50
        },
        triggerType: {
          type: 'radio',
          label: this.$t('page.executionmode'),
          dataList: [
            { value: 'manual', text: this.$t('term.deploy.manualtrigger') },
            { value: 'auto', text: this.$t('term.deploy.automaticexecution') }
          ],
          validateList: ['required'],
          onChange: val => {
            this.$set(this.jobData, 'triggerType', val);
          }
        },
        planStartTime: {
          label: this.$t('page.plantime'),
          transfer: true,
          type: 'datetime',
          isHidden: false,
          valueType: 'timestamp',
          format: 'yyyy-MM-dd HH:mm',
          desc: this.$t('term.deploy.tasktimelimitfiveminutes'),
          selectableRange: () => {
            const now = new Date().getTime();
            return [now + 5 * 60 * 1000, 0];
          },
          validateList: ['required']
        },
        moduleList: {
          type: 'slot',
          hideLabel: true
        }
      }
    };
  },
  beforeCreate() {},
  created() {
    this.jobData.planStartTime = (new Date()).getTime() + 60 * 10 * 1000; //默认十分钟之后
  },
  beforeMount() {},
  mounted() {

  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    validateForm() {
      const form = this.$refs['form'];
      let isValid = true;
      if (this.$refs.moduleList && !this.$refs.moduleList.valid()) {
        isValid = false;
      }
      if (form && !form.valid()) {
        isValid = false;
      }
      return isValid;
    },
    async submitForm() {
      if (this.$refs.moduleList) {
        const data = this.$refs.moduleList.saveJobData();
        this.$set(this.jobData, 'appSystemModuleVersionList', data.appSystemModuleVersionList);
      }
      await this.$api.deploy.pipeline.addBatchJob(this.jobData).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
        }
      });
    },
    save() {
      if (this.$refs.moduleList) {
        const data = this.$refs.moduleList.saveJobData();
        this.$set(this.jobData, 'appSystemModuleVersionList', data.appSystemModuleVersionList);
      }
      return this.jobData;
    }
  },
  filter: {},
  computed: {
  },
  watch: {
    id: {
      handler(val) {
        this.$set(this.jobData, 'pipelineId', val);
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: auto 10px;
}
</style>
