<template>
  <div class="leftmenu">
    <div :class="isSlider ? 'menubar slider' : 'menubar'">
      <div class="menu_content">
        <div class="menu_link">
          <ul>
            <li class="link">
              <a href="javascript:void(0)" class="tsfont-plus text-primary" @click="toAddDashboard">
                <span class="text-primary">{{ $t('page.new') }}</span>
              </a>
            </li>
          </ul>
        </div>
        <div v-if="menulist">
          <div v-for="(menus, ind) in menulist" :key="ind" class="menu_link">
            <div
              v-if="menus.isFirst"
              class="link"
              :class="{ active: $isMenuActive(menus.url) }"
              @click="goTo(menus.url ? menus.url : '/')"
              @contextmenu="newTab($event, menus, menus.url ? menus.url : '/')"
            >
              <!-- <router-link :to="menus.url ? menus.url : '/'" :class="menus.icon">{{ menus.name }}</router-link>-->
              <a class="cursor" :class="menus.icon">{{ menus.name }}</a>
            </div>
            <div v-else-if="menus && menus.length > 0">
              <div class="title text-grey">{{ menutype[ind] }}</div>
              <ul>
                <li
                  v-for="(menu, mindex) in menus"
                  :key="mindex"
                  class="link"
                  :class="{ active: $isMenuActive(menu.url) }"
                  @click="goTo(menu.url ? menu.url : '/')"
                  @contextmenu="newTab($event, menu, menu.url ? menu.url : '/')"
                >
                  <a class="cursor" :class="menu.icon">{{ menu.name }}</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div :class="menushow ? 'toggle-btn ts-angle-left' : 'toggle-btn ts-bars'" @click="menuToggle()"></div>
    </div>
  </div>
</template>

<script>
import LeftMenu from '@/views/components/leftmenu/leftmenu';
export default {
  name: 'LeftMenu',
  components: {},
  extends: LeftMenu,
  beforecreated() {},
  created() {},
  beforeMount() {},
  mounted() {},
  methods: {
    toAddDashboard() {
      this.$router.push({
        path: '/dashboard-edit'
      });
    },
    getMenuList: function(operationType) {
      const menugroup = { overview: [], topvisit: [] };
      this.menulist = {};
      this.menutype = MENUTYPE;
      // 仪表板概览（所有和我的）
      menugroup.overview = [];
      if (this.$AuthUtils.hasRole('DASHBOARD_MODIFY')) {
        menugroup.overview.push({
          icon: 'tsfont-blocklist',
          name: this.$t('term.dashboard.dashboardmanage'),
          url: '/dashboard-manage'
        });
      }
      // 仪表板列表
      if (this.$AuthUtils.hasRole('DASHBOARD_BASE')) {
        this.$api.dashboard.dashboard.searchDashboard({ limit: 6 }).then(res => {
          if (res.Status == 'OK') {
            if (res.Return && res.Return.tbodyList && res.Return.tbodyList.length > 0) {
              res.Return.tbodyList.forEach(re => {
                menugroup.topvisit.push({
                  icon: 'tsfont-type',
                  name: re.name,
                  url: '/dashboard-detail/' + re.id
                });
              });
            }
            if (menugroup.topvisit && menugroup.topvisit.length > 0 && (operationType == 'add' || operationType == 'del')) {
              this.$route.meta.fromPageList = [];
              this.$router.replace({
                path: menugroup.topvisit[0].url // 新增删除才选第一个
              });
            }
            if (!this.$utils.isEmpty(this.moduleList) && this.$route.fullPath && operationType == 'del') {
              let module = this.moduleList.find((v) => v.moduleId == 'dashboard' && v.isDefault == 1 && v.defaultPage == this.$route.fullPath);
              if (module) {
                module.defaultPage = '';
                module.isDefault = 0;
                this.$store.commit('setModuleList', this.moduleList);
                this.saveDefaultPageOnline();
                this.$router.replace({
                  path: '/welcome'
                });
              }
            }
            this.menulist = menugroup;
          }
        });
      }
    },
    saveDefaultPageOnline() {
      const moduleList = this.moduleList.map(module => {
        const { moduleId: group, isDefault, defaultPage } = module;
        return { group, isDefault, defaultPage };
      });
      const param = {
        defaultModulePageList: moduleList,
        type: 'defaultModulePage'
      };
      this.$api.framework.user.saveDefaultPage(param);
    }
  },
  computed: {
    moduleList() {
      return this.$store.state.topMenu.moduleList;
    }
  },
  watch: {
    '$store.state.leftMenu.dashboardCount': function(newvalue, oldValue) {
      let operationType = newvalue == oldValue ? 'edit' : newvalue - oldValue > 0 ? 'add' : 'del';
      this.getMenuList(operationType);
    }
  }
};
</script>
