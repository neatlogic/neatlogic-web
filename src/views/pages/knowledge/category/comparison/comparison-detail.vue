<template>
  <div class="comparison-main compare">
    <slot name="top"></slot>
    <div class="comparison-detail">
      <loading :loadingShow="taskLoading" type="fix"></loading>
      <KnowledgeEditor
        ref="compareEditor"
        :compare-mode="true"
        :old-document-vo="oldDocumentVo"
        :new-document-vo="newDocumentVo"
        :compare-side="compareSide"
        :readonly="true"
        :can-edit-title="false"
        :can-edit-content="false"
        :can-edit-tag="false"
        :can-edit-attachment="false"
        :show-header="true"
        :show-debug-button="false"
        @updateMouseover="getMouseover"
        @updateScrollTop="getScroll"
      ></KnowledgeEditor>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    KnowledgeEditor: () => import('@/views/pages/knowledge/category/knowledgeeditor/index.vue')
  },
  filters: {},
  props: {
    config: { type: Object, default: null },
    navWidth: { type: String, default: '200px' },
    oldDocumentVo: { type: Object, default: null },
    newDocumentVo: { type: Object, default: null },
    compareSide: { type: String, default: 'new' }
  },
  data() {
    return {
      taskLoading: true
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getMouseover() {
      this.$emit('updateMouseover');
    },
    getScroll(scrollTop) {
      this.$emit('updateScrollTop', scrollTop);
    },
    setScroll(scrollTop) {
      this.$refs.compareEditor && this.$refs.compareEditor.setScroll(scrollTop);
    }
  },
  watch: {
    oldDocumentVo: {
      handler(val) {
        if (val) {
          this.taskLoading = false;
        }
      },
      deep: true,
      immediate: true
    },
    newDocumentVo: {
      handler(val) {
        if (val) {
          this.taskLoading = false;
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
@import '~@/resources/assets/css/compare.less';
.comparison-main {
  width: 100%;
  height: 100%;
  .nav-top {
    padding: 16px 16px 10px 16px;
  }
}
.comparison-detail {
  position: relative;
  width: 100%;
  height: calc(100% - 40px);
}
</style>
