<template>
  <div class="feishu-sync-manage">
    <TsContain>
      <template v-slot:topLeft>
        <span class="tsfont-setting text-action" @click="openEditDialog()">应用凭证</span>
        <span
          v-if="hasBatchSyncSelection"
          class="text-action tsfont-sync table-batch-action"
          :class="{ 'text-disabled': isBatchSyncing }"
          @click="batchSyncSelectedDocument"
        >批量同步</span>
      </template>
      <template v-slot:topRight>
        <InputSearcher v-model="searchParams.keyword" @change="searchData()"></InputSearcher>
      </template>
      <template v-slot:sider>
        <div class="wiki-space-list">
          <div v-if="wikiSpaceList.length > 0" class="wiki-space-toolbar">
            <Checkbox
              :indeterminate="isWikiSpaceIndeterminate"
              :value="isAllWikiSpaceChecked"
              @click.prevent.native="toggleAllWikiSpaceChecked"
            >全选</Checkbox>
          </div>
          <div
            v-for="wikiSpace in wikiSpaceList"
            :key="wikiSpace.space_id"
            class="wiki-space-item text-action"
            :class="{ 'is-active': selectedWikiSpaceId === wikiSpace.space_id }"
            @click="changeModuleGroup(wikiSpace.space_id)"
          >
            <Checkbox
              class="wiki-space-checkbox"
              :value="isWikiSpaceChecked(wikiSpace.space_id)"
              @click.native.stop
              @on-change="toggleWikiSpaceChecked(wikiSpace.space_id, $event)"
            ></Checkbox>
            <div class="wiki-space-name overflow" :title="wikiSpace.name">
              {{ wikiSpace.name }}
            </div>
          </div>
          <NoData v-if="!wikiSpaceLoading && wikiSpaceList.length === 0"></NoData>
        </div>
      </template>
      <template v-slot:content>
        <Loading :loadingShow="isLoading" type="fix"></Loading>
        <TsTable
          :theadList="nodeTheadList"
          :value="selectedNodeTokenList"
          keyName="nodeToken"
          multiple
          selectedRemain
          canExpand
          v-bind="tableConfig"
          @changeCurrent="changeCurrent"
          @changePageSize="changePageSize"
          @getSelected="getSelectedNode"
          @toggleExpand="toggleNodeExpand"
        >
          <template v-slot:title="{row}">
            <span>{{ row.title }}</span>
          </template>
          <template v-slot:path="{row}">
            <span>{{ getPathText(row.path) }}</span>
          </template>
          <template v-slot:hasChild="{row}">
            <span>{{ row.hasChild ? '是' : '否' }}</span>
          </template>
          <template v-slot:expand="{ row }">
            <!-- 有 hasChild 的节点在当前行下方递归嵌套子表，展开时再加载 children 数据。 -->
            <WikiNodeNestedTable
              :row="row"
              :thead-list="nodeTheadList"
              :selected-node-token-list="selectedNodeTokenList"
              :get-path-text="getPathText"
              :toggle-node-expand="toggleNodeExpand"
              :get-selected-node="getSelectedNode"
            ></WikiNodeNestedTable>
          </template>
        </TsTable>
      </template>
    </TsContain>

    <!-- 应用凭证弹框仍由独立组件负责，当前页面只管理弹框开关和保存后刷新。 -->
    <FeishuSyncEdit
      v-if="isEditDialogShow"
      :config-data="currentEditConfig"
      @close="closeEditDialog"
    ></FeishuSyncEdit>

    <TsDialog
      v-if="isAuditDialogShow"
      :isShow.sync="isAuditDialogShow"
      title="同步记录"
      width="large"
      :hasFooter="false"
    >
      <template v-slot>
        <TsTable
          :theadList="auditTheadList"
          v-bind="auditTableConfig"
          @changeCurrent="changeAuditCurrent"
          @changePageSize="changeAuditPageSize"
        >
          <template v-slot:status="{row}">
            <span :class="row.status === 'failed' ? 'text-error' : 'text-success'">{{ statusText(row.status) }}</span>
          </template>
          <template v-slot:action="{row}">
            <span v-if="row.status === 'failed'" class="text-action tsfont-refresh" @click="retry(row)">重试</span>
          </template>
        </TsTable>
      </template>
    </TsDialog>
  </div>
</template>

