<template>
  <ol
    ref="htmlContent"
    :data_id="uuid"
    :class="className()"
    v-html="content"
  ></ol>
</template>
<script>
export default {
  name: '',
  components: {},
  filters: {},
  props: {
    handler: String,
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
ol {
  padding-left: 32px;
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
  /deep/span.line-through {
    text-decoration: line-through;
    vertical-align: baseline;
  }
}
</style>
