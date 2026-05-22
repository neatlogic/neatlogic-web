<template>
  <div class="time-widget" :style="timeContainerStyle">
    <span class="tsfont-formtime" :style="getTimeStyle">  {{ currentTime | formatDate }}</span>
  </div>
</template>
<script>
import { WidgetBase } from '../widget-base.js';
export default {
  name: '',
  components: {},
  extends: WidgetBase,
  props: {
  },
  data() {
    return {
      currentTime: '',
      timer: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.updateTime();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    clearInterval(this.timer);
  },
  destroyed() {},
  methods: {
    updateTime() {
      this.currentTime = Date.now();
      this.timer = setInterval(() => {
        this.currentTime = Date.now();
      }, 1000);
    }
  },
  filter: {},
  computed: {
    getTimeStyle() {
      const config = (this.widget && this.widget.config) || {};
      return {
        fontSize: config.fontsize ? `${config.fontsize}px` : '14px',
        color: config.fontcolor || config.color
      };
    },
    timeContainerStyle() {
      const config = (this.widget && this.widget.config) || {};
      const horizontalAlignMap = {
        left: 'flex-start',
        center: 'center',
        right: 'flex-end'
      };
      const verticalAlignMap = {
        top: 'flex-start',
        middle: 'center',
        bottom: 'flex-end'
      };
      return {
        justifyContent: horizontalAlignMap[config.align] || 'flex-start',
        alignItems: verticalAlignMap[config.verticalAlign] || 'flex-start'
      };
    }
  },
  watch: {
  }
};
</script>
<style lang="less" scoped>
.time-widget {
  display: flex;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
}
</style>
