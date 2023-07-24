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
                :xs="12"
                :sm="8"
                :md="6"
                :lg="4"
                :xl="3"
                :xxl="2"
              >
                <div 
                  v-if="hasScenarioAuth(item.scenarioId)"
                  class="li-item text-action" 
                  :class="jobTemplateData.scenarioId == item.scenarioId ? 'li-active li-text border-primary' : 'border-base bg-op'" 
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
                :xs="12"
                :sm="8"
                :md="6"
                :lg="4"
                :xl="3"
                :xxl="2"
              >
                <div 
                  v-if="hasEnvAuth(item.id)"
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
          </div>
        </div>
        <div>
          <Divider orientation="start" class="divier">{{ $t('term.autoexec.batchsetting') }}</Divider>
          <div class="pr-nm pl-nm pb-nm">
            <Slider
              :value="roundIndex"
              :min="0"
              :max="10"
              :step="1"
              show-tip="never"
              :marks="roundMark"
              @on-change="
                val => {
                  $set(jobTemplateData, 'roundCount', roundList[val]);
                }
              "
            ></Slider>
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
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    ModuleList: resolve => require(['@/views/pages/deploy/job/publishing/module-list'], resolve),
    SetParam: resolve => require(['@/views/pages/autoexec/detail/runnerDetail/param.vue'], resolve)
  },
  props: {
    id: { type: Number },
    job: {type: Object},
    appSystemId: {type: Number},
    type: {type: String}
  },
  data() {
    return {
      roundList: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024],
      isLoading: false,
      jobTemplateData: {
        appSystemId: null,
        envId: null,
        scenarioId: null,
        roundCount: 1, 
        config: { param: {}, selectNodeList: [] } 
      },
      scenarioList: [], //场景列表
      envList: [], //环境列表
      hasAuthorityScenarioIdList: [], // 有授权的场景id列表
      hasAuthorityEnvIdList: [], // 有授权的环境id列表
      appModuleList: [], //模块列表
      runtimeParamList: [], //参数列表
      combopPhaseList: [],
      isModuleLoading: false,
      dialogConfig: {
        title: this.$t('dialog.title.addtarget', {target: this.$t('term.autoexec.job')}),
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
      }
    };
  },
  beforeCreate() {},
  created() {
    if (this.appSystemId) {
      this.$set(this.jobTemplateData, 'appSystemId', this.appSystemId);
      this.$set(this.appSystemConfig, 'disabled', true);
    }
    if (this.id) {
      this.getJobTemplateById();
    } else if (this.job) {
      this.jobTemplateData = this.job;
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
    toggleCheckAllModule(val) {},
    getJobTemplateById() {
      if (this.id) {
        this.$api.deploy.pipeline.getJobTemplateById(this.id).then(res => {
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
            this.hasAuthorityScenarioIdList = res.Return.hasAuthorityScenarioIdList;
            this.hasAuthorityEnvIdList = res.Return.hasAuthorityEnvIdList;
            if (this.scenarioList && this.scenarioList.length > 0) {
              if (this.jobTemplateData.scenarioId) {
                if (this.type == 'global') {
                  if (this.scenarioList.findIndex(item => item.scenarioId == this.jobTemplateData.scenarioId) == -1) {
                    this.jobTemplateData.scenarioId = null;
                  }
                } else {
                  if (!this.hasAuthorityScenarioIdList.includes(this.jobTemplateData.scenarioId)) {
                    this.jobTemplateData.scenarioId = null;
                  }
                }
              }
              if (!this.jobTemplateData.scenarioId && res.Return.defaultScenarioId) {
                if (this.type == 'global') {
                  this.jobTemplateData.scenarioId = res.Return.defaultScenarioId;
                } else {
                  if (this.hasAuthorityScenarioIdList.includes(res.Return.defaultScenarioId)) {
                    this.jobTemplateData.scenarioId = res.Return.defaultScenarioId;
                  }
                }
              }
              if (this.jobTemplateData.scenarioId) {
                let findScenario = this.scenarioList.find(d => d.scenarioId === this.jobTemplateData.scenarioId);
                if (findScenario) {
                  this.selectScenario(findScenario);
                }
              } else {
                if (this.type == 'global') {
                  this.selectScenario(this.scenarioList[0]);
                } else {
                  let scenarioIndex = this.scenarioList.findIndex((item) => {
                    return this.hasAuthorityScenarioIdList.includes(item.scenarioId);
                  });
                  if (scenarioIndex != -1) {
                    this.selectScenario(this.scenarioList[scenarioIndex]);
                  }
                }
              }
            }
            if (this.envList && this.envList.length > 0) {
              if (this.jobTemplateData.envId) {
                if (!this.hasAuthorityEnvIdList.includes(this.jobTemplateData.envId)) {
                  if (this.type != 'global') {
                    this.jobTemplateData.envId = null;
                    let envIndex = this.envList.findIndex((item) => {
                      return this.hasAuthorityEnvIdList.includes(item.id);
                    });
                    if (envIndex != -1) {
                      this.jobTemplateData.envId = this.envList[envIndex].id;
                    }
                  }
                }
              }
              if (this.jobTemplateData.envId) {
                let findEnv = this.envList.find(d => d.id === this.jobTemplateData.envId);
                if (findEnv) {
                  this.selectEnv(findEnv);
                }
              } else {
                if (this.type == 'global') {
                  this.selectEnv(this.envList[0]);
                } else {
                  let envIndex = this.envList.findIndex((item) => {
                    return this.hasAuthorityEnvIdList.includes(item.id);
                  });
                  if (envIndex != -1) {
                    this.selectEnv(this.envList[envIndex]);
                  }
                }
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
                  if (this.jobTemplateData.config.selectNodeList && this.jobTemplateData.config.selectNodeList.length > 0) {
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
      this.$set(this.jobTemplateData, 'envId', env.id);
      this.$set(this.jobTemplateData, 'envName', env.name);
    },
    checkAppModule(val) {
      console.log(val);
    },
    save() {
      if (!this.jobTemplateData.id && !this.jobTemplateData.uuid) {
        if (!this.jobTemplateData.config) {
          this.$set(this.jobTemplateData, 'config', {});
        }
        if (this.$refs.param) {
          this.$set(this.jobTemplateData.config, 'param', this.$refs.param.getValue());
        }
        const moduleList = this.$refs?.moduleList.getData() || [];
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
          this.$emit('insert', jobTemplateList);
        } else {
          this.$Message.info(this.$t('form.placeholder.pleaseselect', {target: this.$t('page.module')}));
        }
      } else {
        const moduleList = this.$refs?.moduleList.getData() || [];
        if (moduleList && moduleList.length == 1) {
          const module = moduleList[0];
          this.jobTemplateData.config.selectNodeList = module.selectNodeList;
          this.$emit('update', this.jobTemplateData);
        } else {
          this.$Message.info(this.$t('form.placeholder.pleaseselect', {target: this.$t('page.module')}));
        }
      }
    },
    close() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {
    hasScenarioAuth() {
      // 场景权限
      return (scenarioId) => {
        if (this.type == 'global' || this.hasAuthorityScenarioIdList.includes(scenarioId)) {
          return true;
        }
        return false;
      };
    },
    hasEnvAuth() {
      // 环境权限
      return (envId) => {
        if (this.type == 'global' || this.hasAuthorityEnvIdList.includes(envId)) {
          return true;
        }
        return false;
      };
    },
    envName() {
      if (this.jobTemplateData.envId) {
        const env = this.envList.find(d => d.id === this.jobTemplateData.envId);
        if (env) {
          return env.name;
        }
      }
      return '';
    },
    roundIndex() {
      if (this.jobTemplateData.roundCount) {
        return this.roundList.findIndex(d => d == this.jobTemplateData.roundCount);
      }
      return 0;
    },
    roundMark() {
      const d = {};
      this.roundList.forEach((val, index) => {
        d[index] = val.toString();
      });
      return d;
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
    /deep/ &.ivu-tooltip {
      width: 100%;
    }
    /deep/ .ivu-tooltip-rel {
      width: 100%;
    }
    .width-box {
      width: 100%;
    }
  }
</style>
