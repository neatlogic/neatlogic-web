<template>
  <KnowledgeList
    :items="sourceList"
    :config="config"
    :title="title"
    :showTitle="showTitle"
    :loading="loading"
    :error="error"
    actionText="帮助中心"
    @select="handleSelect"
  ></KnowledgeList>
</template>

<script>
import KnowledgeList from './KnowledgeList.vue';

export default {
  name: 'FaqList',
  components: { KnowledgeList },
  props: {
    widget: { type: Object },
    config: { type: Object, default: () => ({}) },
    title: { type: String, default: '常见问题' },
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
