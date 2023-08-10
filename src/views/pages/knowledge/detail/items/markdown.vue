<template>
  <section
    :data_id="uuid"
    type="markdown"
    contenteditable="false"
    z-index="0"
    @paste.stop.prevent
  >
    <MarkdownEditor v-model="value" mode="read"></MarkdownEditor>
  </section>
</template>
<script>
export default {
  name: '',
  components: {
    MarkdownEditor: resolve => require(['pages/knowledge/common/markdown-editor.vue'], resolve)
  },
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
  methods: {},
  computed: {},
  watch: {}
};
</script>
<style>

</style>
<style lang="less" scoped>
 section {
  position: relative;
}
</style>
