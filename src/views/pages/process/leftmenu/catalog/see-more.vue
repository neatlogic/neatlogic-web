<template>
  <div>
    <TsDialog
      type="modal"
      :isShow="true"
      :hasFooter="false"
      @on-close="closeDialog"
    >
      <template v-slot:header>
        <div v-if="isCollect">{{ $t('page.collect') }}</div>
        <div v-else>
          <span v-for="(item, tindex) in params.path" :key="tindex" :class="setTitleArrow(params, tindex)">{{ item }}</span>
        </div>
      </template>
      <template v-slot>
        <div class="see-more-box">
          <div class="search">
            <TsFormInput
              v-model="keyword"
              border="border"
              search
              @on-enter="getServiceCatalog(params)"
              @on-search="getServiceCatalog(params)"
            ></TsFormInput>
          </div>
          <loading :loadingShow="isLoading" type="fix"></loading>
          <div v-if="moreList && moreList.length > 0" class="pb-md">
            <div
              v-for="(item, index) in moreList"
              :key="index"
              class="more-item li-hover"
              @click="gotoWorkOrder(item)"
            >
              <i :class="item.icon ? item.icon : 'ts-m-playbook'"></i>
              <span class="text">{{ item.name }}</span>
            </div>
          </div>
          <div v-else>
            <NoData v-show="!isLoading"></NoData>
          </div>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: 'SeeMore',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  props: {
    params: {
      type: Object,
      default: function() {
        return {};
      }
    },
    isCollect: { // 是否是收藏模块
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      keyword: '',
      isLoading: false,
      moreList: []
    };
  },
  created() {
    this.getServiceCatalog(this.params);
  },
  methods: {
    gotoWorkOrder(selectedObj) {
      this.$emit('goto-work-order', selectedObj);
    },
    getServiceCatalog(item) {
      let params = {
        needPage: false,
        parentUuid: item.uuid,
        currentPage: 1,
        keyword: this.keyword,
        isAuthenticate: 1
      };
      if (this.isCollect) {
        params.isFavorite = 1;
      } else {
        delete params.isFavorite;
      }
      this.$api.process.service.searchService(params).then(res => {
        if (res.Status == 'OK') {
          this.moreList = res.Return ? res.Return.channelList : [];
        }
      });
    },
    closeDialog() {
      this.$emit('close');
    }
  },
  computed: {
    setTitleArrow() {
      return function(item, tindex) {
        let arr = item.path;
        if (arr && arr.length > 0 && tindex > 0) {
          return 'ts-angle-right arr-nextpath';
        } else {
          return '';
        }
      };
    }
  }
};
</script>
<style lang="less" scoped>
.see-more-box {
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
   .search {
        position: relative;
        padding-bottom: 10px;
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
          font-size: 12px;
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
</style>
