<template>
  <div>
    <TsContain hideHeader :siderWidth="168" :hasContentPadding="false">
      <template slot="sider">
        <ciTypeList :ciId="ciId" @click="getTemplate"></ciTypeList>
      </template>
      <template slot="content" class="content flex-start">
        <Loading :loadingShow="isLoading" type="fix"></Loading>
        <TsTable
          class="table"
          :theadList="theadList"
          :tbodyList="tbodyList"
          noDataText="请点击左边树形菜单下载对应模型的导入模板"
          multiple
          @getSelected="getSelected"
        >
          <template v-slot:isRequired="{row}">
            <span v-if="row.isRequired" class="text-success">是</span>
            <span v-else class="text-grey">否</span>
          </template>
        </TsTable>
      </template>
    </TsContain>
  </div>
</template>

<script>
export default {
  name: 'ImportTemplate',
  components: {
    ciTypeList: resolve => require(['../components/ci/ci-type-list.vue'], resolve),
    TsTable: resolve => require(['components/TsTable/TsTable'], resolve)
  },
  data() {
    return {
      isLoading: false,
      ciId: null,
      theadList: [
        {title: '', key: 'selection'},
        {title: '唯一标识', key: 'name'},
        {title: '字段名称', key: 'label'},
        {title: '类型', key: 'typeText'},
        {title: '必填？', key: 'isRequired'}
      ],
      tbodyList: [] 
    };
  },
  created() {
  },
  methods: {
    async getTemplate(ciType, ci) {
      this.ciId = ci.id;
      this.isLoading = true;
      const res = await this.$api.cmdb.batchImport.getImportFieldList(ci.id);
      this.isLoading = false;
      const {attrList, relList} = res.Return;
      const attrTbodyList = attrList.map(attr => {
        const {id, name, label, type, typeText, isRequired} = attr;
        return {id, name, label, type, typeText, isRequired, rowType: 'attr'};
      });
      const relTbodyList = relList.map(rel => {
        if (rel.direction === 'from') {
          const {id, toName: name, toLabel: label, toRule: rule, toIsRequired: isRequired } = rel;
          return {id, name, label, typeText: '关系', isRequired, rowType: 'rel'};
        } else if (rel.direction === 'to') {
          const {id, toName: name, fromLabel: label, fromRule: rule, fromIsRequired: isRequired} = rel;
          return {id, name, label, typeText: '关系', isRequired, rowType: 'rel'};
        }
      });
      this.tbodyList = [...attrTbodyList, ...relTbodyList];
      this.$emit('on-template-change', this.ciId, []);
    },
    getSelected(indexList, itemList) {
      this.$emit('on-template-change', this.ciId, itemList);
    },
    renderTreeNode(h, { root, node, data }) {
      if (data.nodeType === 'ciType') {
        return h('span', {class: ['text-disabled']}, data.title);
      }
      return h('span', {class: [data.icon, 'tree-node-title', 'text-action', {'text-primary': data.selected}]}, data.title);
    }
  }
};
</script>

<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.batch-import-template {
  // padding-right: 16px;
  /deep/.ivu-layout-content{
    padding-left: 32px;
    padding-top: 11px;
  }
  /deep/.tscontain-body{
    padding-left: 0!important;
    padding-right: 0!important;
    .tscontain-sider{
      margin-left: 0px!important;
    }
  }
  .padt16{
    padding-top:10px;
  }
  // /deep/.radius-lg{
  //   margin-top: 16px;
  // }
  /deep/ .tree {
    padding-left: 10px;
    .ivu-tree-arrow {
      transform: translateY(-2px);
    }
    .tree-node-title::before {
      padding-right: 4px;
    }
  }
}
</style>
