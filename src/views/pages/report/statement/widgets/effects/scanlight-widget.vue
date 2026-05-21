<template>
  <div class="effect-scanlight" :class="scanClass" :style="scanStyle">
    <div v-if="config.enabled !== false" class="scan-beam"></div>
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
    scanClass() {
      return {
        [`is-${this.config.direction || 'vertical'}`]: true
      };
    },
    scanStyle() {
      const speed = Number(this.config.speed) || 8;
      return {
        '--scan-primary-color': this.widget.color || '#00e5ff',
        '--scan-accent-color': this.widget.accentColor || '#00ffa8',
        '--scan-opacity': Number(this.config.opacity) || 0.28,
        '--scan-size': `${this.config.beamSize || 24}%`,
        '--scan-duration': `${Math.max(speed, 1)}s`
      };
    }
  }
};
</script>
<style lang="less" scoped>
.effect-scanlight {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background:
    linear-gradient(90deg, fade(#00e5ff, 6%) 1px, transparent 1px),
    linear-gradient(180deg, fade(#00e5ff, 6%) 1px, transparent 1px);
  background-size: 28px 28px;
}
.scan-beam {
  position: absolute;
  pointer-events: none;
  opacity: var(--scan-opacity);
  filter: blur(0.2px);
}
.is-vertical .scan-beam {
  top: 0;
  bottom: 0;
  width: var(--scan-size);
  background: linear-gradient(90deg, transparent, var(--scan-primary-color), var(--scan-accent-color), transparent);
  animation: scanX var(--scan-duration) ease-in-out infinite;
}
.is-horizontal .scan-beam {
  right: 0;
  left: 0;
  height: var(--scan-size);
  background: linear-gradient(180deg, transparent, var(--scan-primary-color), var(--scan-accent-color), transparent);
  animation: scanY var(--scan-duration) ease-in-out infinite;
}
@keyframes scanX {
  0% {
    left: calc(var(--scan-size) * -1);
  }
  100% {
    left: 100%;
  }
}
@keyframes scanY {
  0% {
    top: calc(var(--scan-size) * -1);
  }
  100% {
    top: 100%;
  }
}
</style>
