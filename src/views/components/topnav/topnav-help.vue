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
      <template v-slot:header>
        <div v-if="isShowDetail" class="text-action" @click="goBack()">
          {{ $t('page.back') }} >
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
        <NoData v-if="!loadingShow && !list.length" />
      </div>
      <div v-else>
        <DocumentonlineContent :filePath="filePath" :anchorPoint="anchorPoint"></DocumentonlineContent>
      </div>
      <div class="text-href help-center bg-op" @click="openHelpManage()">{{ isShowDetail? $t('term.documentonline.openhelpdocument') : $t('term.documentonline.openhelp') }} > </div>
    </Drawer>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    DocumentonlineContent: resolve => require(['@/views/pages/documentonline/document/documentonline-content.vue'], resolve)
  },
  props: {},
  data() {
    return {
      loadingShow: true,
      isDrawerShow: false,
      keyword: '',
      list: [],
      tableData: {},
      isShowDetail: false,
      filePath: '',
      upwardNameList: [],
      anchorPoint: '',
      blacklist: ['welcome'], //不需要搜索的路由名单
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
  beforeDestroy() {},
  destroyed() {},
  methods: {
    openDrawerShowDocument() {
      this.keyword = '';
      this.list = [];
      this.isShowDetail = false;
      this.isDrawerShow = true;
      this.getDocumentonlineList();
    },
    getDocumentonlineList(currentPage) { //当前模块、路由相关文档列表
      let data = {
        currentPage: currentPage || 1,
        moduleGroup: MODULEID
      };
      if (this.$route && !this.blacklist.includes(this.$route.name)) {
        this.$set(data, 'menu', this.$route.name);
      }
      this.loadingShow = true;
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
    globalSearch(currentPage) { //全局搜索文档
      if (!this.keyword) {
        return;
      }
      let data = {
        currentPage: currentPage || 1,
        keyword: this.keyword
      };
      this.loadingShow = true;
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
      this.upwardNameList = item.upwardNameList;
      this.anchorPoint = item.anchorPoint || '';
      this.isShowDetail = true;
    },
    openHelpManage() {
      if (this.isShowDetail) {
        let url = HOME + '/documentonline.html#/documentonline-detail?upwardNameList=' + this.upwardNameList.join('/') + '&filePath=' + this.filePath;
        if (this.anchorPoint) {
          url += '&anchorPoint=' + this.anchorPoint;
        }
        window.open(url, '_blank');
      } else {
        window.open(HOME + '/documentonline.html#/documentonline', '_blank');
      }
    },
    goBack() {
      this.isShowDetail = false;
      this.filePath = '';
      this.upwardNameList = [];
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
    width: 320px;
    position: fixed;
    bottom: 0;
    padding: 8px 0;
  }
}
</style>

