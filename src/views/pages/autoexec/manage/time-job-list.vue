/*
 * Copyright(c) 2023 NeatLogic Co., Ltd. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
<template>
  <div class="time-job-list-wrap">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain border="border">
      <template v-slot:topLeft>
        <TimejobClickText @refreshTableList="getTableDataList(1, 20)"></TimejobClickText>
      </template>
      <template v-slot:topRight>
        <TsRow>
          <Col :span="6">
            <TsFormSelect v-model="tableData.autoexecCombopId" className="time-job-ts-form-select" v-bind="handlerSelectSetting"></TsFormSelect>
          </Col>
          <Col :span="18">
            <InputSearcher
              v-model="tableData.keyword"
              @change="keyword=>{getTableDataList(1, 20, keyword, null)}"
            ></InputSearcher>
          </Col>
        </TsRow>
      </template>
      <template v-slot:content>
        <TsTable
          v-if="!loadingShow"
          v-bind="tableData"
          @changeCurrent="getTableDataList"
          @changePageSize="getTableDataList(1, ...arguments)"
        >
          <template slot="name" slot-scope="{ row }">
            <TimejobClickText :id="row.id" :editObj="row" @refreshTableList="getTableDataList(1, 20)"></TimejobClickText>
          </template>
          <template slot="isActive" slot-scope="{ row }">
            <span>{{ getActiveName(row.isActive) }}</span>
          </template>
          <template slot="cron" slot-scope="{ row }">
            <div>
              <TsQuartz :value="row.cron" showType="read"></TsQuartz>
            </div>
          </template>
          <template slot="autoexecCombopName" slot-scope="{ row }">
            <span class="text-href" @click="toActionDetail(row)">{{ row.autoexecCombopName }}</span>
          </template>
          <template slot="execCount" slot-scope="{ row }">
            <span :class="{'text-href': row.execCount > 0}" @click="toRecord(row)">{{ row.execCount }}</span>
          </template>
          <template slot="jobStatus" slot-scope="{ row }">
            <div v-if="!$utils.isEmpty(row.jobStatus)">
              <div>
                <span class="text-grey">{{ $t('term.autoexec.starttoexecute') }}</span>
                <span>{{ row.jobStatus.execCount || '0' }}???</span>
              </div>
              <div v-if="row.jobStatus.beginTime != null">
                <span class="text-grey">{{ $t('term.autoexec.planstarttime') }}???</span>
                <span>{{ row.jobStatus.beginTime | formatDate }}</span>
              </div>
              <div v-if="row.jobStatus.endTime != null">
                <span class="text-grey">{{ $t('term.autoexec.planendtime') }}???</span>
                <span>{{ row.jobStatus.endTime | formatDate }}</span>
              </div>
              <div v-if="row.jobStatus.lastFireTime != null">
                <span class="text-grey">{{ $t('term.autoexec.lastactivetime') }}???</span>
                <span>{{ row.jobStatus.lastFireTime | formatDate }}</span>
              </div>
              <div v-if="row.jobStatus.lastFinishTime != null">
                <span class="text-grey">{{ $t('term.autoexec.lastcompletetime') }}???</span>
                <span>{{ row.jobStatus.lastFinishTime | formatDate }}</span>
              </div>
              <div v-if="row.jobStatus.nextFireTime != null">
                <span class="text-grey">{{ $t('page.nextactivationtime') }}???</span>
                <span>{{ row.jobStatus.nextFireTime | formatDate }}</span>
              </div>
            </div>
          </template>
          <template slot="action" slot-scope="{ row }">
            <div class="tstable-action">
              <ul v-if="row.editable" class="tstable-action-ul">
                <li :title="!row.editable ? $t('page.notauthrelationadmin') : ''" @click.stop>
                  <TsFormSwitch
                    v-model="row.isActive"
                    :true-value="1"
                    :false-value="0"
                    :disabled="!row.editable ? true : false"
                    showStatus
                    @on-change="toggleAction(row)"
                  ></TsFormSwitch>
                </li>
                <li
                  class="icon tsfont-trash-o"
                  :title="!row.deletable ? $t('page.notauthrelationadmin') : ''"
                  :class="{ disable: !row.deletable }"
                  @click.stop="deleteRow(row.id, row.deletable)"
                >
                  <!-- ?????? -->
                  {{ $t('page.delete') }}
                </li>
                <li
                  v-if="row.execCount > 0"
                  class="ts-page"
                  :title="$t('term.autoexec.executionrecord')"
                  @click="showAudit(row.uuid)"
                >
                  <!-- ???????????? -->
                  {{ $t('term.autoexec.executionrecord') }}
                </li>
              </ul>
            </div>
          </template>
        </TsTable>
      </template>
    </TsContain>
    <!-- ???????????? -->
    <RecordList
      v-if="isShowRecord"
      :id="autoexecCombopId"
      :scheduleId="scheduleId"
      :isShowRecord="isShowRecord"
      @close="isShowRecord = false"
    ></RecordList>
    <JobAudit v-if="isAuditShow" :jobUuid="currentJobUuid" @close="closeAuditDialog"></JobAudit>
  </div>
</template>

<script>
export default {
  name: 'TimeJobList',
  components: {
    TimejobClickText: resolve => require(['./job/time-job-click-text.vue'], resolve),
    TsQuartz: resolve => require(['@/resources/plugins/TsQuartz/TsQuartz.vue'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    RecordList: resolve => require(['./action/record-list'], resolve), // ??????????????????
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    JobAudit: resolve => require(['../../framework/schedule/job-audit-dialog.vue'], resolve)
  },
  filters: {},
  props: {},
  data() {
    let _this = this;
    return {
      autoexecCombopId: null, // ????????????ID
      scheduleId: null, // ????????????ID
      isShowRecord: false, // ??????????????????????????????false??????????????????true??????
      loadingShow: false,
      currentJobUuid: null,
      isAuditShow: false, // ??????????????????
      handlerSelectSetting: {
        type: 'select',
        name: 'autoexecCombopId',
        value: '',
        defaultValue: '', //?????????
        placeholder: this.$t('term.autoexec.combinationtool'), // ????????????
        multiple: false,
        search: true, // ????????????
        isNowrap: true, // ?????????
        dynamicUrl: '/api/rest/autoexec/combop/list',
        valueName: 'id', //option?????????
        textName: 'name', //text?????????
        rootName: 'tbodyList',
        onChange: function(val) {
          _this.getTableDataList(1, 20, '', val || null);
        }
      }, // ?????????????????????????????????
      tableData: {
        theadList: [
          // ????????????????????????
          { key: 'name', title: _this.$i18n.t('page.name') }, // ??????
          { key: 'isActive', title: _this.$i18n.t('page.status') }, // ??????
          { key: 'cron', title: this.$t('term.autoexec.timingplan') }, // cron?????????
          { key: 'autoexecCombopName', title: this.$t('term.autoexec.relatecombinationtool') }, // ??????????????????
          { key: 'execCount', title: this.$t('term.autoexec.executecount') }, // ????????????
          { key: 'lcuVo', title: this.$t('page.fcu'), type: 'user' }, // ?????????
          { key: 'lcd', title: this.$t('page.fcd'), type: 'time' }, // ????????????
          { key: 'jobStatus', title: this.$t('term.autoexec.executionsituation') }, 
          { key: 'action' }
        ],
        tbodyList: [],
        pageSize: 20,
        currentPage: 1,
        keyword: '', // ?????????
        autoexecCombopId: null // ????????????id
      }
    };
  },
  beforeCreate() {},
  created() {
    let query = this.$route.query;
    if (query && query.id) {
      let autoexecCombopId = query.id; // ????????????id
      this.$set(this.tableData, 'autoexecCombopId', autoexecCombopId);
      this.getTableDataList(1, 20, '', autoexecCombopId);
    } else {
      this.getTableDataList(1);
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
    getTableDataList(currentPage, pageSize, keyword, autoexecCombopId) {
      this.tableData.pageSize = pageSize || this.tableData.pageSize;
      this.tableData.currentPage = currentPage || this.tableData.currentPage;
      // ??????????????????????????????
      let params = {
        pageSize: pageSize || this.tableData.pageSize,
        currentPage: currentPage || this.tableData.currentPage,
        keyword: keyword || this.tableData.keyword, // ?????????
        autoexecCombopId: parseInt(autoexecCombopId || this.tableData.autoexecCombopId) // ????????????ID
      };
      this.loadingShow = true;
      this.$api.autoexec.timeJob.getTimeJobList(params).then(res => {
        if (res.Status == 'OK') {
          this.loadingShow = false;
          this.tableData = Object.assign(this.tableData, res.Return);
        }
      });
    },
    deleteRow(id, isDelete) {
      // ????????????????????????id????????????????????????
      if (!id || !isDelete) {
        return;
      }

      this.$createDialog({
        title: this.$i18n.t('page.warning'), // ??????
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('term.autoexec.scheduledtask')}), // ??????????????????????????????????
        btnType: 'error',
        'on-ok': vnode => {
          let params = {
            id: id
          };
          this.$api.autoexec.timeJob.deleteTimeJob(params).then(res => {
            if (res.Status == 'OK') {
              this.getTableDataList(); // ?????????????????????????????????
              this.$Message.success(this.$i18n.t('message.content.deletesuccess')); // ????????????
            }
          });
          vnode.isShow = false;
        }
      });
    },
    getActiveName(num) {
      // num 1???????????????0 ????????????
      return num == 1 ? this.$t('page.enable') : this.$t('page.disable');
    },
    toActionDetail(row) {
      // ???????????????????????????????????????
      if (row && row.autoexecCombopId) {
        this.$router.push({
          path: '/action-detail',
          query: {
            id: row.autoexecCombopId
          }
        });
      }
    },
    toRecord(row) {
      // ??????????????????
      if (row && row.execCount) {
        this.autoexecCombopId = row.autoexecCombopId;
        this.scheduleId = row.id;
        this.isShowRecord = true;
      }
    },
    toggleAction(row) {
      // ????????????
      this.$api.autoexec.timeJob
        .toggleAction({ id: row.id })
        .then(res => {
          if (res.Status == 'OK') {
            row.isActive = res.Return.isActive;
            this.$Message.success(this.$t('message.content.executesuccess'));
          }
        })
        .catch(error => {
          row.isActive = row.isActive ? 0 : 1;
        });
    }, showAudit(jobUuid) {
      this.isAuditShow = true;
      this.currentJobUuid = jobUuid;
    },
    closeAuditDialog() {
      this.isAuditShow = false;
      this.currentJobUuid = null;
    }
  },
  computed: {},
  watch: {}
};
</script>

<style lang="less"></style>
