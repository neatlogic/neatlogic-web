<template>
  <div>
    <span v-if="wordList && wordList.length > 0" v-html="highlightKeywords(value, wordList)"></span>
    <span v-else>{{ value }}</span>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    wordList: { type: Array },
    mode: { type: String, default: 'list' },
    attrEntity: { type: Object }
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
  methods: {
    highlightKeywords(text, wordList) {
      if (!wordList || wordList.length === 0) return text;
      const escapedWords = wordList.map(word => this.escapeRegExp(word));
      const regex = new RegExp(`(${escapedWords.join('|')})`, 'gi'); // 匹配关键字，忽略大小写
      return text.replace(regex, '<span class="highlight text-error">$1</span>'); // 使用span加上高亮样式
    },
    escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // 转义正则特殊字符
    }
  },
  filter: {},
  computed: {
    value: function() {
      if (this.attrEntity.valueList && this.attrEntity.valueList.length > 0) {
        return this.attrEntity.valueList[0];
      }
      return '';
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
::v-deep .highlight {
  font-weight: bold;
  /* 保证和普通文字对齐 */
  line-height: 1; /* 确保高亮的行高与文字一致 */
  vertical-align: baseline; /* 水平对齐方式 */
}
</style>
