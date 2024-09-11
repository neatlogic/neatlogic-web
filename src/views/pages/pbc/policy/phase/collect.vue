<template>
  <div v-if="!phase.error">
    <div v-if="result">
      <span>需要上报</span>
      <span class="mr-xs ml-xs text-primary">
        <b>{{ result.reportCount }}</b>
      </span>
      <span>条数据</span>
      <span class="text-href" :class="!isShowDetail ? 'tsfont-drop-down' : 'tsfont-drop-up'" @click="toggleDetail()"></span>
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
          :auditId="audit.id"
          :interfaceId="currentInterface"
          :corporationId="audit.corporationId"
        ></InterfaceItemList>
      </div>
    </div>
  </div>
  <div v-else>
    <Alert type="error">{{ phase.error }}</Alert>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    InterfaceItemList: () => import('@/views/pages/pbc/policy/phase/components/interfaceitem-list.vue')
  },
  props: {
    audit: { type: Object },
    phase: { type: Object }
  },
  data() {
    return {
      isShowDetail: false,
      interfaceList: [],
      currentInterface: null
    };
  },
  beforeCreate() {},
  created() {
    this.getInterfaceByAuditId();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    toggleDetail() {
      this.isShowDetail = !this.isShowDetail;
    },
    getInterfaceByAuditId() {
      if (this.phase.auditId) {
        this.$api.pbc.policy.getAuditInterfaceList(this.phase.auditId).then(res => {
          this.interfaceList = res.Return;
          if (this.interfaceList.length > 0) {
            this.currentInterface = this.interfaceList[0].id;
          }
        });
      }
    }
  },
  filter: {},
  computed: {
    result() {
      if (this.phase.result) {
        return JSON.parse(this.phase.result);
      }
      return null;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped></style>
