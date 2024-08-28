<template>
  <div class="operation-audit">
    <TsContain
      :enableCollapse="true"
      border="border"
    >
      <template v-slot:topLeft>
        <div class="action-group">
          <span v-auth="['ADMIN']" class="action-item">
            <AuditConfig auditName="API-AUDIT"></AuditConfig>
          </span>
        </div>
      </template>
      <div slot="topRight" class="top-search">
        <TsRow>
          <Col :span="6">
            <TsFormSelect v-model="orderBy" v-bind="orderTypeConfig" />
          </Col>
          <Col :span="18">
            <CombineSearcher
              v-model="searchVal"
              class="search"
              v-bind="searchConfig"
              @change="searchAudit()"
            ></CombineSearcher>
          </Col>
        </TsRow>
      </div>
      <div slot="sider">
        <Tree
          ref="tree"
          class="menu-tree"
          :data="treeList"
          :load-data="getSubtree"
          @on-select-change="handleTreeSelectChange"
        ></Tree>
      </div>
      <template slot="content">
        <Loading :loadingShow="isLoading" type="fix"></Loading>
        <table v-if="tableConfig.rowNum > 0" class="table">
          <thead>
            <tr>
              <th
                v-for="th in theadList"
                :key="th.key"
                class="table-th bg-grey text-title"
                :class="`table-th-${th.key}`"
              >{{ th.title }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, trIndex) in tableConfig.tbodyList" :key="trIndex" class="table-row">
              <td key="startTime">
                <div class="timeline">
                  <div class="timeline-head" :class="row.operationType? row.operationType:'border-color'">
                    {{ row.operationType | operationText(t) }}
                  </div>
                  <div class="timeline-content">
                    <div class="timeline-content-time text-default">{{ row.startTime | formatDate('hh:mm:ss') }}</div>
                    <div class="timeline-content-date text-tip">{{ row.startTime | formatDate('yyyy-mm-dd') }}</div>
                  </div>
                  <div class="timeline-tail border-color"></div>
                </div>
              </td>
              <td key="userName" class="table-td-userName">
                <UserCard class="table-row-wrapper bg-block" :uuid="row.userUuid">{{ row.userName }}({{ row.ip }})</UserCard>
              </td>
              <td key="apiName">
                <div class="table-row-wrapper bg-block">{{ row.apiName }} ({{ row.token }})</div>
              </td>
              <td key="moduleGroupName">
                <div class="table-row-wrapper bg-block">{{ row.moduleGroupName }}</div>
              </td>
              <td key="timeCost">
                <div class="table-row-wrapper bg-block">{{ row.timeCost }}{{ $t('page.ms') }}</div>
              </td>
              <td key="status">
                <div class="table-row-wrapper bg-block">
                  <span v-if="row.status === 'succeed'" class="text-success">{{ $t('page.success') }}</span>
                  <span v-else class="text-danger">{{ $t('page.fail') }}</span>
                </div>
              </td>
              <td key="paramFilePath">
                <div class="table-row-wrapper bg-block">
                  <span v-if="row.paramFilePath" class="text-primary text-action" @click="getAuditDetail(row.paramFilePath, $t('page.param'))">{{ $t('page.param') }}</span>
                  <span v-else>-</span>
                </div>
              </td>
              <td key="resultFilePath">
                <div class="table-row-wrapper bg-block">
                  <span v-if="row.resultFilePath" class="text-primary text-action" @click="getAuditDetail(row.resultFilePath, $t('page.result'))">{{ $t('page.result') }}</span>
                  <span v-else>-</span>
                </div>
              </td>
              <td key="errorFilePath" class="table-td-error">
                <div class="table-row-wrapper bg-block">
                  <span v-if="row.errorFilePath" class="text-primary text-action" @click="getAuditDetail(row.errorFilePath, $t('page.exception'))">{{ $t('page.exception') }}</span>
                  <span v-else>-</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="tableConfig.rowNum > 0" class="page-container bg-grey clearfix">
          <Page
            :current.sync="tableConfig.currentPage"
            :page-size="tableConfig.pageSize"
            :total="tableConfig.rowNum"
            size="small"
            transfer
            show-total
            show-sizer
            class="page"
            @on-change="currentPage => changeCurrent(currentPage)"
            @on-page-size-change="pageSize => changePageSize(pageSize)"
          />
        </div>
        <NoData v-else />
      </template>
    </TsContain>
    <Drawer
      v-model="isDrawerShow"
      :title="drawerTitle"
      width="600px"
      draggable
      className="audit-drawer"
    >
      <JsonViewer
        v-if="auditDetail"
        boxed
        copyable
        :value="auditDetail"
      ></JsonViewer>
      <Button
        v-if="hasMore"
        v-download="auditDetailDownloadParams"
        type="primary"
        class="download-detail"
      >{{ $t('page.download') }}</Button>
    </Drawer>
  </div>
