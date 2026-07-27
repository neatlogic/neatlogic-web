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
    return {
      loading: false,
      error: '',
      // 案例数据，后续接入接口后替换
      sourceList: [
        { title: '如何提交服务申请？', category: '服务台', count: 128 }
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
