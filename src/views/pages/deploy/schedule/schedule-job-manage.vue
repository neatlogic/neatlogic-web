<template>
  <div>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain enableCollapse :siderWidth="220">
      <template v-slot:topLeft>
        <span class="tsfont-plus text-action" @click="addTimeJob">{{ $t('term.autoexec.timingjob') }}</span>
      </template>
      <template v-slot:topRight>
        <div>
          <InputSearcher
            v-model="searchValue.keyword"
            @change="searchSchedule(1)"
          ></InputSearcher>
        </div>
      </template>
      <template v-slot:sider>
        <div>
          <AppModuleList
            ref="appModuleList"
            v-model="appModuleData"
            :filter="{authorityActionList: ['view']}"
          ></AppModuleList>
        </div>
      </template>
      <template v-slot:content>
        <div>
          <TsTable
            v-bind="scheduleData"
            :theadList="theadList"
            @changeCurrent="searchSchedule"
            @changePageSize="changePageSize"
          >
            <template v-slot:name="{ row }">
              <span class="text-href" @click="toJobDetail(row)">
                {{ row.name }}
              </span>
            </template>
            <template v-slot:isActive="{ row }">
              <span v-if="row.isActive">{{ $t('page.enable') }}</span>
              <span v-else>{{ $t('page.disable') }}</span>
            </template>
            <template slot="cron" slot-scope="{ row }">
              <div>
                <TsQuartz :value="row.cron" showType="read"></TsQuartz>
              </div>
            </template>
            <template v-slot:beginTime="{ row }">
              <div v-if="row.beginTime" class="fz10">
                <span>{{ row.beginTime | formatDate }}</span>
                <span class="text-grey ml-xs">{{ $t('page.begin') }}</span>
              </div>
              <div v-if="row.endTime" class="fz10">
                <span>{{ row.endTime | formatDate }}</span>
                <span class="text-grey ml-xs">{{ $t('page.finish') }}</span>
              </div>
            </template>
            <template v-slot:appSystemAbbrName="{ row }">
              <div>
                {{ row.appSystemAbbrName }}<template v-if="row.appModuleAbbrName">/{{ row.appModuleAbbrName }}</template>
              </div>
            </template>
            <template v-slot:pipelineName="{ row }">
              <div v-if="row.pipelineName" class="text-href" @click="gotoPipeline(row)">
                {{ row.pipelineName }}
              </div>
            </template>
            <template v-slot:execCount="{ row }">
              <div :class="row.execCount>0?'text-href':''" @click="showJobList(row)">
                {{ row.execCount }}
              </div>
            </template>
            <template v-slot:action="{ row }">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li :title="!row.editable ? $t('page.notauthrelationadmin'): ''" @click.stop>
                    <TsFormSwitch
                      v-model="row.isActive"
                      :true-value="1"
                      :false-value="0"
                      showStatus
                      :disabled="!row.editable ? true : false"
                      @on-change="updateSchedule(row)"
                    ></TsFormSwitch>
                  </li>
                  <li
                    class="tsfont-trash-o"
                    :title="!row.deletable ? $t('page.notauthrelationadmin'):''"
                    :class="{ disable: !row.deletable }"
                    @click.stop="deleteSchedule(row)"
                  >
                    {{ $t('page.delete') }}
                  </li>
                </ul>
              </div>
            </template>
          </TsTable>
        </div>
      </template>
    </TsContain>
    <ListDeployJobDialog v-if="isListDeployJobDialogShow" :invokeIdList="invokeIdList" @close="closeListJob"></ListDeployJobDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    AppModuleList: resolve => require(['../application-config/config/app/app-module-list.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsQuartz: resolve => require(['@/resources/plugins/TsQuartz/TsQuartz.vue'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    ListDeployJobDialog: resolve => require(['@/views/pages/deploy/pipeline/list-deployjob-dialog.vue'], resolve)
  },
  props: {},
  data() {
    return {
      loadingShow: true,
      searchParam: {},
      searchValue: {
        keyword: ''
      },
      appModuleData: null,
      scheduleData: {},
      theadList: [
        {
          title: this.$t('page.name'),
          key: 'name'
        },
        {
          title: this.$t('page.status'),
          key: 'isActive'
        },
        {
          title: this.$t('term.autoexec.timingplan'),
          key: 'cron'
        },
        {
          title: this.$t('page.startstoptime'),
          key: 'beginTime'
        },
        {
          title: this.$t('term.deploy.jobtype'),
          key: 'typeName'
        },
        {
          title: this.$t('term.deploy.superpipeline'),
          key: 'pipelineName'
        },
        {
          title: this.$t('term.deploy.appmodule'),
          key: 'appSystemAbbrName'
        },
        {
          title: this.$t('term.autoexec.executionrecord'),
          key: 'execCount'
        },
        {
          title: this.$t('page.fcu'),
          key: 'lcuVo',
          type: 'user'
        },
        {
          title: this.$t('page.fcd'),
          key: 'lcd',
          type: 'time'
        },
        { key: 'action' }   
      ],
      isListDeployJobDialogShow: false,
      invokeIdList: []
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.query && !this.$route.query.isBack) {
      this.$addHistoryData('appModuleEnvData', {});
    }
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
    searchSchedule(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      this.$api.deploy.schedule.searchSchedule({...this.searchParam, ...this.searchValue}).then(res => {
        if (res.Status == 'OK') {
          this.scheduleData = res.Return;
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchSchedule(1);
    },
    addTimeJob() {
      let params = {
        path: '/schedule-job-add',
        query: {}
      };
      if (this.searchValue.appSystemId) {
        this.$set(params.query, 'appSystemId', this.searchValue.appSystemId);
      }
      if (this.searchValue.appModuleId) {
        this.$set(params.query, 'appModuleId', this.searchValue.appModuleId);
      }
      this.$router.push(params);
    },
    updateSchedule(row) {
      this.$api.deploy.schedule.updateSchedule({ id: row.id }).then(res => {
        if (res.Status == 'OK') {
          row.isActive = res.Return.isActive;
          this.$Message.success(this.$t('message.executesuccess'));
        }
      }).catch(error => {
        row.isActive = row.isActive ? 0 : 1;
      });
    },
    deleteSchedule(row) {
      if (!row.deletable) {
        return;
      }
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('page.scheduledtask')}),
        btnType: 'error',
        'on-ok': vnode => {
          let params = {
            id: row.id
          };
          this.$api.deploy.schedule.deleteSchedule(params).then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.searchSchedule(); 
            }
          }).finally(() => {
            vnode.isShow = false;
          });
        }
      });
    },
    gotoPipeline(row) {
      if (row.pipelineType) {
        if (row.pipelineType == 'global') {
          this.$router.push({
            path: '/pipeline-edit',
            query: {
              id: row.pipelineId
            }
          });
        } else if (row.pipelineType == 'appSystem') {
          this.$router.push({
            path: '/application-config-manage',
            query: {
              appSystemId: row.appSystemId
            }
          });
        }
      }
    },
    toJobDetail(row) {
      this.$router.push({
        path: '/schedule-job-edit',
        query: {
          id: row.id
        }
      });
    },
    showJobList(row) {
      if (!row.execCount) {
        return;
      }
      this.invokeIdList = [row.id];
      this.isListDeployJobDialogShow = true;
    },
    closeListJob() {
      this.invokeIdList = [];
      this.isListDeployJobDialogShow = false;
    },
    restoreHistory(historyData) {
      this.appModuleData = historyData['appModuleEnvData'] || {};
    }
  },
  filter: {},
  computed: {},
  watch: {
    appModuleData: {
      handler(val) {
        this.searchValue.appSystemId = val ? val.appId : null;
        this.searchValue.appModuleId = val ? val.moduleId : null;
        this.searchSchedule(1);
        if (val) { // immediate: true 先执行，返回后会清空缓存的值
          this.$addHistoryData('appModuleEnvData', val);
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less">
</style>
