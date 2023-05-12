<template>
  <div :style="{'background-color':widget.config.backgroundColor, 'background-size': 'auto', 'background-image': 'url(' + (widget.config && widget.config.backgroundImage) + ')' }">
    <pre v-if="content" :style="style" class="content">{{ content }}</pre>
    <span v-else class="text-grey">{{ $t('term.report.describe.inputtext') }}</span>
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
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
  },
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
    }
  },
  watch: {
  }
};
</script>
<style lang="less" scoped>
.content {
  word-break: break-all;
  margin: 0px;
  user-select: none;
}
</style>
