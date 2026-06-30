<template>
  <TsDialog v-bind="dialogConfig" @on-ok="confirm" @on-close="close">
    <template v-slot>
      <div>
        <div class="text-grey mb-md">默认仅修改原用例，需要同步的副本请勾选。</div>
        <TsTable
          v-if="tbodyList.length > 0"
          :theadList="theadList"
          :tbodyList="tbodyList"
          multiple
          @getSelected="getSelected"
        >
          <template v-slot:relIssueName="{ row }">
            <span v-if="row.relIssueName">
              <AppIcon :appType="row.relAppType" :appColor="row.relAppColor"></AppIcon>
              <span class="ml-xs">{{ row.relIssueName }}</span>
            </span>
            <span v-else>-</span>
          </template>
          <template v-slot:statusLabel="{ row }">
            <IssueStatus :issueData="row" :scale="0.8"></IssueStatus>
          </template>
        </TsTable>
        <NoData v-else></NoData>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    AppIcon: () => import('@/views/pages/rdm/project/viewtab/components/app-icon.vue'),
    IssueStatus: () => import('@/views/pages/rdm/project/viewtab/components/issue-status.vue')
  },
  props: {
    copyList: { type: Array, default: () => [] },
    selectedIdList: { type: Array, default: () => [] }
  },
  data() {
    return {
      dialogConfig: {
        title: '选择同步副本',
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'large'
      },
      selectedList: [],
      theadList: [
        { key: 'selection', width: 60 },
        { key: 'name', title: '副本' },
        { key: 'relIssueName', title: '关联对象' },
        { key: 'statusLabel', title: '状态', width: 120 }
      ]
    };
  },
  created() {
    this.selectedList = (this.copyList || []).filter(item => this.selectedIdList.includes(item.id));
  },
  methods: {
    getSelected(indexList, itemList) {
      this.selectedList = itemList || [];
    },
    confirm() {
      this.$emit('confirm', this.selectedList.map(item => item.id).filter(id => id));
      this.close();
    },
    close() {
      this.$emit('close');
    }
  },
  computed: {
    tbodyList() {
      return (this.copyList || []).map(item => {
        return {
          ...item,
          isSelected: this.selectedIdList.includes(item.id)
        };
      });
    }
  }
};
</script>
