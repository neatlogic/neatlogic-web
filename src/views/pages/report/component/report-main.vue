
<template>
  <div class="padding-md">
    <div ref="reportMain" v-html="content"></div>
  </div>
</template>
<script>
import '@/resources/assets/js/jquery-1.11.1.js';
export default {
  name: 'ReportMain',
  components: {},
  filters: {},
  props: {
    content: String
  },
  data() {
    return {};
  },
  beforeCreate() {},
  created() {
    window.REPORT_CHANGE_PAGE = (function(that) {
      return function(dataSource, currentPage) {
        that.changeReportContentPage(dataSource, currentPage);
      };
    })(this);
    window.REPORT_CHANGE_PAGESIZE = (function(that) {
      return function(dataSource, pageSize) {
        that.changeReportContentPageSize(dataSource, pageSize);
      };
    })(this);
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
    changeReportContentPage(rootName, currentPage) {
      this.$emit('changeReportContentPage', rootName, currentPage);
    },
    changeReportContentPageSize(rootName, pageSize) {
      this.$emit('changeReportContentPageSize', rootName, pageSize);
    },
    createElementScript(val) {
      if (val) {
        let regJs = ''; 
        val.replace(/<script.*?>([\s\S]+?)<\/script>/img, (_, js) => { // 正则匹配出script中的内容 
          regJs = js;
        });
        this.$nextTick(() => { 
          let script = document.createElement('script');
          script.innerHTML = regJs;
          this.$refs.reportMain.append(script);
        });
      } 
    }
  },
  computed: {},
  watch: {
    content: {
      handler(val) {
        this.createElementScript(val);
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
