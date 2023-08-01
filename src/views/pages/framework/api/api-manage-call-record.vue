<template>
  <div>
    <TsDialog
      :isShow="isShow"
      :title="$t('term.framework.apirecord')"
      type="slider"
      width="large"
      :hasFooter="false"
      :maskClose="true"
      @on-close="handleVisibleChange"
    >
      <Loading :loadingShow="isLoading" type="fix"></Loading>
      <div class="search-box">
        <TsRow>
          <Col :span="rangeTime.startTime ? 8 : 4">
            <TimeSelect
              v-model="rangeTime"
              v-bind="timeHandlerConfig"
              @change="changeSearchParam"
            ></TimeSelect>
          </Col>
          <Col span="8">
            <TsFormSelect
              v-model="statusList"
              :clearable="false"
              :dataList="statusDataList"
              @on-change="changeSearchParam"
            ></TsFormSelect>
          </Col>
          <Col span="8">
            <UserSelect
              v-model="userUuidList"
              :multiple="false"
              :groupList="['user']"
              @on-change="changeSearchParam"
            ></UserSelect>
          </Col>
        </TsRow>
      </div>
      <TsTable
        :theadList="theadList"
        v-bind="tableConfig"
        @changeCurrent="currentPage=>getCallRecord({currentPage})"
        @changePageSize="pageSize=>getCallRecord({pageSize})"
      >
        <template v-slot:startTime="{row}">
          <div>{{ row.startTime | formatDate }}</div>
        </template>
        <template v-slot:status="{row}">
          <span v-if="row.status==='succeed'" class="text-success">{{ $t('page.success') }}</span>
          <span v-else class="text-danger">{{ $t('page.fail') }}</span>
        </template>
        <template v-slot:action="{row}">
          <div class="tstable-action">
            <ul class="tstable-action-ul">
              <li v-if="row.paramFilePath" @click="getCallDetail(row.paramFilePath,$t('page.param'))">{{ $t('page.param') }}</li>
              <li v-if="row.resultFilePath" @click="getCallDetail(row.resultFilePath,$t('page.result'))">{{ $t('page.result') }}</li>
              <li v-if="row.errorFilePath" @click="getCallDetail(row.errorFilePath,$t('page.exception'))">{{ $t('page.exception') }}</li>
            </ul>
          </div>
        </template>
      </TsTable>
      
    </TsDialog>
    <TsDialog :isShow.sync="isCallDetailShow" v-bind="dialogConfig" @on-close="close">
      <template v-slot:header>
        详细内容
      </template>
      <template v-slot><pre>{{ callDetail }}</pre></template>
      <template v-slot:footer>
        <Button @click="close()">取消</Button>
        <Button v-if="hasMore" v-download="auditDetailDownloadParams" type="primary">下载</Button>
      </template>
    </TsDialog>
  </div>
</template>

