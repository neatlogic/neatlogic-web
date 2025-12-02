<template>
  <div>
    <Dropdown placement="bottom-start">
      <div class="knowledge-document-editor-plus-box">
        <span class="tsfont-title"></span>
        <span class="tsfont-drag cursor-pointer"></span>
      </div>
      <DropdownMenu slot="list">
        <DropdownItem class="clear-dropdown-item-hover-background">
          <BaseMenu
            :hideBaseText="true"
            @click-menu="
              menuData => {
                $emit('click-menu', menuData);
              }
            "
          ></BaseMenu>
        </DropdownItem>
        <DropdownItem class="knowledge-document-editor-dropdown-item-divide">
          <div class="border-base-bottom"></div>
        </DropdownItem>
        <AlignMenu></AlignMenu>
        <DropdownItem class="knowledge-document-editor-dropdown-item-divide">
          <div class="border-base-bottom"></div>
        </DropdownItem>
        <DropdownItem>
          <span class="tsfont-close mr-nm knowledge-document-editor-menu-icon"></span>
          <span>剪切</span>
        </DropdownItem>
        <DropdownItem>
          <span class="tsfont-copy mr-nm knowledge-document-editor-menu-icon"></span>
          <span>复制</span>
        </DropdownItem>
        <DropdownItem>
          <span class="tsfont-trash-o mr-nm knowledge-document-editor-menu-icon"></span>
          <span>删除</span>
        </DropdownItem>
        <DropdownItem class="knowledge-document-editor-dropdown-item-divide">
          <div class="border-base-bottom"></div>
        </DropdownItem>
        <InsertedBelowMenu placement="right"></InsertedBelowMenu>
      </DropdownMenu>
    </Dropdown>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    BaseMenu: () => import('../empty-row-menu/base/index.vue'),
    AlignMenu: () => import('../edit-row-menu/align/index.vue'),
    InsertedBelowMenu: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/menus/block-menu/empty-row-menu/index.vue')
  },
  props: {},
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
  methods: {},
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
@import "@/resources/plugins/TsKnowledgeDocumentEditor/menus/block-menu/common.less";
</style>
