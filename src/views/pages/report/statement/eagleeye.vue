<template>
  <div
    class="bg-block radius-md"
    :style="{position:'relative',
             width: canvasWidth + 'px',
             height: canvasHeight + 'px'}"
    @mousemove="onGrab"
    @mouseleave="endGrab"
  >
    <div
      class="radius-md"
      :style="{ width: canvasWidth + 'px',
                height: canvasHeight + 'px',
                background: 'yellow', 
                position: 'absolute',
                'z-index':1,
                top: '0px',
                left: '0px',
                background: reportData.config.backgroundColor, 
                'background-size': reportData.config.backgroundImageLayout == 'resize' ? '100% 100%' : 'auto',
                'background-image': reportData.config.backgroundImage?'url(' + reportData.config.backgroundImage + ')':'none', 
      }"
    ></div>
    <div
      :style="{ width: containerWidth + 'px',
                height: containerHeight + 'px', 
                'z-index':9999,
                'cursor':'move',
                opacity:0.2,
                position: 'absolute',
                top: containerTop+'px', left: containerLeft+'px' }"
      class="bg-success"
      @mousedown="startGrab"
      @mouseup="endGrab"
    ></div>
    <div
      v-for="(widget,index) in reportData.widgetList"
      :key="index"
      :class="widget._selected?'bg-error':'bg-gray'"
      :style="{position:'absolute',
               'z-index':widget.zindex,
               opacity:0.3,
               width:(widget.width*ratio)+'px',
               height:(widget.height*ratio)+'px',
               top:(widget.y*ratio)+'px',
               left:(widget.x*ratio)+'px'}"
    >
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    config: { type: Object },
    reportData: {type: Object}
  },
  data() {
    return {
      height: 152,
      width: 270,
      containerTop: 0,
      containerLeft: 0,
      canvasWidth: 0,
      canvasHeight: 0,
      containerWidth: 0,
      containerHeight: 0,
      ratio: 0,
      isGrabing: false,
      mouseX: 0,
      mouseY: 0
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
  methods: {
    startGrab() {
      this.isGrabing = true;
      this.mouseX = event.clientX;
      this.mouseY = event.clientY;
    },
    onGrab(event) {
      if (this.isGrabing) {
        const x = event.clientX;
        const y = event.clientY;
        const dx = x - this.mouseX;
        const dy = y - this.mouseY;
        this.$emit('grab', -dx / this.ratio, -dy / this.ratio);
        this.mouseX = x;
        this.mouseY = y;
      }
    },
    endGrab() {
      this.isGrabing = false;
    }
  },
  filter: {},
  computed: {},
  watch: {
    config: {
      handler: function(val) {
        const config = val;
        if (config.canvasWidth && config.canvasHeight) {
          const widthratio = this.width / config.canvasWidth;
          const heightratio = this.height / config.canvasHeight;
          if (widthratio < heightratio) {
            this.canvasWidth = this.width;
            this.canvasHeight = config.canvasHeight * widthratio;
            this.ratio = widthratio;
          } else {
            this.canvasWidth = config.canvasWidth * heightratio;
            this.canvasHeight = this.height;
            this.ratio = heightratio;
          }
        }
        this.containerWidth = this.ratio * config.containerWidth;
        this.containerHeight = this.ratio * config.containerHeight;
        this.containerTop = -this.ratio * config.containerTop;
        this.containerLeft = -this.ratio * config.containerLeft;
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less"></style>
