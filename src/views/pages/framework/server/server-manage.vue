<template>
  <div>
    <TsContain>
      <template v-slot:topLeft>
        <div class="action-group">

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
      loading: false,
      currentPage: 1,
      pageSize: 20,
      theadList: [
        {
          key: 'serverId',
          title: this.$t('page.server') + 'ID'
        },
        {
          key: 'status',
          title: this.$t('page.status')
        },
        {
          key: 'host',
          title: this.$t('term.framework.host')
        },
        {
          key: 'heartbeatTime',
          title: this.$t('term.framework.heartbeattime'),
          type: 'time'
        },
        {
          key: 'heartbeatRate',
          title: this.$t('term.framework.heartbeatrate') + '（' + this.$t('page.minute') + '）'
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
      formSetting: {
        serverId: {
          type: 'text',
          label: this.$t('page.server') + 'ID',
          disabled: true,
          validateList: ['required']
        },
        host: {
          type: 'text',
          label: this.$t('term.framework.host'),
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
      this.$api.framework.server.getServerList().then(res => {
        if (res.Status === 'OK') {
          this.tableData = res.Return;
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
  computed: {

  },
  watch: {}
};
</script>
<style lang="less"></style>
