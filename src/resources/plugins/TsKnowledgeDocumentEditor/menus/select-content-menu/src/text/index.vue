<template>
  <div style="width: 100%;display: flex;gap: 10px;">
    <component
      :is="item.type"
      v-for="(item,index) in componentList"
      :key="`${item.type}_${index}`"
      :node-config="nodeConfig"
      :selected-text="selectedText"
      v-bind="item"
      @menu-item-selected="(data)=> {
        $emit('menu-item-selected', data)
      }"
    ></component>
  </div>
</template>
<script>
import mixin from '@/resources/plugins/TsKnowledgeDocumentEditor/menus/select-content-menu/src/mixin.js';
export default {
  name: '',
  components: {
    BaseMenu: () => import('../common/base-menu.vue'),
    ColorDropdown: () => import('../common/color-dropdown.vue'),
    DivideMenu: () => import('../common/divide-menu.vue'),
    AlignmentDropdown: () => import('../common/alignment-dropdown.vue'),
    BlockTypeDropdown: () => import('../common/block-type-dropdown.vue'),
    LinkMenu: () => import('../common/link-menu.vue')
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
