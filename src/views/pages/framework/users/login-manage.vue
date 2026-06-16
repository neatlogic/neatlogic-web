<template>
  <div>
    <TsContain>
      <template slot="topLeft">
        <div class="action-group">
          <span v-auth="['ADMIN']" class="action-item">
            <AuditConfig auditName="LOGIN-AUDIT" :title="$t('term.framework.loginauditretentionperiod')"></AuditConfig>
          </span>
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
        </TsTable>
      </div>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue'),
    CombineSearcher: () => import('@/resources/components/CombineSearcher/CombineSearcher.vue'),
    AuditConfig: () => import('@/views/components/auditconfig/auditconfig.vue')
  },
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
        endTime: null
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
        }
      ],
      tableData: []
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
    searchUserLoginList() {
      const { keyword = '', dateRange = null } = this.searchValue || {};
      this.searchParam.keyword = keyword;
      this.searchParam.timeRange = dateRange ? dateRange.timeRange : null;
      this.searchParam.timeUnit = dateRange ? dateRange.timeUnit : null;
      this.searchParam.startTime = dateRange ? dateRange.startTime : null;
      this.searchParam.endTime = dateRange ? dateRange.endTime : null;
      this.$api.framework.loginaudit.searchLoginList(this.searchParam).then(res => {
        if (res.Status == 'OK') {
          this.tableData = res.Return;
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
</style>
