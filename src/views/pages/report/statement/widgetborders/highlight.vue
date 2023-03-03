<template>
  <div class="highlight" :style="style">
    <div class="highlight-corner-top-left" :style="style"></div>
    <div class="highlight-corner-top-right" :style="style"></div>
    <div class="highlight-corner-bottom-left" :style="style"></div>
    <div class="highlight-corner-bottom-right" :style="style"></div>
    <div class="highlight-top-bottom" :style="tbStyle"></div>
    <div class="highlight-left-right" :style="lrStyle"></div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    config: { type: Object }
  },
  data() {
    return {
      color: '#02a6b5'
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
    style() {
      return {
        '--width': this.config.width + 'px',
        '--offset': -this.config.width + 'px',
        '--color': this.config.color,
        '--cornersize': this.config.cornersize + 'px'
      };
    },
    tbStyle() {
      return {
        '--border-width': this.config.width + 'px',
        '--width': 'calc(100% - ' + 2 * (this.config.cornersize - this.config.width) + 'px)',
        '--height': 'calc(100% + ' + 2 * this.config.width + 'px)',
        '--offset-left': this.config.cornersize - this.config.width + 'px',
        '--offset-top': -this.config.width + 'px',
        '--color': this.config.cocolor,
        '--cornersize': this.config.cornersize + 'px'
      };
    },
    lrStyle() {
      return {
        '--border-width': this.config.width + 'px',
        '--height': 'calc(100% - ' + 2 * (this.config.cornersize - this.config.width) + 'px)',
        '--width': 'calc(100% + ' + 2 * this.config.width + 'px)',
        '--offset-top': this.config.cornersize - this.config.width + 'px',
        '--offset-left': -this.config.width + 'px',
        '--color': this.config.cocolor,
        '--cornersize': this.config.cornersize + 'px'
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.highlight-corner-top-left,
.highlight-corner-top-right,
.highlight-corner-bottom-left,
.highlight-corner-bottom-right {
  width: var(--cornersize);
  height: var(--cornersize);
  position: absolute;
}
.highlight-corner-top-left {
  top: var(--offset);
  left: var(--offset);
  border-top: var(--width) solid var(--color);
  border-left: var(--width) solid var(--color);
}
.highlight-corner-top-right {
  top: var(--offset);
  right: var(--offset);
  border-top: var(--width) solid var(--color);
  border-right: var(--width) solid var(--color);
}
.highlight-corner-bottom-left {
  bottom: var(--offset);
  left: var(--offset);
  border-bottom: var(--width) solid var(--color);
  border-left: var(--width) solid var(--color);
}
.highlight-corner-bottom-right {
  bottom: var(--offset);
  right: var(--offset);
  border-bottom: var(--width) solid var(--color);
  border-right: var(--width) solid var(--color);
}

.highlight-top-bottom {
  position: absolute;
  width: var(--width);
  height: var(--height);
  left: var(--offset-left);
  top: var(--offset-top);
  border-bottom: var(--border-width) solid var(--color);
  border-top: var(--border-width) solid var(--color);
}

.highlight-left-right {
  position: absolute;
  width: var(--width);
  height: var(--height);
  left: var(--offset-left);
  top: var(--offset-top);
  border-left: var(--border-width) solid var(--color);
  border-right: var(--border-width) solid var(--color);
}
</style>
