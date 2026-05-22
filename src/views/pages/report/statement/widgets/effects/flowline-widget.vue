<template>
  <div class="effect-flowline" :class="flowlineClass" :style="flowlineStyle">
    <div class="flowline-track"></div>
    <div v-if="config.enabled !== false" class="flowline-light"></div>
  </div>
</template>
<script>
export default {
  name: '',
  props: {
    widget: { type: Object }
  },
  computed: {
    config() {
      return this.widget.config || {};
    },
    flowlineClass() {
      return {
        [`is-${this.config.direction || 'horizontal'}`]: true,
        'is-dashed': !!this.config.isDashed,
        'is-glow': this.config.glow !== false
      };
    },
    flowlineStyle() {
      const speed = Number(this.config.speed) || 6;
      return {
        '--flowline-primary-color': this.widget.color || '#00e5ff',
        '--flowline-accent-color': this.widget.accentColor || '#00ffa8',
        '--flowline-width': `${this.config.lineWidth || 3}px`,
        '--flowline-duration': `${Math.max(speed, 1)}s`,
        '--flowline-play-state': this.config.enabled === false ? 'paused' : 'running'
      };
    }
  }
};
</script>
<style lang="less" scoped>
.effect-flowline {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.flowline-track,
.flowline-light {
  position: absolute;
  inset: 50% 0 auto 0;
  height: var(--flowline-width);
  transform: translateY(-50%);
  border-radius: 999px;
}
.flowline-track {
  background: linear-gradient(90deg, transparent, fade(#00e5ff, 30%), transparent);
}
.flowline-light {
  width: 46%;
  background: linear-gradient(90deg, transparent, var(--flowline-primary-color), var(--flowline-accent-color), transparent);
  animation: flowlineX var(--flowline-duration) linear infinite;
  animation-play-state: var(--flowline-play-state);
}
.is-glow .flowline-light {
  box-shadow: 0 0 16px fade(#00e5ff, 55%);
}
.is-dashed .flowline-track {
  background-image: repeating-linear-gradient(90deg, fade(#00e5ff, 45%) 0 16px, transparent 16px 28px);
}
.is-vertical .flowline-track,
.is-vertical .flowline-light {
  inset: 0 auto 0 50%;
  width: var(--flowline-width);
  height: auto;
  transform: translateX(-50%);
}
.is-vertical .flowline-track {
  background: linear-gradient(180deg, transparent, fade(#00e5ff, 30%), transparent);
}
.is-vertical .flowline-light {
  height: 46%;
  background: linear-gradient(180deg, transparent, var(--flowline-primary-color), var(--flowline-accent-color), transparent);
  animation-name: flowlineY;
}
.is-diagonal .flowline-track,
.is-diagonal .flowline-light {
  top: 50%;
  left: -12%;
  width: 124%;
  transform: rotate(-18deg);
}
.is-diagonal .flowline-light {
  animation-name: flowlineDiagonal;
}
@keyframes flowlineX {
  from {
    transform: translate(-52%, -50%);
  }
  to {
    transform: translate(160%, -50%);
  }
}
@keyframes flowlineY {
  from {
    transform: translate(-50%, -52%);
  }
  to {
    transform: translate(-50%, 160%);
  }
}
@keyframes flowlineDiagonal {
  from {
    transform: translateX(-52%) rotate(-18deg);
  }
  to {
    transform: translateX(160%) rotate(-18deg);
  }
}
</style>
