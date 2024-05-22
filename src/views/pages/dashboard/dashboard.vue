<template>
  <div v-if="hasAuthorization" class="home" :class="{ 'menu-min': !showmenu }">
    <TopNav></TopNav>
    <LeftMenu :showmenu="showmenu" @menushow="menuToggle"></LeftMenu>
    <div class="centermain">
      <div>
        <router-view
          v-if="isRouterAlive"
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
    LeftMenu: () => import('./leftmenu/dashboard-menu.vue'),
    LicenseValidator: () => import('@/views/components/license/license-validator.vue')
  },
  data() {
    return {
      showmenu: false, //菜单收起时的class
      // hasAuthorization: true,
      path: this.$route.fullPath || null,
      isRouterAlive: true
    };
  },
  created() {
    let _this = this;
  },
  mounted() {},
  beforeDestroy() {},
  methods: {
    //菜单显示隐藏
    menuToggle: function(data) {
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
  computed: {
    hasAuthorization() {
      return !this.$utils.isEmpty(this.$AuthUtils.getCurrentUser());
    }
  },
  watch: {}
};
</script>
