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
        <span v-show="serviceData.pageCount > 1" class="cursor" @click="openServiceListDialog()">{{ $t('page.viewmore') }}</span>
      </div>
    </div>
    <div v-if="!$utils.isEmpty(serviceData)">
      <div class="block-content">
        <span
          v-if="serviceData.currentPage > 1 && serviceData.pageCount > 1"
          class="left arrow arrow-left"
          @click="goLeft()"
        ></span>
        <span
          v-if="serviceData.currentPage < serviceData.pageCount && serviceData.pageCount > 1"
          class="right arrow arrow-right"
          @click="goRight()"
        ></span>
        <TsRow>
          <template v-slot>
            <div :class="serviceData.pageCount > 1 ? 'heightBlock' : ''">
              <Col v-for="serviceItem in serviceData.tbodyList" :key="serviceItem.id" span="6">
                <ServiceCard
                  :item="serviceItem"
                  :isShowLike="isShowLike"
                  :favoriteState="favoriteState"
                  :favoritePending="favoritePending"
                  @select="toCreateJob"
                  @favorite="handleCollection"
                >
                </ServiceCard>
              </Col>
            </div>
          </template>
        </TsRow>
      </div>
    </div>
    <ServiceListDialog
      v-if="isShowServiceListDialog"
      :pathList="item.upwardNameList"
      :parentId="item.id"
      :favoriteState="favoriteState"
      :favoritePending="favoritePending"
      @close="closeServiceListDialog"
      @handleCollect="handleCollection"
      @loaded="$emit('loaded', $event)"
    >
    </ServiceListDialog>
  </div>
</template>

<script>
import ServiceCard from './service-card.vue';
export default {
  name: 'ServiceGroup',
  components: {
    ServiceCard,
    ServiceListDialog: () => import('../servicecatalog/service-list-dialog')
  },
  props: {
    item: {
      type: Object,
      default: function() {
        return {};
      }
    },
    favoriteState: { type: Object, default: () => ({}) },
    favoritePending: { type: Object, default: () => ({}) },
    pagingDisabled: Boolean,
    isShowLike: {
      // 显示收藏按钮
      type: Boolean,
      default: true
    },
    favoriteSection: Boolean
  },
  data() {
    return {
      listLoading: false,
      isShowServiceListDialog: false,
      serviceData: {
        currentPage: 1,
        pageSize: 8,
        tbodyList: []
      }
    };
  },
  created() {
    this.serviceData = Object.assign({}, this.serviceData, this.$utils.deepClone(this.item));
  },
  methods: {
    toCreateJob(item) {
      this.$router.push({ path: '/create-job', query: { id: item.id, name: item.name } });
    },
    setTitleToString(list, index) {
      return index > 0 ? 'tsfont-right arr-nextpath' : 'arr-nextpath';
    },
    closeServiceListDialog() {
      this.isShowServiceListDialog = false;
    },
    handleCollection(item) {
      this.$emit('handleCollect', item);
    },
    //获取服务
    async getServiceList(currentPage) {
      if (this.listLoading) return;
      this.listLoading = true;
      try {
        const res = await this.$api.autoexec.catalogManage.searchService({
          currentPage, pageSize: this.serviceData.pageSize, parentId: this.item.id, keyword: this.item.keyword || ''
        });
        if (res.Status === 'OK') {
          this.serviceData = res.Return;
          this.$emit('loaded', res.Return.tbodyList || []);
        }
      } finally {
        this.listLoading = false;
      }
    },
    openServiceListDialog() {
      this.isShowServiceListDialog = true;
    },
    //向右翻页
    goRight() {
      if (this.listLoading || this.pagingDisabled) return;
      if (this.serviceData.currentPage >= this.serviceData.pageCount) return;
      if (this.favoriteSection) {
        this.$emit('pageChange', this.serviceData.currentPage + 1);
        return;
      }
      return this.getServiceList(this.serviceData.currentPage + 1);
    },
    //向左翻页
    goLeft() {
      if (this.listLoading || this.pagingDisabled) return;
      if (this.serviceData.currentPage <= 1) return;
      if (this.favoriteSection) {
        this.$emit('pageChange', this.serviceData.currentPage - 1);
        return;
      }
      return this.getServiceList(this.serviceData.currentPage - 1);
    }
  },
  watch: {
    item(next, previous) {
      this.listLoading = false;
      if (next.id !== previous.id || next.keyword !== previous.keyword) this.isShowServiceListDialog = false;
      this.serviceData = { currentPage: 1, pageSize: 8, ...this.$utils.deepClone(next) };
    }
  }
};
</script>
<style lang="less" scoped>
.block-top {
  position: relative;
  .title {
    span { display: inline-block; }
    .arr-nextpath {
      vertical-align: middle;
      height: 22px;
      line-height: 22px;
      &:before { margin: 0 6px; font-size: 80%; opacity: 0.4; }
    }
  }
  .more { position: absolute; right: 0; bottom: 0; }
}
.block-content {
  position: relative;
  .left, .right { position: absolute; top: 100px; width: 12px; height: 32px; cursor: pointer; }
  .left { left: -16px; }
  .right { right: -16px; }
  .heightBlock { overflow: hidden; }
}
</style>
