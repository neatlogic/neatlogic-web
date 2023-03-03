<template>
  <div>
    <Particles :id="widget.uuid" :style="{width:width+'px',height:height+'px'}" :options="options" />
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    width: {type: Number}, //真实宽度，减去外层的边距
    height: {tyoe: Number}, //真实高度，减去外层的边距
    widget: { type: Object }, //组件配置
    widgetComponent: { type: Object } //组件数据
  },
  data() {
    return {
      options: {
        detectRetina: !0,
        background: {
          color: {
            value: 'transparent'
          },
          opacity: 1
        },
        fpsLimit: 120,
        fullScreen: {
          enable: false,
          zIndex: 1
        },
        emitters: {
          direction: 'top',
          life: {
            count: 0,
            duration: 0.1,
            delay: 0.1
          },
          rate: { delay: 0.5, quantity: 1 },
          size: { width: 100, height: 0 },
          position: { y: 100, x: 50 }
        },
        particles: {
          number: {
            value: 0
          },
          destroy: {
            mode: 'split',
            split: {
              count: 1,
              factor: {
                value: 0.333333
              },
              rate: {
                value: 100
              },
              particles: {
                stroke: { width: 0 },
                color: { value: ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'] },
                number: { value: 0 },
                collisions: { enable: !1 },
                opacity: { value: { min: 0.1, max: 1 }, animation: { enable: !0, speed: 0.7, sync: !1, startValue: 'max', destroy: 'min' } },
                shape: { type: 'circle' },
                size: { value: 2, animation: { enable: !1 } },
                life: { count: 1, duration: { value: { min: 1, max: 2 } } },
                move: { enable: !0, gravity: { enable: !1 }, speed: 2, direction: 'none', random: !0, straight: !1, outMode: 'destroy' }
              }
            }
          },
          life: { count: 1 },
          shape: { type: 'line' },
          size: {
            value: {
              min: 0.1,
              max: 50
            },
            animation: {
              enable: !0,
              sync: !0,
              speed: 90,
              startValue: 'max',
              destroy: 'min'
            }
          },
          stroke: {
            color: {
              value: '#ffffff'
            },
            width: 1
          },
          rotate: { path: !0 },
          move: {
            enable: !0,
            gravity: {
              acceleration: 15,
              enable: !0,
              inverse: !0,
              maxSpeed: 100
            },
            speed: {
              min: 10,
              max: 20
            },
            outModes: {
              default: 'destroy',
              top: 'none'
            },
            trail: {
              fillColor: '#000',
              enable: !0,
              length: 10
            }
          }
        }
      }
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
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
