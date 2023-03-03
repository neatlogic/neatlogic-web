<template>
  <div class="integration-audit-box">
    <TsDialog
      v-if="auditData"
      :is-show="isShow"
      v-bind="dialogConfig"
      @on-close="close"
    >
      <template v-slot>
        <Row class="mb-md">
          <Col span="8">
          </Col>
          <Col span="4">
            <UserSelect
              v-model="userSelectSetting.value"
              v-bind="userSelectSetting"
              class="mr-md bg-op radius-sm"
              style="white-space: nowrap;"
              @change="handleChange"
            ></UserSelect>
          </Col>
          <Col span="4">
            <TsFormSelect
              v-model="selectSetting.value"
              class="mr-md bg-op radius-sm"
              v-bind="selectSetting"
              @change="handleChange"
            ></TsFormSelect>
          </Col>
          <Col span="8">
            <TimeSelect
              v-model="timeSelectSetting.value"
              class="bg-op radius-sm"
              v-bind="timeSelectSetting"
              @change="handleChange"
            ></TimeSelect>
          </Col>
        </Row>
        <div
          ref="tableMain"
        >
          <TsTable
            v-if="auditData"
            v-bind="auditData"
            :height="tableHeight"
            @changeCurrent="searchAudit"
            @changePageSize="pageSize => searchAudit(1, pageSize)"
          >
            <template slot="startTime" slot-scope="{ row }">
              {{ row.startTime|formatDate }}
            </template>
            <template slot="endTime" slot-scope="{ row }">
              {{ row.endTime|formatDate }}
            </template>
            <template slot="timeCost" slot-scope="{ row }">
              {{ row.timeCost|formatTimeCost }}
            </template>
            <template slot="status" slot-scope="{ row }">
              {{ statusData[row.status] }}
            </template>
            <template slot="param" slot-scope="{ row }">
              <a v-if="row.paramFilePath" href="#" @click="showAuditDetail(row.paramFilePath)">查看参数</a>
              <span v-if="!row.paramFilePath">-</span>
            </template>
            <template slot="result" slot-scope="{ row }">
              <a v-if="row.resultFilePath" href="#" @click="showAuditDetail(row.resultFilePath)">查看结果</a>
              <span v-if="!row.resultFilePath">-</span>
            </template>
            <template slot="error" slot-scope="{ row }">
              <a v-if="row.errorFilePath" href="#" @click="showAuditDetail(row.errorFilePath)">查看异常</a>
              <span v-if="!row.errorFilePath">-</span>
            </template>
            <template slot="action" slot-scope="{ row }">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li @click.stop>
                    <i-switch
                      v-model="row.isActive"
                      :true-value="1"
                      :false-value="0"
                      @on-change="toggleIntegrationActive(row)"
                    ></i-switch>
                    <span class="actionText" v-html="row.isActive == 1 ? '已激活' : '已禁用'"></span>
                  </li>
                  <li v-if="row.hasHelp == 1">
                    <IntegrationHelp :integration="row"></IntegrationHelp>
                  </li>
                  <li class="tsfont-edittext" @click="editIntegration(row.uuid)">编辑</li>
                  <li class="tsfont-close-o" @click="delIntegration(row.uuid)">删除</li>
                </ul>
              </div>
            </template>
          </TsTable>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="close()">取消</Button>
      </template>
    </TsDialog>
    <IntegrationAuditDetail :filePath="filePath" @close="closeAuditDetailDialog"></IntegrationAuditDetail>
  </div>
