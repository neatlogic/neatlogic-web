<template>
  <div>
    <TsDialog
      v-if="reportData"
      v-bind="reportDialogConfig"
      @on-close="close"
    >
      <template v-slot:header>
        <div v-if="reportData.id">{{ isCopy ? '复制模板' : $t('report.template.edit') }}</div>
        <div v-if="!reportData.id">{{ $t('report.template.add') }}</div>
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
              <TabPane label="条件配置">
                <ReportParam :paramList="reportData.paramList" @setParam="setParam"></ReportParam></TabPane>
              <TabPane label="数据源配置">
                <ReportContent :reportData="reportData" @setSql="setSql"></ReportContent>
              </TabPane>
              <TabPane label="内容配置">
                <ContentHelp></ContentHelp>
                <TsCodemirror codeMode="xml" :value.sync="reportData.content" height="500px"></TsCodemirror>
              </TabPane>
              <!-- <TabPane label="帮助"><ReportHelp></ReportHelp></TabPane> -->
            </Tabs>
          </template>
        </TsForm>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('button.cancel') }}</Button>
        <Button type="primary" :loading="isSaving" @click="saveReport()">{{ $t('button.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsCodemirror: resolve => require(['@/resources/plugins/TsCodemirror/TsCodemirror.vue'], resolve),
    ReportParam: resolve => require(['./report-param.vue'], resolve),
    ReportContent: resolve => require(['./report-content.vue'], resolve),
    ContentHelp: resolve => require(['./content-help.vue'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve)
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
        width: 'large'
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
          label: _this.$i18n.t('page.name'),
          maxlength: 50,
          validateList: ['required', { 
            name: 'searchUrl',
            url: '/api/rest/report/save',
            key: 'name',
            message: '名称已存在',
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
          label: _this.$i18n.t('page.type'),
          maxlength: 50,
          width: 400,
          onChange: function(name) {
            _this.reportData.type = name;
          }
        }, 
        {
          type: 'userselect',
          name: 'authList',
          label: _this.$i18n.t('common.authorization'),
          width: 400,
          groupList: ['user', 'team', 'role'],
          onChange: function(name) {
            _this.reportData.authList = name;
          }
        },
        {
          type: 'slot',
          name: 'isActive',
          label: _this.$i18n.t('report.isActive')
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
            this.$Message.success(this.$t('message.content.savesuccess'));
            this.close(true);
          }
        }).catch(error => {
          if (error.Message) {
            this.$Message.error(error.Message);
          } else {
            this.$Message.error('保存失败');
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
