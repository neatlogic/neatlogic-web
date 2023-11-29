<template>
  <div class="reportinstance-show-wrap">
    <TsContain border="border">
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back('/reportinstance-manage')">{{ $getFromPage($t('term.report.report')) }}</span>
      </template>
      <template v-slot:topLeft>
        <span>{{ reportInstanceData.name }}</span>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <div class="action-item">
            <Button type="primary" @click="getReportDetail(true)">{{ $t('page.refresh') }}</Button>
          </div>
          <div class="action-item">
            <Dropdown v-if="reportInstanceData && reportInstanceData.id">
              <Button :loading="isDowning.pdf || isDowning.word ||isDowning.excel">
                {{ $t('page.export') }}
                <span class="tsfont-down"></span>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem v-download="{ url: '/api/binary/report/detail/export/' + reportInstanceData.reportId + '/pdf', params: searchParam,changeStatus:(arr)=>{changeDownStatus(arr,'pdf')} }" :disabled="isDowning.pdf">PDF</DropdownItem>
                <DropdownItem v-download="{ url: '/api/binary/report/detail/export/' + reportInstanceData.reportId + '/word', params: searchParam,changeStatus:(arr)=>{changeDownStatus(arr,'word')} }" :disabled="isDowning.word">WORD</DropdownItem>
                <DropdownItem v-download="{ url: '/api/binary/report/detail/export/' + reportInstanceData.reportId + '/excel', params: searchParam,changeStatus:(arr)=>{changeDownStatus(arr,'excel')}}" :disabled="isDowning.excel">EXCEL</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </template>
      <template v-slot:content>
        <Loading :loadingShow="loadingShow" type="fix"></Loading>
        <div v-if="reportInstanceData.paramList && reportInstanceData.paramList.length > 0" class="pt-xs">
          <TsRow>
            <Col v-for="(param, index) in handleFormItemData(reportInstanceData.paramList)" :key="index" :span="param.width">
              <TsFormItem
                :label="param.label"
                class="report-instance-show-formitem"
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
        <Divider v-if="reportInstanceData.paramList && reportInstanceData.paramList.length > 0" />
        <ReportMain
          class="report-main"
          :content="reportContent || ''"
          @changeReportContentPage="changeReportContentPage"
          @changeReportContentPageSize="changeReportContentPageSize"
        ></ReportMain>
      </template>
    </TsContain>
  </div>
</template>
<script>
import TsFormItem from '@/resources/plugins/TsForm/TsFormItem';
import * as paramhandler from './paramhandler';
import download from '@/resources/directives/download.js';
export default {
  name: 'ReportInstanceShow',
  components: {
    TsFormItem,
    ...paramhandler,
    ReportMain: resolve => require(['../component/report-main.vue'], resolve)

  },
  directives: { download },
  props: {},
  data() {
    return {
      loadingShow: false,
      fromPath: '',
      id: this.$route.params['id'],
      reportContent: '',
      reportInstanceData: {},
      searchParam: { reportInstanceId: this.$route.params['id'] },
      isDowning: {
        pdf: false,
        word: false,
        excel: false
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getReportInstanceById();
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
      this.$https.post('/api/binary/report/show/' + this.reportInstanceData.reportId, this.searchParam, {
        cancelAxios: this.cancelAxios.token
      }).then(res => {
        _this.reportContent = res.data || res;
        if (showStatus) {
          _this.$Message.success(_this.$t('message.refreshsuccess'));
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    getReportInstanceById() {
      if (this.id) {
        this.$api.report.report.getReportInstanceById(this.id).then(res => {
          let d = res.Return;
          if (d && d.paramList && d.paramList.length > 0) {
            d.paramList.forEach(element => {
              if (element.config && element.config.defaultValue) {
                this.searchParam[element.name] = element.config.defaultValue;
              }
            });
          }
          this.reportInstanceData = d;
        });
      }
    },
    setParam(paramName, paramValue) {
      let obj = {};
      obj[paramName] = paramValue;
      this.searchParam = Object.assign({}, this.searchParam, obj);
      for (let key in this.searchParam) {
        let val = this.searchParam[key];
        if (!val) {
          this.$delete(this.searchParam, key);
        }
      }
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
  computed: {
    isAdmin() {
      return this.$store.getters.userAuthList.includes('REPORT_MODIFY');
    }
  },
  watch: {
    'searchParam': {
      handler: function(val) {
        this.$nextTick(() => {
          this.getReportDetail();
        });
      },
      deep: true
    },
    reportInstanceData: {
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
.reportinstance-show-wrap {
  /deep/ .report-instance-show-formitem{
    min-height: 53px;
  }
  .padding8{
    padding: 0 12px;
  }
}

</style>
