<template>
  <div>
    <div v-if="!phase.error">
      <div v-if="statistList" class="grid">
        <div v-for="(statist, index) in statistList" :key="index">
          <span class="mr-xs">{{ statist.actionText }}</span>
          <span class="text-primary">
            <b>{{ statist.count }}</b>
          </span>
          <span class="ml-xs">{{ $t('term.pbc.dataamount') }}</span>
          <span class="text-href" :class="!isShowDetail ? 'tsfont-drop-down' : 'tsfont-drop-up'" @click="toggleDetail()"></span>
        </div>
      </div>
    </div>
    <div v-else>
      <Alert type="error">
        <div>
          <span>{{ phase.error }}</span>
          <span class="text-href" :class="!isShowDetail ? 'tsfont-drop-down' : 'tsfont-drop-up'" @click="toggleDetail()"></span>
        </div>
      </Alert>
    </div>
    <div v-if="isShowDetail">
      <Tabs v-if="interfaceList && interfaceList.length > 0" v-model="currentInterface">
        <TabPane
          v-for="(inter, index) in interfaceList"
          :key="index"
          :label="inter.name"
          :name="inter.id"
        ></TabPane>
      </Tabs>
      <InterfaceItemList
        v-if="isShowDetail && currentInterface && audit && audit.corporationId"
        :phaseId="phase.id"
        :interfaceId="currentInterface"
        :corporationId="audit.corporationId"
      ></InterfaceItemList>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: { InterfaceItemList: () => import('@/views/pages/pbc/policy/phase/components/interfaceitem-list.vue') },
  props: {
    audit: { type: Object },
    phase: { type: Object }
  },
  data() {
    return {
      statistList: {},
      isShowDetail: false,
      interfaceList: [],
      currentInterface: null
    };
  },
  beforeCreate() {},
  created() {
    this.getInterfaceByPhaseId();
  },
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
    },
    toggleDetail() {
      this.isShowDetail = !this.isShowDetail;
    },
    getInterfaceByPhaseId() {
      if (this.phase.id) {
        this.$api.pbc.policy.getPhaseInterfaceList(this.phase.id).then(res => {
          this.interfaceList = res.Return;
          if (this.interfaceList.length > 0) {
            this.currentInterface = this.interfaceList[0].id;
          }
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: 33% 33% 33%;
  grid-gap: 10px;
}
</style>
