<template>
  <section
    :data_id="uuid"
    type="formtable"
    class="table-color"
    v-html="content"
  >
  </section>
</template>
<script>
export default {
  name: '',
  components: {},
  filters: {},
  props: {
    uuid: String,
    handler: String,
    content: String,
    config: Object
  },
  data() {
    return {
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {},
  computed: {},
  watch: {
    config: {
      handler(val) {
      },
      immediate: true,
      deep: true
    }
  }
};

</script>
<style lang="less" scoped>
@import '~@/resources/plugins/TsCkeditor/ckeditor.less';
section {
  position: relative;
}
/deep/.sheet-table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0px;
  table-layout: fixed;
  outline: none;
  thead {
    height: 0;
  }
  tbody {
    tr {
      td {
        border:1px solid;
        vertical-align: middle;
        padding: 3px;
        height: 40px;
        position: relative;
        word-break: break-all;
        &.text-right {
          padding-right: 12px;
        }
      }
    }
  }
  
}
.tstable-container .tstable-body tbody tr:hover {
    background: transparent !important;
}

.table-color{
   //静态列表样式
  /deep/ 
      .tstable-container {
        overflow: auto;
        border-top: 0px !important;
        .table-list {
          width:100%;
          border-top: none;
          border-collapse: collapse;
          table-layout: fixed;
        }
        .table-list > thead,
        .table-list > thead > tr > th {
          visibility: visible !important;
          border: none !important;
          vertical-align: middle;
          height: 38px;
          padding-top: 0px;
          padding-bottom: 0px;
          text-align: left;
        }
        .table-list > tbody > tr > td {
          border-left: none !important;
          border-right: none !important;
          border-bottom: none !important;
          border-top: none !important;
          vertical-align: top;
        }
      }

}
   
</style>
