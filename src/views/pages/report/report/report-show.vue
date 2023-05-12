<template>
  <div>
    <TsContain>
      <template v-slot:navigation>
        <span
          v-if="$hasBack()"
          v-auth="'REPORT_MODIFY'"
          class="tsfont-left text-action"
          @click="$back('/report-manage')"
        >{{ $getFromPage($t('page.templatelist')) }}</span>
      </template>
      <template v-slot:topLeft>
        <span v-auth="'REPORT_MODIFY'">{{ reportData.name }}</span>
      </template>
      <template v-slot:topRight>
        <Button type="primary" style="margin-right:10px" @click="getReportDetail(true)">{{ $t('page.refresh') }}</Button>
        <Dropdown v-if="reportData && reportData.id">
          <Button :loading="isDowning.pdf || isDowning.word ||isDowning.excel">
            {{ $t('page.export') }}
            <Icon type="ios-arrow-down"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem v-download="{ url: '/api/binary/report/detail/export/' + reportData.id + '/pdf', params: searchParam,changeStatus:(arr)=>{changeDownStatus(arr,'pdf')} }" :disabled="isDowning.pdf">PDF</DropdownItem>
            <DropdownItem v-download="{ url: '/api/binary/report/detail/export/' + reportData.id + '/word', params: searchParam,changeStatus:(arr)=>{changeDownStatus(arr,'word')} }" :disabled="isDowning.word">WORD</DropdownItem>
            <DropdownItem v-download="{ url: '/api/binary/report/detail/export/' + reportData.id + '/excel', params: searchParam,changeStatus:(arr)=>{changeDownStatus(arr,'excel')}}" :disabled="isDowning.excel">EXCEL</DropdownItem>
          </DropdownMenu>
        </Dropdown>
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
                  @setParam="(val)=>{setParam(param.name, val)}"
                ></component>
              </TsFormItem>
            </Col>
          </TsRow>
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
  </div>
</template>
<script>
import TsFormItem from '@/resources/plugins/TsForm/TsFormItem';
import * as paramhandler from './paramhandler/index.js';
import download from '@/resources/directives/download.js';
export default {
  name: '',
  components: {
    TsFormItem,
    ReportMain: resolve => require(['../component/report-main.vue'], resolve), 
    ...paramhandler
  }, 
  directives: {download},
  props: {},
  data() {
    return {
      loadingShow: false,
      id: this.$route.params['id'],
      reportContent: '',
      reportData: {},
      searchParam: {reportInstanceId: this.$route.params['id']},
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
        formItemData.forEach((item) => {
          item.isRequired = !!(item.config && item.config.isRequired);
          item.validateList = item.config && item.config.isRequired ? ['required'] : [];
        });
      }
      return formItemData;
    },
    changeReportContentPage(dataSource, currentPage) {
      this.$set(this.searchParam, dataSource + '.currentpage', currentPage);
    },
    changeReportContentPageSize(dataSource, pageSize) {
      this.$set(this.searchParam, dataSource + '.pagesize', pageSize);
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
      const _this = this;
      this.cancelAxios && this.cancelAxios.cancel();
      this.cancelAxios = this.$https.CancelToken.source();
      this.loadingShow = true;
      this.reportContent = '';
      this.$api.report.report.showReportSvg(this.id, this.searchParam, this.cancelAxios.token).then(res => {
        // _this.$refs['iframe'].src = 'data:text/html;charset=utf-8,' + res.data;
        _this.reportContent = res.data || res;
        if (showStatus) {
          _this.$Message.success(_this.$t('message.refreshsuccess'));
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    getReportById: function() {
      if (this.id) {
        this.$api.report.report.getReportById(this.id).then(res => {
          let d = res.Return;
          if (d && d.paramList && d.paramList.length > 0) {
            d.paramList.forEach(element => {
              if (element.config && element.config.defaultValue) {
                this.searchParam[element.name] = element.config.defaultValue;
              }
            });
          }
          this.reportData = d;
        });
      } 
    },
    setParam: function(paramName, paramValue) {
      if (Array.isArray(paramValue)) {
        let _paramValue = [];
        paramValue.forEach((element) => {
          if (element.indexOf('&=&') > -1) {
            let item = element.split('&=&')[0];
            _paramValue.push(item);
          }
        }); 
        paramValue = _paramValue;
      } else {
        if (paramValue && paramValue.indexOf('&=&') > -1) {
          paramValue = paramValue.split('&=&')[0];
        }
      }
      let obj = {};
      obj[paramName] = paramValue;
      this.searchParam = Object.assign({}, this.searchParam, obj);
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
  computed: {},
  watch: {
    reportData: {
      handler: function() {
        this.$nextTick(() => {
          this.getReportDetail();
        });
      },
      deep: true
    },
    searchParam: {
      handler: function() {
        this.$nextTick(() => {
          this.getReportDetail();
        });
      },
      deep: true
    }
  }
};
</script>
<style lang="less">
@import '~@/resources/assets/css/report/report.less';
</style>
<style lang="less" scoped>
  /deep/ .report-show-formitem{
    min-height: 53px;
  }
</style>
