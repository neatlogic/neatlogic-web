<template>
  <div class="document-main">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <div v-for="(item,index) in list" :key="index" class="list bg-block">
      <span class="tsfont-file-single pr-xs text-primary"></span>
      <div class="item border-color">
        <div class="title overflow pb-xs text-action" @click="getDetail(item)">{{ item.fileName }}</div>
        <div class="text-tip line-2" v-html="item.content"></div>
      </div>
    </div>
    <div v-if="tableData.currentPage< tableData.pageCount" class="text-href pl-nm" @click="changePage()">{{ $t('page.viewmore') }}</div>
    <NoData v-if="!loadingShow && !list.length" />
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
  props: {
    upwardNameList: Array
  },
  data() {
    return {
      loadingShow: true,
      tableData: {},
      list: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getDocumentList(currentPage) {
      let data = {
        currentPage: currentPage || 1,
        upwardNameList: this.upwardNameList
      };
      this.loadingShow = true;
      this.$api.documentonline.getDocumentList(data).then(res => {
        if (res.Status === 'OK') {
          this.tableData = res.Return || {};
          if (this.tableData.tbodyList && this.tableData.tbodyList.length > 0) {
            this.list.push(...this.tableData.tbodyList);
          }
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    changePage() {
      let currentPage = this.tableData.currentPage + 1;
      this.getDocumentList(currentPage);
    },
    getDetail(item) {
      this.$emit('getDetail', item);
    }
  },
  filter: {},
  computed: {},
  watch: {
    upwardNameList: {
      handler(val) {
        if (!this.$utils.isEmpty(val)) {
          this.list = [];
          this.getDocumentList();
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.document-main {
  padding: 16px 0;
  .list {
    position: relative;
    display: flex;
    margin-bottom: 16px;
    padding: 16px;
    border-radius: 6px;
    .item {
      flex: 1;
      overflow: hidden;
    }
  }
}
</style>
