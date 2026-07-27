<template>
  <ModuleBaseLayout :has-left-menu="false" :centermain-style="{ padding: '0 20%' }">
    <template #topNav>
      <DocumentTopNav></DocumentTopNav>
    </template>
  </ModuleBaseLayout>
</template>
<script>
export default {
  name: 'Home',
  components: {
    ModuleBaseLayout: () => import('@/views/components/layout/module-base-layout.vue'),
    DocumentTopNav: () => import('./topnav/topnav.vue')
  }
};
</script>
