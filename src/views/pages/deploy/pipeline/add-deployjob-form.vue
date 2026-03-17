<template>
  <div>
    <div v-if="isReady">
      <TsForm
        ref="form"
        v-model="jobData"
        :item-list="formConfig"
        :labelWidth="90"
      >
        <template v-slot:moduleList>
          <Pipeline
            ref="moduleList"
            :baseParams="jobData"
            :defaultVersion="jobData.defaultVersion"
          ></Pipeline>
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
      jobData: { pipelineId: this.id, appSystemModuleVersionList: [], triggerType: 'instant', defaultVersion: ''},
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
            { value: 'instant', text: this.$t('term.deploy.immediateexecution')},
            { value: 'manual', text: this.$t('term.deploy.manualtrigger') },
            { value: 'auto', text: this.$t('term.deploy.automaticexecution') }
          ],
          validateList: ['required'],
          onChange: val => {
            this.changeTriggerType(val);
          }
        },
        planStartTime: {
          label: this.$t('page.plantime'),
          transfer: true,
          type: 'datetime',
          isHidden: true,
          valueType: 'timestamp',
          format: 'yyyy-MM-dd HH:mm',
          desc: this.$t('term.deploy.tasktimelimitfiveminutes'),
          selectableRange: () => {
            const now = new Date().getTime();
            return [now + 5 * 60 * 1000, 0];
          },
          validateList: ['required']
        },
        defaultVersion: {
          type: 'text',
          label: this.$t('term.deploy.defaultversion'),
          readonly: true,
          isHidden: !this.isNeedDefaultVersion
        },
        moduleList: {
          type: 'slot',
          hideLabel: true
        }
      },
      isReady: false,
      isNeedDefaultVersion: false
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
    changeTriggerType(val) {
      this.$set(this.jobData, 'triggerType', val);
      const isAuto = val === 'auto';
      this.$set(this.formConfig.planStartTime, 'isHidden', !isAuto);
      this.$set(this.formConfig.planStartTime, 'validateList', isAuto ? ['required'] : []);
      if (!isAuto) {
        this.$delete(this.jobData, 'planStartTime');
      } else if (!this.jobData.planStartTime) {
        this.$set(this.jobData, 'planStartTime', (new Date()).getTime() + 60 * 10 * 1000);
      }
    },
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
    },
    getPipelineById() {
      this.$set(this.jobData, 'defaultVersion', '');
      this.$set(this.jobData, 'name', '');
      this.isReady = false;
      if (this.id) {
        this.$api.deploy.pipeline.getPipelineById(this.id).then(res => {
          let pipelineData = res.Return;
          this.isNeedDefaultVersion = !!this.pipelineData.isNeedDefaultVersion || false;
          pipelineData.defaultVersion && this.$set(this.jobData, 'defaultVersion', pipelineData.defaultVersion);
          pipelineData.name && this.$set(this.jobData, 'name', pipelineData.name);
          this.$set(this.formConfig.defaultVersion, 'isHidden', !!this.isNeedDefaultVersion);
        }).finally(() => {
          this.isReady = true;
        });
      } else {
        this.isReady = true;
      }
      this.changeTriggerType(this.jobData.triggerType);
    }
  },
  filter: {},
  computed: {
  },
  watch: {
    id: {
      handler(val) {
        this.$set(this.jobData, 'pipelineId', val);
        this.getPipelineById();
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
