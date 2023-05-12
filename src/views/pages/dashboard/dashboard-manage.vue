<!--仪表板管理 -->
<template>
  <div class="dashboard-manage">
    <TsContain border="border">
      <template v-slot:topLeft>
        <div class="action-group">
          <span
            class="tsfont-upload action-item"
            @click="uploadAction()"
          >{{ $t('page.import') }}</span>
          <span class="tsfont-download action-item" @click="exportDashboard()">{{ $t('page.export') }}</span>
        </div>
      </template>
      <div slot="topRight">
        <div class="controller-group" style="--children:2">
          <div>
            <TsFormRadio
              v-model="searchParam.searchType"
              :dataList="[{value:'all',text:$t('page.allofthem')},{value:'system',text:$t('term.dashboard.systemdashboard')},{value:'custom',text:$t('term.dashboard.personaldashboard')}]"
              @change="searchDashboard()"
            ></TsFormRadio>
          </div>
          <div>
            <InputSearcher
              v-model="searchParam.keyword"
              @change="searchDashboard()"
            ></InputSearcher>
          </div>
        </div>
      </div>
      <div slot="content">
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
            <div class="text-right"></div>
            <div class="overflow h3">{{ row.name }}</div>
            <div style="font-size:13px">
              <span>
                <UserCard v-bind="row.lcuVo" hideAvatar class="m-users"></UserCard>
              </span>
              <span>{{ $t('page.in') }}：</span>
              <span v-if="row.lcd">{{ row.lcd | formatDate }}</span>
              <span v-else>{{ row.fcd | formatDate }}</span>
              <span v-if="row.lcd" class="text-grey">{{ $t('page.update') }}</span>
              <span v-else class="text-grey">{{ $t('page.created') }}</span>
            </div>
          </template>
          <template slot-scope="{ row }">
            <div class="dashbord-overview" @click="toDashboard('detail', row.id)">
              <widget-overview v-if="row.widgetList.length > 0" :widgetList="row.widgetList"></widget-overview>
              <div class="slider-container text-op">
                <div>{{ row.description }}</div>
                <div class="icon-enter ts-search"></div>
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
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard.vue'], resolve),
    WidgetOverview: resolve => require(['./widget/widget-overview.vue'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    UploadDialog: resolve => require(['@/resources/components/UploadDialog/UploadDialog.vue'], resolve)
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
        needPage: true,
        keyword: '',
        searchType: 'all'
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
    searchDashboard: function(page) {
      if (page) {
        this.searchParam.currentPage = page;
      }
      this.$api.dashboard.dashboard.searchDashboard(this.searchParam).then(res => {
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
        params: this.searchParam
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
