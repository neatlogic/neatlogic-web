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
      uuid: this.nodeConfig && this.nodeConfig.uuid //节点uuid
    };
  },
  mounted() { },
  beforeDestroy() { },
  methods: {
    saveNodeData() {
      let data = {};
      return data;
    }
  },
  computed: {
    showIsRequired() {
      return !this.isStart || this.configData.stepConfig.isNeedContent;
    }
  },
  watch: {}
};
