<template>
  <div class="network-topology" :class="topologyClass" :style="topologyStyle">
    <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter
          id="networkTopologyGlow"
          x="-60%"
          y="-60%"
          width="220%"
          height="220%"
        >
          <feGaussianBlur stdDeviation="3" result="coloredBlur"></feGaussianBlur>
          <feMerge>
            <feMergeNode in="coloredBlur"></feMergeNode>
            <feMergeNode in="SourceGraphic"></feMergeNode>
          </feMerge>
        </filter>
      </defs>
      <g class="link-layer">
        <g
          v-for="(link, index) in normalizedLinks"
          :key="'link-' + index"
          class="network-link"
          :class="['status-' + link.status]"
        >
          <path class="network-link-base" :d="link.path"></path>
          <path
            v-if="showFlow && link.status !== 'disconnected'"
            class="network-link-flow"
            :d="link.path"
            :style="getFlowStyle(index)"
          ></path>
          <text
            v-if="config.showLinkLabel && link.label"
            class="network-link-label"
            :x="link.labelX"
            :y="link.labelY"
          >{{ link.label }}</text>
        </g>
      </g>
      <g class="node-layer">
        <g
          v-for="node in nodeList"
          :key="node.id"
          class="network-node"
          :class="['status-' + node.status, 'type-' + node.type]"
          :transform="'translate(' + node.x + ',' + node.y + ')'"
        >
          <circle
            v-if="showPulse(node)"
            class="node-pulse"
            :r="nodeSize + 8"
          ></circle>
          <circle
            class="node-halo"
            :r="nodeSize + 6"
          ></circle>
          <g
            class="node-icon"
            :transform="'scale(' + iconScale + ')'"
          >
            <circle v-if="node.type === 'router'" r="18"></circle>
            <rect
              v-else-if="node.type === 'switch'"
              x="-22"
              y="-14"
              width="44"
              height="28"
              rx="4"
            ></rect>
            <path
              v-else-if="node.type === 'firewall'"
              d="M-22,-16 H22 V16 H-22 Z M-22,-4 H-8 V6 H-22 M-8,-16 V-4 H8 V-16 M8,-4 H22 V8 H8"
            ></path>
            <rect
              v-else-if="node.type === 'server'"
              x="-18"
              y="-20"
              width="36"
              height="40"
              rx="4"
            ></rect>
            <path
              v-else-if="node.type === 'database'"
              d="M-20,-14 C-20,-24 20,-24 20,-14 V14 C20,24 -20,24 -20,14 Z M-20,-14 C-20,-4 20,-4 20,-14 M-20,0 C-20,10 20,10 20,0"
            ></path>
            <path
              v-else-if="node.type === 'cloud'"
              d="M-24,8 C-34,6 -34,-10 -20,-10 C-16,-24 6,-24 12,-10 C28,-12 34,8 18,14 H-20 C-24,14 -28,12 -24,8 Z"
            ></path>
            <path v-else d="M-18,-16 H18 V10 H-18 Z M-8,18 H8 M0,10 V18"></path>
          </g>
          <text class="node-type-text" y="5">{{ getNodeTypeText(node.type) }}</text>
          <text
            v-if="config.showLabel !== false"
            class="node-label"
            :y="nodeSize + 24"
          >{{ node.label }}</text>
        </g>
      </g>
    </svg>
  </div>
</template>
<script>
import { WidgetBase } from '../widget-base.js';
import { NETWORK_TOPOLOGY_PRESETS } from './networktopology-presets.js';

const VALID_NODE_TYPES = ['switch', 'router', 'firewall', 'server', 'database', 'cloud', 'terminal'];
const VALID_NODE_STATUS = ['normal', 'warning', 'critical', 'offline'];
const VALID_LINK_STATUS = ['normal', 'warning', 'critical', 'congested', 'disconnected'];

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return fallback;
  }
  return Math.min(Math.max(number, min), max);
}

function normalizeText(value, fallback) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  return String(value).trim();
}

