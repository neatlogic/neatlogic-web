<template>
  <div>
    <TsContain v-if="reportData" :hasContentPadding="false">
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back('/report-manage')">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <div class="action-group">
          <div class="action-item">
            {{ $t('page.name') }}
          </div>
          <div class="action-item">
            <TsFormInput
              ref="nameInput"
              v-model="reportData.name"
              border="border"
              :maxlength="50"
              :width="200"
              :validateList="nameValidateList"
              :errorMessage="nameErrorMessage"
              @on-change="clearNameError"
            ></TsFormInput>
          </div>
          <div class="action-item">
            {{ $t('page.type') }}
          </div>
          <div class="action-item">
            <TsFormInput
              v-model="reportData.type"
              :width="200"
              border="border"
              :maxlength="50"
            ></TsFormInput>
          </div>
          <div class="action-item">{{ $t('page.auth') }}</div>
          <div class="action-item">
            <UserSelect
              v-model="reportData.authList"
              :groupList="['common', 'user', 'team', 'role']"
              transfer
              :width="200"
              border="border"
            ></UserSelect>
          </div>
          <div class="action-item"> <TsFormSwitch
            v-model="reportData.isActive"
            :true-value="1"
            :false-value="0"
            showStatus
          ></TsFormSwitch></div>
        </div>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <div class="action-item">
            <Button type="primary" :loading="isSaving" @click="saveReport()">{{ $t('page.save') }}</Button>
          </div>
        </div>
      </template>
      <template v-slot:content>
        <div class="padding">
          <Tabs v-model="activeTab" :animated="false">
            <TabPane :label="$t('term.report.datasourceconfig')" name="datasource"></TabPane>
            <TabPane :label="$t('term.report.conditionconfig')" name="condition"></TabPane>
            <TabPane :label="$t('term.report.contentconfig')" name="content"></TabPane>
          </Tabs>
          <div class="pt-sm">
            <ReportParam v-if="activeTab === 'condition'" :paramList="reportData.paramList" @setParam="setParam"></ReportParam>
            <ReportContent
              v-if="activeTab === 'datasource'"
              :reportData="reportData"
              @setSql="setSql"
              @setSqlEditMode="setSqlEditMode"
              @setSqlGraphConfig="setSqlGraphConfig"
              @setContent="setContent"
            ></ReportContent>
            <ReportContentEditor v-if="activeTab === 'content'" v-model="reportData.content" :reportData="reportData"></ReportContentEditor>
          </div>
        </div>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: 'ReportEdit',
  components: {
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    ReportParam: () => import('./report-param.vue'),
    ReportContent: () => import('./report-content.vue'),
    ReportContentEditor: () => import('./contenteditor/content-editor.vue'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    UserSelect: () => import('@/resources/components/UserSelect/UserSelect.vue')
  },
  props: {
    id: { type: Number },
    isCopy: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      activeTab: 'datasource',
      isSaving: false,
      nameErrorMessage: '',
      reportData: {},
      nameValidateList: ['required']
    };
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
      const id = this.currentId;
      const isCopy = this.currentIsCopy;
      if (id) {
        this.$api.report.report.getReportById(id).then(res => {
          this.reportData = res.Return;
          if (!this.reportData.sqlEditMode) {
            this.reportData.sqlEditMode = this.reportData.sql ? 'xml' : 'graph';
          }
          if (isCopy) {
            this.reportData.name = this.reportData.name + '_copy';
          }
        });
      } else {
        this.reportData = { id: null, name: null, type: null, isActive: 0, sql: null, sqlEditMode: 'graph', sqlGraphConfig: null, condition: null, content: null };
      }
    },
    saveReport: async function() {
      if (this.isSaving) {
        return;
      }
      const isValid = await this.validBasicInfo();
      if (isValid) {
        this.isSaving = true;
        let params = this.$utils.deepClone(this.reportData);
        if (this.currentIsCopy) {
          delete params.id;
        }
        try {
          const res = await this.$api.report.report.saveReport(params);
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
          }
        } catch (error) {
          if (error.Message) {
            this.$Message.error(error.Message);
          } else {
            this.$Message.error(this.$t('message.savefailed'));
          }
        } finally {
          this.isSaving = false;
        }
      }
    },
    validBasicInfo: async function() {
      this.nameErrorMessage = '';
      const nameInput = this.$refs.nameInput;
      if (nameInput && !nameInput.valid()) {
        return false;
      }
      return await this.validReportName();
    },
    validReportName: async function() {
      const params = {
        id: this.currentIsCopy ? '' : this.currentId || '',
        name: this.reportData.name
      };
      try {
        await this.$api.report.report.validReportName(params);
        this.nameErrorMessage = '';
        return true;
      } catch (error) {
        this.nameErrorMessage = error && error.Message ? error.Message : this.$t('message.nameexists');
        this.$nextTick(() => {
          this.$refs.nameInput && this.$refs.nameInput.valid();
        });
        return false;
      }
    },
    clearNameError: function() {
      this.nameErrorMessage = '';
    },
    setParam: function(paramList) {
      this.reportData.paramList = paramList;
    },
    setSql: function(sql) {
      this.reportData.sql = sql;
    },
    setSqlEditMode: function(sqlEditMode) {
      this.reportData.sqlEditMode = sqlEditMode;
    },
    setSqlGraphConfig: function(sqlGraphConfig) {
      this.reportData.sqlGraphConfig = sqlGraphConfig;
    },
    setContent: function(content) {
      this.reportData.content = content;
    }
  },
  filter: {},
  computed: {
    currentId() {
      const routeId = this.$route && this.$route.params ? this.$route.params.id : null;
      const id = this.id || routeId;
      return id ? Number(id) : null;
    },
    currentIsCopy() {
      const query = this.$route && this.$route.query ? this.$route.query : {};
      return this.isCopy || query.isCopy === '1' || query.isCopy === 'true';
    }
  },
  watch: {
    id: {
      handler: function(val) {
        this.getReportById();
      }
    },
    $route: {
      handler: function() {
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
