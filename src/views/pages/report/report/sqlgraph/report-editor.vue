<template>
  <div ref="editorRef" class="report-editor" :style="{ height: height || '100%', width: width || '100%' }">
    <ReportEditorToolbar
      v-if="!readonly"
      :canUndo="canUndo"
      :canRedo="canRedo"
      :selectedCell="selectedCell"
      :isFullscreen="isFullscreen"
      @undo="undo"
      @redo="redo"
      @zoom="zoom"
      @zoom-reset="zoomReset"
      @zoom-fit="zoomFit"
      @fullscreen="toggleFullscreen"
      @delete="removeSelectedCells"
    ></ReportEditorToolbar>
    <div ref="container" class="graph-main"></div>
    <div
      v-if="showMinimap"
      ref="minimap"
      class="shadow radius-md bg-grey minimap"
    ></div>
    <RightClickMenu
      :isVisible="isRightClickMenuVisible"
      :x="rightClickX"
      :y="rightClickY"
      :menu-list="rightClickMenuList"
      @menu-click="handleRightClickMenuClick"
    ></RightClickMenu>
  </div>
</template>
<script>
import { Graph, Shape } from '@antv/x6';
import { register } from '@antv/x6-vue-shape';
import { Keyboard } from '@antv/x6-plugin-keyboard';
import { Selection } from '@antv/x6-plugin-selection';
import { Transform } from '@antv/x6-plugin-transform';
import { Dnd } from '@antv/x6-plugin-dnd';
import { Snapline } from '@antv/x6-plugin-snapline';
import { History } from '@antv/x6-plugin-history';
import { Clipboard } from '@antv/x6-plugin-clipboard';
import { MiniMap } from '@antv/x6-plugin-minimap';
import ReportTableNode from './report-table-node.vue';
import RightClickMenu from './right-click-menu.vue';
import ReportEditorToolbar from './report-editor-toolbar.vue';

