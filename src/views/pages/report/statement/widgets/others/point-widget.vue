<template>
  <div>
    <Particles
      :id="widget.uuid"
      ref="particle"
      :particlesInit="particlesInit"
      :particlesLoaded="particlesLoaded"
      :style="{ width: width + 'px', height: height + 'px' }"
      :options="options"
    />
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    width: { type: Number }, //真实宽度，减去外层的边距
    height: { type: Number }, //真实高度，减去外层的边距
    widget: { type: Object }, //组件配置
    widgetComponent: { type: Object } //组件数据
  },
  data() {
    const _this = this;
    return {
      particleObj: null,
      particleContainer: null,
      options: {
        background: {
          color: {
            value: ''
          },
          opacity: 1
        },
        fullScreen: {
          enable: false,
          zIndex: 1
        },
        detectRetina: true,
        duration: 0,
        fpsLimit: 120,
        particles: {
          /*color: {
            value: 'random'
          },
          number: {
            value: 1
          },
          move: {
            enable: true
          },
          shape: {
            type: 'circle'
          },
          size: {
            value: 10
          },
          stroke: {
            width: 0
          }*/
        }
      }
    };
  },
  beforeCreate() {},
  created() {
    Object.assign(this.options.particles, this.widget.config.particles);
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    particlesInit(particleObj) {
      this.particleObj = particleObj;
    },
    particlesLoaded(particleContainer) {
      this.particleContainer = particleContainer;
    }
  },
  filter: {},
  computed: {},
  watch: {
    'widget.config.background.color.value': {
      handler: function(val) {
        if (this.particleContainer && this.particleContainer.options) {
          if (val) {
            this.particleContainer.options.background.color.value = val;
          } else {
            this.particleContainer.options.background.color.value = 'transparent';
          }
          this.particleContainer.refresh();
        }
      },
      deep: true
    },
    'widget.config.particles.isRandomColor': {
      handler: function(val) {
        if (val) {
          this.$set(this.particleContainer.options.particles.color, 'value', 'random');
        } else {
          this.$set(this.particleContainer.options.particles.color, 'value', this.widget?.config?.particles?.color?.value || '');
        }
        this.particleContainer.refresh();
      },
      deep: true
    },
    'widget.config.particles.color.value': {
      handler: function(val) {
        this.$set(this.particleContainer.options.particles.color, 'value', val);
        this.particleContainer.refresh();
      },
      deep: true
    },
    'widget.config.particles.number.value': {
      handler: function(val) {
        this.$set(this.particleContainer.options.particles.number, 'value', val);
        this.particleContainer.refresh();
      },
      deep: true
    },
    'widget.config.particles.opacity.value': {
      handler: function(val) {
        this.$set(this.particleContainer.options.particles.opacity, 'value', val);
        this.particleContainer.refresh();
      },
      deep: true
    },
    'widget.config.particles.size.value': {
      handler: function(val) {
        this.$set(this.particleContainer.options.particles.size, 'value', val);
        this.particleContainer.refresh();
      },
      deep: true
    },
    'widget.config.particles.links.enable': {
      handler: function(val) {
        this.$set(this.particleContainer.options.particles.links, 'enable', val);
        this.particleContainer.refresh();
      },
      deep: true
    },
    'widget.config.particles.links.isRandomColor': {
      handler: function(val) {
        if (val) {
          this.$set(this.particleContainer.options.particles.links.color, 'value', 'random');
        } else {
          this.$set(this.particleContainer.options.particles.links.color, 'value', this.widget?.config?.particles?.links?.color?.value || '');
        }
        this.particleContainer.refresh();
      },
      deep: true
    },
    'widget.config.particles.links.color.value': {
      handler: function(val) {
        this.$set(this.particleContainer.options.particles.links.color, 'value', val);
        this.particleContainer.refresh();
      },
      deep: true
    },
    'widget.config.particles.links.opacity': {
      handler: function(val) {
        this.$set(this.particleContainer.options.particles.links, 'opacity', val);
        this.particleContainer.refresh();
      },
      deep: true
    },
    'widget.config.particles.links.width': {
      handler: function(val) {
        this.$set(this.particleContainer.options.particles.links, 'width', val);
        this.particleContainer.refresh();
      },
      deep: true
    },
    'widget.config.particles.links.distance': {
      handler: function(val) {
        this.$set(this.particleContainer.options.particles.links, 'distance', val);
        this.particleContainer.refresh();
      },
      deep: true
    },
    'widget.config.particles.move.enable': {
      handler: function(val) {
        this.$set(this.particleContainer.options.particles.move, 'enable', val);
        this.particleContainer.refresh();
      },
      deep: true
    }
  }
};
</script>
<style lang="less"></style>
