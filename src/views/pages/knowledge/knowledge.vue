<template>
  <div v-if="hasAuthorization" class="home" :class="{ 'menu-min': !isMenuExpanded }">
    <TopNav></TopNav>
    <LeftMenu @menuToggle="menuToggle">
      <KnowledgeMenu></KnowledgeMenu>
    </LeftMenu>
    <div class="centermain">
      <div>
        <keep-alive max="10" :include="['KnowledgeOverview','KnowledgeSearch']">
          <router-view
            v-if="isRouterAlive"
            :key="$route.fullPath"
            ref="root"
            style="height:100%;overflow: auto;"
          ></router-view>
        </keep-alive>
      </div>
    </div>
    <LicenseValidator></LicenseValidator>
  </div>
</template>
<script>
export default {
  name: 'Home',
  provide() {
    return {
      reloadRouter: this.reloadRouter
    };
  },
  components: {
    TopNav: () => import('@/views/components/topnav/topnav.vue'),
    LeftMenu: () => import('@/views/components/leftmenu/leftmenu.vue'),
    KnowledgeMenu: () => import('./leftmenu/knowledge-menu.vue'),
    LicenseValidator: () => import('@/views/components/license/license-validator.vue')
  },
  data() {
    return {
      isMenuExpanded: false, //左侧菜单是否展开
      hasAuthorization: true,
      isRouterAlive: true
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  methods: {
    //菜单显示隐藏
    menuToggle(isMenuExpanded) {
      this.isMenuExpanded = isMenuExpanded;
    },
    reloadRouter() { //切换多语言时，刷新路由
      this.isRouterAlive = false;
      this.$store.dispatch('getModuleList');
      this.$nextTick(() => {
        this.isRouterAlive = true;
        location.reload();
      });
    }
  },
  watch: {}
};
</script>
