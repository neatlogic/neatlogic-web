<template>
  <ModuleBaseLayout>
    <template #leftMenu>
      <InspectResultMenu></InspectResultMenu>
    </template>
  </ModuleBaseLayout>
</template>
<script>
export default {
  name: 'Home',
  components: {
    ModuleBaseLayout: () => import('@/views/components/layout/module-base-layout.vue'),
    InspectResultMenu: () => import('./leftmenu/inspect-result-menu')
  }
};
</script>
