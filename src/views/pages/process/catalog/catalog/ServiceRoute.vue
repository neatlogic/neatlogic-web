<template>
  <div>
    <div class="block-top">
      <div class="title">
        <span
          v-for="(ttext, tindex) in item.path"
          :key="tindex"
          class="text-grey"
          :class="setTitlearr(tindex)"
        >{{ ttext }}</span>
      </div>
      <div class="more">
        <span v-show="serviceChannel.pageCount > 1" @click="getMore()">{{ $t('page.viewmore') }}</span>
      </div>
    </div>
    <div v-if="serviceChannel != null">
      <div class="block-contnet">
        <span v-if="serviceChannel.currentPage > 1 && serviceChannel.pageCount > 1" class="left arrow arrow-left" @click="goLeft()">
        </span>
        <span v-if="serviceChannel.currentPage < serviceChannel.pageCount && serviceChannel.pageCount > 1" class="right arrow arrow-right" @click="goRight()">
        </span>
        <TsRow>
          <template v-slot>
            <div :class="serviceChannel.pageCount > 1 ? 'heightBlock' : ''">
              <div v-for="(seritem, serindex) in serviceChannel.channelList" :key="serindex" @click="gotoWorkOrder(seritem)">
                <Col span="6">
                  <channel
                    :item="seritem"
                    :isLike="seritem.isFavorite"
                    :parentId="item.uuid"
                    :isShowLike="isShowLike"
                    :hasCallBackMethod="hasCallBackMethod"
                    @fatherMethod="changeLike(item.uuid, seritem)"
                  ></channel>
                </Col>
              </div>
            </div>
          </template>
        </TsRow>
      </div>
    </div>
  </div>
</template>

<script>
import channel from './Channel';
export default {
  name: 'ServiceRoute',

  components: {
    channel
  },
  props: {
    item: {
      type: Object,
      default: function() {
        return [];
      }
    },
    likeItemId: {
      type: String,
      default: ''
    },
    likeItemAction: {
      type: [String, Number],
      default: ''
    },
    isShowLike: {
      // 显示收藏按钮
      type: Boolean,
      default: true
    },
    hasCallBackMethod: {
      // 是否分发跳转
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      pageSize: 8,
      serviceChannel: []
    };
  },

  created() {
    this.getServicechannel();
  },

  beforeMount() {},

  mounted() {},

  methods: {
    //获取服务
    getServicechannel: function(currentPage) {
      let that = this;
      let parentUuid = this.item.uuid;
      let keyword = this.item.keyword;
      if (keyword == undefined) {
        keyword = '';
      }
      let params = {
        pageSize: that.pageSize,
        parentUuid: parentUuid,
        currentPage: currentPage,
        keyword: keyword,
        isAuthenticate: 1
      };
      this.$api.process.service.searchService(params).then(res => {
        if (res.Status == 'OK') {
          let channel_data = res.Return;
          that.serviceChannel = channel_data;
          this.$emit('loading', false);
        }
      });
    },
    //向父组件派发查看更多方法
    getMore: function() {
      this.$emit('getMore');
    },
    //向右翻页
    goRight: function() {
      let currentPage = this.serviceChannel.currentPage;
      this.getServicechannel(currentPage + 1);
    },
    //向左翻页
    goLeft: function() {
      let currentPage = this.serviceChannel.currentPage;
      this.getServicechannel(currentPage - 1);
    },
    changeLike: function(uuid, seritem) {
      this.$emit('changeLike', uuid, seritem);
    },
    gotoWorkOrder(selectedObj) {
      this.serviceChannel.channelList.forEach((item) => {
        this.$set(item, 'currentSelected', false);
        if (item.uuid == selectedObj.uuid) {
          this.$set(item, 'currentSelected', true);
        }
      });
      this.$emit('go-work-order', selectedObj);
    }
  },

  computed: {
    setTitlearr() {
      return function(tindex) {
        let arr = this.item.path;
        if (arr.length > 0 && tindex > 0) {
          return 'ts-angle-right arr-nextpath';
        } else {
          return '';
        }
      };
    }
  },

  watch: {
    likeItemAction: function() {
      this.serviceChannel.channelList.forEach(item => {
        if (item.uuid == this.likeItemId) {
          item.isFavorite = this.likeItemAction;
        }
      });
    },
    likeItemId: function() {
      this.serviceChannel.channelList.forEach(item => {
        if (item.uuid == this.likeItemId) {
          item.isFavorite = this.likeItemAction;
        }
      });
    },
    item: function() {
      this.getServicechannel();
    }
  }
};
</script>
<style lang="less"></style>
