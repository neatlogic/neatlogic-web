<template>
  <div>
    <div>
      <TsForm
        ref="form"
        v-model="jobData"
        :item-list="formConfig"
        :labelWidth="90"
      >
        <template v-slot:moduleList>
          <TsTable
            v-if="appSystemModuleEnvList.length"
            :theadList="theadList"
            :multiple="true"
            :canSelectRow="false"
            :tbodyList="appSystemModuleEnvList"
            @getSelected="getSelectedAppSystemModuleVersion"
          >
            <template v-slot:envScenario="{ row }">
              <div style="while-space:normal">
                <Tag v-for="(envscenario, index) in row.envScenarioList" :key="index">{{ envscenario.envName }}（{{ envscenario.scenarioName }}）</Tag>
              </div>
            </template>
            <template v-slot:version="{ row, index }">
              <div v-if="row._selected && (row.isHasBuildTypeTool == 1 || row.isHasDeployTypeTool == 1)" class="grid">
                <div>
                  <TsFormSelect
                    :ref="'version' + index"
                    v-model="row.versionId"
                    v-bind="getVersionSelectConfig(row)"
                    transfer
                    :validateList="versionValidateList(row)"
                    @first="addVersion(row)"
                    @change="
                      versionId => {
                        setVersionId(row, versionId);
                      }
                    "
                  ></TsFormSelect>
                </div>
                <div v-if="versionValidateList(row).length > 0" class="text-error">*</div>
              </div>
            </template>
          </TsTable>
        </template>
      </TsForm>
    </div>
    <VersionDialog v-if="isVersionDialogShow" :jobTemplateData="currentJobTemplate" @close="closeVersionDialog"></VersionDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    VersionDialog: () => import('./version-dialog.vue')
  },
  props: {
    id: { type: Number }
  },
  data() {
    return {
      isVersionDialogShow: false,
      currentJobTemplate: null,
      jobData: { pipelineId: this.id, appSystemModuleVersionList: [], triggerType: 'manual'},
      theadList: [
        {
          key: 'selection'
        },
        { key: 'appSystemAbbrName', title: this.$t('page.apply') },
        { key: 'appModuleAbbrName', title: this.$t('page.module') },
        { key: 'envScenario', title: this.$t('term.deploy.envscene') },
        { key: 'version', title: this.$t('page.versions'), width: 250 }
      ],
      appSystemModuleEnvList: [],
      pipelineData: {},
      formConfig: {
        name: {
          type: 'text',
          label: this.$t('term.autoexec.jobname'),
          validateList: ['required'],
          maxlength: 50
        },
        triggerType: {
          type: 'radio',
          label: this.$t('page.executionmode'),
          dataList: [
            { value: 'manual', text: this.$t('term.deploy.manualtrigger') },
            { value: 'auto', text: this.$t('term.deploy.automaticexecution') }
          ],
          validateList: ['required'],
          onChange: val => {
            this.$set(this.jobData, 'triggerType', val);
          }
        },
        planStartTime: {
          label: this.$t('page.plantime'),
          transfer: true,
          type: 'datetime',
          isHidden: false,
          valueType: 'timestamp',
          format: 'yyyy-MM-dd HH:mm',
          desc: this.$t('term.deploy.tasktimelimitfiveminutes'),
          selectableRange: () => {
            const now = new Date().getTime();
            return [now + 5 * 60 * 1000, 0];
          },
          validateList: ['required']
        },
        moduleList: {
          type: 'slot',
          hideLabel: true
        }
      }
    };
  },
  beforeCreate() {},
  created() {
    this.listPipelineAppSystemModuleEnvScenario();
    this.jobData.planStartTime = (new Date()).getTime() + 60 * 10 * 1000; //默认十分钟之后
  },
  beforeMount() {},
  mounted() {

  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    setVersionId(row, versionId) {
      this.jobData.appSystemModuleVersionList.forEach(element => {
        if (element.appSystemId == row.appSystemId && element.appModuleId == row.appModuleId) {
          this.$set(element, 'versionId', versionId);
        }
      });
    },
    getSelectedAppSystemModuleVersion(indexList, itemList) {
      this.jobData.appSystemModuleVersionList = [];
      if (itemList && itemList.length > 0) {
        itemList.forEach(item => {
          this.jobData.appSystemModuleVersionList.push({
            appSystemId: item.appSystemId,
            appModuleId: item.appModuleId,
            versionId: item.versionId
          });
        });
      }
    },
    getVersionSelectConfig(jobTemplate) {
      return {
        dynamicUrl: '/api/rest/deploy/version/search',
        params: {
          appSystemIdList: [jobTemplate.appSystemId],
          appModuleIdList: [jobTemplate.appModuleId]
        },
        rootName: 'tbodyList',
        transfer: true,
        search: true,
        dealDataByUrl: this.dealDataFilter,
        firstSelect: false,
        firstText: this.$t('page.versions'),
        firstLi: true
      };
    },
    addVersion(row) {
      this.isVersionDialogShow = true;
      this.currentJobTemplate = row;
    },
    closeVersionDialog(needRefresh) {
      this.isVersionDialogShow = false;
      if (needRefresh) {
        //
      }
    },
    dealDataFilter(nodeList) {
      // 处理默认值的数据结构
      let columlist = [];
      nodeList.forEach(v => {
        let text = v.version;
        if (v.isFreeze) {
          text += this.$t('term.deploy.sealededition');
        } else {
          text;
        }
        columlist.push({
          text: text,
          value: v.id,
          _disabled: v.isFreeze
        });
      });
      columlist.sort((d1, d2) => {
        return d1._disabled - d2._disabled;
      });
      return columlist;
    },
    listPipelineAppSystemModuleEnvScenario() {
      if (this.id) {
        this.$api.deploy.pipeline.ListPipelineAppSystemModuleEnvScenario(this.id).then(res => {
          this.appSystemModuleEnvList = res.Return;
        });
      } else {
        this.appSystemModuleEnvList = [];
      }
    },
    close() {
      this.$emit('close');
    },
    validateForm() {
      const form = this.$refs['form'];
      let isValid = true;
      if (this.appSystemModuleEnvList && this.appSystemModuleEnvList.length > 0) {
        this.appSystemModuleEnvList.forEach((item, index) => {
          if (this.$refs['version' + index] && !this.$refs['version' + index].valid()) {
            isValid = false;
          }
        });
      }
      if (form && !form.valid()) {
        isValid = false;
      }
      return isValid;
    },
    async submitForm() {
      await this.$api.deploy.pipeline.addBatchJob(this.jobData).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
        }
      });
    },
    getVersionValidateList(row) {
      return ['required'];
    }
  },
  filter: {},
  computed: {
    versionValidateList() {
      return row => {
        if (row._selected && (row.isHasBuildTypeTool == 1 || row.isHasDeployTypeTool == 1)) {
          return [{ name: 'required', message: ' ' }];
        } else {
          return [];
        }
      };
    }
  },
  watch: {
    id: {
      handler(val) {
        this.$set(this.jobData, 'pipelineId', val);
        this.listPipelineAppSystemModuleEnvScenario();
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: auto 10px;
}
</style>
