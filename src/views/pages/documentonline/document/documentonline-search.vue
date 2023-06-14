<template>
  <div class="documentonline-search">
    <div class="search-main">
      <Loading :loadingShow="loadingShow" type="fix"></Loading>
      <div v-for="(item,index) in list" :key="index" class="list">
        <span class="tsfont-file-single pr-xs text-primary"></span>
        <div class="item overflow border-color pb-nm mb-nm">
          <div class="title pb-xs text-action" @click="gotoPage(item)">{{ item.fileName }}</div>
          <div class="text-tip line-2" v-text="item.content"></div>
        </div>
      </div>
      <div v-if="tableData.currentPage< tableData.pageCount" class="text-href pl-nm" @click="changePage()">{{ $t('page.viewmore') }}</div>
      <NoData v-if="!loadingShow && !list.length" />
    </div>
  </div>
</template>
<script>
import {documentonlineStore} from '@/views/pages/documentonline/common/observableData.js';
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
      this.keyword = this.$route.query.keyword || '';
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
  destroyed() {
    this.clearObservable();
  },
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
    },
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
