<template>
  <div>
    <TsContain>
      <div slot="topLeft">
        <div class="action-group">
          <div class="action-item tsfont-plus" @click="addSql">{{ $t('page.setting') }}</div>
          <div class="action-item">
            <TsFormRadio
              v-model="saveMode"
              :dataList="saveModeList"
              radioType="button"
              :disabled="isSavingMode || !confirmedSaveMode"
              :isChangeWrite="false"
              class="block-item"
              @on-change="updateSaveMode"
            ></TsFormRadio>
            <Tooltip :content="$t('term.framework.sqlauditsavemodehint')" :max-width="400" transfer>
              <span class="tsfont-info-o text-tip ml-xs"></span>
            </Tooltip>
          </div>
          <div class="action-item">
            <TsFormSwitch
              v-model="isAutoRefresh"
              :true-value="true"
              :false-value="false"
              :showStatus="true"
              :border="'border'"
              :trueText="$t('page.autorefresh')"
              :falseText="$t('page.manualrefresh')"
              class="discontents"
            ></TsFormSwitch>
          </div>
          <div class="action-item">
            <span class="tsfont-attribute" @click="openStatusDialog()">{{ $t('page.databasestatus') }}</span>
          </div>
          <div v-if="sqlIdList && sqlIdList.length > 0" class="action-item">
            <Poptip
              trigger="hover"
              :title="$t('term.framework.sqlidmonitorlist')"
              word-wrap
              width="500"
              :transfer="true"
              placement="bottom"
            >
              <span class="tsfont-zirenwu">SQL {{ sqlIdList.length }}</span>
              <div slot="content" class="api">
                <Tag
                  v-for="(sql, index) in sqlIdList"
                  :key="'sql_' + index"
                  :closable="true"
                  @on-close="removeMonitor('id', sql)"
                >{{ sql }}</Tag>
              </div>
            </Poptip>
          </div>
          <div v-if="urlList && urlList.length > 0" class="action-item">
            <Poptip
              trigger="hover"
              :title="$t('term.framework.urlmonitorlist')"
              word-wrap
              width="500"
              :transfer="true"
              placement="bottom"
            >
              <span class="tsfont-zirenwu">URL {{ urlList.length }}</span>
              <div slot="content" class="api">
                <Tag
                  v-for="(url, index) in urlList"
                  :key="'url_' + index"
                  :closable="true"
                  @on-close="removeMonitor('url', url)"
                >{{ url }}</Tag>
              </div>
            </Poptip>
          </div>
        </div>
      </div>
      <div slot="topRight">
        <TsRow>
          <Col :span="6"></Col>
          <Col :span="18">
            <CombineSearcher
              v-model="searchValue"
              v-bind="searchConfig"
              @change="searchSql()"
            ></CombineSearcher>
          </Col>
        </TsRow>
      </div>
      <div slot="content" class="content">
        <div>
          <div class="dbinfo padding">
            <div>
              <span>{{ $t('page.database') }}：{{ datasourceData.database + '(' + datasourceData.databaseVersion + ')' }}</span>
            </div>
            <div>
              <span>{{ $t('term.framework.datapool') }}：{{ datasourceData.poolName }}</span>
            </div>
            <div>
              <span>{{ $t('term.framework.totalconnections') }}：</span>
              <Badge
                v-if="datasourceData.totalConnections"
                :count="datasourceData.totalConnections"
                overflow-count="9999"
                type="primary"
              ></Badge>
              <span v-else>-</span>
            </div>
            <div>
              <span>{{ $t('term.framework.activeconnections') }}：</span>
              <Badge
                v-if="datasourceData.activeConnections"
                :count="datasourceData.activeConnections"
                type="primary"
                overflow-count="9999"
              ></Badge>
              <span v-else>-</span>
            </div>
            <div>
              <span>{{ $t('term.framework.awaitingconnections') }}：</span>
              <Badge
                v-if="datasourceData.threadsAwaitingConnection"
                :count="datasourceData.threadsAwaitingConnection"
                type="primary"
                overflow-count="9999"
              ></Badge>
              <span v-else>-</span>
            </div>
            <div>
              <span>{{ $t('term.framework.freeconnections') }}：</span>
              <Badge
                v-if="datasourceData.idleConnections"
                :count="datasourceData.idleConnections"
                type="primary"
                overflow-count="9999"
              ></Badge>
              <span v-else>-</span>
            </div>
          </div>
          <Tabs v-model="activeTab" :animated="false" @on-click="changeTab">
            <TabPane :label="$t('term.framework.sqlidmonitor')" name="sql">
              <TsTable
                v-if="sqlAuditData"
                v-bind="sqlAuditData"
                :sortList="['timeCost', 'runTime']"
                :sortOrder="sqlSortOrder"
                :sortMulti="false"
                @updateSort="updateSort"
                @changeCurrent="searchSql"
              >
                <template v-slot:id="{ row }">
                  <Tooltip :content="row.id" max-width="200">
                    {{ row.id.substring(row.id.lastIndexOf('.') + 1) }}
                  </Tooltip>
                </template>
                <template v-slot:timeCost="{ row }">
                  <div>
                    <Progress :status="row.timeCost < 1000 ? 'normal' : 'wrong'" :percent="getPercent(row.timeCost, maxTimeCost)" :stroke-width="10">
                      <span>{{ row.timeCost }}{{ $t('page.ms') }}</span>
                    </Progress>
                  </div>
                </template>
                <template v-slot:databaseName="{ row }">
                  <span>{{ row.databaseName || '—' }}</span>
                </template>
                <template v-slot:sql="{ row, index }">
                  <Poptip
                    v-if="row.sql"
                    trigger="hover"
                    :title="$t('term.framework.sqlsstatement')"
                    word-wrap
                    width="700"
                    :transfer="true"
                    placement="left"
                    @on-popper-show="pauseAutoRefreshBySqlPoptip"
                    @on-popper-hide="resumeAutoRefreshAfterSqlPoptipHide"
                  >
                    <span class="tsfont-zirenwu" style="cursor:pointer"></span>
                    <div
                      slot="content"
                      class="fz10 scroll"
                      style="max-height:500px"
                    >
                      <div :id="'sql_' + row.id.replace(/\./ig,'_') + '_' + index">{{ row.sql }}</div>
                      <div class="action-group" style="text-align:right">
                        <div class="action-item">
                          <!-- 传递完整执行记录，确保计划使用本次SQL执行的数据源。 -->
                          <Button
                            size="small"
                            :disabled="!!row.databaseName && !row.datasourceKey"
                            :title="row.databaseName && !row.datasourceKey ? $t('term.framework.sqlplandatasourceunknown') : ''"
                            @click="openSqlExplain(row)"
                          >{{ $t('term.framework.viewexecutionplan') }}</Button>
                        </div>
                        <div class="action-item">
                          <Button size="small" @click="copySql('#sql_' + row.id.replace(/\./ig,'_') + '_' + index)">{{ $t('page.copy') }}</Button>
                        </div>
                      </div>
                    </div>
                  </Poptip>
                </template>
              </TsTable>
            </TabPane>
            <TabPane :label="$t('term.framework.urlmonitor')" name="url">
              <TsTable
                v-if="requestSqlAuditData"
                v-bind="requestSqlAuditData"
                :sortList="['totalTimeCost', 'runTime']"
                :sortOrder="requestSortOrder"
                :sortMulti="false"
                :canExpand="true"
                @updateSort="updateSort"
                @toggleExpand="toggleRequestExpand"
                @changeCurrent="searchRequestSql"
              >
                <template v-slot:totalTimeCost="{ row }">
                  <div>
                    <Progress :status="row.totalTimeCost < 1000 ? 'normal' : 'wrong'" :percent="getPercent(row.totalTimeCost, maxRequestTimeCost)" :stroke-width="10">
                      <span>{{ row.totalTimeCost }}{{ $t('page.ms') }}</span>
                    </Progress>
                  </div>
                </template>
                <template v-slot:expand="{ row }">
                  <!-- URL监控每一行通过展开区域嵌套展示sameIdSqlAuditList明细表格 -->
                  <div class="request-sql-expand">
                    <TsTable
                      v-bind="getRequestSqlDetailData(row)"
                      :showPager="false"
                      :canResize="false"
                    >
                      <template v-slot:id="{ row: sqlRow }">
                        <!-- URL嵌套表格id提示框使用transfer，避免被展开表格容器裁剪导致完整id显示不全 -->
                        <Tooltip :content="sqlRow.id" max-width="500" transfer>
                          {{ sqlRow.id.substring(sqlRow.id.lastIndexOf('.') + 1) }}
                        </Tooltip>
                      </template>
                      <template v-slot:totalTimeCost="{ row: sqlRow }">
                        <span>{{ sqlRow.totalTimeCost }}{{ $t('page.ms') }}</span>
                      </template>
                      <template v-slot:sqlList="{ row: sqlRow }">
                        <!-- SQL语句列改为读取sqlAuditList，逐条展示SQL执行耗时和缓存级别 -->
                        <Poptip
                          v-if="getSqlAuditList(sqlRow).length > 0"
                          trigger="hover"
                          :title="$t('term.framework.sqlsstatement')"
                          word-wrap
                          width="800"
                          :transfer="true"
                          placement="left"
                        >
                          <span class="tsfont-zirenwu" style="cursor:pointer">{{ getSqlAuditList(sqlRow).length }}</span>
                          <div
                            slot="content"
                            class="fz10 scroll"
                            style="max-height:500px"
                          >
                            <div
                              v-for="(sqlAudit, itemIndex) in getSqlAuditList(sqlRow)"
                              :key="itemIndex"
                              class="request-sql-content"
                            >
                              <div class="request-sql-meta text-grey">
                                <span>{{ $t('page.timecost') }}：{{ sqlAudit.timeCost }}{{ $t('page.ms') }}</span>
                                <span class="ml-sm">{{ $t('page.cache') }}：{{ getSqlAuditCacheLevel(sqlAudit) }}</span>
                                <span class="ml-sm">{{ $t('page.database') }}：{{ sqlAudit.databaseName || '—' }}</span>
                                <span class="ml-sm">{{ $t('page.datacapacity') }}：{{ sqlAudit.recordCount }}</span>
                                <span class="ml-sm">{{ $t('term.autoexec.executiontime') }}：{{ sqlAudit.runTime | formatDate }}</span>
                              </div>
                              <div :id="getRequestSqlDomId(row, sqlRow, itemIndex)">{{ sqlAudit.sql }}</div>
                              <div class="action-group" style="text-align:right">
                                <div class="action-item">
                                  <!-- 请求内同一SQL可能跨库执行，使用每条执行记录的数据源。 -->
                                  <Button
                                    size="small"
                                    :disabled="!!sqlAudit.databaseName && !sqlAudit.datasourceKey"
                                    :title="sqlAudit.databaseName && !sqlAudit.datasourceKey ? $t('term.framework.sqlplandatasourceunknown') : ''"
                                    @click="openSqlExplain(sqlAudit)"
                                  >{{ $t('term.framework.viewexecutionplan') }}</Button>
                                </div>
                                <div class="action-item">
                                  <Button size="small" @click="copySql('#' + getRequestSqlDomId(row, sqlRow, itemIndex))">{{ $t('page.copy') }}</Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Poptip>
                      </template>
                    </TsTable>
                  </div>
                </template>
              </TsTable>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </TsContain>
    <SqlDumpEdit v-if="isDialogShow" @close="closeDialog"></SqlDumpEdit>
    <StatusDialog v-if="isStatusDialogShow" @close="isStatusDialogShow = false"></StatusDialog>
    <TsDialog
      v-bind="sqlExplainDialogConfig"
      @on-close="closeSqlExplainDialog"
    >
      <template v-slot:header>
        <div>
          <span>{{ $t('term.framework.sqlexecutionplan') }}</span>
          <Tag class="ml-sm">{{ $t('term.framework.sqlplanestimated') }}</Tag>
        </div>
      </template>
      <template v-slot>
        <SqlExplain
          v-if="sqlExplainDialogConfig.isShow"
          :sql="sqlExplainSql"
          :explainData="sqlExplainData"
          :database="datasourceData.database"
        ></SqlExplain>
      </template>
      <template v-slot:footer>
        <div class="flex-between">
          <span class="text-tip fz10">{{ $t('term.framework.sqlplanestimatenote') }}</span>
          <Button @click="closeSqlExplainDialog">{{ $t('page.close') }}</Button>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    SqlDumpEdit: () => import('./sqldump-edit.vue'),
    CombineSearcher: () => import('@/resources/components/CombineSearcher/CombineSearcher.vue'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    StatusDialog: () => import('./status-dialog.vue'),
    SqlExplain: () => import('./sql-explain.vue')
  },
  props: {},
  data() {
    // 排序按框架模块和当前路由保存；无有效记录时由首次查询使用服务端保存模式默认排序。
    let sortOrder = null;
    try {
      sortOrder = this.$localStore.get('sortOrder');
    } catch (error) {
      // 损坏的本地JSON不影响页面加载，按无缓存处理。
      sortOrder = null;
    }
    const isValidSort = sortOrder && ((['runtime', 'timecost'].includes(sortOrder.orderBy) && ['ASC', 'DESC'].includes(sortOrder.orderType)) || (sortOrder.orderBy === '' && sortOrder.orderType === ''));
    return {
      isAutoRefresh: true,
      datasourceData: {},
      timer: null,
      timerDatasource: null,
      isAutoRefreshPausedByExpand: false,
      isAutoRefreshPausedBySqlPoptip: false,
      sqlIdList: [],
      urlList: [],
      activeTab: 'sql',
      isInitDefaultTab: false,
      isDialogShow: false,
      isStatusDialogShow: false,
      searchParam: { orderBy: isValidSort ? sortOrder.orderBy : null, orderType: isValidSort ? sortOrder.orderType : null },
      saveMode: 'recent',
      confirmedSaveMode: null,
      isSavingMode: false,
      sqlSearchSequence: 0,
      saveModeList: [
        { value: 'recent', text: this.$t('term.framework.sqlauditrecentmode') },
        { value: 'slowest', text: this.$t('term.framework.sqlauditslowestmode') }
      ],
      searchValue: {},
      // SQL监控组合搜索器统一输出keyword、tenant、userId，避免SQL ID和URL两个Tab使用不同入参
      searchConfig: {
        search: true,
        searchMode: 'clickBtnSearch',
        placeholder: this.$t('form.placeholder.pleaseinput', { target: this.$t('page.keyword') }),
        searchList: [
          { type: 'text', name: 'tenant', label: this.$t('page.tenant') },
          { type: 'text', name: 'userId', label: this.$t('page.user') }
        ]
      },
      sqlAuditData: {},
      requestSqlAuditData: {},
      // SQL执行计划弹框配置，点击SQL语句里的查看执行计划按钮后展示
      sqlExplainDialogConfig: {
        type: 'modal',
        maskClose: true,
        isShow: false,
        width: 'large',
        fullscreen: true,
        title: this.$t('term.framework.sqlexecutionplan')
      },
      sqlExplainSql: '',
      sqlExplainData: {},
      theadList: [
        { key: 'timeCost', title: this.$t('page.timecost'), width: 200 },
        { key: 'runTime', title: this.$t('term.autoexec.executiontime'), type: 'time' },
        { key: 'id', title: 'id' },
        { key: 'threadName', title: this.$t('page.thread') },
        { key: 'tenant', title: this.$t('page.tenant') },
        { key: 'databaseName', title: this.$t('page.database') },
        { key: 'userId', title: this.$t('page.user') },
        { key: 'recordCount', title: this.$t('page.datacapacity') },
        { key: 'useCacheLevel', title: this.$t('page.cache') },
        { key: 'sql', title: this.$t('term.framework.sqlsstatement') }
      ],
      // URL监控主表增加展开列，用于在每个请求行下方展示sameIdSqlAuditList嵌套表格
      requestTheadList: [
        { key: 'expander', width: 40 },
        { key: 'totalTimeCost', title: this.$t('page.timecost'), width: 200 },
        { key: 'runTime', title: this.$t('term.autoexec.executiontime'), type: 'time' },
        { key: 'notUseCacheTotalTimeCost', title: this.$t('term.framework.notusecachetimecostms'), width: 160 },
        { key: 'url', title: 'url' },
        { key: 'threadName', title: this.$t('page.thread') },
        { key: 'tenant', title: this.$t('page.tenant') },
        { key: 'userId', title: this.$t('page.user') },
        { key: 'sqlCount', title: this.$t('term.framework.sqlcount') }
      ],
      // URL监控嵌套表格表头，用于展示每个请求内按sqlId聚合后的SQL明细
      requestSqlDetailTheadList: [
        { key: 'totalTimeCost', title: this.$t('page.timecost'), width: 120 },
        { key: 'notUseCacheTotalTimeCost', title: this.$t('term.framework.notusecachetimecostms'), width: 160 },
        { key: 'id', title: 'id' },
        { key: 'notUseCacheCount', title: this.$t('term.framework.notusecachecount'), width: 140 },
        { key: 'sqlList', title: this.$t('term.framework.sqlsstatement'), width: 120 }
      ],
      fromPath: '',
      leftHeight: 0,
      maxTimeCost: 0,
      maxRequestTimeCost: 0
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchSql();
    this.getDataSourceInfo();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    // 页面离开后丢弃未完成的SQL查询，防止响应重新启动刷新定时器。
    this.sqlSearchSequence += 1;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  },
  destroyed() {},
  methods: {
    copySql(id) {
      this.$utils.copyText(id);
    },
    openStatusDialog() {
      this.isStatusDialogShow = true;
    },
    openSqlExplain(sqlAudit) {
      // 按单次执行记录请求计划；未采集库信息的旧记录或字符串入口兼容当前请求数据源。
      const record = typeof sqlAudit === 'string' ? { sql: sqlAudit } : (sqlAudit || {});
      // 已确认执行库但未能匹配注册数据源时，禁止回退到当前库执行计划。
      if (record.databaseName && !record.datasourceKey) {
        return;
      }
      const params = { sql: record.sql, includePlanJson: 1 };
      if (record.datasourceKey) {
        params.datasourceKey = record.datasourceKey;
      }
      this.$api.framework.healthcheck.getSqlExplain(params).then(res => {
        const result = res.Return || {};
        this.sqlExplainSql = result.sql || '';
        this.sqlExplainData = {
          theadList: result.theadList || [],
          tbodyList: result.tbodyList || [],
          planJson: result.planJson || null,
          databaseName: result.databaseName || ''
        };
        this.sqlExplainDialogConfig.isShow = true;
      });
    },
    closeSqlExplainDialog() {
      // 关闭执行计划弹框时清理展示数据，避免下一次打开时短暂看到旧SQL结果
      this.sqlExplainDialogConfig.isShow = false;
      this.sqlExplainSql = '';
      this.sqlExplainData = {};
    },
    setDefaultActiveTab() {
      // 页面首次进入时根据两张表是否有数据选择默认Tab，后续刷新不再覆盖用户手动选择
      if (this.isInitDefaultTab) {
        return;
      }
      const hasSqlAudit = !!(this.sqlAuditData && this.sqlAuditData.tbodyList && this.sqlAuditData.tbodyList.length > 0);
      const hasRequestSqlAudit = !!(this.requestSqlAuditData && this.requestSqlAuditData.tbodyList && this.requestSqlAuditData.tbodyList.length > 0);
      this.activeTab = !hasSqlAudit && hasRequestSqlAudit ? 'url' : 'sql';
      this.isInitDefaultTab = true;
    },
    getPercent(value, maxValue) {
      // 进度条最大值可能为0，统一兜底避免NaN影响表格渲染
      if (!maxValue) {
        return 0;
      }
      return (value / maxValue) * 100;
    },
    setRequestSqlAuditExpandStatus(tbodyList) {
      // URL监控主表保留sameIdSqlAuditList嵌套表格入口，有明细的请求行默认不展开
      (tbodyList || []).forEach(row => {
        const hasDetail = !!(row.sameIdSqlAuditList && row.sameIdSqlAuditList.length > 0);
        this.$set(row, '#expander', hasDetail);
        this.$set(row, '_expand', false);
      });
      return tbodyList || [];
    },
    toggleRequestExpand(row, isExpand) {
      // URL监控展开按钮只维护当前请求行的_expand状态，兼容表头全展开传入的布尔值
      this.$set(row, '_expand', typeof isExpand === 'boolean' ? isExpand : !row._expand);
      if (row._expand) {
        this.pauseAutoRefreshByRequestExpand();
      } else {
        this.resumeAutoRefreshAfterRequestCollapse();
      }
    },
    hasExpandedRequestSqlRow() {
      // 判断URL监控表格中是否仍有展开的嵌套表格，用于决定是否恢复自动刷新
      return !!(this.requestSqlAuditData && this.requestSqlAuditData.tbodyList && this.requestSqlAuditData.tbodyList.some(row => row._expand));
    },
    pauseAutoRefreshByRequestExpand() {
      // 展开URL嵌套表格时仅暂停原本开启的自动刷新，记录暂停来源避免误恢复用户手动关闭的刷新
      if (this.isAutoRefresh) {
        this.isAutoRefreshPausedByExpand = true;
        this.isAutoRefresh = false;
      }
    },
    resumeAutoRefreshAfterRequestCollapse() {
      // 所有URL嵌套表格关闭后，只恢复由展开动作临时暂停的自动刷新
      if (!this.hasExpandedRequestSqlRow() && this.isAutoRefreshPausedByExpand) {
        this.isAutoRefreshPausedByExpand = false;
        this.isAutoRefresh = true;
      }
    },
    pauseAutoRefreshBySqlPoptip() {
      // 查看SQL ID表格的SQL语句时，仅暂停原本开启的自动刷新，避免弹窗被刷新数据冲掉
      if (this.isAutoRefresh) {
        this.isAutoRefreshPausedBySqlPoptip = true;
        this.isAutoRefresh = false;
      }
    },
    resumeAutoRefreshAfterSqlPoptipHide() {
      // SQL语句弹窗关闭后，只恢复由弹窗查看动作临时暂停的自动刷新
      if (this.isAutoRefreshPausedBySqlPoptip) {
        this.isAutoRefreshPausedBySqlPoptip = false;
        this.isAutoRefresh = true;
      }
    },
    getRequestSqlDetailData(row) {
      // 将后端返回的sameIdSqlAuditList转换成嵌套TsTable需要的数据结构
      const tbodyList = row.sameIdSqlAuditList || [];
      return {
        theadList: this.requestSqlDetailTheadList,
        tbodyList: tbodyList,
        rowNum: tbodyList.length,
        currentPage: 1,
        pageSize: 0
      };
    },
    getRequestSqlDomId(requestRow, sqlRow, itemIndex) {
      // 复制SQL需要稳定的DOM id，替换url和sqlId中的特殊字符以避免选择器失效
      return ('request_sql_' + requestRow.runTime + '_' + sqlRow.id + '_' + itemIndex).replace(/[^A-Za-z0-9_-]/g, '_');
    },
    getSqlAuditList(sqlRow) {
      // SQL语句列按新的sqlAuditList取数，确保每条SQL能同时拿到耗时和缓存级别
      return sqlRow.sqlAuditList || [];
    },
    getSqlAuditCacheLevel(sqlAudit) {
      // 单条SQL未命中缓存时后端返回空字符串，前端统一显示为未使用缓存
      return sqlAudit.useCacheLevel || this.$t('term.framework.notusecache');
    },
    getDataSourceInfo() {
      if (this.timerDatasource) {
        clearTimeout(this.timerDatasource);
        this.timerDatasource = null;
      }
      this.$api.framework.healthcheck.getDataSourceInfo().then(res => {
        this.datasourceData = res.Return;
        this.timerDatasource = setTimeout(() => {
          this.getDataSourceInfo();
        }, 5000);
      });
    },
    removeMonitor(type, value) {
      // 顶部两个监控列表共用删除逻辑，根据类型传递id或url
      const param = { action: 'remove' };
      if (type === 'url') {
        param.url = value;
      } else {
        param.id = value;
      }
      this.$api.framework.healthcheck.toggleSqlInterceptor(param).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.searchSql();
        }
      });
    },
    closeDialog() {
      this.isDialogShow = false;
      this.searchSql();
    },
    addSql() {
      this.isDialogShow = true;
    },
    changeTab() {
      // 关键字、租户和用户是两张表共用的过滤条件，切换Tab时保留当前组合搜索条件
      this.searchSql();
    },
    searchRequestSql(currentPage) {
      this.searchSql(null, currentPage);
    },
    saveSortOrder() {
      // 只保存两张主表共用的排序字段和方向，取消排序的空值也保留，不保存分页及筛选条件。
      this.$localStore.set('sortOrder', { orderBy: this.searchParam.orderBy, orderType: this.searchParam.orderType });
    },
    updateSort(sort) {
      // 两张主表共用排序条件，耗时列映射到相同查询字段；取消排序交给后端使用保存模式默认值。
      if (this.isSavingMode || !this.confirmedSaveMode) {
        return;
      }
      const selected = Object.keys(sort).find(key => ['timeCost', 'totalTimeCost', 'runTime'].includes(key) && ['ASC', 'DESC'].includes(sort[key]));
      this.searchParam.orderBy = selected ? (selected === 'runTime' ? 'runtime' : 'timecost') : '';
      this.searchParam.orderType = selected ? sort[selected] : '';
      this.saveSortOrder();
      return this.searchSql();
    },
    async updateSaveMode(value) {
      // 保存模式以服务端确认为准；切换期间暂停查询，避免旧响应覆盖新的模式和记录。
      if (!this.confirmedSaveMode || this.isSavingMode || value === this.confirmedSaveMode) {
        return;
      }
      this.isSavingMode = true;
      const sequence = ++this.sqlSearchSequence;
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      try {
        const res = await this.$api.framework.healthcheck.updateSqlAuditMode({ saveMode: value });
        // 切换请求返回前页面可能已经销毁，此时不再更新页面或恢复自动刷新。
        if (sequence !== this.sqlSearchSequence) {
          return;
        }
        this.confirmedSaveMode = res.Return.saveMode;
        this.saveMode = this.confirmedSaveMode;
        this.searchParam.orderBy = this.saveMode === 'slowest' ? 'timecost' : 'runtime';
        this.searchParam.orderType = 'DESC';
        this.saveSortOrder();
        this.searchParam.currentPage = 1;
        this.searchParam.requestCurrentPage = 1;
        this.$Message.success(this.$t('message.executesuccess'));
      } catch (error) {
        if (sequence !== this.sqlSearchSequence) {
          return;
        }
        // 接口错误由公共HTTP封装提示；失败时还原选项，保留原排序和分页。
        this.saveMode = this.confirmedSaveMode;
      } finally {
        if (sequence === this.sqlSearchSequence) {
          this.isSavingMode = false;
        }
      }
      return this.searchSql(this.searchParam.currentPage, this.searchParam.requestCurrentPage);
    },
    getSqlSearchParam() {
      // /healthcheck/sqldump接口统一接收keyword、tenant、userId，这里合并排序分页和组合搜索条件
      const params = Object.assign({}, this.searchParam, this.searchValue);
      // 已恢复的本地排序用于首次查询；无缓存或取消排序时交给后端按保存模式选择默认排序。
      if (!params.orderBy) {
        delete params.orderBy;
        delete params.orderType;
      }
      return params;
    },
    searchSql(currentPage, requestCurrentPage) {
      if (this.isSavingMode) {
        return;
      }
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      // SQL ID和URL监控分别维护当前页；组合搜索条件变化时两个表格都回到第一页
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      } else if (!requestCurrentPage) {
        this.searchParam.currentPage = 1;
      }
      if (requestCurrentPage) {
        this.searchParam.requestCurrentPage = requestCurrentPage;
      } else if (!currentPage) {
        this.searchParam.requestCurrentPage = 1;
      }
      const sequence = ++this.sqlSearchSequence;
      return this.$api.framework.healthcheck.searchSqlAudit(this.getSqlSearchParam()).then(res => {
        if (sequence !== this.sqlSearchSequence) {
          return;
        }
        const saveMode = res.Return.saveMode;
        if (saveMode !== this.confirmedSaveMode) {
          const wasInitialized = !!this.confirmedSaveMode;
          this.confirmedSaveMode = saveMode;
          this.saveMode = saveMode;
          // 首次进入优先恢复用户排序；已加载后的外部模式变化才重置为新模式默认值。
          if (wasInitialized || this.searchParam.orderBy === null) {
            this.searchParam.orderBy = saveMode === 'slowest' ? 'timecost' : 'runtime';
            this.searchParam.orderType = 'DESC';
            this.saveSortOrder();
          }
          // 其他管理员切换模式后按新默认排序重新取第一页，避免选项和已查询数据不一致。
          if (wasInitialized) {
            return this.searchSql();
          }
        }
        this.sqlAuditData = res.Return.sqlAuditData || {};
        this.sqlAuditData.theadList = this.theadList;
        this.requestSqlAuditData = res.Return.requestSqlAuditData || {};
        this.requestSqlAuditData.theadList = this.requestTheadList;
        // URL监控查询完成后补充展开状态，确保sameIdSqlAuditList按嵌套表格显示
        this.requestSqlAuditData.tbodyList = this.setRequestSqlAuditExpandStatus(this.requestSqlAuditData.tbodyList);
        // 首次加载完成两张表数据后再判断默认Tab，兼容SQL ID和URL监控任一表有数据的场景
        this.setDefaultActiveTab();
        this.maxTimeCost = res.Return.maxTimeCost;
        this.maxRequestTimeCost = res.Return.maxRequestTimeCost;
        this.sqlIdList = res.Return.sqlIdList;
        this.urlList = res.Return.urlList;
        if (this.isAutoRefresh) {
          this.timer = setTimeout(() => {
            this.searchSql(currentPage, requestCurrentPage);
          }, 5000);
        }
      });
    }
  },
  filter: {},
  computed: {
    sqlSortOrder() {
      // TsTable会合并排序配置，两个可排序字段均返回以清除上一次字段的箭头。
      return [{ timeCost: this.searchParam.orderBy === 'timecost' ? this.searchParam.orderType : '', runTime: this.searchParam.orderBy === 'runtime' ? this.searchParam.orderType : '' }];
    },
    requestSortOrder() {
      // URL表耗时使用累计SQL耗时，箭头状态仍由同一查询条件派生。
      return [{ totalTimeCost: this.searchParam.orderBy === 'timecost' ? this.searchParam.orderType : '', runTime: this.searchParam.orderBy === 'runtime' ? this.searchParam.orderType : '' }];
    }
  },
  watch: {
    isAutoRefresh: {
      handler: function(val) {
        if (val) {
          this.searchSql();
        } else {
          if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
          }
        }
      }
    }
  }
};
</script>
<style lang="less" scoped>
@import '~@/resources/assets/css/variable.less';
.dbinfo {
  display: grid;
  grid-template-columns: 16% 16% 16% 16% 16% 16%;
  grid-gap: 10px;
}
.topRight {
  text-align: right;
  width: 60%;
  display: inline-block;
  float: right;
}
/* URL监控展开区承载嵌套TsTable，留出内边距避免子表贴边 */
.request-sql-expand {
  padding: 8px 16px;
}
/* URL监控SQL内容列表在复制弹窗内分隔展示，提升多条SQL的可读性 */
.request-sql-content + .request-sql-content {
  margin-top: 10px;
}
.request-sql-content {
  margin-top: 6px;
}
/* URL监控SQL弹窗中展示单条SQL的耗时和缓存信息，和SQL正文保持轻量分隔 */
.request-sql-meta {
  margin-bottom: 4px;
}
::v-deep .ivu-radio-wrapper {
  background: transparent !important;
  color: @default-title;
}
::v-deep .ivu-radio-wrapper-checked {
  color: @default-info-color!important;
}
</style>
