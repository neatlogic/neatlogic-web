<template>
  <div class="service-catalog-manage-wrap">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain border="border">
      <template slot="topRight">
        <TsRow>
          <Col :span="8">
            <Cascader
              v-model="selectValue"
              :data="selectData"
              change-on-select
              class="select"
              :render-format="format"
              :placeholder="$t('form.placeholder.pleaseselect', {target: $t('router.process.servicecatalog')})"
            >
            </Cascader>
          </Col>
          <Col :span="16">
            <InputSearcher v-model="keyword" @change="searchCatalog"></InputSearcher>
          </Col>
        </TsRow>
      </template>
      <div slot="content" class="catalog-content">
        <div class="service-content">
          <div v-if="!$utils.isEmpty(favoriteData.tbodyList)" class="service-block">
            <ServiceGroup
              :item="favoriteSectionData"
              :favoriteSection="true"
              :pagingDisabled="favoriteLoading"
              :favoriteState="favoriteState"
              :favoritePending="favoritePending"
              @handleCollect="handleCollect"
              @loaded="registerFavorites"
              @pageChange="getFavoriteList"
            >
            </ServiceGroup>
          </div>
          <div v-for="item in catalogPath" :key="item.id" class="service-block">
            <ServiceGroup
              :item="item"
              :favoriteState="favoriteState"
              :favoritePending="favoritePending"
              @handleCollect="handleCollect"
              @loaded="registerFavorites"
            ></ServiceGroup>
          </div>
          <NoData v-show="!loadingShow && catalogPath.length == 0" class="mt-nm"></NoData>
          <div class="load-more-text">
            <span
              v-show="pageCount > 1 && catalogPath.length !== 0"
              :style="loadMoreText == $t('page.loadfinish') ? 'cursor: default;' : ''"
              @click="clickgetMore()"
            >{{ loadMoreText }}</span>
          </div>
        </div>
      </div>
    </TsContain>
  </div>
</template>

<script>
export default {
  //服务目录
  name: 'ServiceCatalogManage',
  components: {
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    ServiceGroup: () => import('../components/service-group.vue')
  },
  data() {
    return {
      favoriteLoading: false,
      favoritePending: {},
      favoriteState: {},
      loadingShow: false,
      pageSize: 8,
      currentPage: 1,
      pageCount: null,
      keyword: '', //搜索内容
      selectData: [], //所有服务目录（包含层级关系）
      catalogPath: [], //服务目录路径
      selectValue: [],
      favoriteData: {}, //收藏服务
      loadMoreText: this.$t('page.loadmore')
    };
  },
  created() {
    this.getAllService();
    this.getFavoriteList(1); // 获取收藏列表
    this.getServiceCatalogPath(1); // 获取服务目录内容
  },
  methods: {
    registerFavorites(items) {
      (items || []).forEach(item => {
        // 已登记的状态包含已完成的操作；晚到的列表只补充首次出现的服务。
        if (!Object.prototype.hasOwnProperty.call(this.favoriteState, item.id)) this.$set(this.favoriteState, item.id, item.isFavorite ? 1 : 0);
      });
    },
    async handleCollect(item) {
      if (this.favoritePending[item.id]) return;
      this.$set(this.favoritePending, item.id, true);
      const favorite = Object.prototype.hasOwnProperty.call(this.favoriteState, item.id) ? this.favoriteState[item.id] : item.isFavorite;
      const action = favorite ? 0 : 1;
      try {
        const res = action ? await this.$api.autoexec.catalogManage.saveUserCollect({ id: item.id }) : await this.$api.autoexec.catalogManage.deleteUserCollect({ id: item.id });
        if (res.Status === 'OK') {
          this.$set(this.favoriteState, item.id, action);
          this.$Message.success(this.$t('message.savesuccess'));
          await this.getFavoriteList();
        }
      } finally {
        this.$delete(this.favoritePending, item.id);
      }
    },
    async getFavoriteList(currentPage = 1, parentId = this.selectValue[this.selectValue.length - 1]) {
      this.favoriteLoading = true;
      try {
        const res = await this.$api.autoexec.catalogManage.getFavorite({ currentPage, parentId, pageSize: this.pageSize, keyword: this.keyword });
        if (res.Status !== 'OK') return;
        const items = (res.Return.tbodyList || []).map(item => ({ ...item, isFavorite: 1 }));
        this.registerFavorites(items);
        this.favoriteData = { ...res.Return, tbodyList: items.filter(item => this.favoriteState[item.id]) };
      } finally {
        this.favoriteLoading = false;
      }
    },
    async getAllService() {
      const res = await this.$api.autoexec.catalogManage.allService();
      if (res.Status === 'OK') this.selectData = this.getItemlist(res.Return);
    },
    getItemlist: function(arr) {
      for (var i in arr) {
        if (arr[i].name) {
          arr[i].label = arr[i].name;
          arr[i].value = arr[i].id;
        }
        if (arr[i].children && arr[i].children.length > 0) {
          this.getItemlist(arr[i].children);
        }
      }
      return arr;
    },
    //获取服务目录路径
    async getServiceCatalogPath(currentPage, parentId) {
      if (currentPage > 1 && currentPage > this.pageCount) return;
      const keyword = this.keyword;
      this.loadingShow = true;
      try {
        const res = await this.$api.autoexec.catalogManage.getCalalogroute({ currentPage, pageSize: this.pageSize, parentId, keyword });
        if (res.Status !== 'OK') return;
        const result = res.Return || {};
        const list = (result.tbodyList || []).map(item => ({ ...item, keyword }));
        list.forEach(item => this.registerFavorites(item.tbodyList));
        this.catalogPath = currentPage > 1 ? this.catalogPath.concat(list) : list;
        this.currentPage = currentPage;
        this.pageCount = result.pageCount || 0;
        this.loadMoreText = this.$t(currentPage >= this.pageCount ? 'page.loadfinish' : 'page.loadmore');
      } finally {
        this.loadingShow = false;
      }
    },
    clickgetMore() {
      if (this.loadingShow || this.currentPage >= this.pageCount) return;
      return this.getServiceCatalogPath(this.currentPage + 1, this.selectValue[this.selectValue.length - 1]);
    },
    //右上角搜索
    searchCatalog: function() {
      let parentId = this.selectValue[this.selectValue.length - 1];
      this.currentPage = 1;
      this.catalogPath = [];
      this.pageCount = null;
      this.favoriteData = {};
      this.getServiceCatalogPath(this.currentPage, parentId);
      this.getFavoriteList(this.currentPage, parentId);
    },
    format(labels) {
      return labels[labels.length - 1];
    }
  },
  computed: {
    favoriteSectionData() {
      return { ...this.favoriteData, id: null, upwardNameList: [this.$t('page.collect')] };
    }
  },
  watch: {
    selectValue() {
      this.searchCatalog();
    }
  }
};
</script>
<style lang="less" scoped>
.service-catalog-manage-wrap {
  .service-content {
    padding: 0 16px;
  }
  .service-block {
    height: 100%;
    margin-bottom: 8px;
  }
  .load-more-text {
    text-align: center;
    width: 100%;
    height: 24px;
    line-height: 24px;
    margin: 10px 0;
    span {
      cursor: pointer;
    }
  }
  ::v-deep .ivu-cascader-menu {
    height: 100%;
  }
}
</style>
