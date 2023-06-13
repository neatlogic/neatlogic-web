<template>
  <div class="topnav-help">
    <div class="help-container">
      <i class="tsfont-question-o" @click="openDrawerShowDocument()"></i>
    </div>
    <Drawer
      v-model="isDrawerShow"
      :title="$t('page.help')"
      width="350"
      className="help-drawer"
    >
      <Loading :loadingShow="loadingShow" type="fix"></Loading>
      <InputSearcher
        v-model="keyword"
        :placeholder="$t('page.globalsearch')"
        @change="searchDocument"
      ></InputSearcher>
      <div v-if="!keyword" class="pt-nm">
        <div class="tsfont-file-single pb-nm">当前页面相关帮助</div>
        <div v-for="(item,index) in list" :key="index" class="tsfont-dot text-title overflow pb-nm">
          {{ item.fileName }}
        </div>
        <div v-if="tableData.currentPage< tableData.pageCount" class="text-href pl-nm" @click="changePage()">{{ $t('page.viewmore') }}</div>
        <NoData v-if="!loadingShow && !list.length" />
      </div>
      <GlobalSearch v-if="keyword" :keyword="keyword"></GlobalSearch>
      <div class="text-href help-center bg-op" @click="openHelpManage()">打开帮助中心> </div>
    </Drawer>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    GlobalSearch: resolve => require(['@/views/pages/documentonline/search/global-search.vue'], resolve)
  },
  props: {},
  data() {
    return {
      loadingShow: true,
      menu: '',
      isDrawerShow: false,
      keyword: '',
      list: [],
      tableData: {}
    };
  },
  beforeCreate() {},
  created() {
    console.log(this.$route);
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
    openDrawerShowDocument() {
      this.keyword = '';
      this.list = [];
      this.isDrawerShow = !this.isDrawerShow;
      if (this.isDrawerShow) {
        this.getDocumentonlineList();
      }
    },
    getDocumentonlineList(currentPage) {
      let data = {
        currentPage: currentPage || 1,
        moduleGroup: MODULEID
      };
      if (this.$route) {
        this.$set(data, 'menu', this.$route.name);
      }
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
      this.getDocumentonlineList(currentPage);
    },
    searchDocument(val) {
      this.list = [];
      if (!val) {
        this.getDocumentonlineList();
      }
    },
    openHelpManage() {
      window.open(HOME + '/documentonline.html#/documentonline', '_blank');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.topnav-help {
  .help-container {
    position: relative;
    cursor: pointer;
  }
}
</style>
<style lang="less">
@import (reference) '~assets/css/variable.less';
.help-drawer {
  padding: 9px;
  .ivu-drawer {
    height: calc(100vh - @top-height);
    margin-top: @top-height;
    &.move-right-enter-active {
      animation-duration: 0.2s;
    }
    &.move-right-leave-active {
      animation-duration: 0.15s;
    }
    .ivu-drawer-body {
      padding-bottom: 40px;
    }
  }
  .help-center{
    position: fixed;
    bottom: 0;
    padding: 8px 0;
  }
}
</style>

