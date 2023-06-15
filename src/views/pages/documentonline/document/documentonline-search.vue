<template>
  <div class="documentonline-search">
    <div class="search-main">
      <Loading :loadingShow="loadingShow" type="fix"></Loading>
      <div v-for="(item,index) in list" :key="index" class="list">
        <span class="tsfont-file-single pr-xs text-primary"></span>
        <div class="item overflow border-color pb-nm mb-nm">
          <div class="title pb-xs text-action" @click="gotoPage(item)">{{ item.fileName }}</div>
          <div class="text-tip line-2" v-html="item.content"></div>
        </div>
      </div>
      <div v-if="tableData.currentPage< tableData.pageCount" class="text-href pl-nm" @click="changePage()">{{ $t('page.viewmore') }}</div>
      <NoData v-if="!loadingShow && !list.length" />
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {},
  data() {
    return {
      keyword: '',
      loadingShow: true,
      list: [],
      tableData: {}
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.query) {
      this.keyword = this.$route.query.searchKeyword || '';
    }
    this.searchDocument();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    searchDocument(currentPage) {
      let data = {
        currentPage: currentPage || 1,
        keyword: this.keyword
      };
      this.$api.documentonline.searchDocument(data).then(res => {
        if (res.Status === 'OK') {
          this.tableData = res.Return || {};
          if (this.tableData.tbodyList && this.tableData.tbodyList.length > 0) {
            this.list.push(...this.tableData.tbodyList);
          }
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    changePage() {
      let currentPage = this.tableData.currentPage + 1;
      this.searchDocument(currentPage);
    },
    gotoPage(item) {
      this.$router.push({
        path: '/documentonline-detail',
        query: {
          filePath: item.filePath,
          upwardNameList: item.upwardNameList.join('/')
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.documentonline-search {
  width: 100%;
  padding-top: 30px;
  .search-main {
    padding: 16px 0;
    .list {
      position: relative;
      display: flex;
      .item {
        flex: 1;
        border-bottom: 1px solid;
        overflow: hidden;
      }
    }
  }
}
</style>
