<template>
  <Drawer 
    :value="visible"
    class="sendjob-record"
    :title="$t('term.report.sendrecord')"
    width="800px"
    :mask-closable="true"
    :mask="true"
    placement="right"
    @on-visible-change="changeVisible"
  >
    <Loading :loadingShow="isLoading" type="fix"></Loading>
    <TsTable
      class="table"
      :theadList="theadList"
      v-bind="tableConfig"
      @changeCurrent="currentPage=>searchRecord({currentPage})" 
      @changePageSize="pageSize=>searchRecord({pageSize})"
    >
      <template v-slot:status="{row}">
        <span v-if="row.status === 'succeed'" class="text-success">{{ $t('page.success') }}</span>
        <span v-else-if="row.status === 'failed'" class="text-danger">{{ $t('page.fail') }}</span>
        <span v-else-if="row.status === 'running'" class="text-primary">{{ $t('term.report.sending') }}</span>
      </template>
      <template v-slot:receiverList="{row}">
        <template v-if="row.receiverList.length <= 7">
          {{ row.receiverList.join('、') }}
        </template>
        <template v-else>
          {{ row.receiverList.slice(0,7).join('、') }}
          <Dropdown placement="bottom-start" transfer>
            <span class="text-action tsfont-option-horizontal"></span>
            <DropdownMenu slot="list">
              <DropdownItem v-for="(receiver, index) in row.receiverList.slice(7)" :key="index" @click.stop>{{ receiver }}</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </template>
      </template>
      <template v-slot:startTime="{row}">
        {{ row.startTime | formatDate }}
      </template>
      <template v-slot:action="{row}">
        <div class="tstable-action">
          <ul class="tstable-action-ul">
            <li v-if="row.contentHash" @click="getAuditLog(row)">异常</li>
          </ul>
        </div>
      </template>
    </TsTable>
  </Drawer>
</template>

<script>
export default {
  name: 'SendjobRecord',
  components: {
    TsTable: resolve => require(['components/TsTable/TsTable'], resolve)
  },
  props: {
    visible: {type: Boolean, default: false},
    rowData: {type: Object, default: null}
  },
  data() {
    let _this = this;
    return {
      isLoading: false,
      searchParams: {
        jobUuid: null,
        currentPage: 1,
        pageSize: 20
      },
      theadList: [
        {title: this.$t('common.status'), key: 'status'},
        {title: this.$t('term.report.sendtimes'), key: 'startTime'},
        {title: '收件人', key: 'receiverList'},
        {title: '', key: 'action'}
      ],
      tableConfig: {
        tbodyList: [], 
        rowNum: 0, 
        pageSize: 20, 
        currentPage: 1
      }
    };
  },
  methods: {
    changeVisible(visible) {
      if (visible === false) {
        this.$emit('update:visible', false);
        this.$emit('update:rowData', null);
      } else {
        this.searchParams.jobUuid = this.rowData.id;
        this.searchRecord();
      }
    },
    async searchRecord(params = {}) {
      this.isLoading = true;
      this.searchParams = {...this.searchParams, ...params};
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

