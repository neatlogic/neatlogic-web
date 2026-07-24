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
    return { loading: false, error: '', sourceList: [] };
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
