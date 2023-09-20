<!--定时作业-->
<template>
  <div class="jobManageList">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain border="border">
      <template slot="topLeft">
        <div class="action-group">
          <span class="action-item">
            <span class="text-action tsfont-plus" @click="addJob()">{{ $t('term.autoexec.timingjob') }}</span>
          </span>
          <span class="action-item">
            <span class="text-action tsfont-formtime" @click="showAudit()">{{ $t('term.autoexec.executionrecord') }}</span>
          </span>
          <span class="action-item">
            <span class="text-action tsfont-timer" @click="showSchedulerMemoryJob()">{{ $t('term.autoexec.loadedjob') }}</span>
          </span>
          <span v-auth="['ADMIN']" class="action-item"><AuditConfig auditName="SCHEDULER-AUDIT"></AuditConfig></span>
        </div>
      </template>
      <template slot="topRight">
        <TsRow>
          <Col :span="6"><TsFormSelect v-bind="handlerSelectSetting"></TsFormSelect></Col>
          <Col :span="18">
            <InputSearcher
              v-model="searchParam.keyword"
              @change="searchJob(1)"
            ></InputSearcher>
          </Col>
        </TsRow>
      </template>
      <div slot="content">
        <TsTable
          v-if="tabledata"
          v-bind="tabledata"
          hight="600"
          @changeCurrent="changePage"
          @changePageSize="changePageSize"
        >
          <template slot="isActive" slot-scope="{ row }">
            <span v-if="row.isActive == 1" class="text-success">{{ $t('page.enable') }}</span>
            <span v-else class="text-grey">{{ $t('page.disable') }}</span>
          </template>
          <template slot="needAudit" slot-scope="{ row }">
            <span v-if="row.needAudit == 1" class="text-success">{{ $t('page.yes') }}</span>
            <span v-else class="text-grey">{{ $t('page.no') }}</span>
          </template>
          <template slot="execCount" slot-scope="{ row }">
            <div>{{ row.jobStatus.execCount }}</div>
          </template>
          <template slot="cron" slot-scope="{ row }">
            <div>
              <TsQuartz :value="row.cron" showType="read"></TsQuartz>
            </div>
          </template>
          <template slot="execute" slot-scope="{ row }">
            <div>
              <span class="text-grey">{{ $t('page.execcount') }}：</span>
              <span>{{ row.jobStatus.execCount || '0' }}</span>
            </div>
            <div v-if="row.jobStatus.beginTime != null">
              <span class="text-grey">{{ $t('term.autoexec.planstarttime') }}：</span>
              <span>{{ row.jobStatus.beginTime | formatDate }}</span>
            </div>
            <div v-if="row.jobStatus.endTime != null">
              <span class="text-grey">{{ $t('term.autoexec.planendtime') }}：</span>
              <span>{{ row.jobStatus.endTime | formatDate }}</span>
            </div>
            <div v-if="row.jobStatus.lastFireTime != null">
              <span class="text-grey">{{ $t('term.autoexec.lastactivetime') }}：</span>
              <span>{{ row.jobStatus.lastFireTime | formatDate }}</span>
            </div>
            <div v-if="row.jobStatus.lastFinishTime != null">
              <span class="text-grey">{{ $t('term.autoexec.lastcompletetime') }}：</span>
              <span>{{ row.jobStatus.lastFinishTime | formatDate }}</span>
            </div>
            <div v-if="row.jobStatus.nextFireTime != null">
              <span class="text-grey">{{ $t('page.nextactivationtime') }}：</span>
              <span>{{ row.jobStatus.nextFireTime | formatDate }}</span>
            </div>
          </template>
          <template slot="name" slot-scope="{ row }"><span class="text-href" @click.stop="editRow(row.uuid)">{{ row.name }}</span></template>
          <template slot="action" slot-scope="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-putongjigui" @click="showAudit(row.uuid)">{{ $t('term.autoexec.executionrecord') }}</li>
                <li class="tsfont-copy icon" @click="copyRow(row.uuid)">{{ $t('page.copy') }}</li>
                <!-- <li class="tsfont-edit icon" @click="editRow(row.uuid)">{{ $t('page.edit') }}</li> -->
                <li class="tsfont-trash-o icon" @click="deleteRow(row.uuid, row.name)">{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
    </TsContain>
    <JobEdit
      v-if="isEditShow"
      :jobUuid="currentJobUuid"
      :isCopy="isCopy"
      @close="closeEditDialog"
    ></JobEdit>
    <JobAudit v-if="isAuditShow" :jobUuid="currentJobUuid" @close="closeAuditDialog"></JobAudit>
    <schedulerMemory v-if="isSchedulerMemoryShow" @close="closeSchedulerMemory"></schedulerMemory>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    JobAudit: resolve => require(['./job-audit-dialog.vue'], resolve),
    schedulerMemory: resolve => require(['./job-memory.vue'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsQuartz: resolve => require(['@/resources/plugins/TsQuartz/TsQuartz.vue'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    AuditConfig: resolve => require(['@/views/components/auditconfig/auditconfig.vue'], resolve),
    JobEdit: resolve => require(['./job-edit-dialog.vue'], resolve)
  },
  filters: {
  },
  props: [''],
  data() {
    let _this = this;
    return {
      isCopy: false,
      currentJobUuid: null,
      isAuditShow: false,
      isSchedulerMemoryShow: false,
      isEditShow: false,
      isSaving: false,
      loadingShow: false,
      tableheight: 0,
      auditTableHeight: 0,
      pageSize: 20,
      theadList: [
        {
          title: this.$t('page.name'),
          key: 'name'
        },
        {
          title: this.$t('term.autoexec.jobmodule'),
          key: 'handlerName'
        },
        {
          title: this.$t('page.status'),
          key: 'isActive'
        },
        {
          title: this.$t('page.keeprecords'),
          key: 'needAudit'
        },
        {
          title: this.$t('page.plantime'),
          key: 'cron'
        },
        {
          title: this.$t('term.autoexec.executionsituation'),
          key: 'execute'
        },
        {
          title: this.$t('term.autoexec.executecount'),
          key: 'execCount'
        },
        {
          title: ' ',
          key: 'action',
          width: 10,
          align: 'right'
        }
      ],
      tabledata: null,
      clientHeight: document.documentElement.clientHeight, //窗口高度
      searchParam: {
        currentPage: 1,
        pageSize: this.pageSize,
        keyword: null,
        handler: null
      },
      handlerSelectSetting: {
        name: 'handler',
        search: true,
        url: '/api/rest/job/class/search',
        rootName: 'tbodyList', //通过url来获取数据的rootName
        valueName: 'className', //option渲染值
        textName: 'name', //text渲染值
        placeholder: this.$t('term.autoexec.jobmodule'),
        onChange: function(value) {
          if (value != '') {
            _this.searchParam.handler = value;
          } else {
            delete _this.searchParam.handler;
          }
          _this.searchJob(1);
        }
      },
      propData: []
    };
  },
  beforeMount() {},
  mounted() {
    this.searchJob(1);
  },
  created() {},
  beforeDestroy() {
  },
  methods: {
    closeEditDialog(needRefresh) {
      this.isEditShow = false;
      this.isCopy = false;
      this.currentJobUuid = null;
      if (needRefresh) {
        this.searchJob(1);
      }
    },
    closeAuditDialog() {
      this.isAuditShow = false;
      this.currentJobUuid = null;
    },
    closeSchedulerMemory() {
      this.isSchedulerMemoryShow = false;
    },
    showAudit(jobUuid) {
      this.isAuditShow = true;
      this.currentJobUuid = jobUuid;
    },
    showSchedulerMemoryJob() {
      this.isSchedulerMemoryShow = true;
    },
    changePage(currentPage) {
      this.searchJob(currentPage);
    },
    //获取所有定时作业
    searchJob: function(currentPage, pageSize) {
      let _this = this;
      if (currentPage) {
        _this.searchParam.currentPage = currentPage;
      }
      if (pageSize) {
        _this.searchParam.pageSize = pageSize;
      } else {
        _this.searchParam.pageSize = this.pageSize;
      }
      this.$api.framework.schedule.search(_this.searchParam).then(res => {
        if (res.Status == 'OK') {
          _this.loadingShow = false;
          _this.tabledata = res.Return;
          _this.tabledata.theadList = _this.theadList;
        }
      });
    },
    //改变页数
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchJob(1);
    },
    addJob: function() {
      this.isCopy = false;
      this.currentJobUuid = null;
      this.isEditShow = true;
    },
    editRow: function(uuid) {
      this.isCopy = false;
      this.currentJobUuid = uuid;
      this.isEditShow = true;
    },
    copyRow: function(uuid) {
      this.isCopy = true;
      this.currentJobUuid = uuid;
      this.isEditShow = true;
    },
    deleteRow: function(uuid, name) {
      //删除定时作业
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: name}),
        btnType: 'error',
        'on-ok': vnode => {
          vnode.isShow = false;
          let params = { uuid: uuid };
          this.$api.framework.schedule
            .delete(params)
            .then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
                this.searchJob(1);
              }
            });
        }
      });
    }
  },

  computed: {
    scrollheight: function() {
      let height = this.clientHeight - 60;
      return height;
    }
  },
  watch: {}
};
</script>
<style lang="less">
.jobManageList {
  .top {
    .bar-top {
      .bar-top-left {
        .batch {
          margin-left: 16px;
        }
      }
    }
  }

  .job-box {
    // min-height: calc(100vh - 58px - 16px - 16px - 22px);
    .job-top {
      margin-bottom: 16px;
    }
  }
  .clickMore {
    text-align: center;
    width: 100%;
    height: 24px;
    line-height: 24px;
    margin: 10px 0;
    span {
      cursor: pointer;
    }
  }
  .textMore {
    text-align: center;
    width: 100%;
    height: 24px;
    line-height: 24px;
    margin: 10px 0;
  }
  tr {
    cursor: default;
  }
}
</style>
<style lang="less">
.propTable {
  position: relative;
  .addProp {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 100;
  }
}
</style>
