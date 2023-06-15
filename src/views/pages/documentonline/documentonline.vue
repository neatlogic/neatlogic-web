<template>
  <div>
    <div v-if="hasAuthorization" class="home" :class="{ 'menu-min': !showmenu }">
      <TopNav></TopNav>
      <div class="centermain">
        <div>
          <router-view v-if="isRouterAlive" :key="$route.fullPath" style="height:100%;overflow: auto;"></router-view>
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
    TopNav: resolve => require(['./topnav/topnav.vue'], resolve),
    LicenseValidator: resolve => require(['@/views/components/license/license-validator.vue'], resolve)
  },
  data() {
    return {
      showmenu: false, //菜单收起时的class
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
 max-width: 1100px;
 margin: 0 auto;
}
</style>
