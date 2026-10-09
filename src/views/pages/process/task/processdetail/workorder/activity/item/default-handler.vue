<template>
  <div :class="{'activity-compare-full': config.oldContent && config.newContent}">
    <span class="left-label-text text-grey">{{ config.typeName }}</span>
    <span v-if="textShow(config) && textShow(config) ==$t('page.delete')" class="text-grey text-padding">{{ textShow(config) }}</span>
    <LongHtmlContent v-if="isLongHtml(config.oldContent)" :content="config.oldContent"></LongHtmlContent>
    <span v-else v-html="config.oldContent"></span>
    <span v-if="textShow(config) && textShow(config) !=$t('page.delete')" class="text-grey text-padding">{{ textShow(config) }}</span>
    <LongHtmlContent v-if="isLongHtml(config.newContent)" :content="config.newContent"></LongHtmlContent>
    <span v-else v-html="config.newContent"></span>
  </div>
</template>
<script>
import LongHtmlContent from '../../long-html-content.vue';
import {isLongHtml} from '../../long-html-content.js';
export default {
  name: '',
  components: {LongHtmlContent},
  filters: {},
  props: {
    config: Object
  },
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
  methods: {isLongHtml},
  computed: {
    textShow() {
      return function(config) {
        let text = null;
        if (config.oldContent && config.newContent) {
          text = this.$t('term.process.changeto');
        } else if (config.oldContent && !config.newContent) {
          text = this.$t('page.delete');
        } else {
          text = '';
        }
        return text;
      };
    }
  },
  watch: {}
};
</script>
<style lang='less' scoped>
.text-padding{
  padding: 0 8px;
}
</style>
