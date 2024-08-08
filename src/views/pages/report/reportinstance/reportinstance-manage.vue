<template>
  <div>
    <TsContain border="border">
      <template slot="topLeft">
        <span class="text-action tsfont-plus" @click="addReportInstance()">{{ $t('term.report.report') }}</span>
      </template>
      <template slot="topRight">
        <TsRow>
          <Col :span="8">
            <TsFormSelect v-model="searchParam.reportId" v-bind="reportSelectConfig" @change="searchReportInstance()"></TsFormSelect>
          </Col>
          <Col :span="16">
            <InputSearcher v-model="searchParam.keyword" @change="() => updatePagesize()"></InputSearcher>
          </Col>
        </TsRow>
      </template>
      <div slot="content">
        <TsTable
          v-if="reportInstanceData"
          v-bind="reportInstanceData"
          :theadList="theadList"
          @changeCurrent="updatePage"
          @changePageSize="updatePagesize"
        >
          <template slot="name" slot-scope="{ row }">
            <a href="#" @click="showReport(row.id)">{{ row.name }}</a>
          </template>
          <template slot="isActive" slot-scope="{ row }">
            <span v-if="row.isActive" class="text-success">{{ $t('page.yes') }}</span>
            <span v-if="!row.isActive" class="text-grey">{{ $t('page.no') }}</span>
          </template>
          <template slot="action" slot-scope="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li @click.stop>
                  <TsFormSwitch
                    v-model="row.isActive"
                    :true-value="1"
                    :false-value="0"
                    showStatus
                    @on-change="toggleReportInstanceActive(row)"
                  ></TsFormSwitch>
                </li>
                <li class="tsfont-edit" @click="editReportInstance(row.id)">{{ $t('page.edit') }}</li>
                <li class="tsfont-trash-o" @click="deleteReportInstance(row)">{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
    </TsContain>
    <ReportInstanceEdit :id="reportInstanceId" :isShow="reportInstanceDialogShow" @close="close"></ReportInstanceEdit>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsContain: () => import('@/resources/components/TsContain/TsContain.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect.vue'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    ReportInstanceEdit: () => import('./reportinstance-edit.vue')
  },
  props: {},
  data() {
    return {
      reportInstanceDialogShow: false,
      reportInstanceId: null,
      searchParam: {},
      reportInstanceData: {},
      reportSelectConfig: {
        search: true,
        value: null,
        label: this.$t('page.status'),
        valueName: 'id',
        textName: 'name',
        dynamicUrl: '/api/rest/report/list',
        rootName: 'tbodyList',
        placeholder: this.$t('term.report.describe.choosetemplate')
      },
      theadList: [
        {
          title: this.$t('page.name'),
          key: 'name'
        },
        {
          title: this.$t('term.report.isactive'),
          key: 'isActive'
        },
        {
          title: this.$t('page.template'),
          key: 'reportName'
        },
        {
          title: this.$t('term.report.visits'),
          key: 'visitCount'
        },
        {
          title: '',
          key: 'action',
          align: 'right'
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchReportInstance();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    searchReportInstance: function() {
      this.$api.report.report.searchReportInstance(this.searchParam).then(res => {
        this.reportInstanceData = res.Return;
      });
    },
    addReportInstance: function() {
      this.reportInstanceId = null;
      this.reportInstanceDialogShow = true;
    },
    updatePagesize(pageSize) {
      this.searchParam.currentPage = 1;
      this.searchParam.pageSize = pageSize || 20;
      this.searchReportInstance();
    },
    updatePage(currentPage = 1) {
      this.searchParam.currentPage = currentPage;
      this.searchReportInstance();
    },
    toggleReportInstanceActive: function(report) {
      this.$api.report.report.toggleReportInstanceActive({ id: report.id, isActive: report.isActive }).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
        }
      });
    },
    editReportInstance: function(id) {
      this.reportInstanceId = id;
      this.reportInstanceDialogShow = true;
    },
    deleteReportInstance: function(row) {
      const { id, name } = row;
      this.$createDialog({
        title: this.$t('page.warning'),
        content: this.$t('dialog.content.deleteconfirm', {target: row.name}),
        btnType: 'error',
        'on-ok': async vnode => {
          const res = await this.$api.report.report.deleteReportInstance({ id });
          if (res.Status === 'OK') {
            this.$Message.success(this.$t('message.deletesuccess'));
            vnode.isShow = false;
            this.searchReportInstance();
          }
        }
      });
    },
    close: function(needFresh) {
      this.reportInstanceDialogShow = false;
      if (needFresh) {
        this.searchReportInstance();
      }
    },
    changeMenu: function(name) {
      this.searchParam.type = name;
      this.searchReport();
    },
    showReport(id) {
      this.$router.push({
        path: 'reportinstance-show/' + id
      });
    }
  },
  filter: {},
  computed: {},
  watch: {
  }
};
</script>
