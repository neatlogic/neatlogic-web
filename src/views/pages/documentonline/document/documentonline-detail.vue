<template>
  <div>
    <TsContain
      v-if="!loadingShow"
      :isSiderHide="isSiderHide"
      :siderWidth="300"
      :rightWidth="rightWidth"
      enableCollapse
      @toggleSiderHide="toggleSiderHide"
    >
      <template v-slot:topLeft>
        <DocumentonlineNav :upwardNameList="upwardNameList"></DocumentonlineNav>
      </template>
      <template v-slot:sider>
        <DocumentonlineTree
          :upwardNameList="upwardNameList"
        ></DocumentonlineTree>
      </template>
      <template v-slot:content>
        <DocumentonlineContent :content="content" :filePath="filePath" :anchorPoint="anchorPoint"></DocumentonlineContent>
      </template>
      <template v-slot:right>
        <div class="right-list border-color pl-nm">
          <div class="tsfont-file-single pb-nm">{{ $t('term.process.relateknowledge') }}</div>
          <div
            v-for="(item,index) in list"
            :key="index"
            class="tsfont-dot text-tip-active overflow pb-nm"
            @click="gotoPage(item)"
          >
            {{ item.fileName }}
          </div>
          <div v-if="tableData.currentPage< tableData.pageCount" class="text-href pl-nm" @click="changePage()">{{ $t('page.viewmore') }}</div>
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
    DocumentonlineNav: resolve => require(['./documentonline-nav.vue'], resolve),
    DocumentonlineContent: resolve => require(['./documentonline-content.vue'], resolve)
  },
  props: {},
  data() {
    return {
      loadingShow: true,
      isSiderHide: true,
      rightWidth: 300,
      filePath: '',
      content: '',
      upwardNameList: [],
      list: [],
      tableData: {},
      preUpwardNameList: [], //文档上层目录列表
      anchorPoint: ''
    };
  },
  beforeCreate() {},
  async created() {
    this.$localStore.remove('searchKeyword', 'common');
    if (this.$route.query) {
      this.filePath = this.$route.query.filePath;
      this.anchorPoint = this.$route.query.anchorPoint || '';
      if (this.$route.query.isSiderHide && this.$route.query.isSiderHide === 'false') {
        this.isSiderHide = false;
      }
    }
    await this.getDocumentDetail();
    this.getDocumentonlineList();
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
    getDocumentDetail() {
      if (!this.filePath) {
        return;
      }
      let data = {
        filePath: this.filePath
      };
      this.loadingShow = true;
      return this.$api.documentonline.getDocumentDetail(data).then(res => {
        if (res.Status === 'OK') {
          this.content = res.Return.content; 
          this.upwardNameList = res.Return.upwardNameList || [];
          this.preUpwardNameList = this.upwardNameList.slice(0, this.upwardNameList.length - 1);
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    getDocumentonlineList(currentPage) {
      let data = {
        currentPage: currentPage || 1,
        upwardNameList: this.preUpwardNameList
      };
      this.$api.documentonline.getDocumentList(data).then(res => {
        if (res.Status === 'OK') {
          this.tableData = res.Return || {};
          if (this.tableData.tbodyList && this.tableData.tbodyList.length > 0) {
            this.list.push(...this.tableData.tbodyList);
          }
        }
      });
    },
    changePage() {
      let currentPage = this.tableData.currentPage + 1;
      this.getDocumentonlineList(currentPage);
    },
    toggleSiderHide(siderHide) {
      this.isSiderHide = siderHide;
    },
    gotoPage(item) {
      this.$router.push({
        path: '/documentonline-detail',
        query: {
          filePath: item.filePath
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {
    isSiderHide(val) {
      if (!val) {
        this.rightWidth = 0;
      } else {
        this.rightWidth = 300;
      }
    }
  }
};
</script>
<style lang="less" scoped>
.right-list {
  height: 100%;
  border-left: 1px solid;
}
</style>
