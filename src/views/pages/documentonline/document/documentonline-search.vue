<template>
  <main class="help-results">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <div class="help-results-body">
      <DocumentonlineNav :upwardNameList="[$t('router.documentonline.documentsearch')]" />
      <h1 class="results-title">
        {{ keyword ? $t('term.documentonline.searchresults', {keyword}) : $t('router.documentonline.documentsearch') }}
      </h1>
      <div class="result-entries">
        <DocumentonlineEntry
          v-for="item in list"
          :key="item.filePath"
          :item="item"
          show-location
          @select="gotoPage"
        />
      </div>
      <Button
        v-if="tableData.currentPage < tableData.pageCount"
        class="mt-nm"
        :loading="loadingShow"
        @click="changePage"
      >
        {{ $t('page.viewmore') }}
      </Button>
      <NoData v-if="!loadingShow && !list.length" class="mt-lg" />
    </div>
  </main>
</template>

<script>
export default {
  components: {
    DocumentonlineEntry: () => import('./documentonline-entry.vue'),
    DocumentonlineNav: () => import('./documentonline-nav.vue')
  },
  data() {
    return {
      loadingShow: false,
      list: [],
      tableData: {}
    };
  },
  methods: {
    searchDocument(currentPage = 1) {
      const list = this.list;
      this.loadingShow = true;
      this.$api.documentonline.searchDocument({currentPage, keyword: this.keyword}).then(res => {
        if (this.list === list && res.Status === 'OK') {
          this.tableData = res.Return || {};
          list.push(...(this.tableData.tbodyList || []));
        }
      }).finally(() => {
        if (this.list === list) {
          this.loadingShow = false;
        }
      });
    },
    changePage() {
      if (!this.loadingShow) {
        this.searchDocument(this.tableData.currentPage + 1);
      }
    },
    gotoPage(item) {
      this.$router.push({name: 'documentonline-detail', query: {filePath: item.filePath}});
    }
  },
  computed: {
    keyword() {
      return this.$route.query.searchKeyword || '';
    }
  },
  watch: {
    keyword: {
      immediate: true,
      handler(keyword) {
        this.list = [];
        this.tableData = {};
        this.loadingShow = false;
        if (keyword) {
          this.searchDocument();
        }
      }
    }
  }
};
</script>

<style lang="less" scoped>
.help-results-body {
  width: min(100%, 968px);
  margin: 0 auto;
  padding: clamp(20px, 4vw, 40px) clamp(14px, 4vw, 36px);
}
.results-title {
  margin: 16px 0;
  color: var(--help-ink);
  font-size: clamp(22px, 3vw, 30px);
  font-weight: 650;
  line-height: 1.35;
  overflow-wrap: anywhere;
}
.result-entries {
  display: grid;
  gap: 8px;
}
</style>
