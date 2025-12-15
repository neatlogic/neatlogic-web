<template>
  <div>
    <div v-if="!phase.error && result">
      <Tabs v-model="currentTab" :animated="false">
        <TabPane
          v-if="requestAuditList && requestAuditList.length > 0"
          label="请求数据"
          name="request"
          :index="1"
        ></TabPane>
        <TabPane label="返回结果" name="main" :index="2"></TabPane>
        <TabPane label="源数据" name="source" :index="3"></TabPane>
      </Tabs>
      <div v-if="currentTab === 'main'" class="bg-op radius-md padding-md">
        <div v-for="(r, index) in result" :key="index">
          <div class="grid mb-md">
            <div class="text-grey">{{ $t('term.pbc.batchid') }}</div>
            <div class="text-bold text-grey">{{ r.branchId }}</div>
            <div class="text-grey">{{ $t('page.returncode') }}</div>
            <div class="text-bold text-grey">{{ r.code }}</div>
            <div class="text-grey">{{ $t('term.pbc.message') }}</div>
            <div class="text-bold" :class="r.code === 'WL-10009' ? 'text-success' : 'text-error'">{{ r.msg }}</div>
          </div>
          <div v-if="r.data && r.data.length > 0">
            <TsTable :theadList="theadList" :tbodyList="r.data" :fixedHeader="false"></TsTable>
          </div>
          <Divider v-if="index < result.length - 1"></Divider>
        </div>
      </div>
      <div v-else-if="currentTab === 'source'">
        <JsonViewer boxed copyable :value="result"></JsonViewer>
      </div>
      <div v-else-if="currentTab === 'request'">
        <div v-for="(request, index) in requestAuditList" :key="index">
          <Divider orientation="left">
            <span class="cursor text-primary" :class="isHide(index) ? 'tsfont-drop-right' : 'tsfont-drop-down'" @click="toggleHide(index)"></span>
            <span>请求#{{ index + 1 }}</span>
          </Divider>
          <div v-if="!isHide(index)">
            <TsFormItem label="请求参数" labelPosition="left" :labelWidth="80">
              <JsonViewer copyable :value="toJson(request.param)"></JsonViewer>
            </TsFormItem>
            <TsFormItem label="返回结果" labelPosition="left" :labelWidth="80">
              <JsonViewer copyable :value="toJson(request.result)"></JsonViewer>
            </TsFormItem>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="phase.error">
      <Alert type="error">
        <div>
          <span>{{ phase.error }}</span>
        </div>
      </Alert>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    JsonViewer: () => import('vue-json-viewer'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem')
  },
  props: { phase: { type: Object } },
  data() {
    return {
      currentTab: 'main',
      requestAuditList: [],
      hidePanel: {},
      theadList: [
        { key: 'code', title: this.$t('term.pbc.errorcode') },
        { key: 'msg', title: this.$t('term.pbc.message') },
        { key: 'facilityCategory', title: this.$t('term.pbc.facilitycategory') },
        { key: 'facilityDescriptor', title: this.$t('term.pbc.facilitydescriptor') }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.getPolicyPhaseRequest();
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
    toggleHide(index) {
      this.$set(this.hidePanel, index.toString(), !this.hidePanel[index.toString()]);
    },
    isHide(index) {
      return this.hidePanel[index.toString()] || false;
    },
    toJson(data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        return data;
      }
    },
    getPolicyPhaseRequest() {
      this.$api.pbc.policy.getPolicyPhaseRequest(this.phase.id).then(res => {
        this.requestAuditList = res.Return;
      });
    }
  },
  filter: {},
  computed: {
    result() {
      if (this.phase && this.phase.result) {
        try {
          return JSON.parse(this.phase.result);
        } catch (e) {
          return null;
        }
      }
      return null;
    },
    error() {
      if (this.phase && this.phase.error) {
        try {
          return JSON.parse(this.phase.error);
        } catch (e) {
          return null;
        }
      }
      return null;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: 50px 30% 50px 30% 50px 30%;
  grid-gap: 10px;
}
</style>
