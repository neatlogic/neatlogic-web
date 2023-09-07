<template>
  <div class="OverviewMenu menu_link">
    <div>
      <div class="title text-grey">
        {{ $t('term.cmdb.customview') }}
      </div>
      <ul>
        <li class="link">
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
        </li>
        <li
          v-for="customview in allCustomViewList"
          :key="customview.id"
          class="link"
          :class="{ active: $isMenuActive('/view-data/' + customview.id) || $isMenuActive('/graph-data/' + customview.id) || $isMenuActive('/graph-datav2/' + customview.id) }"
          @click="goToView(customview)"
          @contextmenu="newTab($event, customview, customview._type === 'data' ? '/view-data/' : '/graph-data/' + customview.id)"
        >
          <!--<router-link :to="'/view-data/'+customview.id" :class="customview.icon">{{ customview.name }}</router-link>-->
          <a class="cursor" :class="customview.icon">{{ customview.name }}</a>
        </li>
      </ul>
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
            @click="goTo(menu.url)"
            @contextmenu="newTab($event, menu, menu.url ? menu.url : '/')"
          >
            <!-- <router-link :to="menu.url ? menu.url : '/'" :class="menu.icon" @click.native="goTo()">{{ menu.name }}</router-link> -->
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
  extends: LeftMenu,

  data: function() {
    return {
      customViewList: [],
      graphList: []
    };
  },
  created() {
    this.$store.dispatch('updateCmdbMenu');
  },
  mounted() {
    this.getCustomView();
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
    async getCustomView() {
      await this.$api.cmdb.customview.searchCustomView({ needPage: false, isActive: 1 }).then(res => {
        this.customViewList = res.Return.tbodyList;
      });
      await this.$api.cmdb.graph.searchGraph({ needPage: false, isActive: 1, hasParent: false }).then(res => {
        this.graphList = res.Return.tbodyList;
      });
    }
  },
  computed: {
    dataList() {
      return this.$store.state.topMenu.dynamicMenu.cmdb;
    },
    allCustomViewList() {
      const allCustomViewList = [];
      if (this.customViewList && this.customViewList.length > 0) {
        this.customViewList.forEach(c => {
          allCustomViewList.push({ ...c, _type: 'data' });
        });
      }
      if (this.graphList && this.graphList.length > 0) {
        this.graphList.forEach(g => {
          allCustomViewList.push({ ...g, _type: 'topo' });
        });
      }
      allCustomViewList.sort((a, b) => {
        return b.id - a.id;
      });
      return allCustomViewList;
    }
  },
  watch: {
    '$store.state.leftMenu.cmdbCustomViewCount'(newvalue) {
      this.getCustomView();
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';

.OverviewMenu {
  padding-top: 8px;
}
</style>
