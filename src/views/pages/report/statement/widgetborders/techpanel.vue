<template>
  <div class="tech-panel-border" :style="style">
    <div class="tech-panel-corner top-left"></div>
    <div class="tech-panel-corner top-right"></div>
    <div class="tech-panel-corner bottom-left"></div>
    <div class="tech-panel-corner bottom-right"></div>
  </div>
</template>
<script>
export default {
  name: '',
  props: {
    config: { type: Object }
  },
  computed: {
    style() {
      return {
        '--border-width': (this.config.width || 1) + 'px',
        '--corner-size': (this.config.cornersize || 28) + 'px',
        '--border-color': this.config.color || '#00e5ff',
        '--background-color': this.config.backgroundColor || 'rgba(6, 27, 45, 0.74)',
        '--shadow-color': this.config.shadowColor || 'rgba(0, 229, 255, 0.22)'
      };
    }
  }
};
</script>
<style lang="less" scoped>
.tech-panel-border {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  background:
    linear-gradient(135deg, fade(#00e5ff, 10%), transparent 38%),
    var(--background-color);
  border: var(--border-width) solid fade(#00e5ff, 58%);
  box-shadow:
    inset 0 0 26px var(--shadow-color),
    0 0 18px fade(#00e5ff, 16%);
}
.tech-panel-border::before {
  content: '';
  position: absolute;
  inset: 8px;
  pointer-events: none;
  border: 1px solid fade(#00e5ff, 24%);
}
.tech-panel-corner {
  position: absolute;
  width: var(--corner-size);
  height: var(--corner-size);
  border-color: var(--border-color);
  border-style: solid;
  pointer-events: none;
}
.top-left {
  top: 8px;
  left: 8px;
  border-width: 2px 0 0 2px;
}
.top-right {
  top: 8px;
  right: 8px;
  border-width: 2px 2px 0 0;
}
.bottom-left {
  bottom: 8px;
  left: 8px;
  border-width: 0 0 2px 2px;
}
.bottom-right {
  right: 8px;
  bottom: 8px;
  border-width: 0 2px 2px 0;
}
</style>

