<template>
  <div>
    <TsContain border="border">
      <template slot="topLeft">
        <span class="text-action tsfont-plus" @click="addReportInstance()">{{ $t('term.report.report') }}</span>
      </template>
      <template slot="topRight">
        <CombineSearcher v-model="searchVal" v-bind="searchConfig" @change="updatePagesize()"></CombineSearcher>
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
            <!-- 
               <a href="#" @click="showReport(row.id)">{{ row.name }}</a>
               在a标签上，同时有href和点击事件时，点击事件会先执行，然后才会执行默认的href行为，所以会跳转两次，最后跳转到report.html#/
             -->
            <span class="text-href cursor" @click="showReport(row.id)">{{ row.name }}</span>
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
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    CombineSearcher: () => import('@/resources/components/CombineSearcher/CombineSearcher.vue'),
    ReportInstanceEdit: () => import('./reportinstance-edit.vue')
  },
  props: {},
  data() {
    return {
      reportInstanceDialogShow: false,
      reportInstanceId: null,
      searchParam: {},
      searchVal: {},
      reportInstanceData: {},
      searchConfig: {
        searchMode: 'clickBtnSearch',
        labelPosition: 'left',
        placeholder: this.$t('page.insert') + this.$t('page.name'),
        searchList: [
          {
            type: 'select',
            name: 'reportId',
            label: this.$t('page.template'),
            search: true,
            valueName: 'id',
            textName: 'name',
            dynamicUrl: '/api/rest/report/list',
            rootName: 'tbodyList',
            placeholder: this.$t('term.report.describe.choosetemplate'),
            transfer: true
          },
          {
            type: 'radio',
            name: 'isActive',
            label: this.$t('page.isactive'),
            dataList: [
              {
                text: this.$t('page.yes'),
                value: 1
              },
              {
                text: this.$t('page.no'),
                value: 0
              }
            ]
          }
        ]
      },
      theadList: [
        {
          title: this.$t('page.name'),
          key: 'name'
        },
        {
          title: this.$t('page.isactive'),
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
      this.$api.report.report.searchReportInstance({...this.searchParam, ...this.searchVal}).then(res => {
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
        content: this.$t('dialog.content.deletetargetconfirm', {target: row.name}),
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
  watch: {}
};
</script>
