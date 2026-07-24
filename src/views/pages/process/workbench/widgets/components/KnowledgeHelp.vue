<template>
  <KnowledgeList
    :items="sourceList"
    :config="config"
    :title="title"
    :showTitle="showTitle"
    :loading="loading"
    :error="error"
    actionText="知识库"
    @select="handleSelect"
  ></KnowledgeList>
</template>

<script>
import KnowledgeList from './KnowledgeList.vue';

export default {
  name: 'KnowledgeHelp',
  components: { KnowledgeList },
  props: {
    widget: { type: Object },
    title: { type: String, default: '知识帮助' },
    showTitle: { type: Boolean, default: true },
    config: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      loading: false,
      error: '',
      sourceList: []
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
