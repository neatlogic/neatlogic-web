<template>
  <div>
    <TsContain>
      <template v-slot:topRight>
        <div>
          <Button
            type="primary"
            ghost
            class="ml-nm"
            @click="$back()"
          >{{ $t('page.cancel') }}</Button>
          <Button
            v-if="current > 0"
            type="primary"
            ghost
            class="ml-nm"
            @click=" current -= 1"
          >{{ $t('page.previousstep') }}</Button>
          <Button
            v-if="current < stepTextList.length - 1"
            type="primary"
            class="ml-nm"
            @click="nextStep(current + 1)"
          >{{ $t('page.thenextstep') }}</Button>
          <Button
            v-if="current == stepTextList.length - 1"
            type="primary"
            class="ml-nm"
            @click="saveAppPipeline()"
          >{{ $t('page.save') }}</Button>
        </div>
      </template>
      <template v-slot:content>
        <div class="step-main">
          <div class="step-top">
            <Steps :current="current">
              <Step
                v-for="(item, index) in stepTextList"
                :key="index"
                :title="item"
                @click.native="stepClick(index)"
              ></Step>
            </Steps>
          </div>
          <div class="step-content">
            <div v-if="current == 0" class="action-form">
              <TsForm ref="formConfig" :item-list="formConfig"></TsForm>
            </div>
            <div v-if="current > 0 && current < 4">
              <div v-if="stepList.length > 0" class="action-group action-btn">
                <div class="action-item tsfont-topo">
                  <Poptip
                    v-model="isShowStepTopo"
                    placement="bottom-start"
                    transfer-class-name="poptip-topo"
                    transfer
                  >
                    <span class="text-action">{{ $t('term.deploy.flowchart') }}</span>
                    <div slot="content" class="step-topo">
                      <StepTopo :stepList="stepList" :execModeList="execModeList" @jumpToStep="jumpToStep"></StepTopo>
                    </div>
                  </Poptip>
                </div>
                <div class="action-item tsfont-down" :class="showAllStepList?'tsfont-up':'tsfont-down'" @click="showSteplist()">
                  {{ showAllStepList? $t('page.putawayall'): $t('page.expandall') }}
                </div>
              </div>
              <div class="action-config">
                <div class="step-config pr-nm">
                  <StepList
                    id="stepList"
                    ref="stepList"
                    :currentStep="currentStep"
                    :stepList="stepList"
                    :runtimeParamList="runtimeParamList"
                    :combopGroupList="combopGroupList"
                    :execModeList="execModeList"
                    @updateSort="updateSort"
                    @change="changeSelectStep"
                  ></StepList>
                </div>
                <div v-if="stepList.length > 0" class="base-config bg-op radius-lg">
                  <div v-show="current==1" class="padding">
                    <StepGroup :currentGroupConfig="currentGroupConfig" @change="changeGroupConfig"></StepGroup>
                  </div>
                  <div v-show="current==2" class="padding">
                    <div class="pb-nm">
                      {{ $t('term.autoexec.presetparameter') }}
                    </div>
                    <ProfileSetting
                      :appSystemId="appSystemId"
                      :referenceList="referenceList"
                      :defaultProfileList="profileList"
                      :canEdit="true"
                      @saveOverrideProfileList="saveOverrideProfileList"
                      @getReferenceList="getReferenceList"
                      @jumpToItem="jumpToItem"
                    ></ProfileSetting>
                  </div>
                  <div v-show="current==3">
                    <div class="pt-nm pl-nm pr-nm">
                      {{ $t('term.deploy.scenesetting') }}
                    </div>
                    <ScenarioSetting
                      :currentScenarioList="scenarioList"
                      :defaultScenarioId="defaultScenarioId"
                      :sortList="stepList"
                      :execModeList="execModeList"
                      @updateDefaultScenarioId="updateDefaultScenarioId"
                    ></ScenarioSetting>
                  </div>
                </div>
              </div>
            </div>
            <div v-show="current == 4" class="action-form">
              <ExecuteSetting
                ref="executeSetting"
                :defaultExecuteConfig="executeConfig"
                :runtimeParamList="runtimeParamList"
                @updateExecuteConfig="updateExecuteConfig"
              ></ExecuteSetting>
            </div>
            <div v-show="current == 5" class="action-form">
              <ActuatorSetting ref="actuatorSetting" :appSystemId="appSystemId"></ActuatorSetting>
            </div>
          </div>
          <div class="step-bottom">
            <Button
              type="primary"
              ghost
              class="ml-nm"
              @click="$back()"
            >{{ $t('page.cancel') }}</Button>
            <Button
              v-if="current > 0"
              type="primary"
              ghost
              class="ml-nm"
              @click=" current -= 1"
            >{{ $t('page.previousstep') }}</Button>
            <Button
              v-if="current < stepTextList.length - 1"
              type="primary"
              class="ml-nm"
              @click="nextStep(current + 1)"
            >{{ $t('page.thenextstep') }}</Button>
            <Button
              v-if="current == stepTextList.length-1"
              type="primary"
              class="ml-nm"
              @click="saveAppPipeline()"
            >{{ $t('page.save') }}</Button>
          </div>
          <!--校验 -->
          <PipelineValid v-model="isShowValid" :validList="validList" @jumpToItem="jumpToItem"></PipelineValid>
        </div>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  provide() {
    return {
      getCombopConfig: this.combopConfig, //流水线详情（阶段）
      jumpToProfile: this.jumpToProfile //定位预置参数
    };
  },
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    StepGroup: resolve => require(['./pipeline/step-group'], resolve),
    ProfileSetting: resolve => require(['./pipeline/profile-setting'], resolve),
    ScenarioSetting: resolve => require(['@/views/pages/autoexec/detail/actionDetail/scenario-setting'], resolve),
    StepTopo: resolve => require(['./pipeline/step/step-topo'], resolve),
    StepList: resolve => require(['./pipeline/step/step-list'], resolve),
    PipelineValid: resolve => require(['./pipeline/pipeline-valid'], resolve),
    ExecuteSetting: resolve => require(['./pipeline/execute-setting'], resolve),
    ActuatorSetting: resolve => require(['./pipeline/actuator-setting'], resolve)
  },
  filters: {
  },
  props: {
  },
  data() {
    return {
      showAllStepList: false, //展示所有阶段
      appSystemId: null, //应用系统ID
      appModuleId: null,
      envId: null,
      current: 0,
      stepTextList: [this.$t('term.deploy.selectiontool'), this.$t('dialog.title.edittarget', {target: this.$t('term.autoexec.pipeline')}), this.$t('term.autoexec.presetparameter'), this.$t('term.deploy.scenesetting'), this.$t('page.executeuser'), this.$t('term.deploy.actuator')],
      formConfig: [
        {
          type: 'select',
          name: 'actionId',
          label: this.$t('term.autoexec.combinationtool'),
          dynamicUrl: '/api/rest/autoexec/combop/list',
          params: {isActive: 1},
          rootName: 'tbodyList',
          valueName: 'id',
          textName: 'name',
          search: true,
          transfer: true,
          border: 'border',
          validateList: ['required'],
          onChange: (val) => {
            this.changeAction(val); 
          }
        }
      ],
      actionConfig: null, //组合工具详情数据
      stepList: [], //阶段列表
      combopGroupList: [], //组列表
      currentGroupConfig: null, //选中的阶段组
      scenarioList: [], //场景列表
      execModeList: [], //执行方式
      runtimeParamList: [], //作业参数
      overrideProfileList: [], //不继承的预置参数
      currentStep: null, //选中的阶段
      profileList: [],
      profileIdList: [], //预置参数id列表
      referenceList: [], //被引用的阶段工具列表
      isShowValid: false,
      validList: [],
      pathParams: {},
      combopConfig: {
        phaseList: [], //阶段
        isEditRuntimeParam: false //是否可以添加作业参数
      },
      defaultScenarioId: null,
      executeConfig: { //执行帐号
        protocolId: null,
        executeUser: {}
      },
      isShowStepTopo: false 
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.query.appSystemId) {
      this.appSystemId = parseInt(this.$route.query.appSystemId);
      this.$set(this.pathParams, 'appSystemId', this.appSystemId);
    }
    if (this.$route.query.appModuleId) {
      this.appModuleId = parseInt(this.$route.query.appModuleId);
      this.$set(this.pathParams, 'appModuleId', this.appModuleId);
    }
    if (this.$route.query.envId) {
      this.envId = parseInt(this.$route.query.envId);
      this.$set(this.pathParams, 'envId', this.envId);
    }
  },
  beforeMount() {},
  mounted() {
    this.getExecModeList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    backAppManage() {
      this.$router.push({
        path: '/application-config-manage',
        query: this.pathParams
      });
    },
    stepClick(index) {
      if (this.current === 0 && index !== 0) {
        this.nextStep(index);
      } else {
        this.current = index;
      }
    },
    nextStep(index) {
      if (this.$refs.formConfig && !this.$refs.formConfig.valid()) {
        return;
      }
      if (index === 4 && !this.scenarioList.length) {
        this.$Notice.error({title: this.$t('term.deploy.addatleastonescene')});
        return;
      }
      if (index === 5 && this.$refs.executeSetting && this.$refs.executeSetting.getValidList().length) {
        return;
      }
      this.current = index;
    },
    changeAction(val) {
      if (val) {
        this.getAction(val);
      }
    },
    getAction(id) { //获取组合工具详情
      let data = {
        id: id
      };
      this.$api.autoexec.action.getActionDetail(data).then(res => {
        if (res.Status == 'OK') {
          this.actionConfig = Object.assign({config: {combopPhaseList: []}}, res.Return);
          this.runtimeParamList = this.actionConfig.config.runtimeParamList || []; //作业参数
          let stepList = this.actionConfig.config.combopPhaseList || [];
          this.stepList = this.getStepList(stepList);
          this.combopConfig.phaseList = this.stepList;
          this.combopGroupList = this.actionConfig.config.combopGroupList || [];
          this.scenarioList = this.actionConfig.config.scenarioList || [];
          this.defaultScenarioId = this.actionConfig.config.defaultScenarioId || null;
          if (this.stepList.length > 0) {
            this.currentStep = this.stepList[0];
          }
          if (this.combopGroupList.length > 0) {
            this.combopGroupList.forEach(item => {
              this.$set(item, 'config', {});
            });
            this.currentGroupConfig = this.combopGroupList[0];
          }
          this.profileIdList = this.getProfileIdList();
          if (this.profileIdList.length > 0) {
            this.getProfileList(this.profileIdList);
          }
          //执行帐号
          if (this.actionConfig.config.executeConfig) {
            Object.keys(this.executeConfig).forEach(key => {
              if (this.actionConfig.config.executeConfig[key]) {
                this.executeConfig[key] = this.actionConfig.config.executeConfig[key];
              }
            });
          }
        }
      });
    },
    getProfileIdList() { //阶段选择的预置参数id
      let profileIdList = [];
      this.stepList.forEach(item => {
        if (item.config && item.config.phaseOperationList && item.config.phaseOperationList.length > 0) {
          item.config.phaseOperationList.forEach(p => {
            if (p.config && p.config.profileId) {
              !profileIdList.includes(p.config.profileId) && profileIdList.push(p.config.profileId);
            }
          });
        }
      });
      return profileIdList;
    },
    getProfileList(profileIdList) { //预置参数
      let data = {
        appSystemId: this.appSystemId
      };
      if (profileIdList && !this.$utils.isEmpty(profileIdList)) {
        this.$set(data, 'defaultValue', profileIdList);
      }
      this.$api.deploy.apppipeline.getAppProfileList(data).then((res) => {
        if (res.Status == 'OK') {
          let list = res.Return || [];
          if (this.profileList && this.profileList.length > 0) {
            let newProfileList = [];
            newProfileList = list.filter(l => {
              return this.profileList.every(p => {
                return p.profileId != l.profileId;
              });
            });
            this.profileList.push(...newProfileList);
          } else {
            this.profileList = list;
          }
        }
      });
    },
    getExecModeList() {
      let data = {enumClass: 'neatlogic.framework.autoexec.constvalue.ExecMode'};
      return this.$api.autoexec.action.getParamsTypeLit(data).then(res => {
        if (res.Status == 'OK') {
          this.execModeList = res.Return;
        }
      });
    },
    showSteplist() {
      this.showAllStepList = !this.showAllStepList;
      this.stepList.forEach(item => {
        this.$set(item, 'isShow', this.showAllStepList);
        if (item.config && !this.$utils.isEmpty(item.config.phaseOperationList)) {
          item.config.phaseOperationList.forEach(p => {
            this.$set(p, 'isShow', this.showAllStepList);
          });
        }
      });
      this.$nextTick(() => {
        this.$refs.stepList.renderHeight();
      });
    },
    getStepList(stepList) {
      return stepList.length ? stepList.map(l => {
        let obj = {
          name: l.name,
          execMode: l.execMode,
          scriptLength: l.config && l.config.phaseOperationList ? l.config.phaseOperationList.length : 0,
          config: this.$utils.deepClone(l.config),
          uuid: l.uuid,
          sort: l.sort,
          groupSort: l.groupSort,
          groupUuid: l.groupUuid,
          groupId: l.groupId || null
        };
        this.$set(obj.config, 'executeConfig', {}); //应用系统层：阶段不需要设置执行目标
        if (l.hasOwnProperty('policy')) {
          l.policy && this.$set(obj, 'policy', l.policy);
          !l.policy && this.$delete(l, 'policy');
        }
        return obj;
      }) : [];
    },
    updateSort(stepList) {
      this.stepList = stepList;
      this.combopConfig.phaseList = this.stepList;
      this.updatedCombopGroupList(stepList);
      this.updateScenarioList(stepList);
      //更新选择的预置参数
      let profileIdList = this.getProfileIdList();
      if (profileIdList.length && !this.$utils.isSame(profileIdList, this.profileIdList)) {
        this.profileIdList = profileIdList;
        this.profileList = this.updateProfileList(this.profileIdList, this.profileList);
        this.getProfileList(this.profileIdList);
      } else if (!profileIdList.length) {
        this.profileList = [];
      }
    },
    updateProfileList(profileIdList, profileList) { //更新预置参数
      let list = [];
      if (profileIdList.length > 0) {
        profileList.length && profileList.forEach(item => {
          if (profileIdList.includes(item.profileId)) {
            list.push(item);
          }
        });
      } 
      return list;
    },
    changeSelectStep(item) {
      this.currentStep = item;
      if (item && item.groupUuid) {
        let findGroup = this.combopGroupList.find(c => c.uuid == item.groupUuid);
        findGroup && (this.currentGroupConfig = findGroup);
      }
    },
    updatedCombopGroupList(stepList) { //更新组列表
      let newList = []; 
      stepList.forEach(item => {
        let findItem = this.combopGroupList.find(c => c.uuid == item.groupUuid);
        if (findItem) {
          findItem.sort = item.groupSort;
          newList.push(findItem);
        }
      });
      let combopGroupList = newList.reduce((list, item) => {
        if (list.findIndex(e => e.uuid == item.uuid) === -1) {
          list.push(item);
        }
        return list;
      }, []);
      combopGroupList.sort((a, b) => {
        return a.sort - b.sort;
      });
      this.combopGroupList = combopGroupList;
    },
    updateScenarioList(stepList) { //更新场景
      let scenarioList = [];
      this.scenarioList.forEach(item => {
        let combopPhaseNameList = [];
        item.combopPhaseNameList.forEach(c => {
          let findItem = stepList.find(s => s.name == c);
          if (findItem) {
            combopPhaseNameList.push(c);
          }
        });
        if (combopPhaseNameList.length > 0) {
          let config = {
            scenarioId: item.scenarioId,
            scenarioName: item.scenarioName,
            combopPhaseNameList: combopPhaseNameList
          };
          scenarioList.push(config);
        }
      });
      this.scenarioList = scenarioList;
    },
    changeGroupConfig(config) {
      this.combopGroupList.forEach(item => {
        if (item.id == config.id) {
          this.$set(item, 'policy', config.policy);
        }
      });
    },
    saveOverrideProfileList(list) {
      this.profileList = list;
      let overrideProfileList = [];
      if (list && list.length > 0) {
        list.forEach(item => {
          let paramList = [];
          item.paramList && item.paramList.forEach(p => {
            if (!p.inherit) {
              paramList.push(p);
            }
          });
          if (paramList.length > 0) {
            overrideProfileList.push({
              paramList: paramList,
              profileId: item.profileId,
              profileName: item.profileName
            });
          }
        });
      }
      this.overrideProfileList = overrideProfileList;
    },
    getReferenceList(obj) {
      let referenceList = [];
      this.stepList.forEach(item => {
        if (item.config.phaseOperationList.length) {
          item.config.phaseOperationList.forEach(p => {
            if (p.config && p.config.profileId == obj.profileId && p.config.paramMappingList && p.config.paramMappingList.length) {
              p.config.paramMappingList.forEach(m => {
                if (m.key == obj.key && m.mappingMode == 'profile') {
                  let findParam = p.operation.inputParamList.find(i => i.key == m.key);
                  referenceList.push({
                    text: item.name + '/' + p.operationName + '/' + findParam.name,
                    stepUuid: item.uuid,
                    operationUuid: p.uuid,
                    id: '#id_' + item.uuid + '_' + p.uuid
                  });
                }
              });
            }
          });
        }
      });
      this.referenceList = referenceList;
    },
    jumpToItem(obj) { //定位参数
      obj.current && (this.current = obj.current);
      this.stepList.forEach(item => {
        if (item.uuid == obj.stepUuid) {
          this.$set(item, 'isShow', true);
          if (item.config && item.config.phaseOperationList && item.config.phaseOperationList.length) {
            item.config.phaseOperationList.forEach(p => {
              if (p.uuid == obj.operationUuid) {
                this.$set(p, 'isShow', true);
              }
            });
          }
          this.changeSelectStep(item);
          this.$nextTick(() => {
            this.$refs.stepList && this.$refs.stepList.valid();
          });
        }
      });
      this.$utils.jumpTo(obj.id);
    },
    getValidList() { //流水线检验
      let validList = [];
      let stepList = this.stepList;
      if (!stepList.length) {
        //至少有一个阶段
        validList = [{ text: this.$t('term.deploy.chooseatleastonephase'), type: 'error', current: 1 }];
      } else {
        stepList.forEach(v => {
          //校验至少一个脚本+输入参数如果必填需要有值
          if (!v.config || !v.config.phaseOperationList || !v.config.phaseOperationList.length) {
            validList.push({
              text: this.$t('term.deploy.phaseatleastonetool', {target: v.name}),
              type: 'error',
              stepUuid: v.uuid,
              id: '#step_' + v.uuid,
              current: 1
            });
          } else if (v.config && v.config.phaseOperationList.length) {
            //工具数据校验
            let validOperationList = this.validPhaseOperationList(v, v.config.phaseOperationList);
            if (validOperationList.length > 0) {
              validList.push(...validOperationList);
            }
          }
        });
      }
      //至少需要设置一个场景
      if (!this.scenarioList.length) {
        validList.push({ text: this.$t('term.deploy.addatleastonescene'), type: 'error', current: 3 });
      }
      //执行用户
      if (this.$refs.executeSetting) {
        let executeValidList = this.$refs.executeSetting.getValidList();
        executeValidList.length && validList.push(...executeValidList);
      }
      validList.length && this.$refs.stepList && this.$refs.stepList.valid();
      return validList;
    },
    validPhaseOperationList(step, phaseOperationList) { //校验工具列表
      let validList = [];
      phaseOperationList.forEach(p => {
        if (p.operationName == 'native/IF-Block') {
          if (p.config) {
            !p.config.condition && validList.push({
              text: this.$t('term.deploy.phasesetcondition', {stepname: step.name, operationname: p.operationName}),
              type: 'error',
              stepUuid: step.uuid,
              operationUuid: p.uuid,
              id: '#id_' + step.uuid + '_' + p.uuid,
              current: 1
            });
            if (p.config.ifList && p.config.ifList.length) {
              let validIfList = this.validPhaseOperationList(step, p.config.ifList);
              validIfList.length && validList.push(...validIfList);
            }
            if (p.config.elseList && p.config.elseList.length) {
              let validElseList = this.validPhaseOperationList(step, p.config.elseList);
              validElseList.length && validList.push(...validElseList);
            }
          }
        } else {
          let isPass = true; //输入参数
          let isPassArgument = true; //自由参数必填校验
          if (p.operation) {
            if (p.config) {
            //输入参数
              if (p.config.paramMappingList && p.config.paramMappingList.length) {
                p.config.paramMappingList.forEach(m => {
                  if (this.$utils.isEmpty(m.value) && m.mappingMode != 'isempty') {
                    isPass = false;
                  } else if (!this.$utils.isEmpty(m.value) && m.mappingMode === 'constant') {
                    let paramConfig = p.operation.inputParamList.find(i => i.key == m.key);
                    if (paramConfig && paramConfig.config && !this.$utils.isEmpty(paramConfig.config.validateList)) {
                      isPass = !!(isPass && this.$utils.validParamValue(m.value, paramConfig.config.validateList));
                    }
                  }
                });
                if (!isPass) {
                  validList.push({
                    text: this.$t('term.deploy.phasesetinputparamtip', {stepname: step.name, operationname: p.operationName}),
                    type: 'error',
                    stepUuid: step.uuid,
                    operationUuid: p.uuid,
                    id: '#id_' + step.uuid + '_' + p.uuid,
                    current: 1
                  });
                }
              }
              //自由参数数据校验判断
              if (p.config.argumentMappingList && p.config.argumentMappingList.length > 0) {
                p.config.argumentMappingList.forEach(m => {
                  if (this.$utils.isEmpty(m.value)) {
                    isPassArgument = false;
                  }
                });
                if (!isPassArgument) {
                  validList.push({
                    text: this.$t('term.deploy.phasesetfreeparamtip', {stepname: step.name, operationname: p.operationName}),
                    type: 'error',
                    stepUuid: step.uuid,
                    operationUuid: p.uuid,
                    id: '#id_' + step.uuid + '_' + p.uuid,
                    current: 1
                  });
                }
              }
              //预置参数集校验
              if (p.config.isActive && !p.config.profileId) {
                validList.push({
                  text: this.$t('term.deploy.phaseselectpresetparamtip', {stepname: step.name, operationname: p.operationName}),
                  type: 'error',
                  stepUuid: step.uuid,
                  operationUuid: p.uuid,
                  id: '#id_' + step.uuid + '_' + p.uuid,
                  current: 1
                });
              }
            }
          } else {
            validList.push({
              text: this.$t('term.deploy.phasetooldeletetip', {stepname: step.name, operationname: p.operationName}),
              type: 'error',
              stepUuid: step.uuid,
              operationUuid: p.uuid,
              id: '#id_' + step.uuid + '_' + p.uuid,
              current: 1
            });
          }
        }
      });
      return validList;
    },
    getSaveData() { //需要保存的数据处理
      let data = {
        appSystemId: this.appSystemId,
        config: {
          runtimeParamList: this.runtimeParamList,
          combopPhaseList: [],
          combopGroupList: this.combopGroupList,
          scenarioList: this.scenarioList,
          overrideProfileList: this.overrideProfileList,
          executeConfig: this.executeConfig
        }
      };
      let list = this.$utils.deepClone(this.stepList);
      list.forEach(item => {
        //去除多余得数据
        delete item.isSelect;
        delete item.isShow;
        delete item.scriptLength;
        item.config &&
            item.config.phaseOperationList && 
            this.$set(item.config, 'phaseOperationList', this.savePhaseOperationList(item.config.phaseOperationList));
        this.combopGroupList.forEach(c => {
          if (c.policy == 'grayScale' && c.uuid == item.groupUuid) {
            item.config && this.$set(item.config, 'executeConfig', {});
          }
        });
      });
      this.$set(data.config, 'combopPhaseList', list);
      if (this.defaultScenarioId) {
        this.$set(data.config, 'defaultScenarioId', this.defaultScenarioId);
      }
      if (this.$refs.actuatorSetting) { 
        let moduleRunnerGroupList = this.$refs.actuatorSetting.save();
        this.$set(data.config, 'moduleRunnerGroupList', moduleRunnerGroupList);
      }
      return data; 
    },
    savePhaseOperationList(list) { //工具
      let phaseOperationList = this.$utils.deepClone(list);
      phaseOperationList.forEach(item => {
        delete item.operation;
        if (item.operationName == 'native/IF-Block') {
          if (item.config.ifList && item.config.ifList.length) {
            this.$set(item.config, 'ifList', this.savePhaseOperationList(item.config.ifList));
          }
          if (item.config.elseList && item.config.elseList.length) {
            this.$set(item.config, 'elseList', this.savePhaseOperationList(item.config.elseList));
          }
        } else {
          delete item.config.profileParamList;
          if (item.config && item.config.paramMappingList) {
            delete item.config.isActive;
            if (item.config.hasOwnProperty('profileId') && !item.config.profileId) {
              delete item.config.profileId;
            }
            item.config.paramMappingList = item.config.paramMappingList.map(param => {
              return {
                key: param.key,
                mappingMode: param.mappingMode,
                value: param.value
              };
            });
          }
        }
      });
      return phaseOperationList;
    },
    //保存应用配置流水线
    saveAppPipeline() {
      this.validList = this.getValidList();
      if (this.validList.length > 0) {
        this.isShowValid = true;
        return false;
      }
      this.$api.deploy.apppipeline.saveAppPipeline(this.getSaveData()).then(res => {
        if (res.Status == 'OK') {
          this.backAppManage();
        }
      });
    },
    updateDefaultScenarioId(id) { //更新场景默认值
      this.defaultScenarioId = id;
    },
    updateExecuteConfig(config) {
      config && Object.keys(this.executeConfig).forEach(key => {
        if (config[key]) {
          this.$set(this.executeConfig, key, config[key]);
        }
      });
    },
    jumpToProfile(id) {
      this.current = 2;
      this.$nextTick(() => {
        this.$utils.jumpTo('#profile_' + id);
      });
    },
    jumpToStep(step) {
      this.isShowStepTopo = false;
      this.changeSelectStep(step);
      this.$utils.jumpTo('#step_' + step.uuid);
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.step-main {
  .step-top {
    width: 80%;
    margin: 0 auto;
    padding: 16px 0;
  }
  .step-content {
    .action-form {
      width: 50%;
      margin: 0 auto;
    }
    .action-btn {
      height: 20px;
      padding-left: 30px;
    }
    .action-config {
      display: flex;
      width: 100%;
      height: calc(100vh - 100px - 20px - 138px);
      .step-config {
        position: relative;
        width: 50%;
        height: 100%;
        overflow: hidden;
      }
      .base-config {
        width: 50%;
        height: 100%;
        overflow-y: auto;
      }
    }
  }
  .step-bottom {
    width: 100%;
    padding-top: 24px;
    padding-bottom: 8px;
    text-align: center;
  }
}
.poptip-topo {
  .step-topo {
    max-height: 400px;
    overflow-y: auto;
  }
}
</style>
