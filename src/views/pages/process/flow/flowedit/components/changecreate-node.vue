<template>
  <div class="changecreateNode">
    <!-- 表单场景 -->
    <FormsceneSetting
      :value="configData.stepConfig"
      :formConfig="formConfig"
      :toSetting="toSetting"
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
      :defaultIsActive="activeSetting.actionSetting"
      v-bind="actionConfig"
      :formConfig="formConfig"
      @updateaction="updateaction"
      @updateActionSetting="updateActionSetting"
    ></ActionSetting>
    <!-- 动作设置_end -->
    <!-- 按钮映射 -->
    <ButtonSetting
      :defaultIsActive="activeSetting.buttonStatus"
      :defaultCustomButtonList="customButtonList"
      :defaultCustomStatusList="customStatusList"
      :defaultReplaceableTextList="replaceableTextList"
      :nodeConfig="nodeConfig"
      @updatebutton="updatebutton"
    ></ButtonSetting>
    <div class="settingList">
      <div class="control-box">
        <div class="control-setting">
          <span class="label">{{ $t('term.process.autostart') }}</span>
          <span class="control-btn">
            <span class="tip">{{ $t('term.process.autostarttip') }}</span>
            <i-switch v-model="configData.stepConfig.autoStart" :true-value="1" :false-value="0"></i-switch>
          </span>
        </div>
      </div>
    </div>
    <div v-if="isStart" class="settingList">
      <div class="control-box">
        <div class="control-setting">
          <span class="label">{{ $t('term.process.enableattachments') }}</span>
          <span class="control-btn">
            <i-switch v-model="configData.stepConfig.isNeedUploadFile" :true-value="1" :false-value="0"></i-switch>
          </span>
        </div>
      </div>
    </div>
    <div v-if="isStart" class="settingList">
      <div class="control-box">
        <div class="control-setting">
          <span class="label">{{ $t('term.process.enabledesc') }}</span>
          <span class="control-btn">
            <i-switch v-model="configData.stepConfig.isNeedContent" :true-value="1" :false-value="0"></i-switch>
          </span>
        </div>
      </div>
    </div>
    <div v-if="showIsRequired" class="settingList">
      <div class="control-box">
        <div class="control-setting">
          <span class="label">{{ isStart? $t('form.placeholder.required',{target: $t('page.description')}) : $t('form.placeholder.required',{target: $t('page.reply')}) }}</span>
          <span class="control-btn">
            <i-switch v-model="configData.stepConfig.isRequired" :true-value="1" :false-value="0"></i-switch>
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
            <i-switch v-model="activeSetting.replySetting" :true-value="1" :false-value="0"></i-switch>
          </span>
        </div>
      </div>
      <div v-if="activeSetting.replySetting == 1" class="permission-list">
        <div class="bg-block">
          <ReplySetting ref="replySetting" :commentTemplateId="configData.stepConfig.commentTemplateId"></ReplySetting>
        </div>
      </div>
    </div>
    <!-- 标签 -->
    <TagSetting
      ref="TagSetting"
      :nodeConfig="nodeConfig"
      :defaultIsActive="activeSetting.tagSetting"
      :list="tagList"
    ></TagSetting>
    <div v-if="formUuid !='' && isExtend(previewFormContent)">
      <ExtendAuth
        :config="extendConfig"
        :noUserExtendList="noUserExtendList"
        :formConfig="previewFormContent"
        @updateConfig="updateExtendConfig"
      ></ExtendAuth>
    </div>
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
//变更创建
import AssignSetting from './nodesetting/assign-setting';
import itemmixin from './itemmixin.js';
import nodemixin from './nodemixin.js';
export default {
  name: '',
  components: {
    AuthoritySetting: resolve => require(['./nodesetting/authority-setting.vue'], resolve),
    NoticeSetting: resolve => require(['./nodesetting/notice-setting.vue'], resolve),
    ActionSetting: resolve => require(['./nodesetting/action-setting.vue'], resolve),
    ButtonSetting: resolve => require(['./nodesetting/button-setting.vue'], resolve),
    AssignSetting,
    ExtendAuth: resolve => require(['./nodesetting/extend/extendauth.vue'], resolve),
    ReplySetting: resolve => require(['./nodesetting/reply-setting.vue'], resolve),
    TagSetting: resolve => require(['./nodesetting/tag-setting.vue'], resolve),
    FormsceneSetting: resolve => require(['./nodesetting/formscene-setting'], resolve) // 表单场景
  },
  mixins: [nodemixin, itemmixin],
  props: {},
  data() {
    let _this = this;
    return {
      configData: {stepConfig: {}}, //当前节点数据
      activeSetting: {
        //开关设置
        permission: 0, //权限设置开关
        buttonStatus: 0, //按钮状态设置
        informSetting: 0, //通知设置
        replySetting: 0, //回复模版
        tagSetting: 0, //标签
        actionSetting: 0 // 动作设置
      },
      validateSelectList: ['required'],
      formUuid: _this.formConfig && _this.formConfig.uuid ? _this.formConfig.uuid : '', //表单id
      authorityList: [], //权限
      customButtonList: [], //按钮
      customStatusList: [], //工单状态映射
      replaceableTextList: [], //文案映射
      workerPolicyConfig: {},
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
    this.keyList = ['actionConfig', 'authorityList', 'customStatusList', 'customButtonList', 'replaceableTextList', 'notifyPolicyConfig', 'workerPolicyConfig', 'tagList'];//stepConfig 需要包含的数据
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
      let config = this.configData = this.$utils.deepClone(this.nodeConfig);
      this.uuid = config.uuid;
      this.initNodeData(config, this.keyList);//初始化数据
      this.getCopyPrevNodes();//初始化前置节点
      if (this.formUuid) { //获取表单对应的数据
        this.getFormItem(this.formUuid);
      }
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
          this.$refs.assignData.assignValid();
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
      //权限设置
      if (this.$refs.NoticeSetting) { //通知
        stepConfig.notifyPolicyConfig = this.$refs.NoticeSetting.getData();
      }
      if (this.$refs.TagSetting) { //标签
        stepConfig.tagList = this.$refs.TagSetting.getData();
      }
      //回复模板
      stepConfig.commentTemplateId = this.$refs.replySetting && this.$refs.replySetting.getData() ? this.$refs.replySetting.getData() : undefined;
      //分派处理人
      if (this.$refs.assignData) {
        stepConfig.workerPolicyConfig = this.$refs.assignData.saveAssignData();
      }
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
        let newformConfig = this.$utils.deepClone(newVal);
        this.extendConfig = {};
        this.formUuid = newformConfig.uuid || '';
        _this.getNodeform(newformConfig);
        if (newformConfig.extendConfig) {
          for (let key in newformConfig.extendConfig) {
            this.extendConfig[key] = newformConfig.extendConfig[key] ? newformConfig.extendConfig[key][this.nodeConfig.uuid] || {} : {};
          }
        }
        this.getFormItem(this.formUuid);
      },
      deep: true
    }
  }
};
</script>

