<template>
  <ModuleBaseLayout>
    <template #leftMenu>
      <ProcessMenu></ProcessMenu>
    </template>
  </ModuleBaseLayout>
</template>
<script>
export default {
  name: 'Home',
  components: {
    ModuleBaseLayout: () => import('@/views/components/layout/module-base-layout.vue'),
    ProcessMenu: () => import('@/views/pages/process/leftmenu/process-menu.vue')
  },
  mounted() {
    this.$store.commit('leftMenu/setIsTaskOverview', true);
  }
};
</script>
