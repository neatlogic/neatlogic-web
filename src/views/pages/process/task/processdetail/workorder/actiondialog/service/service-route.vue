<template>
  <div class="service-route">
    <div class="block-main">
      <span v-if="channelObj.currentPage > 1 && channelObj.pageCount > 1" class="left arrow arrow-left" @click="goLeft()"></span>
      <span v-if="channelObj.currentPage < channelObj.pageCount && channelObj.pageCount > 1" class="right arrow arrow-right" @click="goRight()"></span>
      <TsRow>
        <template v-slot>
          <div :class="channelObj.pageCount > 1 ? 'heightBlock' : ''">
            <div v-for="(seritem, serindex) in channelObj.channelList" :key="serindex">
              <Col span="6">
                <div class="list block-container" :class="seritem.isFavorite ? 'collection' : ''" @click="goWorkOrder(seritem)">
                  <div class="logo">
                    <i class="logo-icon text-primary" :class="seritem.icon ? seritem.icon : 'tsfont-ip-list'"></i>
                  </div>
                  <div class="content">
                    <div class="title overflow">{{ seritem.name }}</div>
                    <Tooltip
                      class="text"
                      transfer
                      placement="bottom-start"
                      max-width="300"
                      theme="light"
                    >
                      <div slot="content" class="tooltip-content" v-html="seritem.desc ? removeHTMLTag(escape2Html(seritem.desc)) : ''"></div>
                      <div class="text-tip text-overflow" v-html="seritem.desc ? removeHTMLTag(escape2Html(seritem.desc)) : ''"></div>
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
</template>
<script>
export default {
  name: '',
  components: {},
  filters: {},
  props: {
    channelData: Object,
    parentUuid: {
      type: [String, Number],
      default: 0
    },
    defaultKeyword: {
      type: String,
      default: null
    },
    channelTypeRelationId: {
      type: [String, Number],
      default: null
    },
    channelUuid: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      processTaskId: null,
      keyword: null,
      channelObj: null,
      channelList: [],
      pageSize: 8
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.processTaskId = this.$route.query.processTaskId || null;
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    //获取服务
    getServicechannel: function(currentPage) {
      let _this = this;
      let parentUuid = this.parentUuid;
      let keyword = this.keyword;
      let params = {
        pageSize: _this.pageSize,
        parentUuid: parentUuid,
        currentPage: currentPage,
        keyword: keyword,
        isAuthenticate: 1,
        channelTypeRelationId: this.channelTypeRelationId,
        channelUuid: this.channelUuid
      };
      this.$api.process.service.searchService(params).then(res => {
        if (res.Status == 'OK') {
          let config = res.Return;
          _this.channelObj = config;
        }
      });
    },
    //向右翻页
    goRight: function() {
      let currentPage = this.channelObj.currentPage;
      this.getServicechannel(currentPage + 1);
    },
    //向左翻页
    goLeft: function() {
      let currentPage = this.channelObj.currentPage;
      this.getServicechannel(currentPage - 1);
    },
    //跳转到工单上报
    goWorkOrder: function(item) {
      let uuid = item.uuid;
      this.$router.push({
        path: '/task-dispatch',
        query: {
          uuid: uuid,
          fromProcessTaskId: this.processTaskId,
          channelTypeRelationId: this.channelTypeRelationId
        }
      });
    }
  },
  computed: {
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
    channelData: {
      handler(val) {
        if (val) {
          let obj = this.$utils.deepClone(val);
          this.channelObj = obj;
          this.channelList = obj.channelList || [];
        }
      },
      deep: true,
      immediate: true
    },
    defaultKeyword: {
      handler(val) {
        this.keyword = val || '';
      },
      immediate: true
    }
  }
};
</script>
<style lang='less' scoped>
.service-route {
  .block-main {
    position: relative;
    .list {
      margin: 8px 0;
      height: 100px;
      padding: 0 40px 0 24px;
      overflow: hidden;
      position: relative;
      cursor: pointer;
      border-radius: 2px;
      transition: 200ms all;
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
      }
    }
  }
  .arrow-left {
    position: absolute;
    top: 95px;
    left: -16px;
    width: 12px;
    height: 44px;
    cursor: pointer;
  }
  .arrow-right {
    position: absolute;
    top: 95px;
    right: -16px;
    cursor: pointer;
    width: 12px;
    height: 44px;
  }
  .heightBlock {
    height: 242px;
    overflow: hidden;
    margin-bottom: -10px;
  }
  .text-overflow {
    display: -webkit-box;
    text-overflow: -o-ellipsis-lastline;
    overflow: hidden;
    text-overflow: ellipsis;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}
</style>
