<template>
  <TsDialog v-bind="dialogConfig" @on-close="$emit('close')">
    <div class="operation-audit">
      <div class="audit-search mb-md">
        <TsFormInput
          v-model="keyword"
          :placeholder="$t('page.jobaudit.keyword')"
          :maxlength="200"
          clearable
          search
          @on-enter="search"
          @on-search="search"
          @on-clear="search"
        ></TsFormInput>
        <CombineSearcher v-model="filters" v-bind="searchConfig" @change="search"></CombineSearcher>
      </div>
      <div v-if="listError" class="text-error mb-md">
        {{ $t('page.jobaudit.loadfailed') }} <span class="text-href" @click="loadList(true)">{{ $t('page.retry') }}</span>
      </div>
      <div class="audit-layout">
        <div class="audit-list">
          <TsTable
            v-bind="tableConfig"
            :theadList="headers"
            :loading="loading"
            canExpand
            class="inner-table"
            @clickTr="selectRow"
            @toggleExpand="toggleExpand"
            @changeCurrent="changePage"
            @changePageSize="changePageSize"
          >
            <template v-slot:expand="{ row }">
              <div v-if="row._expand" class="audit-expanded">
                <Loading v-if="row.auditState.loading"></Loading>
                <div v-else-if="row.auditState.error" class="text-error">
                  {{ $t('page.jobaudit.loadfailed') }} <span class="text-href" @click="loadDetail(row.id)">{{ $t('page.retry') }}</span>
                </div>
                <OperationAuditDetail v-else-if="row.auditState.detail" :detail="row.auditState.detail" @change-page="loadDetail(row.id, $event)"></OperationAuditDetail>
              </div>
            </template>
            <template v-slot:operateTime="{ row }"><span class="text-href">{{ row.operateTime | formatDate }}</span></template>
            <template v-slot:operatorName="{ row }">
              <UserCard
                v-if="row.operatorUuid"
                :uuid="row.operatorUuid"
                :name="row.operatorName || row.operatorUuid"
                @click.native.stop
              ></UserCard>
              <span v-else>-</span>
            </template>
            <template v-slot:targetName="{ row }"><span>{{ row.targetName }}</span><span v-if="row.targetCount > 1" class="text-tip"> ({{ row.targetCount }})</span></template>
            <template v-slot:noDataTip>{{ $t('page.jobaudit.empty') }}</template>
          </TsTable>
        </div>

      </div>
    </div>
  </TsDialog>
</template>
<script>
import TsTable from '@/resources/components/TsTable/TsTable.vue';
import CombineSearcher from '@/resources/components/CombineSearcher/CombineSearcher.vue';
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
import OperationAuditDetail from './operation-audit-detail.vue';

