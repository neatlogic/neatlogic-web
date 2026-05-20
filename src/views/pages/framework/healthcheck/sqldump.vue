<template>
  <div>
    <TsContain>
      <div slot="topLeft">
        <div class="action-group">
          <div class="action-item tsfont-plus" @click="addSql">{{ $t('page.setting') }}</div>
          <div class="action-item">
            <RadioGroup
              v-model="searchParam.orderBy"
              type="button"
              button-style="solid"
              @on-change="
                val => {
                  searchParam.orderBy = val;
                  searchSql();
                }
              "
            >
              <Radio label="runtime">{{ $t('term.framework.runtimesort') }}</Radio>
              <Radio label="timecost">{{ $t('term.framework.timecostsort') }}</Radio>
            </RadioGroup>
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
              title="SQL ID监控列表"
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
              title="URL监控列表"
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
        <InputSearcher
          v-if="activeTab === 'sql'"
          v-model="searchParam.id"
          @change="searchSql()"
        ></InputSearcher>
        <InputSearcher
          v-else
          v-model="searchParam.url"
          @change="searchSql()"
        ></InputSearcher>
      </div>
      <div slot="content" class="content">
        <div>
          <div class="dbinfo padding">
            <div>
              <span>{{ '数据库' }}：{{ datasourceData.database + '(' + datasourceData.databaseVersion + ')' }}</span>
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
            <TabPane label="SQL ID监控" name="sql">
              <TsTable v-if="sqlAuditData" v-bind="sqlAuditData" @changeCurrent="searchSql">
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
                <template v-slot:sql="{ row, index }">
                  <Poptip
                    v-if="row.sql"
                    trigger="hover"
                    :title="$t('term.framework.sqlsstatement')"
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
                      <div :id="'sql_' + row.id.replace(/\./ig,'_') + '_' + index">{{ row.sql }}</div>
                      <div style="text-align:right"><Button size="small" @click="copySql('#sql_' + row.id.replace(/\./ig,'_') + '_' + index)">{{ $t('page.copy') }}</Button></div>
                    </div>
                  </Poptip>
                </template>
              </TsTable>
            </TabPane>
            <TabPane label="URL监控" name="url">
              <TsTable
                v-if="requestSqlAuditData"
                v-bind="requestSqlAuditData"
                :canExpand="true"
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
                        <Tooltip :content="sqlRow.id" max-width="400">
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
                              </div>
                              <div :id="getRequestSqlDomId(row, sqlRow, itemIndex)">{{ sqlAudit.sql }}</div>
                              <div style="text-align:right"><Button size="small" @click="copySql('#' + getRequestSqlDomId(row, sqlRow, itemIndex))">{{ $t('page.copy') }}</Button></div>
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
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    SqlDumpEdit: () => import('./sqldump-edit.vue'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    StatusDialog: () => import('./status-dialog.vue')
  },
  props: {},
  data() {
    return {
      isAutoRefresh: true,
      datasourceData: {},
      timer: null,
      timerDatasource: null,
      sqlIdList: [],
      urlList: [],
      activeTab: 'sql',
      isInitDefaultTab: false,
      isDialogShow: false,
      isStatusDialogShow: false,
      searchParam: { orderBy: 'runtime', id: '', url: '' },
      sqlAuditData: {},
      requestSqlAuditData: {},
      theadList: [
        { key: 'timeCost', title: this.$t('page.timecost'), width: 200 },
        { key: 'id', title: 'id' },
        { key: 'threadName', title: '线程' },
        { key: 'tenant', title: this.$t('page.tenant') },
        { key: 'userId', title: this.$t('page.user') },
        { key: 'recordCount', title: this.$t('page.datacapacity') },
        { key: 'runTime', title: this.$t('term.autoexec.executiontime'), type: 'time' },
        { key: 'useCacheLevel', title: this.$t('page.cache') },
        { key: 'sql', title: this.$t('term.framework.sqlsstatement') }
      ],
      // URL监控主表增加展开列，用于在每个请求行下方展示sameIdSqlAuditList嵌套表格
      requestTheadList: [
        { key: 'expander', width: 40 },
        { key: 'totalTimeCost', title: this.$t('page.timecost'), width: 200 },
        { key: 'url', title: 'url' },
        { key: 'threadName', title: '线程' },
        { key: 'tenant', title: this.$t('page.tenant') },
        { key: 'userId', title: this.$t('page.user') },
        { key: 'sqlCount', title: 'SQL数量' },
        { key: 'notUseCacheTotalTimeCost', title: '未用缓存耗时(ms)', width: 160 },
        { key: 'runTime', title: this.$t('term.autoexec.executiontime'), type: 'time' }
      ],
      // URL监控嵌套表格表头，用于展示每个请求内按sqlId聚合后的SQL明细
      requestSqlDetailTheadList: [
        { key: 'id', title: 'id' },
        { key: 'totalTimeCost', title: this.$t('page.timecost'), width: 120 },
        { key: 'notUseCacheTotalTimeCost', title: '未用缓存耗时(ms)', width: 160 },
        { key: 'notUseCacheCount', title: '未用缓存次数', width: 140 },
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
      console.log(sqlRow.sqlAuditList, 'sqlRow.sqlAuditList');
      return sqlRow.sqlAuditList || [];
    },
    getSqlAuditCacheLevel(sqlAudit) {
      // 单条SQL未命中缓存时后端返回空字符串，前端统一显示为未使用缓存
      return sqlAudit.useCacheLevel || '未使用缓存';
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
      // Tab切换时清理另一个维度的搜索词，避免SQL ID和URL搜索条件互相影响
      if (this.activeTab === 'sql') {
        this.searchParam.url = '';
      } else {
        this.searchParam.id = '';
      }
      this.searchSql();
    },
    searchRequestSql(currentPage) {
      this.searchSql(null, currentPage);
    },
    searchSql(currentPage, requestCurrentPage) {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      // SQL ID和URL监控分别维护当前页，满足两个TsTable独立分页
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      } else if (this.activeTab === 'sql') {
        this.searchParam.currentPage = 1;
      }
      if (requestCurrentPage) {
        this.searchParam.requestCurrentPage = requestCurrentPage;
      } else if (this.activeTab === 'url') {
        this.searchParam.requestCurrentPage = 1;
      }
      this.$api.framework.healthcheck.searchSqlAudit(this.searchParam).then(res => {
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
  computed: {},
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
  grid-template-columns: 20% 20% 20% 20% 20%;
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
