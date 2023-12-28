<template>
  <!-- eslint-disable -->
  <div
    :is="handler"
    ref="htmlContent"
    :data_id="uuid"
    :class="config?config.className:''"
    v-html="content"
  ></div>
   <!-- eslint-disable -->
</template>
<script>
import editorMixins from './common/mixins.js';
import editorUtils from '@/views/pages/knowledge/edit/component/common/editor-util.js';
export default {
  name: '',
  components: {},
  filters: {},
  mixins: [editorMixins],
  props: {
    handler: {
      //序列的类型，[ol,ul]
      type: String,
      default: 'ol'
    },
    uuid: String,
    content: String,
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
  methods: {
    getContent() {
      let html = this.$refs.htmlContent.innerHTML;
      return html;
    },
    handlerClick(e) {
      //this.comSelect(e, this.type);
      //this.comGetSelectionElemet();
    },
    handlerKeydown(e) {
    }
  },
  computed: {},
  watch: {
    content: {
      handler: function(val) {},
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang='less' scoped>
ol {
  padding-left: 48px;
}
ol {
  list-style: decimal inside;
  /deep/ li {
    word-break: break-all;
    list-style: decimal;
  }
  &.cjk-ideographic {
    /deep/ li {
      list-style: cjk-ideographic;
    }
  }
}
</style>
