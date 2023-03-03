<template>
  <div>
    <div v-if="hasAuthorization" class="home" :class="{ 'menu-min': !showmenu }">
      <TopNav></TopNav>
      <div class="centermain">
        <div>
          <router-view :key="$route.fullPath" style="height:100%;overflow: auto;"></router-view>
        </div>
      </div>
      <LicenseValidator></LicenseValidator>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Home',
  components: {
    TopNav: resolve => require(['@/views/components/topnav/topnav.vue'], resolve),
    LicenseValidator: resolve => require(['@/views/components/license/license-validator.vue'], resolve)
  },
  data() {
    return {
      showmenu: false, //菜单收起时的class
      hasAuthorization: true
    };
  },
  beforeCreate() {},
  created() {},
  mounted() {},
  beforeDestroy() {},
  methods: {},
  watch: {}
};
</script>
