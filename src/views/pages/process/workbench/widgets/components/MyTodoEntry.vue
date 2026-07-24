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
  name: 'MyTodoEntry',
  components: { QuickEntryPanel },
  props: {
    widget: { type: Object },
    config: { type: Object, default: () => ({}) },
    title: { type: String, default: '我的待办入口' },
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
