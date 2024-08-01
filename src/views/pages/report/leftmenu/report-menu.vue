<template>
  <div class="menu_link">
    <div v-if="reportList && reportList.length > 0">
      <div class="title text-grey">{{ $t('term.report.report') }}</div>
      <ul>
        <li v-for="(report, index) in reportList" :key="index" :class="$route.fullPath.indexOf(report.id) > -1 ? 'active link' : 'link'">
          <a class="cursor tsfont-report" @click="goTo('/reportinstance-show/' + report.id)">{{ report.name }}</a>
        </li>
      </ul>
    </div>
    <div v-if="statementData && statementData.tbodyList && statementData.tbodyList.length > 0">
      <div class="title text-grey">{{ $t('term.report.screen') }}</div>
      <div :class="{ grid: statementData.pageCount > 1 }">
        <div class="overflow">
          <ul>
            <li v-for="(statement, index) in statementData.tbodyList" :key="index" :class="$route.fullPath.indexOf(statement.id) > -1 ? 'active link' : 'link'">
              <a class="cursor tsfont-report" @click="goTo('/statement-view/' + statement.id)">{{ statement.name }}</a>
            </li>
          </ul>
        </div>
        <div v-if="statementData.pageCount > 1">
          <VerticalPager
            :currentPage="statementData.currentPage"
            :pageCount="statementData.pageCount"
            @change="
              page => {
                searchStatement(page);
              }
            "
          ></VerticalPager>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import LeftMenu from '@/views/components/leftmenu/leftmenu';
export default {
  name: '',
  components: {
    VerticalPager: () => import('@/resources/plugins/VerticalPager/vertical-pager.vue')
  },
  extends: LeftMenu,
  props: {},
  data() {
    return {
      reportList: [],
      searchParam: { pageSize: 10, isActive: 1 },
      statementData: {}
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getReportList();
    this.searchStatement();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getReportList() {
      this.$api.report.report.getReportInstanceMenu().then(res => {
        if (res.Status == 'OK') {
          this.reportList = res.Return || [];
        }
      });
    },
    searchStatement(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      } else {
        this.searchParam.currentPage = 1;
      }
      this.$api.report.statement.searchStatement(this.searchParam).then(res => {
        this.statementData = res.Return;
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: auto 23px;
}
</style>
