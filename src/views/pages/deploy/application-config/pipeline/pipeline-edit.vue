<template>
  <div>
    <TsDialog
      :title="$t('term.autoexec.pipeline')"
      type="modal"
      :isShow="true"
      :hasHeader="false"
      :hasFooter="false"
      :defaultFull="true"
      :showCloseIcon="false"
      height="100%"
    >
      <template v-slot>
        <Loading :loadingShow="loadingShow" type="fix"></Loading>
        <div class="pipeline-edit">
          <div class="pipeline-top">
            <div class="left">
              <div class="text-action pr-sm">
                <Poptip placement="bottom-start" transfer>
                  <span class="tsfont-bar"></span>
                  <div slot="content">
                    <AppConfigTree
                      :height="500"
                      :readonly="true"
                      :filter="{isConfig:1, authorityActionList: ['view']}"
                      :isSelectedFirst="false"
                      @selectedTreeNode="selectedTreeNode"
                    ></AppConfigTree>
                  </div>
                </Poptip>
              </div>
              <div>{{ path }}</div>
            </div>
            <div class="right">
              <div class="action-group no-line">
                <template v-if="!canEdit">
                  <div class="action-item">
                    <Button type="primary" @click="editProfile()">{{ $t('page.edit') }}</Button>
                  </div>
                  <div class="action-item">
                    <Button type="primary" ghost @click="close()">{{ $t('page.exit') }}</Button>
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
            </div>
          </div>
          <div class="pipeline-main">
            <div class="step-config pr-nm">
              <div v-if="stepList.length > 0" class="action-group">
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
              <div class="step-list" :class="{'pt-sm':stepList.length > 0}">
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
                  <div class="setting-main padding">
                    <ScenarioSetting :currentScenarioList="scenarioList" :sortList="stepList" :canEdit="canEdit && !appModuleId && !envId"></ScenarioSetting>
                  </div>
                </TabPane>
                <TabPane
                  :label="$t('term.autoexec.stagegroup')"
                  name="stepGroup"
                >
                  <div class="setting-main padding">
                    <StepGroup
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
    </TsDialog>
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
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    StepList: () => import('./step/step-list'),
    StepGroup: () => import('./step-group'),
    ProfileSetting: () => import('./profile-setting'),
    ScenarioSetting: () => import('@/views/pages/autoexec/detail/actionDetail/scenario-setting'),
    StepTopo: () => import('./step/step-topo'),
    RuntimeParamsSetting: () => import('./runtime-params-setting.vue'),
    AppConfigTree: () => import('../config/app/app-config-tree'),
    PipelineValid: () => import('./pipeline-valid')

  },
  props: {
    appSystemId: Number, //应用id
    appModuleId: Number, //模块id
    envId: Number, //环境id
    path: {
      type: String,
      default() {
        return this.$t('term.deploy.applicationsystem');
      }
    }
  },
  data() {
    return {
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
      validList: []
    };
  },
  beforeCreate() {},
  created() {
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
    close() {
      this.$emit('close');
    },
    initData(data) {
      if (!this.$utils.isEmpty(data.config)) {
        let pipelineData = this.$utils.deepClone(data.config);
        this.combopGroupList = pipelineData.combopGroupList || [];
        this.combopPhaseList = pipelineData.combopPhaseList || [];
        this.runtimeParamList = pipelineData.runtimeParamList || [];
        this.scenarioList = pipelineData.scenarioList || [];
        this.overrideProfileList = pipelineData.overrideProfileList || [];
        this.profileList = this.$utils.deepClone(this.overrideProfileList);
        this.stepList = this.getStepList(this.combopPhaseList);
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
      }
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
        this.initPipelineData = res.Return;
        this.initData(res.Return);
        this.loadingShow = false;
      }
    },
    getProfileIdList() { //阶段选择的预置参数id
      let profileIdList = [];
      this.stepList.forEach(item => {
        if (item.config && item.config.phaseOperationList && item.config.phaseOperationList.length > 0) {
          item.config.phaseOperationList.forEach(p => {
            if (p.name == 'native/IF-Block') {
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
    getSavedData() {
      let data = {
        appSystemId: this.appSystemId,
        config: {
          runtimeParamList: this.runtimeParamList,
          combopPhaseList: this.getStepList(this.stepList),
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
      return data;
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
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('message.cancelconfirm'),
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
        validList.push({ text: this.$t('term.deploy.chooseatleastonescenario'), type: 'error' });
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
      let data = this.getSavedData();
      this.$api.deploy.apppipeline.saveAppPipeline(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.canEdit = false;
          // this.getAppPipeline();
        }
      });
    },
    savePipelineDraft() { //保存草稿
      let data = this.getSavedData();
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
                    text: item.name + '/' + p.name + '/' + findParam.name,
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
          this.$refs.stepList.valid();
          this.changeSelectStep(item);
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
        window.open(HOME + `/deploy.html#/application-config-manage?` + params + '&showPipeline=true', '_blank');
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
        if (p.name == 'native/IF-Block') {
          if (p.config) {
            !p.config.condition && validList.push({
              text: this.$t('term.deploy.phasesetcondition', {stepname: step.name, operationname: p.name}),
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
          if (p.config) {
          //输入参数
            if (p.config.paramMappingList && p.config.paramMappingList.length) {
              p.config.paramMappingList.forEach(m => {
                if (this.$utils.isEmpty(m.value) && m.mappingMode != 'isempty') {
                  isPass = false;
                }
              });
              if (!isPass) {
                validList.push({
                  text: this.$t('term.deploy.phasesetinputparamtip', {stepname: step.name, operationname: p.name}),
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
                  text: this.$t('term.deploy.phasesetfreeparamtip', {stepname: step.name, operationname: p.name}),
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
                text: this.$t('term.deploy.phaseselectpresetparamtip', {stepname: step.name, operationname: p.name}),
                type: 'error',
                stepUuid: step.uuid,
                operationUuid: p.uuid,
                id: '#id_' + step.uuid + '_' + p.uuid
              });
            }
          }
        }
      });
      return validList;
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
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.pipeline-edit {
  position: relative;
  .pipeline-top {
    display: flex;
    justify-content: space-between;
    padding-bottom: 24px;
    .left {
      display: inline-flex;
    }
    .right {
      text-align: right;
    }
  }
  .pipeline-main {
    display: flex;
    width: 100%;
    height: calc(100vh - 40px - 32px - 24px);
    .step-config {
      position: relative;
      width: 50%;
      height: 100%;
      overflow: hidden;
      .step-list {
        height: calc(100% - 20px);
        overflow-y: auto;
      }
    }
    .base-config {
      width: 50%;
      height: 100%;
      overflow-y: auto;
      .setting-main{
        width: 100%;
        height: calc(100vh - 40px - 32px - 24px - 32px);
        overflow-y: auto;
      }
    }
  }
}
</style>
