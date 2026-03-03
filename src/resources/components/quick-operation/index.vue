<template>
  <div class="text-center" @click.stop>
    <span class="tsfont-edit cursor-pointer pl-xs" @click="toRedirect"></span>
    <span class="tsfont-refresh cursor-pointer pl-sm" @click="handleRefresh"></span>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    config: {
      type: Object,
      default: () => {}
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
    toRedirect() {
      const { uuid = '', module = '', type = '', ciId = '' } = this.config || {};
      if (module == 'framework') {
        this.$utils.matrixDataSourceRedirect(uuid, this.config);  
      } else if (module == 'cmdb') {
        if (type == 'ci') {
          window.open(HOME + '/cmdb.html#/ci-detail/' + ciId, '_blank');
        }
      }
    },
    handleRefresh() {
      this.$emit('refresh');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
