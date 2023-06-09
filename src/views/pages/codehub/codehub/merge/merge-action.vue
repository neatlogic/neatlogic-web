<template>
  <div>
    <TsContain class="bg-block">
      <template slot="topLeft">
        <span class="tsfont-plus text-action" @click="addAction()">动作</span>
      </template>
      <template slot="topRight">
        <CombineSearcher
          v-model="searchVal"
          v-bind="searchConfig"
          @change="getTableList(1)"
        ></CombineSearcher>
      </template>
      <div slot="content">
        <div>
          <div>
            <Loading v-if="isLoad" loadingShow style="min-height: 100px"></Loading>
            <TsTable
              v-else
              v-bind="tableData"
              @changeCurrent="updatePage"
              @changePageSize="updateSize"
            >
              <template slot="status" slot-scope="{ row }">
                <span v-for="(status, sindex) in row.statusList" :key="sindex">
                  {{ status.text }}
                </span>
              </template>
              <template slot="systemInfo" slot-scope="{ row }">
                <div v-if="row.systemInfo">
                  <Tooltip
                    v-if="row.systemInfo"
                    theme="light"
                    max-width="300"
                    transfer
                  >
                    <div>{{ row.systemInfo }}</div>
                    <div slot="content">
                      <div>{{ row.systemInfo }}</div>
                    </div>
                  </Tooltip>
                </div>
                <div v-else>-</div>
              </template>
              <template slot="subSystemInfo" slot-scope="{ row }">
                <div v-if="row.subSystemInfo">
                  <Tooltip
                    v-if="row.subSystemInfo"
                    theme="light"
                    max-width="300"
                    transfer
                  >
                    <div>{{ row.subSystemInfo }}</div>
                    <div slot="content">
                      <div>{{ row.subSystemInfo }}</div>
                    </div>
                  </Tooltip>
                </div>
                <div v-else>-</div>
              </template>
              <template slot="targetBranch" slot-scope="{ row }">
                {{ row.targetBranch || '-' }}
              </template>
              <template slot="versionName" slot-scope="{ row }">
                {{ row.versionName || '-' }}
              </template>
              <template slot="isActive" slot-scope="{ row }">
                <i-switch
                  v-model="row.isActive"
                  :true-value="1"
                  :false-value="0"
                  @on-change="
                    val => {
                      btnSetActive(row, val);
                    }
                  "
                ></i-switch>
                <span v-if="row.isActive == 1" class="text-tip">启用</span>
                <span v-else class="text-tip">禁用</span>
              </template>
              <template slot="action" slot-scope="{ row }">
                <div class="tstable-action">
                  <ul class="tstable-action-ul">
                    <li class="action-item text-action ts-edit" @click="editAction(row.id)">编辑</li>
                    <li class="action-item text-action ts-trash" @click="deleteAction(row.id)">删除</li>
                    <li class="action-item text-action ts-catalogue" @click="actionId = row.id">查看触发记录</li>
                  </ul>
                </div>
              </template>
            </TsTable>
          </div>
        </div>
      </div>
    </TsContain>
    <ActionEdit
      ref="ActionEdit"
      :uuid="id"
      :is-show="isActionDialogShow"
      @close="closeActionDialog"
    ></ActionEdit>
    <ActionLog v-if="actionId" :uuid="actionId" @close="actionId = null"></ActionLog>
  </div>
</template>

