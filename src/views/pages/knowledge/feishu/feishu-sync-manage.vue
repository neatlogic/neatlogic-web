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
        <CombineSearcher
          v-model="searchValue"
          v-bind="searchConfig"
          @change="changeSearchValue"
        ></CombineSearcher>
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
            :key="wikiSpace.spaceId"
            class="wiki-space-item text-action"
            :class="{ 'is-active': selectedWikiSpaceId === wikiSpace.spaceId }"
            @click="changeModuleGroup(wikiSpace.spaceId)"
          >
            <Checkbox
              class="wiki-space-checkbox"
              :value="isWikiSpaceChecked(wikiSpace.spaceId)"
              @click.native.stop
              @on-change="toggleWikiSpaceChecked(wikiSpace.spaceId, $event)"
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
          <template v-slot:status="{row}">
            <div>
              <div v-if="row.status == 'running'" style="width: 42px">
                <Progress
                  :percent="99"
                  :stroke-width="10"
                  status="active"
                  :hide-info="true"
                />
              </div>
              <div v-else>{{ row.statusText }}</div>
            </div>
          </template>
          <template v-slot:config="{ row }">
            <Poptip
              v-if="row.config"
              trigger="hover"
              :title="$t('term.cmdbtransfer.exceptioninfo')"
              word-wrap
              width="700"
              :transfer="true"
              placement="left"
            >
              <span class="tsfont-zirenwu" style="cursor:pointer"></span>
              <div
                slot="content"
                class="fz10 scroll"
                style="max-height:500px"
              >
                <div :id="'error_' + row.nodeToken">{{ row.config }}</div>
                <div style="text-align:right">
                  <Button size="small" @click="copyErrorInfo('#error_' + row.nodeToken)">{{ $t('page.copy') }}</Button>
                </div>
              </div>
            </Poptip>
          </template>
          <template v-slot:action="{row}">
            <!-- 文档行操作统一放在 action 列，避免占用异常/信息列。 -->
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li v-if="!isNodeRefreshing(row)" class="tsfont-play" @click="confirmSyncWikiNode(row)">{{ '同步' }}</li>
                <li @click="openFeishuWikiDocument(row)">{{ '查看飞书文档' }}</li>
                <li v-if="row.knowledgeDocumentId && row.knowledgeDocumentVersionId && row.knowledgeDocumentTypeUuid" @click="openKnowledgeSyncResult(row)">{{ '查看同步结果' }}</li>
              </ul>
            </div>
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
              :confirm-sync-wiki-node="confirmSyncWikiNode"
              :open-feishu-wiki-document="openFeishuWikiDocument"
              :open-knowledge-sync-result="openKnowledgeSyncResult"
              :copy-error-info="copyErrorInfo"
              :is-node-refreshing="isNodeRefreshing"
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
    getSelectedNode: { type: Function, required: true },
    confirmSyncWikiNode: { type: Function, required: true },
    openFeishuWikiDocument: { type: Function, required: true },
    openKnowledgeSyncResult: { type: Function, required: true },
    copyErrorInfo: { type: Function, required: true },
    isNodeRefreshing: { type: Function, required: true }
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
    },
    getConfigText(config) {
      // render 函数不能直接渲染对象类型 config，需要转成字符串才能和外层表格展示一致。
      return typeof config === 'string' ? config : JSON.stringify(config, null, 2);
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
          status: ({ row }) => h('div', [
            // 嵌套表状态列复用外层表格展示规则：运行中显示进度条，其余状态只展示 statusText。
            row.status === 'running'
              ? h('div', { style: { width: '42px' } }, [
                h('Progress', { props: { percent: 99, strokeWidth: 10, status: 'active', hideInfo: true } })
              ])
              : h('div', [row.statusText])
          ]),
          config: ({ row }) => row.config ? h('Poptip', {
            props: {
              trigger: 'hover',
              title: this.$t('term.cmdbtransfer.exceptioninfo'),
              wordWrap: true,
              width: '700',
              transfer: true,
              placement: 'left'
            }
          }, [
            // 嵌套表异常列复用外层表格展示规则：表格内只显示图标，详情放到悬浮层中。
            h('span', { class: 'tsfont-zirenwu', style: { cursor: 'pointer' } }),
            h('div', { slot: 'content', class: 'fz10 scroll', style: { maxHeight: '500px' } }, [
              h('div', { attrs: { id: `nested_error_${row.nodeToken}` } }, [this.getConfigText(row.config)]),
              h('div', { style: { textAlign: 'right' } }, [
                h('Button', {
                  props: { size: 'small' },
                  on: { click: () => this.copyErrorInfo(`#nested_error_${row.nodeToken}`) }
                }, [this.$t('page.copy')])
              ])
            ])
          ]) : null,
          action: ({ row }) => h('div', { class: 'tstable-action' }, [
            // 嵌套表格行也使用 action 列展示同步和跳转操作，和最外层表格保持一致。
            h('ul', { class: 'tstable-action-ul' }, [
              !this.isNodeRefreshing(row) ? h('li', { class: 'tsfont-play', on: { click: event => { event.stopPropagation(); this.confirmSyncWikiNode(row); } } }, ['同步']) : null,
              h('li', { on: { click: event => { event.stopPropagation(); this.openFeishuWikiDocument(row); } } }, ['查看飞书文档']),
              h('li', { on: { click: event => { event.stopPropagation(); this.openKnowledgeSyncResult(row); } } }, ['查看同步结果'])
            ])
          ]),
          expand: ({ row }) => h(WikiNodeNestedTable, {
            props: {
              row,
              theadList: this.theadList,
              selectedNodeTokenList: this.selectedNodeTokenList,
              getPathText: this.getPathText,
              toggleNodeExpand: this.toggleNodeExpand,
              getSelectedNode: this.getSelectedNode,
              confirmSyncWikiNode: this.confirmSyncWikiNode,
              openFeishuWikiDocument: this.openFeishuWikiDocument,
              openKnowledgeSyncResult: this.openKnowledgeSyncResult,
              copyErrorInfo: this.copyErrorInfo,
              isNodeRefreshing: this.isNodeRefreshing
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
    CombineSearcher: () => import('@/resources/components/CombineSearcher/CombineSearcher.vue'),
    FeishuSyncEdit: () => import('./feishu-app-credentials-edit.vue'),
    WikiNodeNestedTable
  },
  data() {
    return {
      isLoading: false,
      isEditDialogShow: false,
      isBatchSyncing: false,
      currentEditConfig: null,
      appCredentials: null,
      searchValue: {},
      searchParams: { keyword: '', status: null, currentPage: 1, pageSize: 20 },
      searchConfig: {
        search: true,
        transfer: true,
        width: 620,
        searchList: [
          {
            type: 'select',
            name: 'status',
            label: '状态',
            transfer: true,
            url: '/api/rest/universal/enum/get',
            params: { enumClass: 'neatlogic.framework.knowledge.constvalue.Status' },
            valueName: 'value',
            textName: 'text'
          }
        ]
      },
      nodeTheadList: [
        { key: 'selection', multiple: true },
        { key: 'expander' },
        { title: '标题', key: 'title' },
        { title: '最后一次修改时间', key: 'updateTime', type: 'time' },
        { title: '状态', key: 'status' },
        { title: '异常', key: 'config' },
        { title: '上次同步时间', key: 'lcd', type: 'time' },
        // 行操作按钮统一放在 action 列，config 列保留给接口返回的异常信息。
        { key: 'action' }
      ],
      tableConfig: { tbodyList: [], rowNum: 0, pageSize: 20, currentPage: 1 },
      wikiSpaceLoading: false,
      refreshStatusTimer: null,
      isRefreshingStatus: false,
      selectedWikiSpaceId: null,
      selectedWikiSpaceIdList: [],
      selectedNodeTokenList: [],
      wikiSpaceList: []
    };
  },
  created() {
    this.initPage();
  },
  beforeDestroy() {
    // 离开页面时清理状态轮询定时器，避免后台继续请求节点列表接口。
    this.stopRefreshStatusTimer();
  },
  methods: {
    copyErrorInfo(id) {
      this.$utils.copyText(id);
    },
    changeSearchValue(searchValue) {
      // CombineSearcher 输出的 keyword/status 作为接口入参，搜索条件变化时从第一页重新查询。
      this.searchValue = searchValue || {};
      this.searchParams.keyword = this.searchValue.keyword || '';
      this.searchParams.status = this.searchValue.status || null;
      this.searchParams.currentPage = 1;
      this.searchData();
    },
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
            this.selectedWikiSpaceId = this.wikiSpaceList[0].spaceId;
          }
          if (this.selectedWikiSpaceId && !this.wikiSpaceList.find(wikiSpace => wikiSpace.spaceId === this.selectedWikiSpaceId)) {
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
        this.stopRefreshStatusTimer();
        return;
      }
      this.isLoading = true;
      this.$api.knowledge.feishu.listWikiNode({
        spaceId: this.selectedWikiSpaceId,
        keyword: this.searchParams.keyword,
        status: this.searchParams.status,
        currentPage: this.searchParams.currentPage,
        pageSize: this.searchParams.pageSize
      }).then(res => {
        if (res.Status === 'OK') {
          const { tbodyList = [], rowNum = 0, pageSize = this.searchParams.pageSize, currentPage = this.searchParams.currentPage } = res.Return || {};
          // 主表分页大小以 wiki/node/list 接口返回的 pageSize 为准，避免前端固定页大小导致分页显示不正确。
          const allNodeList = this.decorateNodeList(tbodyList);
          const filteredNodeList = this.filterNodeList(allNodeList);
          // 刷新主表时保留已展开子表，避免轮询期间展开状态被重置。
          this.mergeLoadedNodeState(filteredNodeList, this.tableConfig.tbodyList);
          const filteredNodeTokenList = this.getAllNodeTokenList(filteredNodeList);
          this.selectedNodeTokenList = this.selectedNodeTokenList.filter(nodeToken => filteredNodeTokenList.includes(nodeToken));
          // 同步接口返回的分页状态，保证后续翻页继续使用后端返回的 pageSize。
          this.searchParams.pageSize = pageSize;
          this.searchParams.currentPage = currentPage;
          this.tableConfig = {
            tbodyList: filteredNodeList,
            rowNum,
            pageSize,
            currentPage
          };
        }
      }).finally(() => {
        this.isLoading = false;
        this.updateRefreshStatusTimer();
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
    mergeLoadedNodeState(newNodeList, oldNodeList) {
      const oldNodeMap = new Map((oldNodeList || []).map(node => [node.nodeToken, node]));
      (newNodeList || []).forEach(newNode => {
        const oldNode = oldNodeMap.get(newNode.nodeToken);
        if (oldNode) {
          // 轮询刷新只更新行数据，保留已经展开并加载过的子表数据。
          newNode.children = oldNode.children || [];
          newNode.childrenLoaded = oldNode.childrenLoaded || false;
          newNode.childrenLoading = oldNode.childrenLoading || false;
          newNode._expand = oldNode._expand || false;
        }
      });
    },
    isNodeRefreshing(row) {
      // running、waitting/waiting 都表示同步未结束，需要隐藏同步按钮并参与定时刷新。
      return row && ['running', 'waitting', 'waiting'].includes(row.status);
    },
    hasRefreshingNode(nodeList) {
      // 递归检查主表和已加载嵌套表中是否存在需要轮询刷新的节点。
      return (nodeList || []).some(node => this.isNodeRefreshing(node) || this.hasRefreshingNode(node.children || []));
    },
    updateRefreshStatusTimer() {
      if (this.hasRefreshingNode(this.tableConfig.tbodyList)) {
        this.startRefreshStatusTimer();
      } else {
        this.stopRefreshStatusTimer();
      }
    },
    startRefreshStatusTimer() {
      if (this.refreshStatusTimer) {
        return;
      }
      // 存在 running/waitting 行时每 3 秒刷新一次当前表格数据。
      this.refreshStatusTimer = setInterval(() => {
        this.refreshStatusNodeData();
      }, 3000);
    },
    stopRefreshStatusTimer() {
      if (this.refreshStatusTimer) {
        // 清理轮询定时器，避免状态结束后继续重复请求。
        clearInterval(this.refreshStatusTimer);
        this.refreshStatusTimer = null;
      }
    },
    refreshStatusNodeData() {
      if (this.isRefreshingStatus || !this.selectedWikiSpaceId) {
        return;
      }
      this.isRefreshingStatus = true;
      this.$api.knowledge.feishu.listWikiNode({
        spaceId: this.selectedWikiSpaceId,
        keyword: this.searchParams.keyword,
        status: this.searchParams.status,
        currentPage: this.searchParams.currentPage,
        pageSize: this.searchParams.pageSize
      }).then(res => {
        if (res.Status === 'OK') {
          const { tbodyList = [], rowNum = 0, pageSize = this.searchParams.pageSize, currentPage = this.searchParams.currentPage } = res.Return || {};
          // 定时刷新时更新当前页行数据，并保留已有的展开子表状态。
          const allNodeList = this.decorateNodeList(tbodyList);
          const filteredNodeList = this.filterNodeList(allNodeList);
          this.mergeLoadedNodeState(filteredNodeList, this.tableConfig.tbodyList);
          this.searchParams.pageSize = pageSize;
          this.searchParams.currentPage = currentPage;
          this.tableConfig = {
            tbodyList: filteredNodeList,
            rowNum,
            pageSize,
            currentPage
          };
          this.refreshLoadedChildNodeList(this.tableConfig.tbodyList);
        }
      }).finally(() => {
        this.isRefreshingStatus = false;
        this.updateRefreshStatusTimer();
      });
    },
    refreshLoadedChildNodeList(nodeList) {
      (nodeList || []).forEach(node => {
        if (node.childrenLoaded && node.children && node.children.length > 0) {
          // 已展开的子表也需要刷新，确保嵌套表 running/waitting 行状态能自动更新。
          this.$api.knowledge.feishu.listWikiNode({
            spaceId: this.selectedWikiSpaceId,
            parentNodeToken: node.nodeToken
          }).then(res => {
            if (res.Status === 'OK') {
              const childList = this.decorateChildNodeList((res.Return && res.Return.tbodyList) || []);
              this.mergeLoadedNodeState(childList, node.children);
              this.$set(node, 'children', childList);
            }
          }).finally(() => {
            this.updateRefreshStatusTimer();
          });
        }
        this.refreshLoadedChildNodeList(node.children || []);
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
      // 关键字和状态筛选已经通过 wiki/node/list 接口入参处理，这里只保留方法以兼容既有调用链。
      return nodeList;
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
        this.updateRefreshStatusTimer();
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
      this.$createDialog({
        title: '确认同步',
        content: '同步将会为文档创建一个新版本',
        'on-ok': vnode => {
          this.isBatchSyncing = true;
          this.$api.knowledge.feishu.syncWikiDocument(params).then(res => {
            if (res.Status === 'OK') {
              vnode.isShow = false;
              this.$Message.success('批量同步已提交');
              // 空间和节点批量同步共用一个入口，提交成功后刷新当前节点表格状态。
              this.searchData();
            }
          }).finally(() => {
            this.isBatchSyncing = false;
          });
        }
      });
    },
    confirmSyncWikiNode(row) {
      if (!row || !row.nodeToken || this.isBatchSyncing || this.isNodeRefreshing(row)) {
        // running/waitting 行正在处理中，隐藏按钮之外也在方法入口阻止重复同步。
        return;
      }
      this.$createDialog({
        title: '确认同步',
        content: '同步将会为文档创建一个新版本',
        'on-ok': vnode => {
          this.isBatchSyncing = true;
          // 单行同步只提交当前行 nodeToken，接口入参仍沿用 nodeTokenList 数组结构。
          this.$api.knowledge.feishu.syncWikiDocument({ nodeTokenList: [row.nodeToken] }).then(res => {
            if (res.Status === 'OK') {
              vnode.isShow = false;
              this.$Message.success('同步已提交');
              this.searchData();
            }
          }).finally(() => {
            this.isBatchSyncing = false;
          });
        }
      });
    },
    openFeishuWikiDocument(row) {
      if (!row || !row.nodeToken) {
        return;
      }
      // 飞书 Wiki 文档地址由节点 token 拼接，点击后在新标签页打开原文档。
      window.open(`https://lqnnbz38z5y.feishu.cn/wiki/${row.nodeToken}`, '_blank');
    },
    openKnowledgeSyncResult(row) {
      if (!row || !row.knowledgeDocumentId || !row.knowledgeDocumentTypeUuid || !row.knowledgeDocumentVersionId) {
        this.$Message.warning('暂无同步结果');
        return;
      }
      // 同步结果地址使用接口返回的知识文档 ID、类型 UUID 和版本 ID 拼接。
      const url = `http://localhost:8081/develop/knowledge.html#/knowledge-detail?knowledgeDocumentId=${row.knowledgeDocumentId}&knowledgeDocumentTypeUuid=${row.knowledgeDocumentTypeUuid}&knowledgeDocumentVersionId=${row.knowledgeDocumentVersionId}&status=passed`;
      window.open(url, '_blank');
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
    changeCurrent(currentPage) {
      this.searchParams.currentPage = currentPage;
      this.searchData();
    },
    changePageSize(pageSize) {
      this.searchParams.currentPage = 1;
      this.searchParams.pageSize = pageSize;
      this.searchData();
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
    }
  },
  computed: {
    hasBatchSyncSelection() {
      // 顶部批量同步按钮作为唯一入口，空间或节点任一勾选时都需要显示。
      return this.selectedWikiSpaceIdList.length > 0 || this.selectedNodeTokenList.length > 0;
    },
    allWikiSpaceIdList() {
      // 将可选空间 id 汇总成统一列表，供左侧全选状态判断使用。
      return this.wikiSpaceList.map(wikiSpace => wikiSpace.spaceId);
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

.node-action-list {
  // 操作列宽度较窄，三个按钮纵向排列可以避免文字互相挤压。
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
