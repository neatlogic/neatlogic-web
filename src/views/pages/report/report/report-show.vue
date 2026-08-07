<template>
  <div>
    <TsContain>
      <template v-slot:navigation>
        <span
          v-if="$hasBack()"
          v-auth="'REPORT_MODIFY'"
          class="tsfont-left text-action"
          @click="$back()"
        >{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <span v-auth="'REPORT_MODIFY'">{{ reportData.name }}</span>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <div v-auth="'REPORT_TEMPLATE_MODIFY'" class="action-item tsfont-edit" @click="editReport">
            {{ $t('page.edit') }}
          </div>
          <div v-if="hasExecuted" class="action-item tsfont-mm-sql" @click="openSqlExecutionDialog">{{ $t('term.report.viewsql') }}</div>
        </div>
      </template>
      <template slot="content">
        <Loading :loadingShow="loadingShow" type="fix"></Loading>
        <div v-if="reportData.paramList && reportData.paramList.length > 0" class="pt-xs">
          <TsRow>
            <Col v-for="(param, index) in handleFormItemData(reportData.paramList)" :key="index" :span="param.width">
              <TsFormItem
                :label="param.label"
                class="report-show-formitem"
                :required="param.isRequired ? true : false"
                :validateList="param.validateList"
                width="100%"
              >
                <component
                  :is="param.type"
                  ref="form"
                  :validateList="param.validateList"
                  :config="param.config"
                  :searchParam="filterParam"
                  @setParam="
                    val => {
                      setParam(param.name, val);
                    }
                  "
                ></component>
              </TsFormItem>
            </Col>
          </TsRow>
          <div class="text-right">
            <div class="action-group">
              <div class="action-item">
                <Dropdown v-if="reportData && reportData.id">
                  <Button :loading="isDowning.pdf || isDowning.word || isDowning.excel">
                    {{ $t('page.export') }}
                    <Icon type="ios-arrow-down"></Icon>
                  </Button>
                  <DropdownMenu slot="list">
                    <DropdownItem
                      v-download="{
                        url: '/api/binary/report/detail/export/' + reportData.id + '/pdf',
                        params: searchParam,
                        changeStatus: arr => {
                          changeDownStatus(arr, 'pdf');
                        }
                      }"
                      :disabled="isDowning.pdf"
                    >
                      PDF
                    </DropdownItem>
                    <DropdownItem
                      v-download="{
                        url: '/api/binary/report/detail/export/' + reportData.id + '/word',
                        params: searchParam,
                        changeStatus: arr => {
                          changeDownStatus(arr, 'word');
                        }
                      }"
                      :disabled="isDowning.word"
                    >
                      WORD
                    </DropdownItem>
                    <DropdownItem
                      v-download="{
                        url: '/api/binary/report/detail/export/' + reportData.id + '/excel',
                        params: searchParam,
                        changeStatus: arr => {
                          changeDownStatus(arr, 'excel');
                        }
                      }"
                      :disabled="isDowning.excel"
                    >
                      EXCEL
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
              <div class="action-item">
                <Button type="primary" @click="searchReport">{{ $t('page.search') }}</Button>
              </div>
            </div>
          </div>
        </div>
        <Divider v-if="reportData.paramList && reportData.paramList.length > 0" />
        <ReportMain
          class="report-main"
          :content="reportContent"
          @changeReportContentPage="changeReportContentPage"
          @changeReportContentPageSize="changeReportContentPageSize"
        ></ReportMain>
      </template>
    </TsContain>
    <ReportSqlExecutionDialog
      v-if="isSqlExecutionDialogShow"
      :reportId="id"
      :params="searchParam"
      @close="isSqlExecutionDialogShow = false"
    ></ReportSqlExecutionDialog>
  </div>
