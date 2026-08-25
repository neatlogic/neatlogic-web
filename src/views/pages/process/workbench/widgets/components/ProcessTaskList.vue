<template>
  <WorkbenchCard
    :title="showTitle ? title : ''"
    :loading="loading"
    :error="error"
    :empty="isEmpty"
    icon="tsfont-list"
    tone="primary"
    :subtitle="description"
    @retry="loadData"
  >
    <div ref="tableWrap" class="process-task-table">
      <TsTable
        :theadList="tableTheadList"
        :tbodyList="tbodyList"
        :rowNum="rowNum"
        :currentPage="currentPage"
        :pageSize="pageSize"
        :defaultShowSize="pageSize"
        :height="tableHeight"
        :showPager="true"
        :showSizer="false"
        :canSelectRow="false"
        keyName="id"
        @changeCurrent="changeCurrent"
      >
        <template v-for="header in tableTheadList" :slot="header.key" slot-scope="{ row }">
          <div :key="header.key" class="process-task-cell">
            <span
              v-if="header.key === 'title'"
              class="text-href overflow"
              :title="getCellText(row[header.key])"
              @click.stop="toDetail(row)"
            >
              {{ getCellText(row[header.key]) || '-' }}
            </span>
            <WorkcenterColumnHandler
              v-else-if="isWorkcenterCell(row[header.key])"
              :config="row[header.key]"
              :header="header"
              :row="row"
            ></WorkcenterColumnHandler>
            <span v-else-if="isTimeColumn(header.key)">
              {{ row[header.key] | formatDate }}
            </span>
            <span v-else class="overflow" :title="getCellText(row[header.key])">
              {{ getCellText(row[header.key]) || '-' }}
            </span>
          </div>
        </template>
      </TsTable>
    </div>
  </WorkbenchCard>
</template>

<script>
import WorkbenchCard from '@/views/components/portal/components/display/WorkbenchCard.vue';
import { $t } from '@/resources/init.js';
import {
  PROCESS_TASK_THEAD_HANDLER,
  createProcessTaskSearchParam,
  extractTheadList,
  getProcessTaskListContract,
  normalizeProcessTaskRowList,
  normalizePageSize,
  normalizeTheadList,
  serializeProcessTaskListConfig,
  toTableTheadList
} from '../utils/process-task-search.js';

