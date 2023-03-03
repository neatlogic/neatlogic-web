<template>
  <div v-if="hasAuthorization" class="home" :class="{ 'menu-min': !showmenu }">
    <TopNav></TopNav>
    <LeftMenu :showmenu="showmenu" @menushow="menuToggle">
      <KnowledgeMenu></KnowledgeMenu>
    </LeftMenu>
    <div class="centermain">
      <div>
        <keep-alive max="10" :include="['KnowledgeOverview','KnowledgeSearch']">
          <router-view :key="$route.fullPath" ref="root" style="height:100%;overflow: auto;"></router-view>
        </keep-alive>
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
    LeftMenu: resolve => require(['@/views/components/leftmenu/leftmenu.vue'], resolve),
    KnowledgeMenu: resolve => require(['./leftmenu/menu.vue'], resolve),
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
