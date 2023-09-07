<template>
  <div>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <TsContain>
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <div class="action-group">
          <div class="action-item">
            <Poptip placement="bottom-start" transfer>
              <span class="tsfont-bar"></span>
              <div slot="content">
                <AppConfigTree
                  :height="300"
                  :readonly="true"
                  :filter="{isConfig:1, authorityActionList: ['view']}"
                  :isSelectedFirst="false"
                  @selectedTreeNode="selectedTreeNode"
                ></AppConfigTree>
              </div>
            </Poptip>
          </div>
          <div class="block-item">{{ pathName }}</div>
        </div>
      </template>
      <template v-slot:topRight>
        <div v-if="hasEditAuth" class="action-group no-line">
          <span class="action-item tsfont-import" @click="importPipeline">{{ $t('page.import') }}</span>
          <span
            v-if="!isExportPipeline"
            v-download="exportPipeline"
            class="action-item tsfont-export"
          >{{ $t('page.export') }}</span>
          <span v-else class="action-item">
            <Icon type="ios-loading" size="16" class="loading"></Icon>
          </span>
          <template v-if="!canEdit">
            <div class="action-item">
              <Button type="primary" @click="editProfile()">{{ $t('page.edit') }}</Button>
            </div>
          </template>
          <template v-else>
            <div class="action-item tsfont-save" @click="savePipelineDraft()">
              {{ $t('page.savedraft') }}
            </div>
            <div class="action-item tsfont-config" @click="showRuntimeParamList">
              {{ $t('term.autoexec.jobparam') }}
            </div>
            <div class="action-item tsfont-close-o" @click="cancelEdit()">
              {{ $t('page.cancel') }}
            </div>
            <div class="action-item">
              <Button type="primary" @click="saveProfile()">{{ $t('page.save') }}</Button>
            </div>
          </template>
        </div>
      </template>
      <template v-slot:content>
        <div class="pipeline-edit">
          <div class="pipeline-main">
            <div class="step-config pr-nm">
              <div v-if="stepList.length > 0" class="step-top action-group pb-sm">
                <div class="action-item">
                  <AppConfigStatus :appSystemId="appSystemId"></AppConfigStatus>
                </div>
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
                  {{ showAllStepList? $t('page.putawayall') : $t('page.expandall') }}
                </div>
              </div>
              <div class="step-list">
                <StepList
                  id="stepList"
                  ref="stepList"
                  :appSystemId="appSystemId"
                  :appModuleId="appModuleId"
                  :envId="envId"
                  :currentStep="currentStep"
                  :stepList="stepList"
                  :runtimeParamList="runtimeParamList"
                  :combopGroupList="combopGroupList"
                  :execModeList="execModeList"
                  :canEdit="canEdit"
                  @updateSort="updateSort"
                  @change="changeSelectStep"
                ></StepList>
              </div>
            </div>
            <div class="base-config">
              <Tabs
                v-model="tabValue" 
                class="block-tabs"
                :animated="false"
              >
                <TabPane
                  v-if="profileList.length > 0"
                  :label="$t('term.autoexec.presetparameter')"
                  name="profile"
                >
                  <div class="setting-main">
                    <ProfileSetting
                      :appSystemId="appSystemId"
                      :appModuleId="appModuleId"
                      :envId="envId"
                      :referenceList="referenceList"
                      :defaultProfileList="profileList"
                      :canEdit="canEdit"
                      @saveOverrideProfileList="saveOverrideProfileList"
                      @getReferenceList="getReferenceList"
                      @jumpToItem="jumpToItem"
                    ></ProfileSetting>
                  </div>
                </TabPane>
                <TabPane
                  :label="$t('page.scene')"
                  name="scenario"
                >
                  <div class="setting-main">
                    <ScenarioSetting
                      :currentScenarioList="scenarioList"
                      :defaultScenarioId="defaultScenarioId"
                      :sortList="stepList"
                      :execModeList="execModeList"
                      :canEdit="canEdit && !appModuleId && !envId"
                      @updateDefaultScenarioId="updateDefaultScenarioId"
                    ></ScenarioSetting>
                  </div>
                </TabPane>
                <TabPane
                  :label="$t('term.autoexec.executeaccount')"
                  name="executeSetting"
                >
                  <div class="setting-main padding">
                    <ExecuteSetting
                      ref="executeSetting"
                      :appSystemId="appSystemId"
                      :appModuleId="appModuleId"
                      :envId="envId"
                      :canEdit="canEdit"
                      :defaultExecuteConfig="executeConfig"
                      :runtimeParamList="runtimeParamList"
                      :isEditRuntimeParam="canEditParams(canEdit)"
                      @updateExecuteConfig="updateExecuteConfig"
                    ></ExecuteSetting>
                  </div>
                </TabPane>
                <TabPane
                  :label="$t('term.autoexec.stagegroup')"
                  name="stepGroup"
                >
                  <div class="setting-main padding">
                    <StepGroup
                      :appSystemId="appSystemId"
                      :appModuleId="appModuleId"
                      :envId="envId"
                      :currentGroupConfig="currentGroupConfig"
                      :canEdit="canEdit"
                      :runtimeParamList="runtimeParamList"
                      @change="changeGroupConfig"
                    ></StepGroup>
                  </div>
                </TabPane>
              </Tabs>
            </div>
          </div>
          <!--校验 -->
          <PipelineValid v-model="isShowValid" :validList="validList" @jumpToItem="jumpToItem"></PipelineValid>
        </div>
      </template>
    </TsContain>
    <TsDialog
      :title="$t('dialog.title.edittarget', {target: $t('term.autoexec.pipeline')})"
      type="modal"
      :isShow.sync="showDialog"
    >
      <template v-slot>
        <div>
          {{ editTitle }}
        </div>
      </template>
      <template v-slot:footer>
        <div class="action-group">
          <div class="action-item" @click="showDialog = false">
            {{ $t('page.cancel') }}
          </div>
          <div class="action-item">
            <Button type="error" @click="deletePipelineDraft()">
              {{ $t('term.deploy.discarddraft') }}
            </Button>
          </div>
          <div class="action-item">
            <Button type="primary" @click="editPipelineDraft()">
              {{ $t('term.deploy.editdraft') }}
            </Button>
          </div>
        </div>
      </template>
    </TsDialog>
    <!-- 作业参数:只在应用层编辑-->
    <RuntimeParamsSetting
      v-if="isShowParamList"
      :appSystemId="appSystemId"
      :appModuleId="appModuleId"
      :envId="envId"
      :canEdit="canEditParams(canEdit)"
      :runtimeParamList="runtimeParamList"
      @close="isShowParamList = false"
      @saveParamList="saveParamsList"
    ></RuntimeParamsSetting>
    <ImportPipelineConfigDialog
      v-if="isShowImportPipeline"
      :isShowCoverDialog="isShowImportPipeline"
      :appSystemAbbrNameAndName="getAppSystemAbbrNameAppSystemName"
      @closeCoverDialog="isShowImportPipeline = false"
    ></ImportPipelineConfigDialog>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
