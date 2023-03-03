<template>
  <div v-if="hasAuthorization" class="home" :class="{ 'menu-min': !showmenu }">
    <TopNav></TopNav>
    <LeftMenu :showmenu="showmenu" @menushow="menuToggle">
      <InspectResultMenu></InspectResultMenu>
    </LeftMenu>
    <div class="centermain">
      <div>
        <router-view :key="$route.fullPath" ref="root" style="height:100%;overflow: auto;"></router-view>
      </div>
    </div>
    <LicenseValidator></LicenseValidator>
  </div>
</template>
<script>
export default {
  name: 'Home',
  components: {
    TopNav: resolve => require(['@/views/components/topnav/topnav.vue'], resolve),
    LicenseValidator: resolve => require(['@/views/components/license/license-validator.vue'], resolve),
    LeftMenu: resolve => require(['@/views/components/leftmenu/leftmenu.vue'], resolve),
    InspectResultMenu: resolve => require(['./leftmenu/inspect-result-menu'], resolve) // 巡检结果菜单
  },
  data() {
    return {
      showmenu: false, //菜单收起时的class
      hasAuthorization: true
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  methods: {
    //菜单显示隐藏
    menuToggle: function(data) {
      this.showmenu = data;
    }
  },
  watch: {}
};
</script>
