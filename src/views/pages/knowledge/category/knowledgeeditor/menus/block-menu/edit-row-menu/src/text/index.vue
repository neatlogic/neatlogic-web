<template>
  <DropdownMenu slot="list" class="knowledge-document-editor-edit-row-menu">
    <DropdownItem class="clear-dropdown-item-hover-background">
      <BaseMenu
        :hideBaseText="true"
        :removeMenuList="['link']"
        :nodeConfig="nodeConfig"
        @click-menu="emitClickMenu"
      ></BaseMenu>
    </DropdownItem>
    <template v-if="isShowColorMenu">
      <DropdownItem class="knowledge-document-editor-dropdown-item-divide">
        <div class="border-base-bottom"></div>
      </DropdownItem>
      <ColorMenu
        :nodeConfig="nodeConfig"
        :isShowBorderColor="true"
        @click-menu="emitClickMenu"
        @dropdown-visible-change="status => $emit('dropdown-visible-change', status)"
      ></ColorMenu>
    </template>
    <template v-else-if="isShowMenu">
      <DropdownItem class="knowledge-document-editor-dropdown-item-divide">
        <div class="border-base-bottom"></div>
      </DropdownItem>
      <AlignMenu
        @click-menu="emitClickMenu"
        @dropdown-visible-change="status => $emit('dropdown-visible-change', status)"
      ></AlignMenu>
      <ColorMenu
        :nodeConfig="nodeConfig"
        @click-menu="emitClickMenu"
        @dropdown-visible-change="status => $emit('dropdown-visible-change', status)"
      ></ColorMenu>
    </template>
  
    <DropdownItem class="knowledge-document-editor-dropdown-item-divide">
      <div class="border-base-bottom"></div>
    </DropdownItem>
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
</template>
<script>
export default {
  name: '',
  components: {
    BaseMenu: () => import('@/views/pages/knowledge/category/knowledgeeditor/menus/block-menu/empty-row-menu/base/index.vue'),
    AlignMenu: () => import('@/views/pages/knowledge/category/knowledgeeditor/menus/block-menu/edit-row-menu/src/common/align/index.vue'),
    InsertedBelowMenu: () => import('@/views/pages/knowledge/category/knowledgeeditor/menus/block-menu/empty-row-menu/index.vue'),
    ColorMenu: () => import('@/views/pages/knowledge/category/knowledgeeditor/menus/block-menu/edit-row-menu/src/common/color/index.vue')
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
    insertBelowPosition(menuData) {
      this.$emit('insert-below-position', menuData);
    }
  },
  filter: {},
  computed: {
    isShowMenu() {
      const { type } = this.nodeConfig || {};
      const disabledTypeList = ['codeBlock'];
      return !disabledTypeList.includes(type);
    },
    isShowColorMenu() {
      const { type } = this.nodeConfig || {};
      const disabledTypeList = ['callout'];
      return !!disabledTypeList.includes(type);
    }
  },
  watch: {}
};
</script>
<style lang="less">
@import "@/views/pages/knowledge/category/knowledgeeditor/menus/block-menu/common.less";
</style>
