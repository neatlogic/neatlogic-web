<template>
  <div>
    <TsContain class="bg-block">
      <template slot="topLeft">
        <span class="tsfont-plus text-action" @click="addAction()">{{ $t('page.actions') }}</span>
      </template>
      <template slot="topRight">
        <CombineSearcher v-model="searchVal" v-bind="searchConfig" @change="searchList(1)"></CombineSearcher>
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
              <template slot="appSystemInfo" slot-scope="{ row }">
                <div v-if="row.appSystemInfo">
                  <Tooltip
                    v-if="row.appSystemInfo"
                    theme="light"
                    max-width="300"
                    transfer
                  >
                    <div>{{ row.appSystemInfo }}</div>
                    <div slot="content">
                      <div>{{ row.appSystemInfo }}</div>
                    </div>
                  </Tooltip>
                </div>
                <div v-else>-</div>
              </template>
              <template slot="appModuleInfo" slot-scope="{ row }">
                <div v-if="row.appModuleInfo">
                  <Tooltip
                    v-if="row.appModuleInfo"
                    theme="light"
                    max-width="300"
                    transfer
                  >
                    <div>{{ row.appModuleInfo }}</div>npm
                    <div slot="content">
                      <div>{{ row.appModuleInfo }}</div>
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
                <span v-if="row.isActive == 1" class="text-tip">{{ $t('page.enabled') }}</span>
                <span v-else class="text-tip">{{ $t('page.disable') }}</span>
              </template>
              <template slot="action" slot-scope="{ row }">
                <div class="tstable-action">
                  <ul class="tstable-action-ul">
                    <li class="action-item text-action ts-edit" @click="editAction(row.id)">{{ $t('page.edit') }}</li>
                    <li class="action-item text-action ts-trash" @click="deleteAction(row.id)">{{ $t('page.delete') }}</li>
                    <li class="action-item text-action ts-catalogue" @click="actionId = row.id">{{ $t('term.codehub.triggerlog') }}</li>
                  </ul>
                </div>
              </template>
            </TsTable>
          </div>
        </div>
      </div>
    </TsContain>
    <ActionEdit
      :id="id"
      ref="ActionEdit"
      :is-show="isActionDialogShow"
      @close="closeActionDialog"
    ></ActionEdit>
    <ActionLog v-if="actionId" :id="actionId" @close="actionId = null"></ActionLog>
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
      appSystemId: '',
      appModuleId: '',
      isLoad: false,
      isActionDialogShow: false,
      id: null,
      actionId: null,
      keyword: '',
      tableData: {
        theadList: [
          {
            title: this.$t('page.name'),
            key: 'name'
          },
          {
            title: this.$t('term.deploy.triggerstate'),
            key: 'status'
          },
          {
            title: this.$t('page.status'),
            key: 'isActive'
          },
          {
            title: this.$t('page.system'),
            key: 'appSystemInfo'
          },
          {
            title: this.$t('page.subsystem'),
            key: 'appModuleInfo'
          },
          {
            title: this.$t('page.versions'),
            key: 'versionName'
          },
          {
            title: this.$t('page.targetbranch'),
            key: 'targetBranch'
          },
          {
            title: this.$t('page.action'),
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
            name: 'appSystemId',
            type: 'select',
            label: this.$t('page.system'),
            transfer: true,
            dynamicUrl: '/api/rest/codehub/appsystem/search',
            rootName: 'tbodyList',
            dealDataByUrl: this.$utils.getAppForselect,
            value: this.appSystemId,
            onChange: val => {
              this.appSystemId = val;
              this.updateModule(val);
              this.getSearch();
            }
          },
          {
            name: 'appModuleId',
            type: 'select',
            label: this.$t('page.module'),
            transfer: true,
            rootName: 'tbodyList',
            textName: 'name',
            valueName: 'id',
            value: this.appModuleId,
            onChange: val => {
              this.appModuleId = val;
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
    searchList(currentPage) {
      let param = {};
      if (this.tableData) {
        this.tableData.pageSize && Object.assign(param, { pageSize: this.tableData.pageSize });
        this.tableData.currentPage && Object.assign(param, { currentPage: this.tableData.currentPage });
        if (currentPage) {
          this.tableData.currentPage = currentPage;
        }
      }
      this.keyword && Object.assign(param, { keyword: this.keyword });
      this.appModuleId && Object.assign(param, { appModuleId: this.appModuleId });
      this.appSystemId && Object.assign(param, { appSystemId: this.appSystemId });
      this.isLoad = true;
      this.$api.codehub.merge
        .getActionList(param)
        .then(res => {
          if (res && res.Status == 'OK') {
            Object.assign(this.tableData, {
              pageCount: res.Return.pageCount,
              rowNum: res.Return.rowNum,
              pageSize: res.Return.pageSize,
              currentPage: res.Return.currentPage,
              tbodyList: res.Return.tbodyList
            });
          } else {
            this.tableData = null;
          }
        })
        .finally(() => {
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
          _this.$Message.success(this.$t('message.executesuccess'));
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
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', { target: this.$t('page.actions') }),
        btnType: 'error',
        'on-ok': function(vnode) {
          _this.$api.codehub.merge.deleteAction({ id: id }).then(res => {
            if (res && res.Status == 'OK') {
              _this.$Message.success(this.$t('message.deletesuccess'));
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
    updateModule(val) {
      this.appModuleId = '';
      if (val) {
        this.searchConfig.searchList.forEach(item => {
          if (item && item.name == 'appModuleId') {
            this.$set(item, 'params', { appSystemId: val });
            this.$set(item, 'dynamicUrl', '/api/rest/codehub/appmodule/search');
          }
        });
      } else {
        this.searchConfig.searchList.forEach(item => {
          if (item && item.name == 'appModuleId') {
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
