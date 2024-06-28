
<template>
  <div class="createjob">
    <BaseConfig
      ref="baseConfig"
      :keyList="keyList"
      :formUuid="formUuid"
      :nodeConfig="nodeConfig"
      :formConfig="formConfig"
      :nodeFormconfig="nodeFormconfig"
      :nodeChildren="nodeChildren"
      :toSetting="toSetting"
      :prevNodes="prevNodes"
      :allPrevNodes="allPrevNodes"
      :formhandlerList="formhandlerList"
      :isExtendList="isExtendList"
      :isStart="isStart"
      :stepList="stepList"
      :nodeAllLinksList="nodeAllLinksList"
    >
      <template v-slot:customConfig>
        <CreatejobSetting
          ref="createJobConfig"
          :defaultCreateJobConfig="createJobConfig"
          :formUuid="formUuid"
        ></CreatejobSetting>
      </template>
    </BaseConfig>
  
  </div>
</template>
<script>

export default {
  name: '',
  components: {
    BaseConfig: () => import('../base-config.vue'),
    CreatejobSetting: () => import('./createjob-setting.vue')
  },
  filters: {},
  mixins: [],
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
      uuid: this.nodeConfig && this.nodeConfig.uuid, //节点uuid
      formUuid: this.formConfig && this.formConfig.uuid ? this.formConfig.uuid : '', //表单id
      keyList: ['actionConfig', 'authorityList', 'customStatusList', 'customButtonList', 'replaceableTextList', 'notifyPolicyConfig', 'workerPolicyConfig'], //stepConfig 需要包含的数据
      createJobConfig: {}
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
      if (config.stepConfig) {
        this.createJobConfig = config.stepConfig.createJobConfig || {};
      }
    },
    nodeValid(href) {
      //校验
      let querySelect = href.substring(1);
      this.$nextTick(() => {
        if (querySelect == 'createJobConfig') {
          this.$refs.createJobConfig && this.$refs.createJobConfig.createJobConfigValid();
        } else {
          this.$refs.baseConfig.nodeBaseValid(querySelect);
        }
      });
    },
    saveNodeData() {
      //保存数据
      let stepConfig = Object.assign({}, this.configData.stepConfig);
      if (this.$refs.baseConfig) {
        Object.assign(stepConfig, this.$refs.baseConfig.saveNodeBaseData());
      }
      if (this.$refs.createJobConfig) { //组合工具
        let createJobConfig = this.$refs.createJobConfig.saveData();
        this.$set(stepConfig, 'createJobConfig', createJobConfig);
      }
      return stepConfig;
    }
  },
  computed: {},
  watch: {}
};
</script>
