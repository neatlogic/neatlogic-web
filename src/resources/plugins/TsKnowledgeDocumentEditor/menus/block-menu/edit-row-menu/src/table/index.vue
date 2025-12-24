<template>
  <div style="width: 200px;">
    <DropdownItem name="deleteRange">
      <span class="tsfont-trash-o mr-nm knowledge-document-editor-menu-icon"></span>
      <span>删除</span>
    </DropdownItem>
    <InsertedBelowMenu placement="right" @click-menu="insertBelowPosition"></InsertedBelowMenu>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    InsertedBelowMenu: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/menus/block-menu/empty-row-menu/index.vue')
  },
  props: {
    nodeConfig: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data() {
    return {};
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
    emitClickMenu(menuData) {
      this.$emit('click-menu', menuData);
    },
    handleClick(name) {
      this.$emit('click-menu', { commandName: name });
    },
    insertBelowPosition(menuData) {
      this.$emit('insert-below-position', menuData);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
@import "@/resources/plugins/TsKnowledgeDocumentEditor/menus/block-menu/common.less";
</style>
