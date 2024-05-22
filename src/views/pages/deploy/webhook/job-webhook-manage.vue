<template>
  <div>
    <TsContain>
      <Loading :loadingShow="isLoading" type="fix"></Loading>
      <template v-slot:topLeft>
        <span class="text-action tsfont-plus" @click="toJobWebhookAdd">{{ $t('page.config') }}</span>
      </template>
      <template v-slot:topRight>
        <InputSearcher
          v-model="searchParam.keyword"
          :placeholder="$t('page.name')"
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
                <li class="tsfont-history" @click.stop="openExecutionRecord(row)">{{ $t('term.autoexec.executionrecord') }}</li>
                <li class="tsfont-trash-o" @click.stop="delJobWebhook(row, index)">{{ $t('page.delete') }}</li>
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
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    CommonStatus: () => import('@/resources/components/Status/CommonStatus.vue'),
    ExecutionRecordDialog: () => import('./execution-record-dialog') // 执行记录
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
          title: this.$t('page.name'),
          key: 'name'
        },
        {
          title: this.$t('page.enable'),
          key: 'isActive'
        },
        {
          title: this.$t('term.deploy.triggerstate'),
          key: 'jobStatusList'
        },
        {
          title: this.$t('term.deploy.integratedaction'),
          key: 'integrationName'
        },
        {
          title: this.$t('page.fcu'),
          key: 'fcuVo',
          type: 'user'
        },
        {
          title: this.$t('page.fcd'),
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
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: row.name || ''}),
        okText: this.$t('page.delete'),
        btnType: 'error',
        'on-ok': (vnode) => {
          this.$api.deploy.webhook.delJobWebhookById({id: row.id}).then((res) => {
            if (res && res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
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
            this.$Message.success(this.$t('message.savesuccess'));
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
