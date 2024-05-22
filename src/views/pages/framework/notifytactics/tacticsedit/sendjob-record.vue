<template>
  <TsDialog
    :isShow="visible"
    type="slider"
    :title="$t('term.autoexec.executionrecord')"
    width="800px"
    :hasFooter="false"
    :maskClose="true"
    className="sendjob-box"
    @on-close="close"
  >
    <template>
      <Loading :loadingShow="isLoading" type="fix"></Loading>
      <TsTable
        v-if="!isLoading"
        class="table"
        :theadList="theadList"
        v-bind="tableConfig"
        @changeCurrent="currentPage => searchRecord({ currentPage })"
        @changePageSize="pageSize => searchRecord({ pageSize })"
      >
        <template v-slot:status="{ row }">
          <span v-if="row.statusVo" :style="{ color: row.statusVo.color }">{{ row.statusVo.text }}</span>
        </template>
        <template v-slot:toVoList="{ row }">
          <span v-for="(user, uindex) in slice(row.toVoList, true)" :key="uindex">
            <span v-if="user.initType == 'email' || user.initType == 'custom'">{{ user.name }}</span>
            <UserCard
              v-else
              class="user-name"
              v-bind="user"
              hideAvatar
            ></UserCard>
          </span>
          <template v-if="row.toVoList.length > 5">
            <Dropdown placement="bottom-start" transfer>
              <span class="tsfont-option-vertical bg-block text-action"></span>
              <DropdownMenu slot="list">
                <DropdownItem v-for="(receiver, index) in slice(row.toVoList, false)" :key="index" @click.stop>
                  <span v-if="receiver.initType == 'email' || receiver.initType == 'custom'">{{ receiver.name }}</span>
                  <UserCard
                    v-else
                    class="user-name"
                    v-bind="receiver"
                    hideAvatar
                  ></UserCard>
                </DropdownItem>
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
    </template>
  </TsDialog>
</template>

<script>
export default {
  name: 'SendjobRecord',
  components: {
    TsTable: () => import('components/TsTable/TsTable'),
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue')
  },
  props: {
    visible: { type: Boolean, default: false },
    rowData: { type: Object, default: null }
  },
  data() {
    return {
      isLoading: false,
      searchParams: {
        id: null,
        currentPage: 1,
        pageSize: 20
      },
      theadList: [
        { title: this.$t('page.status'), key: 'status' },
        { title: this.$t('term.autoexec.executiontime'), key: 'startTime' },
        { title: this.$t('term.framework.tovouser'), key: 'toVoList' },
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
  methods: {
    close() {
      this.$emit('update:visible', false);
      this.$emit('update:rowData', null);
    },
    async searchRecord(params = {}) {
      this.isLoading = true;
      this.searchParams = { ...this.searchParams, ...params };
      const res = await this.$api.framework.tactics.auditSearch(this.searchParams);
      this.tableConfig = res.Return;
      this.isLoading = false;
    },
    async getAuditLog(row) {
      const params = { auditId: row.id };
      const res = await this.$api.framework.tactics.getAuditLog(params);
      this.$createDialog({
        title: this.$t('page.failreason'),
        content: res.Return,
        hasFooter: false,
        width: 'medium'
      });
    },
    slice(list, key) {
      if (list.length > 0) {
        if (key) {
          return list.slice(0, 5);
        } else {
          return list.slice(5, list.length);
        }
      }
    }
  },
  watch: {
    visible: {
      handler(val) {
        if (val) {
          this.searchParams.id = this.rowData.id;
          this.searchRecord();
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less">
.sendjob-box {
  /deep/ .tsslider-content {
    padding: 0;
  }
}
</style>
