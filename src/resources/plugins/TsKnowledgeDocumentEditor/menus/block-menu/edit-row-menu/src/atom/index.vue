<template>
  <div style="width: 200px;">
    <DropdownMenu slot="list">
      <DropdownItem name="deleteRange">
        <span class="tsfont-trash-o mr-nm knowledge-document-editor-menu-icon"></span>
        <span>删除</span>
      </DropdownItem>
      <DropdownItem class="knowledge-document-editor-dropdown-item-divide">
        <div class="border-base-bottom"></div>
      </DropdownItem>
      <InsertedBelowMenu placement="right" @click-menu="insertBelowPosition"></InsertedBelowMenu>
    </DropdownMenu>
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
