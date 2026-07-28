<template>
  <ModuleBaseLayout :has-authorization="hasAuthorization">
    <template #leftMenu>
      <DashboardMenu></DashboardMenu>
    </template>
  </ModuleBaseLayout>
</template>
<script>
export default {
  name: 'Home',
  components: {
    ModuleBaseLayout: () => import('@/views/components/layout/module-base-layout.vue'),
    DashboardMenu: () => import('./leftmenu/dashboard-menu.vue')
  },
  computed: {
    hasAuthorization() {
      return !this.$utils.isEmpty(this.$AuthUtils.getCurrentUser());
    }
  }
};
</script>
