<template>
  <div>
    <TsTable
      v-model="valueList"
      :theadList="theadList"
      :multiple="true"
      :canSelectRow="false"
      :tbodyList="appSystemModuleEnvList"
      keyName="id"
      :disabled="disabled"
      @getSelected="getSelectedAppSystemModuleVersion"
    >
      <template v-slot:envScenario="{ row }">
        <div style="while-space:normal">
          <Tag v-for="(envscenario, index) in row.envScenarioList" :key="index">{{ envscenario.envName }}（{{ envscenario.scenarioName }}）</Tag>
        </div>
      </template>
      <template v-slot:version="{ row, index }">
        <div v-if="row._selected">
          <div class="grid">
            <TsFormSelect
              :ref="'version' + index"
              v-model="row.versionId"
              v-bind="getVersionSelectConfig(row)"
              transfer
              :validateList="versionValidateList(row)"
              border="border"
              :disabled="disabled"
              @first="addVersion(row)"
              @change="
                versionId => {
                  setVersionId(row, versionId);
                }
              "
            ></TsFormSelect>
            <div :class="{'require-label':versionValidateList(row).length > 0}"></div>
          </div>
        </div>
      </template>
    </TsTable>
    <VersionDialog v-if="isVersionDialogShow" :jobTemplateData="currentJobTemplate" @close="closeVersionDialog"></VersionDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    VersionDialog: resolve => require(['@/views/pages/deploy/pipeline/version-dialog.vue'], resolve)
  
  },
  props: {
    baseParams: {
      type: Object,
      default: () => {}
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      jobData: { 
        pipelineId: null, 
        appSystemModuleVersionList: []
      },
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
      valueList: [],
      isVersionDialogShow: false,
      currentJobTemplate: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
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
    listPipelineAppSystemModuleEnvScenario() {
      if (this.jobData.pipelineId) {
        this.$api.deploy.pipeline.ListPipelineAppSystemModuleEnvScenario(this.jobData.pipelineId).then(res => {
          this.appSystemModuleEnvList = res.Return;
          this.appSystemModuleEnvList.forEach((item) => {
            let findItem = this.jobData.appSystemModuleVersionList.find(f => f.id == item.id);
            if (findItem) {
              this.$set(item, 'versionId', findItem.versionId);
              this.$set(item, '_selected', true);
            }
          });
          if (this.jobData.appSystemModuleVersionList.length) {
            this.valueList = this.jobData.appSystemModuleVersionList.map(v => {
              return v.id;
            });
          }
        });
      }
    },
    getSelectedAppSystemModuleVersion(indexList, itemList) {
      this.jobData.appSystemModuleVersionList = [];
      if (itemList && itemList.length > 0) {
        itemList.forEach(item => {
          this.jobData.appSystemModuleVersionList.push({
            appSystemId: item.appSystemId,
            appModuleId: item.appModuleId,
            versionId: item.versionId,
            id: item.id
          });
        });
      }
    },
    getVersionSelectConfig(jobTemplate) {
      return {
        dynamicUrl: '/api/rest/deploy/version/search',
        params: {
          appSystemIdList: [jobTemplate.appSystemId]
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
    addVersion(row) {
      this.isVersionDialogShow = true;
      this.currentJobTemplate = row;
    },
    closeVersionDialog() {
      this.isVersionDialogShow = false;
    },
    valid() {
      let isValid = true;
      if (this.appSystemModuleEnvList && this.appSystemModuleEnvList.length > 0) {
        this.appSystemModuleEnvList.forEach((item, index) => {
          if (this.$refs['version' + index] && !this.$refs['version' + index].valid()) {
            isValid = false;
          }
        });
      } 
      if (isValid) {
        if (!this.jobData.appSystemModuleVersionList.length) {
          isValid = false;
        }
      }
      return isValid;
    },
    saveJobData() {
      let data = {
        appSystemModuleVersionList: this.jobData.appSystemModuleVersionList
      };
      return data;
    }
  },
  filter: {},
  computed: {
    versionValidateList() {
      return row => {
        if (row._selected) {
          return [{ name: 'required', message: ' ' }];
        } else {
          return [];
        }
      };
    }
  },
  watch: {
    baseParams: {
      handler(val) {
        if (!this.$utils.isEmpty(val)) {
          this.$set(this.jobData, 'pipelineId', val.pipelineId);
          if (val.config && val.config.appSystemModuleVersionList && val.config.appSystemModuleVersionList.length > 0) {
            this.jobData.appSystemModuleVersionList = val.config.appSystemModuleVersionList;
          }
          this.listPipelineAppSystemModuleEnvScenario();
        }
      },
      immediate: true,
      deep: true
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
