<template>
  <div class="effect-topologyflow" :class="topologyClass" :style="topologyStyle">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
      <path
        v-for="(path, index) in pathList"
        :key="'base-' + index"
        class="topology-path-base"
        :d="path"
      ></path>
      <template v-for="flowIndex in flowCount">
        <path
          v-for="(path, index) in pathList"
          :key="'flow-' + flowIndex + '-' + index"
          class="topology-path-flow"
          :d="path"
          :style="getFlowStyle(flowIndex, index)"
        ></path>
      </template>
      <g v-if="config.showNodes !== false">
        <g v-for="(node, index) in nodeList" :key="'node-' + index" class="topology-node">
          <circle
            v-if="nodeStyle === 'pulse'"
            class="topology-node-pulse"
            :cx="node.x"
            :cy="node.y"
            :r="nodeSize"
          ></circle>
          <circle
            v-if="nodeStyle === 'ring'"
            class="topology-node-ring"
            :cx="node.x"
            :cy="node.y"
            :r="nodeSize + 2"
          ></circle>
          <circle
            class="topology-node-core"
            :cx="node.x"
            :cy="node.y"
            :r="nodeSize"
          ></circle>
        </g>
      </g>
    </svg>
  </div>
</template>
<script>
const TOPOLOGY_PRESETS = {
  ops: {
    paths: ['M8,50 C24,18 42,18 52,50 S78,82 94,50', 'M12,78 C30,58 42,62 52,50 S74,30 90,22', 'M12,22 C30,42 42,38 52,50 S74,70 90,78'],
    nodes: [{ x: 8, y: 50 }, { x: 52, y: 50 }, { x: 94, y: 50 }, { x: 12, y: 22 }, { x: 90, y: 22 }, { x: 12, y: 78 }, { x: 90, y: 78 }]
  },
  mesh: {
    paths: ['M8,52 C28,12 48,18 68,42 S88,76 96,36', 'M12,20 C34,46 48,44 62,22 S82,18 92,58', 'M16,82 C36,62 52,66 70,82 S88,92 96,70', 'M20,46 L44,28 L68,42 L84,66', 'M34,26 L52,66 L92,58'],
    nodes: [{ x: 8, y: 52 }, { x: 34, y: 26 }, { x: 62, y: 34 }, { x: 92, y: 58 }, { x: 16, y: 82 }, { x: 70, y: 82 }, { x: 52, y: 66 }]
  },
  hub: {
    paths: ['M50,50 L12,18', 'M50,50 L88,18', 'M50,50 L12,82', 'M50,50 L88,82', 'M50,50 C34,44 30,30 22,50', 'M50,50 C66,44 70,30 78,50'],
    nodes: [{ x: 50, y: 50 }, { x: 12, y: 18 }, { x: 88, y: 18 }, { x: 12, y: 82 }, { x: 88, y: 82 }, { x: 22, y: 50 }, { x: 78, y: 50 }]
  },
  pipeline: {
    paths: ['M4,50 C20,50 24,30 40,30 S60,70 76,70 S84,50 96,50', 'M4,32 H24 C34,32 34,50 44,50 H96', 'M4,68 H24 C34,68 34,50 44,50 H96'],
    nodes: [{ x: 4, y: 50 }, { x: 24, y: 32 }, { x: 40, y: 30 }, { x: 50, y: 50 }, { x: 76, y: 70 }, { x: 96, y: 50 }, { x: 24, y: 68 }]
  },
  vertical: {
    paths: ['M50,4 C28,20 28,38 50,50 S72,80 50,96', 'M24,12 C48,28 48,42 50,50 S52,72 76,88', 'M76,12 C52,28 52,42 50,50 S48,72 24,88'],
    nodes: [{ x: 50, y: 4 }, { x: 50, y: 50 }, { x: 50, y: 96 }, { x: 24, y: 12 }, { x: 76, y: 12 }, { x: 24, y: 88 }, { x: 76, y: 88 }]
  },
  ring: {
    paths: ['M50,10 A40,40 0 1,1 49.9,10', 'M50,26 A24,24 0 1,0 50.1,26', 'M26,50 C34,34 66,34 74,50 C66,66 34,66 26,50'],
    nodes: [{ x: 50, y: 10 }, { x: 78, y: 22 }, { x: 90, y: 50 }, { x: 78, y: 78 }, { x: 50, y: 90 }, { x: 22, y: 78 }, { x: 10, y: 50 }, { x: 22, y: 22 }]
  }
};

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return fallback;
  }
  return Math.min(Math.max(number, min), max);
}