export default {
  name: 'ProcessTaskList',
  components: {
    WorkbenchCard,
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    WorkcenterColumnHandler: () => import('@/views/pages/process/task/overview/workcenter/workcenter-column-handler.vue')
  },
  props: {
    widget: { type: Object, default: () => ({}) },
    title: { type: String, default: () => $t('term.workbench.workorderlist') },
    description: { type: String, default: '' },
    showTitle: { type: Boolean, default: true },
    config: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      loading: false,
      error: '',
      sourceTheadList: [],
      tbodyList: [],
      rowNum: 0,
      currentPage: 1,
      tableHeight: 160,
      resizeObserver: null,
      reloadTimer: null,
      requestSequence: 0,
      theadRequest: null
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
      this.requestSequence += 1;
      if (this.reloadTimer) {
        clearTimeout(this.reloadTimer);
      }
      this.reloadTimer = setTimeout(() => {
        this.reloadTimer = null;
        this.currentPage = 1;
        this.loadData();
      }, 200);
    },
    async ensureTheadList() {
      if (!this.widgetContract) {
        throw new Error(this.$t('term.workbench.invalidworkorderwidget'));
      }
      if ((this.config.theadList && this.config.theadList.length) || this.sourceTheadList.length) {
        return;
      }
      if (!this.theadRequest) {
        this.theadRequest = this.$api.tenant.searchWorkbenchWidgetData({
          handler: PROCESS_TASK_THEAD_HANDLER,
          portalWidgetName: this.widgetContract.portalWidgetName,
          param: {}
        }).then(res => {
          if (!res || res.Status !== 'OK') {
            throw new Error((res && res.Message) || this.$t('term.workbench.workordercolumnloadfailed'));
          }
          this.sourceTheadList = normalizeTheadList(extractTheadList(res.Return));
        }).finally(() => {
          this.theadRequest = null;
        });
      }
      await this.theadRequest;
    },
    async loadData() {
      const requestSequence = ++this.requestSequence;
      this.loading = true;
      this.error = '';
      try {
        await this.ensureTheadList();
        if (requestSequence !== this.requestSequence) {
          return;
        }
        const res = await this.$api.tenant.searchWorkbenchWidgetData({
          handler: this.widgetContract.handler,
          portalWidgetName: this.widgetContract.portalWidgetName,
          param: createProcessTaskSearchParam(
            serializeProcessTaskListConfig({
              ...this.config,
              theadList: this.resolvedTheadList
            }),
            this.currentPage
          )
        });
        if (requestSequence !== this.requestSequence) {
          return;
        }
        if (!res || res.Status !== 'OK') {
          throw new Error((res && res.Message) || this.$t('term.workbench.workorderlistloadfailed'));
        }
        const data = res.Return || {};
        if ((!this.config.theadList || !this.config.theadList.length) && extractTheadList(data).length) {
          this.sourceTheadList = normalizeTheadList(extractTheadList(data));
        }
        this.tbodyList = normalizeProcessTaskRowList(data.tbodyList);
        this.rowNum = Number(data.rowNum) || 0;
        this.currentPage = Math.max(1, Number(data.currentPage) || this.currentPage);
      } catch (error) {
        if (requestSequence !== this.requestSequence) {
          return;
        }
        this.tbodyList = [];
        this.rowNum = 0;
        this.error = (error && (error.Message || error.message)) || this.$t('term.workbench.workorderlistloadfailed');
      } finally {
        if (requestSequence === this.requestSequence) {
          this.loading = false;
          this.$nextTick(() => {
            this.updateTableHeight();
            this.bindResize();
          });
        }
      }
    },
    changeCurrent(page) {
      this.currentPage = Math.max(1, Number(page) || 1);
      this.loadData();
    },
    bindResize() {
      this.unbindResize();
      if (window.ResizeObserver && this.$refs.tableWrap) {
        this.resizeObserver = new ResizeObserver(this.updateTableHeight);
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
    isWorkcenterCell(value) {
      return value !== null && typeof value === 'object';
    },
    isTimeColumn(key) {
      return ['starttime', 'endtime', 'startTime', 'endTime'].includes(key);
    },
    getCellText(value) {
      if (value === undefined || value === null) {
        return '';
      }
      if (Array.isArray(value)) {
        return value.map(this.getCellText).filter(Boolean).join('、');
      }
      if (typeof value === 'object') {
        return value.text || value.name || value.label || value.value || '';
      }
      return value;
    },
    getTaskId(row) {
      return row.id || row.processTaskId || row.taskid || (row.route && row.route.taskid);
    },
    toDetail(row) {
      const processTaskId = this.getTaskId(row);
      if (!processTaskId) {
        return;
      }
      const path = '/task-detail';
      if (MODULEID === 'process') {
        this.$router.push({ path, query: { processTaskId } });
      } else {
        window.location.href = `${HOME}/process.html#${path}?processTaskId=${processTaskId}`;
      }
    }
  },
  computed: {
    widgetContract() {
      return getProcessTaskListContract(this.widget.type);
    },
    pageSize() {
      return normalizePageSize(this.config.pageSize);
    },
    resolvedTheadList() {
      return this.config.theadList && this.config.theadList.length
        ? this.config.theadList
        : this.sourceTheadList;
    },
    tableTheadList() {
      return toTableTheadList(this.resolvedTheadList);
    },
    configFingerprint() {
      return JSON.stringify(serializeProcessTaskListConfig(this.config));
    },
    isEmpty() {
      return !this.tbodyList.length;
    }
  },
  watch: {
    configFingerprint() {
      this.scheduleLoadData();
    }
  }
};
</script>

<style lang="less" scoped>
.process-task-table {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
.process-task-cell {
  min-width: 0;
  overflow: hidden;
  line-height: 34px;
}
</style>
