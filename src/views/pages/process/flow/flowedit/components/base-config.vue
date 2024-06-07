<template>
  <div>
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
      :defaultIsActive="activeSetting.enableAuthority"
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
    <!--文案修改 按钮映射 -->
    <ButtonSetting
      :defaultIsActive="activeSetting.buttonStatus"
      :defaultCustomButtonList="customButtonList"
      :defaultCustomStatusList="customStatusList"
      :defaultReplaceableTextList="replaceableTextList"
      :nodeConfig="nodeConfig"
      @updatebutton="updatebutton"
    ></ButtonSetting>
    <!-- 节点自定义配置 -->
    <slot name="customConfig"></slot>
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
export default {
  name: '',
  components: {
    AuthoritySetting: () => import('./nodesetting/authority-setting.vue'), // 权限设置
    NoticeSetting: () => import('./nodesetting/notice-setting.vue'), // 通知设置
    ActionSetting: () => import('./nodesetting/action-setting.vue'), // 动作设置
    ButtonSetting: () => import('./nodesetting/button-setting.vue'), // 文案修改
    AssignSetting: () => import('./nodesetting/assign-setting.vue'), //分派处理人
    FormsceneSetting: () => import('./nodesetting/formscene-setting') // 表单场景
  },
  mixins: [],
  props: {
    formUuid: String,
    keyList: {
      type: Array,
      default: () => ['actionConfig', 'authorityList', 'customStatusList', 'customButtonList', 'replaceableTextList', 'notifyPolicyConfig', 'workerPolicyConfig']
    }, //当前节点需要的配置
    nodeConfig: Object, //节点数据
    formConfig: Object,
    nodeFormconfig: Object,
    prevNodes: Array, //前置节点数据
    allPrevNodes: Array, //所有前置节点，用于判断是否是开始节点
    toSetting: Function,
    isStart: Boolean, // 是否是起始节点
    nodeChildren: Array, //条件子节点
    formhandlerList: Array, //表单组件信息（含授权）
    isExtendList: Array, //表单额外扩展属性配置列表比如配置项
    stepList: Array, //当前画布的所有步骤节点数据
    nodeAllLinksList: Array //节点连线数据
  },
  data() {
    return {
      configData: {stepConfig: {}}, //当前节点数据
      activeSetting: {//开关设置
        enableAuthority: 0, //权限设置开关
        buttonStatus: 0, //按钮状态设置
        informSetting: 0, //通知设置
        actionSetting: 0 // 动作设置
      },
      authorityList: [], //权限
      customButtonList: [], //按钮
      customStatusList: [], //工单状态映射
      replaceableTextList: [], //文案映射
      notifyPolicyConfig: {}, //通知
      actionConfig: {}, //动作数据
      workerPolicyConfig: {} //初步处理人
    };
  },
  beforeCreate() {},
  created() {
    this.getNodeSetting();
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
    getNodeSetting() {
      //初始化节点数据
      if (!this.nodeConfig) {
        return;
      }
      let config = this.configData = this.$utils.deepClone(this.nodeConfig);
      this.initNodeData(config, this.keyList);//初始化数据
    },
    initNodeData(config, keyList) {
      if (!config.stepConfig) {
        return;
      }
      config = config.stepConfig;
      if (this.activeSetting) {
        this.activeSetting.enableAuthority = config.enableAuthority || 0;
        let btnList = [].concat(config.customStatusList || [], config.customButtonList || [], config.replaceableTextList || []);
        this.activeSetting.buttonStatus = btnList.find(item => !!item.value) ? 1 : 0; // 文案修改
        this.activeSetting.informSetting = config.notifyPolicyConfig && config.notifyPolicyConfig.policyId ? 1 : 0;
        this.activeSetting.actionSetting = config.actionConfig && config.actionConfig.actionList.length > 0 ? 1 : 0; // 动作设置状态回显
      }
      if (keyList && keyList.length) {
        keyList.forEach(item => {
          this[item] = config[item] || undefined;
        });
      }
    },
    getFormItem(uuid) {
      //获取表单指定版本的数据，渲染表单
      if (uuid) {
        let data = {
          uuid: uuid
        };
        this.$api.framework.form.getFormByVersionUuid(data).then(res => {
          if (res.Status == 'OK') {
            try {
              let formConfig = res.Return.formConfig || {};
              this.previewFormContent = formConfig;
              formConfig.sceneList && formConfig.sceneList.forEach((item) => {
                if (item.uuid) {
                  this.formSceneUuidList.push(item.uuid);
                }
              });
              if (formConfig.uuid) {
                this.formSceneUuidList.unshift(formConfig.uuid);
              }
            } catch (error) {
              this.formSceneUuidList = [];
              this.previewFormContent = {};
            }
          }
        });
      }
    },
    updateauthority(enableAuthority, list) {
      this.$set(this.activeSetting, 'enableAuthority', enableAuthority);
      this.configData.stepConfig.enableAuthority = enableAuthority;
      this.authorityList = list || [];
    },
    updatebutton(data) {
      if (data) {
        for (let key in data) {
          this[key] = data[key];
        }
      }
    },
    updateActionSetting(actionSetting) {
      // 更新动作设置
      this.$set(this.activeSetting, 'actionSetting', actionSetting);
    },
    updateScene(sceneConfig) {
      // 更新表单场景值
      this.$set(this.configData.stepConfig, 'formSceneUuid', sceneConfig.value);
    },
    nodeBaseValid(querySelect) {
      //校验
      if (querySelect == 'assignData') {
        this.$refs.assignData && this.$refs.assignData.assignValid();
      } else {
        this.$refs[`${querySelect}`].valid();
      }
    },
    saveNodeBaseData() {
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
      if (this.$refs.autoexecConfig) { //组合工具
        let autoexecConfig = this.$refs.autoexecConfig.saveAutoexecConfig();
        this.$set(stepConfig, 'autoexecConfig', autoexecConfig);
      }
      //分派处理人
      if (this.$refs.assignData) {
        stepConfig.workerPolicyConfig = this.$refs.assignData.saveAssignData();
      }
      stepConfig['formSceneUuid'] = this.configData.stepConfig.formSceneUuid || '';
      return this.clearNodeData(stepConfig);
    },
    clearNodeData(stepConfig) {
      // 清空隐藏节点值
      let stepConfigs = this.$utils.deepClone(stepConfig);
      for (let key in this.activeSetting) {
        if (key == 'actionSetting' && this.activeSetting[key] == 0) {
          // 动作设置
          if (!stepConfigs.actionConfig) {
            this.$set(stepConfigs, 'actionConfig', {});
          }
          this.$set(stepConfigs.actionConfig, 'actionList', []);
          break;
        }
      }
      return stepConfigs;
    },
    updateaction(type, data, index) {
      if (type == 'add') {
        this.actionConfig.actionList.push(data);
      } else if (type == 'empty') {
        this.$set(this.actionConfig, 'actionList', []);
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
    formUuid: {
      handler(val) {
        if (val) { //获取表单对应的数据
          this.getFormItem(val);
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less">
</style>
