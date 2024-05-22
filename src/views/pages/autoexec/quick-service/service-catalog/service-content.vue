<template>
  <div>
    <div class="block-top">
      <div class="title">
        <span
          v-for="(pathItem, pathIndex) in item.upwardNameList"
          :key="pathIndex"
          class="text-grey"
          :class="setTitleToString(item.upwardNameList, pathIndex)"
        >{{ pathItem }}</span>
      </div>
      <div class="more">
        <span v-show="serviceData.pageCount > 1" class="cursor" @click="seeMore()">{{ $t('page.viewmore') }}</span>
      </div>
    </div>
    <div v-if="!$utils.isEmpty(serviceData)">
      <div class="block-content">
        <span v-if="serviceData.currentPage > 1 && serviceData.pageCount > 1" class="left arrow arrow-left" @click="goLeft()">
        </span>
        <span v-if="serviceData.currentPage < serviceData.pageCount && serviceData.pageCount > 1" class="right arrow arrow-right" @click="goRight()">
        </span>
        <TsRow>
          <template v-slot>
            <div :class="serviceData.pageCount > 1 ? 'heightBlock' : ''">
              <div v-for="(serviceItem, serindex) in serviceData.tbodyList" :key="serindex" @click.stop="toAddJob(serviceItem)">
                <Col span="6">
                  <div class="list noShadow" :class="[serviceItem.isFavorite ? 'collection' : '', serviceItem.currentSelected ? 'active border-primary bg-info-grey' : 'bg-op']" @click="toAddJob(serviceItem)">
                    <div v-show="isShowLike" :class="serviceItem.isFavorite ? 'favorite like text-primary' : 'favorite text-primary'" @click.stop="handleCollection(serviceItem)">
                      <i :class="serviceItem.isFavorite ? 'tsfont-star' : 'tsfont-star-border'"></i>
                    </div>
                    <div class="content">
                      <div class="title">{{ serviceItem.name }}</div>
                      <Tooltip
                        class="tooltip-box-width mt-xs"
                        transfer
                        placement="bottom-start"
                        max-width="300"
                        theme="light"
                      >
                        <div slot="content" class="tooltip-content" v-html="serviceItem.description ? removeHTMLTag(escape2Html(serviceItem.description)) : ''"></div>
                        <div class="tips text-tip line-2 tooltip-box-width" v-html="serviceItem.description ? removeHTMLTag(escape2Html(serviceItem.description)) : '-'"></div>
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
    <SeeMoreDialog
      v-if="isShowSeeMoreDialog"
      :pathList="item.upwardNameList"
      :parentId="item.id"
      @close="closeDialog"
      @handleCollect="handleCollection"
    ></SeeMoreDialog>
  </div>
</template>

<script>
import serivemixin from './serivemixin.js';
export default {
  name: '',
  components: {
    SeeMoreDialog: () => import('./see-more-dialog')
  },
  mixins: [serivemixin],
  props: {
    item: {
      type: Object,
      default: function() {
        return [];
      }
    },
    likeItemId: {
      type: [String, Number],
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
    }
  },
  data() {
    return {
      isShowSeeMoreDialog: false,
      serviceData: {
        currentPage: 1,
        pageSize: 8,
        tbodyList: []
      }
    };
  },
  created() {
    this.serviceData = Object.assign(this.serviceData, this.item);
  },
  beforeMount() {},
  mounted() {},
  methods: {
    closeDialog() {
      this.isShowSeeMoreDialog = false;
    },
    handleCollection(item) {
      this.$emit('handleCollect', item);
    },
    //获取服务
    getServiceList() {
      let parentId = this.item.id;
      let keyword = this.item.keyword || '';
      let params = {
        currentPage: this.serviceData.currentPage,
        pageSize: this.serviceData.pageSize,
        parentId: parentId,
        keyword: keyword
      };
      this.$api.autoexec.catalogManage.searchService(params).then(res => {
        if (res.Status == 'OK') {
          this.serviceData = res.Return;
        }
      });
    },
    seeMore() {
      this.isShowSeeMoreDialog = true;
    },
    //向右翻页
    goRight() {
      this.serviceData.currentPage++;
      this.getServiceList();
    },
    //向左翻页
    goLeft() {
      this.serviceData.currentPage--;
      this.getServiceList();
    }
  },
  computed: {},
  watch: {
    likeItemAction: function() {
      this.serviceData.tbodyList.forEach(item => {
        if (item.id == this.likeItemId) {
          item.isFavorite = this.likeItemAction;
        }
      });
    },
    likeItemId: function() {
      this.serviceData.tbodyList.forEach(item => {
        if (item.id == this.likeItemId) {
          item.isFavorite = this.likeItemAction;
        }
      });
    },
    item: function() {
      this.serviceData = Object.assign(this.serviceData, this.item);
    }
  }
};
</script>
<style lang="less" scoped>
.noShadow{
  box-shadow: 0px 0px 0px 0px rgb(0 0 0 / 10%)!important;
  border-radius: 10px!important;
}
.tooltip-content {
  white-space: normal;
}
.tooltip-box-width {
  width: 100%;
}
</style>
