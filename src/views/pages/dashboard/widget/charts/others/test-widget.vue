<template>
  <div>
    <Particles :id="widget.uuid" :style="{ width: width + 'px', height: height + 'px' }" :options="options" />
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    width: { type: Number }, //真实宽度，减去外层的边距
    height: { tyoe: Number }, //真实高度，减去外层的边距
    widget: { type: Object }, //组件配置
    widgetComponent: { type: Object } //组件数据
  },
  data() {
    return {
      options: {
        detectRetina: true,
        background: {
          color: {
            value: 'tansparent'
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
          rate: { delay: 0.5, quantity: 1 },
          position: { y: this.height, x: this.width / 2 }
        },
        particles: {
          number: {
            value: 0
          },
          color: {
            value: 'random',
            animation: {
              enable: true,
              speed: 40,
              sync: true
            }
          },
          move: {
            enable: true,
            gravity: {
              acceleration: 15,
              enable: true,
              inverse: true,
              maxSpeed: 10
            },
            trail: {
              fillColor: '#000',
              enable: true,
              length: 30
            }
          },
          shape: {
            type: 'line'
            /*polygon: {
              sides: 5
            }*/
          },
          stroke: {
            color: {
              value: 'random',
              animation: {
                enable: true,
                speed: 40,
                sync: true
              }
            },
            width: 1
          },
          rotate: { path: true },
          size: {
            value: {
              min: 0.1,
              max: 50
            },
            animation: {
              enable: true,
              sync: true,
              speed: 90,
              startValue: 'max',
              destroy: 'min'
            }
          },
          destroy: {
            mode: 'split',
            split: {
              count: 1,
              factor: {
                value: 0.333333
              },
              rate: {
                value: 10
              },
              particles: {
                stroke: { width: 0 },
                color: { value: ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'] },
                number: { value: 0 },
                collisions: { enable: !1 },
                opacity: { value: { min: 0.1, max: 1 }, animation: { enable: !0, speed: 0.7, sync: !1, startValue: 'max', destroy: 'min' } },
                shape: { type: 'circle' },
                size: { value: 2, animation: { enable: false } },
                life: {
                  count: 1,
                  duration: { value: { min: 1, max: 2 } }
                },
                move: {
                  enable: true,
                  gravity: {
                    enable: false
                  },
                  speed: 2,
                  direction: 'none',
                  random: true,
                  straight: true,
                  outMode: 'destroy'
                }
              }
            }
          }
          /*links: {
            enable: true,
            distance: 100,
            color: {
              value: 'random',
              animation: {
                enable: true,
                speed: 40,
                sync: true
              }
            },
            opacity: 0.4,
            width: 1
          }*/
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
