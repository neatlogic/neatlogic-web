<template>
  <div class="service-catalog-manage-wrap">
    <Loading
      :loadingShow="loadingShow"
      type="fix"
    ></Loading>
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
            ></Cascader>
          </Col>
          <Col :span="16">
            <InputSearcher
              v-model="keyword"
              @change="searchCatalog"
            ></InputSearcher>
          </Col>
        </TsRow>
      </template>
      <div slot="content" class="catalog-content">
        <div class="service-contnet">
          <!-- 收藏模块 -->
          <div class="service-block">
            <div v-show="!$utils.isEmpty(favoriteData.tbodyList)" class="block-top">
              <div class="title text-title">
                <span class="text-grey">{{ $t('page.collect') }}</span>
              </div>
              <div class="more cursor" @click="getMore()">
                <span v-show="favoriteData.pageCount > 1">{{ $t('page.viewmore') }}</span>
              </div>
            </div>
            <div class="block-content">
              <div v-if="favoriteData.currentPage > 1 && favoriteData.pageCount > 1" class="left arrow arrow-left" @click="previousPage()">
              </div>
              <div v-if="favoriteData.currentPage < favoriteData.pageCount && favoriteData.pageCount > 1" class="right arrow arrow-right" @click="nextPage()">
              </div>
              <TsRow>
                <template v-slot>
                  <div :class="favoriteData.pageCount > 1 ? 'heightBlock' : ''" class="catalog">
                    <div v-for="(item, index) in favoriteData.tbodyList" :key="index">
                      <Col span="6">
                        <div class="list collection bg-op noShadow" @click="toAddJob(item)">
                          <div class="favorite text-primary" :class="item.isFavorite ? 'like' : ''" @click.stop="handleCollect(item, true)">
                            <i class="tsfont-star"></i>
                          </div>
                          <div class="content">
                            <div class="title">{{ item.name }}</div>
                            <Tooltip
                              class="tooltip-wrap mt-xs"
                              transfer
                              placement="bottom-start"
                              max-width="300"
                              theme="light"
                            >
                              <div slot="content" class="tooltip-content" v-html="item.description ? removeHTMLTag(escape2Html(item.description)) : ''"></div>
                              <div class="tips text-tip line-2 tooltip-wrap" v-html="item.description ? removeHTMLTag(escape2Html(item.description)) : '-'"></div>
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
          <div v-for="(item, dindex) in catalogPath" :key="dindex" class="service-block">
            <ServiceContent
              :item="item"
              :likeItemId="collectId"
              :likeItemAction="collectAction"
              @handleCollect="handleCollect"
            ></ServiceContent>
          </div>
          <NoData v-show="!loadingShow && catalogPath.length == 0" class="mt-nm"></NoData>
          <div class="load-more-text">
            <span v-show="pageCount > 1 && catalogPath.length !== 0" :style="loadMoreText == '到底了' ? 'cursor: default;' : ''" @click="clickgetMore()">{{ loadMoreText }}</span>
          </div>
        </div>
      </div>
    </TsContain>
    <SeeMoreDialog
      v-if="isShowSeeMoreDialog"
      :parentId="parentId"
      :catalogPath="catalogPath"
      @handleCollect="handleCollect"
      @close="closeDialog"
    ></SeeMoreDialog>
  </div>
</template>

