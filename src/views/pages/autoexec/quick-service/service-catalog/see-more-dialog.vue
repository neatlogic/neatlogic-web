<template>
  <div>
    <TsDialog
      v-bind="dialogSetting"
      @on-close="closeDialog"
    >
      <template v-slot:header>
        <template v-if="titlePath">
          <span v-for="(pathItem, pathIndex) in titlePath" :key="pathIndex" :class="setTitleToString(titlePath, pathIndex)">{{ pathItem }}</span>
        </template>
      </template>
      <template v-slot>
        <div class="search">
          <InputSearcher
            v-model="keyword"
            @change="searchFunction"
          ></InputSearcher>
        </div>
        <Loading
          :loadingShow="loadingShow"
          type="fix"
        ></Loading>
        <div v-if="!$utils.isEmpty(favoriteData.tbodyList)" class="pb-md">
          <div
            v-for="(serviceItem, channelIndex) in favoriteData.tbodyList"
            :key="channelIndex"
            class="more-item li-hover overflow"
            :title="serviceItem.name && serviceItem.name.length > 40 ? serviceItem.name : ''"
            :class="serviceItem.isFavorite == 1 ? 'like' : ''"
            @click="toAddJob(serviceItem)"
          >
            <span class="text title-text">{{ serviceItem.name }}</span>
            <i class="right text-primary" :class="serviceItem.isFavorite ? 'tsfont-star' : 'tsfont-star-border'" @click.stop="handleCollection(serviceItem)"></i>
          </div>
        </div>
        <div v-else>
          <NoData v-show="!loadingShow"></NoData>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import serivemixin from './serivemixin.js';
export default {
  name: '',
  components: {
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue')
  },
  mixins: [serivemixin],
  props: {
    parentId: {
      type: Number,
      default: null
    },
    pathList: {
      type: Array,
      default: () => { []; }
    }
  },
  data() {
    return {
      dialogSetting: {
        type: 'modal',
        className: 'serviceDilog',
        hasFooter: false,
        maskClose: true,
        isShow: true
      },
      keyword: '',
      favoriteData: {},
      titlePath: [],
      collectCancelList: [], // 收藏取消列表
      loadingShow: false
    };
  },
  beforeCreate() {},
  created() {
    this.getMoreList();
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
    closeDialog() {
      this.$emit('close');
    },
    handleCollection(item) {
      this.$emit('handleCollect', item);
    },
    searchFunction() {
      this.getMoreList();
    },
    //查看更多
    getMoreList() {
      this.loadingShow = true;
      let params = {
        needPage: false,
        parentId: this.parentId,
        keyword: this.keyword
      };
      if (!this.parentId) {
        //收藏路径
        this.$api.autoexec.catalogManage.getFavorite({needPage: false, keyword: this.keyword}).then(res => {
          if (res.Status == 'OK') {
            this.favoriteData = res.Return;
            this.$set(this.favoriteData, 'tbodyList', res.Return.tbodyList);
            this.favoriteData.tbodyList && this.favoriteData.tbodyList.forEach((item) => {
              if (item) {
                this.$set(item, 'isFavorite', 1);
              }
            });
            this.collectCancelList = this.$utils.deepClone(this.favoriteData.tbodyList);
            this.titlePath = [this.$t('page.collect')];
          }
        }).finally(() => {
          this.loadingShow = false;
        });
      } else {
        // 普通路径
        this.$api.autoexec.catalogManage.searchService(params).then(res => {
          if (res.Status == 'OK') {
            this.favoriteData = res.Return;
            this.collectCancelList = this.$utils.deepClone(this.favoriteData.tbodyList);
            this.titlePath = this.pathList || [];
          }
        }).finally(() => {
          this.loadingShow = false;
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
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
        .title-text {
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
