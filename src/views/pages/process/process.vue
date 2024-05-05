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
    TopNav: resolve => require(['@/views/components/topnav/topnav.vue'], resolve),
    LeftMenu: resolve => require(['@/views/components/leftmenu/leftmenu.vue'], resolve),
    ProcessMenu: resolve => require(['@/views/pages/process/leftmenu/process-menu.vue'], resolve),
    LicenseValidator: resolve => require(['@/views/components/license/license-validator.vue'], resolve)
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
