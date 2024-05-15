<template>
  <div class="padding">
    <TsRow class="pb-nm">
      <Col span="12" class="mt-xs">
        <span v-if="hasEditConfigAuth" class="text-action tsfont-plus" @click="gotoAddConfig">{{ $t('page.config') }}</span>
        <Tooltip
          max-width="400"
          placement="right"
          transfer
        >
          <span v-if="!hasEditConfigAuth" class="text-action text-disabled tsfont-plus" @click="gotoAddConfig">{{ $t('page.config') }}</span>
          <ul slot="content">
            <li><span>{{ $t('term.deploy.withoutconfigeditauth') }}</span></li>
          </ul>
        </Tooltip>
      </Col>
      <Col span="12">
        <InputSearcher
          v-model="searchParams.keyword"
          :placeholder="$t('page.name')"
          @change="searchIntegrated(1)"
        ></InputSearcher>
      </Col>
    </TsRow>
    <Loading :loadingShow="isLoading" type="fix"></Loading>
    <TsTable
      v-bind="tableConfig"
      :theadList="theadList"
      @changeCurrent="changeCurrent"
      @changePageSize="changePageSize"
    >
      <template slot="name" slot-scope="{row}">
        <span class="text-href" @click="editIntegrated(row.id)">{{ row ? row.name : '' }}</span>
      </template>
      <template slot="isActive" slot-scope="{row}">
        <TsFormSwitch
          v-model="row.isActive"
          @on-change="(isActive) => switchChange(row.id, isActive)"
        ></TsFormSwitch>
      </template>
      <template slot="action" slot-scope="{ row }">
        <div class="tstable-action">
          <ul class="tstable-action-ul">
            <li class="tsfont-history" @click="viewExecuteRecord(row)">{{ $t('term.autoexec.executionrecord') }}</li>
            <li class="tsfont-trash-o" @click="delRow(row.id, row.name)">{{ $t('page.delete') }}</li>
          </ul>
        </div>
      </template>
    </TsTable>
    <ExecuteRecordDialog
      v-if="isShowExecuteRecord"
      :ciId="integratedId"
      :title="integratedTitle"
      @close="closeExecuteRecordDialog"
    ></ExecuteRecordDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    ExecuteRecordDialog: resolve => require(['./execute-record-dialog'], resolve) // 执行记录
  },
  props: {
    appSystemId: {
      type: Number,
      default: null
    },
    hasEditConfigAuth: {
      // 是否有编辑配置权限
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isLoading: false,
      integratedTitle: '', // 持续集成名称
      integratedId: null, // 持续集成id
      isShowExecuteRecord: false,
      searchParams: {
        appSystemId: this.appSystemId,
        currentPage: 1,
        pageSize: 20,
        keyword: ''
      },
      tableConfig: {
        tbodyList: []
      },
      theadList: [
        { title: this.$t('page.name'), key: 'name'},
        { title: this.$t('page.enable'), key: 'isActive'},
        { title: this.$t('page.module'), key: 'appModuleAbbrName'},
        { title: this.$t('term.deploy.warehousetype'), key: 'repoType'},
        { title: this.$t('term.deploy.warehouseserveraddress'), key: 'repoServerAddress'},
        { title: this.$t('term.deploy.warehousename'), key: 'repoName'},
        { title: this.$t('page.branch'), key: 'branchFilter'},
        { title: this.$t('term.deploy.associatedevent'), key: 'event'},
        { title: this.$t('page.actions'), key: 'actionName'},
        { title: this.$t('page.fcu'), key: 'fcuVo', type: 'user'},
        { title: this.$t('page.fcd'), key: 'lcd', type: 'time'},
        { title: '', key: 'action'}
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (!this.$utils.isSame(this.appSystemId, this.searchParams.appSystemId)) {
      // 解决返回时，切换不同的应用，appSystemId还是restoreHistory方法中旧的id的问题
      this.$set(this.searchParams, 'appSystemId', this.appSystemId);
    }
    this.searchIntegrated(1);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    restoreHistory(historyData) {
      Object.assign(this.searchParams, historyData['searchParams']);
    },
    searchIntegrated(currentPage) {
      if (currentPage) {
        this.searchParams.currentPage = currentPage;
      }
      this.isLoading = true;
      this.$addHistoryData('searchParams', this.searchParams);
      this.$api.deploy.integrated.getIntegratedList(this.searchParams).then(res => {
        if (res && res.Status == 'OK') {
          this.tableConfig = res.Return;
        }
      }).finally(() => {
        this.isLoading = false;
      });
    },
    changeCurrent(currentPage) {
      this.searchRecord(currentPage);
    },
    changePageSize(pageSize) {
      this.searchParams.pageSize = pageSize;
      this.searchIntegrated(1);
    },
    gotoAddConfig() {
      this.$router.push({path: '/config-add', query: {appSystemId: this.appSystemId}});
    },
    editIntegrated(id) {
      if (id) {
        this.$router.push(
          {
            path: '/config-add', 
            query: {
              appSystemId: this.appSystemId,
              id
            }
          });
      }
    },
    viewExecuteRecord(row) {
      // 执行记录
      if (row) {
        this.integratedTitle = row.name;
        this.integratedId = row.id;
        this.isShowExecuteRecord = true;
      }
    },
    closeExecuteRecordDialog() {
      this.integratedTitle = '';
      this.integratedId = null;
      this.isShowExecuteRecord = false;
    },
    switchChange(id, isActive) {
      if (id) {
        this.$api.deploy.integrated.updateActive({id: id, isActive: isActive}).then(res => {
          if (res && res.Status == 'OK') {
            this.$Message.success(this.$t('message.updatesuccess'));
          }
        });
      }
    },
    delRow(id, name) {
      // 删除
      if (!id) {
        return false;
      }
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: name}),
        okText: this.$t('page.delete'),
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.deploy.integrated.delIntegratedById({id: id}).then(res => {
            if (res && res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              vnode.isShow = false;
              this.searchIntegrated(1);
            }
          });
        },
        'on-cancel': vnode => {
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
