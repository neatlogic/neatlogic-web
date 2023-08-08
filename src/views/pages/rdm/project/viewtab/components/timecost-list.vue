<template>
  <div>
    <div class="mb-sm">
      <a class="tsfont-plus" @click="addTimeCost">{{ $t('term.rdm.cost') }}</a>
    </div>
    <TsTable
      v-bind="issueCostData"
      :theadList="theadList"
      @changeCurrent="searchIssueCost"
      @changePageSize="changePageSize"
    >
      <template v-slot:action="{ row }">
        <div class="tstable-action">
          <ul class="tstable-action-ul">
            <li class="tsfont-edit" @click="editIssueCost(row.id)">
              {{ $t('page.edit') }}
            </li>
            <li
              class="tsfont-trash-o"
              @click="deleteIssueCost(row.id)"
            >{{ $t('page.delete') }}</li>
          </ul>
        </div>
      </template></TsTable>
    <TimeCostEdit
      v-if="isTimecostEditShow"
      :id="currentTimecostId"
      :issueData="issueData"
      @close="closeTimeCostEdit"
    ></TimeCostEdit>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TimeCostEdit: resolve => require(['@/views/pages/rdm/project/viewtab/components/timecost-edit-dialog.vue'], resolve)
  },
  props: {
    issueData: { type: Object }
  },
  data() {
    return {
      theadList: [
        {
          key: 'costDate',
          title: this.$t('term.rdm.costdate')
        },
        { key: 'timecost', title: this.$t('term.rdm.costtime') },
        { key: 'description', title: this.$t('page.description') },
        { key: 'action' }
      ],
      issueCostData: {},
      searchParam: { issueId: this.issueData.id },
      isTimecostEditShow: false,
      currentTimecostId: null
    };
  },
  beforeCreate() {},
  created() {
    this.searchIssueCost();
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
    deleteIssueCost(id) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {'target': this.$t('term.rdm.cost')}),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.rdm.issuecost.deleteIssueCost(this.issueData.id, id).then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              vnode.isShow = false;
              this.searchIssueCost();
            }
          });
        }
      });
    },
    editIssueCost(id) {
      this.currentTimecostId = id;
      this.isTimecostEditShow = true;
    },
    addTimeCost() {
      this.currentTimecostId = null;
      this.isTimecostEditShow = true;
    },
    closeTimeCostEdit(needRefresh) {
      this.currentTimecostId = null;
      this.isTimecostEditShow = false;
      if (needRefresh) {
        this.searchIssueCost();
      }
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchIssueCost(1);
    },
    searchIssueCost(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      this.$api.rdm.issuecost.searchIssueCost(this.searchParam).then(res => {
        this.issueCostData = res.Return;
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
