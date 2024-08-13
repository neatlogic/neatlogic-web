<template>
  <div ref="container">
    <span class="tsfont-formtime" :style="getStyle">  {{ currentTime | formatDate }}</span>
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
      plot: null,
      chartConfig: {
        theme: this.canvas.config.theme
      },
      currentTime: '',
      timer: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    console.log(this.widget.config);
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
      this.timer = setInterval(() => {
        this.currentTime = Date.now();
        console.log('时间倒计时');
      }, 1000);
    }
  },
  filter: {},
  computed: {
    getStyle() {
      return {
        fontSize: this.widget.config.fontsize + 'px',
        color: this.widget.config.fontcolor
      };
    }
  },
  watch: {
  }
};
</script>
<style lang="less"></style>
