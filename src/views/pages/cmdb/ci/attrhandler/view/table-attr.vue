<template>
  <div>
    <!--<div v-if="attrEntity.valueList.length > 0"><b class="text-primary" style="margin:0px 3px">{{ attrEntity.valueList.length }}</b>条数据 <i class="ts-tablechart" style="cursor:pointer" @click="showTableData"></i></div>-->
    <div v-if="valueList.length > 0" class="clearfix">
      <span
        v-for="(value, index) in valueList"
        :key="index"
        class="mr-md"
        @click="showMoreAttrEntity"
      >
        <span v-if="!ciEntity||!ciEntity.maxAttrEntityCount||ciEntity.maxAttrEntityCount > index" class="text-href">{{ value.name }}</span>
        <span v-else class="text-href tsfont-option-horizontal"></span>
      </span>
    </div>
    <TsDialog
      v-if="isShow"
      :is-show="isShow"
      v-bind="dialogConfig"
      @on-close="close"
    >
      <template v-slot>
        <div>
          <TsTable
            v-if="tableData"
            v-bind="tableData"
            :fixedHeader="false"
            @changeCurrent="changePage"
            @changePageSize="changePageSize"
          >
            <template v-for="(head, index) in tableData.theadList" :slot="head.key" slot-scope="{ row }">
              <div v-if="head.key.indexOf('attr_') == 0 && row.attrEntityData" :key="index">
                <div v-if="row.attrEntityData[head.key]">
                  <AttrViewer :handler="row.attrEntityData[head.key].type" :ciEntity="row" :attrEntity="row.attrEntityData[head.key]"></AttrViewer>
                </div>
              </div>
              <div v-else-if="row.relEntityData[head.key] && row.relEntityData[head.key]['valueList']" :key="index">
                <a
                  v-for="(relentity,rindex) in row.relEntityData[head.key]['valueList']"
                  :key="rindex"
                  class="modal-tag href"
                  href="javascript:void(0)"
                  @click="toCiEntity(relentity.ciEntityId, relentity.ciId)"
                >
                  <span>{{ relentity.ciEntityName }}</span>
                </a>
              </div>
            </template>
          </TsTable>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: 'TableAttr',
  components: {
    TsTable: resolve =>
      require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    AttrViewer: resolve =>
      require(['../../../cientity/attr-viewer.vue'], resolve)
  },
  props: {
    mode: {type: String, default: 'list'},
    ciEntity: {type: Object},
    attrEntity: {type: Object}
  },
  data() {
    return {
      isShow: false,
      dialogConfig: {
        type: 'modal',
        maskClose: true,
        isShow: false,
        title: '数据明细',
        width: 'medium',
        hasFooter: false
      },
      tableData: {},
      searchParam: {
        ciId: this.attrEntity.targetCiId,
        attrId: this.attrEntity.attrId
      }
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
  methods: {
    toCiEntity(id, ciId) {
      if (!ciId) {
        ciId = this.ciId;
      }
      this.$router.push({ path: '/ci/' + ciId + '/cientity-view/' + id });
    },
    showTableData() {
      this.isShow = true;
    },
    showMoreAttrEntity() {
      //表单来的数据没有targetCiId,以后再补充
      if (this.searchParam.ciId) {
        this.isShow = true;
        this.searchCiEntity();
      }
    },
    searchCiEntity(currentPage) {
      if (this.ciEntity) { // 查看配置项时会有ciEntity参数，这时候用fromCiEntityId来查询所有引用属性
        this.searchParam.fromCiEntityId = this.ciEntity.id;
      } else { //看历史时则需要使用idList参数，精确查询需要的引用属性
        this.searchParam.idList = this.attrEntity.valueList;
      }
      this.searchParam.currentPage = currentPage || 1;
      this.searchParam.showAttrRelList = [];
      if (this.attrEntity?.config?.attrList) {
        this.attrEntity.config.attrList.forEach(element => {
          if (element.isSelected) {
            this.searchParam.showAttrRelList.push('attr_' + element.id);
          }
        });
      }
      this.$api.cmdb.cientity.searchCiEntity(this.searchParam).then(res => {
        this.tableData = res.Return;
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
    theadList: function() {
      let theadList = [];
      this.attrEntity.config.attrList.forEach(head => {
        if (head.isSelected) {
          theadList.push({key: 'attr_' + head.id, title: head.label});
        }
      });
      return theadList;
    },
    valueList() {
      const list = [];
      if (this.attrEntity.actualValueList && this.attrEntity.actualValueList.length > 0) {
        this.attrEntity.actualValueList.forEach(a => {
          if (a != null) {
            list.push(a);
          }
        });
      } else if (this.attrEntity.valueList && this.attrEntity.valueList.length > 0) {
        //兼容表单控件数据回显，表单数据没有actualValueList
        this.attrEntity.valueList.forEach(a => {
          if (a != null && typeof a == 'object') {
            list.push(a);
          }
        });
      }
      return list;
    }
  },
  watch: {
  }
};
</script>
<style lang="less" scoped>

</style>
