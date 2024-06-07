<template>
  <div>
    <TsDialog
      :title="$t('term.process.catalogmanage')"
      type="slider"
      width="large"
      :hasFooter="false"
      :isShow.sync="isShowDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div class="work-order-box">
          <div class="pl-nm pr-nm">
            <TsRow :gutter="10">
              <Col span="8">
              </Col>
              <Col span="6">
                <Cascader
                  v-model="selectValue"
                  :data="selectData"
                  change-on-select
                  class="select bg-op radius-sm"
                  :render-format="format"
                  :placeholder="$t('form.placeholder.pleaseselect', {target:$t('term.process.catalogmanage')})"
                ></Cascader>
              </Col>
              <Col span="10">
                <TsFormInput
                  v-model="searchText"
                  search
                  clearable
                  class="bg-op radius-sm"
                  @on-enter="searchCatalog()"
                  @on-clear="searchCatalog()"
                ></TsFormInput>
              </Col>
            </TsRow>
            <loading :loadingShow="loadingShow" type="fix"></loading>
            <CollectModule v-if="!isShowCollectModule && favoriteData && favoriteData.pageCount > 0" :favoriteData="favoriteData" @goto-work-order="gotoWorkOrder"></CollectModule>
            <ServicesCatalog v-if="!loadingShow" :dataList="servicesCatalogList" @goto-work-order="gotoWorkOrder"></ServicesCatalog>
            <NoData v-show="!loadingShow && servicesCatalogList.length == 0" style="margin-top:24px"></NoData>
            <div v-if="pageCount >1 && servicesCatalogList.length != 0" class="load-more-box">
              <span v-if="servicesCatalogList && servicesCatalogList.length == rowNum">
                {{ $t('page.loadfinish') }}
              </span>
              <span v-else @click="loadMore()">
                {{ $t('page.loadmore') }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    ServicesCatalog: () => import('./catalog/services-catalog.vue'),
    CollectModule: () => import('./catalog/collect-module') // 收藏模块
  },
  props: {
    mode: {type: String}
  },
  data() {
    return {
      isShowDialog: true,
      loadingShow: false,
      selectValue: [],
      pageSize: 8,
      currentPage: 1,
      pageCount: '',
      rowNum: null, // 总条数
      selectData: [], //所有服务目录（包含层级关系）
      favoriteData: {}, //收藏服务
      servicesCatalogList: [], //服务目录路径
      searchText: '', //搜索内容
      isShowCollectModule: false // 显示收藏模块
    };
  },
  beforeCreate() {},
  created() {
    this.getAllService();
    this.getFavorite(1);
    this.getCalalogroute(1); //默认第一页
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
    closeDialog(channel) {
      this.$emit('close', channel);
    },
    //右上角搜索
    searchCatalog: function() {
      let catalogUuid = this.selectValue[this.selectValue.length - 1];
      this.currentPage = 1;
      this.getCalalogroute(this.currentPage, catalogUuid);
      this.getFavorite(this.currentPage, catalogUuid);
    },
    loadMore() {
      // 加载更多
      this.currentPage += 1;
      if (this.currentPage) {
        let currentPage = this.currentPage;
        let catalogUuid = this.selectValue[this.selectValue.length - 1];
        this.getCalalogroute(currentPage, catalogUuid);
      }
    },
    //获取所有服务目录
    getAllService() {
      let params = {
        catalogUuid: 0
      };
      this.$api.process.service.allService(params).then(res => {
        if (res.Status == 'OK') {
          this.selectData = this.getItemlist(res.Return);
        }
      });
    },
    getItemlist(arr) {
      for (var i in arr) {
        if (arr[i].name) {
          arr[i].label = arr[i].name;
          arr[i].value = arr[i].uuid;
        }
        if (arr[i].children && arr[i].children.length > 0) {
          this.getItemlist(arr[i].children);
        }
      }
      return arr;
    },

    format(labels, selectedData) {
      return labels[labels.length - 1];
    },
    //获取服务目录路径
    getCalalogroute(currentPage, catalogUuid) {
      this.loadingShow = true;
      let keyword = this.searchText;
      if (catalogUuid == undefined) {
        catalogUuid = 0;
      }
      let params = {
        currentPage: currentPage,
        catalogUuid: catalogUuid,
        pageSize: this.pageSize
      };
      if (keyword.length > 0) {
        params.keyword = keyword;
      }
      this.$api.process.service.getCalalogroute(params).then(res => {
        if (res.Status == 'OK') {
          let pathData = '';
          if (res.Return !== undefined) {
            pathData = res.Return.breadcrumbList;
            this.pageCount = res.Return.pageCount;
            this.rowNum = res.Return.rowNum;
          } else {
            pathData = '';
          }
          if (currentPage > 1) {
            pathData.forEach(item => {
              this.servicesCatalogList.push(item);
            });
          } else {
            this.servicesCatalogList = pathData;
          }
          this.loadingShow = false;
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    //获取收藏服务
    getFavorite(currentPage, parentUuid) {
      let catalogUuid = this.selectValue[this.selectValue.length - 1];
      let params = {
        pageSize: this.pageSize,
        isFavorite: 1,
        currentPage: currentPage,
        isAuthenticate: 1,
        parentUuid: parentUuid || catalogUuid,
        keyword: this.searchText
      };
      this.isShowCollectModule = true;
      this.$api.process.service.searchService(params).then(res => {
        if (res.Status == 'OK') {
          this.favoriteData = res.Return;
          this.isShowCollectModule = false;
        }
      }).finally(() => {
        this.isShowCollectModule = false;
      });
    },
    gotoWorkOrder(selectedServices) {
      if (selectedServices && !this.$utils.isEmptyObj(selectedServices)) {
        if (this.mode === 'emit') {
          this.closeDialog(selectedServices);
        } else {
          this.$router.push({
            path: '/task-dispatch',
            query: {
              uuid: selectedServices.uuid
            }
          });
          this.closeDialog();
        }
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
    selectValue: function() {
      let catalogUuid = this.selectValue[this.selectValue.length - 1];
      this.currentPage = 1;
      this.likeShow = true; //显示收藏
      this.getCalalogroute(this.currentPage, catalogUuid);
      this.getFavorite(this.currentPage, catalogUuid);
    }
  }
};
</script>
<style lang="less">
.work-order-box {
  .load-more-box {
    text-align: center;
    width: 100%;
    height: 24px;
    line-height: 24px;
    margin: 10px 0;
    span {
      cursor: pointer;
    }
}
  .ivu-cascader-menu {
    height: 100%;
  }
}
</style>
