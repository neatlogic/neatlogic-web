<template>
  <ModuleBaseLayout
    :class="{'document-detail-layout': $route.name === 'documentonline-detail'}"
    :has-left-menu="false"
    :centermain-style="{ padding: $route.name === 'documentonline-detail' ? '0' : '0 20%' }"
  >
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
<style lang="less" scoped>
.document-detail-layout {
  // 公共 .home 的 1024px 最小宽度会阻止文档正文随窄窗口继续收缩。
  min-width: 500px;
}
</style>
