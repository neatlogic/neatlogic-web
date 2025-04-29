<template>
  <div>
    <div style="text-align: right;">
      <InputSearcher v-model="keyword" width="400px" @change="searchCiEntity(1)"></InputSearcher></div>
    <div
      v-for="cientity in ciEntityList"
      :key="cientity.id"
      class="cientity-item margin-md cursor"
      @click="toggleCiEntity(cientity)"
    >
      <div class="cientity-item-circle" :class="selectedIdListLocal.includes(cientity.id) ? 'bg-primary' : 'bg-info-grey'">
        <span :class="cientity.ciIcon" class="text-op cientity-item-icon"></span>
      </div>
      <div class="overflow" :title="cientity.name">{{ cientity.name }}</div>
    </div>
    <div style="text-align: right"><Page
      :total="rowNum"
      :page-size="pageSize"
      size="small"
      transfer
      show-total
      @on-change="currentPage => searchCiEntity(currentPage)"
    /></div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue')
  },
  props: {
    isEmiting: { type: Boolean, default: false }, //是否正在处理外部异步事件
    ciId: { type: Number },
    relId: { type: Number },
    relCiEntityId: { type: Number },
    direction: { type: String },
    selectedIdList: { type: Array }
  },
  data() {
    return {
      keyword: '',
      currentPage: 1,
      pageSize: 24,
      rowNum: 0,
      pageCount: 0,
      ciEntityList: [],
      selectedIdListLocal: this.$utils.deepClone(this.selectedIdList) || []
    };
  },
  beforeCreate() {},
  created() {
    this.searchCiEntity();
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
    toggleCiEntity(cientity) {
      if (this.isEmiting) {
        return;
      }
      if (!this.selectedIdListLocal.includes(cientity.id)) {
        this.selectedIdListLocal.push(cientity.id);
        this.$emit('append', cientity);
      } else {
        const index = this.selectedIdListLocal.indexOf(cientity.id);
        this.selectedIdListLocal.splice(index, 1);
        this.$emit('remove', cientity);
      }
    },
    searchCiEntity(currentPage) {
      this.$api.cmdb.cientity
        .searchCiEntity({
          keyword: this.keyword,
          currentPage: currentPage || 1,
          pageSize: this.pageSize,
          ciId: this.ciId,
          relId: this.relId,
          direction: this.direction,
          relCiEntityId: this.relCiEntityId,
          showAttrRelList: ['const_name', 'const_id'] //限制返回信息
        })
        .then(res => {
          this.currentPage = res.Return.currentPage;
          this.pageSize = res.Return.pageSize;
          this.pageCount = res.Return.pageCount;
          this.rowNum = res.Return.rowNum;
          this.ciEntityList = res.Return.tbodyList;
        });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.cientity-item {
  display: inline-block;
  width: 130px;
  height: 100px;
  text-align: center;
  .cientity-item-circle {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    margin: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    .cientity-item-icon {
      font-size: 25px;
    }
  }
}
</style>
