<!--仪表板管理 -->
<template>
  <div class="dashboard-manage">
    <TsContain>
      <template v-slot:topLeft>
        <AppTab v-if="appId && projectId" :appId="appId" :projectId="projectId"></AppTab>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <span class="action-item" @click="addDashboard()">
            <Button type="success">
              <span class="tsfont-plus">{{ $t('term.dashboard.dashboard') }}</span>
            </Button>
          </span>
        </div>
      </template>
      <template v-slot:content>
        <!-- <div class="mb-md grid">
          <div></div>
          <div><InputSearcher v-model="searchParam.keyword" @change="searchDashboard()"></InputSearcher></div>
        </div>-->
        <TsCard
          v-if="dashboardData.tbodyList && dashboardData.tbodyList.length > 0"
          :padding="false"
          v-bind="dashboardData"
          :xl="6"
          :sm="8"
          :xs="24"
          @updatePage="searchDashboard"
        >
          <template slot="header" slot-scope="{ row }">
            <div class="overflow h3">{{ row.name }}</div>
          </template>
          <template slot-scope="{ row }">
            <div class="action-group" style="text-align: right">
              <span v-if="row.lcd" class="action-item fz10 text-grey">{{ row.lcd | formatDate }}</span>
              <span v-else class="action-item fz10 text-grey">{{ row.fcd | formatDate }}</span>
            </div>
            <div class="dashbord-overview" @click="toDashboardDetail(row.id)">
              <widget-overview v-if="row.widgetList.length > 0" :widgetList="row.widgetList"></widget-overview>
              <div class="slider-container text-op">
                <div>{{ row.description }}</div>
                <div class="icon-enter tsfont-search"></div>
              </div>
            </div>
          </template>
          <template slot="control" slot-scope="{ row }">
            <div class="action-item" @click="editDashboard(row.id)">
              <span class="text-action tsfont-edit">{{ $t('page.edit') }}</span>
            </div>
            <div class="action-item" @click="copyDashboard(row)">
              <span class="text-action tsfont-copy">{{ $t('page.copy') }}</span>
            </div>
            <div class="action-item" @click="deleteDashboard(row)">
              <span class="text-action tsfont-trash-o">{{ $t('page.delete') }}</span>
            </div>
          </template>
        </TsCard>
        <NoData v-else></NoData>
      </template>
    </TsContain>
  </div>
</template>

<script>
import mixins from '@/views/pages/rdm/project/viewtab/issue-mixin.js';

import download from '@/resources/mixins/download.js';
export default {
  name: '',
  components: {
    AppTab: () => import('@/views/pages/rdm/project/viewtab/components/app-tab.vue'),
    TsCard: () => import('@/resources/components/TsCard/TsCard.vue'),
    WidgetOverview: () => import('@/views/pages/dashboard/widget/widget-overview.vue')
    //InputSearcher:()=>import('@/resources/components/InputSearcher/InputSearcher.vue'),
  },
  mixins: [download, mixins],
  props: [],
  data() {
    return {
      pageName: this.$t('term.dashboard.dashboard'),
      dashboardData: {
        classname: 'dashboard-container'
      },
      searchParam: {
        currentPage: 1,
        pageSize: 24,
        needPage: true,
        keyword: ''
      },
      actionUrl: BASEURLPREFIX + '/api/binary/dashboard/import', //导入地址
      formatList: ['pak'] //导入文件格式
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchDashboard(1);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    addDashboard() {
      this.$router.push({ path: '/dashboard-edit/' + this.projectId + '/' + this.appId });
    },
    toDashboardDetail(id) {
      this.$router.push({ path: '/dashboard-detail/' + this.projectId + '/' + this.appId + '/' + id });
    },
    editDashboard(id) {
      this.$router.push({ path: '/dashboard-edit/' + this.projectId + '/' + this.appId + '/' + id });
    },
    copyDashboard(dashboard) {
      this.$router.push({
        name: 'dashboardEdit',
        params: {
          projectId: this.projectId,
          appId: this.appId,
          dashboard: dashboard
        }
      });
    },
    searchDashboard(page) {
      if (page) {
        this.searchParam.currentPage = page;
      }
      this.searchParam.appId = this.appId;
      this.$api.rdm.dashboard.searchDashboard(this.searchParam).then(res => {
        if (res.Status == 'OK') {
          this.dashboardData = res.Return;
        }
      });
    },
    deleteDashboard(item) {
      const id = item.id;
      const name = item.name;
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deletetargetconfirm', { target: name }),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.rdm.dashboard.deleteDashboard(id).then(res => {
            if (res.Status == 'OK') {
              vnode.isShow = false;
              this.$Message.success(this.$t('message.deletesuccess'));
              this.searchDashboard();
            }
          });
        }
      });
    }
  },
  computed: {},
  watch: {}
};
</script>

<style lang="less" scoped>
@import '~@/views/pages/dashboard/dashboard-manage.less';
.grid {
  display: grid;
  grid-template-columns: 60% 40%;
}
</style>
