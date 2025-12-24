<template>
  <div>
    <Dropdown placement="right" @on-click="handleClick">
      <div class="knowledge-document-editor-plus-box">
        <span :class="getFontClassName" class="text-href" style="margin-right: -5px;"></span>
        <span class="tsfont-option-vertical cursor-pointer"></span>
      </div>
      <DropdownMenu slot="list">
        <template v-if="menuType === 'text'">
          <TextMenu />
        </template>
        <template v-else-if="menuType === 'table'">
          <TableMenu />
        </template>
        <template v-else-if="menuType === 'image'">
          <ImageMenu />
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
    TableMenu: () => import('./src/table/index.vue'),
    ImageMenu: () => import('./src/image/index.vue')
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
      console.log('handleClick', name);
      // this.$emit('click-menu', { commandName: name });
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
        orderedList: 'tsfont-orderlist',
        table: 'tsfont-chart-table',
        image: 'tsfont-image',
        video: 'tsfont-play-o'
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
      const mapList = ['table', 'image', 'video'];
      if (mapList.includes(type)) {
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
