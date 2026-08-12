<template>
  <TsDialog v-bind="dialogConfig" @on-close="close">
    <template v-slot>
      <div>
        <Divider orientation="start" class="divier">{{ $t('term.deploy.applicationsystem') }}</Divider>
        <div v-if="!jobTemplateData.id && !jobTemplateData.uuid">
          <TsFormSelect
            v-bind="appSystemConfig"
            :value="jobTemplateData.appSystemId"
          ></TsFormSelect>
        </div>
        <div v-else>{{ jobTemplateData.appSystemAbbrName }}</div>
      </div>
      <div v-if="jobTemplateData.appSystemId">
        <Loading v-if="isLoading" :loadingShow="isLoading" type="fix"></Loading>
        <div v-if="scenarioList && scenarioList.length > 0" id="scenario">
          <Divider orientation="start" class="divier">{{ $t('page.scene') }}</Divider>
          <div>
            <Row :gutter="16">
              <Col
                v-for="(item, index) in scenarioList"
                :key="index"
                :xs="6"
              >
                <div
                  v-if="item.isEnable"
                  class="li-item text-action overflow"
                  :class="jobTemplateData.scenarioId == item.scenarioId ? 'li-active li-text border-primary' : 'border-base bg-op'"
                  :title="item.scenarioName"
                  @click="selectScenario(item)"
                >{{ item.scenarioName }}</div>
                <Tooltip
                  v-else
                  placement="top"
                  max-width="400"
                  theme="light"
                  transfer
                  class="tooltips-box"
                >
                  <div class="width-box li-item text-action text-disabled border-base bg-op">{{ item.scenarioName }}</div>
                  <div slot="content">
                    <div>{{ $t('term.deploy.notsceneauth', {target: item.scenarioName}) }}</div>
                  </div>
                </Tooltip>
              </Col>
            </Row>
          </div>
        </div>
        <div v-if="envList && envList.length" id="env">
          <Divider orientation="start" class="divier">{{ $t('page.environment') }}</Divider>
          <div>
            <Row :gutter="16">
              <Col
                v-for="(item, index) in envList"
                :key="index"
                :xs="4"
                :sm="4"
                :md="4"
                :lg="4"
                :xl="4"
                :xxl="4"
              >
                <div
                  v-if="item.isEnable"
                  class="li-item text-action"
                  :class="jobTemplateData.envId == item.id ? 'li-active li-text border-primary' : 'border-base bg-op'"
                  @click="selectEnv(item)"
                >{{ item.name }}</div>
                <Tooltip
                  v-else
                  placement="top"
                  max-width="400"
                  theme="light"
                  transfer
                  class="tooltips-box"
                >
                  <div class="width-box li-item text-action text-disabled border-base bg-op">{{ item.name }}</div>
                  <div slot="content">
                    <div>{{ $t('term.deploy.notenvauth', {target: item.name}) }}</div>
                  </div>
                </Tooltip>
              </Col>
            </Row>
          </div>
        </div>
        <div>
          <Divider orientation="start" class="divier">{{ $t('page.module') }}</Divider>
          <div>
            <ModuleList
              ref="moduleList"
              :appSystemId="jobTemplateData.appSystemId"
              :envId="jobTemplateData.envId"
              :envName="envName"
              :loading="isModuleLoading"
              :appModuleList="appModuleList"
              :disableVersionSelect="true"
            ></ModuleList>
            <div v-if="moduleListValidTip" class="text-error">{{ moduleListValidTip }}</div>
          </div>
        </div>
        <div>
          <Divider orientation="start" class="divier">{{ $t('page.autoexecparallel') }}</Divider>
          <div class="pb-nm">
            <TsFormRadio
              v-model="jobTemplateData.parallelPolicy"
              :dataList="parallelPolicyDataList"
              @on-change="changeParallelPolicy"
            ></TsFormRadio>
          </div>
          <div v-if="jobTemplateData.parallelPolicy !== 'roundCount'" class="pb-nm">
            <TsFormSelect
              v-model="jobTemplateData.parallelCount"
              v-bind="parallelForm"
            ></TsFormSelect>
          </div>
          <div v-else class="pb-nm">
            <TsFormSelect
              v-model="jobTemplateData.roundCount"
              v-bind="roundCountForm"
            ></TsFormSelect>
          </div>
        </div>
        <div>
          <Divider v-if="runtimeParamList && runtimeParamList.length > 0" orientation="start" class="divier">{{ $t('term.autoexec.jobparam') }}</Divider>
          <div v-if="runtimeParamList && runtimeParamList.length > 0">
            <SetParam
              ref="param"
              :paramList="runtimeParamList"
              :phaseList="combopPhaseList"
              :param="jobTemplateData.config.param"
            ></SetParam>
          </div>
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <Button @click="close()">{{ $t('page.cancel') }}</Button>
      <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    ModuleList: () => import('@/views/pages/deploy/job/publishing/module-list'),
    SetParam: () => import('@/views/pages/autoexec/detail/runnerDetail/param.vue')
  },
  props: {
    id: { type: Number },
    job: {type: Object},
    appSystemId: {type: Number},
    type: {type: String},
    isUpdateJobTemplate: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isLoading: false,
      jobTemplateData: {
        appSystemId: null,
        envId: null,
        scenarioId: null,
        roundCount: null,
        parallelCount: null,
        parallelPolicy: null,
        config: { param: {}, selectNodeList: [] }
      },
      scenarioList: [], //场景列表
      envList: [], //环境列表
      appModuleList: [], //模块列表
      runtimeParamList: [], //参数列表
      combopPhaseList: [],
      isModuleLoading: false,
      dialogConfig: {
        title: this.$t('dialog.title.addtarget', {target: this.$t('page.job')}),
        type: 'modal',
        width: 'large',
        isShow: true
      },
      appSystemConfig: {
        dynamicUrl: '/api/rest/deploy/app/config/appsystem/search',
        rootName: 'tbodyList',
        valueName: 'id',
        textName: 'abbrName',
        transfer: true,
        disabled: false,
        onChange: (val, item) => {
          this.$set(this.jobTemplateData, 'appSystemId', val);
          this.$set(this.jobTemplateData, 'appSystemAbbrName', item.text);
        }
      },
      roundCountForm: {
        border: 'border',
        dataList: this.getRoundCountList(),
        filterName: 'text',
        search: true,
        transfer: true,
        desc: this.$t('term.autoexec.roundcountdescrition'),
        validateList: ['required', 'maxNum']
      },
      parallelForm: {
        border: 'border',
        dataList: this.getRoundCountList(),
        filterName: 'text',
        search: true,
        transfer: true,
        desc: this.$t('term.autoexec.paralldesc'),
        validateList: ['required', 'maxNum']
      },
      moduleEnvInstanceMap: {},
      parallelPolicyDataList: [
        {
          text: this.$t('page.autoexecparall'),
          value: 'parallel'
        },
        {
          text: this.$t('page.autoexecbatchround'),
          value: 'roundCount'
        }
      ],
      moduleListValidTip: ''
    };
  },
  beforeCreate() {},
  async created() {
    if (this.id && !this.isUpdateJobTemplate) {
      await this.getJobTemplateById();
    } else if (this.job) {
      this.jobTemplateData = this.job;
    }
    if (this.appSystemId) {
      this.$set(this.jobTemplateData, 'appSystemId', this.appSystemId);
      this.$set(this.appSystemConfig, 'disabled', true);
    }
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
    getJobTemplateById() {
      if (this.id) {
        return this.$api.deploy.pipeline.getJobTemplateById(this.id).then(res => {
          this.jobTemplateData = res.Return;
        });
      }
    },
    getAppPipeline() {
      //流水线
      this.$api.deploy.apppipeline
        .getAppPipeline({
          appSystemId: this.jobTemplateData.appSystemId
        })
        .then(res => {
          if (res && res.Status == 'OK') {
            let data = res.Return || {};
            if (data.config) {
              this.runtimeParamList = data.config.runtimeParamList || [];
              this.combopPhaseList = data.config.combopPhaseList || [];
            }
          }
        });
    },
    getCreateJobData() {
      //发布作业
      this.isLoading = true;
      this.$api.deploy.job.getCreateJobData({
        appSystemId: this.jobTemplateData.appSystemId,
        appModuleId: this.jobTemplateData.appModuleId
      })
        .then(res => {
          if (res.Status == 'OK') {
            this.scenarioList = res.Return.scenarioList;
            this.envList = res.Return.envList;
            let defaultSelectScenario = res.Return.defaultSelectScenario;
            let defaultSelectEnv = res.Return.defaultSelectEnv;
            if (this.scenarioList && this.scenarioList.length > 0) {
              if (this.type == 'global') {
                this.scenarioList.forEach(item => { item.isEnable = true; });
                if (defaultSelectScenario.scenarioId != res.Return.defaultScenarioId) {
                  defaultSelectScenario = this.scenarioList[0];
                }
              }
              if (this.jobTemplateData.scenarioId) {
                let findScenario = this.scenarioList.find(item => item.isEnable == true && item.scenarioId == this.jobTemplateData.scenarioId);
                if (findScenario) {
                  this.selectScenario(findScenario);
                } else {
                  this.jobTemplateData.scenarioId = defaultSelectScenario.scenarioId;
                  this.selectScenario(defaultSelectScenario);
                }
              } else {
                this.jobTemplateData.scenarioId = defaultSelectScenario.scenarioId;
                this.selectScenario(defaultSelectScenario);
              }
            }
            if (this.envList && this.envList.length > 0) {
              if (this.type == 'global') {
                this.envList.forEach(item => { item.isEnable = true; });
                defaultSelectEnv = this.envList[0];
              }
              if (this.jobTemplateData.envId) {
                let findEnv = this.envList.find(d => d.id === this.jobTemplateData.envId);
                if (findEnv) {
                  this.selectEnv(findEnv);
                } else {
                  this.selectEnv(defaultSelectEnv);
                }
              } else {
                this.selectEnv(defaultSelectEnv);
              }
            }
            this.getJobModuleList();
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    getJobModuleList() {
      this.isModuleLoading = true;
      this.$api.deploy.job
        .getJobModuleList({
          appSystemId: this.jobTemplateData.appSystemId,
          envId: this.jobTemplateData.envId,
          scenarioId: this.jobTemplateData.scenarioId
        })
        .then(res => {
          if (res && res.Status == 'OK') {
            this.appModuleList = res.Return || [];
            if (this.appModuleList && this.appModuleList.length > 0) {
              if (this.jobTemplateData.appModuleId) {
                const selectedModule = this.appModuleList.find(d => d.id === this.jobTemplateData.appModuleId);
                if (selectedModule) {
                  this.$set(selectedModule, 'isChecked', true);
                  if (this.jobTemplateData.config && this.jobTemplateData.config.selectNodeList && this.jobTemplateData.config.selectNodeList.length > 0) {
                    this.$set(selectedModule, 'isSelectInstance', true);
                    const instanceList = this.$utils.deepClone(this.jobTemplateData.config.selectNodeList);
                    instanceList.forEach(ins => {
                      ins.isChecked = true;
                    });
                    this.$set(selectedModule, 'instanceList', instanceList);
                  }
                }
              }
              if (this.jobTemplateData.id || this.jobTemplateData.uuid) {
                this.appModuleList.forEach(module => {
                  this.$set(module, 'disabled', true);
                });
              }
            }
          }
        })
        .finally(() => {
          this.isModuleLoading = false;
        });
    },
    selectScenario(scenario) {
      this.$set(this.jobTemplateData, 'scenarioId', scenario.scenarioId);
      this.$set(this.jobTemplateData, 'scenarioName', scenario.scenarioName);
    },
    selectEnv(env) {
      if (this.jobTemplateData && this.jobTemplateData.envId) {
        this.getModuleEnvInstanceMap(this.jobTemplateData.envId);
      }

      this.$set(this.jobTemplateData, 'envId', env.id);
      this.$set(this.jobTemplateData, 'envName', env.name);
      this.updateInstanceList(env.id);
    },
    save() {
      let isValid = this.valid();
      this.moduleListValidTip = '';
      const moduleList = this.$refs?.moduleList.getData() || [];
      if (!this.jobTemplateData.config) {
        this.$set(this.jobTemplateData, 'config', {});
      }
      if (this.$refs.param) {
        this.$set(this.jobTemplateData.config, 'param', this.$refs.param.getValue());
      }
      if (!this.jobTemplateData.id && !this.jobTemplateData.uuid) {
        if (moduleList && moduleList.length > 0) {
          const jobTemplateList = [];
          moduleList.forEach(module => {
            const data = this.$utils.deepClone(this.jobTemplateData);
            data.appModuleId = module.id;
            data.appModuleName = module.name;
            data.config.selectNodeList = module.selectNodeList;
            data.uuid = this.$utils.setUuid();
            jobTemplateList.push(data);
          });
          if (isValid) {
            this.$emit('insert', jobTemplateList);
          }
        } else {
          this.moduleListValidTip = this.$t('form.placeholder.pleaseselect', {target: this.$t('page.module')});
        }
      } else {
        if (moduleList && moduleList.length == 1) {
          const module = moduleList[0];
          this.jobTemplateData.config.selectNodeList = module.selectNodeList;
          if (isValid) {
            this.$emit('update', this.jobTemplateData);
          }
        } else {
          this.moduleListValidTip = this.$t('form.placeholder.pleaseselect', {target: this.$t('page.module')});
        }
      }
    },
    close() {
      this.$emit('close');
    },
    getRoundCountList() {
      let list = [
        {
          value: -1,
          text: this.$t('term.autoexec.bluegreenexecute')
        }
      ];
      list.push(...this.$utils.getRoundCountList());
      return list;
    },
    getModuleEnvInstanceMap(envId) {
      if (!envId) {
        return;
      }
      this.appModuleList.forEach(item => {
        const key = 'app_' + item.id + '_' + envId;
        if (item.isSelectInstance) {
          this.$set(this.moduleEnvInstanceMap, key, item.instanceList || []);
        } else {
          this.$set(this.moduleEnvInstanceMap, key, []);
        }
      });
    },
    updateInstanceList(envId) {
      this.appModuleList.forEach(item => {
        this.$set(item, 'isSelectInstance', false);
        const key = 'app_' + item.id + '_' + envId;
        if (this.moduleEnvInstanceMap[key] && !this.$utils.isEmpty(this.moduleEnvInstanceMap[key])) {
          this.$set(item, 'isSelectInstance', false);
          this.$set(item, 'loadingShow', true);
          this.$set(item, 'instanceList', this.moduleEnvInstanceMap[key]);
          this.$nextTick(() => {
            this.$set(item, 'isSelectInstance', true);
          });
        } else {
          this.$set(item, 'isSelectInstance', false);
          this.$set(item, 'instanceList', []);
        }
      });
    },
    changeParallelPolicy(val) {
      if (val && val == 'roundCount') {
        if (this.$utils.isEmpty(this.jobTemplateData.roundCount)) {
          this.jobTemplateData.roundCount = 2;
        }
      } else {
        if (this.$utils.isEmpty(this.jobTemplateData.parallelCount)) {
          this.jobTemplateData.parallelCount = 2;
        }
      }
    },
    valid() {
      let isValid = true;
      if (this.$refs.param && !this.$refs.param.valid()) {
        isValid = false;
      }
      return isValid;
    }
  },
  filter: {},
  computed: {
    envName() {
      if (this.jobTemplateData.envId) {
        const env = this.envList.find(d => d.id === this.jobTemplateData.envId);
        if (env) {
          return env.name;
        }
      }
      return '';
    }
  },
  watch: {
    'jobTemplateData.appSystemId': {
      handler: function(val) {
        if (val) {
          this.getCreateJobData();
          this.getAppPipeline();
        }
      }
    },
    'jobTemplateData.envId': {
      handler: function(val) {
        if (val) {
          if (!this.jobTemplateData.id && !this.jobTemplateData.uuid) {
            this.getJobModuleList();
          }
        }
      }
    },
    'jobTemplateData.scenarioId': {
      handler: function(val) {
        if (val) {
          if (!this.jobTemplateData.id && !this.jobTemplateData.uuid) {
            this.getJobModuleList();
          }
        }
      }
    }
  }
};
</script>
<style lang="less" scoped>
.divier {
  font-size: 13px;
}
.li-item {
  padding: 6px 16px;
  border-radius: 4px;
  text-align: center;
  margin-bottom: 10px;
}
.appModule-title {
  display: flex;
  align-items: center;
}
.instance-box {
  position: relative;
  padding-left: 30px;
  .instance-ul {
    margin-bottom: -10px;
    .instance-li {
      margin-bottom: 10px;
    }
  }
}
.tooltips-box {
    ::v-deep &.ivu-tooltip {
      width: 100%;
    }
    ::v-deep .ivu-tooltip-rel {
      width: 100%;
    }
    .width-box {
      width: 100%;
    }
  }
</style>
