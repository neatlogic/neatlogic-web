<template>
  <div class="documentonline-search">
    <GlobalSearch :keyword="keyword"></GlobalSearch>
  </div>
</template>
<script>
import {documentonlineStore} from '@/views/pages/documentonline/common/observableData.js';
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
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {
    this.clearObservable();
  },
  methods: {
    clearObservable() { //清空状态管理的数据
      documentonlineStore.globalSearchKeyword = '';
    }
  },
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
