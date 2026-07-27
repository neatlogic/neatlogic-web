<template>
  <QuickEntryPanel
    :items="sourceList"
    :config="config"
    :title="title"
    :showTitle="showTitle"
    :loading="loading"
    :error="error"
    @select="handleSelect"
  ></QuickEntryPanel>
</template>

<script>
import QuickEntryPanel from './QuickEntryPanel.vue';

export default {
  name: 'ServiceCatalogEntry',
  components: { QuickEntryPanel },
  props: {
    widget: { type: Object },
    config: { type: Object, default: () => ({}) },
    title: { type: String, default: '服务目录入口' },
    showTitle: { type: Boolean, default: true }
  },
  data() {
    return {
      loading: false,
      error: '',
      // 案例数据，后续接入接口后替换
      sourceList: [
        { name: '服务目录', icon: 'tsfont-star', path: '/catalog-overview' }
      ]
    };
  },
  methods: {
    handleSelect(item) {
      if (item && item.path) {
        this.$router.push(item.path);
      }
    }
  }
};
</script>
