<template>
  <div style="width: 100%; display: flex; gap: 10px">
    <component
      :is="item.type"
      v-for="(item, index) in componentList"
      :key="`${item.type}_${index}`"
      v-bind="item"
      :nodeConfig="nodeConfig"
      @executeEditorCommand="(config)=> {
        $emit('executeEditorCommand', config)
      }"
    >
    </component>
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
    TextAlignDropdown: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/menus/select-content-menu/src/common/text-align-dropdown.vue'),
    BlockTypeDropdown: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/menus/select-content-menu/src/common/block-type-dropdown.vue'),
    InsertColumnLeft: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/menus/select-content-menu/src/table/insert-column-left.vue'),
    InsertColumnRight: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/menus/select-content-menu/src/table/insert-column-right.vue'),
    InsertRowTop: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/menus/select-content-menu/src/table/insert-row-top.vue'),
    InsertRowBottom: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/menus/select-content-menu/src/table/insert-row-bottom.vue')
  },
  mixins: [mixin],
  props: {},
  data() {
    return {
      baseComponentList: [
        {
          type: 'BlockTypeDropdown',
          icon: 'tsfont-title'
        },
        {
          type: 'DivideMenu'
        },
        {
          type: 'TextAlignDropdown',
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
          type: 'BaseMenu',
          icon: 'tsfont-code',
          tipContentList: ['代码 (ctrl + shift + c)', 'Markdown ~代码~'],
          command: 'code'
        },
        {
          type: 'ColorDropdown',
          icon: 'tsfont-font-color'
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
  computed: {
    componentList() {
      const { type } = this.nodeConfig || {};
      const mergeOrSplitList = [
        {
          type: 'BaseMenu',
          icon: 'tsfont-table-merge-cell',
          command: 'mergeOrSplit',
          tipContentList: ['合并单元格']
        },
        {
          type: 'BaseMenu',
          icon: 'tsfont-table-split-cell',
          tipContentList: ['拆分单元格'],
          command: 'mergeOrSplit'
        },
        {
          type: 'DivideMenu'
        }
      ];
      if (type == 'row') {
        return [
          ...[
            ...mergeOrSplitList,
            {
              type: 'InsertRowTop',
              tipContentList: ['上方插入一行'],
              command: 'insertRow',
              params: {
                direction: 'top'
              }
            },
            {
              type: 'InsertRowBottom',
              tipContentList: ['下方插入一行'],
              command: 'insertRow',
              params: {
                direction: 'bottom'
              }
            },
            {
              type: 'DivideMenu'
            }
          ],
          ...this.baseComponentList,
          ...[
            {
              type: 'BaseMenu',
              icon: 'tsfont-trash-o',
              command: 'deleteRow',
              tipContentList: ['删除行']
            }
          ]
        ];
      } else if (type === 'column') {
        return [
          ...mergeOrSplitList,
          ...[
            {
              type: 'InsertColumnLeft',
              tipContentList: ['左边插入一列'],
              command: 'insertColumn',
              params: {
                direction: 'left'
              }
            },
            {
              type: 'InsertColumnRight',
              tipContentList: ['右边插入一列'],
              command: 'insertColumn',
              params: {
                direction: 'right'
              }
            },
            {
              type: 'DivideMenu'
            }
          ],
          ...this.baseComponentList,
          ...[
            {
              type: 'DivideMenu'
            },
            {
              type: 'BaseMenu',
              icon: 'tsfont-trash-o',
              command: 'deleteColumn',
              tipContentList: ['删除列']
            }
          ]
        ];
      }
      return this.baseComponentList;
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
