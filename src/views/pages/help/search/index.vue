<template>
  <div class="search-main">
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
          <span class="pl-xs">模块名称</span>
        </div>
        <div v-for="(c,cindex) in item.list" :key="cindex" class="tsfont-dot text-title overflow pb-nm pl-sm">cs</div>
        <div class="text-href pl-sm">查看更多</div>
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
      moduleList: [
        {
          name: 'ooo',
          list: [
            {
              name: 'sss'
            }
          ]
        },
        {
          name: 'ooo',
          list: [
            {
              name: 'sss'
            },
            {
              name: 'sss'
            }
          ]
        },
        {
          name: 'ooo',
          list: [
            {
              name: 'sss'
            }
          ]
        },
        {
          name: 'ooo',
          list: [
            {
              name: 'sss'
            },
            {
              name: 'sss'
            }
          ]
        }
      ],
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
    searchDocument() {

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
