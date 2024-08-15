<template>
  <div>
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
      this.timer = setInterval(() => {
        this.currentTime = Date.now();
      }, 1000);
    }
  },
  filter: {},
  computed: {
    getTimeStyle() {
      return {
        fontSize: this.widget && this.widget.config && this.widget.config.fontsize ? `${this.widget.config.fontsize}px` : '14px',
        color: this.widget && this.widget.config && this.widget.config.fontcolor
      };
    }
  },
  watch: {
  }
};
</script>
<style lang="less"></style>
