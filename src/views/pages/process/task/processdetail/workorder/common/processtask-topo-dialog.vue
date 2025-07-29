<template>
  <TsDialog v-bind="dialogConfig" @on-close="close()">
    <template v-slot:header>
      <div>
        <span class="pr-xs">{{ title }}</span>
      </div>
    </template>
    <template v-slot>
      <div class="bg-op radius-md">
        <div style="height: 34px">
          <FlowEditorToolbar
            :graph="graph"
            :needMinimap="true"
            mode="graph"
            :readonly="true"
            :flowUuid="flowUuid"
            :processTaskId="processTaskId"
            :processName="title"
          ></FlowEditorToolbar>
        </div>
        <div ref="flowBox" style="height: calc(100vh - 334px)">
          <FlowEditor
            ref="flowEditor"
            :config="flowConfig"
            :muted="true"
            :readonly="true"
            :grid="false"
            @ready="ready"
            @node:mouseenter="mouseenter"
            @node:mouseleave="mouseleave"
          ></FlowEditor>
          <div class="tooltip-box">
            <div
              v-if="isShowStepTooltip && stepTooltipConfig"
              class="tooltip tipright"
              :style="{left: tooltipStyle.x, top: tooltipStyle.y, }"
            >
              <div class="tooltip-title">{{ stepTooltipConfig.name }}</div>
              <ul class="tooltip-content">
                <li v-if="stepTooltipConfig.statusVo" class="tooltip-list">
                  <span class="label">{{ $t('page.status') }}</span>
                  <span :style="{ color: stepTooltipConfig.statusVo.color }">{{ stepTooltipConfig.statusVo.text }}</span>
                </li>
                <li v-if="stepTooltipConfig.startTime" class="tooltip-list">
                  <span class="label">{{ $t('page.starttime') }}</span>
                  <span>{{ stepTooltipConfig.startTime | formatDate }}</span>
                </li>
                <li v-if="stepTooltipConfig.endTime" class="tooltip-list">
                  <span class="label">{{ $t('page.endtime') }}</span>
                  <span>{{ stepTooltipConfig.endTime | formatDate }}</span>
                </li>
                <li v-if="stepTooltipConfig.majorUser" class="tooltip-list">
                  <span class="label">{{ $t('term.process.dealwithuser') }}</span>
                  <span>
                    <UserCard v-bind="stepTooltipConfig.majorUser.userVo" hideAvatar></UserCard>
                  </span>
                </li>
                <li v-if="stepTooltipConfig.minorUserList && stepTooltipConfig.minorUserList.length > 0" class="tooltip-list">
                  <span class="label">
                    <!-- 步骤处理人 -->
                  </span>
                  <span>{{ userList(stepTooltipConfig.minorUserList, 'minorUser') }}</span>
                </li>
                <li v-if="!stepTooltipConfig.majorUser && stepTooltipConfig.workerList && stepTooltipConfig.workerList.length > 0" class="tooltip-list">
                  <span class="label">{{ $t('term.process.pendinguser') }}</span>
                  <span>{{ userList(stepTooltipConfig.workerList, 'worker') }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <Button @click="close()">{{ $t('page.close') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
import FlowUtil from '@/views/pages/process/flow/flow-utils.js';
import UserCard from '@/resources/components/UserCard/UserCard.vue';
export default {
  name: '',
  components: {
    UserCard,
    FlowEditor: () => import('@/views/pages/process/flow/floweditor/flow-editor.vue'),
    FlowEditorToolbar: () => import('@/views/pages/process/flow/floweditor/flow-editor-toolbar.vue')
  },
  props: {
    processTaskId: { type: Number }
  },
  data() {
    return {
      dialogConfig: {
        isShow: true,
        type: 'modal',
        width: 'large'
      },
      graph: null,
      dnd: null,
      flowConfig: {},
      flowData: null,
      stepList: [],
      relList: [],
      isFlowReady: false, //流程数据就绪，用于激活finalFlowData重新计算
      isShowStepTooltip: false,
      stepTooltipConfig: null,
      tooltipStyle: {}
    };
  },
  beforeCreate() {},
  created() {
    window.addEventListener('resize', this.resize);
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    window.removeEventListener('resize', this.resize);
  },
  destroyed() {},
  methods: {
    nodeSelected(node) {
      const data = this.$utils.deepClone(node.getData());
      data['loading'] = true;
      console.log(JSON.stringify(data));
      node.setData(data);
    },
    close() {
      this.$emit('close');
    },
    resize() {
      setTimeout(() => {
        if (this.graph) {
          this.graph.zoomToFit({ maxScale: 1, padding: 10 });
          this.graph.centerContent();
        }
      }, 300);
    },
    async getFlowData() {
      this.isFlowReady = false;
      await this.$api.process.processtask.stepFlowTop({ processTaskId: this.processTaskId }).then(res => {
        this.flowData = res.Return.config;
        this.stepList = res.Return.processTaskStepList;
        this.relList = res.Return.processTaskStepRelList;
        this.isFlowReady = true;
      });
    },
    async ready(graph, dnd) {
      await this.getFlowData();
      this.graph = graph;
      this.dnd = dnd;
      this.graph.fromJSON(this.finalFlowData);

      //根据状态改变节点颜色
      if (this.stepList && this.stepList.length > 0) {
        this.stepList.forEach(step => {
          const node = this.graph.getCellById(step.processStepUuid);
          if (node) {
            const data = this.$utils.deepClone(node.getData());
            data['status'] = step.status;
            node.setData(data);
          }
        });
      }
      //根据流转状态改变连线颜色
      if (this.relList && this.relList.length > 0) {
        //连线的颜色改变 ，开始节点的连线需要额外操作，因为接口不返回对应的连线信息
        const nodes = this.graph.getNodes();
        const edges = this.graph.getEdges();
        let startNode = nodes.find(d => d.getData()['type'] === 'start');
        if (startNode) {
          const startEdges = edges.filter(d => d.getSourceCellId() === startNode.id);
          startEdges.forEach(edge => {
            edge.setAttrByPath('line/class', 'line-succeed');
            edge.setAttrByPath('line/targetMarker/class', 'marker-succeed');
          });
        }

        this.relList.forEach(rel => {
          const edge = this.graph.getCellById(rel.processStepRelUuid);
          if (edge) {
            if (rel.isHit > 0) {
              edge.setAttrByPath('line/class', 'line-succeed');
              edge.setAttrByPath('line/targetMarker/class', 'marker-succeed');
            } else if (rel.isHit < 0) {
              edge.setAttrByPath('line/class', 'line-error');
              edge.setAttrByPath('line/targetMarker/class', 'marker-error');
            }
          }
        });
      }

      this.$nextTick(() => {
        setTimeout(() => {
          this.graph.zoomToFit({ maxScale: 1, padding: 10 });
          this.graph.centerContent();
        }, 500);
      });
    },
    mouseenter(node, e) {
      const findStep = this.stepList.find(s => s.processStepUuid === node.id);
      this.stepTooltipConfig = this.$utils.deepClone(findStep);
      const parent = this.$refs.flowBox.getBoundingClientRect();
      const size = node.size();
      this.tooltipStyle.x = (e.clientX + size.width + 20 - e.offsetX / 2 - parent.x) + 'px';
      this.tooltipStyle.y = (e.clientY + size.height - parent.y) + 'px';
      this.isShowStepTooltip = true;
    },
    mouseleave() {
      this.isShowStepTooltip = false;
      this.stepTooltipConfig = null;
    },
    userList(arr, type) {
      //处理人
      let userList = arr;
      let textList = [];
      userList.forEach(item => {
        if (type == 'minorUser') { //处理人
          let userText = item.userName;
          item.taskType && (userText += '(' + item.taskType + ')');
          textList.push(userText);
        } else if (type == 'worker') { //待处理人
          textList.push(item.name);
        }
      });
      textList = textList.join('、');
      return textList;
    }
  },
  filter: {},
  computed: {
    finalFlowData() {
      if (this.isFlowReady && this.flowData && this.flowData.topo && this.flowData.topo.nodes) {
        const cells = FlowUtil.transfer(this.flowData);
        return { cells: cells };
      } else if (this.flowData && this.flowData.topo && this.flowData.topo.cells) {
        return this.flowData.topo.cells;
      }
      return [];
    },
    title() {
      if (this.isFlowReady && this.flowData && this.flowData.process && this.flowData.process.processConfig) {
        return this.flowData.process.processConfig.name;
      }
      return '流程图';
    },
    flowUuid() {
      if (this.isFlowReady && this.flowData && this.flowData.process && this.flowData.process.processConfig) {
        return this.flowData.process.processConfig.uuid;
      }
      return '';
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
