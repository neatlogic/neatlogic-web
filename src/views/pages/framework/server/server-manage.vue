<template>
  <div>
    <TsContain>
      <template v-slot:topLeft>
        <div class="action-group">
          <div v-if="currentServerId != null" class="action-item">
            <span class="mr-xs text-grey">{{ $t('page.serverid') }}</span>
            <span>
              <b>{{ currentServerId }}</b>
            </span>
          </div>
        </div>
      </template>
      <template v-slot:topRight>

      </template>
      <template v-slot:content>
        <TsTable
          v-if="!loading"
          v-bind="tableData"
          :theadList="theadList"
          @changeCurrent="changePage"
          @changePageSize="changePageSize"
        >
          <template v-slot:serverId="{ row }">
            <span class="text-href" @click.stop="showServerForm(row)">{{ row.serverId }}</span>
          </template>
          <template v-slot:status="{ row }">
            <span v-if="row.status == 'startup'" class="text-success">{{ $t('page.normal') }}</span>
            <span v-else class="text-danger">{{ $t('term.framework.shutdown') }}</span>
          </template>
          <template v-slot:action="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-edit" @click="showServerForm(row)">{{ $t('page.edit') }}</li>
                <!-- 仅停机节点显示删除入口，提交时由后端再次校验节点状态。 -->
                <li v-if="row.status === 'stop' && row.serverId != currentServerId" class="text-danger" @click="deleteServer(row)">{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </template>
    </TsContain>
    <TsDialog
      type="modal"
      :isShow.sync="isShowFormDialog"
      :title="$t('page.edit')"
      @on-close="close"
      @on-ok="save"
    >
      <template v-slot>
        <TsForm
          ref="mainForm"
          v-model="rowData"
          :itemList="formSetting"
          type="type"
          labelPosition="right"
        >
        </TsForm>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  props: {},
  data() {
    return {
      currentServerId: null,
      loading: false,
      currentPage: 1,
      pageSize: 20,
      theadList: [
        {
          key: 'serverId',
          title: this.$t('page.server') + 'ID'
        },
        {
          key: 'serverGroup',
          title: this.$t('page.servergroup')
        },
        {
          key: 'status',
          title: this.$t('page.status')
        },
        {
          key: 'host',
          title: this.$t('term.framework.heartbeaturl')
        },
        {
          key: 'ip',
          title: 'IP'
        },
        {
          key: 'startTime',
          title: this.$t('page.starttime'),
          type: 'time'
        },
        {
          key: 'heartbeatTime',
          title: this.$t('term.framework.heartbeattime'),
          type: 'time'
        },
        {
          key: 'heartbeatRate',
          title: this.$t('term.framework.heartbeatrate') + '（' + this.$t('page.second') + '）'
        },
        {
          key: 'heartbeatThreshold',
          title: this.$t('term.framework.heartbeatthreshold') + '（' + this.$t('page.counter') + '）'
        },
        {
          title: ' ',
          key: 'action',
          align: 'right',
          width: 10
        }
      ],
      tableData: {},
      isShowFormDialog: false,
      isShowDeleteDialog: false, // 防止重复点击行操作时打开多个删除确认框。
      isDeletingServer: false, // 请求期间即使关闭弹框，也不允许重复提交删除。
      formSetting: {
        serverId: {
          type: 'text',
          label: this.$t('page.server') + 'ID',
          disabled: true,
          validateList: ['required']
        },
        host: {
          type: 'text',
          label: this.$t('term.framework.heartbeaturl'),
          placeholder: 'http(s)://ip:port',
          validateList: ['required']
        }
      },
      rowData: {}
    };
  },
  beforeCreate() {},
  created() {
    this.getServerList();
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
    changePage(currentPage) {
      this.currentPage = currentPage;
      this.getServerList();
    },
    changePageSize(pageSize) {
      this.currentPage = 1;
      this.pageSize = pageSize;
      this.getServerList();
    },
    getServerList() {
      this.loading = true;
      this.$api.framework.server.getServerList({}).then(res => {
        if (res.Status === 'OK') {
          this.tableData = res.Return;
          this.currentServerId = res.Return.currentServerId;
        }
      }).finally(() => {
        this.loading = false;
      });
    },
    async showServerForm(rowData) {
      this.rowData = rowData;
      this.isShowFormDialog = true;
    },
    close() {
      this.isShowFormDialog = false;
      this.rowData = {};
    },
    // 确认后才删除停机节点；失败保留弹框供重试，成功刷新节点列表。
    deleteServer(row) {
      if (row.status !== 'stop' || this.isShowDeleteDialog || this.isDeletingServer) {
        return;
      }
      this.isShowDeleteDialog = true;
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deletetargetconfirm', { target: this.$t('page.server') + ' ' + row.serverId }),
        btnType: 'error',
        'on-ok': vnode => {
          // 同时保护确认按钮和请求状态，避免快速点击重复提交。
          if (this.isDeletingServer) {
            return;
          }
          this.isDeletingServer = true;
          vnode.okBtnDisable = true;
          this.$api.framework.server.deleteServer({ serverId: row.serverId }).then(res => {
            if (res.Status === 'OK') {
              vnode.isShow = false;
              this.isShowDeleteDialog = false;
              this.$Message.success(this.$t('message.deletesuccess'));
              this.getServerList();
            }
          }).catch(() => {
            // 错误文案由统一 HTTP 拦截器显示，此处保留确认框以便重试。
          }).finally(() => {
            this.isDeletingServer = false;
            vnode.okBtnDisable = false;
          });
        },
        'on-close': () => {
          // 取消或关闭确认框不提交删除，并允许再次打开。
          this.isShowDeleteDialog = false;
        }
      });
    },
    save() {
      let form = this.$refs.mainForm;
      if (form.valid()) {
        let data = form.getFormValue();
        this.$api.framework.server.saveServer(data).then(res => {
          if (res.Status === 'OK') {
            this.isShowFormDialog = false;
            this.rowData = {};
            this.getServerList();
          }
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
