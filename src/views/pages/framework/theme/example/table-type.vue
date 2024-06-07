<template>
  <div class="padding" :class="type">
    <TsTable
      v-bind="tableConfig"
      :theadList="theadList"
    >
    </TsTable>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  props: {item: Object, type: String, list: Array},
  data() {
    return {
      tableConfig: {
        rowNum: 0,
        pageSize: 20,
        currentPage: 1,
        tbodyList: [
          {name: 'test', url: 'NANSHAN', referenceCount: 100},
          {name: 'test1', url: 'LUOHU', referenceCount: 200},
          {name: 'test2', url: 'FUTIAN', referenceCount: 10},
          {name: 'test3', url: 'BAOAN', referenceCount: 0},
          {name: 'test4', url: 'LONGGANG', referenceCount: 60}
        ]
      },
      theadList: [
        {
          key: 'name',
          title: this.$t('page.name'),
          type: 'linktext',
          textValue: 'views'
        },
        {
          key: 'url',
          title: this.$t('page.address')
        },
        {
          key: 'referenceCount',
          title: this.$t('page.count')
        }
      ],
      tableList: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.list.forEach(v => {
      if (v.titleType === 'table' && v.value) {
        this.tableList.push(v);
      }
    });
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init() {
      if (this.type === 'light') {
        this.setProperty(this.tableList);
      } else {
        this.darkSetProperty(this.tableList);
      }
    },
    setProperty(list) {
      list.forEach(v => {
        if (v.param === '--th-bg-color') {
          document.body.style.setProperty('--light-thbg-color', v.value);
        }
        if (v.param === '--table-hover-color') {
          document.body.style.setProperty('--light-tableHover', v.value);
        }

        if (v.param === '--primary-grey') {
          document.body.style.setProperty('--light-primaryGrey', v.value);
        }
      });
    },
    darkSetProperty(list) {
      list.forEach(v => {
        if (v.param === '--th-bg-color') {
          document.body.style.setProperty('--dark-thbg-color', v.value);
        }
        if (v.param === '--table-hover-color') {
          document.body.style.setProperty('--dark-tableHover', v.value);
        }

        if (v.param === '--primary-grey') {
          document.body.style.setProperty('--dark-primaryGrey', v.value);
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {
    'item.value': {
      handler(val) {
        this.init();
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.dark{
  .bg-table{
    background:var(--dark-tableHover, #ECEDF0) !important;
  }
  /deep/.tstable-body{
    thead, th{
      background:var(--dark-thbg-color, #151824) !important;
    }
    tbody > tr.selected{
      background: var(--dark-primaryGrey, #E7F0FF) !important;
    }
    tbody > tr:hover, .tstable-tr:hover{
      background:var(--dark-tableHover, #ECEDF0) !important;
    }
    &.selected{
      background: var(--dark-primaryGrey, #E7F0FF) !important;
      .action-bg {
        background: var(--dark-primaryGrey, #E7F0FF) !important;
      }
      .tstable-action {
        .tstable-action-ul {
          background: var(--dark-primaryGrey, #E7F0FF) !important;
          .mask{
            background: var(--dark-primaryGrey, #E7F0FF) !important;
          }
        }
      }
    }
  }

}
.light{
  .bg-table{
    background:var(--light-tableHover, #EFF0F3) !important;
  }
  .bg-table-header{
    background-color:var(--light-thbg-color, #EFF0F3) !important;
  }
  /deep/.tstable-body{
    thead, th{
      background:var(--light-thbg-color, #EFF0F3) !important;
    }
    tbody > tr.selected{
      background: var(--light-primaryGrey, #E7F0FF) !important;
    }
    tbody > tr:hover, .tstable-tr:hover{
      background:var(--light-tableHover, #EFF0F3) !important;
    }
    &.selected{
        background: var(--light-primaryGrey, #E7F0FF) !important;
        .action-bg {
          background: var(--light-primaryGrey, #E7F0FF) !important;
        }
        .tstable-action {
          .tstable-action-ul {
            background: var(--light-primaryGrey, #E7F0FF) !important;
            .mask{
              background: var(--light-primaryGrey, #E7F0FF) !important;
            }
          }
        }
      }
    >tr {
      &:hover ,&.selected:hover{
        background:var(--light-tableHover, #EFF0F3) !important;
      }
    }
  }
}
</style>