</template>
<script>
import TsFormItem from '@/resources/plugins/TsForm/TsFormItem';
import * as paramhandler from './paramhandler/index.js';
import download from '@/resources/directives/download.js';
export default {
  name: 'ReportShow',
  components: {
    TsFormItem,
    ReportMain: () => import('../component/report-main.vue'),
    ReportSqlExecutionDialog: () => import('./report-sql-execution-dialog.vue'),
    ...paramhandler
  },
  directives: { download },
  props: {},
  data() {
    return {
      loadingShow: false,
      id: this.$route.params['id'],
      reportContent: '',
      reportData: {},
      filterParam: { reportInstanceId: this.$route.params['id'] },
      searchParam: { reportInstanceId: this.$route.params['id'] },
      hasExecuted: false,
      isSqlExecutionDialogShow: false,
      isDowning: {
        pdf: false,
        word: false,
        excel: false
      }
    };
  },
  beforeCreate() {},
  created() {
    window.REPORT_CHANGE_PAGE = (function(that) {
      return function(dataSource, currentPage) {
        that.changeReportContentPage(dataSource, currentPage);
      };
    })(this);
    window.REPORT_CHANGE_PAGESIZE = (function(that) {
      return function(dataSource, pageSize) {
        that.changeReportContentPageSize(dataSource, pageSize);
      };
    })(this);
  },
  beforeMount() {},
  mounted() {
    this.getReportById();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    this.cancelAxios && this.cancelAxios.cancel();
  },
  destroyed() {},
  methods: {
    handleFormItemData(formList) {
      // 处理数据
      let formItemData = this.$utils.deepClone(formList);
      if (formItemData && !this.$utils.isEmpty(formItemData)) {
        formItemData.forEach(item => {
          item.isRequired = !!(item.config && item.config.isRequired);
          item.validateList = item.config && item.config.isRequired ? ['required'] : [];
        });
      }
      return formItemData;
    },
    changeReportContentPage(dataSource, currentPage) {
      this.$set(this.searchParam, dataSource + '.currentpage', currentPage);
      this.$set(this.filterParam, dataSource + '.currentpage', currentPage);
      this.getReportDetail();
    },
    changeReportContentPageSize(dataSource, pageSize) {
      this.$set(this.searchParam, dataSource + '.pagesize', pageSize);
      this.$set(this.filterParam, dataSource + '.pagesize', pageSize);
      this.getReportDetail();
    },
    valid() {
      let formValid = this.$refs.form;
      let isValid = true;
      if (formValid && !this.$utils.isEmpty(formValid)) {
        for (let i = 0; i < formValid.length; i++) {
          if (formValid[i] && formValid[i].$children && formValid[i].$children[0] && !formValid[i].$children[0].valid()) {
            isValid = false;
          }
        }
      }
      return isValid;
    },
    getReportDetail(showStatus) {
      if (!this.valid()) {
        return false;
      }
      this.cancelAxios && this.cancelAxios.cancel();
      this.cancelAxios = this.$https.CancelToken.source();
      this.loadingShow = true;
      this.reportContent = '';
      this.$api.report.report
        .showReportSvg(this.id, this.searchParam, this.cancelAxios.token)
        .then(res => {
          this.reportContent = res.data || res;
          this.hasExecuted = true;
          if (showStatus) {
            this.$Message.success(this.$t('message.refreshsuccess'));
          }
        })
        .finally(() => {
          this.loadingShow = false;
        });
    },
    getReportById() {
      if (!this.id) {
        return false;
      }
      let query = this.$route.query || {};
      let queryKeyList = Object.keys(query);
      this.$api.report.report.getReportById(this.id).then(res => {
        let d = res.Return;
        let defaultParam = { reportInstanceId: this.$route.params['id'] };
        if (d && d.paramList && d.paramList.length > 0) {
          d.paramList.forEach(element => {
            if (element.config && element.config.defaultValue) {
              defaultParam[element.name] = element.config.defaultValue;
            } else {
              if (element.name && queryKeyList.includes(element.name)) {
                // 处理从地址栏传递过来的参数，并设置默认值
                defaultParam[element.name] = query[element.name];
                if (element.hasOwnProperty('config')) {
                  element.config.defaultValue = query[element.name];
                } else {
                  element.config = { defaultValue: query[element.name] };
                }
              }
            }
          });
        }
        this.filterParam = Object.assign({}, defaultParam);
        this.searchParam = Object.assign({}, defaultParam);
        this.reportData = d;
        this.$nextTick(() => {
          this.getReportDetail();
        });
      });
    },
    setParam: function(paramName, paramValue) {
      let obj = {};
      obj[paramName] = paramValue;
      this.filterParam = Object.assign({}, this.filterParam, obj);
    },
    searchReport() {
      if (!this.valid()) {
        return false;
      }
      this.searchParam = Object.assign({}, this.filterParam);
      this.getReportDetail();
    },
    openSqlExecutionDialog() {
      if (!this.hasExecuted) {
        return;
      }
      this.isSqlExecutionDialogShow = true;
    },
    editReport() {
      this.$router.push({ path: '/report-edit/' + this.id });
    },
    changeDownStatus(type, filetype) {
      if (type == 'start') {
        let obj = {};
        obj[filetype] = true;
        Object.assign(this.isDowning, obj);
      } else if (type != 'progress') {
        let obj = {};
        obj[filetype] = false;
        Object.assign(this.isDowning, obj);
      }
    }
  },
  filter: {},
  computed: {}
};
</script>
<style lang="less">
@import '~@/resources/assets/css/report/report.less';
</style>
<style lang="less" scoped>
::v-deep .report-show-formitem {
  min-height: 53px;
}
</style>
