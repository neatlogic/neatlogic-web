<template>
  <div v-if="collectData && !$utils.isEmptyObj(collectData)">
    <div class="services-catalog-box">
      <div class="path-box pb-sm pt-sm">
        <div class="title">
          <span class="text-grey">{{ $t('page.collect') }}</span>
        </div>
        <div class="text-action" @click="lookMore(collectData)">
          <span v-show="collectData.pageCount > 1">{{ $t('page.viewmore') }}</span>
        </div>
      </div>
      <div class="services-content-box">
        <div v-if="collectData.currentPage > 1 && collectData.pageCount > 1" class="left-arrow-box arrow arrow-left" @click="previousPage(collectData)">
        </div>
        <div v-if="collectData.currentPage < collectData.pageCount && collectData.pageCount > 1" class="right-arrow-box arrow arrow-right" @click="nextPage(collectData)">
        </div>
        <TsRow>
          <template v-slot>
            <div>
              <div v-for="(item, index) in collectData.channelList" :key="index">
                <Col span="6">
                  <div
                    class="list pl-lg pr-lg radius-md mb-nm overflow bg-op"
                    @click="collectionClick(item)"
                  >
                    <div class="logo pr-sm">
                      <i class="logo-icon text-primary" :class="[item.icon ? item.icon : 'tsfont-ip-list', item.color ? '' : 'text-primary']"></i>
                    </div>
                    <div class="overflow">
                      <div class="overflow pb-xs">{{ item.name }}</div>
                      <Tooltip
                        transfer
                        placement="bottom-start"
                        max-width="300"
                        theme="light"
                        class="services-catalog-tooltip-wrap"
                        :disabled="!item.desc"
                      >
                        <div slot="content" class="text-grey" v-html="item.desc ? removeHTMLTag(escape2Html(item.desc)) : ''"></div>
                        <div class="overflow text-grey description-text" v-html="item.desc ? removeHTMLTag(escape2Html(item.desc)) : '-'"></div>
                      </Tooltip>
                    </div>
                  </div>
                </Col>
              </div>
            </div>
          </template>
        </TsRow>
      </div>
    </div>
    <SeeMore
      v-if="isShowSeeMore"
      :params="moreParams"
      :isCollect="1"
      @goto-work-order="collectionClick"
      @close="closeSeeMoreDialog"
    ></SeeMore>
  </div>
</template>
<script>
export default {
  name: '', // 收藏模块
  components: {
    SeeMore: () => import('./see-more.vue') // 查看更多
  },
  props: {
    favoriteData: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    let _this = this;
    return {
      collectData: _this.favoriteData,
      isShowSeeMore: false,
      moreParams: {}
    };
  },
  beforeCreate() {},
  created() {
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
    // 下一个页
    nextPage(item) {
      let currentPage = item ? item.currentPage : 1;
      this.getServiceCatalog(item, currentPage + 1);
    },
    // 上一页
    previousPage(item) {
      let currentPage = item ? item.currentPage : 1;
      this.getServiceCatalog(item, currentPage - 1);
    },
    collectionClick(selectedObj) {
      this.$emit('goto-work-order', selectedObj);
    },
    getServiceCatalog: function(item, currentPage) {
      let params = {
        parentUuid: item.uuid,
        currentPage: currentPage,
        keyword: item.keyword,
        isAuthenticate: 1,
        isFavorite: 1,
        pageSize: 8
      };
      this.$api.process.service.searchService(params).then(res => {
        if (res.Status == 'OK') {
          this.collectData = Object.assign({}, this.collectData, res.Return);
        }
      });
    },
    lookMore() {
      this.isShowSeeMore = true;
    },
    closeSeeMoreDialog() {
      this.isShowSeeMore = false;
      this.moreParams = {};
    }
  },
  filter: {},
  computed: {
    setTitlearr() {
      return function(item, tindex) {
        let arr = item.path;
        if (arr.length > 0 && tindex > 0) {
          return 'tsfont-right arr-nextpath';
        } else {
          return '';
        }
      };
    },
    //去除html字符
    removeHTMLTag() {
      return function(str) {
        str = str.replace(/<\/?[^>]*>/g, ''); //去除HTML tag
        str = str.replace(/[ | ]*\n/g, '\n'); //去除行尾空白
        str = str.replace(/ /gi, ''); //去掉
        return str;
      };
    },
    //去除转义字符
    escape2Html() {
      return function(str) {
        const arrEntities = { lt: '<', gt: '>', nbsp: ' ', amp: '&', quot: '"' };
        return str.replace(/&(lt|gt|nbsp|amp|quot);/gi, function(all, t) {
          return arrEntities[t];
        });
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
@import "./services-catalog.less";
</style>
