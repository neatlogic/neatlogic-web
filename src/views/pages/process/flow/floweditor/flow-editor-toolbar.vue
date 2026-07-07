<template>
  <div class="action-group pl-nm pr-nm pb-xs pt-xs border-base-bottom">
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
    <div v-if="needMinimap" class="action-item ">
      <Poptip
        v-model="showMinimap" 
        :title="$t('term.process.minimap')"
        placement="bottom"
        width="350"
        :transfer="true"
      >
        <span class="tsfont-circulation-o"></span>
        <div slot="content" ref="minimap">
        </div>
      </Poptip>
    </div>
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
    <div v-if="readonly && canEdit" class="action-item"><Divider type="vertical"></Divider></div>
    <div
      v-if="canEdit"
      class="action-item tsfont-edit"
      :title="$t('term.process.editprocessconfig')"
      @click.stop="openFlow()"
    ></div>
    <div
      v-if="canEdit"
      class="action-item tsfont-snapshot"
      :title="$t('term.process.seeprocessconfig')"
      @click.stop="openFlow(true)"
    ></div>
    <div
      v-if="needExportFlow"
      class="action-item tsfont-download"
      :title="$t('term.process.exportflowchart')"
      @click.stop="exportPng()"
    ></div>
  </div>
</template>
<script>
import { Graph, Node, Edge } from '@antv/x6';
import { MiniMap } from '@antv/x6-plugin-minimap';
import { $t } from '@/resources/init.js';

export default {
  name: '',
  components: {
  },
  props: {
    mode: {
      type: String,
      required: true,
      validator(value) {
        return ['graph', 'template'].includes(value);
      }
    },
    needMinimap: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    graph: { type: Graph }, //图形实例，非数据
    selectedNode: { type: Node },
    selectedEdge: { type: Edge },
    flowUuid: { // 流程uuid
      type: String,
      default: ''
    },
    processTaskId: { type: [Number, String] }, // 流程任务id
    processName: { type: String, default: () => $t('term.process.flowchart') }, // 流程名称
    needExportFlow: { type: Boolean, default: false } // 是否需要导出流程图
  },
  data() {
    return {
      canRedo: false,
      canUndo: false,
      isBind: false,
      showMinimap: false,
      miniMap: null
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
    },
    openFlow(isView) {
      if (this.flowUuid) {
        let url = HOME + '/process.html#/flow-edit?uuid=' + this.flowUuid; 
        if (isView) {
        //查看当前工单的流程图配置，需要传递工单id
          url = HOME + '/process.html#/flow-edit?uuid=' + this.flowUuid + '&processTaskId=' + this.processTaskId;
        }
        window.open(url, '_blank');
      }
    },
    exportPng() {
      const getContentArea = this.graph.getContentArea();
      this.graph.toPNG(
        async imgBase64 => {
          const response = await fetch(imgBase64);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${this.processName}.png`;
          a.click();
          URL.revokeObjectURL(url);
        },
        {
          quality: 1,
          padding: 100,
          preserveDimensions: false,
          stylesheet: `${this.$utils.convertWoff2ToBase64()} 
         .radius-sm {
            border-radius: 6px;
          }
          .border-radius {
            border-radius: 6px;
          }
          .icon {
            z-index: 1;
          }
          .start,
          .end {
            width: 40px;
            height: 40px;
            border-radius: 40px;
          }
          .start {
            background-color: #81d5531a;
          }
          .end {
            background-color: #ff625a1a;
          }
          .core {
            border-radius: 18px;
            width: 18px;
            height: 18px;
          }
          .container {
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .shadow {
            box-shadow: 0 1px 4px #0000001a;
          }
          [data-shape="automatic"] .container,
          [data-shape="event"] .container,
          [data-shape="timer"] .container,
          [data-shape="createjob"] .container,
          [data-shape="cientitysync"] .container,
          [data-shape="dataconversion"] .container  {
            border-radius: 20px;
          }
          `,
          width: getContentArea.width * 2,
          height: getContentArea.height < 100 ? getContentArea.height * 10 : getContentArea.height * 2,
          beforeSerialize: graph => {
            this.convertSpansToSvgText(graph);
          }
        }
      );
    },
    convertSpansToSvgText(svg) {
      // 为保证在导出操作时字体图标能够正常显示，将原本使用 span 标签展示的字体图标，
      // 转换为 <svg> 包裹 <text> 标签的展示形式
      const spanList = svg.querySelectorAll('span[class^="tsfont-"]');
      spanList.forEach(span => {
        const classList = span.classList;
        const className = classList.value;
        const unicodeStr = this.$utils.getUnicodeByClassName(className);

        // 获取样式
        const style = span.style;
        const fill = style.color;
        const fontSize = style.fontSize;

        const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgElement.setAttribute('width', 16);
        svgElement.setAttribute('height', 16);

        // 创建 <text> 元素
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('font-family', 'tsfont');
        text.setAttribute('font-size', fontSize);
        text.setAttribute('x', '50%');
        text.setAttribute('y', '50%');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('fill', fill);
        text.textContent = unicodeStr;

        svgElement.appendChild(text);
        span.replaceWith(svgElement); // 替换span元素为<svg><text></text></svg>
      });
    }
  },
  filter: {},
  computed: {
    canEdit() {
      return this.readonly && this.$AuthUtils.hasRole('PROCESS_MODIFY');
    }
  },
  watch: {
    showMinimap: {
      handler: function(val) {
        if (this.graph) {
          if (val) {
            this.$nextTick(() => {
              this.miniMap = new MiniMap({
                container: this.$refs['minimap']
              });
              this.graph.use(this.miniMap);
            });
          } else if (this.miniMap) {
            this.miniMap.dispose();
            this.miniMap = null;
          }
        }
      }
    },
    graph: {
      handler: function(val) {
        if (val) {
          this.graph.on('history:change', () => {
            this.canRedo = this.graph.canRedo();
            this.canUndo = this.graph.canUndo();
          });
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less"></style>
