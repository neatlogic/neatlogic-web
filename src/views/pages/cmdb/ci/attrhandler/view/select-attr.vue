<template>
  <div>
    <div v-if="valueList.length > 0" class="clearfix">
      <Tag v-for="(value, index) in valueList" :key="index" @click.native="toCiEntity(value.value)">
        {{ (value.text && typeof value.text === 'object' && value.text.text) ? value.text.text : value.text }}
      </Tag>
      <a
        v-if="hasMore"
        href="javascript:void(0)"
        @click="showMoreAttrEntity"
      ><i class="tsfont-option-horizontal text-href"></i>
      </a>
    </div>
    <TsDialog
      v-if="isShow"
      :is-show="isShow"
      v-bind="dialogConfig"
      @on-close="close"
    >
      <template v-slot:header>
        <div>数据明细</div>
      </template>
      <template v-slot>
        <div>
          <TsTable
            v-if="tableData"
            v-bind="tableData"
            :fixedHeader="false"
            @changeCurrent="changePage"
            @changePageSize="changePageSize"
          >
            <template v-slot:name="{ row }">
              <a href="javascript:void(0)" @click="toCiEntity(row.id)">{{ row.name }}</a>
            </template>
          </TsTable>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  directives: {},
  components: { TsTable: resolve =>
    require(['@/resources/components/TsTable/TsTable.vue'], resolve) },
  props: {
    mode: { type: String, default: 'list' },
    ciEntity: {type: Object},
    attrEntity: { type: Object }
  },
  data() {
    return {
      isShow: false,
      hasMore: false,
      dialogConfig: {
        type: 'modal',
        maskClose: true,
        isShow: false,
        width: 'small',
        hasFooter: false
      },
      tableData: {},
      theadList: [{key: 'name', title: this.attrEntity.label}],
      searchParam: {
        ciId: this.attrEntity.targetCiId,
        attrId: this.attrEntity.attrId,
        fromCiEntityId: this.ciEntity && this.ciEntity.id}
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
    toCiEntity(targetCiEntityId) {
      this.$router.push({ path: '/ci/' + this.attrEntity.targetCiId + '/cientity-view/' + targetCiEntityId });
    },
    showMoreAttrEntity() {
      this.isShow = true;
      this.searchCiEntity();
    },
    searchCiEntity(currentPage) {
      this.searchParam.currentPage = currentPage || 1;
      this.$api.cmdb.cientity.searchCiEntity(this.searchParam).then(res => {
        this.tableData = res.Return;
        this.tableData.theadList = this.theadList;
      });
    },
    changePage(currentPage) {
      this.searchCiEntity(currentPage);
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchCiEntity();
    },
    close() {
      this.isShow = false;
    }
  },
  filter: {},
  computed: {
    valueList() {
      const list = [];
      if (this.attrEntity.valueList && this.attrEntity.valueList.length > 0 && this.attrEntity.actualValueList && this.attrEntity.valueList.length === this.attrEntity.actualValueList.length) {
        this.attrEntity.actualValueList.forEach((a, index) => {
          if (a != null) {
            if (this.ciEntity && this.ciEntity.maxAttrEntityCount) {
              if (index < this.ciEntity.maxAttrEntityCount) {
                list.push({value: this.attrEntity.valueList[index], text: a});
              } else {
                this.hasMore = true;
              }
            } else {
              list.push({value: this.attrEntity.valueList[index], text: a});
            }
          }
        });
      }
      return list;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped></style>