<script>
const WikiNodeNestedTable = {
  name: 'WikiNodeNestedTable',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable')
  },
  props: {
    row: { type: Object, default: () => ({}) },
    theadList: { type: Array, default: () => [] },
    selectedNodeTokenList: { type: Array, default: () => [] },
    getPathText: { type: Function, required: true },
    toggleNodeExpand: { type: Function, required: true },
    getSelectedNode: { type: Function, required: true }
  },
  methods: {
    getChildTableConfig(row) {
      // 子表格不分页，只展示展开接口返回并写入当前行 children 的下一层节点。
      const tbodyList = row && row.children ? row.children : [];
      return {
        theadList: this.theadList,
        tbodyList,
        rowNum: tbodyList.length,
        pageSize: tbodyList.length || 1,
        currentPage: 1
      };
    }
  },
  render(h) {
    // 使用 render 函数声明递归子表，避免在同一 SFC 中拆出额外文件。
    return h('div', { class: 'wiki-node-expand' }, [
      this.row.childrenLoading ? h('Loading', { props: { loadingShow: true, type: 'fix' } }) : null,
      h('TsTable', {
        props: {
          ...this.getChildTableConfig(this.row),
          value: this.selectedNodeTokenList,
          keyName: 'nodeToken',
          multiple: true,
          selectedRemain: true,
          showPager: false,
          canResize: false,
          canExpand: true
        },
        on: {
          toggleExpand: this.toggleNodeExpand,
          getSelected: this.getSelectedNode
        },
        scopedSlots: {
          title: ({ row }) => h('span', [row.title]),
          path: ({ row }) => h('span', [this.getPathText(row.path)]),
          hasChild: ({ row }) => h('span', [row.hasChild ? '是' : '否']),
          expand: ({ row }) => h(WikiNodeNestedTable, {
            props: {
              row,
              theadList: this.theadList,
              selectedNodeTokenList: this.selectedNodeTokenList,
              getPathText: this.getPathText,
              toggleNodeExpand: this.toggleNodeExpand,
              getSelectedNode: this.getSelectedNode
            }
          })
        }
      })
    ]);
  }
};

