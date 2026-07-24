<template>
  <PortalCard
    :title="showTitle ? title : ''"
    :loading="loading"
    :error="error"
    :empty="isEmpty"
  >
    <template v-if="config.showMore !== 0" v-slot:action>全部服务</template>
    <div ref="tableWrap" class="overview-table">
      <TsTable
        :theadList="theadList"
        :tbodyList="tableList"
        :can-drag="false"
        :height="tableHeight"
        :show-pager="false"
      >
        <template v-slot:name="{ row }">
          <span class="overflow">{{ row.name }}</span>
        </template>
        <template v-slot:status="{ row }">
          <span :class="getStatusClass(row.status)">{{ row.status }}</span>
        </template>
        <template v-slot:health="{ row }">
          <span class="health-cell align-center">
            <span class="health-bar bg-tip-grey mr-sm"><i class="bg-success" :style="{ width: row.health + '%' }"></i></span>
            <span>{{ row.health }}%</span>
          </span>
        </template>
        <template v-slot:action>
          <div class="tstable-action">
            <ul class="tstable-action-ul">
              <li>详情</li>
            </ul>
          </div>
        </template>
      </TsTable>
    </div>
  </PortalCard>
</template>

<script>
import PortalCard from './PortalCard.vue';

export default {
  name: 'WorkbenchTable',
  components: {
    PortalCard,
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  props: {
    widget: { type: Object },
    config: { type: Object, default: () => ({}) },
    title: { type: String, default: '服务概览' },
    showTitle: { type: Boolean, default: true }
  },
  data() {
    return {
      loading: false,
      error: '',
      tableHeight: 160,
      resizeObserver: null,
      sourceList: [],
      sourceTheadList: [
        { key: 'name', title: '服务名称'},
        { key: 'status', title: '状态' },
        { key: 'health', title: '健康度' },
        { key: 'env', title: '所属环境'},
        { key: 'duration', title: '运行时长' },
        { key: 'action' }
      ]
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.updateTableHeight();
      this.bindResize();
    });
  },
  beforeDestroy() {
    this.unbindResize();
  },
  methods: {
    bindResize() {
      this.unbindResize();
      if (window.ResizeObserver && this.$refs.tableWrap) {
        this.resizeObserver = new ResizeObserver(() => {
          this.updateTableHeight();
        });
        this.resizeObserver.observe(this.$refs.tableWrap);
      } else {
        window.addEventListener('resize', this.updateTableHeight);
      }
    },
    unbindResize() {
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
      } else {
        window.removeEventListener('resize', this.updateTableHeight);
      }
    },
    updateTableHeight() {
      const el = this.$refs.tableWrap;
      if (!el) {
        return;
      }
      this.tableHeight = Math.max(el.clientHeight, 80);
    },
    getStatusClass(status) {
      if (status === '告警中') {
        return 'text-danger';
      }
      if (status === '维护中') {
        return 'text-warning';
      }
      return 'text-success';
    }
  },
  computed: {
    isEmpty() {
      return !this.tableList.length;
    },
    tableList() {
      const limit = Math.min(Number(this.config.limit) || 10, 10);
      return this.sourceList.slice(0, limit);
    },
    theadList() {
      return this.sourceTheadList.filter(item => this.config.showStatus !== 0 || item.key !== 'status');
    }
  }
};
</script>

<style lang="less" scoped>
.overview-table {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
.health-cell {
  display: inline-flex;
  max-width: 100%;
}
.health-bar {
  display: inline-block;
  width: 80px;
  height: 6px;
  border-radius: 999px;
  overflow: hidden;
  vertical-align: middle;
  i {
    display: block;
    height: 100%;
    border-radius: inherit;
  }
}
</style>
