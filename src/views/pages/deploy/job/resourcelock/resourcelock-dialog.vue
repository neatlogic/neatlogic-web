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
          <span>{{ selectedApp.name }} - 资源锁</span>
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
            <template v-slot:jobName="{ row }">
              <span
                class="text-href"
                @click="toJobDetail(row)"
              >{{ row.jobName }}</span>
            </template>
            <template v-slot:isLock="{row}">
              {{ row.isLock == 1 ? "已锁定":"等待" }}
            </template>
            <template v-slot:action="{row}">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li v-if="row.isLock != 1" class="tsfont-edit" @click="deleteLock('cancel',row)">取消等待</li>
                  <li v-if="row.isLock == 1" class="tsfont-yunweishenjishebei" @click="deleteLock('unlock',row)">强制解锁</li>
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
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    Status: resolve => require(['@/resources/components/Status/CommonStatus.vue'], resolve)
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
          title: '资源',
          key: 'lockTarget',
          maxLength: 30
        },
        {
          title: this.$t('page.status'),
          key: 'isLock'
        },
        {
          title: '上锁作业',
          key: 'jobName'
        },
        {
          title: this.$t('term.deploy.jobstatus'),
          key: 'jobStatus'
        },
        {
          title: '锁定时长',
          key: 'lockCostTime'
        },
        {
          title: '锁定时间',
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
        content: '作业 "' + row.jobName + '" 未执行完成，' + (buttonType === 'cancel' ? '取消等待' : '强制解锁') + '可能导致作业执行失败，是否继续?',
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
              this.$Message.success((buttonType === 'cancel' ? '取消等待' : '强制解锁') + '成功');
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
