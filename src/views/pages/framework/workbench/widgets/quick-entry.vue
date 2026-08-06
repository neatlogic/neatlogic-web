<template>
  <WorkbenchCard
    :title="title"
    :subtitle="description"
    icon="tsfont-lightning"
    tone="primary"
    :empty="visibleEntryList.length === 0"
  >
    <WorkbenchQuickGrid :items="visibleEntryList"></WorkbenchQuickGrid>
  </WorkbenchCard>
</template>

<script>
import WorkbenchCard from '@/views/components/portal/components/display/WorkbenchCard.vue';
import WorkbenchQuickGrid from '@/views/components/portal/components/display/WorkbenchQuickGrid.vue';

export default {
  name: 'FrameworkQuickEntry',
  components: {
    WorkbenchCard,
    WorkbenchQuickGrid
  },
  props: {
    title: { type: String, default: '快捷入口' },
    description: { type: String, default: '' },
    config: { type: Object, default: () => ({}) }
  },
  computed: {
    isModuleWorkbench() {
      return MODULEID && MODULEID !== 'index';
    },
    globalEntryList() {
      return (this.$store.state.topMenu.moduleList || [])
        .filter(module => module.isDisabled !== 1)
        .map(module => ({
          id: module.moduleId,
          title: this.$t(module.moduleName),
          icon: 'tsfont-module',
          tone: 'primary',
          href: `${HOME}/${module.moduleId}.html`
        }));
    },
    moduleEntryList() {
      return (this.$router.options.routes || [])
        .filter(route => route.meta && route.meta.ismenu && !route.meta.isHidden)
        .map(route => ({
          id: route.name || route.path,
          title: this.$t(route.meta.title) || route.name,
          icon: route.meta.icon || 'tsfont-list',
          tone: 'primary',
          href: `${HOME}/${MODULEID}.html#${route.path}`
        }));
    },
    visibleEntryList() {
      const limit = Math.max(3, Number(this.config.limit) || 6);
      return (this.isModuleWorkbench ? this.moduleEntryList : this.globalEntryList).slice(0, limit);
    }
  }
};
</script>
