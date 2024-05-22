<template>
  <div v-if="!$utils.isEmpty(cmdbsyncConfig)">
    <CmdbsyncDetail v-bind="cmdbsyncConfig"></CmdbsyncDetail>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    CmdbsyncDetail: () => import('@/views/pages/process/task/processdetail/workorder/cmdbsync/cmdbsync-detail.vue')

  },
  props: {
    config: Object
  },
  data() {
    return {
      cmdbsyncConfig: {}
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
        this.cmdbsyncConfig = JSON.parse(this.config.newContent);
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