function normalizeLowerText(value, fallback) {
  return normalizeText(value, fallback).toLowerCase();
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export default {
  name: '',
  extends: WidgetBase,
  methods: {
    getFlowStyle(index) {
      return {
        animationDelay: `-${(index * 0.45).toFixed(2)}s`
      };
    },
    getNodeTypeText(type) {
      const textMap = {
        switch: 'SW',
        router: 'RT',
        firewall: 'FW',
        server: 'SRV',
        database: 'DB',
        cloud: 'CLOUD',
        terminal: 'PC'
      };
      return textMap[type] || 'NODE';
    },
    showPulse(node) {
      if (this.isLowPerformance || this.config.enabled === false || this.config.showAlarmPulse === false) {
        return false;
      }
      return ['warning', 'critical'].includes(node.status);
    },
    normalizeNodeType(type) {
      const value = normalizeLowerText(type, 'terminal');
      return VALID_NODE_TYPES.includes(value) ? value : 'terminal';
    },
    normalizeNodeStatus(status) {
      const value = normalizeLowerText(status, 'normal');
      return VALID_NODE_STATUS.includes(value) ? value : 'normal';
    },
    normalizeLinkStatus(status) {
      const value = normalizeLowerText(status, 'normal');
      return VALID_LINK_STATUS.includes(value) ? value : 'normal';
    },
    getAutoPosition(index, total) {
      const safeTotal = Math.max(total, 1);
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / safeTotal;
      return {
        x: Math.round(500 + Math.cos(angle) * 340),
        y: Math.round(300 + Math.sin(angle) * 210)
      };
    },
    getFallbackPosition(index, total) {
      const fallbackNode = this.preset.nodes && this.preset.nodes[index];
      if (fallbackNode && Number.isFinite(Number(fallbackNode.x)) && Number.isFinite(Number(fallbackNode.y))) {
        return {
          x: Number(fallbackNode.x),
          y: Number(fallbackNode.y)
        };
      }
      return this.getAutoPosition(index, total);
    }
  },
  computed: {
    config() {
      return (this.widget && this.widget.config) || {};
    },
    preset() {
      return NETWORK_TOPOLOGY_PRESETS[this.config.preset] || NETWORK_TOPOLOGY_PRESETS.coreAccess;
    },
    dynamicNodeList() {
      const nodeRows = (this.data || []).filter(item => normalizeLowerText(item.rowType, '') === 'node');
      return nodeRows
        .map((item, index) => {
          const id = normalizeText(item.nodeId, '');
          if (!id) {
            return null;
          }
          const fallbackPosition = this.getFallbackPosition(index, nodeRows.length);
          const x = toNumber(item.nodeX);
          const y = toNumber(item.nodeY);
          return {
            id,
            label: normalizeText(item.nodeLabel, id),
            type: this.normalizeNodeType(item.nodeType),
            status: this.normalizeNodeStatus(item.nodeStatus),
            x: x === null ? fallbackPosition.x : x,
            y: y === null ? fallbackPosition.y : y
          };
        })
        .filter(Boolean);
    },
    dynamicLinkList() {
      const nodeIdMap = this.dynamicNodeList.reduce((map, node) => {
        map[node.id] = true;
        return map;
      }, {});
      return (this.data || [])
        .filter(item => normalizeLowerText(item.rowType, '') === 'link')
        .map(item => {
          const source = normalizeText(item.sourceId, '');
          const target = normalizeText(item.targetId, '');
          if (!source || !target || !nodeIdMap[source] || !nodeIdMap[target]) {
            return null;
          }
          return {
            source,
            target,
            status: this.normalizeLinkStatus(item.linkStatus),
            label: normalizeText(item.linkLabel, '')
          };
        })
        .filter(Boolean);
    },
    hasDynamicTopology() {
      return this.dynamicNodeList.length > 0;
    },
    nodeList() {
      if (this.hasDynamicTopology) {
        return this.dynamicNodeList;
      }
      return this.preset.nodes || [];
    },
    nodeMap() {
      return this.nodeList.reduce((map, node) => {
        map[node.id] = node;
        return map;
      }, {});
    },
    linkList() {
      if (this.hasDynamicTopology) {
        return this.dynamicLinkList;
      }
      return this.preset.links || [];
    },
    normalizedLinks() {
      return this.linkList.map(link => {
        const source = this.nodeMap[link.source];
        const target = this.nodeMap[link.target];
        if (!source || !target) {
          return null;
        }
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const offset = Math.min(70, distance * 0.18);
        const controlX = (source.x + target.x) / 2 - (dy / distance) * offset;
        const controlY = (source.y + target.y) / 2 + (dx / distance) * offset;
        return {
          ...link,
          path: `M${source.x},${source.y} Q${controlX.toFixed(1)},${controlY.toFixed(1)} ${target.x},${target.y}`,
          labelX: (source.x + target.x) / 2,
          labelY: (source.y + target.y) / 2 - 8,
          status: link.status || 'normal'
        };
      }).filter(Boolean);
    },
    isLowPerformance() {
      return this.config.lowPerformance === true;
    },
    showFlow() {
      return this.config.enabled !== false && this.config.showFlow !== false;
    },
    nodeSize() {
      return clampNumber(this.config.nodeSize, 18, 54, 28);
    },
    iconScale() {
      return this.nodeSize / 28;
    },
    topologyClass() {
      return {
        'is-paused': this.config.enabled === false,
        'is-low-performance': this.isLowPerformance,
        'is-node-breath': this.config.showNodeBreath !== false && !this.isLowPerformance && this.config.enabled !== false
      };
    },
    topologyStyle() {
      const lineWidth = clampNumber(this.config.lineWidth, 1, 8, 2);
      return {
        '--network-primary-color': (this.widget && this.widget.color) || '#00e5ff',
        '--network-accent-color': (this.widget && this.widget.accentColor) || '#00ffa8',
        '--network-line-width': `${lineWidth}px`,
        '--network-node-size': `${this.nodeSize}px`,
        '--network-play-state': this.config.enabled === false ? 'paused' : 'running'
      };
    }
  }
};
</script>
<style lang="less" scoped>
.network-topology {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  overflow: hidden;
  color: #e9fbff;
}
svg {
  width: 100%;
  height: 100%;
}
.network-link-base,
.network-link-flow {
  fill: none;
  vector-effect: non-scaling-stroke;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.network-link-base {
  stroke: var(--network-primary-color);
  stroke-width: var(--network-line-width);
  opacity: 0.34;
}
.network-link-flow {
  stroke: var(--network-accent-color);
  stroke-width: calc(var(--network-line-width) + 1px);
  stroke-dasharray: 18 72;
  filter: drop-shadow(0 0 5px var(--network-accent-color));
  animation: networkLinkFlow 5.5s linear infinite;
  animation-play-state: var(--network-play-state);
}
.network-link.status-warning .network-link-base,
.network-link.status-warning .network-link-flow {
  stroke: #ffd166;
}
.network-link.status-critical .network-link-base,
.network-link.status-critical .network-link-flow {
  stroke: #ff4d6d;
}
.network-link.status-congested .network-link-base,
.network-link.status-congested .network-link-flow {
  stroke: #ff9f1c;
  stroke-dasharray: 8 8;
}
.network-link.status-disconnected .network-link-base {
  stroke: #7f8b99;
  stroke-dasharray: 10 8;
  opacity: 0.5;
}
.network-link-label,
.node-label,
.node-type-text {
  fill: currentColor;
  text-anchor: middle;
  paint-order: stroke;
  stroke: rgba(2, 12, 22, 0.88);
  stroke-width: 4px;
  stroke-linejoin: round;
}
.network-link-label {
  font-size: 18px;
  opacity: 0.72;
}
.network-node {
  color: #e9fbff;
}
.node-halo,
.node-pulse {
  fill: transparent;
  stroke: var(--network-primary-color);
  vector-effect: non-scaling-stroke;
}
.node-halo {
  stroke-width: 1.5;
  opacity: 0.56;
  filter: drop-shadow(0 0 8px var(--network-primary-color));
}
.node-pulse {
  stroke-width: 2;
  opacity: 0;
  animation: networkNodePulse 2.2s ease-out infinite;
  animation-play-state: var(--network-play-state);
}
.node-icon {
  fill: rgba(4, 23, 38, 0.92);
  stroke: var(--network-primary-color);
  stroke-width: 2;
  vector-effect: non-scaling-stroke;
  filter: drop-shadow(0 0 7px var(--network-primary-color));
}
.node-type-text {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0;
}
.node-label {
  font-size: 18px;
}
.status-normal .node-halo,
.status-normal .node-icon {
  stroke: var(--network-primary-color);
}
.status-warning .node-halo,
.status-warning .node-icon,
.status-warning .node-pulse {
  stroke: #ffd166;
}
.status-critical .node-halo,
.status-critical .node-icon,
.status-critical .node-pulse {
  stroke: #ff4d6d;
}
.status-offline {
  opacity: 0.64;
}
.status-offline .node-halo,
.status-offline .node-icon {
  stroke: #7f8b99;
  filter: none;
}
.is-node-breath .status-normal .node-halo {
  animation: networkNodeBreath 3.2s ease-in-out infinite;
  animation-play-state: var(--network-play-state);
}
.is-low-performance .network-link-flow,
.is-low-performance .node-halo,
.is-low-performance .node-icon {
  filter: none;
}
@keyframes networkLinkFlow {
  from {
    stroke-dashoffset: 90;
  }
  to {
    stroke-dashoffset: 0;
  }
}
@keyframes networkNodePulse {
  0% {
    opacity: 0.85;
    transform: scale(0.72);
  }
  100% {
    opacity: 0;
    transform: scale(1.65);
  }
}
@keyframes networkNodeBreath {
  0%,
  100% {
    opacity: 0.42;
  }
  50% {
    opacity: 0.9;
  }
}
</style>
