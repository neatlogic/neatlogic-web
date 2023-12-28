<template>
  <!-- eslint-disable -->
  <div
    :is="handler"
    ref="htmlContent"
    :data_id="uuid"
    :class="className()"
    v-html="content"
  ></div>
   <!-- eslint-disable -->
</template>
<script>
export default {
  name: '',
  components: {},
  filters: {},
  props: {
    handler: {
      //序列的类型，[ol,ul]
      type: String,
      default: 'ul'
    },
    uuid: String,
    content: String,
    config: Object,
    changeType: String
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
  methods: {},
  computed: {
    className() {
      return function() {
        let styleClass = this.changeType ? 'bg-' + this.changeType : '';
        if (this.config && this.config.className) {
          styleClass += ' ' + this.config.className;
        }
        return styleClass;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
ul {
  padding-left: 32px;
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
  /deep/span.line-through{
    text-decoration:line-through;
    vertical-align: baseline;
  }
}
</style>