// 面板独立拥有查询状态，不修改作业详情的阶段、节点或执行状态。
export default {
  name: 'JobOperationAuditSlider',
  components: { TsTable, CombineSearcher, TsFormInput, OperationAuditDetail, UserCard: () => import('@/resources/components/UserCard/UserCard.vue') },
  props: { jobId: { type: [Number, String], required: true } },
  data() {
    const values = (prefix, list) => list.map(value => ({ value, text: this.$t(`page.jobaudit.${prefix}.${value}`) }));
    return {
      // TsForm 会写入字段值，配置对象须保持稳定，不能随查询响应重建。
      searchConfig: {
        search: false,
        searchList: [
          { name: 'objectType', type: 'select', label: this.$t('page.itemtype'), dataList: values('object', ['job', 'phase', 'node', 'sql']), transfer: true },
          { name: 'action', type: 'select', label: this.$t('page.jobaudit.action'), dataList: [], transfer: true },
          { name: 'operatorUuid', type: 'userselect', label: this.$t('page.operator'), groupList: ['user'], multiple: false, transfer: true },
          { name: 'timeRange', type: 'datetimerange', label: this.$t('page.jobaudit.time'), valueType: 'timestamp', transfer: true }
        ]
      },

      keyword: '', filters: {}, rows: [], detailStates: {},
      currentPage: 1, pageSize: 20, rowNum: 0, loading: false,
      listError: false, listSequence: 0,
      viewportWidth: window.innerWidth,
      headers: [
        { key: 'expander', title: '', width: 40 },
        { key: 'operateTime', title: this.$t('page.jobaudit.time'), width: 170 },
        { key: 'operatorName', title: this.$t('page.executeuser'), width: 110 },
        { key: 'actionText', title: this.$t('page.jobaudit.action'), width: 110 },
        { key: 'objectTypeText', title: this.$t('page.jobaudit.objecttype'), width: 130 },
        { key: 'targetName', title: this.$t('page.jobaudit.target') }
      ]
    };
  },
  mounted() {
    window.addEventListener('resize', this.resize);
    this.loadList();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resize);
    // 使销毁前的异步响应失效。
    this.listSequence++;
    this.detailStates = {};
  },
  methods: {
    // 按视口更新侧滑宽度，不修改共享弹窗样式。
    resize() { this.viewportWidth = window.innerWidth; },
    // 条件变化总是从第一页查询。
    search() { this.currentPage = 1; this.loadList(); },
    // 列表翻页后收起详情，展开时再按需加载。
    changePage(page) { this.currentPage = page; this.loadList(); },
    // 调整每页数量时回到首页。
    changePageSize(size) { this.pageSize = size; this.search(); },
    // 主列表只接收最后一次请求；刷新保留当前页仍存在的展开记录。
    async loadList(preserveSelection = false) {
      const sequence = ++this.listSequence;
      const expanded = preserveSelection ? Object.keys(this.detailStates).filter(id => this.detailStates[id].expanded) : [];
      this.detailStates = {};
      this.loading = true;
      this.listError = false;
      const { timeRange, ...filters } = this.filters;
      try {
        const response = await this.$api.autoexec.job.searchOperationAudit({
          jobId: this.jobId, keyword: String(this.keyword || '').trim(), ...filters,
          startTime: timeRange && timeRange[0] || null, endTime: timeRange && timeRange[1] || null,
          currentPage: this.currentPage, pageSize: this.pageSize
        });
        if (sequence !== this.listSequence) return;
        const data = response.Return;
        this.rows = data.tbodyList || [];
        const actionField = this.searchConfig.searchList.find(item => item.name === 'action');
        // 相同选项不触发下拉组件重建；仅更新数据源，保留字段当前值。
        if (Array.isArray(data.actionList) && JSON.stringify(actionField.dataList) !== JSON.stringify(data.actionList)) {
          actionField.dataList = data.actionList;
        }
        this.rowNum = data.rowNum;
        this.currentPage = data.currentPage;
        this.rows.filter(row => expanded.includes(String(row.id))).forEach(row => this.openRow(row));
      } catch (error) {
        if (sequence === this.listSequence) { this.rows = []; this.rowNum = 0; this.listError = true; }
      } finally {
        if (sequence === this.listSequence) this.loading = false;
      }
    },
    // 每条记录独立展开，收起时使该行尚未返回的请求失效。
    selectRow(row) {
      this.toggleExpand(row);
    },
    // 表头传入明确的展开状态；单行点击未传状态时切换当前行。
    toggleExpand(row, expanded) {
      if (this.loading) return;
      const state = this.detailStates[row.id];
      const shouldExpand = typeof expanded === 'boolean' ? expanded : !(state && state.expanded);
      if (!shouldExpand && state) {
        state.expanded = false;
        state.sequence++;
        state.loading = false;
      } else if (shouldExpand) {
        this.openRow(row);
      }
    },
    // 当前列表生命周期内复用已加载明细，避免重复展开重复请求。
    openRow(row) {
      if (!this.detailStates[row.id]) this.$set(this.detailStates, row.id, { expanded: false, loading: false, error: false, detail: null, sequence: 0 });
      const state = this.detailStates[row.id];
      state.expanded = true;
      if (!state.detail && !state.loading) this.loadDetail(row.id);
    },
    // 每行独立管理分页、错误和请求序号，互不覆盖明细。
    async loadDetail(id, page = 1) {
      const state = this.detailStates[id];
      if (!state || !state.expanded) return;
      const sequence = ++state.sequence;
      const isCurrent = () => this.detailStates[id] === state && state.sequence === sequence;
      state.loading = true;
      state.error = false;
      state.detail = null;
      try {
        const response = await this.$api.autoexec.job.getOperationAudit({ jobId: this.jobId, id, currentPage: page, pageSize: 20 });
        if (isCurrent()) state.detail = response.Return;
      } catch (error) {
        if (isCurrent()) state.error = true;
      } finally {
        if (isCurrent()) state.loading = false;
      }
    }
  },
  computed: {
    // 复用组件宽度能力，窄屏使用全宽并保留表格横向滚动。
    dialogConfig() {
      return { type: 'slider', isShow: true, title: this.$t('page.actionaudit'), width: this.viewportWidth < 1280 ? '100%' : '70%', hasFooter: false, maskClose: true };
    },
    tableConfig() {
      return { tbodyList: this.rows.map(row => ({ ...row, _expand: !!(this.detailStates[row.id] && this.detailStates[row.id].expanded), auditState: this.detailStates[row.id] })), currentPage: this.currentPage, pageSize: this.pageSize, rowNum: this.rowNum, keyName: 'id' };
    }
  }
};
</script>
<style lang="less" scoped>
.operation-audit { height: calc(100vh - 120px); display: flex; flex-direction: column; }
.audit-search { display: grid; grid-template-columns: minmax(220px, 360px) minmax(200px, 1fr); gap: 12px; align-items: start; }
.audit-layout { min-height: 0; flex: 1; overflow: auto; }
.audit-list { min-width: 0; }
.audit-expanded { margin-left: 40px; padding: 0; position: relative; min-height: 64px; }
@media (max-width: 760px) { .audit-search { grid-template-columns: 1fr; } .audit-expanded { margin-left: 12px; padding-right: 12px; } }
</style>