export default {
  name: '',
  provide() {
    return {
      getCombopConfig: this.combopConfig, //流水线详情（阶段）
      jumpToProfile: this.jumpToProfile, //定位预置参数
      openParamsSetting: this.showRuntimeParamList //添加作业参数
    };
  },
  directives: { download },
  components: {
    StepList: resolve => require(['./pipeline/step/step-list'], resolve),
    StepGroup: resolve => require(['./pipeline/step-group'], resolve),
    ProfileSetting: resolve => require(['./pipeline/profile-setting'], resolve),
    ScenarioSetting: resolve => require(['@/views/pages/autoexec/detail/actionDetail/scenario-setting'], resolve),
    StepTopo: resolve => require(['./pipeline/step/step-topo'], resolve),
    RuntimeParamsSetting: resolve => require(['./pipeline/runtime-params-setting.vue'], resolve),
    AppConfigTree: resolve => require(['./config/app/app-config-tree'], resolve),
    PipelineValid: resolve => require(['./pipeline/pipeline-valid'], resolve),
    ExecuteSetting: resolve => require(['./pipeline/execute-setting'], resolve),
    AppConfigStatus: resolve => require(['./config/app/app-config-status'], resolve),
    ImportPipelineConfigDialog: resolve => require(['pages/deploy/application-config/import-pipeline-config-dialog'], resolve) // 导入流水线配置
  },
  props: {},
  data() {
    return {
      appSystemId: null, //应用id
      appModuleId: null, //模块id
      envId: null, //环境id
      pathName: this.$t('term.deploy.applicationsystem'),
      loadingShow: true,
      initPipelineData: {}, //初始化数据
      tabValue: 'profile',
      combopGroupList: [],
      combopPhaseList: [],
      runtimeParamList: [],
      scenarioList: [],
      overrideProfileList: [], //非继承关系的参数列表
      currentStep: null,
      currentGroupConfig: null,
      execModeList: [],
      referenceList: [],
      stepList: [],
      canEdit: false,
      showAllStepList: false,
      pipelineDraftData: {}, //草稿数据
      showDialog: false,
      editTitle: '',
      profileList: [],
      isShowParamList: false,
      isShowStepTopo: false,
      isShowValid: false, //校验提示
      validList: [],
      defaultPelineData: null, //用于对比
      combopConfig: {
        phaseList: [], //阶段
        isEditRuntimeParam: true //是否可以添加作业参数
      },
      defaultScenarioId: null,
      executeConfig: null,
      hasEditAuth: true, // 是否有编辑配置权限
      isShowImportPipeline: false,
      isExportPipeline: false
    };
  },
  beforeCreate() {},
  async created() {
    if (this.$route.query.appSystemId) {
      this.appSystemId = parseInt(this.$route.query.appSystemId);
      this.combopConfig.isEditRuntimeParam = true;
    }
    if (this.$route.query.appModuleId) {
      this.appModuleId = parseInt(this.$route.query.appModuleId);
      this.combopConfig.isEditRuntimeParam = false;
    }
    if (this.$route.query.envId) {
      this.envId = parseInt(this.$route.query.envId);
      this.combopConfig.isEditRuntimeParam = false;
    }
    if (this.appSystemId && this.$route.query.hasOwnProperty('hasEditAuth')) {
      // 是否有编辑配置权限
      let hasEditAuth = this.$route.query.hasEditAuth == 'true';
      this.hasEditAuth = hasEditAuth;
    } else {
      // 预置参数集，跳转到编辑流水线，需要判断是否有编辑配置权限
      await this.getAuthInfo();
    }
    this.getAppPipeline();
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
    initData(data) {
      data.path && (this.pathName = data.path);
      if (!this.$utils.isEmpty(data.config)) {
        let pipelineData = this.$utils.deepClone(data.config);
        this.combopGroupList = pipelineData.combopGroupList || [];
        this.combopPhaseList = pipelineData.combopPhaseList || [];
        this.runtimeParamList = pipelineData.runtimeParamList || [];
        this.scenarioList = pipelineData.scenarioList || [];
        this.defaultScenarioId = pipelineData.defaultScenarioId || null;
        this.overrideProfileList = pipelineData.overrideProfileList || [];
        this.profileList = this.$utils.deepClone(this.overrideProfileList);
        this.stepList = this.getStepList(this.combopPhaseList);
        this.combopConfig.phaseList = this.stepList;
        if (this.stepList.length > 0) {
          this.currentStep = this.stepList[0];
        }
        if (this.combopGroupList.length > 0) {
          this.currentGroupConfig = this.combopGroupList[0];
        }
        this.profileIdList = this.getProfileIdList();
        if (this.tabValue == 'profile' && !this.profileList.length) {
          this.tabValue = 'scenario';
        }
        this.clearRuntimeParamValue();
        pipelineData.executeConfig && (this.executeConfig = pipelineData.executeConfig);
      }
      this.$nextTick(() => {
        this.defaultPelineData = this.getSaveData();
      });
    },
    getProfileList(profileIdList) { //预置参数
      if (this.$utils.isEmpty(profileIdList)) {
        return;
      }
      let data = {
        appSystemId: this.appSystemId,
        defaultValue: profileIdList
      };
      if (this.appModuleId) { //模块层
        this.$set(data, 'appModuleId', this.appModuleId);
      }
      if (this.envId) { //环境层
        this.$set(data, 'envId', this.envId);
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
    async getAppPipeline() {
      let data = {
        appSystemId: this.appSystemId
      };
      if (this.appModuleId) { //模块层
        this.$set(data, 'appModuleId', this.appModuleId);
      }
      if (this.envId) { //环境层
        this.$set(data, 'envId', this.envId);
      }
      let res = await this.$api.deploy.apppipeline.getAppPipeline(data);
      if (res && res.Status == 'OK') {
        this.initPipelineData = res.Return || {};
        this.initData(res.Return);
        this.loadingShow = false;
      }
    },
    getProfileIdList() { //阶段选择的预置参数id
      let profileIdList = [];
      this.stepList.forEach(item => {
        if (item.config && item.config.phaseOperationList && item.config.phaseOperationList.length > 0) {
          item.config.phaseOperationList.forEach(p => {
            if (p.operationName == 'native/IF-Block') {
              if (p.config.ifList && p.config.ifList.length) {
                let ifProfileIdList = this.getConditionProfileIdList(p.config.ifList);
                ifProfileIdList.length && profileIdList.push(...ifProfileIdList);
              }
              if (p.config.elseList && p.config.elseList.length) {
                let elseProfileIdList = this.getConditionProfileIdList(p.config.elseList);
                elseProfileIdList.length && profileIdList.push(...elseProfileIdList);
              }
            } else {
              if (p.config && p.config.profileId) {
                profileIdList.push(p.config.profileId);
              }
            }
          });
        }
      });
      return profileIdList;
    },
    getConditionProfileIdList(phaseOperationList) { //native/IF-Block: 条件工具（ifList/elseList）的预置参数
      let profileIdList = [];
      phaseOperationList.forEach(p => {
        if (p.config && p.config.profileId) {
          profileIdList.push(p.config.profileId);
        }
      });
      return profileIdList;
    },
    getExecModeList() {
      let data = {enumClass: 'ExecMode'};
      return this.$api.autoexec.action.getParamsTypeLit(data).then(res => {
        if (res.Status == 'OK') {
          this.execModeList = res.Return;
        }
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
          groupId: l.groupId || null,
          id: l.id || null //阶段id
        };
        //模块层和环境层需要：source(继承)、override(重载)、isActive(启用),
        if (l.hasOwnProperty('source')) { 
          this.$set(obj, 'source', l.source);
        }
        if (l.hasOwnProperty('override')) {
          this.$set(obj, 'override', l.override);
        }
        if (l.hasOwnProperty('isActive')) {
          this.$set(obj, 'isActive', l.isActive);
        }
        if (l.hasOwnProperty('parentIsActive')) {
          this.$set(obj, 'parentIsActive', l.parentIsActive);
        }
        if (!this.envId && !this.$utils.isEmpty(obj.config)) {
          this.$set(obj.config, 'executeConfig', {}); //应用层和模块层：阶段不需要设置执行目标
        }
        if (l.hasOwnProperty('policy')) {
          l.policy && this.$set(obj, 'policy', l.policy);
          !l.policy && this.$delete(l, 'policy');
        }
        return obj;
      }) : [];
    },
    async editProfile() {
      await this.getPipelineDraftData();
      if (!this.$utils.isEmpty(this.pipelineDraftData)) {
        if (this.$AuthUtils.getCurrentUser().uuid == this.pipelineDraftData.lcu) {
          this.editTitle = this.$t('term.deploy.nosavedraft');
        } else {
          let userData = await this.$api.common.getUser({userUuid: this.pipelineDraftData.lcu});
          this.editTitle = this.$t('term.deploy.userhasnosavedraft', {username: userData.name, userid: userData.userId});
        }
        this.showDialog = true; 
      } else {
        this.canEdit = true;
      }
    },
    getPipelineDraftData() {
      let data = {
        appSystemId: this.appSystemId
      };
      if (this.appModuleId) { //模块层
        this.$set(data, 'appModuleId', this.appModuleId);
      }
      if (this.envId) { //环境层
        this.$set(data, 'envId', this.envId);
      }
      return this.$api.deploy.apppipeline.getPipelineDraft(data).then((res) => {
        if (res.Status == 'OK') {
          this.pipelineDraftData = res.Return || {};
        }
      });
    },
    saveOverrideProfileList(list) {
      this.profileList = list;
    },
    getSaveData() {
      let data = {
        appSystemId: this.appSystemId,
        config: {
          runtimeParamList: this.runtimeParamList,
          combopPhaseList: [],
          combopGroupList: this.combopGroupList,
          scenarioList: this.scenarioList,
          overrideProfileList: this.profileList
        }
      };
      if (this.appModuleId) { //模块层
        this.$set(data, 'appModuleId', this.appModuleId);
      }
      if (this.envId) { //环境层
        this.$set(data, 'envId', this.envId);
      }
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
      if (this.executeConfig) {
        this.$set(data.config, 'executeConfig', this.executeConfig);
        if ((!this.appModuleId && !this.envId) && this.executeConfig.hasOwnProperty('inherit')) { //只有模块层和环境层的执行账号有继承关系
          delete data.config.executeConfig.inherit;
        }
      }
      return data;
    },
    savePhaseOperationList(list) { //工具
      let phaseOperationList = this.$utils.deepClone(list);
      phaseOperationList.forEach(item => {
        delete item.operation;
        delete item.isShow;
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
        if (this.tabValue == 'profile') {
          this.tabValue = 'scenario';
        }
      }
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
      this.currentGroupConfig = config;
      this.combopGroupList.forEach(item => {
        if (item.id == config.id) {
          this.$set(item, 'inherit', config.inherit);
          this.$set(item, 'policy', config.policy);
          this.$set(item, 'config', config.config);
        }
      });
      if (this.envId) {
        let sort = 0;
        this.stepList.forEach(s => {
          if (s.groupUuid == config.uuid) {
            if (config.policy == 'oneShot') {
              s.sort = 0;
              this.$delete(s, 'policy');
            } else if (config.policy == 'grayScale') {
              s.sort = sort;
              sort += 1;
              this.$set(s.config, 'executeConfig', {});
              if (!s.policy && (s.execMode == 'runner' || s.execMode == 'sqlfile')) {
                this.$set(s, 'policy', 'first');
              }
            }
          }
        });
      }
    },
    cancelEdit() {
      this.$createDialog({
        title: this.$t('dialog.title.updateconfirm'),
        content: this.$t('dialog.content.cancelconfirm'),
        btnType: 'error',
        'on-ok': vnode => {
          vnode.isShow = false;
          this.canEdit = false;
          this.initData(this.initPipelineData);
        }
      });
    },
    getValidList() { //流水线检验
      let validList = [];
      let stepList = this.stepList;
      if (!stepList.length) {
        //至少有一个阶段
        validList = [{ text: this.$t('term.deploy.chooseatleastonephase'), type: 'error' }];
      } else {
        stepList.forEach(v => {
          //校验至少一个脚本+输入参数如果必填需要有值
          if (!v.config || !v.config.phaseOperationList || !v.config.phaseOperationList.length) {
            validList.push({
              text: this.$t('term.deploy.phaseatleastonetool', {target: v.name}),
              type: 'error',
              stepUuid: v.uuid,
              id: '#step_' + v.uuid
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
        validList.push({ text: this.$t('term.deploy.chooseatleastonescenario'), type: 'error', component: 'scenario' });
      } else {
        validList.push(...this.validScenario());
      }
      //执行用户
      if (this.$refs.executeSetting) {
        let executeValidList = this.$refs.executeSetting.getValidList();
        executeValidList.length && validList.push(...executeValidList);
      }
      validList.length && this.$refs.stepList.valid();
      return validList;
    },
    saveProfile() {
      this.validList = this.getValidList();
      if (this.validList.length > 0) {
        this.isShowValid = true;
        return false;
      }
      let data = this.getSaveData();
      this.$api.deploy.apppipeline.saveAppPipeline(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.canEdit = false;
          // this.getAppPipeline();
        }
      });
    },
    savePipelineDraft() { //保存草稿
      let data = this.getSaveData();
      this.$api.deploy.apppipeline.savePipelineDraft(data).then((res) => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.initData(this.initPipelineData);
          this.canEdit = false;
        }
      });
    },
    deletePipelineDraft() {
      let data = {
        appSystemId: this.appSystemId
      };
      if (this.appModuleId) { //模块层
        this.$set(data, 'appModuleId', this.appModuleId);
      }
      if (this.envId) { //环境层
        this.$set(data, 'envId', this.envId);
      }
      this.$api.deploy.apppipeline.deletePipelineDraft(data).then((res) => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.deletesuccess'));
          this.showDialog = false;
          this.canEdit = true;
        }
      });
    },
    editPipelineDraft() {
      this.initData(this.pipelineDraftData);
      this.showDialog = false;
      this.canEdit = true;
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
    jumpToItem(obj) { //定位参数，校验定位
      obj.component && (this.tabValue = obj.component);
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
            this.$refs.stepList.valid();
          });
        }
      });
      this.$utils.jumpTo(obj.id);
    },
    showRuntimeParamList() { //展示作业参数
      this.isShowParamList = true;
    },
    saveParamsList(list) { //保存作业参数
      this.isShowParamList = false;
      if (!this.$utils.isSame(this.runtimeParamList, list)) {
        this.runtimeParamList = list;
        this.clearRuntimeParamValue();
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
    jumpToStep(step) { //流程图定位阶段
      this.isShowStepTopo = false;
      this.changeSelectStep(step);
      this.$utils.jumpTo('#step_' + step.uuid);
    },
    selectedTreeNode(node) { //选择应用配置
      if (node) {
        let params = 'appSystemId=' + node.appSystemId;
        if (node.appModuleId) {
          params = params + '&appModuleId=' + node.appModuleId;
        }
        if (node.envId) {
          params = params + '&envId=' + node.envId;
        }
        if (node.isHasAllAuthority || (node.authActionSet.includes('operation#edit') || node.authActionSet.includes('operation#all'))) {
          // 是否有编辑配置权限
          params = params + '&hasEditAuth=' + true;
        } else {
          params = params + '&hasEditAuth=' + false;
        }
        window.open(HOME + `/deploy.html#/application-config-pipeline-detail?` + params, '_blank');
      }
    },
    clearRuntimeParamValue() { //作业参数改变时，清空工具匹配不上的作业参数值
      this.stepList.forEach(v => {
        if (v.config.phaseOperationList.length) {
          //输入参数
          v.config.phaseOperationList.forEach(p => {
            if (p.config && p.config.paramMappingList && p.config.paramMappingList.length) {
              p.config.paramMappingList.forEach(m => {
                if (m.mappingMode == 'runtimeparam' && !this.$utils.isEmpty(m.value)) {
                  let findParam = this.runtimeParamList.find(f => f.key == m.value);
                  if (!findParam) {
                    this.$set(m, 'value', '');
                  }
                }
              });
            }
            //自由参数
            if (p.config.argumentMappingList && p.config.argumentMappingList.length > 0) {
              p.config.argumentMappingList.forEach(m => {
                if (m.mappingMode == 'runtimeparam' && !this.$utils.isEmpty(m.value)) {
                  let findParam = this.runtimeParamList.find(f => f.key == m.value);
                  if (!findParam) {
                    this.$set(m, 'value', '');
                  }
                }
              });
            }
          });
        }
      });
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
              id: '#id_' + step.uuid + '_' + p.uuid
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
                    id: '#id_' + step.uuid + '_' + p.uuid
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
                    id: '#id_' + step.uuid + '_' + p.uuid
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
                  id: '#id_' + step.uuid + '_' + p.uuid
                });
              }
            }
          } else {
            validList.push({
              text: this.$t('term.deploy.phasetooldeletetip', {stepname: step.name, operationname: p.operationName}),
              type: 'error',
              stepUuid: step.uuid,
              operationUuid: p.uuid,
              id: '#id_' + step.uuid + '_' + p.uuid
            });
          }
        }
      });
      return validList;
    },
    updateDefaultScenarioId(id) { //更新场景默认值
      this.defaultScenarioId = id;
    },
    updateExecuteConfig(config) {
      this.executeConfig = config;
    },
    jumpToProfile(id) {
      this.tabValue = 'profile';
      this.$nextTick(() => {
        this.$utils.jumpTo('#profile_' + id);
      });
    },
    async getAuthInfo() {
      // 获取权限信息
      await this.$api.deploy.applicationConfig.searchAppSystemList({appSystemId: this.appSystemId, authorityActionList: ['view']}).then(res => {
        if (res && res.Status == 'OK') {
          let authInfo = res.Return && res.Return.tbodyList.length > 0 ? res.Return.tbodyList[0] : null;
          let authList = authInfo && authInfo.authActionSet ? authInfo.authActionSet : [];
          if (authList.includes('operation#all') || authList.includes('operation#edit') || (authInfo && authInfo.isHasAllAuthority)) {
            // 有编辑配置权限
            this.hasEditAuth = true;
          } else {
            this.$router.push({
              path: '/404',
              query: {des: this.$t('term.deploy.noappviewauth', {abbrname: authInfo.abbrName || ''})}
            });
          }
        }
      });
    },
    validScenario() { 
      //在模块层和环境层需要校验每个场景的中至少存在一个激活的阶段
      let validList = [];
      if (this.appModuleId || this.envId) {
        this.scenarioList.forEach(item => {
          let isValid = false;
          for (let i = 0; i < item.combopPhaseNameList.length; i++) {
            let findItem = this.stepList.find(s => s.name === item.combopPhaseNameList[i]);
            if (findItem && findItem.isActive) {
              isValid = true;
              break;
            }
          }
          if (!isValid) {
            validList.push({
              text: item.scenarioName + '：' + this.$t('term.deploy.scenariosteperror'), 
              type: 'error',
              component: 'scenario' 
            });
          }
        });
      }
      return validList;
    },
    importPipeline() {
      this.isShowImportPipeline = true;
    }
  },
  filter: {},
  computed: {
    canEditParams() {
      return (canEdit) => {
        let isEdit = canEdit;
        if (this.appModuleId || this.envId) {
          isEdit = false;
        }
        return isEdit; 
      };
    },
    getAppSystemAbbrNameAppSystemName() {
      return `${this.initPipelineData?.appSystemAbbrName}[${this.initPipelineData?.appSystemName}]`;
    },
    exportPipeline() {
      // 导出流水线配置
      return {
        url: '/api/binary/autoexec/job/phase/node/sql/file/download',
        method: 'post',
        params: {},
        changeStatus: status => {
          if (status == 'start') {
            this.isExportPipeline = true;
          } else if (status == 'success' || status == 'error') {
            this.isExportPipeline = false;
          }
        }
      };
    }
  },
  watch: {},
  beforeRouteLeave(to, from, next, url) {
    let data = this.getSaveData();
    if (!this.canEdit || !this.defaultPelineData || this.$utils.isSame(data, this.defaultPelineData)) {
      url ? this.$utils.gotoHref(url) : next(true);
    } else {
      this.$utils.jumpDialog.call(
        this,
        {
          save: {
            fn: async vnode => {
              return await this.saveProfile();
            }
          }
        },
        to,
        from,
        next,
        url
      );
    }
  }
};
</script>
<style lang="less" scoped>
.pipeline-edit {
  position: relative;
  .pipeline-main {
    display: flex;
    width: 100%;
    height: calc(100vh - 100px - 16px);
    .step-config {
      position: relative;
      width: 50%;
      height: 100%;
      overflow: hidden;
      .step-list {
        height: calc(100% - 16px);
        overflow-y: auto;
        padding-top: 32px;
      }
      .step-top {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        padding-left: 46px;
      }
    }
    .base-config {
      width: 50%;
      height: 100%;
      .setting-main{
        width: 100%;
        height: calc(100vh - 100px - 48px);
        overflow-y: auto;
      }
    }
  }
}
</style>
