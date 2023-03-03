<template>
  <div>
    <TsContain>
      <div slot="topLeft">
        <div class="action-group">
          <div class="action-item tsfont-plus" @click="addSql">设置</div>
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
              <Radio label="runtime">按执行时间降序</Radio>
              <Radio label="timecost">按耗时降序</Radio>
            </RadioGroup>
          </div>
          <div class="action-item">
            <TsFormSwitch
              v-model="isAutoRefresh"
              :true-value="true"
              :false-value="false"
              :showStatus="true"
              :border="'border'"
              trueText="自动刷新"
              falseText="手动刷新"
              class="discontents"
            ></TsFormSwitch>
          </div>
          <div class="action-item">
            <span class="tsfont-attribute" @click="openStatusDialog()">数据库状态</span>
          </div>
          <div v-if="sqlIdList && sqlIdList.length > 0" class="action-item">
            <Poptip
              trigger="hover"
              title="监控语句列表"
              word-wrap
              width="500"
              :transfer="true"
              placement="bottom"
            >
              <span class="tsfont-zirenwu">{{ sqlIdList.length }}</span>
              <div slot="content" class="api">
                <Tag
                  v-for="(sql, index) in sqlIdList"
                  :key="index"
                  :closable="true"
                  @on-close="removeSql(sql)"
                >{{ sql }}</Tag>
              </div>
            </Poptip>
          </div>
        </div>
      </div>
      <div slot="topRight">
        <InputSearcher
          v-model="searchParam.id"
          @change="searchSql()"
        ></InputSearcher>
      </div>
      <div slot="content" class="content">
        <div>
          <div class="dbinfo padding">
            <div>
              <span>数据库连接池：{{ datasourceData.poolName }}</span>
            </div>
            <div>
              <span>总连接：</span>
              <Badge v-if="datasourceData.totalConnections" :count="datasourceData.totalConnections" type="primary"></Badge>
              <span v-else>-</span>
            </div>
            <div>
              <span>活动连接：</span>
              <Badge v-if="datasourceData.activeConnections" :count="datasourceData.activeConnections" type="primary"></Badge>
              <span v-else>-</span>
            </div>
            <div>
              <span>等待连接：</span>
              <Badge v-if="datasourceData.threadsAwaitingConnection" :count="datasourceData.threadsAwaitingConnection" type="primary"></Badge>
              <span v-else>-</span>
            </div>
            <div>
              <span>空闲连接：</span>
              <Badge v-if="datasourceData.idleConnections" :count="datasourceData.idleConnections" type="primary"></Badge>
              <span v-else>-</span>
            </div>
          </div>
          <TsTable v-if="sqlAuditData" v-bind="sqlAuditData" @changeCurrent="searchSql">
            <template v-slot:id="{ row }">
              <Tooltip :content="row.id" max-width="200">
                {{ row.id.substring(row.id.lastIndexOf('.') + 1) }}
              </Tooltip>
            </template>
            <template v-slot:timeCost="{ row }">
              <div>
                <Progress :status="row.timeCost < 1000 ? 'normal' : 'wrong'" :percent="(row.timeCost / maxTimeCost) * 100" :stroke-width="10">
                  <span>{{ row.timeCost }}毫秒</span>
                </Progress>
              </div>
            </template>
            <template v-slot:sql="{ row }">
              <Poptip
                v-if="row.sql"
                trigger="hover"
                title="SQL语句"
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
                  <div :id="'sql_' + row.id.replace(/\./ig,'_')">{{ row.sql }}</div>
                  <div style="text-align:right"><Button size="small" @click="copySql('#sql_' + row.id.replace(/\./ig,'_'))">复制</Button></div>
                </div>
              </Poptip>
            </template>
          </TsTable>
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
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    SqlDumpEdit: resolve => require(['./sqldump-edit.vue'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    StatusDialog: resolve => require(['./status-dialog.vue'], resolve)
  },
  props: {},
  data() {
    return {
      isAutoRefresh: true,
      datasourceData: {},
      timer: null,
      timerDatasource: null,
      sqlIdList: [],
      isDialogShow: false,
      isStatusDialogShow: false,
      searchParam: { orderBy: 'runtime' },
      sqlAuditData: {},
      theadList: [
        { key: 'timeCost', title: '耗时', width: 200 },
        { key: 'id', title: 'id' },
        { key: 'tenant', title: '租户' },
        { key: 'userId', title: '用户' },
        { key: 'recordCount', title: '数据量' },
        { key: 'runTime', title: '执行时间', type: 'time' },
        { key: 'sql', title: 'sql语句' }
      ],
      fromPath: '',
      leftHeight: 0,
      leftWidth: 200,
      maxTimeCost: 0
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
    removeSql(sqlId) {
      this.$api.framework.healthcheck.toggleSqlInterceptor({ action: 'remove', id: sqlId }).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.content.executesuccess'));
          const index = this.sqlIdList.findIndex(d => d == sqlId);
          if (index > -1) {
            this.sqlIdList.splice(index, 1);
          }
        }
      });
    },
    closeDialog() {
      this.isDialogShow = false;
    },
    addSql() {
      this.isDialogShow = true;
    },
    searchSql(currentPage) {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      } else {
        this.searchParam.currentPage = 1;
      }
      this.$api.framework.healthcheck.searchSqlAudit(this.searchParam).then(res => {
        this.sqlAuditData = res.Return;
        this.sqlAuditData.theadList = this.theadList;
        this.maxTimeCost = res.Return.maxTimeCost;
        this.sqlIdList = res.Return.sqlIdList;
        this.timer = setTimeout(() => {
          this.searchSql(currentPage);
        }, 5000);
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
@import '~@/resources/assets/css/my-theme.less';
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
/deep/.ivu-radio-wrapper {
  background: transparent !important;
  color: @default-title;
}
/deep/.ivu-radio-wrapper-checked {
  color: @default-info-color!important;
}
</style>
