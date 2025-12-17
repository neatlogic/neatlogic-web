<template>
  <div>
    <Dropdown placement="bottom-start" @on-click="handleClick">
      <div class="knowledge-document-editor-plus-box">
        <span :class="getFontClassName" class="text-href"></span>
        <span class="tsfont-drag cursor-pointer"></span>
      </div>
      <DropdownMenu slot="list">
        <DropdownItem class="clear-dropdown-item-hover-background">
          <BaseMenu
            :hideBaseText="true"
            :removeMenuList="[]"
            :nodeConfig="nodeConfig"
            @click-menu="emitClickMenu"
          ></BaseMenu>
        </DropdownItem>
        <DropdownItem class="knowledge-document-editor-dropdown-item-divide">
          <div class="border-base-bottom"></div>
        </DropdownItem>
        <AlignMenu @click-menu="emitClickMenu"></AlignMenu>
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
        <InsertedBelowMenu placement="right" @click-menu="insertBelowPosition"></InsertedBelowMenu>
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
  computed: {
    getFontClassName() {
      const classNameMap = {
        heading1: 'tsfont-h1',
        heading2: 'tsfont-h2',
        heading3: 'tsfont-h3',
        heading4: 'tsfont-h4',
        heading5: 'tsfont-h5',
        heading6: 'tsfont-h6',
        paragraph: 'tsfont-title',
        horizontalRule: 'tsfont-divider',
        highlightBlock: 'tsfont-callout',
        blockquote: 'tsfont-quote',
        codeBlock: 'tsfont-code',
        taskList: 'tsfont-check-square-o',
        bulletList: 'tsfont-list',
        orderedList: 'tsfont-orderlist'
      };
      const { type, attrs = {} } = this.nodeConfig || {};
      if (type == 'heading') {
        return classNameMap[`heading${attrs.level}`];
      } else {
        return classNameMap[type];
      }
    }
  },
  watch: {}
};
</script>
<style lang="less">
@import "@/resources/plugins/TsKnowledgeDocumentEditor/menus/block-menu/common.less";
</style>
