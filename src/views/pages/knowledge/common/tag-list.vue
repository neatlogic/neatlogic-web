<template>
  <div class="tag-list">
    <span class="tsfont-label icon-padding"></span>
    <Tag v-for="(item, index) in tagList" :key="index" :name="item.value">{{ item }}</Tag>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  filters: {},
  props: {
    list: { type: Array, default: () => [] }
  },
  data() {
    return {
      tagList: []
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
  methods: {},
  computed: {},
  watch: {
    list: {
      handler(val) {
        this.tagList = val || [];
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.tag-list {
  .icon-padding {
    padding-right: 10px;
  }
  /deep/ .ivu-tag {
    margin-right: 10px;
    margin-bottom: 6px;
  }
}
</style>
