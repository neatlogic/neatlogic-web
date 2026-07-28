<template>
  <ModuleBaseLayout>
    <template #leftMenu>
      <AutoexecMenu></AutoexecMenu>
    </template>
  </ModuleBaseLayout>
</template>
<script>
export default {
  name: 'AutoexecHome',
  components: {
    ModuleBaseLayout: () => import('@/views/components/layout/module-base-layout.vue'),
    AutoexecMenu: () => import('./leftmenu/autoexec-menu')
  }
};
</script>
