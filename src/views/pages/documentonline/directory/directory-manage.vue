<template>
  <div>
    <TsContain :siderWidth="300" enableCollapse>
      <template v-slot:topLeft>
        <TsRow>
          <Col span="12">
            <InputSearcher
              v-model="keyword"
              :placeholder="$t('term.documentonline.searchhelp')"
              @change="searchDocument"
            ></InputSearcher></Col>
        </TsRow>
      </template>
      <template v-slot:sider>
        <DirectoryTree @selectTreeNode="selectTreeNode"></DirectoryTree>
      </template>
      <template v-slot:content>
        <div class="document-main">
          <Loading :loadingShow="loadingShow" type="fix"></Loading>
          <div v-for="(item,index) in list" :key="index" class="list border-color">
            <div>
              <Checkbox
                v-if="!unclassified"
                v-model="item.isCheck"
                @on-change="checkDocument(item)"
              ></Checkbox>
              <span class="tsfont-file-single pr-xs text-primary"></span>
            </div>
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
import store from '@/resources/store';
export default {
  name: '',
  components: {
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    DirectoryTree: resolve => require(['./directory-tree.vue'], resolve)
  },
  props: {},
  data() {
    return {
      loadingShow: true,
      keyword: '',
      upwardNameList: [],
      tableData: {},
      list: [],
      filePath: '',
      moduleGroup: '',
      menu: '',
      unclassified: false
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
  async mounted() {
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
          filePath: item.filePath
        }
      });
    },
    searchDocument() {

    },
    checkDocument(item) {
      this.filePath = item.filePath;
      this.$api.documentonline.saveDocumentonlineConfig({
        moduleGroup: this.moduleGroup,
        menu: this.menu,
        filePath: this.filePath
      }).then(res => {
        if (res.Status === 'OK') {
          this.$t('message.savesuccess');
        }
      });
    },
    selectTreeNode(node) {
      this.unclassified = !!node.unclassified;
      this.moduleGroup = node.moduleGroup;
      this.menu = node.menu;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.document-main {
  padding: 16px 16px 16px 0;
  .list {
    position: relative;
    display: flex;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid;
    .item {
      flex: 1;
      // border-bottom: 1px solid;
      overflow: hidden;
    }
  }
}
</style>
