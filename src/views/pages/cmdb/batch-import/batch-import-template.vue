<template>
  <div>
    <TsContain hideHeader :siderWidth="168" :hasContentPadding="false">
      <template slot="sider">
        <ciTypeList :ciId="ciId" @click="getTemplate"></ciTypeList>
      </template>
      <template slot="content">
        <Loading :loadingShow="isLoading" type="fix"></Loading>
        <TsTable
          class="table"
          :theadList="theadList"
          :tbodyList="tbodyList"
          :noDataText="$t('message.cmdb.downloadimporttemplate')"
          multiple
          @getSelected="getSelected"
        >
          <template v-slot:isRequired="{ row }">
            <span v-if="row.isRequired" class="text-success">{{ $t('page.yes') }}</span>
            <span v-else class="text-grey">{{ $t('page.no') }}</span>
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
        { title: '', key: 'selection' },
        { title: this.$t('page.uniquekey'), key: 'name' },
        { title: this.$t('term.cmdb.fieldname'), key: 'label' },
        { title: this.$t('page.type'), key: 'typeText' },
        { title: this.$t('page.require'), key: 'isRequired' }
      ],
      tbodyList: []
    };
  },
  created() {},
  methods: {
    async getTemplate(ciType, ci) {
      this.ciId = ci.id;
      this.isLoading = true;
      const res = await this.$api.cmdb.batchImport.getImportFieldList(ci.id);
      this.isLoading = false;
      const { attrList, relList, globalAttrList } = res.Return;
      const glbalTbodyList = globalAttrList.map(attr => {
        const { id, name, label } = attr;
        return { id, name, label, typeText: this.$t('term.cmdb.globalattr'), isRequired: 0, rowType: 'global' };
      });
      const attrTbodyList = attrList.map(attr => {
        const { id, name, label, type, typeText, isRequired } = attr;
        return { id, name, label, type, typeText, isRequired, rowType: 'attr' };
      });
      const relTbodyList = relList.map(rel => {
        if (rel.direction === 'from') {
          const { id, toName: name, toLabel: label, toRule: rule, toIsRequired: isRequired } = rel;
          return { id, name, label, typeText: this.$t('page.relation'), isRequired, rowType: 'rel' };
        } else if (rel.direction === 'to') {
          const { id, toName: name, fromLabel: label, fromRule: rule, fromIsRequired: isRequired } = rel;
          return { id, name, label, typeText: this.$t('page.relation'), isRequired, rowType: 'rel' };
        }
      });
      this.tbodyList = [...glbalTbodyList, ...attrTbodyList, ...relTbodyList];
      this.$emit('on-template-change', this.ciId, []);
    },
    getSelected(indexList, itemList) {
      this.$emit('on-template-change', this.ciId, itemList);
    },
    renderTreeNode(h, { root, node, data }) {
      if (data.nodeType === 'ciType') {
        return h('span', { class: ['text-disabled'] }, data.title);
      }
      return h('span', { class: [data.icon, 'tree-node-title', 'text-action', { 'text-primary': data.selected }] }, data.title);
    }
  }
};
</script>

<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.batch-import-template {
  // padding-right: 16px;
  /deep/.ivu-layout-content {
    padding-left: 32px;
    padding-top: 11px;
  }
  /deep/.tscontain-body {
    padding-left: 0 !important;
    padding-right: 0 !important;
    .tscontain-sider {
      margin-left: 0px !important;
    }
  }
  .padt16 {
    padding-top: 10px;
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
