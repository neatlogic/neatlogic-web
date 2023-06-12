<template>
  <div>
    <TsContain :siderWidth="300" enableCollapse>
      <template v-slot:topLeft>
        <DocumentonlineNav :filepathList="filepathList" :moduleGroup="moduleGroup" :menu="menu"></DocumentonlineNav>
      </template>
      <template v-slot:sider>
        <DocumentonlineTree
          :id="id"
          :moduleGroup="moduleGroup"
          :menu="menu"
          :filePath="filePath"
        ></DocumentonlineTree>
      </template>
      <template v-slot:content>
        <div class="document-main">
          <Loading :loadingShow="loadingShow" type="fix"></Loading>
          <div v-for="(item,index) in list" :key="index" class="list">
            <span class="tsfont-file-single pr-xs text-primary"></span>
            <div class="item overflow border-color pb-nm mb-nm">
              <div class="title pb-xs">{{ item.fileName }}</div>
              <div class="text-tip line-2" v-text="item.content"></div>
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
      filepathList: [],
      tableData: {},
      list: []
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.query) {
      this.id = this.$route.query.id || '';
      this.filePath = this.$route.query.filePath;
      this.moduleGroup = this.$route.query.moduleGroup;
      this.menu = this.$route.query.menu;
      if (this.filePath) {
        this.filepathList = this.filePath.split('/');
      }
      if (this.$route.query.type && this.$route.query.type === 'moduleGroup') {
        this.id = this.moduleGroup;
        this.filepathList = [this.moduleGroup];
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
        moduleGroup: this.moduleGroup,
        menu: this.menu
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
    .item {
      flex: 1;
      border-bottom: 1px solid;
      overflow: hidden;
    }
  }
}
</style>
