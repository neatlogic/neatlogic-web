<template>
  <div style="width: 236px;">
    <DropdownMenu slot="list" class="knowledge-document-editor-edit-row-menu">
      <DropdownItem name="cut">
        <span class="tsfont-cut mr-nm knowledge-document-editor-menu-icon"></span>
        <span>剪切</span>
      </DropdownItem>
      <DropdownItem name="copy">
        <span class="tsfont-copy mr-nm knowledge-document-editor-menu-icon"></span>
        <span>复制</span>
      </DropdownItem>
      <DropdownItem name="deleteRange">
        <span class="tsfont-trash-o mr-nm knowledge-document-editor-menu-icon"></span>
        <span>删除</span>
      </DropdownItem>
      <DropdownItem class="knowledge-document-editor-dropdown-item-divide">
        <div class="border-base-bottom"></div>
      </DropdownItem>
      <InsertedBelowMenu
        placement="right"
        @click-menu="insertBelowPosition"
        @dropdown-visible-change="status => $emit('dropdown-visible-change', status)"
      ></InsertedBelowMenu>
    </DropdownMenu>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    InsertedBelowMenu: () => import('@/views/pages/knowledge/category/knowledgeeditor/menus/block-menu/empty-row-menu/index.vue')
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
@import "@/views/pages/knowledge/category/knowledgeeditor/menus/block-menu/common.less";
</style>
