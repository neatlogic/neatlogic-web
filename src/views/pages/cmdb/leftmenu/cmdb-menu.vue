<template>
  <div class="OverviewMenu menu_link">
    <div>
      <div class="title text-grey">
        {{ $t('term.cmdb.customview') }}
      </div>
      <div class="link">
        <Dropdown>
          <a href="javascript:void(0)" class="tsfont-plus text-primary">
            <span class="text-primary">{{ $t('page.new') }}</span>
          </a>
          <DropdownMenu slot="list">
            <DropdownItem @click.native="addCustomView">{{ $t('term.cmdb.privatedataview') }}</DropdownItem>
            <DropdownItem v-auth="'GRAPH_MODIFY'" @click.native="addGraphView">{{ $t('term.cmdb.publicsceneview') }}</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <!-- <a class="tsfont-plus text-primary" @click="addCustomView"><span class="text-primary">自定义视图</span></a>-->
      </div>
      <Divider v-if="customViewData && customViewData.tbodyList && customViewData.tbodyList.length > 0" style="margin: 0px" orientation="left">
        <span class="text-grey fz10">{{ $t('term.cmdb.dataview') }}</span>
      </Divider>
      <div v-if="customViewData && customViewData.tbodyList && customViewData.tbodyList.length > 0" :class="{ grid: customViewData.pageCount > 1 }">
        <div v-if="customViewData.pageCount > 1">
          <VerticalPager
            :currentPage="customViewData.currentPage"
            :pageCount="customViewData.pageCount"
            @change="
              page => {
                searchCustomView(page);
              }
            "
          ></VerticalPager>
        </div>
        <div>
          <ul>
            <li
              v-for="customview in customViewData.tbodyList"
              :key="customview.id"
              class="link"
              :class="{ active: $isMenuActive('/view-data/' + customview.id) }"
              @click="goTo('/view-data/' + customview.id)"
              @contextmenu="newTab($event, customview, '/view-data/' + customview.id)"
            >
              <a class="cursor" :class="customview.icon">{{ customview.name }}</a>
            </li>
          </ul>
        </div>
      </div>
      <Divider v-if="graphData && graphData.tbodyList && graphData.tbodyList.length > 0" style="margin: 0px" orientation="left">
        <span class="text-grey fz10">{{ $t('term.cmdb.topoview') }}</span>
      </Divider>
      <div v-if="graphData && graphData.tbodyList && graphData.tbodyList.length > 0" :class="{ grid: graphData.pageCount > 1 }">
        <div v-if="graphData.pageCount > 1">
          <VerticalPager
            :currentPage="graphData.currentPage"
            :pageCount="graphData.pageCount"
            @change="
              page => {
                searchGraph(page);
              }
            "
          ></VerticalPager>
        </div>
        <div>
          <ul>
            <li
              v-for="customview in graphData.tbodyList"
              :key="customview.id"
              class="link"
              :class="{ active: $isMenuActive('/graph-data/' + customview.id) || $isMenuActive('/graph-datav2/' + customview.id) }"
              @click="goTo('/graph-data/' + customview.id)"
              @contextmenu="newTab($event, customview, '/graph-data/' + customview.id)"
            >
              <a class="cursor" :class="customview.icon">{{ customview.name }}</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <template v-if="dataList && dataList.length > 0">
      <div v-for="(menuGroup, index) in dataList" :key="index">
        <div class="title text-grey">
          {{ menuGroup.menuTypeName }}
        </div>
        <ul v-if="menuGroup.menuList && menuGroup.menuList.length > 0">
          <li
            v-for="menu in menuGroup.menuList"
            :key="menu.id"
            class="link"
            :class="{ active: $isMenuActive(menu.url) }"
            @click="goTo('/graph-data/' + customview.id)"
            @contextmenu="newTab($event, menu, menu.url ? menu.url : '/')"
          >
            <a class="cursor" :class="menu.icon">{{ menu.name }}</a>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>
<script>
import LeftMenu from '@/views/components/leftmenu/leftmenu';
export default {
  name: 'CmdbMenu',
  components: {
    VerticalPager: () => import('@/resources/plugins/VerticalPager/vertical-pager.vue')
  },
  extends: LeftMenu,
  data: function() {
    return {
      searchCustomViewData: { currentPage: 1, pageSize: 10, isActive: 1 },
      customViewPageCount: 0,
      searchGraphData: { currentPage: 1, hasParent: false, pageSize: 10, isActive: 1 },
      graphPageCount: 0,
      customViewData: {},
      graphData: {}
    };
  },
  created() {
    this.$store.dispatch('updateCmdbMenu');
  },
  mounted() {
    this.searchCustomView();
    this.searchGraph();
  },
  methods: {
    goToView(customview) {
      if (customview._type === 'data') {
        this.goTo('/view-data/' + customview.id);
      } else if (customview._type === 'topo') {
        this.goTo('/graph-data/' + customview.id);
      }
    },
    addCustomView() {
      //从左侧菜单点链接，激活清理历史标记
      this.$route.meta.clearHistory = true;
      this.$router.push({ path: '/view-edit/private' });
    },
    addGraphView() {
      //从左侧菜单点链接，激活清理历史标记
      this.$route.meta.clearHistory = true;
      this.$router.push({ path: '/graph-edit/private' });
    },
    searchCustomView(currentPage) {
      if (currentPage) {
        this.searchCustomViewData.currentPage = currentPage;
      }
      this.$api.cmdb.customview.searchCustomView(this.searchCustomViewData).then(res => {
        this.customViewData = res.Return;
      });
    },
    searchGraph(currentPage) {
      if (currentPage) {
        this.searchGraphData.currentPage = currentPage;
      }
      this.$api.cmdb.graph.searchGraph(this.searchGraphData).then(res => {
        this.graphData = res.Return;
      });
    }
  },
  computed: {
    dataList() {
      return this.$store.state.topMenu.dynamicMenu.cmdb;
    }
  },
  watch: {
    '$store.state.leftMenu.cmdbCustomViewCount'(newvalue) {
      this.searchCustomView();
      this.searchGraph();
    }
  }
};
</script>
<style lang="less" scoped>
//@import (reference) '~@/resources/assets/css/variable.less';

.OverviewMenu {
  padding-top: 8px;
}

.grid {
  display: grid;
  grid-template-columns: 23px auto;
}
</style>
