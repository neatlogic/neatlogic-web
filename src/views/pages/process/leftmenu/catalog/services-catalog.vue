<template>
  <div class="services-catalog-box">
    <div v-for="(item, index) in dataList" :key="index">
      <div class="path-box pb-sm">
        <div class="title">
          <span 
            v-for="(ttext, tindex) in item.path" 
            :key="tindex" 
            class="text-grey" 
            :class="setTitlearr(item, tindex)"
          >{{ ttext }}</span>
        </div>
        <div v-show="item.servicesObj && item.servicesObj.pageCount > 1" class="text-action" @click="lookMore(item)">
          {{ $t('page.viewmore') }}
        </div>
      </div>
      <div v-if="item.servicesObj" class="services-content-box">
        <span v-if="item.servicesObj.currentPage > 1 && item.servicesObj.pageCount > 1" class="left-arrow-box arrow arrow-left" @click="previousPage(item)"></span>
        <span v-if="item.servicesObj.currentPage < item.servicesObj.pageCount && item.servicesObj.pageCount > 1" class="right-arrow-box arrow arrow-right" @click="nextPage(item)"></span>
        <TsRow>
          <template v-slot>
            <div>
              <div v-for="(seritem, serindex) in item.servicesObj.channelList" :key="serindex" @click="gotoWorkOrder(seritem)">
                <Col span="6">
                  <div class="list pl-lg pr-lg radius-md mb-nm overflow bg-op">
                    <div class="logo pr-sm">
                      <i class="logo-icon text-primary" :class="[seritem.icon ? seritem.icon : 'ts-m-playbook', item.color ? '' : 'text-primary']"></i>
                    </div>
                    <div class="overflow">
                      <div class="overflow pb-xs" :title="seritem.name">{{ seritem.name }}</div>
                      <Tooltip 
                        transfer 
                        placement="bottom-start" 
                        max-width="300" 
                        class="services-catalog-tooltip-wrap"
                        theme="light"
                        :disabled="!seritem.desc"
                      >
                        <div slot="content" class="text-grey" v-html="seritem.desc ? removeHTMLTag(escape2Html(seritem.desc)) : ''"></div>
                        <div class="overflow text-grey description-text" v-html="seritem.desc ? removeHTMLTag(escape2Html(seritem.desc)) : '-'"></div>
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
      @close="closeSeeMoreDialog"
      @goto-work-order="gotoWorkOrder"
    ></SeeMore>
  </div>
</template>

<script>
export default {
  name: 'ServicesCatalog',
  components: {
    SeeMore: resolve => require(['./see-more.vue'], resolve) // 查看更多
  },
  props: {
    dataList: {
      type: Array,
      default: function() {
        return [];
      }
    }
  },
  data() {
    return {
      pageSize: 8,
      isShowSeeMore: false,
      moreParams: {} // 查看更多参数
    };
  },

  created() {
    this.dataList.forEach((item) => {
      this.getServiceCatalog(item);
    });
  },
  beforeMount() {},
  mounted() {},
  methods: {
    //获取服务
    getServiceCatalog: function(item, currentPage) {
      let params = {
        pageSize: this.pageSize,
        parentUuid: item.uuid,
        currentPage: currentPage,
        keyword: item.keyword,
        isAuthenticate: 1
      };
      this.$api.process.service.searchService(params).then(res => {
        if (res.Status == 'OK') {
          this.$set(item, 'servicesObj', res.Return);
        }
      });
    },
    // 下一个页
    nextPage(item) {
      let currentPage = item.servicesObj ? item.servicesObj.currentPage : 1;
      this.getServiceCatalog(item, currentPage + 1);
    },
    // 上一页
    previousPage(item) {
      let currentPage = item.servicesObj ? item.servicesObj.currentPage : 1;
      this.getServiceCatalog(item, currentPage - 1);
    },
    gotoWorkOrder(selectedObj) {
      this.$emit('goto-work-order', selectedObj);
    },
    lookMore(item) {
      // 查看更多
      this.isShowSeeMore = true;
      this.moreParams = item;
    },
    closeSeeMoreDialog() {
      this.isShowSeeMore = false;
      this.moreParams = {};
    }
  },

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
