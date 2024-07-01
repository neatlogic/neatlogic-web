<template>
  <div class="omnipotentNode">
    <!-- 表单场景 -->
    <FormsceneSetting
      :value="configData.stepConfig"
      :formConfig="formConfig"
      :toSetting="toSetting"
      :nodeConfig="nodeConfig"
      @updateScene="updateScene"
    ></FormsceneSetting>
    <!-- 权限 -->
    <AuthoritySetting
      :list="authorityList"
      :defaultIsActive="activeSetting.permission"
      :nodeConfig="nodeConfig"
      @updateauthority="updateauthority"
    ></AuthoritySetting>
    <!-- 通知设置 -->
    <NoticeSetting
      ref="NoticeSetting"
      v-model="activeSetting.informSetting"
      :formUuid="formUuid"
      :config="notifyPolicyConfig"
      :nodeConfig="nodeConfig"
    ></NoticeSetting>
    <!-- 动作设置 -->
    <ActionSetting
      v-bind="actionConfig"
      :defaultIsActive="activeSetting.actionSetting"
      :formConfig="formConfig"
      @updateActionSetting="updateActionSetting"
      @updateaction="updateaction"
    ></ActionSetting>
    <!-- 动作设置_end -->
    <!-- 重审 -->
    <ReapprovalSetting v-model="activeSetting.enableReapproval"></ReapprovalSetting>
    <!-- 按钮映射 -->
    <ButtonSetting
      :defaultIsActive="activeSetting.buttonStatus"
      :defaultCustomButtonList="customButtonList"
      :defaultCustomStatusList="customStatusList"
      :defaultReplaceableTextList="replaceableTextList"
      :nodeConfig="nodeConfig"
      :isClearData="isClearData"
      @updatebutton="updatebutton"
    ></ButtonSetting>
    <div class="settingList">
      <div class="control-box">
        <div class="control-setting">
          <span class="label">{{ $t('term.process.autostart') }}</span>
          <span class="control-btn">
            <span class="tip">{{ $t('term.process.autostarttip') }}</span>
            <TsFormSwitch v-model="configData.stepConfig.autoStart" :true-value="1" :false-value="0"></TsFormSwitch>
          </span>
        </div>
      </div>
    </div>
    <CompleteSetting v-model="activeSetting.autoComplete"></CompleteSetting>
    <ApprovalSetting v-model="activeSetting.autoApproval"></ApprovalSetting>
    <div v-if="isStart" class="settingList">
      <div class="control-box">
        <div class="control-setting">
          <span class="label">{{ $t('term.process.enableattachments') }}</span>
          <span class="control-btn">
            <TsFormSwitch v-model="configData.stepConfig.isNeedUploadFile" :true-value="1" :false-value="0"></TsFormSwitch>
          </span>
        </div>
      </div>
    </div>
    <div v-if="isStart" class="settingList">
      <div class="control-box">
        <div class="control-setting">
          <span class="label">{{ $t('term.process.enabledesc') }}</span>
          <span class="control-btn">
            <TsFormSwitch v-model="configData.stepConfig.isNeedContent" :true-value="1" :false-value="0"></TsFormSwitch>
          </span>
        </div>
      </div>
    </div>
    <div v-if="showIsRequired" class="settingList">
      <div class="control-box">
        <div class="control-setting">
          <span class="label">{{ isStart? $t('form.placeholder.required',{target: $t('page.description')}) : $t('form.placeholder.required',{target: $t('page.reply')}) }}</span>
          <span class="control-btn">
            <TsFormSwitch v-model="configData.stepConfig.isRequired" :true-value="1" :false-value="0"></TsFormSwitch>
          </span>
        </div>
      </div>
    </div>
    <div class="settingList">
      <div class="control-box">
        <div class="control-setting">
          <span class="label">
            <span>{{ $t('page.defaultcontent') }}</span>
          </span>
          <span class="control-btn">
            <TsFormSwitch v-model="activeSetting.replySetting" :true-value="1" :false-value="0"></TsFormSwitch>
          </span>
        </div>
      </div>
      <div v-if="activeSetting.replySetting == 1" class="permission-list">
        <div class="bg-block">
          <ReplySetting ref="replySetting" :commentTemplateId="configData.stepConfig.commentTemplateId"></ReplySetting>
        </div>
      </div>
    </div>

    <!-- 创建子任务 通用节点 -->
    <StrategySetting
      v-if="nodeConfig.handler === 'omnipotent'"
      ref="StrategySetting"
      :isStrategy="taskisStrategy"
      :strategySetting="configData.stepConfig"
    ></StrategySetting>
    <!-- 标签 -->
    <TagSetting
      ref="TagSetting"
      :nodeConfig="nodeConfig"
      :defaultIsActive="activeSetting.tagSetting"
      :list="tagList"
    ></TagSetting>
    <!-- 初步处理人 -->
    <div v-if="!isStart">
      <AssignSetting
        id="assignData"
        ref="assignData"
        :prevNodes="prevNodes"
        :formUuid="formUuid"
        :defaultWorkerPolicyConfig="workerPolicyConfig"
        :toSetting="toSetting"
      ></AssignSetting>
    </div>
  </div>
