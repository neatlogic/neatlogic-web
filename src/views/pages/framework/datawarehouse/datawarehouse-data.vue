<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <div>
          <div class="mb-md border">
            <TsRow class="search-item">
              <Col span="12" class="condition-item">
                <div class="condition-title text-title"><span>{{ $t('term.framework.isexpire') }}</span></div>
                <div class="condition-content">
                  <TsFormRadio
                    v-model="searchParam.isExpired"
                    :dataList="[
                      { value: 1, text: $t('term.framework.expired') },
                      { value: 0, text: $t('term.framework.notexpired') }
                    ]"
                    @change="
                      val => {
                        searchData();
                      }
                    "
                  ></TsFormRadio>
                </div>
              </Col>
              <Col
                v-for="(condition, index) in conditionList"
                :key="index"
                span="12"
                class="condition-item"
              >
                <div class="condition-title text-title">
                  <span>{{ condition.label }}</span>
                </div>
                <div class="condition-content">
                  <ConditionHandler :handler="condition.inputType" :config="condition.config" @change="(val)=>{changeCondition(condition,val);}"></ConditionHandler>
                </div>
              </Col>
            </TsRow>
          </div>
          <TsTable
            :fixedHeader="false"
            v-bind="dataSourceData"
            @changeCurrent="updatePage"
            @changePageSize="updatePagesize"
          ></TsTable>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    ConditionHandler: () => import('./condition-handler.vue')
  },
  props: {
    id: { type: Number }
  },
  data() {
    const _this = this;
    return {
      searchParam: { dataSourceId: this.id, isExpired: 0 },
      dialogConfig: {
        type: 'modal',
        maskClose: true,
        isShow: true,
        title: this.$t('page.detail'),
        width: 'large',
        hasFooter: false
      },
      conditionList: [],
      dataSourceData: {}
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getConditionFieldList();
    this.searchData();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    updatePage(page) {
      this.searchData(page);
    },
    updatePagesize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchData();
    },
    searchData(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      } else {
        this.searchParam.currentPage = 1;
      }
      if (this.conditionList && this.conditionList.length > 0) {
        const activeContionList = this.conditionList.filter(d => d.value);
        this.searchParam.conditionList = activeContionList;
      }
      this.$api.framework.datawarehouse.searchData(this.searchParam).then(res => {
        this.dataSourceData = res.Return;
      });
    },
    changeCondition(condition, val) {
      this.$set(condition, 'value', val);
      this.searchData();
    },
    getConditionFieldList() {
      if (this.id) {
        this.$api.framework.datawarehouse.getDataSourceConditionField(this.id).then(res => {
          this.conditionList = res.Return;
        });
      }
    },
    close: function() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.condition-item {
  display: grid;
  height: 40px;
  grid-gap: 10px;
  line-height: 38px;
  grid-template-columns: 120px auto;
  .condition-title {
    text-align: left;
    padding: 3px;
  }
  .condition-content {
    padding: 3px;
  }
  .attr-content .content {
    word-break: break-all;
  }
}
</style>
