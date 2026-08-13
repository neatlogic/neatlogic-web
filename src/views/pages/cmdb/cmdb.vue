<template>
  <ModuleBaseLayout>
    <template #leftMenu>
      <CmdbMenu></CmdbMenu>
    </template>
  </ModuleBaseLayout>
</template>
<script>
export default {
  name: 'Home',
  components: {
    ModuleBaseLayout: () => import('@/views/components/layout/module-base-layout.vue'),
    CmdbMenu: () => import('./leftmenu/cmdb-menu.vue')
  }
};
</script>
