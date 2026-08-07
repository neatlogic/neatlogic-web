<template>
  <div
    class="text-widget"
    :class="textWidgetClass"
    :style="containerStyle"
  >
    <template v-if="isDecorateTitle && content">
      <div class="title-main">{{ content }}</div>
      <div v-if="widget.config && widget.config.subTitle" class="title-sub">{{ widget.config.subTitle }}</div>
      <div v-if="widget.config && widget.config.showLine" class="title-line"><span></span></div>
    </template>
    <pre v-else-if="content" :style="style" class="content">{{ content }}</pre>
    <span v-else class="text-grey">{{ $t('term.report.describe.inputtext') }}</span>
  </div>
</template>
<script>
import { WidgetBase } from '../widget-base.js';
import { isTitleTemplate } from './text-title-template.js';
export default {
  name: '',
  components: {},
  extends: WidgetBase,
  props: {},
  data() {
    return {
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
    style() {
      const style = {};
      if (this.widget.config) {
        if (this.widget.config.fontsize) {
          style['font-size'] = this.widget.config.fontsize + 'px';
        }
        if (this.widget.config.color) {
          style['color'] = this.widget.config.color;
        }
        if (this.widget.config.align) {
          style['text-align'] = this.widget.config.align;
        }
      }
      return style;
    },
    titleTemplate() {
      return this.widget.config && this.widget.config.titleTemplate ? this.widget.config.titleTemplate : 'plain';
    },
    isDecorateTitle() {
      return isTitleTemplate(this.titleTemplate);
    },
    textWidgetClass() {
      return {
        [`template-${this.titleTemplate}`]: true,
        [`align-${this.widget.config && this.widget.config.align ? this.widget.config.align : 'left'}`]: true
      };
    },
    containerStyle() {
      const config = this.widget.config || {};
      return {
        '--text-font-color': config.color || '#e9fbff',
        '--text-primary-color': this.widget.color || '#00e5ff',
        '--text-accent-color': this.widget.accentColor || '#00ffa8',
        '--text-font-size': `${config.fontsize || (this.isDecorateTitle ? 30 : 12)}px`,
        'background-color': config.backgroundColor,
        'background-size': 'auto',
        'background-image': config.backgroundImage ? `url(${config.backgroundImage})` : ''
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.text-widget {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.content {
  word-break: break-all;
  margin: 0px;
  user-select: none;
}
.align-left {
  text-align: left;
}
.align-center {
  text-align: center;
}
.align-right {
  text-align: right;
}
.title-main {
  position: relative;
  display: inline-block;
  color: var(--text-font-color);
  font-size: var(--text-font-size);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: 0;
  text-shadow: 0 0 16px fade(#00e5ff, 56%);
}
.title-sub {
  margin-top: 6px;
  color: var(--text-font-color);
  opacity: 0.72;
  font-size: 12px;
  letter-spacing: 0;
}
.title-line {
  position: relative;
  height: 8px;
  margin-top: 8px;
  background: linear-gradient(90deg, transparent, fade(#00e5ff, 35%), transparent);
}
.title-line span {
  position: absolute;
  top: 3px;
  left: 50%;
  width: 80px;
  height: 2px;
  transform: translateX(-50%);
  background: linear-gradient(90deg, var(--text-primary-color), var(--text-accent-color));
  box-shadow: 0 0 14px fade(#00e5ff, 55%);
}
.template-glowLine,
.template-doubleWing,
.template-leftBar,
.template-techBlock,
.template-bottomBeam {
  padding: 8px 18px;
  color: var(--text-font-color);
}
.template-glowLine .title-main::before,
.template-glowLine .title-main::after,
.template-doubleWing .title-main::before,
.template-doubleWing .title-main::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 34px;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--text-primary-color));
}
.template-glowLine .title-main::before,
.template-doubleWing .title-main::before {
  right: calc(100% + 14px);
}
.template-glowLine .title-main::after,
.template-doubleWing .title-main::after {
  left: calc(100% + 14px);
  transform: rotate(180deg);
}
.template-doubleWing .title-main::before,
.template-doubleWing .title-main::after {
  width: 58px;
  height: 4px;
  clip-path: polygon(0 50%, 16% 0, 100% 0, 84% 100%, 16% 100%);
}
.template-leftBar .title-main {
  padding-left: 16px;
}
.template-leftBar .title-main::before {
  content: '';
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 0;
  width: 4px;
  background: linear-gradient(180deg, var(--text-primary-color), var(--text-accent-color));
  box-shadow: 0 0 12px fade(#00e5ff, 60%);
}
.template-techBlock .title-main {
  padding: 8px 20px;
  border: 1px solid fade(#00e5ff, 70%);
  background: linear-gradient(90deg, fade(#00e5ff, 18%), fade(#00ffa8, 8%));
  box-shadow: inset 0 0 18px fade(#00e5ff, 18%);
}
.template-techBlock .title-main::before,
.template-techBlock .title-main::after {
  content: '';
  position: absolute;
  top: -1px;
  width: 12px;
  height: 12px;
  border-top: 2px solid var(--text-accent-color);
}
.template-techBlock .title-main::before {
  left: -1px;
  border-left: 2px solid var(--text-accent-color);
}
.template-techBlock .title-main::after {
  right: -1px;
  border-right: 2px solid var(--text-accent-color);
}
.template-bottomBeam .title-main {
  padding-bottom: 10px;
}
.template-bottomBeam .title-main::after {
  content: '';
  position: absolute;
  right: 10%;
  bottom: 0;
  left: 10%;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--text-primary-color), var(--text-accent-color), transparent);
  box-shadow: 0 0 16px fade(#00e5ff, 60%);
}
</style>
