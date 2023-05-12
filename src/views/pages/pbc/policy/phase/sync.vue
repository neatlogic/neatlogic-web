<template>
  <div v-if="!phase.error">
    <div v-if="statistList" class="grid">
      <div v-for="(statist, index) in statistList" :key="index">
        <span class="mr-xs">{{ statist.actionText }}</span>
        <span class="text-primary"><b>{{ statist.count }}</b></span>
        <span class="ml-xs">{{ $t('term.pbc.dataamount') }}</span>
      </div>
    </div>
  </div>
  <div v-else>
    <Alert type="error"><div>{{ phase.error }}</div>
    </Alert>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
  props: { phase: { type: Object}},
  data() {
    return {
      statistList: {}
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getPolicyAuditInterfaceItemStatist();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getPolicyAuditInterfaceItemStatist() {
      this.$api.pbc.policy.getPolicyAuditInterfaceItemStatist(this.phase.auditId).then(res => {
        this.statistList = res.Return;
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.grid{
  display: grid;
  grid-template-columns: 33% 33% 33%;
  grid-gap: 10px;
}
</style>
