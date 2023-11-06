<template>
  <div class="ServiceDirectory">
    <loading :loadingShow="loadingShow" type="fix"></loading>
    <TsContain border="border">
      <template slot="topRight">
        <TsRow>
          <Col :span="8"><Cascader
            v-model="selectValue"
            :data="selectData"
            change-on-select
            class="select"
            :render-format="format"
            :placeholder="$t('form.placeholder.pleaseselect', {target:$t('term.process.catalog')})"
          ></Cascader></Col>
          <Col :span="16">
            <InputSearcher
              v-model="searchText"
              @change="searchCatalog"
            ></InputSearcher>
          </Col>
        </TsRow>
      </template>
      <div slot="content" class="catalog-content">
        <div class="service-contnet">
          <!-- 收藏模块 -->
          <div class="service-block">
            <div v-show="favoriteData.channelList != ''" class="block-top">
              <div class="title text-title">
                <span class="text-grey">{{ $t('page.collect') }}</span>
              </div>
              <div class="more" @click="getMore()">
                <span v-show="favoriteData.pageCount > 1">{{ $t('page.viewmore') }}</span>
              </div>
            </div>
            <div class="block-contnet">
              <!-- 当前页大于1并且总页数大于1 -->
              <div v-if="favoriteData.currentPage > 1 && favoriteData.pageCount > 1" class="left arrow arrow-left" @click="goLeft()">
              </div>
              <!-- 当前页小于总页数并且总页数大于1 -->
              <div v-if="favoriteData.currentPage < favoriteData.pageCount && favoriteData.pageCount > 1" class="right arrow arrow-right" @click="goRight()">
              </div>
              <TsRow>
                <template v-slot>
                  <div :class="favoriteData.pageCount > 1 ? 'heightBlock' : ''" class="catalog">
                    <div v-for="(item, index) in favoriteData.channelList" :key="index">
                      <Col span="6">
                        <div class="list collection bg-op noShadow" @click="goWorkOrder(item)">
                          <div class="favorite text-primary" :class="item.isFavorite ? 'like' : ''" @click.stop="changeLike(item.parentUuid, item)">
                            <i class="tsfont-star"></i>
                          </div>
                          <div class="logo">
                            <i class="logo-icon" :class="[item.icon ? item.icon : 'tsfont-ip-list', item.color ? '' : 'text-primary']" :style="item.color ? `color:${item.color}` : ''"></i>
                          </div>
                          <div class="content">
                            <div class="title">{{ item.name }}</div>
                            <Tooltip
                              class="text"
                              transfer
                              placement="bottom-start"
                              max-width="300"
                              theme="light"
                            >
                              <div slot="content" class="tooltip-content" v-html="item.desc ? removeHTMLTag(escape2Html(item.desc)) : ''"></div>
                              <div class="overflow" style="width: 100%;" v-html="item.desc ? removeHTMLTag(escape2Html(item.desc)) : '-'"></div>
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
          <!-- -->
          <div v-for="(item, dindex) in calalogRoute" :key="dindex" class="service-block">
            <ServiceRoute
              :item="item"
              :likeItemId="likeItemId"
              :likeItemAction="likeItemAction"
              @getMore="getMore(item.uuid)"
              @changeLike="changeLike"
              @loading="loading"
            ></ServiceRoute>
          </div>
          <no-data v-show="!loadingShow && calalogRoute.length == 0" style="margin-top:24px"></no-data>
          <div class="clickMore">
            <span v-show="pageCount > 1 && calalogRoute.length !== 0" :style="clickMore == $t('page.loadfinish') ? 'cursor: default;' : ''" @click="clickgetMore()">{{ clickMore }}</span>
          </div>
        </div>
      </div>
    </TsContain>

    <!-- </Scroll> -->
    <TsDialog
      :type="type"
      :isShow.sync="modal"
      :hasFooter="false"
      :maskClose="true"
      :className="serviceDilog"
    >
      <template v-slot:header>
        <template v-if="moreTitle">
          <span v-for="(ttext, tindex) in moreTitle" :key="tindex" :class="setTitlearr(tindex)">{{ ttext }}</span>
        </template>
      </template>
      <template v-slot>
        <div class="search">
          <TsFormInput
            v-model="moreSearch"
            border="border"
            search
            clearable
          />
        </div>
        <loading :loadingShow="dialogLoading" type="fix"></loading>
        <div v-if="moreList.channelList != ''" class="pb-md">
          <div
            v-for="(all_item, all_index) in moreList.channelList"
            :key="all_index"
            class="more-item li-hover"
            :class="all_item.isFavorite == '1' ? 'like' : ''"
            @click="goWorkOrder(all_item)"
          >
            <i :class="all_item.icon ? all_item.icon : 'tsfont-ip-list'"></i>
            <span class="text">{{ all_item.name }}</span>
            <i class="right text-primary" :class="all_item.isFavorite ? 'tsfont-star' : 'tsfont-star-border'" @click.stop="changeLike(all_item.parentUuid, all_item)"></i>
          </div>
        </div>
        <div v-else>
          <No-data v-show="!dialogLoading"></No-data>
        </div>
      </template>
    </TsDialog>
  </div>
