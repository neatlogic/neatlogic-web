<template>
  <div>
    <GeneralParams
      v-if="baseParams.type=='general'"
      ref="generalParams"
      :baseParams="baseParams"
      :disabled="disabled"
    ></GeneralParams>
    <PipelineParams
      v-else-if="baseParams.type=='pipeline'"
      id="pipelineParams"
      ref="pipelineParams"
      :baseParams="baseParams"
      :disabled="disabled"
    ></PipelineParams>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    GeneralParams: resolve => require(['./params/general.vue'], resolve),
    PipelineParams: resolve => require(['./params/pipeline.vue'], resolve)
  },
  props: {
    baseParams: Object,
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {};
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
      }
      return data;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
