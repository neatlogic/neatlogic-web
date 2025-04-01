<template>
  <div v-if="!$utils.isEmpty(config)">
    <JobDetail :handlerStepInfo="errorConfig"></JobDetail>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    JobDetail: () => import('@/views/pages/process/task/processdetail/workorder/createjob/job-detail.vue')
  },
  props: {
    config: Object
  },
  data() {
    return {
      errorConfig: {}
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init() {
      if (this.config && this.config.newContent) {
        this.errorConfig = JSON.parse(this.config.newContent);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