</template>

<script>
import download from '@/resources/directives/download.js';
export default {
  name: 'AuditOverview',
  directives: { download },
  filters: {
    operationText(value, t) {
      const config = {
        create: t('term.framework.i'),
        delete: t('term.framework.d'),
        update: t('term.framework.c'),
        search: t('term.framework.q'),
        operate: t('term.framework.o')
      };
      return config[value];
    }
  },
  components: {
    CombineSearcher: () => import('@/resources/components/CombineSearcher/CombineSearcher.vue'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    UserCard: () => import('@/resources/components/UserCard/UserCard'),
    AuditConfig: () => import('@/views/components/auditconfig/auditconfig.vue'),
    JsonViewer: () => import('vue-json-viewer')
  },
  data() {
    return {
      searchVal: {},
      searchConfig: {
        searchList: [
          {
            type: 'userselect',
            name: 'userUuid',
            label: this.$t('page.user'),
            groupList: ['user'],
            transfer: true,
            multiple: false
          },
          {
            type: 'select',
            name: 'operationType',
            label: this.$t('page.actiontype'),
            placeholder: this.$t('page.actiontype'),
            url: '/api/rest/apiaudit/operationtype/list',
            transfer: true
          },
          {
            type: 'timeselect',
            name: 'dateRange',
            label: this.$t('page.date'),
            transfer: true
          }
        ]
      },
      isLoading: false,
      userSelectConfig: {
        width: '100px',
        placeholder: this.$t('page.user'),
        groupList: ['user'],
        multiple: false,
        transfer: true,
        total: 50
      },
      operationTypeConfig: {
        //操作类型
        width: '100px',
        placeholder: this.$t('page.actiontype'),
        url: '/api/rest/apiaudit/operationtype/list'
      },
      orderTypeConfig: {
        //排序方式
        clearable: false,
        value: 'desc',
        dataList: [
          { value: 'desc', text: this.$t('term.framework.invertedorder') },
          { value: 'asc', text: this.$t('term.framework.positiveorder') }
        ]
      },
      treeList: [
        {
          title: this.$t('page.all'),
          moduleGroup: null,
          funcId: null,
          expand: true,
          selected: true,
          children: []
        }
      ],
      theadList: [
        { key: 'startTime', width: 176 },
        { key: 'userName', title: this.$t('page.user') },
        { key: 'apiName', title: this.$t('page.interface') },
        { key: 'moduleGroupName', title: this.$t('page.module') },
        { key: 'timeCost', title: this.$t('page.timecost') },
        { key: 'status', title: this.$t('page.status') },
        { key: 'paramFilePath', title: this.$t('page.param') },
        { key: 'resultFilePath', title: this.$t('page.result') },
        { key: 'errorFilePath', title: this.$t('page.exception') }
      ],
      tableConfig: {
        tbodyList: [],
        pageSize: 20,
        currentPage: 1,
        pageCount: 1,
        rowNum: null
      },
      searchParams: {
        moduleGroup: null,
        funcId: null,
        userUuid: null,
        operationType: null,
        keyword: null,
        needPage: true,
        currentPage: 1,
        pageSize: 20
      },
      orderBy: 'desc',
      dateRange: {
        timeRange: 1,
        timeUnit: 'day',
        startTime: null,
        endTime: null
      },
      auditDetail: null,
      filePath: null,
      hasMore: false,
      drawerTitle: null,
      isDrawerShow: false
    };
  },
  created() {
    this.getTree();
    this.searchAudit();
  },
  methods: {
    changeCurrent(current) {
      this.searchAudit({ currentPage: current });
    },
    changePageSize(pageSize) {
      this.searchParams.pageSize = pageSize;
      this.searchAudit();
    },
    // 获取目录树数据
    getTree() {
      const params = { menuType: 'audit' };
      this.$api.framework.audit.getTree(params).then(res => {
        if (res.Status === 'OK') {
          const moduleGroupList = res.Return.map(module => {
            const { moduleGroupName: title, moduleGroup, funcList } = module;
            const children = funcList.map(item => {
              return item.isHasChild
                ? {
                  moduleGroup,
                  title: item.funcId,
                  funcId: item.funcId,
                  loading: false,
                  children: [],
                  nodeKey: this.$utils.setUuid() // 解决鬼畜问题：点击当前节点，高亮选中得却是另外的节点
                }
                : {
                  moduleGroup,
                  title: item.funcId,
                  funcId: item.funcId,
                  nodeKey: this.$utils.setUuid()
                };
            });
            children.sort(item => {
              if ('children' in item) return -1;
              else return 1;
            });
            return { title, moduleGroup, funcId: null, children };
          });
          this.treeList[0].children = moduleGroupList;
        }
      });
    },
    // 获取目录树的子目录
    getSubtree(treeItem, callback) {
      const { moduleGroup, funcId } = treeItem;
      const params = {
        moduleGroup,
        funcId,
        type: 'audit'
      };
      this.$api.framework.audit.getSubtree(params).then(res => {
        if (res.Status === 'OK') {
          const children = res.Return.map(item => {
            return item.isHasChild
              ? {
                moduleGroup,
                title: item.funcId,
                funcId: funcId + '/' + item.funcId,
                loading: false,
                children: [],
                nodeKey: this.$utils.setUuid()
              }
              : {
                moduleGroup,
                title: item.funcId,
                funcId: funcId + '/' + item.funcId,
                nodeKey: this.$utils.setUuid()
              };
          });
          children.sort(item => {
            if ('children' in item) return -1;
            else return 1;
          });
          callback(children);
        }
      });
    },
    // 处理目录树选项更改
    handleTreeSelectChange(nodeList, node) {
      const params = {
        moduleGroup: node.selected ? node.moduleGroup : null,
        funcId: node.selected ? node.funcId : null,
        currentPage: 1
      };
      this.searchAudit(params);
    },
    // 查询审计记录
    searchAudit(data) {
      this.isLoading = true;
      let dateRange = {};
      let params = data || {};
      if (this.searchVal.dateRange) {
        dateRange = this.searchVal.dateRange;
      }
      this.searchParams = { ...this.searchVal, ...dateRange, ...params, orderType: this.orderBy };
      this.$api.framework.audit
        .searchAudit(this.searchParams)
        .then(res => {
          if (res.Status == 'OK') {
            this.tableConfig = res.Return;
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    // 搜索
    handleSearchChange() {
      this.$refs.tree.getSelectedNodes().forEach(node => {
        node.selected = false;
      }); //取消选中目录树的所有节点
      this.treeList[0].selected = true; //选中目录树“所有”项
      const params = {
        moduleGroup: null,
        funcId: null,
        currentPage: 1
      };
      this.searchAudit(params);
    },
    getAuditDetail(filePath, drawerTitle) {
      this.auditDetail = this.$t('page.loadingtip');
      this.isDrawerShow = true;
      this.filePath = filePath;
      this.hasMore = false;
      this.drawerTitle = drawerTitle;
      const params = { filePath };
      this.$api.framework.audit.getCallDetail(params).then(res => {
        if (res.Status === 'OK') {
          let {hasMore = false, content = ''} = res.Return || {};
          this.hasMore = hasMore;
          this.auditDetail = content || '';
        }
      });
    },
    t(arg) { //国际化翻译时，过滤器filter中拿不到this, 需要转化
      return this.$t(arg);
    }
  },
  computed: {
    auditListDownloadParams() {
      return {
        url: 'api/binary/apiaudit/export',
        method: 'get',
        params: {
          ...this.searchParams,
          ...this.dateRange,
          needPage: false,
          currentPage: null,
          pageSize: null
        }
      };
    },
    auditDetailDownloadParams() {
      return {
        url: 'api/binary/apimanage/audit/detail/download',
        params: {
          filePath: this.filePath
        }
      };
    }
  },
  watch: {
    orderBy: {
      handler: function(val) {
        this.searchAudit();
      }
    }
  }
};
</script>

<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.operation-audit {
  .top-default {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    .sider-toggle {
      width: 32px;
      height: 32px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      .tsfont-tree {
        font-size: 14px;
      }
    }
    .top-select {
      margin-left: 8px;
      &.user-select {
        width: 100px;
        /deep/ .ivu-dropdown {
          display: block;
        }
      }
      &.date-range {
        width: 225px;
        /deep/ .timeselect-contain {
          display: block;
        }
        /deep/ .search-input {
          height: 32px;
        }
      }
    }
    .export {
      margin-left: 16px;
      min-width: 50px;
    }
  }
  .menu-tree {
    padding-left: 12px;
  }
  /deep/ .ivu-layout-content {
    padding-right: 16px;
  }
}
.table {
  border-collapse: collapse;
  width: 100%;
  position: relative;
  tr {
    th:first-child,
    td:first-child {
      padding-left: 0;
    }
    th:last-child,
    td:last-child {
      padding-right: 0;
    }
  }
}
.table-th {
  text-align: left;
  font-weight: normal;
  height: 38px;
  position: sticky;
  top: 0;
  z-index: 1;
}
.table-row {
  height: 68px;
  vertical-align: top;
  &-wrapper {
    margin-bottom: 18px;
    height: 50px;
    line-height: 50px;
  }
  &:hover {
    .table-row-wrapper {
      background-color: @default-primary-grey;
    }
  }
}

.table-th-startTime {
  width: 176px;
}
.table-td-userName .table-row-wrapper {
  display: block;
  padding-left: 20px;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
}
.table-td-error .table-row-wrapper {
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
}
.timeline {
  height: 50px;
  width: 100%;
  margin-bottom: 18px;
  position: relative;

  &-head {
    position: absolute;
    right: 124px;
    top: 12px;
    width: 24px;
    height: 24px;
    border: 1.3px solid;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    &.create {
      color: @default-success-color;
      border-color: @default-success-color;
    }
    &.delete {
      color: @default-error-color;
      border-color: @default-error-color;
    }
    &.update {
      color: @default-warning-color;
      border-color: @default-warning-color;
    }
    &.search {
      color: @default-primary-color;
      border-color: @default-primary-color;
    }
    &.operate {
      color: #a78375;
      border-color: #a78375;
    }
  }
  &-content {
    position: absolute;
    right: 31px;
    top: 4px;
    font-size: 13px;
    &-time {
      height: 18px;
      line-height: 18px;
    }
    &-date {
      height: 18px;
      line-height: 18px;
      margin-top: 6px;
    }
  }
  &-tail {
    position: absolute;
    right: 135.5px;
    top: 36px;
    border-right: 1.5px solid;
    height: 44px;
  }
}

.table-row:last-of-type {
  .table-row-wrapper {
    margin-bottom: 0;
  }
  .timeline {
    margin-bottom: 0;
  }
  .timeline-tail {
    display: none;
  }
}
.page-container {
  width: 100%;
  padding: 10px;
  position: sticky;
  bottom: -1px;
  z-index: 1;
  .page {
    float: right;
  }
}
.audit-drawer {
  .download-detail {
    position: fixed;
    right: 20px;
    bottom: 20px;
  }
}
</style>

<style lang="less">
@import (reference) '~@/resources/assets/css/variable.less';
.theme-dark {
  .operation-audit {
    .table-row:hover {
      .table-row-wrapper {
        background-color: @dark-gray !important;
      }
    }
  }
}
</style>