export default {
  name: 'ReportEditor',
  components: {
    RightClickMenu,
    ReportEditorToolbar
  },
  props: {
    value: { type: Object },
    readonly: { type: Boolean, default: false },
    height: { type: String },
    width: { type: String },
    grid: { type: Boolean, default: true },
    panning: { type: Boolean, default: true },
    showMinimap: { type: Boolean, default: false }
  },
  data() {
    return {
      graph: null,
      dnd: null,
      miniMap: null,
      selectedCell: null,
      canUndo: false,
      canRedo: false,
      changeTimer: null,
      isSettingData: false,
      isFullscreen: false,
      isRightClickMenuVisible: false,
      rightClickX: 0,
      rightClickY: 0,
      rightClickMenuList: [],
      nodeRightClickMenuList: [
        { text: this.$t('page.delete'), value: 'delete', hotkey: 'Backspace/Delete', groupName: 'clipboard' },
        { text: this.$t('page.copy'), value: 'copy', hotkey: 'Ctrl/Cmd+C', groupName: 'clipboard' },
        { text: this.$t('page.paste'), value: 'paste', hotkey: 'Ctrl/Cmd+V', groupName: 'clipboard' }
      ],
      blankRightClickMenuList: [
        { text: this.$t('page.paste'), value: 'paste', hotkey: 'Ctrl/Cmd+V', groupName: 'clipboard' },
        { text: this.$t('page.selectall'), value: 'selectAll', hotkey: 'Ctrl/Cmd+A', groupName: 'selection' },
        { text: this.$t('page.revocation'), value: 'undo', hotkey: 'Ctrl/Cmd+Z', groupName: 'history' }
      ]
    };
  },
  created() {
    this.registerTableNode();
  },
  mounted() {
    this.init();
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange);
  },
  beforeDestroy() {
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', this.handleFullscreenChange);
    if (this.changeTimer) {
      clearTimeout(this.changeTimer);
    }
    if (this.miniMap) {
      this.miniMap.dispose();
    }
    if (this.graph) {
      this.graph.dispose();
    }
  },
  methods: {
    registerTableNode() {
      register({
        shape: 'report-table-node',
        width: 260,
        height: 340,
        component: ReportTableNode,
        ports: {
          groups: {
            left: {
              position: 'left',
              attrs: {
                circle: {
                  r: 5,
                  magnet: true,
                  stroke: '#5f95ff',
                  strokeWidth: 1,
                  fill: '#fff'
                }
              }
            },
            right: {
              position: 'right',
              attrs: {
                circle: {
                  r: 5,
                  magnet: true,
                  stroke: '#5f95ff',
                  strokeWidth: 1,
                  fill: '#fff'
                }
              }
            }
          }
        }
      }, true);
    },
    init() {
      if (this.graph) {
        return;
      }
      this.graph = new Graph({
        container: this.$refs.container,
        autoResize: true,
        panning: this.panning,
        zoomAtMousePosition: true,
        mousewheel: {
          enabled: true,
          modifiers: ['ctrl', 'meta']
        },
        grid: {
          visible: this.grid,
          type: 'dot'
        },
        interacting: () => {
          if (this.readonly) {
            return {
              nodeMovable: false,
              magnetConnectable: false,
              edgeMovable: false,
              arrowheadMovable: false,
              vertexMovable: false,
              vertexAddable: false,
              vertexDeletable: false
            };
          }
          return true;
        },
        connecting: {
          allowBlank: false,
          allowLoop: false,
          allowMulti: false,
          allowEdge: false,
          allowNode: false,
          connector: {
            name: 'rounded',
            args: { radius: 8 }
          },
          router: {
            name: 'manhattan'
          },
          snap: {
            radius: 20
          },
          createEdge: () => {
            return new Shape.Edge({
              attrs: {
                line: {
                  stroke: '#6f7c8f',
                  strokeWidth: 2,
                  targetMarker: {
                    name: 'classic',
                    width: 10,
                    height: 8
                  }
                }
              },
              data: {
                joinType: 'INNER JOIN',
                sourceTable: '',
                sourceField: '',
                targetTable: '',
                targetField: ''
              },
              zIndex: 0
            });
          },
          validateConnection: ({ sourceCell, targetCell }) => {
            if (!sourceCell || !targetCell || sourceCell.id === targetCell.id) {
              return false;
            }
            return !this.graph.getEdges().some(edge => {
              return edge.getSourceCellId() === sourceCell.id && edge.getTargetCellId() === targetCell.id;
            });
          }
        }
      });
      this.installPlugins();
      this.bindGraphEvents();
      if (this.value) {
        this.setGraphData(this.value);
      }
      this.$emit('ready', this.graph);
    },
    installPlugins() {
      this.graph.use(new Keyboard({ enabled: true }));
      this.graph.use(new Snapline({ enabled: true }));
      if (!this.readonly) {
        this.graph.use(new History({ enabled: true }));
        this.graph.use(new Clipboard({ enabled: true }));
        this.graph.use(new Selection({
          enabled: true,
          multiple: true,
          multipleSelectionModifiers: ['ctrl', 'meta'],
          rubberband: true,
          showNodeSelectionBox: true,
          showEdgeSelectionBox: false,
          pointerEvents: 'none'
        }));
        this.graph.use(new Transform({ resizing: false }));
      } else {
        this.graph.use(new Selection({
          enabled: true,
          multiple: false,
          rubberband: false,
          movable: false,
          showNodeSelectionBox: false,
          showEdgeSelectionBox: false,
          pointerEvents: 'none'
        }));
      }
      if (this.showMinimap) {
        this.$nextTick(() => {
          this.miniMap = new MiniMap({ container: this.$refs.minimap });
          this.graph.use(this.miniMap);
        });
      }
      this.dnd = new Dnd({
        target: this.graph,
        getDragNode: node => node.clone({ keepId: true }),
        getDropNode: node => node.clone({ keepId: true })
      });
    },
    bindGraphEvents() {
      this.graph.on('node:selected', ({ node }) => {
        this.selectedCell = node;
        this.$emit('node:selected', node.getData(), node);
      });
      this.graph.on('node:unselected', ({ node }) => {
        if (this.selectedCell && this.selectedCell.id === node.id) {
          this.selectedCell = null;
          this.$emit('node:unselected');
        }
      });
      this.graph.on('edge:selected', ({ edge }) => {
        this.selectedCell = edge;
        this.$emit('edge:selected', edge);
      });
      this.graph.on('edge:unselected', ({ edge }) => {
        if (this.selectedCell && this.selectedCell.id === edge.id) {
          this.selectedCell = null;
          this.$emit('edge:unselected', edge);
        }
      });
      this.graph.on('edge:connected', ({ edge }) => {
        this.fillJoinData(edge);
        this.$emit('join:change', edge.getData(), edge);
        this.emitChange();
      });
      this.graph.on('cell:change:data', ({ cell }) => {
        if (cell && cell.isEdge()) {
          this.$emit('join:change', cell.getData(), cell);
        }
        this.emitChange();
      });
      this.graph.on('cell:removed', this.emitChange);
      this.graph.on('node:change:position', this.emitChange);
      this.graph.on('history:change', () => {
        this.canUndo = this.graph.canUndo();
        this.canRedo = this.graph.canRedo();
      });
      this.graph.on('blank:contextmenu', ({ e }) => {
        if (this.readonly) {
          return;
        }
        this.rightClickMenuList = this.blankRightClickMenuList;
        this.showRightClickMenu(e);
      });
      this.graph.on('node:contextmenu', ({ e, node }) => {
        if (this.readonly) {
          return;
        }
        this.graph.cleanSelection();
        this.graph.select(node);
        this.rightClickMenuList = this.nodeRightClickMenuList;
        this.showRightClickMenu(e);
      });
      const bindShortcut = (keys, callback) => {
        keys.forEach(key => {
          this.graph.bindKey(key, () => {
            if (this.readonly) {
              return false;
            }
            callback();
            this.hideRightClickMenu();
            return false;
          });
        });
      };
      bindShortcut(['ctrl+a', 'command+a'], this.selectAll);
      bindShortcut(['ctrl+c', 'command+c'], this.copy);
      bindShortcut(['ctrl+v', 'command+v'], this.paste);
      bindShortcut(['ctrl+z', 'command+z'], this.undo);
      bindShortcut(['ctrl+y', 'command+y'], this.redo);
      bindShortcut(['delete', 'backspace'], this.removeSelectedCells);
    },
    startDrag(table, event) {
      if (!this.dnd || this.readonly) {
        return;
      }
      const node = this.createTableNode(table, { x: 0, y: 0 });
      this.dnd.start(node, event);
    },
    addTableNode(table, position) {
      if (!this.graph || this.readonly) {
        return null;
      }
      const p = position || this.graph.clientToLocal({ x: 280, y: 180 });
      const node = this.createTableNode(table, p);
      this.graph.addNode(node);
      this.graph.select(node);
      this.emitChange();
      return node;
    },
    createTableNode(table, position) {
      const tableName = table.tableName || table.name;
      const data = {
        moduleId: table.moduleId,
        tableName: tableName,
        alias: table.alias || this.getNextAlias(),
        label: table.label,
        fields: table.fields || [],
        indexes: table.indexes || []
      };
      const height = Math.min(360, Math.max(150, 62 + data.fields.slice(0, 12).length * 22 + (data.fields.length > 12 ? 22 : 0)));
      return this.graph.createNode({
        shape: 'report-table-node',
        x: position.x,
        y: position.y,
        width: 260,
        height: height,
        data: data,
        ports: [
          { id: 'left', group: 'left' },
          { id: 'right', group: 'right' }
        ]
      });
    },
    getNextAlias() {
      let index = this.graph ? this.graph.getNodes().length + 1 : 1;
      let alias = 't' + index;
      const aliasSet = new Set((this.graph ? this.graph.getNodes() : []).map(node => node.getData().alias));
      while (aliasSet.has(alias)) {
        index += 1;
        alias = 't' + index;
      }
      return alias;
    },
    fillJoinData(edge) {
      const sourceNode = edge.getSourceNode();
      const targetNode = edge.getTargetNode();
      if (!sourceNode || !targetNode) {
        return;
      }
      const sourceData = sourceNode.getData();
      const targetData = targetNode.getData();
      const sourceField = this.findDefaultJoinField(sourceData, targetData);
      const targetField = this.findDefaultJoinField(targetData, sourceData);
      edge.setData({
        joinType: 'INNER JOIN',
        sourceTable: sourceData.alias,
        sourceField: sourceField,
        targetTable: targetData.alias,
        targetField: targetField
      });
    },
    findDefaultJoinField(fromTable, toTable) {
      const fields = fromTable.fields || [];
      const targetName = (toTable.tableName || '').replace(/_/g, '');
      const idField = fields.find(field => field.name === 'id');
      const directField = fields.find(field => field.name === `${toTable.tableName}_id` || field.name === `${toTable.tableName}_uuid`);
      const fuzzyField = fields.find(field => field.name.replace(/_/g, '').indexOf(targetName) >= 0 && /(_id|_uuid)$/.test(field.name));
      return (directField || fuzzyField || idField || fields[0] || {}).name || '';
    },
    getGraph() {
      return this.graph;
    },
    getGraphData() {
      if (!this.graph) {
        return { version: 1, nodes: [], joins: [] };
      }
      const nodes = this.graph.getNodes().map(node => {
        return {
          id: node.id,
          data: node.getData(),
          position: node.getPosition(),
          size: node.getSize()
        };
      });
      const joins = this.graph.getEdges().map(edge => {
        return {
          id: edge.id,
          source: edge.getSourceCellId(),
          target: edge.getTargetCellId(),
          data: edge.getData(),
          vertices: edge.getVertices()
        };
      });
      return { version: 1, nodes, joins };
    },
    setGraphData(data) {
      if (!this.graph) {
        return;
      }
      this.isSettingData = true;
      this.graph.clearCells();
      const nodeMap = {};
      (data.nodes || []).forEach(nodeData => {
        const dataObj = nodeData.data || nodeData;
        const node = this.graph.addNode({
          id: nodeData.id,
          shape: 'report-table-node',
          x: (nodeData.position || {}).x || nodeData.x || 40,
          y: (nodeData.position || {}).y || nodeData.y || 40,
          width: (nodeData.size || {}).width || 260,
          height: (nodeData.size || {}).height || 260,
          data: dataObj,
          ports: [
            { id: 'left', group: 'left' },
            { id: 'right', group: 'right' }
          ]
        });
        nodeMap[node.id] = node;
      });
      (data.joins || data.edges || []).forEach(join => {
        if (!nodeMap[join.source] || !nodeMap[join.target]) {
          return;
        }
        this.graph.addEdge({
          id: join.id,
          source: { cell: join.source, port: 'right' },
          target: { cell: join.target, port: 'left' },
          vertices: join.vertices || [],
          attrs: {
            line: {
              stroke: '#6f7c8f',
              strokeWidth: 2,
              targetMarker: {
                name: 'classic',
                width: 10,
                height: 8
              }
            }
          },
          data: join.data || join
        });
      });
      this.graph.cleanHistory();
      this.isSettingData = false;
      this.emitChange();
    },
    removeSelectedCells() {
      const cells = this.graph.getSelectedCells();
      if (cells && cells.length > 0) {
        this.graph.removeCells(cells);
      }
    },
    undo() {
      this.graph.undo();
    },
    redo() {
      this.graph.redo();
    },
    selectAll() {
      this.graph.select(this.graph.getCells());
    },
    copy() {
      const cells = this.graph.getSelectedCells();
      if (cells && cells.length) {
        this.graph.copy(cells, { deep: false });
      }
    },
    paste() {
      if (!this.graph.isClipboardEmpty()) {
        this.graph.cleanSelection();
        const cells = this.graph.paste({ offset: 32 });
        const newCells = [];
        cells.forEach(cell => {
          const newCell = this.graph.updateCellId(cell, this.$utils.setUuid());
          if (newCell.isNode()) {
            const data = Object.assign({}, newCell.getData(), { alias: this.getNextAlias() });
            newCell.setData(data);
            newCells.push(newCell);
          }
        });
        this.graph.select(newCells);
      }
    },
    zoom(value) {
      this.graph.zoom(value);
    },
    zoomReset() {
      this.graph.zoomTo(1);
    },
    zoomFit() {
      this.graph.zoomToFit({ padding: 20 });
    },
    toggleFullscreen() {
      const editor = this.$refs.editorRef;
      if (!editor) {
        return;
      }
      const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
      if (fullscreenElement === editor) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      } else if (editor.requestFullscreen) {
        editor.requestFullscreen();
      } else if (editor.webkitRequestFullscreen) {
        editor.webkitRequestFullscreen();
      }
    },
    handleFullscreenChange() {
      const editor = this.$refs.editorRef;
      const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
      this.isFullscreen = fullscreenElement === editor;
      this.$nextTick(() => {
        if (this.graph) {
          this.graph.resize();
          this.zoomFit();
        }
      });
    },
    handleRightClickMenuClick(item) {
      this.hideRightClickMenu();
      if (!item) {
        return;
      }
      if (item.value === 'delete') {
        this.removeSelectedCells();
      } else if (item.value === 'copy') {
        this.copy();
      } else if (item.value === 'paste') {
        this.paste();
      } else if (item.value === 'selectAll') {
        this.selectAll();
      } else if (item.value === 'undo') {
        this.undo();
      }
    },
    showRightClickMenu(e) {
      const rect = this.$refs.editorRef.getBoundingClientRect();
      this.rightClickX = e.clientX - rect.left + 8;
      this.rightClickY = e.clientY - rect.top + 8;
      this.isRightClickMenuVisible = true;
    },
    hideRightClickMenu() {
      this.isRightClickMenuVisible = false;
      this.rightClickX = 0;
      this.rightClickY = 0;
    },
    emitChange() {
      if (this.isSettingData) {
        return;
      }
      if (this.changeTimer) {
        clearTimeout(this.changeTimer);
      }
      this.changeTimer = setTimeout(() => {
        const graphData = this.getGraphData();
        this.$emit('input', graphData);
        this.$emit('change', graphData);
      }, 300);
    }
  },
  watch: {
    value: {
      handler(val) {
        if (this.graph && val && JSON.stringify(val) !== JSON.stringify(this.getGraphData())) {
          this.setGraphData(val);
        }
      },
      deep: true
    }
  }
};
</script>
<style lang="less">
@import (reference) '~@/resources/assets/css/variable.less';
.theme(@background-color, @blockbg, @border-color, @primary-color) {
  .report-editor {
    background: @blockbg;
    .x6-graph-background {
      background: @background-color;
    }
    .x6-port-body {
      fill: @blockbg;
      stroke: @primary-color;
    }
    .x6-edge path:nth-child(2) {
      stroke: @border-color;
    }
  }
}
.report-editor {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  &:fullscreen,
  &:-webkit-full-screen {
    width: 100vw !important;
    height: 100vh !important;
    background: var(--blockbg);
  }
  .graph-main {
    flex: 1;
    min-height: 0;
  }
  .minimap {
    position: absolute;
    z-index: 2;
    right: 10px;
    bottom: 10px;
    width: 260px;
    height: 160px;
  }
}
html {
  .theme(@default-background, @default-blockbg, @default-border, @default-primary-color);

  &.theme-dark {
    .theme(@dark-background, @dark-blockbg, @dark-border, @dark-primary-color);
  }
}
</style>
