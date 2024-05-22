<template>
  <div>
    <TsContain :enableCollapse="true">
      <template v-slot:topLeft>
        <div class="action-group">
          <span class="action-item tsfont-plus" @click="addReport()">{{ $t('page.template') }}</span>
          <span class="action-item tsfont-upload" @click="importReport()">{{ $t('page.import') }}</span>
          <span
            v-if="!batchDownLoading && selectList && selectList.length > 0"
            v-download="exportReport()"
            class="action-item tsfont-download"
          >{{ $t('page.export') }}</span>
          <span v-if="batchDownLoading" class="action-item disable" :title="$t('page.downloadloadingtip')">
            <Icon type="ios-loading" size="18" class="loading icon-right"></Icon>{{ $t('page.export') }}
          </span>
        </div>
      </template>
      <template v-slot:topRight>
        <div>
          <InputSearcher
            v-model="keyword"
            @change="() => updatePagesize()"
          ></InputSearcher>
        </div>
      </template>
      <template v-slot:sider>
        <div class="pr-md">
          <TsUlList
            v-if="reportTypeList && reportTypeList.length > 0"
            :isToggle="true"
            valueName="name"
            textName="label"
            value="all"
            :dataList="reportTypeList"
            @on-click="changeMenu"
          ></TsUlList>
        </div>
      </template>
      <template v-slot:content>
        <TsTable
          v-if="reportData"
          v-bind="reportData"
          :theadList="theadList"
          selectedRemain
          keyName="id"
          :canSelectRow="true"
          @getSelected="getSelected"
          @changeCurrent="updatePage"
          @changePageSize="updatePagesize"
        >
          <template slot="name" slot-scope="{ row }">
            <span class="text-href" @click.stop="showReport(row.id)">{{ row.name }}</span>
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
                    @on-change="toggleReportActive(row)"
                  ></TsFormSwitch>
                </li>
                <li v-if="!singleDownLoading" v-download="exportReport(row.id)" class="tsfont-download">{{ $t('page.export') }}</li>
                <span v-if="singleDownLoading" class="disable" :title="$t('page.downloadloadingtip')">
                  <Icon type="ios-loading" size="12"></Icon>{{ $t('page.export') }}
                </span>
                <li class="tsfont-copy" @click="editReport(row.id, true)">{{ $t('page.copy') }}</li>
                <li class="tsfont-edit" @click="editReport(row.id)">{{ $t('page.edit') }}</li>
                <li class="tsfont-trash-o" @click="deleteReport(row)">{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </template>
    </TsContain>
    <ReportEdit
      v-if="reportDislogShow"
      :id="reportId"
      :isCopy="isCopy"
      @close="close"
    ></ReportEdit>
    <UploadDialog
      ref="uploadDialog"
      :actionUrl="actionUrl"
      :formatList="formatList"
      :showSuccessNotice="false"
      :isValid="true"
      @on-success="searchReport(1)"
    />
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
export default {
  name: '',
  components: {
    ReportEdit: () => import('./report-edit.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsUlList: () => import('@/resources/components/TsUlList/TsUlList.vue'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue'),
    UploadDialog: () => import('@/resources/components/UploadDialog/UploadDialog.vue')
  },
  directives: { download },
  props: {},
  data() {
    return {
      keyword: '',
      actionUrl: BASEURLPREFIX + '/api/binary/report/import', //导入地址
      formatList: ['pak'], //导入文件格式
      selectList: [],
      singleDownLoading: false,
      batchDownLoading: false,
      isCopy: false,
      reportDislogShow: false,
      reportId: null,
      searchParam: {},
      reportData: {},
      reportTypeList: [],
      theadList: [
        {key: 'selection', multiple: true},
        {
          title: this.$t('page.name'),
          key: 'name'
        },
        {
          title: this.$t('term.report.isactive'),
          key: 'isActive'
        },
        {
          title: this.$t('page.type'),
          key: 'type'
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
    this.searchReport();
    this.getReportType();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    importReport() {
      this.$refs.uploadDialog.showDialog();
    },
    exportReport(id) {
      let idList = id && typeof id == 'number' ? [id] : this.selectList;
      return {
        url: `/api/binary/report/export/`,
        method: 'post',
        params: {
          idList: idList
        },
        changeStatus: status => {
          if (status == 'start') {
            if (id) {
              this.singleDownLoading = true;
            } else {
              this.batchDownLoading = true;
            }
          } else if (status == 'success' || status == 'error') {
            if (id) {
              this.singleDownLoading = false;
            } else {
              this.batchDownLoading = false;
            }
          }
        }
      };
    },
    getSelected(selectedList) {
      this.selectList = selectedList;
    },
    searchReport: function() {
      let params = {
        ...this.searchParam,
        keyword: this.keyword
      };
      this.$api.report.report.searchReport(params).then(res => {
        this.reportData = res.Return;
      });
    },
    addReport: function() {
      this.reportId = null;
      this.reportDislogShow = true;
    },
    updatePagesize(pageSize) {
      this.searchParam.currentPage = 1;
      this.searchParam.pageSize = pageSize || 20;
      this.searchReport();
    },
    updatePage(currentPage) {
      this.searchParam.currentPage = currentPage || 1;
      this.searchReport();
    },
    toggleReportActive: function(report) {
      this.$api.report.report.toggleReportActive({ id: report.id, isActive: report.isActive }).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
        }
      });
    },
    editReport: function(id, isCopy = false) {
      this.reportId = id;
      this.isCopy = isCopy;
      this.reportDislogShow = true;
    },
    deleteReport: function(row) {
      const { id, name } = row;
      this.$createDialog({
        title: this.$t('page.warning'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('term.report.reporttemplate')}),
        btnType: 'error',
        'on-ok': async vnode => {
          const res = await this.$api.report.report.deleteReport({ id });
          if (res.Status === 'OK') {
            this.$Message.success(this.$t('message.deletesuccess'));
            vnode.isShow = false;
            this.searchReport();
            this.getReportType();
          }
        }
      });
    },
    close: function(needFresh) {
      this.reportDislogShow = false;
      if (needFresh) {
        this.searchReport();
        this.getReportType();
      }
    },
    getReportType: function() {
      this.$api.report.report.getReportType().then(res => {
        if (res && res.Status == 'OK') {
          let typeList = res.Return;
          this.reportTypeList = [];
          if (!this.$utils.isEmpty(typeList)) {
            typeList.forEach((item) => {
              this.reportTypeList.push({
                name: item.name,
                label: `${item.label}(${item.count})`
              });
            });
          }
        }
      });
    },
    changeMenu: function(name) {
      if (this.searchParam.type == name) {
        // type == ''代表未分类
        this.$delete(this.searchParam, 'type');
      } else {
        this.searchParam.type = name;
      }
      this.selectList = [];
      this.searchReport();
    },
    showReport: function(id) {
      this.$router.push({ path: '/report-show/' + id });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
