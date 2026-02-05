<template>
  <div style="width: 100%; display: flex; gap: 10px">
    <component
      :is="item.type"
      v-for="(item, index) in componentList"
      :key="`${item.type}_${index}`"
      v-bind="item"
      :node-config="nodeConfig"
      @menu-item-selected="(config)=> {
        $emit('menu-item-selected', config)
      }"
    >
    </component>
  </div>
</template>
<script>
import mixin from '@/resources/plugins/TsKnowledgeDocumentEditor/menus/select-content-menu/src/mixin.js';
import { CellSelection } from 'prosemirror-tables';
import { isMergedCell } from '@/resources/plugins/TsKnowledgeDocumentEditor/commands/table/selection-utils.js';
export default {
  name: '',
  components: {
    BaseMenu: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/menus/select-content-menu/src/common/base-menu.vue'),
    ColorDropdown: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/menus/select-content-menu/src/common/color-dropdown.vue'),
    DivideMenu: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/menus/select-content-menu/src/common/divide-menu.vue'),
    AlignmentDropdown: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/menus/select-content-menu/src/common/alignment-dropdown.vue'),
    InsertColumnLeft: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/menus/select-content-menu/src/table/insert-column-left.vue'),
    InsertColumnRight: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/menus/select-content-menu/src/table/insert-column-right.vue'),
    InsertRowTop: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/menus/select-content-menu/src/table/insert-row-top.vue'),
    InsertRowBottom: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/menus/select-content-menu/src/table/insert-row-bottom.vue'),
    CellBackground: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/menus/select-content-menu/src/table/cell-background.vue')
  },
  mixins: [mixin],
  props: {},
  data() {
    return {
      baseComponentList: [
        {
          type: 'AlignmentDropdown',
          icon: 'tsfont-text-align-left',
          hideVerticalAlign: true
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
      const { state } = this.editorData || {};
      const selection = state?.selection || '';
      
      const commonList = [
        {
          type: 'CellBackground'
        }
      ];
      if (type == 'row') {
        return [
          ...[
        
            {
              type: 'BaseMenu',
              icon: 'tsfont-table-merge-cell',
              command: 'mergeCell',
              tipContentList: ['合并单元格']
            },
            {
              type: 'BaseMenu',
              icon: 'tsfont-table-split-cell',
              tipContentList: ['拆分单元格'],
              command: 'splitCell'
            },
            {
              type: 'DivideMenu'
            },
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
            },
            ...commonList
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
          {
            type: 'BaseMenu',
            icon: 'tsfont-table-merge-cell',
            command: 'mergeCell',
            tipContentList: ['合并单元格']
          },
          {
            type: 'BaseMenu',
            icon: 'tsfont-table-split-cell',
            tipContentList: ['拆分单元格'],
            command: 'splitCell'
          },
          {
            type: 'DivideMenu'
          },
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
          ...commonList,
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
      } else if (selection && selection instanceof CellSelection && selection.$anchorCell.pos !== selection.$headCell.pos && selection.ranges.length > 1) {
        //选中多个单元格
        return [
          {
            type: 'BaseMenu',
            icon: 'tsfont-table-merge-cell',
            command: 'mergeCell',
            tipContentList: ['合并单元格']
          },
          {
            type: 'BaseMenu',
            icon: 'tsfont-table-split-cell',
            tipContentList: ['拆分单元格'],
            command: 'splitRow'
          },
          ...this.baseComponentList,
          ...commonList
        ];
      } else if (isMergedCell(this.editorData)) {
        return [
          {
            type: 'BaseMenu',
            icon: 'tsfont-table-split-cell',
            tipContentList: ['拆分单元格'],
            command: 'splitRow'
          },
          ...this.baseComponentList
        ];
      }
      return [...this.baseComponentList, ...commonList];
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
