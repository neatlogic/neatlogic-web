<template>
  <section
    :data_id="uuid"
    type="markdown"
    contenteditable="false"
    class="knowledge-markdown-container"
    @contextmenu.prevent
    @keydown.stop
    @paste.stop
    @click="
      event => {
        event.stopPropagation();
      }
    "
  >
    <MarkdownEditor v-model="value"></MarkdownEditor>
    <span
      ref="editorSpan"
      class="editorSpan"
      contenteditable
      @keydown.stop="complexComHandlerKeydown"
      @input.stop="complexComHandlerKeydown"
    ></span>
  </section>
</template>
<script>
export default {
  name: '',
  components: {
    MarkdownEditor: () => import('pages/knowledge/common/markdown-editor.vue')
  },
  filters: {},
  props: {
    uuid: String,
    handler: String,
    content: String,
    config: Object
  },
  data() {
    return {
      value: this.content
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
    getContent() {
      return {content: this.value};
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
 section {
  position: relative;
  .editorSpan{
    position: absolute;
    right: 1px;
    bottom: 0px;
    width: 3px;
    height: 24px;
    outline: none;
    z-index: 3;
  }
}
</style>