</template>
<script>
import UserSelect from '@/resources/components/UserSelect/UserSelect.vue';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import TimeSelect from '@/resources/components/TimeSelect/TimeSelect.vue';
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    IntegrationAuditDetail: resolve => require(['./integration-audit-detail.vue'], resolve),
    UserSelect,
    TsFormSelect,
    TimeSelect
  },
  props: {
    uuid: {type: String}
  },
  data() {
    return {
      isShow: false,
      filePath: null,
      detailData: {},
      auditData: {},
      contentHeight: '100',
      statusData: {'succeed': '成功', 'failed': '失败'},
      userSelectSetting: {
        // 用户选择
        groupList: ['user'],
        value: '',
        multiple: false,
        transfer: true,
        placeholder: '用户'
      },
      selectSetting: {
        // 状态下拉
        defaultValueIsFirst: true, // 默认选中第一个
        dataList: [],
        transfer: true,
        placeholder: '状态',
        value: ''
      },
      timeSelectSetting: {
        // 时间范围
        format: 'yyyy-MM-dd HH:mm:ss',
        type: 'datetimerange',
        clearable: false,
        value: {
          timeRange: '1',
          timeUnit: 'day'
        }
      },
      dialogConfig: {
        type: 'slider',
        maskClose: true,
        isShow: false,
        title: '访问审计',
        width: '1000px',
        isScrollbar: true
      },
      theadList: [
        {
          title: '用户',
          key: 'userName'
        },
        {
          title: '请求来源',
          key: 'requestFrom'
        },
        {
          title: '状态',
          key: 'status'
        },
        {
          title: '开始时间',
          key: 'startTime'
        },
        {
          title: '结束时间',
          key: 'endTime'
        },
        {
          title: '耗时',
          key: 'timeCost'
        },
        {
          title: '参数',
          key: 'param'
        },
        {
          title: '结果',
          key: 'result'
        },
        {
          title: '异常',
          key: 'error'
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getStatusList();
    this.searchAudit();
    let _this = this;
    window.addEventListener('resize', _this.initHeight);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    let _this = this;
    window.removeEventListener('resize', _this.initHeight);
  },
  destroyed() {},
  methods: {
    getStatusList() {
      // 获取状态列表
      this.$api.framework.integration.getStatusList({ enumClass: 'neatlogic.framework.restful.enums.IntegrationAuditStatus', needPage: false }).then((res) => {
        if (res.Status == 'OK') {
          this.selectSetting.dataList = res.Return || [];
          this.selectSetting.dataList.unshift({
            text: '所有状态',
            value: 'all'
          });
        }
      });
    },
    handleChange() {
      // 搜索条件下拉
      this.searchAudit(1);
    },
    
    close: function() {
      this.isShow = false;
      this.userSelectSetting.value = '';
      this.timeSelectSetting.value = '';
      this.selectSetting.value = '';
      this.$emit('close');
    },
    searchAudit: function(currentPage, pageSize) {
      let params = {integrationUuid: this.uuid};
      if (currentPage) {
        params['currentPage'] = currentPage;
      }
      if (pageSize) {
        params['pageSize'] = pageSize;
      } else {
        params['pageSize'] = this.auditData.pageSize || 20;
      } 
      params.userUuidList = this.userSelectSetting.value ? [this.userSelectSetting.value] : []; // 用户
      params.statusList = this.selectSetting.value ? (this.selectSetting.value == 'all' ? [] : [this.selectSetting.value]) : []; // 状态
      if (!this.timeSelectSetting.value) {
        // 为空设置默认值
        this.timeSelectSetting.value = {
          timeRange: '1',
          timeUnit: 'day'
        };
      }
      Object.assign(params, this.timeSelectSetting.value);
      this.$api.framework.integration.searchIntegrationAudit(params).then(res => {
        if (res.Status == 'OK') {
          this.auditData = res.Return;
          this.auditData.theadList = this.theadList;
          this.isShow = true;
          this.initHeight();
        }
      });
    },
    showAuditDetail: function(filePath) {
      this.isAuditDetailShow = true;
      this.filePath = filePath;
    },
    closeAuditDetailDialog: function() {
      this.filePath = null;
    },
    initHeight() {
      this.$nextTick(() => {
        this.contentHeight = window.innerHeight - (this.$refs.tableMain ? this.$refs.tableMain.getBoundingClientRect().top : 0);
      });
    }
  },
  filter: {},
  computed: {
    tableHeight() {
      // 57 底部取消按钮高度，24padding的高度，38表格表头高度，44分页高度
      let height = this.contentHeight - 57 - 24 - 38 - 44;
      return height + 'px';
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
