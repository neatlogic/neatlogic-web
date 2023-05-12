<template>
  <div v-if="dataList && dataList.length > 0">
    <div v-for="(item, index) in dataList" :key="index" class="pb-sm">
      <Tooltip
        placement="left-end"
        max-width="300"
        transfer
        style="width: 100%;"
      >
        <div class="overflow" style="width: 100%;" v-html="item.text"></div>
        <div slot="content" v-html="item.path"></div>
      </Tooltip>
    </div>
    <div v-if="currentPage < pageCount">
      <a href="javascript:void(0);" @click="getDataList(currentPage + 1)"><span class="text-tip">{{ $t('page.viewmore') }}</span></a>
    </div>
  </div>
</template>
<script>

export default {
  name: 'ReferenceList',
  components: {

  },
  directives: {},
  filters: {},
  props: {
    id: {
      type: Number,
      default: null
    },
    uuid: {
      type: String,
      default: null
    },
    calleeType: {
      type: String,
      default: null
    },
    pageSize: {
      type: Number,
      default: 10
    }
  },
  data() {
    return {
      dataList: [],
      currentPage: 1,
      pageCount: 0
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getDataList(1);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivaed() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getDataList(currentPage) {
      this.currentPage = currentPage;
      let params = {
        pageSize: this.pageSize,
        calleeType: this.calleeType,
        currentPage: currentPage
      };
      if (this.uuid) {
        this.$set(params, 'uuid', this.uuid);
      }
      if (this.id) {
        this.$set(params, 'id', this.id);
      }
      this.$https.post('/api/rest/dependency/list', params).then(res => {
        if (res.Status == 'OK') {
          this.pageCount = res.Return.pageCount;
          this.isReference = true;
          let newList = res.Return.list;
          if (currentPage > 1) {
            this.dataList.push(...newList);
          } else {
            this.dataList = newList;
          }
        }
      });
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang='less' scoped>

</style>
