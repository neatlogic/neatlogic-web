<template>
  <div>
    <TsContain class="bg-block">
      <template slot="topLeft">
        <span class="tsfont-plus text-action" @click="addAction()">{{ $t('page.actions') }}</span>
      </template>
      <template slot="topRight">
        <CombineSearcher v-model="searchVal" v-bind="searchConfig" @change="() => changeCurrent(1)"></CombineSearcher>
      </template>
      <div slot="content">
        <div>
          <Loading v-if="loadingShow" loadingShow type="fix"></Loading>
          <TsTable
            v-else
            v-bind="tableData"
            @changeCurrent="changeCurrent"
            @changePageSize="changePageSize"
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
                  <div>{{ row.appModuleInfo }}</div>
                  <div slot="content">
                    <div>{{ row.appModuleInfo }}</div>
                  </div>
                </Tooltip>
              </div>
              <div v-else>-</div>
            </template>
            <template slot="isActive" slot-scope="{ row }">
              <TsFormSwitch
                v-model="row.isActive"
                :true-value="1"
                :false-value="0"
                showStatus
                @on-change=" val => {
                  changeIsActive(row, val);
                }"
              ></TsFormSwitch>
            </template>
            <template slot="action" slot-scope="{ row }">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li class="tsfont-edit" @click="editAction(row.id)">{{ $t('page.edit') }}</li>
                  <li class="tsfont-trash-o" @click="deleteAction(row.id)">{{ $t('page.delete') }}</li>
                  <li class="tsfont-file-single" @click="actionId = row.id">{{ $t('term.codehub.triggerlog') }}</li>
                </ul>
              </div>
            </template>
          </TsTable>
        </div>
      </div>
    </TsContain>
    <ActionEdit
      v-if="isActionDialogShow"
      :id="id"
      @close="closeActionDialog"
    ></ActionEdit>
    <ActionLog v-if="actionId" :id="actionId" @close="actionId = null"></ActionLog>
  </div>
</template>

<script>
export default {
  name: '',
  components: {
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve),
    CombineSearcher: resolve => require(['@/resources/components/CombineSearcher/CombineSearcher.vue'], resolve),
    ActionEdit: resolve => require(['./action/action-edit.vue'], resolve),
    ActionLog: resolve => require(['./action/action-log.vue'], resolve)
  },
  props: [''],
  data() {
    return {
      loadingShow: false,
      isActionDialogShow: false,
      id: null,
      actionId: null,
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
            title: this.$t('page.module'),
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
            onChange: val => {
              this.updateModule(val);
            }
          },
          {
            name: 'appModuleId',
            type: 'select',
            label: this.$t('page.module'),
            transfer: true,
            rootName: 'tbodyList',
            dealDataByUrl: this.$utils.getAppForselect
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
      let param = {
        currentPage: this.tableData.currentPage,
        pageSize: this.tableData.pageSize,
        ...this.searchVal
      };
      this.loadingShow = true;
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
          this.loadingShow = false;
        });
    },
    changeCurrent(currentPage) {
      this.tableData.currentPage = currentPage;
      this.searchList();
    },
    changePageSize(pageSize) {
      this.tableData.currentPage = 1;
      this.tableData.pageSize = pageSize;
      this.searchList();
    },
    changeIsActive(row, isActive) {
      let id = row.id;
      const newIsActive = isActive ? 1 : 0;
      row.isActive = newIsActive;
      this.$api.codehub.merge.activeAction({ id: id, isActive: newIsActive }).then(res => {
        if (res && res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
        }
      });
    },
    getActionLog(id) {
      this.id = id;
      this.isActionLogDialogShow = true;
    },
    addAction() {
      this.id = null;
      this.isActionDialogShow = true;
    },
    editAction(id) {
      if (id) {
        this.id = id;
      }
      this.isActionDialogShow = true;
    },
    deleteAction(id) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', { target: this.$t('page.actions') }),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.codehub.merge.deleteAction({ id: id }).then(res => {
            if (res && res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.changeCurrent(1);
              vnode.isShow = false;
            }
          });
        }
      });
    },
    closeActionLog(isreload) {
      this.actionId = null;
    },
    closeActionDialog(needRefresh) {
      this.isActionDialogShow = false;
      this.id = null;
      if (needRefresh) {
        this.changeCurrent(1);
      }
    },
    updateModule(appSystemId) {
      const params = appSystemId ? { appSystemId: appSystemId } : {};
      const dynamicUrl = appSystemId ? '/api/rest/codehub/appmodule/search' : '';

      const moduleItem = this.searchConfig.searchList.find(item => item?.name === 'appModuleId');
      if (moduleItem) {
        moduleItem.params = params;
        moduleItem.dynamicUrl = dynamicUrl;
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
