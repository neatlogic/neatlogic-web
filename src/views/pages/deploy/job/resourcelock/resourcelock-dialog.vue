<template>
  <div>
    <TsDialog
      type="slider"
      width="large"
      :isShow="true"
      :maskClose="true"
      :hasFooter="false"
      @on-close="closeDialog"
    >
      <template v-slot:header>
        <div class="action-group">
          <span>{{ selectedApp.name }} - {{ $t('term.autoexec.resourcelock') }}</span>
        </div>
      </template>
      <template v-slot>
        <div>
          <TsTable
            v-bind="lockData"
            :theadList="theadList"
            @changeCurrent="searchData"
            @changePageSize="changePageSize"
          >
            <template v-slot:lockTarget="{ row }"> <Poptip
              trigger="click"
              width="500"
              transfer
              word-wrap
            >
              <span>{{ row.handlerParam.lockMode }}:{{ row.lockTarget }}</span>
              <div slot="content" ref="tooltip">{{ row.handlerParam }}</div>
            </Poptip>
              
            </template>
            <template v-slot:jobName="{ row }">
              <span
                class="text-href"
                @click="toJobDetail(row)"
              >{{ row.jobName }}</span>
            </template>
            <template v-slot:isLock="{row}">
              {{ row.isLock == 1 ? $t('page.locked'): $t('page.wait') }}
            </template>
            <template v-slot:action="{row}">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li v-if="row.isLock != 1" class="tsfont-edit" @click="deleteLock('cancel',row)">{{ $t('term.deploy.cancelwait') }}</li>
                  <li v-if="row.isLock == 1" class="tsfont-yunweishenjishebei" @click="deleteLock('unlock',row)">{{ $t('term.deploy.forceunlock') }}</li>
                </ul>
              </div>
            </template>
            <template v-slot:jobStatus="{row}">
              <Status
                :statusValue="row.jobStatus"
                :statusName="row.jobStatusName"
                :type="'text'"
                class="job-status"
              ></Status>
            </template>
            <template v-slot:lockCostTime="{row}">
              <span :class="row.fcd+1000*60*15 < Date.now()?'com-status text-warn':''">{{ row.lockCostTime }}</span>
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
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    Status: () => import('@/resources/components/Status/CommonStatus.vue')
  },
  props: {
    selectedApp: {
      type: Object
    },
    keywordParam: {
      type: Object
    }
  },
  data() {
    return {
      theadList: [
        {
          title: this.$t('page.resources'),
          key: 'lockTarget',
          maxLength: 30
        },
        {
          title: this.$t('page.status'),
          key: 'isLock'
        },
        {
          title: this.$t('term.deploy.lockingoperation'),
          key: 'jobName'
        },
        {
          title: this.$t('page.jobstatus'),
          key: 'jobStatus'
        },
        {
          title: this.$t('term.deploy.lockingduration'),
          key: 'lockCostTime'
        },
        {
          title: this.$t('term.deploy.locktime'),
          key: 'fcd',
          type: 'time'
        },
        {
          key: 'action'
        }
      ],
      lockData: null,
      jobEndingStatusList: ['completed', 'aborted', 'ignored', 'failed'],
      searchParam: {handler: 'deploy'}
    };
  },
  beforeCreate() {},
  created() {
    this.searchData(1);
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
    closeDialog() {
      this.$emit('close');
    },
    searchData(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      this.searchParam.keywordParam = this.keywordParam;
      this.$api.framework.globallock.searchLockList(this.searchParam).then((res) => {
        if (res && res.Status == 'OK') {
          this.lockData = res.Return;
        }
      });
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchData(1);
    },
    toJobDetail(row) {
      this.$router.push({
        path: '/job-detail',
        query: { id: row.jobId }
      });
    },
    deleteLock(buttonType, row) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('term.deploy.jobnotexecutefinish', {target: row.jobName}) + (buttonType === 'cancel' ? this.$t('term.deploy.cancelwait') : this.$t('term.deploy.forceunlock')) + this.$t('term.deploy.jobexecutionmayfailconfirm'),
        btnType: 'info',
        'on-ok': vnode => {
          let data = {
            lockId: row.id,
            operType: 'deploy',
            action: buttonType
          };
          this.$api.framework.globallock.lock(data).then(res => {
            if (res.Status == 'OK') {
              this.searchData(1);
              this.$Message.success((buttonType === 'cancel' ? this.$t('term.deploy.cancelwait') : this.$t('term.deploy.forceunlock')) + this.$t('page.success'));
            }
          });
          vnode.isShow = false;
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
