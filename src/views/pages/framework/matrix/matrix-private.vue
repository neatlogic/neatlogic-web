<template>
  <div>
    <TsContain>
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <navTopLeft :matrixUuid="matrixUuid" readonly></navTopLeft>
      </template>
      <template v-slot:topRight>
        <div>
          <ReferenceSelect
            :uuid="matrixUuid"
            :isIcon="true"
            :isMargin="true"
            calleeType="matrix"
            :referenceCount="tableData.referenceCount"
          ></ReferenceSelect>
        </div>
      </template>
      <template v-slot:content>
        <div>
          <Loading :loading-show="loadingShow" type="fix"></Loading>
          <TsTable
            v-if="!loadingShow"
            v-bind="tableData"
            @changeCurrent="searchMatrixView"
            @changePageSize="changePageSize"
          >
            <template v-for="(item) in tableData.theadList" :slot="item.key" slot-scope="{row}">
              {{ row[item.key] && row[item.key].text !==null && row[item.key].text !==undefined ? row[item.key].text :row[item.key] }}
            </template>
          </TsTable>
        </div>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    navTopLeft: () => import('./components/navTopLeft'),
    TsTable: () => import('@/resources/components/TsTable/TsTable'),
    ReferenceSelect: () => import('@/resources/components/ReferenceSelect/ReferenceSelect.vue')
  },
  props: {},
  data() {
    return {
      loadingShow: true,
      tableData: { referenceCount: 0 },
      matrixUuid: '', //矩阵uuid
      matrixName: '', //矩阵名
      matrixType: '', //矩阵获取数据类型
      searchParam: {}
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.query.name) {
      this.matrixName = this.$route.query.name;
    }
    this.matrixUuid = this.$route.query.uuid || null;
    this.matrixType = this.$route.query.type || null;
    this.searchMatrixView();
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
    //获取表格数据
    searchMatrixView(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      if (this.matrixUuid) {
        let params = { ...this.searchParam, matrixUuid: this.matrixUuid };
        this.$api.framework.matrix
          .getExternalData(params)
          .then(res => {
            if (res.Status == 'OK') {
              this.tableData = res.Return;
            }
          }).finally(() => {
            this.loadingShow = false;
          });
      }
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchMatrixView(1);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
