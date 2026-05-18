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
              <TsTable v-if="requestSqlAuditData" v-bind="requestSqlAuditData" @changeCurrent="searchRequestSql">
                <template v-slot:totalTimeCost="{ row }">
                  <div>
                    <Progress :status="row.totalTimeCost < 1000 ? 'normal' : 'wrong'" :percent="getPercent(row.totalTimeCost, maxRequestTimeCost)" :stroke-width="10">
                      <span>{{ row.totalTimeCost }}{{ $t('page.ms') }}</span>
                    </Progress>
                  </div>
                </template>
                <template v-slot:sameIdSqlAuditList="{ row, index }">
                  <Poptip
                    v-if="row.sameIdSqlAuditList && row.sameIdSqlAuditList.length > 0"
                    trigger="hover"
                    title="请求SQL明细"
                    word-wrap
                    width="800"
                    :transfer="true"
                    placement="left"
                  >
                    <span class="tsfont-zirenwu" style="cursor:pointer">{{ row.sqlCount }}</span>
                    <div
                      slot="content"
                      class="fz10 scroll"
                      style="max-height:500px"
                    >
                      <div
                        v-for="(sqlAudit, sqlIndex) in row.sameIdSqlAuditList"
                        :key="sqlAudit.id + '_' + sqlIndex"
                        class="request-sql-item"
                      >
                        <div class="text-title">{{ sqlAudit.id }}</div>
                        <div>{{ $t('page.timecost') }}：{{ sqlAudit.totalTimeCost }}{{ $t('page.ms') }}</div>
                        <div
                          v-for="(sql, itemIndex) in sqlAudit.sqlList"
                          :key="itemIndex"
                          class="request-sql-content"
                        >
                          <div :id="'request_sql_' + index + '_' + sqlIndex + '_' + itemIndex">{{ sql }}</div>
                          <div style="text-align:right"><Button size="small" @click="copySql('#request_sql_' + index + '_' + sqlIndex + '_' + itemIndex)">{{ $t('page.copy') }}</Button></div>
                        </div>
                      </div>
                    </div>
                  </Poptip>
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
      requestTheadList: [
        { key: 'totalTimeCost', title: this.$t('page.timecost'), width: 200 },
        { key: 'url', title: 'url' },
        { key: 'threadName', title: '线程' },
        { key: 'tenant', title: this.$t('page.tenant') },
        { key: 'userId', title: this.$t('page.user') },
        { key: 'sqlCount', title: 'SQL数量' },
        { key: 'notUseCacheTotalTimeCost', title: '未用缓存耗时(ms)' },
        { key: 'runTime', title: this.$t('term.autoexec.executiontime'), type: 'time' },
        { key: 'sameIdSqlAuditList', title: this.$t('term.framework.sqlsstatement') }
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
    getPercent(value, maxValue) {
      // 进度条最大值可能为0，统一兜底避免NaN影响表格渲染
      if (!maxValue) {
        return 0;
      }
      return (value / maxValue) * 100;
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
.request-sql-item + .request-sql-item {
  margin-top: 10px;
}
.request-sql-content {
  margin-top: 6px;
}
::v-deep .ivu-radio-wrapper {
  background: transparent !important;
  color: @default-title;
}
::v-deep .ivu-radio-wrapper-checked {
  color: @default-info-color!important;
}
</style>
