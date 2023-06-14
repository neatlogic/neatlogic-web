<template>
  <div class="search-main">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <div class="text-center top text-tip">请问有什么能帮到您？</div>
    <div class="text-center">
      <InputSearcher
        v-model="keyword"
        placeholder="问题描述"
        :width="600"
        @change="searchDocument"
      ></InputSearcher>
    </div>
    <div v-if="moduleList && moduleList.length>0" class="module-main">
      <div v-for="(item,index) in moduleList" :key="index" class="module-list">
        <div class="tsfont-zhishiku pb-nm name">
          <span class="pl-xs">{{ item.firstLevelDirectory }}</span>
        </div>
        <div
          v-for="(td,tindex) in item.tbodyList"
          :key="tindex"
          class="text-tip-active tsfont-dot text-title overflow pb-nm pl-xs"
          @click="gotoPage(td)"
        >{{ td.fileName }}</div>
        <!-- v-if="item.currentPage < item.pageCount" -->
        <div class="text-href pl-xs" @click="gotoPage(item)">查看更多</div>
      </div>
    </div>
  </div>
</template>
<script>
import {documentonlineMutations} from '@/views/pages/documentonline/common/observableData.js';
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
      icon: {
        '配置': 'tsfont-peizhiguanli',
        '自动化': 'tsfont-zidonghua',
        '仪表盘': 'tsfont-chart-gauge',
        '巡检': 'tsfont-inspection',
        '系统配置': 'tsfont-xitongpeizhi',
        '知识库': 'tsfont-zhishiku',
        '报表': 'tsfont-baobiao'
      },
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
          console.log(res);
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    gotoPage(item) {
      if (item.isFile) {
        this.$router.push({
          path: '/documentonline-detail',
          query: {
            upwardNameList: item.upwardNameList.join('/'),
            filePath: item.filePath.join('/')
          }
        });
      } else {
        this.$router.push({
          path: '/documentonline-manage',
          query: {
            filePath: item.firstLevelDirectory
          }
        });
      }
    },
    searchDocument(val) {
      if (val) {
        documentonlineMutations.setGlobalSearchKeyword(val);
        this.$router.push({
          path: '/documentonline-search',
          query: {
            keyword: val
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
  .top {
    font-size: 30px;
    font-weight: bold;
    padding-top: 50px;
    padding-bottom: 30px;
  }
  .module-main {
    width: 900px;
    margin: 45px auto 0;
    display: grid;
    grid-template-columns: repeat(3,380px);
    grid-gap: 20px;
    margin-bottom: 30px;
    .module-list {
      .name {
        font-size: 14px;
      }
    }
  }
   
}
</style>
