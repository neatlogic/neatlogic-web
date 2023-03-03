<template>
  <div
    :is="handler"
    ref="htmlContent"
    :data_id="uuid"
    :class="config?config.className:''"
    v-html="content"
  ></div>
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
      default: 'ul'
    },
    uuid: String,
    content: String,
    config: Object
  },
  data() {
    return {
      oldContent: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.oldContent = this.content;
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
  },
  computed: {},
  watch: {
    content: {
      handler: function(val) {
        this.oldContent = val;
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang='less' scoped>
ul {
  padding-left: 48px;
}
ul {
  // list-style: disc inside;
  /deep/ li {
    word-break: break-all;
    list-style: disc;
  }
  &.circle {
    /deep/ li {
      list-style: circle;
    }
  }
  &.square {
    /deep/ li {
      list-style: square;
    }
  }
}
</style>
