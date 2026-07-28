<template>
  <ModuleBaseLayout>
    <template #leftMenu>
      <ReportMenu></ReportMenu>
    </template>
  </ModuleBaseLayout>
</template>
<script>
export default {
  name: 'Home',
  components: {
    ModuleBaseLayout: () => import('@/views/components/layout/module-base-layout.vue'),
    ReportMenu: () => import('./leftmenu/report-menu.vue')
  }
};
</script>
