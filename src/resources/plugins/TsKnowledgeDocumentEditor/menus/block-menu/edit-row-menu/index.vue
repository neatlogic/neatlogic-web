<template>
  <div>
    <Dropdown
      :placement="menuType === 'text' ? 'bottom-start' : 'right'"
      @on-click="handleClick"
    >
      <div
        class="knowledge-document-editor-plus-box"
        @mouseenter="handleEnter"
        @mouseleave="handleLeave"
      >
        <span :class="getFontClassName" class="text-href" style="margin-right: -5px;"></span>
        <span class="tsfont-option-vertical cursor-pointer"></span>
      </div>
      <DropdownMenu slot="list">
        <template v-if="menuType === 'text'">
          <TextMenu :node-config="nodeConfig" @click-menu="handleClickMenu" @insert-below-position="insertBelowPosition" />
        </template>
        <template v-else-if="atomNodeList.includes(menuType)">
          <AtomMenu :node-config="nodeConfig" @click-menu="handleClickMenu" @insert-below-position="insertBelowPosition" />
        </template>
      </DropdownMenu>
    </Dropdown>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TextMenu: () => import('./src/text/index.vue'),
    AtomMenu: () => import('./src/atom/index.vue')
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
    return {
      atomNodeList: ['image', 'insertVideo', 'table', 'horizontalRule'] // 不可编辑的节点
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
    handleClick(name) {
      this.$emit('click-menu', { commandName: name, options: {...this.nodeConfig || {}} });
    },
    handleClickMenu(menuData) {
      this.$emit('click-menu', menuData);
    },
    insertBelowPosition(menuData) {
      this.$emit('insert-below-position', menuData);
    },
    handleEnter(e) {
      this.$emit('handleMouse', true);
    },
    handleLeave(e) {
      this.$emit('handleMouse', false);
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
        orderedList: 'tsfont-orderlist',
        table: 'tsfont-chart-table',
        image: 'tsfont-image',
        insertVideo: 'tsfont-play-o'
      };
      const { type, attrs = {} } = this.nodeConfig || {};
      if (type == 'heading') {
        return classNameMap[`heading${attrs.level}`];
      } else {
        return classNameMap[type];
      }
    },
    menuType() {
      const { type } = this.nodeConfig || {};
      if (this.atomNodeList.includes(type)) {
        return type;
      } else {
        return 'text';
      }
    }
  },
  watch: {}
};
</script>
<style lang="less">
@import "@/resources/plugins/TsKnowledgeDocumentEditor/menus/block-menu/common.less";
</style>
