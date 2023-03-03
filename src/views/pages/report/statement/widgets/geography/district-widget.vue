<template>
  <div :id="widget.uuid" ref="container" :style="{ position: 'relative', height: height + 'px', width: width + 'px' }"></div>
</template>
<script>
import { Scene } from '@antv/l7';
import { CountyLayer } from '@antv/l7-district';
import { Mapbox } from '@antv/l7-maps';
export default {
  name: '',
  components: {},
  props: {
    width: {type: Number},
    height: {type: Number},
    mode: { type: String }, //模式
    widget: { type: Object }, //组件配置
    widgetComponent: { type: Object } //组件数据
  },
  data() {
    return { 
      colors: ['#B8E1FF', '#7DAAFF', '#3D76DD', '#0047A5', '#001D70']
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    console.log(this.width, this.height);
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init() {
      this.$nextTick(() => {
        this.createPlot();
        console.log('load!');
      });
    },
    createPlot() {
      const scene = new Scene({
        id: this.$refs.container,
        logoVisible: false,
        map: new Mapbox({
          center: [113.145, 23.031],
          pitch: 0,
          style: 'blank',
          zoom: 3,
          minZoom: 3,
          maxZoom: 10
        })
      });
      scene.on('loaded', () => {
        new CountyLayer(scene, {
          data: [],
          adcode: ['440604', '440606', '440605'],
          depth: 3,
          label: {
            field: 'NAME_CHN'
          },
          fill: {
            color: {
              field: 'NAME_CHN',
              values: this.colors
            }
          },
          popup: {
            enable: true,
            Html: props => {
              return `<span>${props.NAME_CHN}</span>`;
            }
          }
        });
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.bg {
  background: radial-gradient(circle, #5a5a5a 0.5px, transparent 0.5px);
  background-size: 5px 5px;
}
</style>
