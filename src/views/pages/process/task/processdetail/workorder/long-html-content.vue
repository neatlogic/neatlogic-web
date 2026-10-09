<template>
  <div class="long-html-content">
    <template v-if="expanded">
      <div
        v-if="sanitize"
        v-imgViewer
        v-dompurify-html="content"
        class="ck-content"
      ></div>
      <div v-else v-html="content"></div>
    </template>
    <div v-else>{{ preview || $t('page.viewdetails') }}{{ preview ? '…' : '' }}</div>
    <button
      type="button"
      class="long-html-toggle text-href"
      :aria-expanded="String(expanded)"
      @click="expanded = !expanded"
    >
      {{ expanded ? $t('page.clickandputaway') : $t('page.viewmore') }}
    </button>
  </div>
</template>
<script>
import imgViewer from '@/resources/directives/img-viewer.js';
import {getLongHtmlPreview} from './long-html-content.js';

export default {
  name: 'LongHtmlContent',
  directives: {imgViewer},
  props: {
    content: {
      type: String,
      default: ''
    },
    sanitize: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {expanded: false};
  },
  computed: {
    preview() {
      return getLongHtmlPreview(this.content);
    }
  },
  watch: {
    content() {
      this.expanded = false;
    }
  }
};
</script>
<style lang="less" scoped>
.long-html-content {
  min-width: 0;
  word-break: break-word;
}
.long-html-toggle {
  display: block;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  font: inherit;
}
</style>
