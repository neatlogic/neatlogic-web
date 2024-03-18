
<template>
  <div v-if="shape=='ripple'" :class="prefix+'container' +(sizeList.includes(size)?(' '+size):'')+(colorList.includes(color)?(' status-'+color):'')" :style="getOuterStyle">
    <div :class="{animate:animate,'sg-liquid-wave sg-liquid-wave-light':prefix}" :style="getWaveStyle('light')"></div>
    <div :class="{animate:animate,'sg-liquid-wave sg-liquid-wave-normal':prefix}" :style="getWaveStyle('normal')"></div>
    <div :class="{animate:animate,'sg-liquid-wave sg-liquid-wave-dark':prefix}" :style="getWaveStyle('dark')"></div>
    <div v-if="showText" :class="`${prefix}text`"><slot><div :style="getTextStyle(size)" :class="{'text-op':percent>50}">{{ percent }}%</div></slot></div>
  </div>
  <div v-else-if="shape=='circle'">
    <i-circle
      :percent="percent>=100?100:percent"
      :size="size"
      v-bind="config"
      trail-color="#F2F4F5"
    >
      <i class="inner-icon" :class="config.icon" :style="{'font-size':size+'px','color':config['stroke-color']}"></i>
    </i-circle>
  </div>
  <!-- <div v-else-if="shape=='progress'" class="com-status"> -->
  <div v-else-if="shape=='progress'">
    <div class="div-propress" :class="[getProgress.bgClass]">
      <span v-if="getProgress.position=='left'" class="propress-text"> {{ percent }}% </span> 
      <Progress
        :percent="percent>=100?100:percent"
        :stroke-width="size"
        class="test"
        :hide-info="getProgress.position=='left' || config['hide-info']?true:false"
        v-bind="getProgress"
      />
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  filters: {},
  props: {
    size: {//水波纹的外层大小，[large,normal,small]，或者具体的px(字符串，长宽必须相等)
      type: [String, Number],
      default: 'normal'
    },
    color: {//水波纹颜色，默认主题色
      type: String,
      default: 'primary'
    },
    percent: {//百分比，不带单位
      type: Number
    },
    animate: {
      type: Boolean,
      default: true      
    },
    shape: {//形状，[circle圆形 ，ripple水波纹，progress进度条]
      type: String,
      default: 'progress'      
    },
    showText: {//是否显示百分比
      type: Boolean,
      default: false        
    },
    config: {
      type: Object
    }
  },
  data() {
    return {
      prefix: 'sg-liquid-',
      sizeList: ['large', 'normal', 'small'],
      colorList: ['info', 'primary', 'success', 'warning', 'danger']
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
  computed: {
    getOuterStyle() {
      let styleCss = {};
      if (!this.sizeList.includes(this.size)) {
        Object.assign(styleCss, {
          width: typeof this.size == 'number' ? (this.size + 'px') : this.size,
          height: typeof this.size == 'number' ? (this.size + 'px') : this.size
        });
      }
      if (!this.colorList.includes(this.color)) {
        Object.assign(styleCss, {
          'border-color': this.color,
          'color': this.color
        });
      }
      return styleCss;
    },
    getWaveStyle() {
      return function(type) {
        let styleCss = {};
        if (!this.colorList.includes(this.color)) {
          Object.assign(styleCss, {
            'background': this.color
          });
        }
        if (this.percent) {
          let percent = Math.min(100, this.percent);
          let heightper = 100 - (type == 'light' ? parseFloat(Math.max(percent - 10, 0)) : (type == 'dark' ? parseFloat(Math.min(percent + 10, 100)) : percent));
          Object.assign(styleCss, {
            'top': heightper + '%'
          });      
        }
        return styleCss;
      };
    },
    getTextStyle() {
      return function(size) {
        let styleObj = {
          'line-height': typeof this.size == 'number' ? (this.size + 'px') : this.size
        };
        if (!this.sizeList.includes(size) && typeof size == 'number') {
          let scaleSize = size / 34;
          Object.assign(styleObj, {
            'transform': 'scale(' + scaleSize + ')'
          });
        }
        return styleObj;
      };
    },
    getProgress() {
      let config = {position: 'left', ...this.config};
      config.bgClass = 'progress-' + config.status;
      if (['normal', 'active', 'wrong', 'success'].indexOf(config.status) < 0) { delete config.status; }//兼容ivue的status值
      if (!config.status) {
        this.percent >= 100 && (config.status = 'success');
      }
      return config;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
@prefix: sg-liquid-;
.@{prefix}container{
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border-width: 1px;
  border-style: solid;
  text-align: center;
  overflow: hidden;
  animation: water-wave linear infinite;
  display: inline-block;
  .@{prefix}text{
    position: relative;
  }
  .@{prefix}wave{
    position: absolute;
    left: -25%;
    opacity: 0.7;
    width: 200%;
    height: 200%;
    top:100%;
    &.animate{
      transition: all .5s;
      animation: inherit;
    }
    &.@{prefix}wave-light{
      border-top-style: 2%;
      opacity: 0.3;
      border-radius: 40%;
      &.animate{
        animation-duration: 5s;
      }
    }
    &.@{prefix}wave-normal{
      top: 99%;
      opacity: 0.5;
      
      border-radius: 35%;
      &.animate{
        animation-duration: 7s;      
      }
    }
    &.@{prefix}wave-dark{
      top: 100%;
      opacity: 0.8;
      border-radius: 33%;
      &.animate{
        animation-duration: 11s;
      }
    }
  }
}
.inner-icon::before{
   transform: scale(0.4);
}
.div-propress{
  padding-left: 38px;
  position: relative;
  .propress-text{
    width: 38px;
    position: absolute;
    left: 0;
    top: 2px;
  }
}
</style>
