<template>
  <div class="documentonline-search">
    <GlobalSearch :keyword="keyword"></GlobalSearch>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    GlobalSearch: resolve => require(['@/views/pages/documentonline/search/global-search.vue'], resolve)
  
  },
  props: {},
  data() {
    return {
      keyword: ''
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.query) {
      this.keyword = this.$route.query.keyword;
    }
  },
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
<style lang="less" scoped>
.documentonline-search {
  width: 60%;
  margin: 0 auto;
  padding-top: 30px;
}
</style>
