<template>
  <section
    :data_id="uuid"
    type="markdown"
    contenteditable="false"
    z-index="0"
    @paste.stop.prevent
  >
    <div ref="editorEditor" class="editor-editor" contenteditable="false">
      <mavon-editor v-model="value" class="mavon-markdown-editor-container" v-bind="markdownOption"></mavon-editor>
    </div>
  </section>
</template>
<script>
export default {
  name: '',
  components: {},
  filters: {},
  mixins: {},
  props: {
    uuid: String,
    handler: String,
    content: String,
    config: Object,
    changeType: String
  },
  data() {
    return {
      value: this.content,
      markdownOption: {
        subfield: false, // 单栏(编辑预览分屏)
        toolbarsFlag: false, // 工具栏不显示
        defaultOpen: 'preview'
      }
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
  methods: {},
  computed: {},
  watch: {}
};
</script>
<style>
.knowledge-markdown img {
  max-width: 200px;
}
.mavon-markdown-editor-container .v-note-show {
  overflow-y: hidden !important;
}
</style>
<style lang="less" scoped>
 section {
  position: relative;
  .editor-editor{
    position: relative;
  }
}
</style>
