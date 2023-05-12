<template>
  <div v-if="data && data.length > 0" class="clearfix overflow">
    <div
      v-for="(item, index) in data"
      :key="index"
      class="float-left"
      style="position:relative;"
      :style="containerStyle(index, data.length)"
    >
      <div v-if="item.text" :style="textStyle">
        {{ item.text }}
      </div>
      <div v-if="typeof item.number != 'undefined'" :style="numberStyle">
        {{ item.number }}
      </div>
      <div v-if="widget.config.backgroundImage" :style="backgroundImageStyle"></div>
      <div v-if="widget.config.backgroundColor" :style="backgroundColorStyle"></div>
    </div>
  </div>
  <div v-else class="clearfix overflow">
    <div class="float-left" style="position:relative" :style="containerStyle(0, 1)">
      <div :style="numberStyle">{{ $t('page.nodata') }}</div>
      <div v-if="widget.config.backgroundImage" :style="backgroundImageStyle"></div>
      <div v-if="widget.config.backgroundColor" :style="backgroundColorStyle"></div>
    </div>
  </div>
</template>
<script>
import { WidgetBase } from '../widget-base.js';
export default {
  name: '',
  components: {},
  extends: WidgetBase,
  props: {},
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
    content() {
      let content = '';
      if (this.data && this.data.length > 0) {
        this.data.forEach(d => {
          content = d['text'] || '';
          return false;
        });
      }
      return content;
    },
    backgroundImageStyle() {
      const style = {
        position: 'absolute',
        height: '100%',
        width: '100%',
        top: '0px',
        left: '0px',
        'background-repeat': 'no-repeat',
        'background-size': 'contain',
        'z-index': 2
      };
      if (this.widget.config) {
        if (this.widget.config.backgroundImage) {
          style['background-image'] = 'url(' + this.widget.config.backgroundImage + ')';
        }
        if (this.widget.config.radius) {
          style['border-radius'] = this.widget.config.radius + 'px';
        }
      }
      return style;
    },
    backgroundColorStyle() {
      const style = {
        position: 'absolute',
        height: '100%',
        width: '100%',
        top: '0px',
        left: '0px',
        'z-index': 1
      };
      if (this.widget.config) {
        if (this.widget.config.backgroundColor) {
          style['background-color'] = this.widget.config.backgroundColor;
        }
        if (this.widget.config.radius) {
          style['border-radius'] = this.widget.config.radius + 'px';
        }
      }
      return style;
    },
    containerStyle() {
      return (index, length) => {
        const style = {};
        style['height'] = '100%';
        if (this.widget.config) {
          style['width'] = 'calc(' + (100 / length + '%') + ' - ' + ((this.widget.config.margin * (length - 1)) / length || 0) + 'px)';
          if (this.widget.config.margin && index !== length - 1) {
            style['margin-right'] = this.widget.config.margin + 'px';
          }
          if (this.widget.config.padding) {
            style['padding'] = this.widget.config.padding + 'px';
          }
          if (this.widget.config.radius) {
            style['border-radius'] = this.widget.config.radius + 'px';
          }
        }
        return style;
      };
    },
    textStyle() {
      const style = {};
      if (this.widget.config) {
        if (this.widget.config.textFontSize) {
          style['font-size'] = this.widget.config.textFontSize + 'px';
        }
        if (this.widget.config.textFontColor) {
          style['color'] = this.widget.config.textFontColor;
        }
        if (this.widget.config.align) {
          style['text-align'] = this.widget.config.align;
        }
      }
      return style;
    },
    numberStyle() {
      const style = {};
      if (this.widget.config) {
        if (this.widget.config.numberFontSize) {
          style['font-size'] = this.widget.config.numberFontSize + 'px';
        }
        if (this.widget.config.numberFontColor) {
          style['color'] = this.widget.config.numberFontColor;
        }
        if (this.widget.config.align) {
          style['text-align'] = this.widget.config.align;
        }
      }
      return style;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.content {
  word-break: break-all;
  margin: 0px;
  user-select: none;
}
.grid {
  display: grid;
}
</style>
