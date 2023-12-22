<template>
  <div class="action-detail">
    <Loading :loadingShow="loading" type="fix"></Loading>
    <TsContain
      v-if="dataConfig"
      :rightWidth="280"
      :siderWidth="230"
      enableDivider
    >
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:top>
        <TsRow>
          <Col span="12">
            <div v-if="versionId == null && effectiveEditable">
              <TsFormInput
                ref="formNameInput"
                v-model="versionName"
                :placeholder="$t('term.autoexec.pleaseinputversionname')"
                maxlength="50"
                size="large"
                isEmptyBg
                :validateList="['required', 'name-special']"
              />
            </div>
            <template v-else>
              <span>{{ name }}</span>
              <Divider type="vertical" />
              <VersionList
                style="display:inline-block"
                :combopId="id"
                :specifyVersion="versionBasicInfo"
                :currentVersionId="activeVersionId"
                @switchVersion="switchVersion"
              ></VersionList>
            </template>
          </Col>
          <Col span="12" class="text-right" style="white-space: nowrap;">
            <div class="action-group">
              <span class="action-item tsfont-blocks" @click="openExecuteSetting">{{ $t('term.autoexec.executetarget') }}</span>
              <span class="action-item tsfont-config" @click="openParamsSetting">{{ $t('term.autoexec.jobparam') }}</span>
              <span v-if="effectiveEditable" class="action-item tsfont-check" @click="openValid()">{{ $t('page.validate') }}</span>
              <span v-if="effectiveEditable" class="action-item tsfont-test" @click="testVersionAction()">{{ $t('page.test') }}</span>
              <span v-if="effectiveCancelable" class="action-item tsfont-close-o" @click="cancelVersionAction()">{{ $t('page.cancel') }}</span>
              <span v-if="effectiveDeletable" class="action-item tsfont-trash-o " @click="deleteVersionAction()">{{ $t('term.autoexec.deletedversion') }}</span>
              <span v-if="effectiveEditable" class="action-item tsfont-save" @click="saveVersionAction()">{{ $t('page.savedraft') }}</span>
              <span v-if="effectiveEditable" class="action-item">
                <Button type="primary" @click="submitVersionAction()">{{ $t('page.submitaudit') }}</Button>
              </span>
              <span v-if="versionIsActive == 1" class="action-item">
                <Dropdown trigger="hover" placement="bottom-start">
                  <span class="tsfont-option-horizontal"></span>
                  <DropdownMenu slot="list">
                    <DropdownItem @click.native="isShowRecord = true">
                      <div class="more-action">
                        {{ $t('term.autoexec.executionrecord') }}
                      </div>
                    </DropdownItem>
                    <!-- 激活 -->
                    <DropdownItem v-if="isActive" :disabled="!effectiveBaseInfoEditable" @click.native="toggleAction">
                      <div class="more-action">{{ $t('page.disable') }}</div>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </span>
              <!-- 执行按钮 -->
              <span v-if="effectiveExecutable" class="action-item">
                <Button
                  type="primary"
                  icon="tsfont tsfont-plus"
                  :disabled="!isActive || !executable"
                  :title="!isActive ? $t('term.autoexec.activecombinetooltip') : !executable ? $t('term.autoexec.noexecuteauthrelateadmin') : ''"
                  ghost
                  @click="toExecute"
                >{{ $t('term.autoexec.job') }}</Button>
              </span>
              <span v-if="!isActive && versionIsActive == 1" class="action-item">
                <Button
                  type="primary"
                  ghost
                  @click="toggleAction()"
                >{{ $t('page.enable') }}</Button>
              </span>
              <span v-if="effectiveCreateable" class="action-item">
                <Button
                  type="primary"
                  @click="createVersionAction()"
                >{{ $t('page.edit') }}</Button>
              </span>
              <span v-if="effectiveReviewable" class="action-item">
                <Button
                  type="error"
                  @click="rejectVersionAction()"
                >{{ $t('page.reject') }}</Button>
              </span>
              <span v-if="effectiveReviewable" class="action-item">
                <Button
                  type="primary"
                  @click="passVersionAction()"
                >{{ $t('page.passed') }}</Button>
              </span>
              <span v-if="effectiveRetractable" class="action-item">
                <Button
                  type="info"
                  @click="retractVersionAction()"
                >{{ $t('page.revocation') }}</Button>
              </span>
              <span v-if="effectiveRollbackable" class="action-item">
                <Button
                  type="info"
                  @click="rollbackVersionAction()"
                >{{ $t('page.rollback') }}</Button>
              </span>
            </div>
          </Col>
        </TsRow>
      </template>
      <!-- <template v-slot:topRight>
    
      </template> -->
      <!-- 左侧步骤列表 -->
      <template v-slot:sider>
        <StepList
          :id="id"
          v-model="currentStep"
          :currentScriptLength="currentScriptLength"
          :stepList="sortList"
          :canEdit="effectiveEditable && operationType == 'combop' ? true : false"
          :execModeList="execModeList"
          :runtimeParamList="runtimeParamList"
          @updateSort="updateSort"
          @change="changeSelectStep"
        ></StepList>
      </template>
      <template v-slot:content>
        <ExpiredReasonAlert
          v-if="configExpired == 1"
          class="pl-md pr-md"
          :configExpiredReason="configExpiredReason"
          :combopId="id"
          type="self"
        ></ExpiredReasonAlert>
        <!--校验 -->
        <ActionValid v-model="validVisible" :validList="validList" @on-click="selectValidItem"></ActionValid>
        <div class="padding-md" style="padding-top:0;padding-bottom:0;">
          <div v-if="currentConfig && currentConfig.uuid == currentStep">
            <StepConfig
              ref="stepConfig"
              :currentStep="currentStep"
              :config="currentConfig"
              :paramList="runtimeParamList"
              :paramsTypeList="paramsTypeList"
              :list="currentConfig.config.phaseOperationList"
              :execModeList="execModeList"
              :execMode="currentConfig.execMode"
              :canEdit="effectiveEditable"
              :prevStepList="getPrev(currentConfig, stepList)"
              :operationType="operationType"
              @changeOperation="changeOperation"
            ></StepConfig>
          </div>
          <div v-else class="bg-op radius-lg padding">
            <NoData></NoData>
          </div>
        </div>
      </template>
      <div slot="right">
        <Tabs v-model="tabValue" class="block-tabs" :animated="false">
          <TabPane :label="effectiveBaseInfoEditable ? getBasicInfoLabel($t('page.basicinfo')) : $t('page.basicinfo')" name="basicInfo">
            <div class="setting-main bg-op block-large">
              <BasicInfo
                :dataConfig="basicInfo"
              ></BasicInfo>
              <!-- 定时作业 -->
              <TimeJobClickText
                v-if="effectiveBaseInfoEditable"
                :id="id"
                :isShow="true"
                :isShowList="true"
              ></TimeJobClickText>
            </div>
          </TabPane>
          <TabPane v-if="currentConfig" :label="$t('term.autoexec.stagegroup')" name="stepGroup">
            <div class="setting-main bg-op block-large">
              <StepGroup
                :id="id"
                :currentGroupConfig="currentGroupConfig"
                :runtimeParamList="runtimeParamList"
                :canEdit="effectiveEditable && operationType == 'combop' ? true : false"
                @save="saveCurrentGroupConfig"
              ></StepGroup>
            </div>
          </TabPane>
          <TabPane :label="$t('page.scene')" name="scenario">
            <div class="setting-main bg-op block-large">
              <ScenarioSetting
                :combopId="id"
                :currentScenarioList="scenarioList"
                :defaultScenarioId="defaultScenarioId"
                :sortList="sortList"
                :execModeList="execModeList"
                :canEdit="effectiveEditable"
                @updateDefaultScenarioId="updateDefaultScenarioId"
              ></ScenarioSetting>
            </div>
          </TabPane>
          <TabPane v-if="profileList.length > 0" :label="$t('term.autoexec.presetparameter')" name="profile">
            <div class="setting-main bg-op block-large">
              <ProfileSetting :profileList="profileList" @updateProfileList="updateProfileList"></ProfileSetting>
            </div>
          </TabPane>
        </Tabs>
      </div>
    </TsContain>
    <!-- 参数 -->
    <ParamsSetting
      v-if="isParamsSetting"
      :id="id"
      :isEditSetting="effectiveEditable"
      :paramsTypeList="paramsTypeList"
      :runtimeParamList="runtimeParamList"
      @close="isParamsSetting = false"
      @saveParams="getParamsList"
    ></ParamsSetting>
    <!-- 执行目标 -->
    <ExecuteSetting
      v-if="isExecuteSetting"
      :id="id"
      :executeConfig="executeConfig"
      :runtimeParamList="runtimeParamList"
      :isEditSetting="effectiveEditable"
      :opType="opType"
      @close="closeExecute"
    ></ExecuteSetting>
    <!-- 执行记录 -->
    <RecordList
      v-if="isShowRecord"
      :id="id"
      :isShowRecord="isShowRecord"
      @close="isShowRecord = false"
    ></RecordList>
    <!-- 基本信息编辑对话窗口 -->
    <TsDialog
      type="modal"
      :isShow.sync="showBasicInfoEditDialog"
      @on-ok="saveBasicInfo"
      @on-close="showBasicInfoEditDialog = false"
    >
      <template v-slot:header>
        <div>{{ $t('dialog.title.edittarget', {target: $t('page.basicinfo')}) }}</div>
      </template>
      <TsForm
        ref="editBasicInfo"
        v-model="editBasicInfo"
        :item-list="editBasicInfoForm"
        type="type"
      >
        <template v-slot:notifyPolicy>
          <div class="bg-op radius-sm">
            <NoticeSetting
              ref="noticeSetting"
              layoutType="flexBetween"
              :config="invokeNotifyPolicyConfig"
            ></NoticeSetting>
          </div>
        </template>
      </TsForm>
    </TsDialog>
    <TsDialog
      :isShow.sync="showReleaseNewVersionDialog"
      width="390px"
      :hasHeader="false"
      :showCloseIcon="false"
      @on-cancel="cancelPassVersionAction"
      @on-ok="passVersionAction"
    >
      <template v-slot>
        <div slot="content">
          <div>
            <i class="tsfont-check-s text-success icon-fz"></i>
            <span class="success-fz">{{ $t('message.commitsuccess') }}</span>
          </div>
          <div class="text-tip content-tip">{{ $t('dialog.content.surepublishthenewversion') }}</div>
        </div>
      </template>
    </TsDialog>
    <TestDialog v-if="isShowTestDialog" @saveTest="saveTest"></TestDialog>
  </div>
