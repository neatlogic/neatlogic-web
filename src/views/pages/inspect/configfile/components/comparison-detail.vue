<template>
  <div class="line-box compare">
    <div v-for="(item,index) in config.lineList" :key="index">
      <div :class="item.changeType?'bg-'+item.changeType:''" class="item-content" v-html="item.content"></div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
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
  methods: {},
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style  lang="less" scoped>
@import '~@/resources/assets/css/compare.less';
.line-box {
  .item-content {
    min-height: 16px;
    line-height: 24px;
  }
}
</style>