</template>

<script>
export default {
  //服务目录
  name: '',
  components: {
    ServiceRoute: resolve => require(['./catalog/ServiceRoute.vue'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve)
  },
  props: [''],
  data() {
    return {
      loadingShow: false,
      loadingList: null,
      serviceDilog: 'serviceDilog',
      dialogLoading: false, //对话框loaidng
      isreload: false,
      modal: false,
      type: 'modal',
      leftWidth: 0,
      selectValue: [],
      moreList: [], //查看更多
      moreUuid: null,
      moreTitle: [],
      moreSearch: '',
      clientHeight: document.documentElement.clientHeight, //窗口高度
      pageSize: 8,
      currentPage: 1,
      pageCount: '',
      selectData: [], //所有服务目录（包含层级关系）
      favoriteData: [], //收藏服务
      calalogRoute: [], //服务目录路径
      likeItemId: '',
      likeItemAction: '',
      clickMore: this.$t('page.loadmore'),
      searchText: '' //搜索内容
    };
  },

  created() {
    this.getAllService();
    this.getFavorite(1); //默认第一页
    this.getCalalogroute(1); //默认第一页
  },

  beforeMount() {},

  mounted() {
    const that = this;
    window.onresize = () => {
      return (() => {
        that.clientHeight = document.documentElement.clientHeight;
      })();
    };
  },

  methods: {
    //获取所有服务目录
    getAllService: function() {
      var that = this;
      let params = {
        catalogUuid: 0
      };
      this.$api.process.service.allService(params).then(res => {
        if (res.Status == 'OK') {
          that.selectData = that.getItemlist(res.Return);
        }
      });
    },
    getItemlist: function(arr) {
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
    //获取收藏服务
    getFavorite: function(currentPage, parentUuid) {
      var that = this;
      let catalogUuid = this.selectValue[this.selectValue.length - 1];
      let params = {
        pageSize: that.pageSize,
        isFavorite: 1,
        currentPage: currentPage,
        isAuthenticate: 1,
        parentUuid: parentUuid || catalogUuid,
        keyword: this.searchText
      };
      that.$api.process.service.searchService(params).then(res => {
        if (res.Status == 'OK') {
          that.favoriteData = res.Return;
          that.$set(that.favoriteData, res.Return);
        }
      });
    },
    //获取服务目录路径
    getCalalogroute: function(currentPage, catalogUuid) {
      var that = this;
      that.loadingShow = true;
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

      if (currentPage > 1 && currentPage > that.pageCount) {
        that.loadingShow = false;
        return;
      }
      that.$api.process.service.getCalalogroute(params).then(res => {
        if (res.Status == 'OK') {
          let route_data = '';
          if (res.Return !== undefined) {
            route_data = res.Return.breadcrumbList;
            that.pageCount = res.Return.pageCount;
          } else {
            route_data = '';
          }
          //如果当前页等于总页数
          if (currentPage == that.pageCount) {
            that.clickMore = that.$t('page.loadfinish');
          } else if (currentPage < that.pageCount) {
            that.clickMore = that.$t('page.loadmore');
          }
          if (currentPage > 1) {
            route_data.forEach(item => {
              that.calalogRoute.push(item);
            });
          } else {
            that.calalogRoute = route_data;
          }
          this.loadingList = route_data.length;
          if (this.loadingList == 0) {
            this.loadingShow = false;
          }
        }
      });
    },
    //服务搜索
    searchServicechannel: function(keyword) {
      let params = {
        keyword: keyword,
        pageSize: 20,
        isAuthenticate: 1
      };
      this.$api.process.service.searchService(params).then(res => {
        if (res.Status == 'OK') {
          let channel_data = res.Return.channelList;
          this.searchList = channel_data;
        }
      });
    },

    clickgetMore: function() {
      let that = this;
      that.currentPage += 1;
      if (that.currentPage) {
        let currentPage = that.currentPage;
        let catalogUuid = this.selectValue[this.selectValue.length - 1];
        that.getCalalogroute(currentPage, catalogUuid);
      }
    },
    //查看更多
    getMore: function(uuid, keyword) {
      let _this = this;
      this.dialogLoading = true;
      if (keyword == null) {
        this.modal = true;
      }
      let parentUuid = uuid;
      this.calalogRoute.forEach(item => {
        if (item.uuid == parentUuid) {
          this.moreTitle = item.path;
        }
      });
      let params = {
        needPage: false,
        parentUuid: parentUuid,
        keyword: keyword,
        isAuthenticate: 1
      };
      //普通路径
      if (parentUuid) {
        this.moreUuid = parentUuid;
      } else {
        //收藏路径
        Object.assign(params, {
          isFavorite: 1
        });
        this.moreTitle = [this.$t('page.viewmore')];
      }
      this.$api.process.service.searchService(params).then(res => {
        if (res.Status == 'OK') {
          let all_channel = res.Return;
          this.moreList = all_channel;
          setTimeout(() => {
            _this.dialogLoading = false;
          }, 200);
        }
      });
    },
    //收藏取消收藏
    changeLike: function(parent, item) {
      let _this = this;
      //如果是在收藏的查看更多中点击收藏
      if (this.modal == true && this.moreTitle == this.$t('page.collect')) {
        this.moreList.channelList.forEach((list_item, index) => {
          if (list_item.uuid == item.uuid) {
            this.moreList.channelList.splice(index, 1);
          }
        });
      }
      let action = item.isFavorite == 1 ? 0 : 1;
      let channelUuid = item.uuid;
      let parentId = parent;
      let data = {
        channelUuid: channelUuid,
        action: action
      };
      this.$api.process.service.changeLike(data).then(res => {
        if (res.Status == 'OK') {
          this.getFavorite();
          if (this.moreList.channelList !== undefined) {
            this.moreList.channelList.forEach(item => {
              if (item.uuid == channelUuid) {
                _this.$set(item, 'isFavorite', action);
                _this.likeItemId = item.uuid;
                _this.likeItemAction = action;
              }
            });
          }
          _this.$set(item, 'isFavorite', action);
          _this.likeItemId = item.uuid;
          _this.likeItemAction = action;
          if (action == 1) {
            this.$Message.success(this.$t('message.collectionsuccess'));
          } else {
            this.$Message.success(this.$t('message.cancelsuccess'));
          }
        }
      });
    },
    //向右翻页
    goRight: function() {
      let currentPage = this.favoriteData.currentPage;
      this.getFavorite(currentPage + 1);
    },
    //向左翻页
    goLeft: function() {
      let currentPage = this.favoriteData.currentPage;
      this.getFavorite(currentPage - 1);
    },
    //监听子组件loading字段
    loading: function(val) {
      var _this = this;
      if (!val) {
        _this.loadingList = _this.loadingList - 1;
      }
      if (_this.loadingList == 0) {
        _this.loadingShow = false;
      }
    },
    //右上角搜索
    searchCatalog: function() {
      let catalogUuid = this.selectValue[this.selectValue.length - 1];
      this.currentPage = 1;
      this.getCalalogroute(this.currentPage, catalogUuid);
      this.getFavorite(this.currentPage, catalogUuid);
    },
    format(labels, selectedData) {
      return labels[labels.length - 1];
    },
    //跳转到工单上报
    goWorkOrder: function(item) {
      let uuid = item.uuid;
      this.$router.push({
        path: '/task-dispatch',
        query: {
          uuid: uuid
        }
      });
    }
  },

  computed: {
    scrollheight: function() {
      let height = this.clientHeight - 58;
      return height;
    },
    setTitlearr() {
      return function(tindex) {
        if (tindex > 0 && this.moreTitle.length > 0) {
          return 'tsfont-right arr-nextpath';
        } else {
          return 'arr-nextpath';
        }
      };
    },
    //去除html字符
    removeHTMLTag() {
      return function(str) {
        str = str.replace(/<\/?[^>]*>/g, ''); //去除HTML tag
        str = str.replace(/[ | ]*\n/g, '\n'); //去除行尾空白
        //str = str.replace(/\n[\s| | ]*\r/g,'\n'); //去除多余空行
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

  watch: {
    selectValue: function() {
      let catalogUuid = this.selectValue[this.selectValue.length - 1];
      this.currentPage = 1;
      // this.searchText = ''; //置空右上角搜索框
      this.likeShow = true; //显示收藏
      this.getCalalogroute(this.currentPage, catalogUuid);
      this.getFavorite(this.currentPage, catalogUuid);
    },
    //查看更多搜索
    moreSearch: function() {
      let keyword = this.moreSearch;
      let _this = this;
      setTimeout(() => {
        _this.getMore(this.moreUuid, keyword);
      }, 200);
    },
    modal: function() {
      if (this.modal === false) {
        this.moreUuid = null;
        this.moreList = [];
        this.moreSearch = '';
      }
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
.ServiceDirectory {
  .top-title {
    font-size: @font-size-large;
  }
  .service-contnet {
    padding: 0 16px;
    .clickMore {
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
          font-size: @font-size-small;
          cursor: pointer;
        }
      }
      .block-contnet {
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
          cursor: pointer;
          width: 12px;
          height: 32px;
        }
        .heightBlock {
          height: 242px;
          overflow: hidden;
          margin-bottom: -10px;
        }
        .list {
          margin: 8px 0;
          height: 100px;
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
            padding: 24px 0 0 24px;
            overflow: hidden;
            .title {
              font-size: 14px;
              height: 20px;
              line-height: 20px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            .text {
              width: 100%;
              font-size: 12px;
              color: @icon-color;
              margin-top: 8px;
              height: 17px;
              line-height: 17px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }
      }
    }
  }
}
.serviceDilog {
  .tsmodal-header {
    padding-left: 24px;
    .arr-nextpath {
      display: inline-block;
      vertical-align: middle;
      &:before {
        margin: 0 6px;
        font-size: 80%;
        opacity: 0.4;
      }
    }
  }
  .tsmodal-body {
    height: 300px;
    .tsmodal-content {
      padding: 0;
      .search {
        padding: 0 24px 10px;
        position: relative;
      }
      .more-item {
        height: 40px;
        line-height: 40px;
        padding: 0 24px;
        cursor: pointer;
        &:hover {
          .right {
            display: block;
          }
        }
        .text {
          font-size: @font-size-base;
          padding-left: 10px;
          position: relative;
          top: -2px;
        }
        .right {
          float: right;
          display: none;
          cursor: pointer;
        }
      }
    }
  }
}
</style>
