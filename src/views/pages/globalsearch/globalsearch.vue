<template>
  <div v-if="hasAuthorization" class="home menu-min">
    <TopNav></TopNav>
    <div class="centermain">
      <div>
        <router-view v-if="isRouterAlive" :key="$route.fullPath" style="height:100%;overflow: auto;"></router-view>
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
    LicenseValidator: () => import('@/views/components/license/license-validator.vue')
  },
  data() {
    return {
      hasAuthorization: true,
      isRouterAlive: true
    };
  },
  created() {},
  beforeDestroy() {},
  methods: {
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
