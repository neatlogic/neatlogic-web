<template>
  <div class="gradient" :style="style">
    <div v-if="config.title" class="title" :style="titleStyle">{{ config.title }}</div>
    <div class="gradient-top">
      <div class="lborder" :style="style"></div>
      <div class="tborder" :style="style"></div>
      <div class="tborder-top" :style="style"></div>
      <div class="border-box" :style="style">
        <div class="bordertop" :style="style"></div>
        <div class="borderright" :style="style"></div>
      </div>
    </div>
    <div class="gradient-corner-top-right" :style="style"></div>
    <div class="gradient-corner-bottom-left" :style="style"></div>
    <div class="gradient-corner-bottom-right" :style="style"></div>
    <div class="gradient-top-bottom" :style="tbStyle"></div>
    <div class="gradient-left-right" :style="lrStyle"></div>
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
    return {};
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
        '--offset-top': -this.config.width + 22 + 'px',
        '--color': this.config.color,
        '--cocolor': this.config.cocolor,
        '--cornersize': this.config.cornersize + 'px'
      };
    },
    tbStyle() {
      return {
        '--border-width': this.config.width + 'px',
        '--width': 'calc(100% - ' + 2 * (this.config.cornersize - this.config.width) + 'px)',
        '--height': 'calc(100% + ' + (2 * this.config.width - 21) + 'px)',
        '--offset-left': this.config.cornersize - this.config.width + 'px',
        '--offset-top': -this.config.width + 22 + 'px',
        '--color': this.config.cocolor,
        '--cornersize': this.config.cornersize + 'px'
      };
    },
    lrStyle() {
      return {
        '--border-width': this.config.width + 'px',
        '--height': 'calc(100% - ' + (2 * (this.config.cornersize - this.config.width) + 8) + 'px)',
        '--width': 'calc(100% + ' + 2 * this.config.width + 'px)',
        '--offset-top': this.config.cornersize - this.config.width + 16 + 'px',
        '--offset-left': -this.config.width + 'px',
        '--color': this.config.cocolor,
        '--cornersize': this.config.cornersize + 'px'
      };
    },
    titleStyle() {
      return {
        '--color': this.config.titlecolor,
        '--font-size': this.config.titlefontsize + 'px'
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.title {
  position: absolute;
  z-index: 2;
  left: 20px;
  font-weight: bold;
  color: var(--color);
  font-size: var(--font-size);
}
.gradient-top {
  width: 100%;
  position: absolute;
  left: -2px;
  .lborder{
    height: 31px;
    width: var(--width);
    background: var(--cocolor);
    transform: rotate(33deg);
    position: absolute;
    top: -6px;
    left: 9px; 
  }
  .tborder{
    width: 214px;
    height: var(--width);
    background: var(--cocolor);
    position: absolute;
    z-index: 1;
    left: 18px;
    top: -5px;
  }
  .tborder-top{
    width: calc(100% - 268px);
    height:  var(--width);
    background: var(--cocolor);
    position: absolute;
    right: 0px;
    top: 21px;
  }
  .border-box{
    display: block;
    position: absolute;
    width: 250px;
    height: 0px;
    left: 1px;
    top: -5px;
    z-index: 1;
    .bordertop{
      position: absolute;
      width: 40px;
      top: -1px;
      right: -1px;
      border-top: 2px solid var(--color);
    }
    .borderright{
      position: absolute;
      height: 32px;
      top: -3px;
      right: -11px;
      border-right: 2px solid var(--color);
      transform: rotate(149deg);
    }
  }
}
.gradient-corner-top-left,
.gradient-corner-top-right,
.gradient-corner-bottom-left,
.gradient-corner-bottom-right {
  width: var(--cornersize);
  height: var(--cornersize);
  position: absolute;
}
.gradient-corner-top-left {
  top: var(--offset);
  left: var(--offset);
  border-top: var(--width) solid var(--color);
  border-left: var(--width) solid var(--color);
}
.gradient-corner-top-right {
  top: var(--offset-top);
  right: var(--offset);
  border-top: var(--width) solid var(--color);
  border-right: var(--width) solid var(--color);
}
.gradient-corner-bottom-left {
  bottom: var(--offset);
  left: var(--offset);
  border-bottom: var(--width) solid var(--color);
  border-left: var(--width) solid var(--color);
}
.gradient-corner-bottom-right {
  bottom: var(--offset);
  right: var(--offset);
  border-bottom: var(--width) solid var(--color);
  border-right: var(--width) solid var(--color);
}

.gradient-top-bottom {
  position: absolute;
  width: var(--width);
  height: var(--height);
  left: var(--offset-left);
  top: var(--offset-top);
  border-bottom: var(--border-width) solid var(--color);
}

.gradient-left-right {
  position: absolute;
  width: var(--width);
  height: var(--height);
  left: var(--offset-left);
  top: var(--offset-top);
  border-left: var(--border-width) solid var(--color);
  border-right: var(--border-width) solid var(--color);
}
</style>