<script>
import download from '@/resources/directives/download.js';
export default {
  name: 'CallRecord',
  directives: {download},
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve),
    TimeSelect: resolve => require(['@/resources/components/TimeSelect/TimeSelect.vue'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    UserSelect: resolve => require(['@/resources/components/UserSelect/UserSelect.vue'], resolve)
  },
  props: {
    isShow: {
      type: Boolean,
      required: true
    },
    rowData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      isLoading: false,
      theadList: Object.freeze([
        { title: this.$t('page.address'), key: 'token', width: 250 },
        { title: this.$t('page.username'), key: 'userName', width: 150 },
        { title: 'IP', key: 'ip', width: 150 },
        { title: this.$t('term.framework.calltime'), key: 'startTime', width: 200 },
        { title: this.$t('page.timecost') + '(' + this.$t('page.ms') + ')', key: 'timeCost', width: 100 },
        { title: this.$t('page.status'), key: 'status', width: 100 },
        { title: '', key: 'action', align: 'right', width: 10}
      ]),
      tableConfig: {
        tbodyList: [],
        pageSize: 20,
        currentPage: 1,
        pageCount: 1,
        rowNum: null
      },
      searchParams: {
        token: null,
        currentPage: 1,
        pageSize: 20
      },
      callDetail: null,
      paramType: null,
      hasMore: false,
      filePath: null,
      isCallDetailShow: false,
      dialogConfig: {
        type: 'slider',
        maskClose: true,
        width: 'medium'
      },
      timeHandlerConfig: {//时间选择器的数据
        border: 'border',
        placement: 'bottom-start',
        clearable: false,
        transfer: true,
        width: '100%',
        type: 'datetimerange',
        format: 'yyyy-MM-dd HH:mm:ss'

      },
      rangeTime: {
        timeRange: '1',
        timeUnit: 'day'
      },
      statusDataList: [
        {
          text: this.$t('page.allstatus'),
          value: 'all'
        }
      ],
      statusList: ['all'],
      userUuidList: [] // 用户
    };
  },
  created() {
    this.getStatusList();
  },
  mounted() {
    this.handleVisibleChange(true);
  },
  methods: {
    // 处理调用记录抽屉的开关
    handleVisibleChange(visible) {
      if (visible === true) {
        this.getCallRecord({token: this.rowData.token});
      } else {
        this.tableConfig = {};
        this.searchParams = {
          token: null,
          currentPage: 1,
          pageSize: 20,
          timeRange: '1',
          timeUnit: 'day',
          statusList: ['all'],
          userUuidList: []
        };
        this.$emit('on-hide', visible);
      }
    },
    // 获取调用记录列表
    getCallRecord(params) {
      this.isLoading = true;
      this.searchParams = {
        ...this.searchParams,
        ...params,
        ...this.rangeTime,
        userUuidList: (typeof this.userUuidList == 'string' && this.userUuidList) ? [this.userUuidList] : [], // 用户
        statusList: this.statusList.includes('all') ? [] : [this.statusList] // 状态
      };
      return this.$api.framework.apiManage
        .getCallRecord(this.searchParams)
        .then(res => {
          if (res.Status === 'OK') {
            this.tableConfig = res.Return;
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    // 获取调用详情
    getCallDetail(filePath, paramType) {
      this.callDetail = this.$t('page.loadingtip');
      this.isCallDetailShow = true;
      this.filePath = filePath;
      this.paramType = paramType;
      const params = { filePath };
      this.$api.framework.apiManage
        .getApiManageAuditDetail(params)
        .then(res => {
          if (res.Status === 'OK') {
            this.hasMore = res.Return.hasMore;
            try {
              this.callDetail = JSON.stringify(JSON.parse(res.Return.content), null, 2);
            } catch {
              this.callDetail = res.Return.content;
            }
          }
        })
        .catch(error => {
          this.callDetail = this.$t('message.framework.calldetailerror');
          this.filePath = null;
          this.hasMore = false;
        });
    },
    changeSearchParam() { //改变搜索条件
      this.getCallRecord({token: this.rowData.token, currentPage: 1});
    },
    getStatusList() { //状态选择下拉列表
      let data = {
        enumClass: 'neatlogic.framework.restful.enums.ApiInvokedStatus'
      };
      this.$api.common.getSelectList(data).then((res) => {
        if (res.Status == 'OK') {
          let list = res.Return || [];
          list.length > 0 && (this.statusDataList.push(...list));
        }
      });
    },
    close() {
      this.isCallDetailShow = false;
      this.filePath = null;
      this.hasMore = false;
      this.$emit('close');
    }
  },
  computed: {
    auditDetailDownloadParams() {
      return {
        url: 'api/binary/apimanage/audit/detail/download',
        param: {
          filePath: this.filePath
        }
      };
    }
  }
};
</script>
<style lang="less" scoped>
.search-box{
  padding-bottom: 16px;
}
</style>
