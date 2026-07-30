<template>
  <PortalCard
    :title="showTitle ? title : ''"
    :loading="loading"
    :error="error"
    :empty="isEmpty"
    icon="tsfont-task"
    tone="primary"
    :subtitle="description"
  >
    <template v-slot:action>
      <span
        :class="['todo-filter', { 'text-primary': activeFilter === 'all' }]"
        @click="activeFilter = 'all'"
      >
        全部
      </span>
      <span
        :class="['todo-filter', { 'text-danger': activeFilter === 'urgent' }]"
        @click="activeFilter = 'urgent'"
      >
        紧急
      </span>
      <span v-if="showMore" class="text-action ml-sm" @click="toWorkcenter">更多</span>
    </template>
    <div ref="tableWrap" class="todo-table">
      <TsTable
        :theadList="theadList"
        :tbodyList="list"
        :can-drag="false"
        :height="tableHeight"
        :show-pager="false"
      >
        <template v-slot:title="{ row }">
          <span class="text-href overflow" :title="getTitle(row)" @click.stop="toDetail(row)">{{ getTitle(row) }}</span>
        </template>
        <template v-slot:channelName="{ row }">
          <span class="overflow">{{ getText(row.channelName || row.channel || row.catalogName || row.catalog) || '-' }}</span>
        </template>
        <template v-slot:priority="{ row }">
          <span class="overflow">{{ getText(row.priority) || '-' }}</span>
        </template>
        <template v-slot:currentStepName="{ row }">
          <span class="overflow">{{ getText(row.currentStepName || row.currentstepname || row.currentstep) || '-' }}</span>
        </template>
        <template v-slot:statusName="{ row }">
          <span class="overflow">{{ getText(row.statusName || row.status) || '-' }}</span>
        </template>
      </TsTable>
    </div>
  </PortalCard>
</template>

<script>
import PortalCard from './PortalCard.vue';

export default {
  name: 'ProcessingOfMineProcessTask',
  components: {
    PortalCard,
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  props: {
    widget: { type: Object },
    title: { type: String, default: '我的待办' },
    description: { type: String, default: '' },
    showTitle: { type: Boolean, default: true },
    config: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      loading: false,
      error: '',
      sourceList: [],
      tableHeight: 160,
      resizeObserver: null,
      reloadTimer: null,
      requestSequence: 0,
      activeFilter: 'all'
    };
  },
  created() {
    this.loadData();
  },
  mounted() {
    this.$nextTick(() => {
      this.updateTableHeight();
      this.bindResize();
    });
  },
  beforeDestroy() {
    if (this.reloadTimer) {
      clearTimeout(this.reloadTimer);
      this.reloadTimer = null;
    }
    this.requestSequence += 1;
    this.unbindResize();
  },
  methods: {
    scheduleLoadData() {
      // 配置滑块会连续触发更新，先让当前请求失效，再合并为最后一次查询。
      this.requestSequence += 1;
      if (this.reloadTimer) {
        clearTimeout(this.reloadTimer);
      }
      this.reloadTimer = setTimeout(() => {
        this.reloadTimer = null;
        this.loadData();
      }, 200);
    },
    loadData() {
      // 仅允许最后发起的请求更新状态，避免旧响应覆盖新配置对应的数据。
      const requestSequence = ++this.requestSequence;
      this.loading = true;
      this.error = '';
      this.$api.common.searchWorkbenchWidgetData({
        handler: 'process.processingOfMineProcessTask',
        portalWidgetName: 'processingOfMineProcessTask',
        param: {
          limit: this.limit,
          needPage: false
        }
      }).then(res => {
        if (requestSequence !== this.requestSequence) {
          return;
        }
        if (!res || res.Status !== 'OK') {
          throw new Error((res && res.Message) || '我的待办加载失败');
        }
        const result = res.Return || {};
        this.sourceList = Array.isArray(result.tbodyList) ? result.tbodyList : [];
      }).catch(error => {
        if (requestSequence !== this.requestSequence) {
          return;
        }
        this.sourceList = [];
        this.error = (error && (error.Message || error.message)) || '我的待办加载失败';
      }).finally(() => {
        if (requestSequence !== this.requestSequence) {
          return;
        }
        this.loading = false;
        this.$nextTick(() => {
          this.updateTableHeight();
          this.bindResize();
        });
      });
    },
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
      if (el) {
        this.tableHeight = Math.max(el.clientHeight, 80);
      }
    },
    getText(value) {
      if (value === null || value === undefined) {
        return '';
      }
      if (typeof value === 'object') {
        return value.text || value.name || value.label || value.value || '';
      }
      return value;
    },
    getTitle(item) {
      return this.getText(item.title || item.name || item.serialnumber || item.serialNumber) || '-';
    },
    getTaskId(item) {
      return item.taskid || item.id || (item.route && item.route.taskid);
    },
    isUrgentTask(item) {
      const status = this.getText(item.statusName || item.status);
      const priority = this.getText(item.priority);
      return /超时|风险|紧急|urgent|high/i.test(`${status} ${priority}`);
    },
    toDetail(item) {
      const processTaskId = this.getTaskId(item);
      if (processTaskId) {
        const path = `/task-detail?processTaskId=${processTaskId}`;
        if (MODULEID === 'process') {
          this.$router.push({ path: '/task-detail', query: { processTaskId } });
        } else {
          window.location.href = `${HOME}/process.html#${path}`;
        }
      }
    },
    toWorkcenter() {
      const path = '/task-overview-processingOfMineProcessTask';
      if (MODULEID === 'process') {
        this.$router.push({ path });
      } else {
        window.location.href = `${HOME}/process.html#${path}`;
      }
    }
  },
  computed: {
    limit() {
      const limit = Number(this.config.limit);
      return Math.max(2, Math.min(8, Number.isFinite(limit) ? limit : 5));
    },
    showStatus() {
      return this.config.showStatus !== 0 && this.config.showStatus !== false;
    },
    showMore() {
      return this.config.showMore !== 0 && this.config.showMore !== false;
    },
    theadList() {
      const theadList = [
        { key: 'title', title: '工单标题' },
        { key: 'channelName', title: '服务' },
        { key: 'priority', title: '优先级' },
        { key: 'currentStepName', title: '当前节点' }
      ];
      if (this.showStatus) {
        theadList.push({ key: 'statusName', title: '状态' });
      }
      return theadList;
    },
    list() {
      const sourceList = this.activeFilter === 'urgent'
        ? this.sourceList.filter(this.isUrgentTask)
        : this.sourceList;
      return sourceList.slice(0, this.limit);
    },
    isEmpty() {
      return !this.list.length;
    }
  },
  watch: {
    limit() {
      this.scheduleLoadData();
    }
  }
};
</script>

<style lang="less" scoped>
.todo-table {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
.todo-filter {
  margin-left: 8px;
  cursor: pointer;
}
</style>