</template>
<script>
import StepList from './actionDetail/step/step-list.vue';
import StepConfig from './actionDetail/step/step-config.vue';
import ActionValid from './actionDetail/action-valid.vue';
import BasicInfo from './actionDetail/basic-info.vue';
import TimeJobClickText from 'pages/autoexec/manage/job/time-job-click-text.vue'; // 添加定时作业
import { store, mutations } from './actionDetail/actionState.js';
import actionMixins from './actionDetail/mixins/actionMixins.js';
export default {
  name: 'ActionDetail',
  provide() {
    return {
      openParamsSetting: this.openParamsSetting,
      getCombopConfig: this.combopConfig,
      getProfileList: this.getProfileList,
      jumpToProfile: this.jumpToProfile//定位预置参数
    };
  },
  components: {
    StepList,
    StepConfig,
    ActionValid,
    TimeJobClickText,
    // TimeSetting: resolve => require(['./actionDetail/time-setting.vue'], resolve),
    ParamsSetting: resolve => require(['./actionDetail/params-setting.vue'], resolve),
    ExecuteSetting: resolve => require(['./actionDetail/execute-setting.vue'], resolve),
    RecordList: resolve => require(['@/views/pages/autoexec/manage/action/record-list'], resolve),
    BasicInfo,
    VersionList: resolve => require(['./actionDetail/version-list.vue'], resolve),
    NoticeSetting: resolve => require(['@/views/pages/process/flow/flowedit/components/nodesetting/notice-setting.vue'], resolve),
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    StepGroup: resolve => require(['./actionDetail/step-group.vue'], resolve),
    ScenarioSetting: resolve => require(['./actionDetail/scenario-setting.vue'], resolve),
    ProfileSetting: resolve => require(['./actionDetail/profile-setting.vue'], resolve),
    ExpiredReasonAlert: resolve => require(['./expired-reason-alert'], resolve),
    TestDialog: resolve => require(['./actionDetail/test-dialog.vue'], resolve)
  },
  filters: {},
  mixins: [actionMixins],
  data() {
    let _this = this;
    return {
      basicInfo: {},
      showBasicInfoEditDialog: false,
      editBasicInfo: {
        name: '',
        opType: 'readonly',
        typeId: '',
        owner: '',
        viewAuthorityList: '',
        editAuthorityList: '',
        executeAuthorityList: '',
        config: {},
        description: ''
      },
      invokeNotifyPolicyConfig: {
        policyId: '',
        policyName: '',
        policyPath: '',
        handler: 'neatlogic.module.autoexec.notify.handler.AutoexecCombopNotifyPolicyHandler',
        paramMappingList: []
      },
      editBasicInfoForm: {
        name: {
          type: 'text',
          name: 'name',
          value: '',
          maxlength: 50,
          label: this.$t('page.name'),
          validateList: ['required', 'name-special', { name: 'searchUrl', url: 'api/rest/autoexec/combop/basic/info/save', key: 'name' }]
        },
        opType: {
          type: 'radio',
          label: this.$t('page.combop.optype'),
          value: '',
          dataList: [],
          validateList: ['required'],
          onChange: (value, opt) => {
            _this.opTypeName = opt.text;
          },
          tooltip: this.$t('page.combop.editinfo.optypetip')
        },
        typeId: {
          type: 'select',
          name: 'typeId',
          value: '',
          dataList: [],
          label: this.$t('term.autoexec.toolclassification'),
          multiple: false,
          placeholder: this.$t('page.pleaseselect'),
          validateList: ['required'],
          search: true,
          dynamicUrl: '/api/rest/autoexec/type/search',
          rootName: 'tbodyList',
          dealDataByUrl: this.$utils.getToolClassificationList,
          transfer: true,
          onChangelabel: (text) => {
            _this.typeName = text;
          }
        },
        owner: {
          type: 'userselect',
          name: 'owner',
          label: this.$t('term.autoexec.maintainer'),
          transfer: true,
          multiple: false,
          groupList: ['user'],
          width: '100%',
          validateList: ['required']
        },
        viewAuthorityList: {
          type: 'userselect',
          name: 'viewAuthorityList',
          label: this.$t('page.viewauthority'),
          transfer: true,
          multiple: true,
          groupList: ['common', 'user', 'team', 'role'],
          width: '100%',
          validateList: ['required']
        },
        editAuthorityList: {
          type: 'userselect',
          name: 'editAuthorityList',
          label: this.$t('page.editauthority'),
          transfer: true,
          multiple: true,
          groupList: ['common', 'user', 'team', 'role'],
          width: '100%',
          validateList: ['required']
        },
        executeAuthorityList: {
          type: 'userselect',
          name: 'executeAuthorityList',
          label: this.$t('page.executeauthority'),
          transfer: true,
          multiple: true,
          groupList: ['common', 'user', 'team', 'role'],
          width: '100%',
          validateList: ['required']
        },
        notifyPolicy: {
          type: 'slot',
          name: 'notifyPolicy',
          label: this.$t('page.notificationstrategy')
        },
        description: {
          type: 'textarea',
          name: 'description',
          value: '',
          maxlength: 500,
          label: this.$t('page.description')
        }
      },
      showReleaseNewVersionDialog: false,
      fromPath: '',
      id: null,
      name: '',
      isActive: 0,
      operationType: '',
      activeVersionId: null,
      version: 0,
      versionId: null,
      versionName: '',
      versionIsActive: 0,
      versionStatus: null,
      versionBasicInfo: {
        id: null,
        name: '',
        isActive: 0,
        version: '',
        status: '',
        lcd: '',
        lcuVo: {}
      },
      viewable: 0,
      editable: 0,
      deletable: 0,
      executable: 0,
      ownerEditable: 0,
      reviewable: 0,
      dataConfig: null,
      isParamsSetting: false, //参数弹框
      runtimeParamList: [], //作业参数
      isExecuteSetting: false, //执行目标设置
      executeConfig: null, //执行目标数据
      currentStep: null, //当前选中哪个阶段
      stepList: [], //阶段数据[{name:'前置阶段'，config:{phaseOperationList:[{id:123,policy:'stop',import:[],outport:[]}]}}]
      sortList: [],
      currentConfig: null, //当前选中的阶段数据
      currentScriptLength: 0, //当前选中的阶段有多少个脚本
      validVisible: false, //校验列表是否显示
      paramsTypeList: [], //有哪些参数类型和对应默认数据
      execModeList: [], //执行方式
      isShowRecord: false,
      validList: [{ text: '', type: '', config: {} }], //校验产生的数据列表
      tabValue: 'basicInfo',
      currentGroupConfig: null, //当前选中的组
      scenarioList: [], //场景列表
      combopConfig: {
        //组合工具数据
        phaseList: []
      },
      profileList: [], //预置参数列表
      defaultScenarioId: null, //默认场景
      loading: true,
      isShowTestDialog: false,
      configExpired: 0,
      configExpiredReason: {},
      opType: 'readonly' //操作类型
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.query && this.$route.query.id) {
      this.id = parseInt(this.$route.query.id);
    }
    if (this.$route.query.versionId) {
      this.versionId = parseInt(this.$route.query.versionId);
    } 
    if (!this.versionId) {
      let versionId = sessionStorage.getItem('action_versionId');
      this.versionId = versionId ? parseInt(versionId) : null;
    }
    if (this.$route.query.versionStatus) {
      this.versionStatus = this.$route.query.versionStatus;
    }
    this.getOpType();
  },
  beforeMount() {},
  async mounted() {
    await this.getParamsTypeLit();
    await this.getExecModeList();
    await this.getAction(true);
    this.getProfileList();
    sessionStorage.removeItem('action_versionId');
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {
    this.clearObservable();
  },
  methods: {
    getParamsTypeLit() {
      //选择组件类型
      let data = { enumClass: 'neatlogic.framework.autoexec.constvalue.ParamType' };
      return this.$api.autoexec.action.getParamsTypeLit(data).then(res => {
        if (res.Status == 'OK') {
          this.paramsTypeList = res.Return;
        }
      });
    },
    initNotifyPolicyConfig() {
      return {
        policyId: '',
        policyName: '',
        policyPath: '',
        handler: 'neatlogic.module.autoexec.notify.handler.AutoexecCombopNotifyPolicyHandler',
        paramMappingList: []
      };
    },
    async getAction(isFirst) {
      this.loading = true;
      this.dataConfig = null;
      let param = {
        id: this.id
      };
      if (this.versionId != null) {
        param.versionId = this.versionId;
      } else {
        param.versionStatus = this.versionStatus;
      }
      await this.$api.autoexec.action.getActionBasicInfo(param).then(res => {
        if (res.Status == 'OK') {
          const result = res.Return;
          this.viewable = result.viewable;
          this.editable = result.editable;
          this.deletable = result.deletable;
          this.executable = result.executable;
          this.ownerEditable = result.ownerEditable;
          this.reviewable = result.reviewable;
          this.name = result.name;
          this.isActive = result.isActive;
          this.operationType = result.operationType;
          this.$set(this.basicInfo, 'name', result.name);
          this.$set(this.basicInfo, 'typeName', result.typeName);
          this.$set(this.basicInfo, 'opTypeName', result.opTypeName);
          this.$set(this.basicInfo, 'owner', result.owner);
          this.$set(this.basicInfo, 'viewAuthorityList', result.viewAuthorityList);
          this.$set(this.basicInfo, 'editAuthorityList', result.editAuthorityList);
          this.$set(this.basicInfo, 'executeAuthorityList', result.executeAuthorityList);
          this.$set(this.basicInfo, 'policyName', result.config?.invokeNotifyPolicyConfig?.policyName);
          this.$set(this.basicInfo, 'description', result.description);
          this.activeVersionId = result.activeVersionId;
          this.versionName = result.name;
          this.versionId = result.specifyVersionId;
          this.opType = result.opType;
        }
      });
      if (this.versionId != null) {
        this.$api.autoexec.action.getActionVersion({id: this.versionId}).then(res => {
          if (res.Status == 'OK') {
            const result = res.Return;
            if (result.configExpired == 1) {
              this.isActive = 0;
              this.configExpired = result.configExpired;
              this.configExpiredReason = result.configExpiredReason;
            }
            this.versionName = result.name;
            this.version = result.version;
            this.versionIsActive = result.isActive;
            this.versionStatus = result.status;
            this.runtimeParamList = result.config.runtimeParamList || [];
            this.scenarioList = result.config?.scenarioList || [];
            this.defaultScenarioId = result.config?.defaultScenarioId;
            this.stepList = this.initStepList(result.config.combopPhaseList);
            this.sortList = this.getSortList();
            //默认进来选中第一个
            !this.currentStep && (this.currentStep = this.stepList.length ? this.stepList[0].uuid : null);
            this.executeConfig = result.config.executeConfig || null;
            let combopGroupList = result.config.combopGroupList || [];
            !this.currentGroupConfig && (this.currentGroupConfig = combopGroupList[0]);
            mutations.setCombopGroupList(combopGroupList);
            this.combopConfig.phaseList = this.stepList;
            this.clearRuntimeParamValue();
            this.$set(this.versionBasicInfo, 'id', result.id);
            this.$set(this.versionBasicInfo, 'name', result.name);
            this.$set(this.versionBasicInfo, 'isActive', result.isActive);
            this.$set(this.versionBasicInfo, 'version', result.version);
            this.$set(this.versionBasicInfo, 'status', result.status);
            this.$set(this.versionBasicInfo, 'lcd', result.lcd);
            this.$set(this.versionBasicInfo, 'lcuVo', result.lcuVo);
            this.dataConfig = Object.assign({config: { combopPhaseList: []}}, result);
            this.$set(this.dataConfig, 'basicInfo', this.basicInfo);
            this.$nextTick(() => {
              this.initData = this.$utils.deepClone(this.getData(isFirst));
            });
          }
        }).finally(() => {
          this.loading = false;
        });
      }
      this.loading = false;
    },
    getExecModeList() {
      let data = { enumClass: 'neatlogic.framework.autoexec.constvalue.ExecMode' };
      return this.$api.autoexec.action.getParamsTypeLit(data).then(res => {
        if (res.Status == 'OK') {
          this.execModeList = res.Return;
        }
      });
    },
    getData(isFirst) {
      if (this.dataConfig) {
        let list = this.$utils.deepClone(this.stepList);
        list.forEach(item => {
          //去除多余得数据 比如用来校验得 isRequried  component 等 主要用于返回对比
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
        let data = {
          id: this.versionId,
          name: this.versionName,
          combopId: this.id,
          config: {
            combopPhaseList: list,
            executeConfig: this.executeConfig,
            runtimeParamList: this.runtimeParamList
          }
        };
        //阶段组
        if (this.combopGroupList && this.combopGroupList.length > 0) {
          this.$set(data.config, 'combopGroupList', this.combopGroupList);
        }
        //场景
        if (this.scenarioList && this.scenarioList.length > 0) {
          this.$set(data.config, 'scenarioList', this.scenarioList);
        }
        if (this.defaultScenarioId) {
          this.$set(data.config, 'defaultScenarioId', this.defaultScenarioId);
        }
        return data;
      }
    },
    savePhaseOperationList(list) {
      let phaseOperationList = this.$utils.deepClone(list);
      phaseOperationList.forEach(item => {
        delete item.isShow;
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
                value: param.value,
                type: param.type
              };
            });
          }
        }
      });
      return phaseOperationList;
    },
    createVersionAction() {
      this.versionId = null;
      this.versionName = this.name + '_' + this.$utils.getCurrenttime('MMdd');
      this.versionIsActive = 0;
      this.versionStatus = 'draft';
    },
    async saveVersionAction(isShowMessage = true) {
      // isShowMessage 是否需要弹出操作提示，默认true
      let canSave = false;
      if (this.valid()) {
        this.currentStep = null;
        let data = this.getData();
        this.$set(data, 'status', 'draft');
        await this.$api.autoexec.action
          .saveActionVersion(data)
          .then(res => {
            if (res.Status == 'OK') {
              if (isShowMessage) {
                this.$Message.success(this.$t('message.savesuccess')); //保存成功
              }
              this.versionId = res.Return.id;
              canSave = true; //保存成功之后才可以进行下一步，在路由那里判断
              this.$router.push({
                path: '/action-detail',
                query: { id: this.id, versionId: this.versionId, timeStamp: Date.now() }
              });
            }
          })
          .catch(res => {
            //使用catch的原因是为了让代码执行下一步 return
          });
      }
      return canSave;
    },
    async cancelVersionAction() {
      if (!this.effectiveCancelable) {
        return;
      }
      this.versionStatus = 'passed';
      this.getAction();
      this.getProfileList();
    },
    async deleteVersionAction() {
      if (!this.effectiveDeletable) {
        return;
      }
      let versionCount = 0;
      let _this = this;
      await this.$api.autoexec.action.getActionVersionCount({ combopId: this.id }).then(res => {
        if (res.Status == 'OK') {
          versionCount = res.Return.count;
        }
      });
      let title = '';
      let content = '';
      if (versionCount > 1) {
        if (_this.versionStatus == 'draft') {
          title = this.$t('dialog.content.deleteconfirm', {target: _this.versionName});
        } else {
          title = this.$t('dialog.content.deleteconfirm', {target: _this.version});
        }
        
        content = '';
      } else {
        title = this.$t('dialog.content.deleteconfirm', {target: _this.$t('term.autoexec.customtool')});
        content = this.$t('term.autoexec.deletelastversiontip');
      }
      this.$createDialog({
        title: title,
        content: content,
        btnType: 'error',
        'on-ok': vnode => {
          this.$api.autoexec.action.deleteVersionAction({ id: _this.versionId }).then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              if (versionCount > 1) {
                this.versionStatus = 'passed';
                this.$router.replace({
                  path: '/action-detail',
                  query: { id: this.id, versionStatus: this.versionStatus }
                });
              } else {
                _this.initData = _this.$utils.deepClone(this.getData());
                // 删除工具之后跳转到组合工具列表
                this.$router.push({
                  path: '/action-manage'
                });
              }
            }
          });
          vnode.isShow = false;
        }
      });
    },
    async submitVersionAction() {
      // isShowMessage 是否需要弹出操作提示，默认true
      let canSave = false;
      if (this.valid()) {
        let data = this.getData();
        this.$set(data, 'status', 'submitted');
        await this.$api.autoexec.action
          .saveActionVersion(data)
          .then(res => {
            if (res.Status == 'OK') {
              this.versionId = res.Return.id;
              if (res.Return.reviewable == 1) {
                this.showReleaseNewVersionDialog = true;
              } else {
                this.$Message.success(this.$t('message.commitsuccess'));
                this.$router.push({
                  path: '/action-detail',
                  query: { id: this.id, versionId: this.versionId, timeStamp: Date.now() }
                });
              }
              canSave = true; //保存成功之后才可以进行下一步，在路由那里判断
            }
          })
          .catch(res => {
            //使用catch的原因是为了让代码执行下一步 return
          });
      }
      return canSave;
    },
    testVersionAction() {
      //执行
      if (this.executable) {
        let data = this.getData();
        if (this.$utils.isSame(this.initData, data)) {
          sessionStorage.setItem('action_versionId', this.versionId);
          this.$router.replace({
            path: '/runner-detail',
            query: {
              actionId: this.id,
              versionId: this.versionId,
              source: 'comboptest'
            }
          });
        } else {
          this.isShowTestDialog = true;
        }
      }
    },
    rejectVersionAction() {
      let data = {
        id: this.versionId,
        status: 'rejected'
      };
      this.$api.autoexec.action.updateVersionStatusAction(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.versionStatus = 'rejected';
          this.versionBasicInfo.status = 'rejected';
          this.$router.replace({
            path: '/action-detail',
            query: { id: this.id, versionId: this.versionId, timeStamp: Date.now() }
          });
        }
      });
    },
    cancelPassVersionAction() {
      this.showReleaseNewVersionDialog = false;
      this.$router.push({
        path: '/action-detail',
        query: { id: this.id, versionId: this.versionId, timeStamp: Date.now() }
      });
    },
    passVersionAction() {
      let data = {
        id: this.versionId,
        status: 'passed'
      };
      this.$api.autoexec.action.updateVersionStatusAction(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.showReleaseNewVersionDialog = false;
          this.versionStatus = 'passed';
          this.versionIsActive = 1;
          this.activeVersionId = this.versionId;
          this.versionBasicInfo.status = 'passed';
          this.versionBasicInfo.isActive = 1;
          this.$router.push({
            path: '/action-detail',
            query: { id: this.id, versionId: this.versionId, timeStamp: Date.now() }
          });
        }
      });
    },
    retractVersionAction() {
      let data = {
        id: this.versionId,
        status: 'draft'
      };
      this.$api.autoexec.action.updateVersionStatusAction(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.versionStatus = 'draft';
          this.versionBasicInfo.status = 'draft';
          this.$router.push({
            path: '/action-detail',
            query: { id: this.id, versionId: this.versionId, timeStamp: Date.now() }
          });
        }
      });
    },
    rollbackVersionAction() {
      this.$api.autoexec.action.updateVersionIsActiveAction({id: this.versionId}).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.versionIsActive = 1;
          this.activeVersionId = this.versionId;
          this.versionBasicInfo.isActive = 1;
        }
      });
    },
    updateSort(list, selectedStep) {
      let newList = [];
      list.forEach(l => {
        let currentL = this.stepList.find(s => {
          return s.uuid == l.uuid;
        });
        if (l.executeConfig) {
          l.config ? (l.config.executeConfig = l.executeConfig) : Object.assign(l, { config: { executeConfig: l.executeConfig } });
        }
        let newConfig = l;
        newConfig.config && !newConfig.config.phaseOperationList && Object.assign(newConfig.config, { phaseOperationList: [], executeConfig: newConfig.config.executeConfig });
        this.$delete(l, 'executeConfig');
        this.$delete(newConfig, 'executeConfig');

        newList.push(currentL ? Object.assign(currentL, l) : newConfig);
      });
      this.stepList = newList;
      this.sortList = this.getSortList();
      //更新后选中默认选中一个（修改跟新增的选中当前）
      if (selectedStep) {
        this.currentStep = selectedStep;
        this.tabValue = 'stepGroup';
      } else if (this.stepList.length == 1) {
        this.currentStep = this.stepList[0].uuid;
        this.currentGroupConfig = this.combopGroupList[0];
        this.tabValue = 'basicInfo';
      } else if (!this.stepList.length) {
        this.tabValue = 'basicInfo';
        mutations.setCombopGroupList([]);
      } else if (this.currentStep) {
        let groupUuid = null;
        let stepItem = this.stepList.find(c => c.uuid == this.currentStep);
        stepItem && (groupUuid = stepItem.groupUuid);
        groupUuid && (this.currentGroupConfig = this.combopGroupList.find(g => g.uuid == groupUuid));
      }
      this.updateScenarioList();
      this.combopConfig.phaseList = this.stepList;
    },
    getSortList() {
      return this.stepList.length
        ? this.stepList.map(l => {
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
          if (l.hasOwnProperty('policy')) {
            l.policy && this.$set(obj, 'policy', l.policy);
            !l.policy && this.$delete(l, 'policy');
          }
          return obj;
        })
        : [];
    },
    valid() {
      //获取所有的校验数据，进行拼接
      let isValid = true;
      this.validList = [].concat(this.validStepConfig()); //基本信息的校验
      // if (this.executeConfig && this.executeConfig.whenToSpecify == 'now' && !this.executeConfig.executeUser) {
      //   this.validList.push({ text: this.$t('page.executeuser') + '：' + this.$t('page.notarget', {target: this.$t('page.executeuser')}), type: 'error', config: { type: 'executeSetting' } });
      // }
      if (this.validList.find(item => item.type == 'error')) {
        this.validVisible = true;
        isValid = false;
      }
      return isValid;
    },
    validStepConfig() {
      let valid = [];
      let stepList = this.stepList;
      if (!stepList.length) {
        //至少有一个阶段
        valid = [{ text: this.$t('page.phase') + this.$t('page.setting') + '：' + this.$t('page.notarget', {target: this.$t('page.phase')}), type: 'error' }];
      } else {
        stepList.forEach(v => {
          //校验至少一个脚本+输入参数如果必填需要有值
          if (!v.config || !v.config.phaseOperationList || !v.config.phaseOperationList.length) {
            valid.push({
              text: this.$t('page.phase') + v.name + this.$t('page.setting') + '：' + this.$t('page.notarget', {target: this.$t('term.autoexec.tool')}),
              type: 'error',
              config: {
                stepName: v.name,
                stepUuid: v.uuid,
                validComponent: 'operation'
              }
            });
          } else if (v.config.phaseOperationList.length) {
            //工具数据校验
            let validOperationList = this.validPhaseOperationList(v, v.config.phaseOperationList);
            if (validOperationList.length > 0) {
              valid.push(...validOperationList);
            }
          }
        });
      }
      valid.length > 0 && this.$refs.stepConfig && this.$utils.validForm(this.$refs.stepConfig.$el);
      return valid;
    },
    // validCurrentStepConfig() {
    //   if (this.$refs.stepConfig) {
    //     return this.$refs.stepConfig.valid();
    //   } else {
    //     return true;
    //   }
    // },
    selectValidItem(config) {
      //获取其中一个校验，进行特殊处理
      if (config) {
        if (config.config) {
          if (config.config.validComponent && config.config.validComponent == 'operation') {
            //需特殊定位的有问题脚本
            //先选中当前阶段，再定位到有问题的第几个数据
            this.currentStep = config.config.stepUuid;
            let groupUuid = null;
            let stepItem = this.stepList.find(c => c.uuid == this.currentStep);
            stepItem && (groupUuid = stepItem.groupUuid);
            groupUuid && (this.currentGroupConfig = this.combopGroupList.find(g => g.uuid == groupUuid));
            this.$nextTick(() => {
              this.$refs.stepConfig && this.$refs.stepConfig.valid();
            });
          } else if (config.config.type == 'executeSetting') {
            //执行目标校验不通过
            this.openExecuteSetting();
          }
        }
      }
    },
    openValid() {
      if (!this.effectiveEditable) {
        return;
      }
      this.valid();
      this.validVisible = true;
    },
    openParamsSetting() {
      this.isParamsSetting = true;
    },
    closeExecute(val) {
      this.isExecuteSetting = false;
      if (val) {
        this.executeConfig = val;
      }
    },
    toExecute() {
      //执行
      if (this.executable) {
        this.$router.push({
          path: '/runner-detail',
          query: { actionId: this.id }
        });
      }
    },
    async toggleAction() {
      let _this = this;
      if (!this.effectiveBaseInfoEditable) {
        return;
      }
      if (this.valid()) {
        this.$api.autoexec.action
          .toggleAction({ id: this.id })
          .then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.executesuccess'));
              this.getAction();
            }
          })
          .catch(error => {
            _this.isActive = _this.isActive ? 0 : 1;
          });
      } else {
        this.$nextTick(() => {
          this.isActive = 0;
        });
      }
    },
    changeOperation(list) {
      let _this = this;
      _this.$set(_this.currentConfig.config, 'phaseOperationList', list);
      _this.currentScriptLength = list.length;
      _this.stepList.forEach(s => {
        if (s.uuid == _this.currentStep) {
          _this.$set(s.config, 'phaseOperationList', list);
        }
      });
      this.sortList = this.getSortList();
      this.tabValue = 'stepGroup';
    },
    customizer(objValue, othValue, key) {
      //当两个值同时为空时直接对比结果为true 因为存在 undefined 和 '' 等情况，但是需要设置为相等
      if (this.$utils.isEmpty(objValue) && this.$utils.isEmpty(othValue)) {
        return true;
      } else if (this.$utils.isEmpty(objValue) || this.$utils.isEmpty(othValue)) {
        return false;
      }
    },
    getParamsList(list) {
      if (!this.$utils.isSame(this.runtimeParamList, list)) {
        this.runtimeParamList = list;
        this.clearRuntimeParamValue();
      }
    },
    openExecuteSetting() {
      this.isExecuteSetting = true;
    },
    clearObservable() {
      //清空状态管理的数据
      store.combopGroupList = []; //组合工具组列表
    },
    saveCurrentGroupConfig(data) {
      let itemConfig = this.$utils.deepClone(data);
      this.currentGroupConfig = itemConfig;
      let sort = 0;
      this.stepList.forEach(s => {
        if (s.groupUuid == itemConfig.uuid) {
          if (itemConfig.policy == 'oneShot') {
            s.sort = 0;
            this.$delete(s, 'policy');
          } else if (itemConfig.policy == 'grayScale') {
            s.sort = sort;
            sort += 1;
            this.$set(s.config.executeConfig, 'executeConfig', {});
            if (!s.policy && (s.execMode == 'runner' || s.execMode == 'sqlfile')) {
              this.$set(s, 'policy', 'first');
            }
          }
        }
      });
    },
    changeSelectStep(uuid, item) {
      if (item && item.groupUuid) {
        let findGroup = this.combopGroupList.find(c => c.uuid == item.groupUuid);
        findGroup && (this.currentGroupConfig = findGroup);
      }
    },
    updateScenarioList() {
      //更新场景
      let scenarioList = [];
      this.scenarioList.forEach(item => {
        let combopPhaseNameList = [];
        item.combopPhaseNameList.forEach(c => {
          let findItem = this.sortList.find(s => s.name == c);
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
    getProfileList() {
      //预置参数
      if (this.id) {
        let param = {
          combopId: this.id,
          versionId: this.versionId
        };
        this.$api.autoexec.action.getProfileList(param).then(res => {
          if (res.Status == 'OK') {
            this.profileList = res.Return || [];
          }
        });
      }
    },
    clearRuntimeParamValue() { //作业参数改变时，清空工具匹配不上的作业参数值
      this.stepList.forEach(v => {
        if (v.config.phaseOperationList.length) {
          v.config.phaseOperationList.forEach(p => {
            //输入参数
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
      //如果输入参数有必填但是没填的
      phaseOperationList.forEach(p => {
        if (p.operationName == 'native/IF-Block') {
          if (p.config) {
            !p.config.condition && validList.push({
              text: this.$t('page.phase') + step.name + this.$t('term.autoexec.setinputcondition'),
              type: 'error',
              config: {
                stepName: step.name,
                validComponent: 'operation',
                stepUuid: step.uuid
              }
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
          let isProfile = true; //预置参数集校验
          if (p.operation) {
            if (p.config && p.config.paramMappingList && p.config.paramMappingList.length) {
              p.config.paramMappingList.forEach(m => {
                if (this.$utils.isEmpty(m.value) && m.mappingMode != 'isempty') { //profile：预设参数不需要保存值
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
                  text: this.$t('page.phase') + step.name + '【' + p.operationName + '】' + this.$t('term.autoexec.phasesetinputparamtip'),
                  type: 'error',
                  config: {
                    stepName: step.name,
                    validComponent: 'operation',
                    stepUuid: step.uuid
                  }
                });
              }
            }
            if (p.config) {
            //自由参数数据校验判断
              if (p.config.argumentMappingList && p.config.argumentMappingList.length > 0) {
                p.config.argumentMappingList.forEach(m => {
                  if (this.$utils.isEmpty(m.value)) {
                    isPassArgument = false;
                  }
                });
              } else if (p.operation.argument && p.operation.argument.isRequired) {
                isPassArgument = false;
              }
              if (!isPassArgument) {
                //自由参数校验信息
                validList.push({
                  text: this.$t('page.phase') + step.name + '【' + p.operationName + '】' + this.$t('term.autoexec.phasesetfreeparamtip'),
                  type: 'error',
                  config: {
                    stepName: step.name,
                    validComponent: 'operation',
                    stepUuid: step.uuid
                  }
                });
              }
            }
            if (p.config && p.config.isActive && !p.config.profileId) {
              isProfile = false;
            }
            if (!isProfile) {
              validList.push({
                text: this.$t('page.phase') + step.name + '【' + p.operationName + '】' + this.$t('term.autoexec.phasesetpresetparamtip'),
                type: 'error',
                config: {
                  stepName: step.name,
                  validComponent: 'operation',
                  stepUuid: step.uuid
                }
              });
            }
          } else {
            validList.push({
              text: this.$t('page.phase') + step.name + '【' + p.operationName + '】' + this.$t('term.autoexec.phasedeletetip'),
              type: 'error',
              config: {
                stepName: step.name,
                validComponent: 'operation',
                stepUuid: step.uuid
              }
            });
          }
        }
      });
      return validList;
    },
    updateProfileList() {
      this.getProfileList();
      //更新当前阶段选择预设参数的值
      this.$refs.stepConfig && this.$refs.stepConfig.refreshProfile();
    },
    updateDefaultScenarioId(id) { //更新场景默认值
      this.defaultScenarioId = id;
    },
    jumpToProfile(id) {
      if (this.profileList.length > 0) {
        this.tabValue = 'profile';
        this.$nextTick(() => {
          this.$utils.jumpTo('#profile_' + id);
        });
      }
    },
    getBasicInfoLabel(label) {
      let _this = this;
      return h => {
        return h(
          'div',
          {
            class: ['activity-log-tab', 'tab-padding']
          },
          [
            h('span', label),
            h('span', {
              class: ['tsfont-edit', 'text-grey', 'text-tip-active'],
              on: {
                click: _this.openBasicInfoEditDialog
              }
            })
          ]
        );
      };
    },
    openBasicInfoEditDialog() {
      let data = {
        id: this.id
      };
      this.$api.autoexec.action.getActionBasicInfo(data).then(res => {
        if (res.Status == 'OK') {
          const result = res.Return;
          this.$set(this.editBasicInfo, 'name', result.name);
          this.$set(this.editBasicInfo, 'typeId', result.typeId);
          this.$set(this.editBasicInfo, 'opType', result.opType);
          this.$set(this.editBasicInfo, 'owner', result.owner);
          this.$set(this.editBasicInfo, 'viewAuthorityList', result.viewAuthorityList);
          this.$set(this.editBasicInfo, 'editAuthorityList', result.editAuthorityList);
          this.$set(this.editBasicInfo, 'executeAuthorityList', result.executeAuthorityList);
          this.$set(this.editBasicInfo, 'description', result.description);
          if (result.config?.invokeNotifyPolicyConfig) {
            this.invokeNotifyPolicyConfig = result.config.invokeNotifyPolicyConfig;
          } else {
            this.invokeNotifyPolicyConfig = this.initNotifyPolicyConfig();
          }
        }
      });
      this.showBasicInfoEditDialog = true;
    },
    saveBasicInfo() {
      let noticeSetting = this.$refs.noticeSetting || '';
      if (!this.$refs.editBasicInfo.valid() || (noticeSetting && !noticeSetting.valid())) {
        return;
      }
      this.$set(this.editBasicInfo, 'id', this.id);
      this.$set(this.editBasicInfo, 'typeName', this.typeName);
      this.$set(this.editBasicInfo, 'opTypeName', this.opTypeName);
      const notifyPolicyConfig = noticeSetting.getData();
      if (notifyPolicyConfig?.policyId) {
        this.editBasicInfo.config.invokeNotifyPolicyConfig = notifyPolicyConfig;
      } else {
        this.editBasicInfo.config.invokeNotifyPolicyConfig = null;
      }
      this.$api.autoexec.action.saveActionBasicInfo(this.editBasicInfo).then(res => {
        if (res.Status == 'OK') {
          this.$set(this.basicInfo, 'name', this.editBasicInfo.name);
          this.$set(this.basicInfo, 'typeName', this.editBasicInfo.typeName);
          this.$set(this.basicInfo, 'opTypeName', this.editBasicInfo.opTypeName);
          this.$set(this.basicInfo, 'owner', this.editBasicInfo.owner);
          this.$set(this.basicInfo, 'viewAuthorityList', this.editBasicInfo.viewAuthorityList);
          this.$set(this.basicInfo, 'editAuthorityList', this.editBasicInfo.editAuthorityList);
          this.$set(this.basicInfo, 'executeAuthorityList', this.editBasicInfo.executeAuthorityList);
          this.$set(this.basicInfo, 'policyName', this.editBasicInfo.config?.invokeNotifyPolicyConfig?.policyName);
          this.$set(this.basicInfo, 'description', this.editBasicInfo.description);
          this.showBasicInfoEditDialog = false;
          this.$Message.success(this.$t('message.executesuccess'));
        }
      });
    },
    switchVersion(id, type, versionId) {
      this.versionType = type;
      if (type == 'submitted') {
        this.$router.push({
          path: '/action-detail',
          query: {
            id: id,
            versionId: versionId
          }
        });
      } else {
        this.$router.push({
          path: '/action-detail',
          query: {
            id: id,
            versionId: versionId,
            status: type
          }
        });
      }
    },
    async saveTest(isSave) { //保存并测试
      if (isSave) {
        await this.saveVersionAction();
        sessionStorage.setItem('action_versionId', this.versionId);
        this.$router.push({
          path: '/runner-detail',
          query: {
            actionId: this.id,
            versionId: this.versionId,
            source: 'test'
          }
        });
      }
      this.isShowTestDialog = false;
    },
    getOpType() {
      let data = { enumClass: 'neatlogic.framework.autoexec.constvalue.AutoexecCombopOpType' };
      this.$api.autoexec.action.getParamsTypeLit(data).then(res => {
        if (res.Status == 'OK') {
          this.editBasicInfoForm.opType.dataList = res.Return;
        }
      });
    }
  },
  computed: {
    getPrev() {
      return function(config, list) {
        let uk = config.uuid;
        let index = list.findIndex(l => {
          return l.uuid == uk;
        });
        return list.filter((s, sindex) => {
          return sindex < index;
        });
      };
    },
    combopGroupList() {
      //组设置列表
      return store.combopGroupList; //使用Vue.observable()进行状态管理
    },
    effectiveBaseInfoEditable() {
      return this.editable == 1 && this.versionIsActive == 1 && this.versionStatus == 'passed';
    },
    effectiveEditable() {
      return this.editable == 1 && (this.versionStatus == 'draft' || this.versionStatus == 'rejected');
    },
    effectiveReviewable() {
      return this.reviewable == 1 && this.versionStatus == 'submitted';
    },
    effectiveRetractable() {
      return this.editable == 1 && this.versionStatus == 'submitted';
    },
    effectiveRollbackable() {
      return (this.editable == 1 || this.reviewable == 1) && this.versionIsActive == 0 && this.versionStatus == 'passed';
    },
    effectiveCreateable() {
      return this.editable == 1 && this.versionIsActive == 1 && this.operationType == 'combop';
    },
    effectiveCancelable() {
      return this.versionId == null && (this.editable == 1 || this.reviewable == 1);
    },
    effectiveDeletable() {
      return this.versionId != null && (this.editable == 1 || this.reviewable == 1) && this.versionIsActive == 0 && this.versionStatus != 'submitted';
    },
    effectiveExecutable() {
      return this.executable == 1 && this.isActive == 1 && this.versionIsActive == 1;
    }
  },
  watch: {
    currentStep: {
      handler(val) {
        if (val) {
          this.currentConfig = this.stepList.find(s => {
            return s.uuid === val;
          });
          this.currentScriptLength = this.currentConfig && this.currentConfig.config && this.currentConfig.config.phaseOperationList ? this.currentConfig.config.phaseOperationList.length : 0;
        } else {
          this.currentConfig = null;
          this.currentScriptLength = 0;
        }
      },
      immediate: true,
      deep: true
    }
  },
  beforeRouteEnter(to, from, next) {
    //获取前一个路由信息，用来返回
    if (from.path != '/' && from.path.indexOf('runner-detail') < 0) {
      //执行页面跳转过来的，返回为默认值
      sessionStorage.setItem(to.path, JSON.stringify({ router: from.fullPath, name: from.meta.title }));
    }
    // 通过 `vm` 访问组件实例,将值传入fromPath
    // next(true);
    next(vm => {
      // 通过 `vm` 访问组件实例,将值传入fromPath
      vm.fromPath = from.path; //获取上层路由地址
    });
  },
  beforeRouteLeave(to, from, next, url) {
    let data = this.getData();
    if (data && data.config) {
      delete data.id;
      delete data.name;
      delete this.initData.id;
      delete this.initData.name;
      if (!this.effectiveEditable || !this.initData || this.$utils.isSame(this.initData, data)) {
        url ? this.$utils.gotoHref(url) : next(true);
      } else {
        let _this = this;
        this.$utils.jumpDialog.call(
          this,
          {
            save: {
              fn: async vnode => {
                return await _this.saveVersionAction();
              }
            }
          },
          to,
          from,
          next,
          url
        );
      }
    } else {
      next(true);
    }
  }
};
</script>
<style lang="less" scoped>
.action-detail {
  height: 100%;
  .action-title {
    width: 100%;
    display: inline-flex;
    flex-direction: column;
    vertical-align: initial;
    &-name {
      display: inline-block;
      max-width: 220px;
      height: 21px;
      line-height: 21px;
      font-size: 14px;
      vertical-align: middle;
    }
    &-uk {
      display: inline-block;
      height: 16px;
      line-height: 16px;
      vertical-align: middle;
    }
  }
}

.addTarget {
  padding: 10px 16px;
  border-bottom: 1px solid;
}

.setting-main {
  width: 100%;
  height: calc(100vh - 100px - 32px - 16px);
  overflow-y: auto;
}
.more-action {
  min-width: 66px;
  padding: 0 8px;
}
/deep/ .ivu-dropdown {
  display: block;
}
/deep/ .sort-class {
  border: 1px solid;
  border-radius: 50%;
  padding: 0 4px;
  margin-left: 4px;
}
</style>
