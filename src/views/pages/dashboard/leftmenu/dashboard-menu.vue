<template>
  <div class="menu_link">
    <div>
      <ul>
        <li class="link">
          <a class="tsfont-plus text-primary" @click="toDashboardPage()">
            <span class="text-primary">{{ $t('page.new') }}</span>
          </a>
        </li>
      </ul>
    </div>
    <div v-if="dashBoardData && dashBoardData.tbodyList && dashBoardData.tbodyList.length > 0" :class="{ grid: dashBoardData.pageCount > 1 }">
      <div class="overflow">
        <div class="title text-grey">{{ menuType?.['topvisit'] }}</div>
        <ul>
          <li
            v-for="dashboardItem in dashBoardData.tbodyList"
            :key="dashboardItem.id"
            class="link"
            :class="{ active: $isMenuActive('/dashboard-detail/' + dashboardItem.id) }"
          >
            <a
              class="cursor"
              :class="dashboardItem.icon || 'tsfont-type'"
              style="position: relative"
              @click="goTo('/dashboard-detail/' + dashboardItem.id)"
            >
              <span>{{ dashboardItem.name }}</span>
            </a>
          </li>
        </ul>
      </div>
      <div v-if="dashBoardData.pageCount > 1">
        <VerticalPager
          :currentPage="dashBoardData.currentPage"
          :pageCount="dashBoardData.pageCount"
          @change="
            page => {
              searchDashboard(page);
            }
          "
        ></VerticalPager>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'DashboardMenu',
  components: {
    VerticalPager: () => import('@/resources/plugins/VerticalPager/vertical-pager.vue')
  },
  data() {
    return {
      dashBoardData: {},
      searchBashboardParam: { currentPage: 1, pageSize: 10 },
      menuType: MENUTYPE
    };
  },
  created() {
    this.searchDashboard();
  },
  mounted() {},
  methods: {
    goTo(path) {
      //从左侧菜单点链接，激活清理历史标记
      this.$route.meta.clearHistory = true;
      this.$router.push({ path: path });
    },
    searchDashboard({currentPage = '', operationType = ''} = {}) {
      if (currentPage) {
        this.searchBashboardParam.currentPage = currentPage;
      }
      this.$api.dashboard.dashboard.searchDashboard(this.searchBashboardParam).then(res => {
        this.dashBoardData = res.Return || {};
        const tbodyList = this.dashBoardData?.tbodyList || [];
        if ((operationType == 'add' || operationType == 'del') && tbodyList.length > 0) {
          this.$route.meta.fromPageList = [];
          this.$router.replace({path: '/dashboard-detail/' + tbodyList[0]?.id});// 新增和删除默认选中第一个
        }
      });
    },
    toDashboardPage() {
      this.$router.push({
        path: '/dashboard-edit'
      });
    }
  },
  computed: {},
  watch: {
    '$store.state.leftMenu.dashboardCount': function(newvalue, oldValue) {
      const operationType = newvalue == oldValue ? 'edit' : newvalue - oldValue > 0 ? 'add' : 'del';
      this.searchDashboard({currentPage: 1, operationType: operationType});
    }
  }
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: auto 23px;
}
</style>
