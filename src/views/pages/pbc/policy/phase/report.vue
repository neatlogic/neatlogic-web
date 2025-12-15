<template>
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
      <TsTable :theadList="theadList" :tbodyList="result"></TsTable>
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
        { key: 'branchId', title: '批次id' },
        { key: 'code', title: '返回码' },
        { key: 'msg', title: '返回信息' }
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
  grid-template-columns: 50px auto;
  grid-gap: 10px;
  .title {
    text-align: right;
  }
}
</style>
