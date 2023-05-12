<template>
  <div class="box" :style="mainStyle">
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
    mainStyle() {
      return {
        '--translate-offset': -this.config.width + 'px',
        '--border-width': 'calc(100% + ' + this.config.width * 2 + 'px)',
        '--border-height': 'calc(100% + ' + this.config.width * 2 + 'px)',
        '--delay': this.config.delay + 's'
      };
    },
    beforeStyle() {
      return {
        '--translate-offset': -this.config.width + 'px',
        '--border-width': 'calc(100% + ' + this.config.width * 2 + 'px)',
        '--border-height': 'calc(100% + ' + this.config.width * 2 + 'px)',
        '--delay': this.config.delay + 's'
      };
    },
    afterStyle() {
      return {
        '--translate-offset': -this.config.width + 'px',
        '--border-width': 'calc(100% + ' + this.config.width * 2 + 'px)',
        '--border-height': 'calc(100% + ' + this.config.width * 2 + 'px)',
        '--delay': this.config.delay + 's'
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>

.box {
	position: relative;
	//margin: 300px auto 0;
	width: 100%;
	height: 100%;
	background: linear-gradient(0deg, #000, #272727);
}

.box-before, .box-after {
	position: absolute;
  transform: translateX(var(--translate-offset)) translateY(var(--translate-offset));
	background: linear-gradient(45deg, #fb0094, #0000ff, #00ff00,#ffff00, #ff0000, #fb0094, 
		#0000ff, #00ff00,#ffff00, #ff0000);
	background-size: 400%;
	width: var(--border-width);
	height: var(--border-height);
	z-index: -1;
	animation: steam var(--delay) linear infinite;
}

@keyframes steam {
	0% {
		background-position: 0 0;
	}
	50% {
		background-position: 400% 0;
	}
	100% {
		background-position: 0 0;
	}
}

.box-after {
	filter: blur(50px);
}
</style>
