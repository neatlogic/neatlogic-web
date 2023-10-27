<template>
  <div class="cmdbsyncNode">
    <!-- 表单场景 -->
    <FormsceneSetting
      v-model="configData.stepConfig"
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
    <!-- 模型设置 -->
    <CmdbsyncSetting id="ciEntityConfig" ref="ciEntityConfig" :defaultCiEntityConfig="ciEntityConfig"></CmdbsyncSetting>
    <!-- 异常处理人 -->
    <AssignSetting
      id="assignData"
      ref="assignData"
      :prevNodes="prevNodes"
      :formUuid="formUuid"
      :defaultWorkerPolicyConfig="workerPolicyConfig"
      :toSetting="toSetting"
    ></AssignSetting>
  </div>
</template>
<script>
import nodemixin from '@/views/pages/process/flow/flowedit/components/nodemixin.js';
export default {
  name: '',
  components: {
    FormsceneSetting: resolve => require(['@/views/pages/process/flow/flowedit/components/nodesetting/formscene-setting'], resolve), // 表单场景
    AuthoritySetting: resolve => require(['@/views/pages/process/flow/flowedit/components/nodesetting/authority-setting.vue'], resolve),
    NoticeSetting: resolve => require(['@/views/pages/process/flow/flowedit/components/nodesetting/notice-setting.vue'], resolve),
    ActionSetting: resolve => require(['@/views/pages/process/flow/flowedit/components/nodesetting/action-setting.vue'], resolve),
    ButtonSetting: resolve => require(['@/views/pages/process/flow/flowedit/components/nodesetting/button-setting.vue'], resolve),
    AssignSetting: resolve => require(['@/views/pages/process/flow/flowedit/components/nodesetting/assign-setting.vue'], resolve),
    CmdbsyncSetting: resolve => require(['./nodesetting/cmdbsync-setting.vue'], resolve)
  },
  mixins: [nodemixin],
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
      authorityList: [], //权限
      customButtonList: [], //按钮
      customStatusList: [], //工单状态映射
      replaceableTextList: [], //文案映射
      notifyPolicyConfig: {}, //通知
      actionConfig: {}, //动作数据
      workerPolicyConfig: {},
      ciEntityConfig: {}
    };
  },
  beforeCreate() {},
  created() {
  },
  beforeMount() {},
  mounted() {
    this.keyList = ['actionConfig', 'authorityList', 'customStatusList', 'customButtonList', 'replaceableTextList', 'notifyPolicyConfig', 'workerPolicyConfig', 'ciEntityConfig'];//stepConfig 需要包含的数据
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
    },
    nodeValid(href) {
      //校验
      let querySelect = href.substring(1);
      this.$nextTick(() => {
        if (querySelect != 'assignData') {
          this.$refs[`${querySelect}`] && this.$refs[`${querySelect}`].valid();
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
      //权限设置
      if (this.$refs.NoticeSetting) { //通知
        stepConfig.notifyPolicyConfig = this.$refs.NoticeSetting.getData();
      }
      //分派处理人
      if (this.$refs.assignData) {
        stepConfig.workerPolicyConfig = this.$refs.assignData.saveAssignData();
      }
      stepConfig['formSceneUuid'] = this.configData.stepConfig.formSceneUuid || '';
      if (this.$refs.ciEntityConfig) { //组合工具cmdb
        let ciEntityConfig = this.$refs.ciEntityConfig.save();
        this.$set(stepConfig, 'ciEntityConfig', ciEntityConfig);
      }
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
  watch: {}
};
</script>
<style lang="less">
</style>
