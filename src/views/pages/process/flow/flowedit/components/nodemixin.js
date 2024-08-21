export default {
  props: {
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
      uuid: null, //节点uuid
      noUserExtendList: ['cientityselect'], //不需要使用的扩展属性['cientityselect']  暂时先屏蔽掉所有的配置项扩展属性，因为现在需求不清晰导致这个功能模糊
      formSceneUuidList: [] // 表单场景uuid列表
    };
  },
  mounted() { },
  beforeDestroy() { },
  methods: {
    tabSetting() {
      //前往流程设置
      this.toSetting();
    },
    onChangePermissionType(config) {
      this.$set(config, 'attributeUuidList', []);
      this.$set(config, 'type', 'component');
    },
    initNodeData(config, keyList) {
      if (!config.stepConfig) {
        return;
      }
      config = config.stepConfig;
      if (this.activeSetting) {
        this.activeSetting.permission = config.enableAuthority || 0;
        let btnList = [].concat(config.customStatusList || [], config.customButtonList || [], config.replaceableTextList || []);
        this.activeSetting.buttonStatus = btnList.find(item => !!item.value) ? 1 : 0; // 文案修改
        this.activeSetting.informSetting = config.notifyPolicyConfig && config.notifyPolicyConfig.policyId ? 1 : 0;
        this.activeSetting.replySetting = config.commentTemplateId ? 1 : 0;
        this.activeSetting.tagSetting = config.tagList && config.tagList.length > 0 ? 1 : 0;
        this.activeSetting.actionSetting = config.actionConfig && config.actionConfig.actionList.length > 0 ? 1 : 0; // 动作设置状态回显
        config.commentTemplateId = config.commentTemplateId || undefined;
        //？？？没有的数据，前端不要在初始化的时候塞值，会导致数据对比不一致
        // if (!config.taskConfig) { 
        //   config.taskConfig = {};
        //   config.taskConfig.rangeList = [];
        //   config.taskConfig.idList = [];
        //   // console.log(config.taskConfig, '++++主ID长度');
        // } else {
        //   // console.log(config.taskConfig, '主ID长度', this.$refs.StrategySetting);
        //   if (config.taskConfig.idList.length > 0) {
        //     this.taskisStrategy.isStrategy = 1;
        //     if (this.$refs.StrategySetting) {
        //       this.$refs.StrategySetting.getInit(config.taskConfig);
        //     }
        //   }
        // }
        if (config.taskConfig) {
          if (config.taskConfig.idList.length > 0) {
            this.taskisStrategy.isStrategy = 1;
            if (this.$refs.StrategySetting) {
              this.$refs.StrategySetting.getInit(config.taskConfig);
            }
          }
        }
      }
      if (keyList && keyList.length) {
        keyList.forEach(item => {
          if (config.hasOwnProperty(item)) {
            this[item] = config[item];
          }
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
    toggleType(type, config) {
      this.$set(config, 'attributeUuidList', []);
      this.$set(config, 'processStepUuidList', []);
    },
    updateauthority(permission, list) {
      this.$set(this.activeSetting, 'permission', permission);
      this.configData.stepConfig.enableAuthority = permission;
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
    }
  },
  computed: {
    isExtend() {
      return function(list) {
        let isShow = false;
        if (this.isExtendList && this.isExtendList.length > 0) {
          if (list && list.controllerList && list.controllerList.length > 0) {
            list.controllerList.forEach(c => {
              if (this.isExtendList.indexOf(c.handler) > -1) {
                isShow = true;
              }
            });
          }
        }
        return isShow;
      };
    },
    showIsRequired() {
      return !this.isStart || this.configData.stepConfig.isNeedContent;
    }
  },
  watch: {}
};