<script>
import serivemixin from './serivemixin.js';
export default {
  //服务目录
  name: '',
  components: {
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    ServiceContent: resolve => require(['./service-content'], resolve),
    SeeMoreDialog: resolve => require(['./see-more-dialog'], resolve)
  },
  mixins: [serivemixin],
  props: {},
  data() {
    return {
      loadingShow: false,
      isShowSeeMoreDialog: false,
      leftWidth: 0,
      pageSize: 8,
      currentPage: 1,
      pageCount: null,
      keyword: '', //搜索内容
      clientHeight: document.documentElement.clientHeight, //窗口高度
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
  beforeMount() {},
  mounted() {
    window.onresize = () => {
      return (() => {
        this.clientHeight = document.documentElement.clientHeight;
      })();
    };
  },
  methods: {
    //获取所有服务目录
    getAllService() {
      this.$api.autoexec.catalogManage.allService().then(res => {
        if (res.Status == 'OK') {
          this.selectData = this.getItemlist(res.Return);
        }
      });
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
    getServiceCatalogPath(currentPage, parentId) {
      let tbodyList = [];
      this.loadingShow = true;
      let params = {
        currentPage: currentPage,
        pageSize: this.pageSize,
        parentId: parentId,
        keyword: this.keyword
      };
      if (currentPage > 1 && currentPage > this.pageCount) {
        this.loadingShow = false;
        return;
      }
      this.$api.autoexec.catalogManage.getCalalogroute(params).then(res => {
        if (res.Status == 'OK') {
          if (!this.$utils.isEmpty(res.Return)) {
            tbodyList = res.Return.tbodyList;
            this.pageCount = res.Return.pageCount;
          } else {
            tbodyList = [];
          }
          if (currentPage > 1) {
            tbodyList.forEach(item => {
              this.catalogPath.push(item);
            });
          } else {
            this.catalogPath = tbodyList;
          }
          //如果当前页等于总页数
          if (currentPage == this.pageCount) {
            this.loadMoreText = this.$t('page.loadfinish');
          } else if (currentPage < this.pageCount) {
            this.loadMoreText = this.$t('page.loadmore');
          }
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    clickgetMore() {
      this.currentPage += 1;
      if (this.currentPage) {
        let parentId = this.selectValue[this.selectValue.length - 1];
        this.getServiceCatalogPath(this.currentPage, parentId);
      }
    },
    //查看更多
    getMore(id) {
      this.parentId = id || null;
      this.isShowSeeMoreDialog = true;
    },
    //向右翻页
    nextPage() {
      this.getFavoriteList(this.favoriteData.currentPage + 1);
    },
    //向左翻页
    previousPage() {
      this.getFavoriteList(this.favoriteData.currentPage - 1);
    },
    //右上角搜索
    searchCatalog: function() {
      let parentId = this.selectValue[this.selectValue.length - 1];
      this.currentPage = 1;
      this.getServiceCatalogPath(this.currentPage, parentId);
      this.getFavoriteList(this.currentPage, parentId);
    },
    format(labels, selectedData) {
      return labels[labels.length - 1];
    },
    closeDialog(needRefresh) {
      this.isShowSeeMoreDialog = false;
      if (needRefresh) {
        let parentId = this.selectValue[this.selectValue.length - 1];
        this.getFavoriteList(1, parentId);
      }
    }
  },

  computed: {
    scrollheight: function() {
      let height = this.clientHeight - 58;
      return height;
    }
  },
  watch: {
    selectValue: function() {
      let parentId = this.selectValue[this.selectValue.length - 1];
      this.currentPage = 1;
      this.likeShow = true; //显示收藏
      this.getServiceCatalogPath(this.currentPage, parentId);
      this.getFavoriteList(this.currentPage, parentId);
    }
  }
};
</script>
<style lang="less">
@import (reference) '~@/resources/assets/css/variable.less';
.catalog .noShadow {
  box-shadow: 0px 0px 0px 0px rgb(0 0 0 / 10%) !important;
  border-radius: 10px !important;
}
.service-catalog-manage-wrap {
  .service-contnet {
    padding: 0 16px;
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
    .service-block {
      height: 100%;
      margin-bottom: 8px;
      .block-top {
        position: relative;
        .title {
          span {
            display: inline-block;
          }
          .arr-nextpath {
            vertical-align: middle;
            height: 22px;
            line-height: 22px;
            &:before {
              margin: 0 6px;
              font-size: 80%;
              opacity: 0.4;
            }
          }
        }
        .more {
          position: absolute;
          right: 0;
          bottom: 0;
        }
      }
      .block-content {
        position: relative;
        .left {
          position: absolute;
          top: 100px;
          left: -16px;
          width: 12px;
          height: 32px;
          cursor: pointer;
        }
        .right {
          position: absolute;
          top: 100px;
          right: -16px;
          width: 12px;
          height: 32px;
          cursor: pointer;
        }
        .heightBlock {
          overflow: hidden;
        }
        .list {
          margin: 8px 0;
          height: 110px;
          padding: 0 40px 0 24px;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          .favorite {
            width: 32px;
            height: 32px;
            position: absolute;
            right: 8px;
            top: 6px;
            display: none;
            text-align: center;
            line-height: 31px;
            .transition(200ms all);
            i {
              font-size: @font-size-base;
            }
          }
          .like {
            display: block;
          }
          .border-radius(2px);
          .transition(200ms all);
          &:hover {
            .box-shadow(0px 4px 12px 0px rgba(0, 0, 0, 0.15));
            .transition(200ms all);
            .favorite {
              display: block;
              .border-radius(2px);
            }
          }
          .logo {
            float: left;
            width: 40px;
            height: 40px;
            border-radius: 40px;
            text-align: center;
            margin-top: 20px;
            .logo-icon {
              font-size: 40px;
            }
          }
          .content {
            padding: 24px 0;
            overflow: hidden;
            .title {
              font-size: 14px;
              height: 20px;
              line-height: 20px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            .tooltip-wrap {
              width: 100%
            }
          }
        }
      }
    }
  }
  .ivu-cascader-menu {
    height: 100%;
  }
}
</style>
