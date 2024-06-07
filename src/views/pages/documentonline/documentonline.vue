<template>
  <div>
    <div v-if="hasAuthorization" class="home menu-min">
      <TopNav></TopNav>
      <div class="centermain">
        <div>
          <router-view v-if="isRouterAlive" :key="$route.fullPath"></router-view>
        </div>
      </div>
      <LicenseValidator></LicenseValidator>
    </div>
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
    TopNav: () => import('./topnav/topnav.vue'),
    LicenseValidator: () => import('@/views/components/license/license-validator.vue')
  },
  data() {
    return {
      hasAuthorization: true,
      isRouterAlive: true
    };
  },
  beforeCreate() {},
  created() {},
  mounted() {},
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
<style lang="less" scoped>
.centermain {
  padding: 0 20%;
}
</style>