export default {
  name: '',
  props: {
    widget: { type: Object }
  },
  methods: {
    getFlowStyle(flowIndex, pathIndex) {
      const duration = this.duration;
      const offset = ((flowIndex - 1) * duration) / this.flowCount + pathIndex * 0.35;
      return {
        animationDelay: `-${offset.toFixed(2)}s`
      };
    }
  },
  computed: {
    config() {
      return (this.widget && this.widget.config) || {};
    },
    presetConfig() {
      return TOPOLOGY_PRESETS[this.config.preset] || TOPOLOGY_PRESETS.ops;
    },
    pathList() {
      return this.presetConfig.paths;
    },
    nodeList() {
      return this.presetConfig.nodes;
    },
    isLowPerformance() {
      return this.config.lowPerformance === true;
    },
    flowCount() {
      if (this.isLowPerformance) {
        return 1;
      }
      return clampNumber(this.config.flowDensity, 1, 3, 1);
    },
    duration() {
      return clampNumber(this.config.speed, 1, 30, 8);
    },
    flowLength() {
      return clampNumber(this.config.flowLength, 4, 28, 10);
    },
    nodeSize() {
      return clampNumber(this.config.nodeSize, 2, 12, 4);
    },
    nodeStyle() {
      return this.isLowPerformance && this.config.nodeStyle === 'pulse' ? 'dot' : this.config.nodeStyle || 'dot';
    },
    topologyClass() {
      return {
        'is-dashed': this.config.lineStyle === 'dashed',
        'is-reverse': this.config.direction === 'reverse',
        'is-low-performance': this.isLowPerformance,
        'is-round-line': this.config.lineCap !== 'butt',
        [`node-${this.nodeStyle}`]: true
      };
    },
    topologyStyle() {
      const width = clampNumber(this.config.lineWidth, 1, 10, 2);
      const baseOpacity = clampNumber(this.config.baseOpacity, 0.05, 1, 0.24);
      const nodeOpacity = clampNumber(this.config.nodeOpacity, 0.1, 1, 1);
      const gap = Math.max(this.flowLength * 4, 32);
      const dashOffset = this.flowLength + gap;
      return {
        '--topology-primary-color': (this.widget && this.widget.color) || '#00e5ff',
        '--topology-accent-color': (this.widget && this.widget.accentColor) || '#00ffa8',
        '--topology-width': `${width}px`,
        '--topology-duration': `${this.duration}s`,
        '--topology-flow-length': this.flowLength,
        '--topology-flow-gap': gap,
        '--topology-dash-offset': dashOffset,
        '--topology-base-opacity': baseOpacity,
        '--topology-node-opacity': nodeOpacity,
        '--topology-play-state': this.config.enabled === false ? 'paused' : 'running'
      };
    }
  }
};
</script>
<style lang="less" scoped>
.effect-topologyflow {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
svg {
  width: 100%;
  height: 100%;
}
.topology-path-base,
.topology-path-flow {
  fill: none;
  vector-effect: non-scaling-stroke;
}
.topology-path-base {
  stroke: var(--topology-primary-color);
  stroke-width: var(--topology-width);
  opacity: var(--topology-base-opacity);
}
.topology-path-flow {
  stroke: var(--topology-accent-color);
  stroke-width: calc(var(--topology-width) + 0.6px);
  stroke-dasharray: var(--topology-flow-length) var(--topology-flow-gap);
  animation: topologyFlow var(--topology-duration) linear infinite;
  animation-play-state: var(--topology-play-state);
  filter: drop-shadow(0 0 5px var(--topology-accent-color));
}
.is-round-line .topology-path-base,
.is-round-line .topology-path-flow {
  stroke-linecap: round;
  stroke-linejoin: round;
}
.is-dashed .topology-path-base {
  stroke-dasharray: 6 5;
}
.is-reverse .topology-path-flow {
  animation-name: topologyFlowReverse;
}
.is-low-performance .topology-path-flow,
.is-low-performance .topology-node-core,
.is-low-performance .topology-node-ring {
  filter: none;
}
.topology-node-core,
.topology-node-ring,
.topology-node-pulse {
  vector-effect: non-scaling-stroke;
  opacity: var(--topology-node-opacity);
}
.topology-node-core {
  fill: var(--topology-primary-color);
  stroke: fade(#ffffff, 70%);
  stroke-width: 0.8;
  filter: drop-shadow(0 0 5px var(--topology-primary-color));
}
.node-ring .topology-node-core {
  fill: var(--topology-accent-color);
}
.topology-node-ring {
  fill: transparent;
  stroke: var(--topology-primary-color);
  stroke-width: 1;
  filter: drop-shadow(0 0 5px var(--topology-primary-color));
}
.topology-node-pulse {
  fill: var(--topology-accent-color);
  transform-box: fill-box;
  transform-origin: center;
  animation: topologyNodePulse 2.4s ease-out infinite;
  animation-play-state: var(--topology-play-state);
}
@keyframes topologyFlow {
  from {
    stroke-dashoffset: var(--topology-dash-offset);
  }
  to {
    stroke-dashoffset: 0;
  }
}
@keyframes topologyFlowReverse {
  from {
    stroke-dashoffset: 0;
  }
  to {
    stroke-dashoffset: var(--topology-dash-offset);
  }
}
@keyframes topologyNodePulse {
  0% {
    opacity: 0.5;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(2.7);
  }
}
</style>
