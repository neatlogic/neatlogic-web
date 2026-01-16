<template>
  <div>
    <TsContain>
      <template slot="topLeft">
        <!-- <div class="action-group">
          <span v-auth="['ADMIN']" class="action-item">
            <AuditConfig auditName="LOGIN-AUDIT" :title="$t('term.framework.loginauditretentionperiod')"></AuditConfig>
          </span>
        </div> -->
      </template>
      <template slot="topRight">
        <TsRow>
          <Col :span="6">
            <div v-auth="['USER_EXPORT_FILE_MODIFY']">
              <span class="mr-xs text-grey">查看所有用户数据</span>
              <span>
                <i-switch
                  v-model="isShowAllUser"
                  :true-value="1"
                  :false-value="0"
                  @on-change="handleSwitchChange(1)"
                ></i-switch>
              </span>
            </div>
          </Col>
          <Col :span="18">
            <CombineSearcher
              v-model="searchValue"
              v-bind="searchConfig"
              @change="changePage(1)"
            ></CombineSearcher>
          </Col>
        </TsRow>
      </template>
      <div slot="content">
        <TsTable
          v-if="tableData"
          v-bind="tableData"
          :theadList="theadList"
          @changeCurrent="changePage"
          @changePageSize="changePageSize"
        >
          <template v-slot:status="{ row }">
            <div>
              <div v-if="row.status == 'doing'" style="width: 42px">
                <Progress
                  :percent="99"
                  :stroke-width="10"
                  status="active"
                  :hide-info="true"
                ></Progress>
              </div>
              <div v-else-if="row.status == 'failed'">
                <div v-if="row.error">
                  <span>{{ row.statusText }}</span>
                  <Poptip :transfer="true" placement="right" trigger="hover">
                    <i class="tsfont-warning-s text-error"></i>
                    <div slot="content">
                      {{ row.error }}
                    </div>
                  </Poptip>
                </div>
                <div v-else>{{ row.statusText }}</div>
              </div>
              <div v-else>
                {{ row.statusText }}
              </div>
            </div>
          </template>
          <template v-slot:timeCost="{ row }">
            <span v-if="row.endTime != null && row.startTime != null">
              {{ row.endTime - row.startTime }}
            </span>
            <span v-else>-</span>
          </template>
          <template v-slot:action="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li v-if="row.status == 'done' && !isExportRunning" class="tsfont-download" @click="downloadUserExportFile(row)">{{ $t('page.download') }}</li>
                <li v-if="row.status != 'doing'" class="tsfont-trash-o" @click="deleteUserExportFile(row)">{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
    </TsContain>
  </div>
</template>
<script>
import download from '@/resources/mixins/download.js';
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    CombineSearcher: () => import('@/resources/components/CombineSearcher/CombineSearcher.vue')
  },
  mixins: [download],
  props: {},
  data() {
    return {
      timmer: null,
      isShowAllUser: 0,
      defaultSearchList: [
        {
          type: 'timeselect',
          name: 'dateRange',
          label: this.$t('page.date'),
          transfer: true
        }
      ],
      hasAllUserAuthSearchList: [
        {
          type: 'timeselect',
          name: 'dateRange',
          label: this.$t('page.date'),
          transfer: true
        },
        {
          type: 'userselect',
          name: 'userUuid',
          label: this.$t('page.user'),
          groupList: ['user'],
          transfer: true,
          multiple: false,
          hide: true
        }
      ],
      searchConfig: {
        search: true,
        placeholder: this.$t('form.placeholder.pleaseinput', { target: this.$t('page.keyword') }),
        searchList: []
      },
      searchValue: {
        dateRange: { // 日期默认查询一月
          timeRange: '1',
          timeUnit: 'month'
        }
      },
      isExportRunning: false,
      searchParam: {
        keyword: '',
        currentPage: 1,
        pageSize: 20,
        timeRange: null,
        timeUnit: '',
        startTime: null,
        endTime: null,
        isAll: 0,
        userUuid: ''
      },
      timeParams: {
        timeRange: 1,
        timeUnit: 'day',
        startTime: null,
        endTime: null
      },
      defaultTheadList: [
        { key: 'name', title: this.$t('page.name') },
        { key: 'status', title: this.$t('page.status') },
        { key: 'sizeText', title: this.$t('page.size') },
        { key: 'startTime', title: this.$t('page.starttime'), type: 'time' },
        { key: 'endTime', title: this.$t('page.endtime'), type: 'time' },
        { key: 'timeCost', title: this.$t('page.timecost') },
        { key: 'action' }
      ],
      hasAllUserAuthTheadList: [
        { key: 'name', title: this.$t('page.name') },
        { key: 'status', title: this.$t('page.status') },
        { key: 'sizeText', title: this.$t('page.size') },
        { key: 'startTime', title: this.$t('page.starttime'), type: 'time' },
        { key: 'endTime', title: this.$t('page.endtime'), type: 'time' },
        { key: 'timeCost', title: this.$t('page.timecost') },
        { key: 'userUuid', title: this.$t('page.uploaduser'), type: 'user' },
        { key: 'action' }
      ],
      theadList: [],
      tableData: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchConfig.searchList = this.defaultSearchList;
    this.theadList = this.defaultTheadList;
    this.searchUserExportFileList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    if (this.timmer) {
      clearTimeout(this.timmer);
      this.timmer = null;
    }
  },
  destroyed() {
  },
  methods: {
    doingStatusRefresh(idList) {
      if (this.timmer) {
        clearTimeout(this.timmer);
        this.timmer = null;
      }
      this.$api.framework.userexportfile.searchUserExportFileList({defaultValue: idList}).then(res => {
        if (res.Status == 'OK') {
          let tbodyList = res.Return.tbodyList;
          if (tbodyList && tbodyList.length > 0) {
            tbodyList.forEach(item => {
              if (item.status != 'doing' && this.tableData && this.tableData.tbodyList && this.tableData.tbodyList.length > 0) {
                const element = this.tableData.tbodyList.find(tbody => tbody.id === item.id);
                if (element) {
                  this.$set(element, 'path', item.path);
                  this.$set(element, 'size', item.size);
                  this.$set(element, 'sizeText', item.sizeText);
                  this.$set(element, 'status', item.status);
                  this.$set(element, 'statusText', item.statusText);
                  this.$set(element, 'error', item.error);
                  this.$set(element, 'endTime', item.endTime);
                }
              }
            });
          }
          let doingIdList = [];
          if (this.tableData && this.tableData.tbodyList && this.tableData.tbodyList.length > 0) {
            this.tableData.tbodyList.forEach(item => {
              if (item.status == 'doing') {
                doingIdList.push(item.id);
              }
            });
          }
          if (doingIdList.length > 0) {
            this.timmer = setTimeout(() => {
              this.doingStatusRefresh(doingIdList);
            }, 5000);
          }
        }
      });
    },
    searchUserExportFileList() {
      if (this.timmer) {
        clearTimeout(this.timmer);
        this.timmer = null;
      }
      if (this.searchValue) {
        if (this.searchValue.keyword) {
          this.searchParam.keyword = this.searchValue.keyword;
        } else {
          this.searchParam.keyword = null;
        }
        if (this.searchValue.dateRange) {
          if (this.searchValue.dateRange.timeRange) {
            this.searchParam.timeRange = this.searchValue.dateRange.timeRange;
          } else {
            this.searchParam.timeRange = null;
          }
          if (this.searchValue.dateRange.timeUnit) {
            this.searchParam.timeUnit = this.searchValue.dateRange.timeUnit;
          } else {
            this.searchParam.timeUnit = null;
          }
          if (this.searchValue.dateRange.startTime) {
            this.searchParam.startTime = this.searchValue.dateRange.startTime;
          } else {
            this.searchParam.startTime = null;
          }
          if (this.searchValue.dateRange.endTime) {
            this.searchParam.endTime = this.searchValue.dateRange.endTime;
          } else {
            this.searchParam.endTime = null;
          }
        } else {
          this.searchParam.timeRange = null;
          this.searchParam.timeUnit = null;
          this.searchParam.startTime = null;
          this.searchParam.endTime = null;
        }
        if (this.searchValue.userUuid) {
          this.searchParam.userUuid = this.searchValue.userUuid;
        } else {
          this.searchParam.userUuid = null;
        }
      }
      this.searchParam.isAll = this.isShowAllUser;
      this.$api.framework.userexportfile.searchUserExportFileList(this.searchParam).then(res => {
        if (res.Status == 'OK') {
          let unreadIdList = [];
          let doingIdList = [];
          this.tableData = res.Return;
          if (this.tableData && this.tableData.tbodyList && this.tableData.tbodyList.length > 0) {
            this.tableData.tbodyList.forEach(item => {
              if (item.isRead == 0) {
                unreadIdList.push(item.id);
              }
              if (item.status == 'doing') {
                doingIdList.push(item.id);
              }
            });
          }
          if (unreadIdList.length > 0) {
            this.$api.framework.userexportfile.updateUserExportFileIsRead({idList: unreadIdList});
          }
          if (doingIdList.length > 0) {
            this.timmer = setTimeout(() => {
              this.doingStatusRefresh(doingIdList);
            }, 5000);
          }
        }
      });
    },
    changePage(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      } else {
        this.searchParam.currentPage = 1;
      }
      this.searchUserExportFileList();
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchParam.currentPage = 1;
      this.searchUserExportFileList();
    },
    deleteUserExportFile(row) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', { target: this.$t('page.file') }),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.framework.database.exportUserExportFile({id: row.id}).then(res => {
            if (res.Status == 'OK') {
              this.searchUserExportFileList();
              vnode.isShow = false;
            }
          });
        }
      });
    },
    downloadUserExportFile(row) {
      let param = {
        url: 'api/binary/user/exportfile/export',
        params: {
          id: row.id
        },
        changeStatus: status => {
          if (status == 'start') {
            this.isExportRunning = true;
          } else if (status == 'success' || status == 'error') {
            this.isExportRunning = false;
          }
        }
      };
      this.download(param);
    },
    handleSwitchChange() {
      if (this.isShowAllUser == 1) {
        this.searchConfig.searchList = this.hasAllUserAuthSearchList;
        this.theadList = this.hasAllUserAuthTheadList;
      } else {
        this.searchConfig.searchList = this.defaultSearchList;
        this.theadList = this.defaultTheadList;
        this.searchValue.userUuid = null;
      }
      this.changePage(1);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
