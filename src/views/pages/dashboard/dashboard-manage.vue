<!--仪表板管理 -->
<template>
  <div class="dashboard-manage">
    <TsContain border="border">
      <template v-slot:topLeft>
        <div class="action-group">
          <span class="tsfont-plus action-item" @click="toDashboardPage()">{{ $t('term.dashboard.dashboard') }}</span>
          <span
            class="tsfont-upload action-item"
            @click="uploadAction()"
          >{{ $t('page.import') }}</span>
          <span class="tsfont-download action-item" @click="exportDashboard()">{{ $t('page.export') }}</span>
        </div>
      </template>
      <div slot="topRight">
        <CombineSearcher v-model="searchVal" v-bind="searchConfig" @change="searchDashboard(1)"></CombineSearcher>
      </div>
      <div slot="content">
        <TsCard
          v-if="dashboardData.tbodyList && dashboardData.tbodyList.length > 0"
          :padding="false"
          v-bind="dashboardData"
          :xxl="8"
          :xl="12"
          :lg="12"
          :md="24"
          :sm="24"
          :xs="24"
          @updatePage="searchDashboard"
        >
          <template slot="header" slot-scope="{ row }">
            <div class="dashboard-card-header">
              <div class="dashboard-card-heading">
                <div class="dashboard-card-title overflow">{{ row.name }}</div>
                <div class="dashboard-card-meta text-grey">
                  <span>
                    <UserCard v-bind="row.lcuVo" hideAvatar class="m-users"></UserCard>
                  </span>
                  <span>{{ $t('page.in') }}：</span>
                  <span v-if="row.lcd">{{ row.lcd | formatDate }}</span>
                  <span v-else>{{ row.fcd | formatDate }}</span>
                  <span v-if="row.lcd">{{ $t('page.update') }}</span>
                  <span v-else>{{ $t('page.created') }}</span>
                </div>
              </div>
              <div class="dashboard-card-actions">
                <span
                  class="dashboard-enter tsfont-search text-action"
                  role="button"
                  tabindex="0"
                  :title="$t('page.viewdetails')"
                  :aria-label="$t('page.viewdetails')"
                  @click.stop="toDashboard('detail', row.id)"
                  @keydown.enter.stop="toDashboard('detail', row.id)"
                ></span>
              </div>
            </div>
          </template>
          <template slot-scope="{ row }">
            <div class="dashbord-overview" @click="toDashboard('detail', row.id)">
              <widget-overview
                v-if="row.widgetList && row.widgetList.length > 0"
                :widgetList="row.widgetList"
              ></widget-overview>
              <div v-if="row.description" class="slider-container text-op">
                <div>{{ row.description }}</div>
              </div>
            </div>
          </template>
          <template slot="control" slot-scope="{ row }">
            <template v-if="isCanEdit(row)">
              <div class="action-item" @click="toDashboard('edit', row.id)">
                <span class="text-action tsfont-edit">{{ $t('page.edit') }}</span>
              </div>
              <div class="action-item" @click="copyDashboard(row)">
                <span class="text-action tsfont-copy">{{ $t('page.copy') }}</span>
              </div>
              <div class="action-item" @click="deleteDashboard(row)">
                <span class="text-action tsfont-trash-o">{{ $t('page.delete') }}</span>
              </div>
            </template>
            <template v-else>
              <div class="action-item disable" :title="$t('page.operatewithoutpermission')">
                <div class="text-action tsfont-edit text-disabled">{{ $t('page.edit') }}</div>
              </div>
              <div class="action-item disable">
                <span class="text-action tsfont-copy text-disabled">{{ $t('page.copy') }}</span>
              </div>
              <div class="action-item disable" :title="$t('page.operatewithoutpermission')">
                <div class="text-action tsfont-trash-o text-disabled">{{ $t('page.delete') }}</div>
              </div>
            </template>
          </template>
        </TsCard>
        <NoData v-else></NoData>
      </div>
    </TsContain>
    <UploadDialog
      ref="uploadDialog"
      :actionUrl="actionUrl"
      :formatList="formatList"
      :showSuccessNotice="false"
      :isValid="true"
      @on-success="searchDashboard(1)"
    />
  </div>
</template>

<script>
import download from '@/resources/mixins/download.js';
export default {
  name: '',
  components: {
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue'),
    TsCard: () => import('@/resources/components/TsCard/TsCard.vue'),
    WidgetOverview: () => import('./widget/widget-overview.vue'),
    CombineSearcher: () => import('@/resources/components/CombineSearcher/CombineSearcher.vue'),
    UploadDialog: () => import('@/resources/components/UploadDialog/UploadDialog.vue')
  },
  mixins: [download],
  props: [],
  data() {
    return {
      dashboardData: {
        classname: 'dashboard-container'
      },
      searchParam: {
        currentPage: 1,
        pageSize: 24,
        needPage: true
      },
      searchVal: {},
      searchConfig: {
        searchMode: 'clickBtnSearch',
        labelPosition: 'left',
        placeholder: this.$t('page.insert') + this.$t('page.name'),
        searchList: [
          {
            type: 'radio',
            name: 'searchType',
            label: this.$t('page.type'),
            dataList: [
              { value: 'system', text: this.$t('term.dashboard.systemdashboard') },
              { value: 'custom', text: this.$t('term.dashboard.personaldashboard') }
            ]
          }
        ]
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
  beforeDestroy() {
    this.$route.meta.fromPageList = []; // 点击到编辑页面，去掉当前仪表盘管理页面高亮
  },
  destroyed() {},
  methods: {
    isCanEdit(dashboard) {
      return (dashboard.type == 'system' && this.$AuthUtils.hasRole('DASHBOARD_MODIFY')) || (dashboard.type == 'custom' && dashboard.fcu == this.$AuthUtils.getCurrentUser().uuid);
    },
    toDashboard: function(type, id) {
      if (id) {
        this.$router.push({
          path: '/dashboard-' + type + '/' + id
        });
      } else {
        this.$router.push({
          path: '/dashboard-' + type + '/'
        });
      }
    },
    copyDashboard(dashboard) {
      this.$router.push({name: 'dashboard-edit', params: {dashboard: dashboard}});
    },
    toDashboardPage() {
      this.$router.push({
        path: '/dashboard-edit'
      });
    },
    searchDashboard: function(page) {
      if (page) {
        this.searchParam.currentPage = page;
      }
      this.$api.dashboard.dashboard.searchDashboard({...this.searchParam, ...this.searchVal}).then(res => {
        if (res.Status == 'OK') {
          this.dashboardData = res.Return;
        }
      });
    },
    deleteDashboard: function(item) {
      const id = item.id;
      const name = item.name;
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deletetargetconfirm', {'target': name}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.dashboard.dashboard.deleteDashboard(id).then(res => {
            if (res.Status == 'OK') {
              vnode.isShow = false;
              this.$Message.success(this.$t('message.deletesuccess'));
              this.$store.commit('leftMenu/setDashboardCount', 'minus');
              this.searchDashboard();
            }
          });
        }
      });
    },
    exportDashboard() {
      let param = {
        url: 'api/binary/dashboard/export',
        params: {...this.searchParam, ...this.searchVal}
      };
      this.download(param);
    },
    uploadAction() {
      this.$refs.uploadDialog.showDialog();
    }
  },
  computed: {
  },
  watch: {}
};
</script>

<style lang="less">
@import '~@/views/pages/dashboard/dashboard-manage.less';
</style>