<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve),
    CombineSearcher: resolve => require(['@/resources/components/CombineSearcher/CombineSearcher.vue'], resolve),
    ActionEdit: resolve => require(['./action/action-edit.vue'], resolve),
    ActionLog: resolve => require(['./action/action-log.vue'], resolve)
  },
  props: [''],
  data() {
    return {
      systemUuid: '',
      subsystemUuid: '',
      isLoad: false,
      isActionDialogShow: false,
      id: null,
      actionId: null,
      keyword: '',
      tableData: {
        theadList: [
          {
            title: '名称',
            key: 'name'
          },
          {
            title: '触发状态',
            key: 'status'
          },
          {
            title: '状态',
            key: 'isActive'
          },
          {
            title: '系统',
            key: 'systemInfo'
          },
          {
            title: '子系统',
            key: 'subSystemInfo'
          },
          {
            title: '版本',
            key: 'versionName'
          },
          {
            title: '目标分支',
            key: 'targetBranch'
          },
          {
            title: '操作',
            key: 'action'
          }
        ],
        tbodyList: []
      },
      searchVal: {},
      searchConfig: {
        search: true,
        searchList: [
          {
            name: 'systemUuid',
            type: 'select',
            label: '系统',
            transfer: true,
            dynamicUrl: '/api/rest/codehub/appsystem/search',
            rootName: 'tbodyList',
            dealDataByUrl: this.$utils.getAppForselect,
            value: this.systemUuid,
            onChange: (val) => {
              this.systemUuid = val;
              this.updateSubSystem(val);
              this.getSearch();
            }
          },
          {
            name: 'subsystemUuid',
            type: 'select',
            label: '子系统',
            transfer: true,
            rootName: 'tbodyList',
            textName: 'name',
            valueName: 'uuid',
            value: this.subsystemUuid,
            onChange: (val) => {
              this.subsystemUuid = val;
              this.getSearch();
            }
          }
        ]
      }
    };
  },
  beforeCreate() {},
  created() {
    this.searchList();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    searchList() {
      let param = {};
      if (this.tableData) {
        this.tableData.pageSize && Object.assign(param, { pageSize: this.tableData.pageSize });
        this.tableData.currentPage && Object.assign(param, { currentPage: this.tableData.currentPage });
      }
      this.keyword && Object.assign(param, { keyword: this.keyword });
      this.subsystemUuid && Object.assign(param, { subsystemUuid: this.subsystemUuid });
      this.systemUuid && Object.assign(param, { systemUuid: this.systemUuid });
      this.isLoad = true;
      this.$api.codehub.merge.getActionList(param).then(res => {
        if (res && res.Status == 'OK') {
          Object.assign(this.tableData, {
            pageCount: res.Return.pageCount,
            rowNum: res.Return.rowNum,
            pageSize: res.Return.pageSize,
            currentPage: res.Return.currentPage,
            tbodyList: res.Return.list
          });
        } else {
          this.tableData = null;
        }
      }).finally(() => {
        this.isLoad = false;
      });
    },
    updatePage(page) {
      this.tableData.currentPage = page;
      this.searchList();
    },
    updateSize(size) {
      this.tableData.pageSize = size;
      this.searchList();
    },
    getSearch() {
      this.tableData.currentPage = 1;
      this.searchList();
    },
    btnSetActive(row, isActive) {
      let id = row.id;
      let _this = this;
      if (isActive) {
        isActive = 1;
      } else {
        isActive = 0;
      }
      row.isActive = isActive;

      _this.$api.codehub.merge.activeAction({ id: id, isActive: isActive }).then(res => {
        if (res && res.Status == 'OK') {
          _this.$Message.success('操作成功');
        } else {
          _this.$Message.error(res.Message);
        }
      });
    },
    getActionLog(id) {
      this.id = id;
      this.isActionLogDialogShow = true;
    },
    addAction: function() {
      this.id = null;
      this.isActionDialogShow = true;
      this.$forceUpdate();
    },
    editAction(id) {
      if (id) {
        this.id = id;
      }
      this.isActionDialogShow = true;
    },
    deleteAction(id) {
      let _this = this;
      _this.$createDialog({
        title: '删除确认',
        content: '是否确认删除该动作',
        btnType: 'error',
        'on-ok': function(vnode) {
          _this.$api.codehub.merge.deleteAction({ id: id }).then(res => {
            if (res && res.Status == 'OK') {
              _this.$Message.success('删除成功');
              _this.getSearch();
              vnode.isShow = false;
            } else {
              _this.$Message.error(res.Message);
            }
          });
        }
      });
    },
    closeActionLog(isreload) {
      this.actionId = null;
    },
    closeActionDialog: function(needRefresh) {
      this.isActionDialogShow = false;
      this.id = null;
      if (needRefresh) {
        this.getSearch();
      }
    },
    updateSubSystem(val) {
      this.subsystemUuid = '';
      if (val) {
        this.searchConfig.searchList.forEach((item) => {
          if (item && (item.name == 'subsystemUuid')) {
            this.$set(item, 'params', {appSystemId: val});
            this.$set(item, 'dynamicUrl', '/api/rest/codehub/appmodule/search');
          } 
        });
      } else {
        this.searchConfig.searchList.forEach((item) => {
          if (item && (item.name == 'subsystemUuid')) {
            this.$set(item, 'params', {});
            this.$set(item, 'dynamicUrl', '');
          } 
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.text-label {
  line-height: 54px;
}
.top-title {
  .title {
    line-height: 30px;
  }
  .desc {
    line-height: 20px;
  }
  padding-left: 20px;
  margin-left: 20px;
  border-left: 1px solid @default-border;
}
.btnJobActive {
  width: 60px;
  height: 24px;
  background: #ddd;
  display: inline-block;
  vertical-align: middle;
  margin-right: 15px;
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  padding: 0 10px;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: left;
  transition: all 0.3s;
}
.btnJobActive:before {
  content: '激活';
}

.btnJobActive:after {
  content: '';
  width: 18px;
  height: 18px;
  background: #fff;
  display: block;
  border-radius: 50%;
  position: absolute;
  top: 3px;
  right: 3px;
  transition: all 0.3s;
}

.btnJobActive.on {
  background: #0d6cff;
  text-align: right;
}

.btnJobActive.on:before {
  content: '禁用';
}

.btnJobActive.on:after {
  left: 3px;
  right: auto;
}
</style>
