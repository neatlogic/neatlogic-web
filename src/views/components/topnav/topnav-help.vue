<template>
  <div class="topnav-help">
    <div class="help-container">
      <i class="tsfont-question-o" @click="openRouteHelp()"></i>
    </div>
    <Drawer
      v-model="isDrawerShow"
      :title="$t('page.help')"
      width="550"
      className="help-drawer"
    >
      <template v-slot:header>
        <div v-if="isShowDetail" class="text-action tsfont-left" @click="goBack()">
          {{ $t('page.back') }}
        </div>
        <div v-else>{{ $t('page.help') }}</div>
      </template>
      <Loading :loadingShow="loadingShow" type="fix"></Loading>
      <div v-if="!isShowDetail">
        <InputSearcher
          v-model="keyword"
          :placeholder="$t('page.globalsearch')"
          @change="searchDocument"
        ></InputSearcher>
        <div v-if="!isGlobalSearch" class="pt-nm">
          <div class="tsfont-file-single pb-nm">{{ $t('term.documentonline.currentpagesearch') }}</div>
          <div
            v-for="(item,index) in list"
            :key="index"
            class="tsfont-dot text-title overflow pb-nm text-action"
            @click="getDetail(item)"
          >
            {{ item.fileName }}
          </div>
        </div>
        <div v-else class="global-search">
          <div v-for="(item,index) in list" :key="index" class="list">
            <span class="tsfont-file-single pr-xs text-primary"></span>
            <div class="item overflow border-color pb-nm mb-nm">
              <div class="title pb-xs text-action" @click="getDetail(item)">{{ item.fileName }}</div>
              <div class="text-tip line-2" v-html="item.content"></div>
            </div>
          </div>
        </div>
        <div v-if="tableData.currentPage< tableData.pageCount" class="text-href pl-nm" @click="changePage()">{{ $t('page.viewmore') }}</div>
        <template v-if="!loadingShow && !list.length">
          <NoData :text="$t('page.norelevantdocuments')" />
          <div class="text-center mt-nm">
            <span class="text-href" @click="openHelpManage()">{{ $t('page.viewalldocuments') }}</span>
          </div>
        </template>
      </div>
      <div v-else>
        <DocumentonlineContent :filePath="filePath" :anchorPoint="anchorPoint"></DocumentonlineContent>
      </div>
      <div class="text-href help-center bg-op" @click="openHelpManage()">{{ isShowDetail? $t('term.documentonline.openhelpdocument') : $t('term.documentonline.openhelp') }} <span class="tsfont-right"></span> </div>
    </Drawer>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    DocumentonlineContent: () => import('@/views/pages/documentonline/document/documentonline-content.vue')
  },
  props: {},
  data() {
    return {
      loadingShow: true,
      isDrawerShow: false,
      pendingHelpRoute: null,
      keyword: '',
      list: [],
      tableData: {},
      isShowDetail: false,
      filePath: '',
      anchorPoint: '',
      isGlobalSearch: false
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
  beforeDestroy() {
    this.pendingHelpRoute = null;
  },
  destroyed() {},
  methods: {
    async openRouteHelp() {
      const route = this.$route;
      if (!route.name) {
        this.goToHelpCenter();
        return;
      }
      if (this.pendingHelpRoute === route) {
        return;
      }
      this.pendingHelpRoute = route;
      let documents;
      try {
        const res = await this.$api.documentonline.getRouteDocumentList({
          moduleGroup: MODULEID,
          menu: route.name
        });
        if (res?.Status === 'OK') {
          documents = res.Return;
        }
      } catch {
        // 查询失败时仍可访问帮助中心。
      }
      if (this.pendingHelpRoute !== route) {
        return;
      }
      this.pendingHelpRoute = null;
      // 请求返回时，用户可能已离开发起查询的页面。
      if (this.$route !== route) {
        return;
      }
      if (documents?.primaryDocument?.filePath) {
        this.goToHelpCenter(documents.primaryDocument);
      } else if (documents?.tbodyList?.length) {
        this.showRelatedDocuments(documents);
      } else {
        this.goToHelpCenter();
      }
    },
    showRelatedDocuments(documents) {
      this.keyword = '';
      this.list = documents.tbodyList.slice();
      this.tableData = documents;
      this.isShowDetail = false;
      this.isGlobalSearch = false;
      this.loadingShow = false;
      this.isDrawerShow = true;
    },
    getDocumentonlineList(currentPage) { //当前模块、路由相关文档列表
      let data = {
        currentPage: currentPage || 1,
        moduleGroup: MODULEID,
        menu: this.$route.name
      };
      this.loadDrawerDocuments(this.$api.documentonline.getDocumentList(data));
    },
    globalSearch(currentPage) { //全局搜索文档
      if (!this.keyword) {
        return;
      }
      let data = {
        currentPage: currentPage || 1,
        keyword: this.keyword
      };
      this.loadDrawerDocuments(this.$api.documentonline.searchDocument(data));
    },
    loadDrawerDocuments(request) {
      const route = this.$route;
      const list = this.list;
      // 切换路由或搜索条件会替换抽屉列表，旧请求不能追加到当前列表。
      const isCurrent = () => this.isDrawerShow && this.$route === route && this.list === list;
      this.loadingShow = true;
      request.then(res => {
        if (isCurrent() && res.Status === 'OK') {
          this.tableData = res.Return || {};
          if (this.tableData.tbodyList && this.tableData.tbodyList.length > 0) {
            this.list.push(...this.tableData.tbodyList);
          }
        }
      }).finally(() => {
        if (isCurrent()) {
          this.loadingShow = false;
        }
      });
    },
    changePage() {
      let currentPage = this.tableData.currentPage + 1;
      if (this.keyword) {
        this.globalSearch(currentPage);
      } else {
        this.getDocumentonlineList(currentPage);
      }
    },
    searchDocument(val) {
      this.list = [];
      if (val) {
        this.isGlobalSearch = true;
        this.globalSearch();
      } else {
        this.isGlobalSearch = false;
        this.getDocumentonlineList();
      }
    },
    getDetail(item) {
      this.filePath = item.filePath;
      this.anchorPoint = item.anchorPoint || '';
      this.isShowDetail = true;
    },
    openHelpManage() {
      if (this.isShowDetail) {
        window.open(this.getHelpUrl({filePath: this.filePath, anchorPoint: this.anchorPoint}), '_blank');
      } else {
        window.open(this.getHelpUrl(), '_blank');
      }
    },
    getHelpUrl(document) {
      const baseUrl = HOME + '/documentonline.html#/documentonline';
      if (!document?.filePath) {
        return baseUrl;
      }
      let url = baseUrl + '-detail?filePath=' + encodeURIComponent(document.filePath);
      if (document.anchorPoint) {
        url += '&anchorPoint=' + encodeURIComponent(document.anchorPoint);
      }
      return url;
    },
    goToHelpCenter(document) {
      // 共享布局中的 router-view 由 Vue Router 注册，离页确认需要当前页面实例。
      const matched = this.$route.matched;
      const moduleView = matched[matched.length - 1]?.instances.default;
      this.$utils.gotoHref(this.getHelpUrl(document), moduleView);
    },
    goBack() {
      this.isShowDetail = false;
      this.filePath = '';
    }
  },
  filter: {},
  computed: {},
  watch: {
    $route() {
      this.isDrawerShow = false;
    }
  }
};
</script>
<style lang="less" scoped>
.topnav-help {
  .help-container {
    position: relative;
    cursor: pointer;
  }
}
.global-search {
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
    width: 550px;
    position: fixed;
    bottom: 0;
    padding: 8px 0;
  }
}
</style>

