<template>
  <ModuleBaseLayout class="help-center-layout" :has-left-menu="false">
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
<style lang="less">
@import (reference) '~@/resources/assets/css/variable.less';

// 在帮助中心根节点定义主题色，由导航、目录和文档页共用。
.help-center-layout {
  --help-surface: @default-op;
  --help-background: @default-table-stripe-color;
  --help-ink: @default-text;
  --help-muted: @text-color;
  --help-border: @default-border;
  --help-hover: @default-menu-hover;
  --help-accent: var(--primary-color, @default-primary-color);
  --help-accent-soft: var(--primary-grey, @default-primary-grey);
  --help-shadow: @default-main-shadow;
  --help-overlay: @default-mongolia;

  min-width: 0;
  background: var(--help-background);
  color: var(--help-ink);
}
.theme-dark .help-center-layout {
  --help-surface: @dark-op;
  --help-background: @dark-gray;
  --help-ink: @dark-text;
  --help-muted: @dark-title;
  --help-border: @dark-border;
  --help-hover: @dark-menu-hover;
  --help-accent: var(--primary-color, @dark-primary-color);
  --help-accent-soft: var(--primary-grey, @dark-primary-bg-color);
  --help-shadow: @dark-main-shadow;
  --help-overlay: @dark-mongolia;
}
</style>