</template>

<script>
//通用节点
import AssignSetting from './nodesetting/assign-setting';
import nodemixin from './nodemixin.js';
import itemmixin from './itemmixin.js';
export default {
  name: '',
  components: {
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    AuthoritySetting: () => import('./nodesetting/authority-setting.vue'), // 权限设置
    NoticeSetting: () => import('./nodesetting/notice-setting.vue'), // 通知设置
    ReapprovalSetting: () => import('./nodesetting/reapproval-setting.vue'), // 重审
    ActionSetting: () => import('./nodesetting/action-setting.vue'), // 动作设置
    ButtonSetting: () => import('./nodesetting/button-setting.vue'), // 文案修改
    AssignSetting,
    ReplySetting: () => import('./nodesetting/reply-setting.vue'), // 回复模板
    StrategySetting: () => import('./nodesetting/strategy-setting.vue'), // 创建子任务
    TagSetting: () => import('./nodesetting/tag-setting.vue'), // 标签
    CompleteSetting: () => import('./nodesetting/complete-setting.vue'), // 自动流转
    ApprovalSetting: () => import('./nodesetting/approval-setting.vue'), // 自动审批
    FormsceneSetting: () => import('./nodesetting/formscene-setting') // 表单场景
  },
  mixins: [nodemixin, itemmixin],
  props: {},
  data() {
    let _this = this;
    return {
      isClearData: false,
      configData: {stepConfig: {}}, //当前节点数据
      activeSetting: {//开关设置
        permission: 0, //权限设置开关
        buttonStatus: 0, //按钮状态设置
        informSetting: 0, //通知设置
        replySetting: 0, //回复模板
        tagSetting: 0, //标签
        enableReapproval: 0, //重审
        autoComplete: 0, //自动流转
        autoApproval: 0, //自动审批
        actionSetting: 0 // 动作设置
        // isStrategy: 0 //子任务节点是否开启，如果说有子任务节点id就开启，没有就关闭
      },
      taskisStrategy: {
        isStrategy: 0 //子任务节点是否开启，如果说有子任务节点id就开启，没有就关闭
      },
      validateSelectList: ['required'],
      formUuid: _this.formConfig && _this.formConfig.uuid ? _this.formConfig.uuid : '', //表单id
      authorityList: [], //权限
      customButtonList: [], //按钮
      customStatusList: [], //工单状态映射
      replaceableTextList: [], //文案映射
      workerPolicyConfig: {}, //分派处理人
      notifyPolicyConfig: {},
      actionConfig: {}, //动作数据
      copyPrevNodes: _this.prevNodes || [], //复制前置步骤
      processStepUuidList: '', //前置步骤值
      previewFormContent: null, //用来预览表单数据
      tagList: []
    };
  },

  beforeCreate() {},

  created() {},

  beforeMount() {},

  mounted() {
    this.keyList = ['actionConfig', 'authorityList', 'customStatusList', 'customButtonList', 'replaceableTextList', 'notifyPolicyConfig', 'workerPolicyConfig', 'tagList', 'taskConfig'];//stepConfig 需要包含的数据
    this.getNodeSetting();
  },

  beforeUpdate() {},

  updated() {},

  activated() {},

  deactivated() {},

  beforeDestroy() {},

  destroyed() {},

  methods: {
    getNodeSetting() {
      //初始化节点数据
      if (!this.nodeConfig) {
        return;
      }
      // 如果子任务有id就开启,没有就关闭
      let config = this.configData = this.$utils.deepClone(this.nodeConfig);
      // if (this.configData.stepConfig.taskConfig && this.configData.stepConfig.taskConfig.idList.length > 0) {
      //   this.taskisStrategy.isStrategy = 1;
      // } else {
      //   this.taskisStrategy.isStrategy = 0;
      // }

      this.uuid = config.uuid;
      this.initNodeData(config, this.keyList);//初始化数据
      this.getCopyPrevNodes();//初始化前置节点
      if (this.formUuid) { //获取表单对应的数据
        this.getFormItem(this.formUuid);
      }

      if (!this.configData.stepConfig.taskConfig) {
        this.configData.stepConfig.taskConfig = {};
        this.configData.stepConfig.taskConfig.rangeList = [];
        this.configData.stepConfig.taskConfig.idList = [];
      }
      this.activeSetting.enableReapproval = config.stepConfig ? config.stepConfig.enableReapproval : 0;
      this.activeSetting.autoComplete = config.stepConfig ? config.stepConfig.autoComplete : 0;
      this.activeSetting.autoApproval = config.stepConfig ? config.stepConfig.autoApproval : 0;
    },
    getCopyPrevNodes() {
      //所有节点数据筛选
      if (this.copyPrevNodes && this.copyPrevNodes.length > 0) {
        let newCopyPrevNodes = [];
        this.copyPrevNodes.forEach((item, index) => {
          if (item.type == 'process') {
            newCopyPrevNodes.push(item);
          }
        });
        this.copyPrevNodes = newCopyPrevNodes;
      }
    },
    nodeValid(href) {
      //校验
      let querySelect = href.substring(1);
      this.$nextTick(() => {
        if (querySelect != 'assignData') {
          this.$refs[`${querySelect}`].valid();
        } else {
          this.$refs.assignData && this.$refs.assignData.assignValid();
        }
      });
    },
    saveNodeData() {
      //保存数据
      let stepConfig = Object.assign({}, this.configData.stepConfig);
      if (this.keyList && this.keyList.length) {
        this.keyList.forEach(item => {
          stepConfig[item] = this[item] || undefined;
        });
      }
      if (this.$refs.NoticeSetting) { //通知
        stepConfig.notifyPolicyConfig = this.$refs.NoticeSetting.getData();
      }
      if (this.$refs.TagSetting) { //标签
        stepConfig.tagList = this.$refs.TagSetting.getData();
      }
      stepConfig.enableReapproval = this.activeSetting.enableReapproval; //重审
      stepConfig.autoComplete = this.activeSetting.autoComplete; //自动流转
      stepConfig.autoApproval = this.activeSetting.autoApproval; //自动审批
      // if (this.$refs.StrategySetting['_data'].isShow == 0) { // 子任务策略
      if (!stepConfig.taskConfig) {
        stepConfig.taskConfig = {};
        stepConfig.taskConfig.rangeList = [];
        stepConfig.taskConfig.idList = [];
      } else {
        if (stepConfig.taskConfig.idList.length > 0) {
          this.taskisStrategy.isStrategy = 1;
        }
      }
      // }
      //回复模板
      stepConfig.commentTemplateId = this.$refs.replySetting && this.$refs.replySetting.getData() ? this.$refs.replySetting.getData() : undefined;
      //分派处理人
      if (this.$refs.assignData) {
        stepConfig.workerPolicyConfig = this.$refs.assignData.saveAssignData();
      }
      // 表单场景
      stepConfig['formSceneUuid'] = this.configData.stepConfig.formSceneUuid || '';
      return this.clearNodeData(stepConfig);
    },
    updateaction(type, data, index) {
      if (type == 'add') {
        this.actionConfig.actionList.push(data);
      } else if (type == 'empty') {
        this.actionConfig.actionList = [];
      } else if (type == 'remove') {
        this.$delete(this.actionConfig.actionList, index);
      } else {
        this.$set(this.actionConfig.actionList, index, data);
      }
    }
  },

  filter: {},

  computed: {},

  watch: {
    formConfig: {
      handler(newVal, oldVal) {
        let _this = this;
        let newformConfig = newVal ? JSON.parse(JSON.stringify(new Object(newVal))) : {};
        this.formUuid = newformConfig.uuid || '';
        _this.$nextTick(() => {
          _this.getFormItem(_this.formUuid);
        });
      },
      deep: true
    }
  }
};
</script>

