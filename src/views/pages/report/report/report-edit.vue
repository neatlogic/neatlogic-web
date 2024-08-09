<template>
  <div>
    <TsDialog
      v-if="reportData"
      v-bind="reportDialogConfig"
      @on-close="close"
    >
      <template v-slot:header>
        <div v-if="reportData.id">{{ isCopy ? $t('term.report.copytemplate') : $t('term.report.edittemplate') }}</div>
        <div v-if="!reportData.id">{{ $t('term.report.addtemplate') }}</div>
      </template>
      <template v-slot>
        <TsForm ref="reportForm" :item-list="reportFormConfig">
          <template v-slot:isActive>
            <TsFormSwitch
              v-model="reportData.isActive"
              :true-value="1"
              :false-value="0"
              showStatus
            ></TsFormSwitch>
          </template>
          <template v-slot:config>
            <Tabs>
              <TabPane :label="$t('term.report.conditionconfig')">
                <ReportParam :paramList="reportData.paramList" @setParam="setParam"></ReportParam></TabPane>
              <TabPane :label="$t('term.report.datasourceconfig')">
                <ReportContent :reportData="reportData" @setSql="setSql"></ReportContent>
              </TabPane>
              <TabPane :label="$t('term.report.contentconfig')">
                <ContentHelp></ContentHelp>
                <TsCodemirror codeMode="xml" :value.sync="reportData.content" height="500px"></TsCodemirror>
              </TabPane>
              <!-- <TabPane label="帮助"><ReportHelp></ReportHelp></TabPane> -->
            </Tabs>
          </template>
        </TsForm>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button type="primary" :loading="isSaving" @click="saveReport()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsCodemirror: () => import('@/resources/plugins/TsCodemirror/TsCodemirror.vue'),
    ReportParam: () => import('./report-param.vue'),
    ReportContent: () => import('./report-content.vue'),
    ContentHelp: () => import('./content-help.vue'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
  },
  props: {
    id: {type: Number},
    isCopy: {
      type: Boolean,
      default: false
    }
  },
  data() {
    var _this = this;
    return {
      isSaving: false,
      reportDialogConfig: {
        type: 'slider',
        maskClose: false,
        isShow: true,
        width: '1200px'
      },
      reportData: {},
      reportFormConfig: [
        {
          type: 'text',
          name: 'id',
          isHidden: true
        },
        {
          type: 'text',
          name: 'name',
          label: this.$t('page.name'),
          maxlength: 50,
          validateList: ['required', {
            name: 'searchUrl',
            url: '/api/rest/report/save',
            key: 'name',
            message: this.$t('message.nameexists'),
            params: { id: ''}
          }],
          width: 400,
          onChange: function(name) {
            _this.reportData.name = name;
          }
        },
        {
          type: 'text',
          name: 'type',
          label: this.$t('page.type'),
          maxlength: 50,
          width: 400,
          onChange: function(name) {
            _this.reportData.type = name;
          }
        },
        {
          type: 'userselect',
          name: 'authList',
          label: this.$t('page.useauth'),
          width: 400,
          groupList: ['common', 'user', 'team', 'role'],
          onChange: function(name) {
            _this.reportData.authList = name;
          }
        },
        {
          type: 'slot',
          name: 'isActive',
          label: this.$t('term.report.isactive')
        },
        { type: 'slot', name: 'config', label: '' }
      ]};
  },
  beforeCreate() {},
  created() {
    this.getReportById();
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
    getReportById: function() {
      if (this.id) {
        if (!this.isCopy) {
          this.isValidSelf(this.id);
        }
        this.$api.report.report.getReportById(this.id).then(res => {
          this.reportData = res.Return;
          this.reportFormConfig.forEach(element => {
            if (element.name == 'name' && this.isCopy) {
              element.value = this.reportData[element.name] + '_copy';
              this.reportData[element.name] = this.reportData[element.name] + '_copy';
            } else {
              element.value = this.reportData[element.name];
            }
          });
        });
      } else {
        this.reportData = {id: null, name: null, type: null, isActive: 0, sql: null, condition: null, content: null};
        this.reportFormConfig.forEach(element => {
          element.value = this.reportData[element.name];
        });
      }
    },
    close: function(needRefresh) {
      this.$emit('close', needRefresh);
    },
    saveReport: function() {
      let reportForm = this.$refs['reportForm'];
      if (reportForm.valid()) {
        this.isSaving = true;
        let params = this.$utils.deepClone(this.reportData);
        if (this.isCopy) {
          delete params.id;
        }
        this.$api.report.report.saveReport(params).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(true);
          }
        }).catch(error => {
          if (error.Message) {
            this.$Message.error(error.Message);
          } else {
            this.$Message.error(this.$t('message.savefailed'));
          }
        }).finally(() => {
          this.isSaving = false;
        });
      }
    },
    setParam: function(paramList) {
      this.reportData.paramList = paramList;
    },
    setSql: function(sql) {
      this.reportData.sql = sql;
    },
    isValidSelf(id) {
      if (!this.$utils.isEmpty(this.reportFormConfig)) {
        this.reportFormConfig.forEach((item) => {
          if (item.name == 'name') {
            item.validateList.forEach((innerItem) => {
              if (innerItem && innerItem.hasOwnProperty('params')) {
                innerItem.params.id = id || '';
              }
            });
          }
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
    id: {
      handler: function(val) {
        this.getReportById();
      }
    },
    reportData: {
      handler: function(val) {
        //console.log(JSON.stringify(val, null, 2));
      },
      deep: true
    }
  }
};
</script>
<style lang="less">
</style>
