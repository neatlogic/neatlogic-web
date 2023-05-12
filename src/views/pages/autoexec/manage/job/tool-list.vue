<template>
  <div class="tool-list">
    <TsCard
      v-if="!showLoading"
      v-bind="dataConfig"
      :sm="12"
      :lg="8"
      :xl="6"
      :xxl="4"
      classname="overvivew-main"
      @updatePage="getData"
    >
      <template slot-scope="{ row }">
        <div class="title" @click="gotoJobList(row)"> 
          <span class="number h3">{{ row.referenceCount }}</span>
          <span class="title-name overflow" :title="row.name"> {{ row.name }}</span>
          <span class="text-tip overflow" :title="row.uk">{{ row.uk }}</span> 
        </div>
      </template>
    </TsCard>
    <Loading :loadingShow="showLoading" style="padding-top:50px;"></Loading>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsCard: resolve => require(['@/resources/components/TsCard/TsCard'], resolve)
  },
  filters: {},
  props: {
    params: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    let _this = this;
    return {
      showLoading: true,
      dataConfig: {
        cardList: []
      }
    };
  },
  beforeCreate() {},
  created() {
  },
  beforeMount() {},
  mounted() {
    this.getData(1);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getData(currentPage, pageSize) { //获取表格数据
      let params = Object.assign(this.params);
      params.currentPage = currentPage || this.dataConfig.currentPage;
      params.pageSize = pageSize || this.dataConfig.pageSize;
      this.showLoading = true;
      this.$api.autoexec.job.searchJobByCombop(params).then(res => {
        if (res.Status == 'OK') {
          this.dataConfig = res.Return;
          this.dataConfig.cardList = res.Return.tbodyList;
          delete this.dataConfig.tbodyList;
        }
      }).finally(() => {
        this.showLoading = false;
      });
    },
    gotoJobList(row) {
      this.$router.push({
        path: '/job-overview',
        query: {
          combopName: row.name
        }
      });
    }
  },
  computed: {},
  watch: {
    params: {
      handler(newValue, oldValue) {
        this.getData(1);
      },
      deep: true
    }
  }
};
</script>
<style lang='less' scoped>
.tool-list{
  .title{
    padding: 12px 20px;
    min-height: 62px;
    padding-left: 50px;
    position: relative;
    cursor: pointer;
    >span{
      display: block;
    }
    >.number{
      position: absolute;
      left: 0px;
      width: 40px;
      text-align: center;
    }
   
  }
}
</style>
