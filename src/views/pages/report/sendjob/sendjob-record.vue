<template>
  <TsDialog v-bind="dialogConfig" @on-close="close">
    <template v-slot>
      <div>
        <Loading :loadingShow="isLoading" type="fix"></Loading>
        <TsTable
          class="table"
          :theadList="theadList"
          v-bind="tableConfig"
          @changeCurrent="changeCurrent"
          @changePageSize="changePageSize"
        >
          <template v-slot:status="{ row }">
            <span v-if="row.status === 'succeed'" class="text-success">{{ $t('page.success') }}</span>
            <span v-else-if="row.status === 'failed'" class="text-danger">{{ $t('page.fail') }}</span>
            <span v-else-if="row.status === 'running'" class="text-primary">{{ $t('term.report.sending') }}</span>
          </template>
          <template v-slot:receiverList="{ row }">
            <template v-if="row.receiverList.length <= 7">
              {{ row.receiverList.join('、') }}
            </template>
            <template v-else>
              {{ row.receiverList.slice(0, 7).join('、') }}
              <Dropdown placement="bottom-start" transfer>
                <span class="text-action tsfont-option-horizontal"></span>
                <DropdownMenu slot="list">
                  <DropdownItem v-for="(receiver, index) in row.receiverList.slice(7)" :key="index" @click.stop>{{ receiver }}</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </template>
          </template>
          <template v-slot:startTime="{ row }">
            {{ row.startTime | formatDate }}
          </template>
          <template v-slot:action="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li v-if="row.contentHash" @click="getAuditLog(row)">{{ $t('page.exception') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
    </template>
  </TsDialog>
</template>

<script>
export default {
  name: 'SendjobRecord',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  props: {
    rowData: { type: Object, default: null }
  },
  data() {
    return {
      dialogConfig: {
        title: this.$t('term.report.sendrecord'),
        type: 'slider',
        maskClose: false,
        isShow: true,
        width: 'medium',
        hasFooter: false
      },
      isLoading: false,
      searchParams: {
        jobUuid: this.rowData.id,
        currentPage: 1,
        pageSize: 20
      },
      theadList: [
        { title: this.$t('page.status'), key: 'status' },
        { title: this.$t('term.report.sendtimes'), key: 'startTime' },
        { title: this.$t('page.recipient'), key: 'receiverList' },
        { title: '', key: 'action' }
      ],
      tableConfig: {
        tbodyList: [],
        rowNum: 0,
        pageSize: 20,
        currentPage: 1
      }
    };
  },
  mounted() {
    this.searchRecord(1);
  },
  methods: {
    close() {
      this.$emit('close');
    },
    changeCurrent(currentPage) {
      this.searchRecord(currentPage);
    },
    changePageSize(pageSize) {
      this.searchParams.pageSize = pageSize;
      this.searchRecord(1);
    },
    async searchRecord(currentPage) {
      this.searchParams.currentPage = currentPage || 1;
      this.isLoading = true;
      const res = await this.$api.report.sendjob.searchRecord(this.searchParams);
      this.tableConfig = res.Return;
      this.isLoading = false;
    },
    async getAuditLog(row) {
      const params = { auditId: row.id };
      const res = await this.$api.report.sendjob.getAuditLog(params);
      this.$createDialog({
        title: this.$t('page.failreason'),
        content: res.Return,
        hasFooter: false
      });
    }
  }
};
</script>