export default {
  name: 'FeishuSyncManage',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    TsDialog: () => import('@/resources/plugins/TsDialog/TsDialog.vue'),
    FeishuSyncEdit: () => import('./feishu-sync-edit.vue'),
    WikiNodeNestedTable
  },
  data() {
    return {
      isLoading: false,
      isEditDialogShow: false,
      isAuditDialogShow: false,
      isBatchSyncing: false,
      currentConfig: null,
      currentEditConfig: null,
      appCredentials: null,
      searchParams: { keyword: '', currentPage: 1, pageSize: 20 },
      auditSearchParams: { configId: null, currentPage: 1, pageSize: 10 },
      nodeTheadList: [
        { key: 'selection', multiple: true, width: 20 },
        { key: 'expander', width: 40 },
        { title: '标题', key: 'title', width: 220 },
        { title: '类型', key: 'objType', width: 90 },
        { title: '路径', key: 'path', width: 240 },
        { title: '更新时间', key: 'updateTime', type: 'time', width: 160 },
        { title: '包含子节点', key: 'hasChild', width: 100 },
        { title: '节点 Token', key: 'nodeToken' }
      ],
      auditTheadList: [
        { title: '方向', key: 'direction' },
        { title: '状态', key: 'status' },
        { title: '总数', key: 'totalCount' },
        { title: '成功', key: 'successCount' },
        { title: '失败', key: 'failedCount' },
        { title: '错误', key: 'error' },
        { title: '开始时间', key: 'startTime', type: 'time' },
        { title: '', key: 'action' }
      ],
      tableConfig: { tbodyList: [], rowNum: 0, pageSize: 20, currentPage: 1 },
      auditTableConfig: { tbodyList: [], rowNum: 0, pageSize: 10, currentPage: 1 },
      wikiSpaceLoading: false,
      selectedWikiSpaceId: null,
      selectedWikiSpaceIdList: [],
      selectedNodeTokenList: [],
      wikiSpaceList: []
    };
  },
  created() {
    this.initPage();
  },
  methods: {
    initPage() {
      // 每次进入页面先获取最新应用凭证，缺失时主动弹出设置弹框。
      this.getLatestAppCredentials(true).finally(() => {
        this.listWikiSpace();
      });
    },
    getLatestAppCredentials(needAutoOpen) {
      return this.$api.knowledge.feishu.getAppCredentials({}).then(res => {
        if (res.Status === 'OK') {
          this.appCredentials = res.Return || {};
          if (needAutoOpen && (!this.appCredentials.appId || !this.appCredentials.appSecret)) {
            // appId 或 appSecret 缺失时主动弹出应用凭证设置弹框，引导用户先完成配置。
            this.openEditDialog();
          }
        }
      });
    },
    listWikiSpace() {
      this.wikiSpaceLoading = true;
      this.$api.knowledge.feishu.listWikiSpace({}).then(res => {
        if (res.Status === 'OK') {
          // Wiki 空间接口返回 TableResultUtil 结构，所以列表统一从 Return.tbodyList 读取。
          this.wikiSpaceList = (res.Return && res.Return.tbodyList) || [];
          if (!this.selectedWikiSpaceId && this.wikiSpaceList.length > 0) {
            // 节点列表接口必须传 spaceId，因此默认选中第一个空间。
            this.selectedWikiSpaceId = this.wikiSpaceList[0].space_id;
          }
          if (this.selectedWikiSpaceId && !this.wikiSpaceList.find(wikiSpace => wikiSpace.space_id === this.selectedWikiSpaceId)) {
            // 当前空间不存在时清空选中态，避免右侧查询使用过期 spaceId。
            this.selectedWikiSpaceId = null;
          }
          // 空间列表刷新后移除已经不存在的勾选项。
          this.selectedWikiSpaceIdList = this.selectedWikiSpaceIdList.filter(spaceId => this.allWikiSpaceIdList.includes(spaceId));
          this.searchData();
        }
      }).finally(() => {
        this.wikiSpaceLoading = false;
      });
    },
    searchData() {
      if (!this.selectedWikiSpaceId) {
        // 未选中空间时不能调用节点列表接口，表格保持空数据。
        this.tableConfig = { tbodyList: [], rowNum: 0, pageSize: this.searchParams.pageSize, currentPage: 1 };
        this.selectedNodeTokenList = [];
        return;
      }
      this.isLoading = true;
      this.$api.knowledge.feishu.listWikiNode({
        spaceId: this.selectedWikiSpaceId,
        currentPage: this.searchParams.currentPage,
        pageSize: this.searchParams.pageSize
      }).then(res => {
        if (res.Status === 'OK') {
          const { tbodyList = [], rowNum = 0, pageSize = this.searchParams.pageSize, currentPage = this.searchParams.currentPage } = res.Return || {};
          // 主表分页大小以 wiki/node/list 接口返回的 pageSize 为准，避免前端固定页大小导致分页显示不正确。
          const allNodeList = this.decorateNodeList(tbodyList);
          const filteredNodeList = this.filterNodeList(allNodeList);
          const filteredNodeTokenList = this.getAllNodeTokenList(filteredNodeList);
          this.selectedNodeTokenList = this.selectedNodeTokenList.filter(nodeToken => filteredNodeTokenList.includes(nodeToken));
          // 同步接口返回的分页状态，保证后续翻页继续使用后端返回的 pageSize。
          this.searchParams.pageSize = pageSize;
          this.searchParams.currentPage = currentPage;
          this.tableConfig = {
            tbodyList: filteredNodeList,
            rowNum: this.searchParams.keyword ? filteredNodeList.length : rowNum,
            pageSize,
            currentPage
          };
        }
      }).finally(() => {
        this.isLoading = false;
      });
    },
    decorateNodeList(nodeList) {
      // 是否显示嵌套表格入口只由 hasChild 字段决定，不再依赖 children 是否有数据。
      return (nodeList || []).map(node => {
        return {
          ...node,
          children: [],
          childrenLoaded: false,
          childrenLoading: false,
          '#expander': node.hasChild === true,
          _expand: false
        };
      });
    },
    decorateChildNodeList(nodeList) {
      // 展开接口返回的子节点也补充展开字段，方便继续按 hasChild 懒加载下一层。
      return (nodeList || []).map(node => {
        return {
          ...node,
          children: [],
          childrenLoaded: false,
          childrenLoading: false,
          '#expander': node.hasChild === true,
          _expand: false
        };
      });
    },
    getAllNodeTokenList(nodeList) {
      // 递归收集当前已加载节点里的所有 nodeToken，确保嵌套行勾选不会在刷新后丢失。
      return (nodeList || []).reduce((tokenList, node) => {
        if (node.nodeToken) {
          tokenList.push(node.nodeToken);
        }
        tokenList.push(...this.getAllNodeTokenList(node.children || []));
        return tokenList;
      }, []);
    },
    filterNodeList(nodeList) {
      const keyword = this.searchParams.keyword;
      if (!keyword) {
        return nodeList;
      }
      // 节点列表接口没有 keyword 入参，所以关键字搜索在前端本地处理。
      return nodeList.filter(node => {
        const pathText = this.getPathText(node.path);
        return [node.title, node.objType, node.nodeToken, node.objToken, pathText].some(value => {
          return value && String(value).toLowerCase().includes(keyword.toLowerCase());
        });
      });
    },
    toggleNodeExpand(row, isExpand) {
      const nextExpand = typeof isExpand === 'boolean' ? isExpand : !row._expand;
      // 展开按钮只维护当前行 _expand 状态，兼容表头全展开传入的布尔值。
      this.$set(row, '_expand', nextExpand);
      if (nextExpand) {
        this.loadChildNodeList(row);
      }
    },
    loadChildNodeList(row) {
      if (!row || row.hasChild !== true || row.childrenLoaded || row.childrenLoading) {
        return;
      }
      this.$set(row, 'childrenLoading', true);
      this.$api.knowledge.feishu.listWikiNode({
        spaceId: this.selectedWikiSpaceId,
        parentNodeToken: row.nodeToken
      }).then(res => {
        if (res.Status === 'OK') {
          // 点击展开时按 parentNodeToken 获取当前节点下一层 children 数据。
          const childList = this.decorateChildNodeList((res.Return && res.Return.tbodyList) || []);
          this.$set(row, 'children', childList);
          this.$set(row, 'childrenLoaded', true);
        }
      }).finally(() => {
        this.$set(row, 'childrenLoading', false);
      });
    },
    getPathText(path) {
      // FeishuNode.path 是数组，表格中展示为层级路径文本。
      return Array.isArray(path) ? path.join(' / ') : (path || '-');
    },
    getSelectedNode(selectedNodeTokenList) {
      // 主表和嵌套表都通过 getSelected 返回 keyName 列表，这里统一保存为 nodeTokenList 入参。
      this.selectedNodeTokenList = selectedNodeTokenList || [];
    },
    batchSyncSelectedDocument() {
      if (!this.hasBatchSyncSelection || this.isBatchSyncing) {
        return;
      }
      const params = {};
      if (this.selectedWikiSpaceIdList.length > 0) {
        // 左侧空间勾选项统一通过顶部批量同步按钮提交，入参使用 spaceIdList。
        params.spaceIdList = this.selectedWikiSpaceIdList;
      }
      if (this.selectedNodeTokenList.length > 0) {
        // 表格和嵌套表格勾选项统一通过顶部批量同步按钮提交，入参使用 nodeTokenList。
        params.nodeTokenList = this.selectedNodeTokenList;
      }
      this.isBatchSyncing = true;
      this.$api.knowledge.feishu.syncWikiDocument(params).then(res => {
        if (res.Status === 'OK') {
          this.$Message.success('批量同步已提交');
          // 空间和节点批量同步共用一个入口，提交成功后刷新当前节点表格状态。
          this.searchData();
        }
      }).finally(() => {
        this.isBatchSyncing = false;
      });
    },
    isWikiSpaceChecked(spaceId) {
      // 集中判断左侧空间勾选状态，避免模板中出现复杂表达式。
      return this.selectedWikiSpaceIdList.includes(spaceId);
    },
    toggleWikiSpaceChecked(spaceId, isChecked) {
      if (isChecked) {
        if (!this.selectedWikiSpaceIdList.includes(spaceId)) {
          // 新增勾选空间时去重，避免批量同步入参重复。
          this.selectedWikiSpaceIdList.push(spaceId);
        }
      } else {
        // 取消勾选时从空间批量同步列表移除。
        this.selectedWikiSpaceIdList = this.selectedWikiSpaceIdList.filter(id => id !== spaceId);
      }
    },
    toggleAllWikiSpaceChecked() {
      if (this.isAllWikiSpaceChecked) {
        // 再次点击全选会清空左侧空间批量选择。
        this.selectedWikiSpaceIdList = [];
      } else {
        // 勾选当前加载出的全部 Wiki 空间。
        this.selectedWikiSpaceIdList = [...this.allWikiSpaceIdList];
      }
    },
    openEditDialog() {
      // 打开应用凭证弹框时只传入当前页面缓存，弹框自身会再次调用接口获取最新数据。
      this.currentEditConfig = this.appCredentials ? { ...this.appCredentials } : null;
      this.isEditDialogShow = true;
    },
    closeEditDialog(needRefresh) {
      // 凭证保存后重新加载凭证、空间和节点，避免页面仍展示旧数据。
      this.isEditDialogShow = false;
      this.currentEditConfig = null;
      if (needRefresh) {
        this.getLatestAppCredentials(false).finally(() => {
          this.listWikiSpace();
        });
      }
    },
    updateStatus(row, value) {
      this.$api.knowledge.feishu.updateStatus({ id: row.id, isActive: value ? 1 : 0 }).then(res => {
        if (res.Status === 'OK') {
          row.isActive = value ? 1 : 0;
        }
      });
    },
    execute(row) {
      this.$api.knowledge.feishu.execute({ configId: row.id, direction: 'from_feishu' }).then(res => {
        if (res.Status === 'OK') {
          this.$Message.success('同步已完成');
          this.searchData();
        }
      });
    },
    deleteConfig(row) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deletetargetconfirm', { target: row.name }),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.knowledge.feishu.deleteConfig({ id: row.id }).then(res => {
            if (res.Status === 'OK') {
              vnode.isShow = false;
              this.searchData();
            }
          });
        }
      });
    },
    openAuditDialog(row) {
      this.currentConfig = row;
      this.auditSearchParams = { configId: row.id, currentPage: 1, pageSize: 10 };
      this.isAuditDialogShow = true;
      this.searchAudit();
    },
    searchAudit() {
      this.$api.knowledge.feishu.searchAudit(this.auditSearchParams).then(res => {
        if (res.Status === 'OK') {
          const { tbodyList, rowNum, pageSize, currentPage } = res.Return || {};
          this.auditTableConfig = { tbodyList, rowNum, pageSize, currentPage };
        }
      });
    },
    retry(row) {
      this.$api.knowledge.feishu.retry({ auditId: row.id }).then(res => {
        if (res.Status === 'OK') {
          this.$Message.success('重试已完成');
          this.searchAudit();
          this.searchData();
        }
      });
    },
    changeCurrent(currentPage) {
      this.searchParams.currentPage = currentPage;
      this.searchData();
    },
    changePageSize(pageSize) {
      this.searchParams.currentPage = 1;
      this.searchParams.pageSize = pageSize;
      this.searchData();
    },
    changeAuditCurrent(currentPage) {
      this.auditSearchParams.currentPage = currentPage;
      this.searchAudit();
    },
    changeAuditPageSize(pageSize) {
      this.auditSearchParams.currentPage = 1;
      this.auditSearchParams.pageSize = pageSize;
      this.searchAudit();
    },
    changeModuleGroup(spaceId) {
      if (this.selectedWikiSpaceId === spaceId) {
        // 重复点击当前空间时不重新查询，避免相同参数连续调用节点列表接口。
        return;
      }
      // 切换空间时刷新右侧节点表格，并清空表格节点勾选状态。
      this.selectedWikiSpaceId = spaceId;
      this.selectedNodeTokenList = [];
      this.searchParams.currentPage = 1;
      this.searchData();
    },
    statusText(status) {
      const map = { succeed: '成功', failed: '失败', running: '执行中' };
      return map[status] || '-';
    }
  },
  computed: {
    hasBatchSyncSelection() {
      // 顶部批量同步按钮作为唯一入口，空间或节点任一勾选时都需要显示。
      return this.selectedWikiSpaceIdList.length > 0 || this.selectedNodeTokenList.length > 0;
    },
    allWikiSpaceIdList() {
      // 将可选空间 id 汇总成统一列表，供左侧全选状态判断使用。
      return this.wikiSpaceList.map(wikiSpace => wikiSpace.space_id);
    },
    isAllWikiSpaceChecked() {
      // 所有空间都被勾选时，全选框展示选中态。
      return this.allWikiSpaceIdList.length > 0 && this.selectedWikiSpaceIdList.length === this.allWikiSpaceIdList.length;
    },
    isWikiSpaceIndeterminate() {
      // 仅部分空间被勾选时，全选框展示半选态。
      return this.selectedWikiSpaceIdList.length > 0 && this.selectedWikiSpaceIdList.length < this.allWikiSpaceIdList.length;
    }
  }
};
</script>

<style lang="less" scoped>
.wiki-space-list {
  padding: 8px;
}

.wiki-space-toolbar {
  display: flex;
  align-items: center;
  min-height: 32px;
  margin-bottom: 8px;
}

.table-batch-action {
  margin-left: 12px;
}

.wiki-space-item {
  display: flex;
  align-items: center;
  min-height: 34px;
  padding: 6px 8px;
  margin-bottom: 8px;
  border-radius: 4px;

  &.is-active {
    // 当前空间选中后使用蓝色背景，明确展示右侧表格对应的数据来源。
    background-color: #2d8cf0;
    color: #fff;
  }
}

.wiki-space-checkbox {
  flex: none;
  margin-right: 8px;
}

.wiki-space-name {
  flex: 1;
}

.wiki-node-expand {
  min-height: 48px;
  padding: 8px 16px;
  position: relative;
}
</style>
