<template>
  <div v-if="config && config.isChecked">
    <div class="fz-h1">{{ config.title }}</div>
    <div ref="detailHtml" class="content-style" v-html="config.content"></div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  filters: {},
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
  methods: {
    getData() {
      let list = [];
      let detailHtml = this.$refs.detailHtml.innerHTML;
      let titleConfig = { handler: 'h1', uuid: this.$utils.setUuid(), content: this.config.title };
      let contentConfig = { handler: 'editor', uuid: this.$utils.setUuid(), content: detailHtml };
      list.push(titleConfig, contentConfig);
      return list;
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.content-style {
  padding: 8px 16px;
}
</style>
