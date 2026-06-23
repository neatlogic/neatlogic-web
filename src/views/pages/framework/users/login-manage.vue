<template>
  <div>
    <TsContain>
      <template slot="topLeft">
        <div class="action-group">
          <span v-auth="['ADMIN']" class="action-item">
            <AuditConfig auditName="LOGIN-AUDIT" :title="$t('term.framework.loginauditretentionperiod')"></AuditConfig>
          </span>
          <span class="action-item tsfont-download" @click="exportLoginAudit()">{{ $t('page.export') }}</span>
        </div>
      </template>
      <template slot="topRight">
        <div class="login-search">
          <CombineSearcher
            v-model="searchValue"
            v-bind="searchConfig"
            @change="changePage(1)"
          ></CombineSearcher>
        </div>
      </template>
      <div slot="content">
        <TsTable
          v-if="tableData"
          v-bind="tableData"
          :theadList="theadList"
          :classKey="['rowClass']"
          @changeCurrent="changePage"
          @changePageSize="changePageSize"
        >
          <template v-slot:userUuid="{ row }">
            <UserCard :uuid="row.userUuid" :hideAvatar="false"></UserCard>
          </template>
          <template v-slot:teamNameList="{ row }">
            <div @click.stop>
              <Tag v-for="(t, index) in showTableList(row.teamNameList)" :key="index">{{ t }}</Tag>
              <span v-if="row.teamNameList && row.teamNameList.length > 3" @click.stop>
                <Dropdown placement="bottom-start" transfer @click.native.stop>
                  <span class="text-action tsfont-option-horizontal"></span>
                  <DropdownMenu slot="list">
                    <DropdownItem v-for="(item, index) in showRestText(row.teamNameList)" :key="index">{{ item }}</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </span>
            </div>
          </template>
          <!-- <template v-slot:action="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-list" @click="openFeatureAuditDialog(row)">使用情况</li>
              </ul>
            </div>
          </template> -->
        </TsTable>
      </div>
    </TsContain>
    <LoginFeatureAuditDialog
      v-if="isShowFeatureAuditDialog"
      :loginAuditId="currentLoginAuditId"
      @close="closeFeatureAuditDialog"
    ></LoginFeatureAuditDialog>
  </div>
