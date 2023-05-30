<template>
  <TsDialog v-bind="issueTsDialog" :isShow="isShow" @on-close="close">
    <TsTable v-bind="tabledata" :tbodyList="issueList">

    </TsTable>
  </TsDialog>
</template>
<script>
export default {
  name: 'IssueList',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve)
  },
  filters: {},
  props: {
    config: Object,
    isShow: Boolean
  },
  data() {
    return {
      issueTsDialog: {
        title: '提交列表',
        hasFooter: false,
        height: '400px'
      },
      tabledata: {
        theadList: []
      },
      issueList: []
      
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
    close() {
      this.$emit('close');
    },
    getList(config) {
      this.$api.codehub.issue.getIssueversion(config).then((res) => {
        //console.log(res);
      });
    }
  },
  computed: {},
  watch: {
    config: {
      handler: function(val) {
        this.getList(val);
      },
      immediate: true,
      deep: true
    }
  }

};

</script>
<style lang='less' scoped>

</style>
