<template>
  <div>
    <div class="action-group mb-md">
      <div class="action-item"><InputSearcher v-model="keyword" :width="300" @change="search"></InputSearcher></div>
      <div v-if="matches.length" class="action-item">{{ matchIndex + 1 }}/{{ matches.length }}</div>
      <span class="action-item text-action" :class="{ disable: matchIndex <= 0 }" @click="move(-1)">{{ $t('page.term.prev') }}</span>
      <span class="action-item text-action" :class="{ disable: matchIndex >= matches.length - 1 }" @click="move(1)">{{ $t('page.term.next') }}</span>
      <span class="action-item text-action" @click="$utils.copyText(null, rawText)">{{ $t('page.copy') }}</span>
      <span class="action-item tsfont-download text-action" @click="$emit('export-text')">{{ $t('term.framework.threadsnapshot.exportTxt') }}</span>
    </div>
    <div v-if="keyword && !matches.length" class="text-grey mb-sm">{{ $t('term.framework.nomatchingkeyword') }}</div>
    <pre ref="raw" class="raw-snapshot bg-op padding-md radius-md" tabindex="0">{{ rawText }}</pre>
  </div>
</template>
<script>
export default {
  name: 'ThreadSnapshotRaw',
  components: { InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue') },
  props: { rawText: { type: String, default: '' } },
  data() { return { keyword: '', matches: [], matchIndex: 0 }; },
  methods: {
    // 原文以文本插值渲染；搜索使用文本节点范围，不拼接 HTML。
    search() {
      const keyword = this.keyword.trim();
      this.matches = [];
      this.matchIndex = 0;
      if (!keyword) return;
      // 转义关键词为字面文本，并直接使用原文索引，避免 Unicode 小写扩长造成偏移错误。
      const expression = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      let match;
      while ((match = expression.exec(this.rawText)) !== null) {
        this.matches.push({ start: match.index, end: match.index + match[0].length });
      }
      this.$nextTick(() => this.highlight());
    },
    // 上下匹配移动仅在合法范围内生效。
    move(direction) {
      const index = this.matchIndex + direction;
      if (index < 0 || index >= this.matches.length) return;
      this.matchIndex = index;
      this.highlight();
    },
    // 高亮匹配并把该行滚动到可视区域。
    highlight() {
      const element = this.$refs.raw;
      const match = this.matches[this.matchIndex];
      if (!element || !element.firstChild || !match) return;
      const range = document.createRange();
      range.setStart(element.firstChild, match.start);
      range.setEnd(element.firstChild, match.end);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      const bounds = range.getBoundingClientRect();
      const container = element.getBoundingClientRect();
      element.scrollTop += bounds.top - container.top - 24;
      element.scrollLeft += bounds.left - container.left - 24;
    }
  },
  watch: { rawText() { this.$nextTick(() => this.search()); } }
};
</script>
<style scoped lang="less">
/* 原始快照需要保留缩进和长行，并独立滚动以支持搜索定位。 */
.raw-snapshot { max-height: 60vh; overflow: auto; white-space: pre; font-family: monospace; }
</style>
