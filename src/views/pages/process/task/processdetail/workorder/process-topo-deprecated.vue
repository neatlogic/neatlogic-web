<template>
  <div class="topo-box">
    <div ref="topo" class="sitemapMain"></div>
    <div class="tooltip-box"></div>
  </div>
</template>
<script>
import '@/views/pages/process/flow/topoComponent/index.js';
let Vm;

let viewOpts = {
  'canvas.width': width, 
  'canvas.height': this.leftHeight,
  'canvas.autoadjust': true, //显示辅助线
  'anchor.size': 4, //连接点大小
  'link.deleteable': false,
  'link.selectable': false,
  'node.selectable': false,
  'node.dragable': false,
  'node.deleteable': false,
  'node.connectable': false
};
export default {
  name: '',
  components: {},
  filters: {},
  props: {
    processConfig: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      processTaskId: null,
      taskStatus: false, //工单状态：true表示draft(展示上报内容)
      stepStatusList: [], //流程图状态列表展示
      stepTooltip: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.processTaskId = this.$route.query.processTaskId || null;
    this.getStepStatus();
    this.$nextTick(() => {
      this.initTopo(this.processConfig); //绘制流程图
    });
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    initTopo(config, action) {
      //获取流程图
      if (!config) return;
      let data = config;
      var topodata = data.topo || {
        nodes: startEndNode,
        links: []
      };
      this.$topoVm = Topo(this.$refs.topo, viewOpts);
      this.$topoVm.fromJson(JSON.parse(JSON.stringify(topodata)));
      this.$topoVm.center(0);
      // 改变节点状态
      this.changeNodeStatus();
    },
    getStepStatus() {
      //流程图数据
      let data = {
        processTaskId: this.processTaskId
      };
      this.$api.process.processtask.stepStatus(data).then(res => {
        if (res.Status == 'OK') {
          this.stepStatusList = res.Return;
        }
      });
    },
    changeNodeStatus() {
      let allNodes = this.$topoVm.getNodes();
      let startDispatchUuid = this.processConfig.process.connectionList[0].toStepUuid;
      let node = allNodes.find(a => a.getUuid() === startDispatchUuid);
      node.setFill('#2d84fb');
      node.setLoadingcolor('#fff');
    },
    userList(arr) {
      //处理人
      let userList = arr;
      let textList = [];
      userList.forEach(item => {
        textList.push(item.userName);
      });
      textList = textList.join('、');
      return textList;
    },
    workerListText(arr) {
      //待处理人
      let userList = arr;
      let textList = [];
      userList.forEach(item => {
        textList.push(item.name);
      });
      textList = textList.join('、');
      return textList;
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang='less' scoped>
</style>
