<template>
  <div v-if="hasAuthorization" class="home" :class="{ 'menu-min': !showmenu }">
    <TopNav></TopNav>
    <LeftMenu :showmenu="showmenu" @menushow="menuToggle">
      <ProcessMenu></ProcessMenu>
    </LeftMenu>
    <div class="centermain">
      <div v-if="isRouterAlive">
        <keep-alive>
          <router-view
            v-if="$route.meta.keepAlive"
            :key="$route.fullPath"
            ref="root"
            style="height:100%;overflow: auto;"
          ></router-view>
        </keep-alive>
        <router-view
          v-if="!$route.meta.keepAlive"
          :key="$route.fullPath"
          ref="root"
          style="height:100%;overflow: auto;"
        ></router-view>
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
    ProcessMenu: () => import('@/views/pages/process/leftmenu/process-menu.vue'),
    LicenseValidator: () => import('@/views/components/license/license-validator.vue')
  },
  data() {
    return {
      showmenu: false, //菜单收起时的class
      hasAuthorization: true,
      isTaskoverview: false,
      isRouterAlive: true
    };
  },
  created() {},
  beforeDestroy() {},
  mounted() {
    this.$store.commit('leftMenu/setIsTaskOverview', true);
  },
  methods: {
    //菜单显示隐藏
    menuToggle(data) {
      this.showmenu = data;
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
