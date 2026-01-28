<template>
  <div>
    <GeneralParams
      v-if="baseParams.type=='general'"
      ref="generalParams"
      :baseParams="baseParams"
      :disabled="disabled"
    ></GeneralParams>
    <div v-else-if="baseParams.type=='pipeline'">
      <TsFormItem v-if="isNeedDefaultVersion" :label="$t('term.deploy.defaultversion')" labelPosition="left">
        <TsFormInput :value="defaultVersion" :readonly="true"></TsFormInput>
      </TsFormItem>
      <PipelineParams
        id="pipelineParams"
        ref="pipelineParams"
        :baseParams="baseParams"
        :disabled="disabled"
        :defaultVersion="defaultVersion"
      ></PipelineParams>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    GeneralParams: () => import('./params/general.vue'),
    PipelineParams: () => import('./params/pipeline.vue'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem')
  },
  props: {
    baseParams: {
      type: Object,
      default: () => {}
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      defaultVersion: '',
      versionValidateList: ['key-special'],
      isNeedDefaultVersion: false
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
    valid() {
      let validList = [];
      if (this.baseParams.type == 'general') {
        validList.push(...this.$refs.generalParams.valid());
      } else if (this.baseParams.type == 'pipeline') {
        if (!this.$refs.pipelineParams.valid()) {
          validList.push({
            text: this.$t('term.deploy.atleastaapplymoduleandwriteversion'),
            type: 'error',
            id: '#pipelineParams'
          });
        }
      }
      return validList;
    },
    saveJobData() {
      let data = {};
      if (this.baseParams.type == 'general') {
        data = this.$refs.generalParams.saveJobData();
      } else if (this.baseParams.type == 'pipeline') {
        data = this.$refs.pipelineParams.saveJobData();
        data.defaultVersion = this.defaultVersion;
      }
      return data;
    },
    getPipelineById(id) {
      if (id) {
        this.isLoading = true;
        this.$api.deploy.pipeline.getPipelineById(id).then(res => {
          let pipelineData = res.Return || {};
          this.defaultVersion = pipelineData.defaultVersion || '';
          this.isNeedDefaultVersion = !!pipelineData.isNeedDefaultVersion || false;
        });
      } 
    }
  },
  filter: {},
  computed: {},
  watch: {
    'baseParams.pipelineId': {
      handler(val) {
        this.getPipelineById(val);
      },
      immediate: true
    }
  }
};
</script>
<style lang="less">
</style>
