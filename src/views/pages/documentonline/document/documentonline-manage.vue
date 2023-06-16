<template>
  <div>
    <TsContain :siderWidth="300" enableCollapse>
      <template v-slot:topLeft>
        <DocumentonlineNav :upwardNameList="upwardNameList"></DocumentonlineNav>
      </template>
      <template v-slot:sider>
        <DocumentonlineTree
          :upwardNameList="upwardNameList"
        ></DocumentonlineTree>
      </template>
      <template v-slot:content>
        <div class="document-main">
          <Loading :loadingShow="loadingShow" type="fix"></Loading>
          <div v-for="(item,index) in list" :key="index" class="list bg-block">
            <span class="tsfont-file-single pr-xs text-primary"></span>
            <div class="item border-color">
              <div class="title overflow pb-xs text-action" @click="gototDetail(item)">{{ item.fileName }}</div>
              <div class="text-tip line-2" v-html="item.content"></div>
            </div>
          </div>
          <div v-if="tableData.currentPage< tableData.pageCount" class="text-href pl-nm" @click="changePage()">{{ $t('page.viewmore') }}</div>
          <NoData v-if="!loadingShow && !list.length" />
        </div>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    DocumentonlineTree: resolve => require(['./documentonline-tree.vue'], resolve),
    DocumentonlineNav: resolve => require(['./documentonline-nav.vue'], resolve)
  },
  props: {},
  data() {
    return {
      loadingShow: true,
      id: '',
      moduleGroup: '',
      menu: '',
      upwardNameList: [],
      tableData: {},
      list: []
    };
  },
  beforeCreate() {},
  created() {
    this.$localStore.remove('searchKeyword', 'common');
    if (this.$route.query) {
      let upwardNameList = this.$route.query.upwardNameList;
      if (upwardNameList) {
        this.upwardNameList = upwardNameList.split('/');
      }
    }
  },
  beforeMount() {},
  mounted() {
    this.getDocumentList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getDocumentList(currentPage) {
      let data = {
        currentPage: currentPage || 1,
        upwardNameList: this.upwardNameList
      };
      this.$api.documentonline.getDocumentList(data).then(res => {
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
      this.getDocumentList(currentPage);
    },
    gototDetail(item) {
      this.$router.push({
        path: '/documentonline-detail',
        query: {
          upwardNameList: item.upwardNameList.join('/'),
          filePath: item.filePath
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
.document-main {
  padding: 16px 0;
  .list {
    position: relative;
    display: flex;
    margin-bottom: 16px;
    padding: 16px;
    border-radius: 6px;
    .item {
      flex: 1;
      // border-bottom: 1px solid;
      overflow: hidden;
    }
  }
}
</style>