</template>
<script>
import download from '@/resources/mixins/download.js';
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue'),
    CombineSearcher: () => import('@/resources/components/CombineSearcher/CombineSearcher.vue'),
    AuditConfig: () => import('@/views/components/auditconfig/auditconfig.vue'),
    LoginFeatureAuditDialog: () => import('./login-feature-audit-dialog.vue')
  },
  mixins: [download],
  props: {},
  data() {
    return {
      searchValue: {
        dateRange: {
          timeRange: 1,
          timeUnit: 'day',
          startTime: null,
          endTime: null
        }
      },
      searchConfig: {
        searchList: [
          {
            type: 'timeselect',
            name: 'dateRange',
            label: this.$t('page.date'),
            transfer: true,
            clearable: false
          },
          {
            type: 'select',
            name: 'teamUuidList',
            label: this.$t('page.userteam'),
            multiple: true,
            search: true,
            dynamicUrl: '/api/rest/team/search/forselect',
            rootName: 'list',
            textName: 'text',
            valueName: 'value',
            transfer: true
          },
          {
            type: 'select',
            name: 'moduleGroupList',
            label: this.$t('page.module'),
            multiple: true,
            search: true,
            url: '/api/rest/module/search',
            textName: 'groupName',
            valueName: 'group',
            transfer: true,
            onChange: moduleGroupList => {
              const featureConfig = this.searchConfig.searchList.find(item => item.name == 'featureNameList');
              if (featureConfig) {
                featureConfig.params.moduleGroupList = moduleGroupList || [];
              }
              if (this.searchValue && this.searchValue.featureNameList) {
                this.$delete(this.searchValue, 'featureNameList');
              }
            }
          },
          {
            type: 'select',
            name: 'featureNameList',
            label: this.$t('page.feature'),
            multiple: true,
            search: true,
            dynamicUrl: '/api/rest/feature/search',
            params: { moduleGroupList: [] },
            rootName: 'tbodyList',
            textName: 'featureName',
            valueName: 'featureName',
            transfer: true,
            dealDataByUrl: nodeList => this.getFeatureSelectList(nodeList)
          }
        ]
      },
      searchParam: {
        keyword: '',
        currentPage: 1,
        pageSize: 20,
        timeRange: null,
        timeUnit: '',
        startTime: null,
        endTime: null,
        teamUuidList: [],
        moduleGroupList: [],
        featureNameList: []
      },
      theadList: [
        {
          key: 'userUuid',
          title: this.$t('page.user')
        },
        {
          key: 'teamNameList',
          title: this.$t('page.userteam'),
          width: 420
        },
        {
          key: 'ip',
          title: 'IP'
        },
        {
          key: 'loginTime',
          title: this.$t('term.framework.logintime'),
          type: 'time'
        },
        {
          key: 'loginMethod',
          title: this.$t('term.framework.loginmethod')
        },
        {
          key: 'action',
          title: '',
          align: 'right',
          width: 10
        }
      ],
      tableData: [],
      isShowFeatureAuditDialog: false,
      currentLoginAuditId: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchUserLoginList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getSearchParam() {
      const { keyword = '', dateRange = null, teamUuidList = [], moduleGroupList = [], featureNameList = [] } = this.searchValue || {};
      return {
        keyword,
        timeRange: dateRange ? dateRange.timeRange : null,
        timeUnit: dateRange ? dateRange.timeUnit : null,
        startTime: dateRange ? dateRange.startTime : null,
        endTime: dateRange ? dateRange.endTime : null,
        teamUuidList: teamUuidList || [],
        moduleGroupList: moduleGroupList || [],
        featureNameList: featureNameList || []
      };
    },
    searchUserLoginList() {
      this.searchParam = {
        ...this.searchParam,
        ...this.getSearchParam()
      };
      this.$api.framework.loginaudit.searchLoginList(this.searchParam).then(res => {
        if (res.Status == 'OK') {
          this.tableData = res.Return;
          this.updateFeatureAuditActiveRow();
        }
      });
    },
    changePage(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      } else {
        this.searchParam.currentPage = 1;
      }
      this.searchUserLoginList();
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchParam.currentPage = 1;
      this.searchUserLoginList();
    },
    exportLoginAudit() {
      this.download({
        url: 'api/binary/login/audit/export',
        params: this.getSearchParam()
      });
    },
    openFeatureAuditDialog(row) {
      this.currentLoginAuditId = row.id;
      this.updateFeatureAuditActiveRow();
      this.isShowFeatureAuditDialog = true;
    },
    closeFeatureAuditDialog() {
      this.isShowFeatureAuditDialog = false;
      this.currentLoginAuditId = null;
      this.updateFeatureAuditActiveRow();
    },
    updateFeatureAuditActiveRow() {
      // 使用情况弹框打开时，将来源行置灰，帮助用户识别当前查看的是哪一条登录记录。
      if (this.tableData && this.tableData.tbodyList && this.tableData.tbodyList.length > 0) {
        this.tableData.tbodyList.forEach(row => {
          this.$set(row, 'rowClass', row.id === this.currentLoginAuditId ? 'login-feature-audit-active' : '');
        });
      }
    },
    getFeatureSelectList(nodeList) {
      const featureNameSet = new Set();
      const featureList = [];
      (nodeList || []).forEach(item => {
        if (item && item.featureName && !featureNameSet.has(item.featureName)) {
          featureNameSet.add(item.featureName);
          featureList.push(item);
        }
      });
      return featureList;
    },
    showTableList(val) {
      let list = [];
      if (val && val.length > 0) {
        for (let i = 0; i < val.length; i++) {
          list.push(val[i]);
          if (i >= 2) {
            break;
          }
        }
      }
      return list;
    },
    showRestText(list) {
      return list.slice(3);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.login-search {
  width: 100%;
  min-width: 280px;
}
::v-deep .login-feature-audit-active > td {
  background-color: rgba(0, 0, 0, 0.06);
}
</style>
