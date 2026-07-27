<template>
  <ModuleBaseLayout>
    <template #leftMenu>
      <RdmMenu></RdmMenu>
    </template>
  </ModuleBaseLayout>
</template>
<script>
export default {
  name: 'Home',
  components: {
    ModuleBaseLayout: () => import('@/views/components/layout/module-base-layout.vue'),
    RdmMenu: () => import('./leftmenu/rdm-menu.vue')
  }
};
</script>
