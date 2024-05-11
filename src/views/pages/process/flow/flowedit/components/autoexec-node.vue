
<template>
  <div class="autoexecNode">
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
      v-bind="actionConfig"
      :defaultIsActive="activeSetting.actionSetting"
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
      <div v-if="formUuid !='' && isExtend(previewFormContent)">
        <ExtendAuth
          :config="extendConfig"
          :noUserExtendList="noUserExtendList"
          :formConfig="previewFormContent"
          @updateConfig="updateExtendConfig"
        ></ExtendAuth>
      </div>
    </div>
    <AutoexecSetting
      ref="autoexecConfig"
      :defaultAutoexecConfig="autoexecConfig"
      :allPrevNodes="allPrevNodes"
      :uuid="uuid"
      :formUuid="formUuid"
    ></AutoexecSetting>
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
import AssignSetting from './nodesetting/assign-setting';
import AutoexecSetting from './nodesetting/autoexec-setting.vue';
import nodemixin from './nodemixin.js';
import itemmixin from './itemmixin.js';
export default {
  name: '',
  components: {
    AssignSetting,
    AutoexecSetting,
    AuthoritySetting: resolve => require(['./nodesetting/authority-setting.vue'], resolve),
    NoticeSetting: resolve => require(['./nodesetting/notice-setting.vue'], resolve),
    ActionSetting: resolve => require(['./nodesetting/action-setting.vue'], resolve),
    ButtonSetting: resolve => require(['./nodesetting/button-setting.vue'], resolve),
    ExtendAuth: resolve => require(['./nodesetting/extend/extendauth.vue'], resolve),
    FormsceneSetting: resolve => require(['./nodesetting/formscene-setting'], resolve) // 表单场景
  },
  filters: {},
  mixins: [nodemixin, itemmixin],
  props: {},
  data() {
    let _this = this;
    return {
      configData: {stepConfig: {}}, //当前节点数据
      activeSetting: {//开关设置
        permission: 0, //权限设置开关
        buttonStatus: 0, //按钮状态设置
        informSetting: 0, //通知设置
        actionSetting: 0 // 动作设置
      },
      formUuid: _this.formConfig && _this.formConfig.uuid ? _this.formConfig.uuid : '', //表单id
      taskisStrategy: {
        isStrategy: 0 //子任务节点是否开启，如果说有子任务节点id就开启，没有就关闭
      },    
      authorityList: [], //权限
      customButtonList: [], //按钮
      customStatusList: [], //工单状态映射
      replaceableTextList: [], //文案映射
      notifyPolicyConfig: {}, //通知
      actionConfig: {}, //动作数据
      previewFormContent: null, //用来预览表单数据
      extendConfig: {}, //拓展属性配置的流程设置
      validateList: ['required'],
      autoexecConfig: {}, //自动化数据
      workerPolicyConfig: {}
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.keyList = ['actionConfig', 'authorityList', 'customStatusList', 'customButtonList', 'replaceableTextList', 'notifyPolicyConfig', 'autoexecConfig', 'workerPolicyConfig'];//stepConfig 需要包含的数据
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
      if (this.formUuid) { //获取表单对应的数据
        this.getFormItem(this.formUuid);
      }
      this.getFailPolicyList();
      let failPolicy = this.autoexecConfig.failPolicy || null;
      this.failPolicy = this.$utils.deepClone(failPolicy);
    },
    getFailPolicyList() {
      let data = {
        enumClass: 'neatlogic.module.autoexec.constvalue.FailPolicy'
      };
      this.$api.common.getSelectList(data).then((res) => {
        if (res.Status == 'OK') {
          let failPolicyList = res.Return || [];
          let newfailPolicyList = [];
          let isBack = false;
          if (this.nodeAllLinksList && this.nodeAllLinksList.length > 0) {
            this.nodeAllLinksList.forEach(item => {
              if (item.config.type == 'backward') {
                isBack = true;
              }
            });
          }
          if (!isBack) {
            newfailPolicyList = failPolicyList.filter(f => f.value != 'back');
          } else {
            newfailPolicyList = failPolicyList;
          }
          this.failPolicyList = newfailPolicyList;
        }
      });
    },
    nodeValid(href) {
      //校验
      let querySelect = href.substring(1);
      this.$nextTick(() => {
        if (querySelect == 'autoexecCombop') {
          this.$refs.autoexecConfig && this.$refs.autoexecConfig.autoexecConfigValid();
        } else if (querySelect == 'assignData') {
          this.$refs.assignData && this.$refs.assignData.assignValid();
        } else {
          this.$refs[`${querySelect}`].valid();
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
      if (this.$refs.autoexecConfig) { //组合工具
        let autoexecConfig = this.$refs.autoexecConfig.saveAutoexecConfig();
        this.$set(stepConfig, 'autoexecConfig', autoexecConfig);
      }
      // if (!stepConfig.taskConfig) {
      //   stepConfig.taskConfig = {};
      //   stepConfig.taskConfig.rangeList = [];
      //   stepConfig.taskConfig.idList = [];
      // }
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
        this.$set(this.actionConfig, 'actionList', []);
      } else if (type == 'remove') {
        this.$delete(this.actionConfig.actionList, index);
      } else {
        this.$set(this.actionConfig.actionList, index, data);
      }
    }
  },
  computed: {},
  watch: {
    formConfig: {
      handler(newVal, oldVal) {
        let _this = this;
        let newformConfig = newVal ? JSON.parse(JSON.stringify(new Object(newVal))) : {};
        this.formUuid = newformConfig.uuid || '';
        this.extendConfig = {};
        _this.getNodeform(newformConfig);
        if (newformConfig.extendConfig) {
          for (let key in newformConfig.extendConfig) {
            this.extendConfig[key] = newformConfig.extendConfig[key] ? newformConfig.extendConfig[key][this.nodeConfig.uuid] || {} : {};
          }
        }
        _this.$nextTick(() => {
          _this.getFormItem(_this.formUuid);
        });
      },
      deep: true
    }
  }
};
</script>
