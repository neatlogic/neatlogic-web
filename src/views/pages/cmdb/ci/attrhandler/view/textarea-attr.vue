<template>
  <div v-if="mode == 'list'">
    <span v-if="!isJson">
      <span v-if="wordList && wordList.length > 0">
        <span v-if="value.length <= 100"><span v-html="highlightKeywords(value, wordList)"></span></span>
        <span v-else>
          <span v-html="highlightKeywords(value.substr(0, 100), wordList)"></span>
          <i class="tsfont-option-horizontal text-href" @click="isShow = true"></i>
        </span>
      </span>
      <span v-else>
        <span v-if="value.length <= 100">{{ value }}</span>
        <span v-else>
          {{ value.substr(0, 100) }}
          <i class="tsfont-option-horizontal text-href" @click="isShow = true"></i>
        </span>
      </span>
    </span>
    <a
      v-else
      href="javascript:void(0)"
      class="tsfont-json"
      @click="isShow = true"
    ></a>
    <TsDialog v-if="isShow" v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <span v-if="!isJson">{{ value }}</span>
        <JsonViewer
          v-else
          boxed
          copyable
          :value="JSON.parse(value)"
        ></JsonViewer>
      </template>
    </TsDialog>
  </div>
  <div v-else-if="mode == 'detail'">
    <span v-if="!isJson">{{ value }}</span>
    <JsonViewer
      v-else
      boxed
      copyable
      :value="JSON.parse(value)"
    ></JsonViewer>
  </div>
</template>
<script>
import JsonViewer from 'vue-json-viewer';

export default {
  name: '',
  components: {
    JsonViewer
  },
  props: {
    wordList: { type: Array },
    mode: { type: String, default: 'list' },
    attrEntity: { type: Object }
  },
  data() {
    return {
      isShow: false,
      dialogConfig: {
        type: 'modal',
        title: this.$t('page.detailinfo'),
        maskClose: true,
        isShow: true,
        hasFooter: false,
        width: 'medium'
      }
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
  methods: {
    close() {
      this.isShow = false;
    },
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
    isJson() {
      let isJson = false;
      try {
        JSON.parse(this.value);
        isJson = true;
      } catch (e) {
        isJson = false;
      }
      return isJson;
    },
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
