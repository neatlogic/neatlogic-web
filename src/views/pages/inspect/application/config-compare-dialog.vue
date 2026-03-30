<template>
  <TsDialog v-bind="dialogConfig" @on-close="$emit('close')">
    <template v-slot>
      <div class="padding">
        <Loading :loadingShow="loadingShow" type="fix"></Loading>
        <div class="pb-md flex-between">
          <div>
            <RadioGroup v-if="!snapshotId" v-model="mode" @on-change="handleModeChange">
              <Radio label="baseline">与当前版本比对</Radio>
              <Radio label="peer">与节点比对</Radio>
            </RadioGroup>
            <div v-else class="fz-medium">与当前版本比对</div>
          </div>
          <div class="inline-flex">
            <TsFormSelect
              v-if="mode === 'peer'"
              v-model="targetResourceId"
              :dataList="targetResourceDataList"
              transfer
              clearable
              width="260px"
              placeholder="请选择目标节点"
            ></TsFormSelect>
            <Button type="primary" class="ml-sm" :loading="loadingShow" @click="loadCompareData()">开始比对</Button>
          </div>
        </div>
        <div v-if="summary" class="summary-grid pb-md">
          <div class="summary-item bg-op">
            <div class="text-grey">总字段</div>
            <div class="summary-value">{{ summary.totalCount || 0 }}</div>
          </div>
          <div class="summary-item bg-op">
            <div class="text-grey">差异项</div>
            <div class="summary-value">{{ summary.diffCount || 0 }}</div>
          </div>
          <div class="summary-item bg-op">
            <div class="text-grey">高风险</div>
            <div class="summary-value text-danger">{{ summary.highCount || 0 }}</div>
          </div>
          <div class="summary-item bg-op">
            <div class="text-grey">中风险</div>
            <div class="summary-value text-warning">{{ summary.mediumCount || 0 }}</div>
          </div>
          <div class="summary-item bg-op">
            <div class="text-grey">结果</div>
            <div class="summary-value">{{ summary.compareResult || '-' }}</div>
          </div>
        </div>
        <TsRow :gutter="16">
          <Col span="12">
            <div class="compare-box bg-op radius-md padding">
              <div class="pb-sm fz-medium">{{ sourceTitle }}</div>
              <TsCodemirror :value="sourceValue" codeMode="json" :isReadOnly="true" height="280px"></TsCodemirror>
            </div>
          </Col>
          <Col span="12">
            <div class="compare-box bg-op radius-md padding">
              <div class="pb-sm fz-medium">{{ targetTitle }}</div>
              <TsCodemirror :value="targetValue" codeMode="json" :isReadOnly="true" height="280px"></TsCodemirror>
            </div>
          </Col>
        </TsRow>
        <div class="pt-md">
          <TsTable
            v-bind="diffData"
            :theadList="theadList"
            :loading="loadingShow"
          >
            <template v-slot:isBlocked="{ row }">
              <span>{{ row.isBlocked ? '是' : '否' }}</span>
            </template>
            <template v-slot:sourceValue="{ row }">
              <span class="ellipsis-text">{{ formatCell(row.sourceValue) }}</span>
            </template>
            <template v-slot:targetValue="{ row }">
              <span class="ellipsis-text">{{ formatCell(row.targetValue) }}</span>
            </template>
          </TsTable>
        </div>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsCodemirror: () => import('@/resources/plugins/TsCodemirror/TsCodemirror.vue')
  },
  props: {
    appSystemId: {
      type: Number,
      default: null
    },
    appModuleId: {
      type: Number,
      default: null
    },
    envId: {
      type: [Number, String],
      default: null
    },
    typeId: {
      type: Number,
      default: null
    },
    resourceId: {
      type: Number,
      default: null
    },
    snapshotId: {
      type: Number,
      default: null
    },
    resourceLabel: {
      type: String,
      default: ''
    },
    resourceOptions: {
      type: Array,
      default: () => []
    },
    schemaName: {
      type: String,
      default: 'os'
    }
  },
  data() {
    return {
      loadingShow: false,
      mode: 'baseline',
      targetResourceId: null,
      sourceData: null,
      targetData: null,
      sourceSnapshot: null,
      summary: null,
      diffData: {
        tbodyList: [],
        rowNum: 0,
        currentPage: 1,
        pageSize: 20
      },
      theadList: [
        { key: 'layer', title: '层级' },
        { key: 'label', title: '字段' },
        { key: 'status', title: '状态' },
        { key: 'riskLevel', title: '风险' },
        { key: 'isBlocked', title: '阻断' },
        { key: 'sourceValue', title: '源值' },
        { key: 'targetValue', title: '目标值' },
        { key: 'reason', title: '说明' }
      ]
    };
  },
  computed: {
    dialogConfig() {
      return {
        type: 'slider',
        title: '配置比对',
        maskClose: true,
        isShow: true,
        width: 'huge',
        hasFooter: false
      };
    },
    targetResourceDataList() {
      return this.resourceOptions
        .filter(item => item.value !== this.resourceId)
        .map(item => ({ value: item.value, text: item.text }));
    },
    sourceTitle() {
      if (this.snapshotId && this.sourceSnapshot && this.sourceSnapshot.collectTime) {
        return `快照 ${this.formatSnapshotTime(this.sourceSnapshot.collectTime)}`;
      }
      return this.resourceLabel || '当前节点';
    },
    targetTitle() {
      return this.mode === 'baseline' ? '当前版本' : (this.resourceOptions.find(item => item.value === this.targetResourceId)?.text || '目标节点');
    },
    sourceValue() {
      return this.sourceData ? JSON.stringify(this.sourceData.layerData || this.sourceData, null, 2) : '{}';
    },
    targetValue() {
      return this.targetData ? JSON.stringify(this.targetData.layerData || this.targetData, null, 2) : '{}';
    }
  },
  watch: {
    targetResourceId(val, oldVal) {
      if (this.mode === 'peer' && val && val !== oldVal) {
        this.loadCompareData();
      }
    }
  },
  mounted() {
    this.loadCompareData();
  },
  methods: {
    handleModeChange() {
      if (this.snapshotId) {
        this.mode = 'baseline';
        return;
      }
      this.summary = null;
      this.diffData = {
        tbodyList: [],
        rowNum: 0,
        currentPage: 1,
        pageSize: 20
      };
      this.targetData = null;
      if (this.mode === 'peer' && !this.targetResourceId && this.targetResourceDataList.length > 0) {
        this.targetResourceId = this.targetResourceDataList[0].value;
      }
      this.$nextTick(() => {
        if (this.mode === 'baseline') {
          this.loadCompareData();
        } else if (this.targetResourceId) {
          this.loadCompareData();
        }
      });
    },
    loadCompareData() {
      let request = null;
      this.loadingShow = true;
      if (this.snapshotId) {
        request = this.$api.inspect.applicationInspect.compareConfigSnapshot({
          snapshotId: this.snapshotId
        });
      } else if (this.mode === 'peer') {
        if (!this.targetResourceId) {
          this.$Message.warning('请选择目标节点');
          this.loadingShow = false;
          return;
        }
        request = this.$api.inspect.applicationInspect.compareConfigResource({
          appSystemId: this.appSystemId,
          appModuleId: this.appModuleId,
          envId: this.envId || null,
          typeId: this.typeId,
          sourceResourceId: this.resourceId,
          targetResourceId: this.targetResourceId,
          schemaName: this.schemaName
        });
      } else {
        request = this.$api.inspect.applicationInspect.compareConfigBaseline({
          appSystemId: this.appSystemId,
          appModuleId: this.appModuleId,
          envId: this.envId || null,
          typeId: this.typeId,
          resourceId: this.resourceId,
          schemaName: this.schemaName
        });
      }
      request.then(res => {
        if (res && res.Status === 'OK') {
          this.summary = res.Return.summary || {};
          this.sourceData = res.Return.sourceData || {};
          this.targetData = res.Return.targetData || {};
          this.sourceSnapshot = res.Return.sourceSnapshot || null;
          let tbodyList = res.Return.diffList || [];
          this.diffData = {
            tbodyList: tbodyList,
            rowNum: tbodyList.length,
            currentPage: 1,
            pageSize: 20
          };
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    formatCell(value) {
      if (value === null || value === undefined) {
        return '-';
      }
      if (typeof value === 'string') {
        return value;
      }
      return JSON.stringify(value);
    },
    formatSnapshotTime(value) {
      if (!value) {
        return '-';
      }
      if (this.$options.filters && this.$options.filters.formatDate) {
        return this.$options.filters.formatDate(value);
      }
      return value;
    }
  }
};
</script>
<style lang="less" scoped>
.summary-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}
.summary-item {
  padding: 12px 16px;
  border-radius: 8px;
}
.summary-value {
  font-size: 20px;
  font-weight: 600;
  padding-top: 4px;
}
.ellipsis-text {
  display: inline-block;
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
