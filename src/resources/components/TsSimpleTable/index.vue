<template>
  <div>
    <div class="tstable-container border bg-grey radius-lg">
      <div>
        <table class="tstable-body">
          <thead>
            <tr>
              <th v-for="(col) in theadList" :key="col.key">
                {{ col.title }}
              </th>
            </tr>
          </thead>
          <tbody class="tbody-main">
            <tr
              v-for="(row, rowIndex) in tbodyList"
              :key="row.uuid"
            >
             
              <td v-for="(col) in theadList" :key="row.uuid + '_' + col.key">
                <slot
                  :name="col.key"
                  :row="row"
                  :index="rowIndex"
                >
                  {{ row[col.key] }}
                </slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-if="rowNum > defaultShowSize && pageSize > 0" class="tstable-page text-right">
      <Page
        size="small"
        :showSizer="true"
        :showTotal="true"
        :total="rowNum"
        :current="currentPage"
        :page-size="pageSize"
        :page-size-opts="pageSizeOpts"
        :transfer="true"
        @on-change="changeCurrent"
        @on-page-size-change="changePageSize"
      />
    </div>
  </div>
</template>
<script>
export default {
  name: 'TsSimpleTable',
  components: {},
  props: {
    rowNum: [Number, String], //总个数
    currentPage: { type: Number }, //当前第几页
    pageSize: {
      type: Number,
      default: 20
    }, //每一页多少
    pageSizeOpts: {
      //每页条数切换的配置
      type: Array,
      default: () => [10, 20, 30, 40, 60, 80, 100]
    },
    defaultShowSize: {
      // 控制是否显示分页，默认总条数小于10条数据不显示
      type: Number,
      default: 10
    },
    theadList: { type: Array }, //表头数据
    tbodyList: {
      type: Array,
      default: function() {
        return [];
      }
    }
  },
  data() {
    return {
      current: 1
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
    changeCurrent(page) {
      this.current = page;
      this.$emit('changeCurrent', this.current);
    },
    changePageSize(size) {
      this.$emit('changePageSize', size);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
::v-deep .tstable-container, .table-container {
  overflow-x: scroll;
  width: 100%;
}
</style>
