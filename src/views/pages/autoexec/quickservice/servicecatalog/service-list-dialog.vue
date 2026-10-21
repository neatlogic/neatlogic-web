<template>
  <div>
    <TsDialog v-bind="dialogSetting" @on-close="closeDialog">
      <template v-slot:header>
        <template v-if="titlePath">
          <span
            v-for="(pathItem, pathIndex) in titlePath"
            :key="pathIndex"
            :class="setTitleToString(titlePath, pathIndex)"
          >{{ pathItem }}</span>
        </template>
      </template>
      <template v-slot>
        <div class="search">
          <InputSearcher v-model="keyword" @change="searchFunction"></InputSearcher>
        </div>
        <Loading :loadingShow="loadingShow" type="fix"></Loading>
        <div v-if="!$utils.isEmpty(favoriteData.tbodyList)" class="pb-md">
          <ServiceCard
            v-for="serviceItem in favoriteData.tbodyList"
            :key="serviceItem.id"
            :item="serviceItem"
            :favoriteState="favoriteState"
            :favoritePending="favoritePending"
            compact
            @select="toCreateJob"
            @favorite="handleCollection"
          ></ServiceCard>
        </div>
        <div v-else>
          <NoData v-show="!loadingShow"></NoData>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import ServiceCard from '../components/service-card.vue';
export default {
  name: 'ServiceListDialog',
  components: {
    ServiceCard,
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue')
  },
  props: {
    favoriteState: { type: Object, default: () => ({}) },
    favoritePending: { type: Object, default: () => ({}) },
    parentId: {
      type: [Number, String],
      default: null
    },
    pathList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogSetting: {
        type: 'modal',
        className: 'quickservice-list-dialog',
        hasFooter: false,
        maskClose: true,
        isShow: true
      },
      keyword: '',
      favoriteData: {},
      titlePath: [],
      loadingShow: false
    };
  },
  created() {
    this.getServiceList();
  },
  methods: {
    toCreateJob(item) {
      this.$router.push({ path: '/create-job', query: { id: item.id, name: item.name } });
    },
    setTitleToString(list, index) {
      return index > 0 ? 'tsfont-right arr-nextpath' : 'arr-nextpath';
    },
    closeDialog() {
      this.$emit('close');
    },
    handleCollection(item) {
      this.$emit('handleCollect', item);
    },
    searchFunction() {
      this.getServiceList();
    },
    // 获取服务列表
    async getServiceList() {
      this.loadingShow = true;
      const params = { needPage: false, parentId: this.parentId, keyword: this.keyword };
      try {
        const res = this.parentId ? await this.$api.autoexec.catalogManage.searchService(params) : await this.$api.autoexec.catalogManage.getFavorite(params);
        if (res.Status !== 'OK') return;
        this.favoriteData = { ...res.Return, tbodyList: (res.Return.tbodyList || []).map(item => (this.parentId ? item : { ...item, isFavorite: 1 })) };
        this.$emit('loaded', this.favoriteData.tbodyList);
        this.titlePath = this.parentId ? this.pathList : [this.$t('page.collect')];
      } finally {
        this.loadingShow = false;
      }
    }
  },
  watch: {
    parentId() {
      this.getServiceList();
    }
  }
};
</script>
<style lang="less">
.quickservice-list-dialog {
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
    }
    .search {
      padding: 0 24px 10px;
      position: relative;
    }
  }
}
</style>
