<template>
  <div class="menu_link">
    <div v-if="reportList && reportList.length>0">
      <div class="title text-grey">{{ $t('term.report.report') }}</div>
      <ul>
        <li v-for="(report, index) in reportList" :key="index" :class="$route.fullPath.indexOf(report.id)>-1 ? 'active link' : 'link'">
          <!--<router-link :to="'/reportinstance-show/'+report.id" class="ts-report">{{ report.name }}</router-link>-->
          <a class="cursor tsfont-report" @click="goTo('/reportinstance-show/'+report.id)">{{ report.name }}</a>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import LeftMenu from '@/views/components/leftmenu/leftmenu';

export default {
  name: '',
  components: {
  },
  extends: LeftMenu,
  props: {
  },
  data() {
    return {
      isSlider: true,
      reportList: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getReportList();
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
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
