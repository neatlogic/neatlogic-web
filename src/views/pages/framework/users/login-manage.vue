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
        <TsRow>
          <Col :span="12">
            <TimeSelect
              v-model="timeParams"
              :clearable="false"
              @change="changePage(1)"
            />
          </Col>
          <Col :span="12">
            <InputSearcher
              v-model="searchParam.keyword"
              @change="changePage(1)"
            ></InputSearcher>
          </Col>
        </TsRow>
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
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    TimeSelect: () => import('@/resources/components/TimeSelect/TimeSelect'),
    AuditConfig: () => import('@/views/components/auditconfig/auditconfig.vue')
  },
  props: {},
  data() {
    return {
      searchParam: {
        keyword: '',
        currentPage: 1,
        pageSize: 20,
        timeRange: null,
        timeUnit: '',
        startTime: null,
        endTime: null
      },
      timeParams: {
        timeRange: 1,
        timeUnit: 'day',
        startTime: null,
        endTime: null
      },
      theadList: [
        {
          key: 'userUuid',
          title: this.$t('page.user')
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
      this.searchParam.timeRange = this.timeParams.timeRange;
      this.searchParam.timeUnit = this.timeParams.timeUnit;
      this.searchParam.startTime = this.timeParams.startTime;
      this.searchParam.endTime = this.timeParams.endTime;
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
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
