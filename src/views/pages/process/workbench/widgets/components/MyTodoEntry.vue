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
    return {
      loading: false,
      error: '',
      // 案例数据，后续接入接口后替换
      sourceList: [
        { name: '我的待办', icon: 'tsfont-task', path: '/task-overview-1' }
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
