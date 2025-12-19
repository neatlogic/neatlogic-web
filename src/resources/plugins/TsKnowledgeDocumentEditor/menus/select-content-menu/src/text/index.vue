<template>
  <div style="width: 100%;display: flex;gap: 10px;">
    <component
      :is="item.type"
      v-for="(item,index) in componentList"
      :key="`${item.type}_${index}`"
      v-bind="item"
    ></component>
  </div>
</template>
<script>
import mixin from '@/resources/plugins/TsKnowledgeDocumentEditor/menus/select-content-menu/src/mixin.js';
export default {
  name: '',
  components: {
    BaseMenu: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/menus/select-content-menu/src/common/base-menu.vue'),
    ColorDropdown: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/menus/select-content-menu/src/common/color-dropdown.vue'),
    DivideMenu: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/menus/select-content-menu/src/common/divide-menu.vue'),
    AlignmentDropdown: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/menus/select-content-menu/src/common/alignment-dropdown.vue'),
    BlockTypeDropdown: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/menus/select-content-menu/src/common/block-type-dropdown.vue'),
    LinkMenu: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/menus/select-content-menu/src/common/link-menu.vue')
  },
  mixins: [mixin],
  props: {},
  data() {
    return {
      componentList: [
        {
          type: 'BlockTypeDropdown',
          icon: 'tsfont-title'
        },
        {
          type: 'DivideMenu'
        },
        {
          type: 'AlignmentDropdown',
          icon: 'tsfont-text-align-left'
        },
        {
          type: 'DivideMenu'
        },
        {
          type: 'BaseMenu',
          icon: 'tsfont-bold',
          tipContentList: ['粗体 (Ctrl + B)', 'Markdown：**文本** 空格'],
          command: 'bold'
        },
        {
          type: 'BaseMenu',
          icon: 'tsfont-text-delete',
          tipContentList: ['删除线 (Ctrl + Shift + S)', 'Markdown：~~文本~~ 空格'],
          command: 'strike'
        },
        {
          type: 'BaseMenu',
          icon: 'tsfont-italic',
          tipContentList: ['倾斜 (Ctrl + I)', 'Markdown：*文本* 空格'],
          command: 'italic'
        },
        {
          type: 'BaseMenu',
          icon: 'tsfont-underline',
          tipContentList: ['下划线 (ctrl + U)', 'Markdown ~文本~ 空格'],
          command: 'underline'
        },
        {
          type: 'LinkMenu'
        },
        {
          type: 'BaseMenu',
          icon: 'tsfont-code',
          tipContentList: ['代码 (ctrl + shift + c)', 'Markdown ~代码~'],
          command: 'code'
        },
        {
          type: 'ColorDropdown',
          icon: 'tsfont-font-color'
        },
        {
          type: 'DivideMenu'
        }
       
      ]
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
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
