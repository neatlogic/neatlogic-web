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
      <template slot="content" class="layout-content">
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
                    {{ row.operationType | operationText }}
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
                <div class="table-row-wrapper bg-block">{{ row.timeCost }}??????</div>
              </td>
              <td key="status">
                <div class="table-row-wrapper bg-block">
                  <span v-if="row.status === 'succeed'" class="text-success">??????</span>
                  <span v-else class="text-danger">??????</span>
                </div>
              </td>
              <td key="paramFilePath">
                <div class="table-row-wrapper bg-block">
                  <span v-if="row.paramFilePath" class="text-primary text-action" @click="getAuditDetail(row.paramFilePath, '??????')">??????</span>
                  <span v-else>-</span>
                </div>
              </td>
              <td key="resultFilePath">
                <div class="table-row-wrapper bg-block">
                  <span v-if="row.resultFilePath" class="text-primary text-action" @click="getAuditDetail(row.resultFilePath, '??????')">??????</span>
                  <span v-else>-</span>
                </div>
              </td>
              <td key="errorFilePath" class="table-td-error">
                <div class="table-row-wrapper bg-block">
                  <span v-if="row.errorFilePath" class="text-primary text-action" @click="getAuditDetail(row.errorFilePath, '??????')">??????</span>
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
        <NoData v-else text="????????????" />
      </template>
    </TsContain>
    <Drawer
      v-model="isDrawerShow"
      :title="drawerTitle"
      width="600px"
      draggable
      className="audit-drawer"
    >
      <pre>{{ auditDetail }}</pre>
      <Button
        v-if="hasMore"
        v-download="auditDetailDownloadParams"
        type="primary"
        class="download-detail"
      >??????</Button>
    </Drawer>
  </div>
</template>

<script>
import download from '@/resources/directives/download.js';
export default {
  name: 'AuditOverview',
  directives: { download },
  filters: {
    operationText(value) {
      const config = {
        create: '???',
        delete: '???',
        update: '???',
        search: '???',
        operate: '???'
      };
      return config[value];
    }
  },
  components: {
    CombineSearcher: resolve => require(['@/resources/components/CombineSearcher/CombineSearcher.vue'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    // UserSelect: resolve => require(['@/resources/components/UserSelect/UserSelect'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard'], resolve),
    AuditConfig: resolve => require(['@/views/components/auditconfig/auditconfig.vue'], resolve)
    //TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  data() {
    return {
      searchVal: {},
      searchConfig: {
        searchList: [
          {
            type: 'userselect',
            name: 'userUuid',
            label: '??????',
            groupList: ['user'],
            transfer: true,
            multiple: false
          },
          {
            type: 'select',
            name: 'operationType',
            label: '????????????',
            placeholder: '????????????',
            url: '/api/rest/apiaudit/operationtype/list',
            transfer: true
          },
          {
            type: 'timeselect',
            name: 'dateRange',
            label: '??????',
            transfer: true
          }
        ]
      },
      isLoading: false,
      userSelectConfig: {
        width: '100px',
        placeholder: '??????',
        groupList: ['user'],
        multiple: false,
        transfer: true,
        total: 50
      },
      operationTypeConfig: {
        //????????????
        width: '100px',
        placeholder: '????????????',
        url: '/api/rest/apiaudit/operationtype/list'
      },
      orderTypeConfig: {
        //????????????
        clearable: false,
        value: 'desc',
        dataList: [
          { value: 'desc', text: '??????' },
          { value: 'asc', text: '??????' }
        ]
      },
      treeList: [
        {
          title: '??????',
          moduleGroup: null,
          funcId: null,
          expand: true,
          selected: true,
          children: []
        }
      ],
      theadList: [
        { key: 'startTime', width: 176 },
        { key: 'userName', title: '??????' },
        { key: 'apiName', title: '??????' },
        { key: 'moduleGroupName', title: '??????' },
        { key: 'timeCost', title: '??????' },
        { key: 'status', title: '??????' },
        { key: 'paramFilePath', title: '??????' },
        { key: 'resultFilePath', title: '??????' },
        { key: 'errorFilePath', title: '??????' }
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
    // ?????????????????????
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
                  children: []
                }
                : {
                  moduleGroup,
                  title: item.funcId,
                  funcId: item.funcId
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
    // ???????????????????????????
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
                children: []
              }
              : {
                moduleGroup,
                title: item.funcId,
                funcId: funcId + '/' + item.funcId
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
    // ???????????????????????????
    handleTreeSelectChange(nodeList, node) {
      const params = {
        moduleGroup: node.selected ? node.moduleGroup : null,
        funcId: node.selected ? node.funcId : null,
        currentPage: 1
      };
      this.searchAudit(params);
    },
    // ??????????????????
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
    // ??????
    handleSearchChange() {
      this.$refs.tree.getSelectedNodes().forEach(node => {
        node.selected = false;
      }); //????????????????????????????????????
      this.treeList[0].selected = true; //??????????????????????????????
      const params = {
        moduleGroup: null,
        funcId: null,
        currentPage: 1
      };
      this.searchAudit(params);
    },
    getAuditDetail(filePath, drawerTitle) {
      this.auditDetail = '?????????..';
      this.isDrawerShow = true;
      this.filePath = filePath;
      this.hasMore = false;
      this.drawerTitle = drawerTitle;
      const params = { filePath };
      this.$api.framework.audit.getCallDetail(params).then(res => {
        if (res.Status === 'OK') {
          this.hasMore = res.Return.hasMore;
          try {
            this.auditDetail = JSON.stringify(JSON.parse(res.Return.result), null, 2);
          } catch {
            this.auditDetail = res.Return.result;
          }
        }
      });
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
