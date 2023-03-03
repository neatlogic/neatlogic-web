<template>
  <div>
    <TsContain>
      <Loading :loadingShow="isLoading" type="fix"></Loading>
      <template v-slot:topLeft>
        <span class="text-action tsfont-plus" @click="toJobWebhookAdd">配置</span>
      </template>
      <template v-slot:topRight>
        <InputSearcher
          v-model="searchParam.keyword"
          placeholder="名称"
          @change="searchKeyword"
        ></InputSearcher>
      </template>
      <template v-slot:content>
        <TsTable
          :theadList="theadList"
          v-bind="tableConfig"
          @changeCurrent="changeCurrent"
          @changePageSize="changePageSize"
        >
          <template slot="name" slot-scope="{row}">
            <span v-if="row && row.name" class="text-href" @click="toJobWebhookEdit(row)">{{ row.name }}</span>
          </template>
          <template slot="isActive" slot-scope="{row}">
            <TsFormSwitch
              v-model="row.isActive"
              :trueValue="1"
              :falseValue="0"
              @on-change="(isActive) => switchChange(row, isActive)"
            ></TsFormSwitch>
          </template>
          <template slot="jobStatusList" slot-scope="{row}">
            <template v-if="row && row.jobStatusList && row.jobStatusList.length > 0">
              <CommonStatus
                v-for="(item, index) in row.jobStatusList"
                v-show="index < 3"
                :key="index"
                :statusValue="item.name"
                :statusName="item.text"
                class="pr-xs cursor"
                type="block"
              ></CommonStatus>
              <Poptip
                v-if="row.jobStatusList.length > 3"
                word-wrap
                width="400"
                trigger="hover"
                placement="top"
              >
                <span class="tsfont-option-horizontal text-href"></span>
                <div slot="content" class="status-grid">
                  <div
                    v-for="(item, index) in row.jobStatusList"
                    :key="index"
                    style="text-align:center;display:inline-block;"
                  ><CommonStatus
                    :statusValue="item.name"
                    :statusName="item.text"
                    class="pr-xs cursor"
                    type="block"
                  ></CommonStatus></div>
                </div>
              </Poptip>
            </template>
          </template>
          <template slot="action" slot-scope="{row, index}">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-history" @click.stop="openExecutionRecord(row)">执行记录</li>
                <li class="tsfont-trash-o" @click.stop="delJobWebhook(row, index)">删除</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </template>
    </TsContain>
    <ExecutionRecordDialog
      v-if="isShowExecutionRecordDialog"
      :id="id"
      :title="dialogTitle"
      @close="isShowExecutionRecordDialog = false"
    ></ExecutionRecordDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    CommonStatus: resolve => require(['@/resources/components/Status/CommonStatus.vue'], resolve),
    ExecutionRecordDialog: resolve => require(['./execution-record-dialog'], resolve) // 执行记录
  },
  props: {},
  data() {
    return {
      id: null,
      dialogTitle: '',
      isLoading: false,
      isShowExecutionRecordDialog: false,
      tableConfig: {},
      searchParam: {
        keyword: '',
        currentPage: 1,
        pageSize: 20
      },
      theadList: [
        {
          title: '名称',
          key: 'name'
        },
        {
          title: '激活',
          key: 'isActive'
        },
        {
          title: '触发状态',
          key: 'jobStatusList'
        },
        {
          title: '集成动作',
          key: 'integrationName'
        },
        { 
          title: '修改人', 
          key: 'fcuVo', 
          type: 'user'
        },
        { 
          title: '修改时间', 
          key: 'lcd', 
          type: 'time'
        },
        {
          key: 'action'
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.searchJobWebhook();
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
    changeCurrent(currentPage) {
      this.searchJobWebhook(currentPage);
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchJobWebhook(1);
    },
    toJobWebhookAdd() {
      this.$router.push({
        path: '/job-webhook-edit'
      });
    },
    toJobWebhookEdit(row) {
      if (row && row.id) {
        this.$router.push({
          path: '/job-webhook-edit',
          query: {id: row.id}
        });
      }
    },
    searchKeyword(keyword) {
      this.searchParam.keyword = keyword;
      this.searchJobWebhook(1);
    },
    searchJobWebhook(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      this.$addHistoryData('searchParam', this.searchParam);
      this.isLoading = true;
      this.$api.deploy.webhook.searchJobWebhookList(this.searchParam).then((res) => {
        if (res && res.Status == 'OK') {
          this.tableConfig = res.Return;
        }
      }).finally(() => {
        this.isLoading = false;
      });
    },
    delJobWebhook(row, index) {
      if (row && !row.id) {
        return false;
      }
      this.$createDialog({
        title: '警告',
        content: `确认删除：${row.name || ''}?`,
        okText: '删除',
        btnType: 'error',
        'on-ok': (vnode) => {
          this.$api.deploy.webhook.delJobWebhookById({id: row.id}).then((res) => {
            if (res && res.Status == 'OK') {
              this.$Message.success(this.$t('message.content.deletesuccess'));
              if (this.tableConfig && this.tableConfig.tbodyList && this.tableConfig.tbodyList.length > 0) {
                this.tableConfig.tbodyList.splice(index, 1);
              }
              this.searchJobWebhook();
            }
          });
          vnode.isShow = false;
        },
        'on-close': (vnode) => {
          vnode.isShow = false;
        }
      });
    },
    switchChange(row, isActive) {
      if (row && row.id) {
        this.$api.deploy.webhook.updateWebhookByIsActive({id: row.id, isActive: isActive}).then((res) => {
          if (res && res.Status == 'OK') {
            this.$Message.success(isActive ? '激活成功' : '禁用成功');
          }
        });
      }
    },
    openExecutionRecord(row) {
      if (row && row.id) {
        this.id = row.id;
        this.dialogTitle = row.name || '';
        this.isShowExecutionRecordDialog = true;
      }
    },
    restoreHistory(historyData) {
      this.searchParam = historyData['searchParam'];
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
