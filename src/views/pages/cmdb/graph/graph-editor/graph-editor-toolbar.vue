<template>
  <div class="action-group pl-nm pr-nm pb-xs pt-xs border-base-bottom">
    <div v-if="!readonly" class="action-item">
      <TsFormSwitch
        v-model="config.edgeMode"
        :showStatus="true"
        :trueValue="true"
        :falseValue="false"
        :trueText="$t('term.diagram.edgemode')"
        :falseText="$t('term.diagram.edgemode')"
      ></TsFormSwitch>
    </div>
    <div v-if="!readonly" class="action-item"><Divider type="vertical"></Divider></div>
    <div
      v-if="!readonly"
      class="action-item tsfont-undo"
      :class="{ disable: !canUndo }"
      @click="canUndo && graph.undo()"
    ></div>
    <div
      v-if="!readonly"
      class="action-item tsfont-revover"
      :class="{ disable: !canRedo }"
      @click="canRedo && graph.redo()"
    ></div>
    <div v-if="!readonly" class="action-item"><Divider type="vertical"></Divider></div>
    <div class="action-item tsfont-search-plus" @click="graph.zoom(0.1)"></div>
    <div class="action-item tsfont-search-minus" @click="graph.zoom(-0.1)"></div>
    <div class="action-item tsfont-search" @click="graph.zoomTo(1)"></div>
    <div class="action-item tsfont-center" @click="graph.zoomToFit({ padding: 10 })"></div>
    <div v-if="!readonly && (selectedNode || selectedEdge)" class="action-item"><Divider type="vertical"></Divider></div>
    <div v-if="!readonly && (selectedNode || selectedEdge)" class="action-item tsfont-trash-o" @click="deleteSelected()"></div>
    <div v-if="!readonly && selectedNode" class="action-item"><Divider type="vertical"></Divider></div>
    <div
      v-if="!readonly && selectedNode"
      class="action-item tsfont-copy"
      :title="$t('page.copy')"
      @click="copy()"
    ></div>
    <div
      v-if="!readonly && selectedNode"
      class="action-item tsfont-paste"
      :title="$t('page.paste')"
      @click="paste()"
    ></div>
  </div>
</template>
<script>
import { Graph, Node, Edge } from '@antv/x6';

export default {
  name: '',
  components: {
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
  },
  props: {
    mode: {
      type: String,
      required: true,
      validator(value) {
        return ['graph', 'template'].includes(value);
      }
    },
    readonly: { type: Boolean, default: false },
    graph: { type: Graph }, //图形实例，非数据
    selectedNode: { type: Node },
    selectedEdge: { type: Edge },
    config: { type: Object }
  },
  data() {
    return {
      canRedo: false,
      canUndo: false,
      isBind: false
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
  beforeDestroy() {
    this.graph.off('history:change');
  },
  destroyed() {},
  methods: {
    deleteSelected() {
      if (this.selectedNode) {
        this.selectedNode.remove();
      } else if (this.selectedEdge) {
        this.selectedEdge.remove();
      }
    },
    toBack() {
      if (this.selectedNode) {
        this.selectedNode.toBack();
      }
    },
    toFront() {
      if (this.selectedNode) {
        this.selectedNode.toFront();
      }
    },
    copy() {
      const cells = this.graph.getSelectedCells();
      if (cells && cells.length) {
        this.graph.copy(cells, { deep: true });
        this.$Message.success(this.$t('message.copysuccess'));
      }
    },
    paste() {
      if (!this.graph.isClipboardEmpty()) {
        this.graph.cleanSelection();
        this.graph.startBatch('paste');
        const cells = this.graph.paste();
        const newCells = [];
        cells.forEach(cell => {
          let currentUuid = this.$utils.setUuid();
          this.graph.updateCellId(cell, currentUuid);
          let currentCell = this.graph.getCellById(currentUuid);
          if (currentCell) {
            // 复制之后，把uuid改成新的uuid
            const data = currentCell.getData();
            data.uuid = currentUuid;
            data.name = `${data.name}_copy`;
            currentCell.setData(data);
          }
          if (!currentCell.isEdge()) {
            newCells.push(currentCell);
          }
        });
        this.graph.stopBatch('paste');
        this.graph.select(newCells);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
    graph: {
      handler: function(val) {
        if (val && !this.isBind) {
          this.graph.on('history:change', () => {
            this.canRedo = this.graph.canRedo();
            this.canUndo = this.graph.canUndo();
          });
          this.isBind = true;
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less"></style>
