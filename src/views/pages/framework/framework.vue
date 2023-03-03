<template>
  <div v-if="hasAuthorization" class="home" :class="{ 'menu-min': !showmenu }">
    <TopNav></TopNav>
    <LeftMenu :showmenu="showmenu" @menushow="menuToggle"></LeftMenu>
    <div class="centermain">
      <router-view
        ref="root"
        :key="$route.fullPath"
        style="height:100%;overflow: auto;"
      ></router-view>
    </div>
    <LicenseValidator></LicenseValidator>
  </div>
</template>
<script>
export default {
  name: 'Home',
  components: {
    TopNav: resolve => require(['@/views/components/topnav/topnav.vue'], resolve),
    LeftMenu: resolve => require(['@/views/components/leftmenu/leftmenu.vue'], resolve),
    LicenseValidator: resolve => require(['@/views/components/license/license-validator.vue'], resolve)
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
