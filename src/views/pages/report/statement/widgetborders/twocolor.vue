<template>
  <div class="box">
    <div class="box-before" :style="beforeStyle"></div>
    <div class="box-after" :style="afterStyle"></div>
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
    beforeStyle() {
      return {
        '--color': this.config.coloralpha,
        '--offset': this.config.offset + 'px',
        '--translate-offset': -this.config.width + 'px',
        '--border-width': 'calc(100% + ' + this.config.width * 2 + 'px)',
        '--border-height': 'calc(100% + ' + this.config.width * 2 + 'px)',
        '--delay': this.config.delay + 's'
      };
    },
    afterStyle() {
      return {
        '--color': this.config.colorbeta,
        '--offset': this.config.offset + 'px',
        '--translate-offset': -this.config.width + 'px',
        '--border-width': 'calc(100% + ' + this.config.width * 2 + 'px)',
        '--border-height': 'calc(100% + ' + this.config.width * 2 + 'px)',
        '--delay': this.config.delay + 's',
        '--crossdelay': -(this.config.delay / 2) + 's'
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.box {
  width: 100%;
  height: 100%;
  position: relative;
  box-shadow: 10px 10px 42px 0 rgba(0, 0, 0, 0.75);
}
.box-after,
.box-before {
  mix-blend-mode: multiply;
  filter: none;
  z-index: -1;
  width: var(--border-width);
  height: var(--border-height);
  position: absolute;
  display: block;
  animation: border var(--delay) ease-in-out infinite;
  transform: translateX(var(--translate-offset)) translateY(var(--translate-offset));
}

@keyframes border {
  0%,
  100% {
    //-webkit-clip-path: polygon(0 0, calc(100% - (10px)) calc(0% + (10px)), 100% 100%, calc(0% + (10px)) calc(100% - (10px)));
    clip-path: polygon(0 0, calc(100% - var(--offset)) calc(0% + var(--offset)), 100% 100%, calc(0% + var(--offset)) calc(100% - var(--offset)));
  }
  50% {
    //-webkit-clip-path: polygon(calc(0% + var(--offset)) calc(0% + var(--offset)), 100% 0, calc(100% - var(--offset)) calc(100% - var(--offset)), 0 100%);
    clip-path: polygon(calc(0% + var(--offset)) calc(0% + var(--offset)), 100% 0, calc(100% - var(--offset)) calc(100% - var(--offset)), 0 100%);
  }
}

.box-after {
  animation-delay: var(--crossdelay);
  background-color: var(--color);
  clip-path: polygon(0 0, calc(100% - var(--offset)) calc(0% + var(--offset)), 100% 100%, calc(0% + var(--offset)) calc(100% - var(--offset)));
}
.box-before {
  background-color: var(--color);
  clip-path: polygon(calc(0% + var(--offset)) calc(0% + var(--offset)), 100% 0, calc(100% - var(--offset)) calc(100% - var(--offset)), 0 100%);
}
</style>
