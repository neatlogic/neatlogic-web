<template>
  <WorkbenchCard
    :title="title"
    subtitle="返回最近使用的业务功能"
    icon="tsfont-history"
    tone="info"
    :empty="displayList.length === 0"
  >
    <WorkbenchActionList :items="displayList" dense></WorkbenchActionList>
  </WorkbenchCard>
</template>

<script>
import WorkbenchCard from './workbench-card.vue';
import WorkbenchActionList from '@/views/components/portal/components/display/WorkbenchActionList.vue';

export default {
  name: 'CommonRecentAccess',
  components: {
    WorkbenchCard,
    WorkbenchActionList
  },
  props: {
    title: { type: String, default: '最近访问' },
    config: { type: Object, default: () => ({}) }
  },
  methods: {
    getHref(item) {
      return `${HOME}/${item.moduleId}.html#${item.fullPath}`;
    },
    getModuleName(moduleId) {
      return this.moduleNameMap[moduleId] || moduleId;
    }
  },
  computed: {
    recentList() {
      let historyMap = {};
      try {
        historyMap = JSON.parse(sessionStorage.getItem('moduleFromPage')) || {};
      } catch (error) {
        historyMap = {};
      }
      const result = [];
      Object.keys(historyMap).forEach(moduleId => {
        (historyMap[moduleId] || []).forEach(item => {
          if (item && item.fullPath) {
            result.push({ ...item, moduleId });
          }
        });
      });
      return result.reverse();
    },
    visibleList() {
      const list = MODULEID && MODULEID !== 'index'
        ? this.recentList.filter(item => item.moduleId === MODULEID)
        : this.recentList;
      return list.slice(0, Math.max(1, Number(this.config.limit) || 5));
    },
    displayList() {
      return this.visibleList.map((item, index) => ({
        id: `${item.moduleId}-${item.fullPath}-${index}`,
        title: item.title || item.name || '最近访问页面',
        description: this.getModuleName(item.moduleId),
        icon: 'tsfont-time',
        tone: 'info',
        href: this.getHref(item)
      }));
    },
    moduleNameMap() {
      return (this.$store.state.topMenu.moduleList || []).reduce((map, module) => {
        map[module.moduleId] = this.$t(module.moduleName);
        return map;
      }, {});
    }
  }
};
</script>
