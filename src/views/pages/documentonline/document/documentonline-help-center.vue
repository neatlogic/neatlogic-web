<template>
  <div class="search-main">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <div class="text-center top text-tip">{{ $t('term.documentonline.whathelp') }}</div>
    <div class="text-center">
      <InputSearcher
        v-model="keyword"
        :placeholder="$t('term.documentonline.problemdes')"
        width="70%"
        @change="searchDocument"
      ></InputSearcher>
    </div>
    <div v-if="moduleList && moduleList.length>0" class="module-main">
      <div v-for="(item,index) in moduleList" :key="index" class="module-list pr-nm">
        <div class="tsfont-zhishiku pb-lg name">
          <span class="pl-xs">{{ item.firstLevelDirectory }}</span>
        </div>
        <div
          v-for="(td,tindex) in item.tbodyList"
          :key="tindex"
          class="text-tip-active tsfont-dot text-title overflow pb-nm pl-xs"
          @click="gotoPage(td)"
        >{{ td.fileName }}</div>
        <div v-if="item.currentPage < item.pageCount" class="text-href pl-xs" @click="gotoPage(item)">{{ $t('page.viewmore') }}</div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve)

  },
  props: {},
  data() {
    return {
      loadingShow: true,
      pageSize: 5,
      moduleList: [],
      keyword: ''
    };
  },
  beforeCreate() {},
  created() {
    this.getDocumentTableList();
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
    getDocumentTableList() {
      this.$api.documentonline.getDocumentTableList({pageSize: this.pageSize}).then(res => {
        if (res.Status === 'OK') {
          this.moduleList = res.Return.tableList || [];
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    gotoPage(item) {
      if (item.firstLevelDirectory) {
        this.$router.push({
          path: '/documentonline-detail',
          query: {
            upwardNameList: item.firstLevelDirectory,
            isSiderHide: false
          }
        });
      } else {
        this.$router.push({
          path: '/documentonline-detail',
          query: {
            filePath: item.filePath
          }
        });
      }
    },
    searchDocument(val) {
      if (val) {
        this.$router.push({
          path: '/documentonline-search',
          query: {
            searchKeyword: val
          }
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
.search-main{
  padding: 0 16px 1px;
  .top {
    font-size: 30px;
    font-weight: bold;
    padding-top: 50px;
    padding-bottom: 30px;
  }
  .module-main {
    width: 100%;
    margin: 45px auto;
    display: grid;
    grid-template-columns: repeat(3, 33.33%);
    row-gap: 32px;
    .module-list {
      .name {
        font-size: 14px;
      }
    }
  }
   
}
</style>
