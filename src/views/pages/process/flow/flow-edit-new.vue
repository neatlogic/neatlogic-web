<template>
  <div class="flow-edit">
    <TsContain :rightWidth="340" :siderWidth="105" border="border">
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <span>{{ processConfig.name }}</span>
      </template>
      <template v-slot:topRight>
        <div class="div-btn-contain action-group" style="text-align: right">
          <span class="action-item tsfont-rotate-right" @click="test">TEST</span>
          <span class="action-item tsfont-rotate-right" @click="reset">{{ $t('page.reset') }}</span>
          <span class="action-item tsfont-xitongpeizhi" @click.prevent="flowDataValid">{{ $t('page.validate') }}</span>
          <span class="action-item tsfont-save" @click="flowSave(false)">{{ $t('page.save') }}</span>
          <span v-if="referenceCount > 0 || isNew == true" class="action-item tsfont-trash-o disable">{{ $t('page.delete') }}</span>
          <span v-else-if="referenceCount == 0 && isNew == false" class="action-item tsfont-trash-o" @click="deleteFlow">{{ $t('page.delete') }}</span>
          <span class="action-item tsfont-tool" @click="relevanceList">
            {{ $t('term.process.relcatalog') }}
            <span v-if="referenceCount > 0" class="reference-number">{{ referenceCount }}</span>
          </span>
        </div>
      </template>
      <template v-slot:sider>
        <ul v-if="nodeList" class="node-itemul">
          <li
            v-for="(node, index) in nodeList"
            :key="index"
            draggable="true"
            @dragstart="drag($event, node)"
          >
            {{ node }}
            <LeftNode v-if="!node._isHide" :key="'1' + index" :node="node"></LeftNode>
          </li>
        </ul>
      </template>
      <template v-slot:content>
        <div ref="graph" style="height: 100%">
          <Card
            v-if="validCardOpen"
            class="radius-lg"
            style="width: 320px"
            :padding="0"
            :style="{ position: 'absolute', 'z-index': 10, top: '10px', right: '10px' }"
          >
            <p slot="title" class="text-title">{{ $t('page.validate') }}</p>
            <a slot="extra" href="javascript:void(0);" @click.prevent="validCardOpen = false">
              <i class="tsfont-close text-title"></i>
            </a>
            <CellGroup class="cell-group">
              <Cell v-for="(item, index) in validList" :key="index" @click.native="validItemClick(item)">
                <template slot>
                  <div class="cell-item">
                    <i class="cell-icon" :class="item.type == 'error' ? 'tsfont-close-o text-error' : 'tsfont-check-o text-success'"></i>
                    <span>{{ item.msg }}</span>
                  </div>
                </template>
              </Cell>
            </CellGroup>
          </Card>
          <FlowEditor
            :config="flowConfig"
            :muted="true"
            @ready="ready"
            @node:selected="nodeSelected"
            @node:unselected="nodeUnSelected"
          ></FlowEditor>
        </div>
      </template>
      <template v-slot:right>
        <div class="col-right-contain col-contain">
          <!-- 20200213_zqp_调整:value为v-model实现数据双向绑定以监听activeTab的变化-->
          <Tabs v-model="activeTab" class="block-tabs" :animated="false">
            <TabPane :label="$t('term.process.flowsetting')" name="flowsetting">
              <FlowSetting
                v-if="isInit"
                ref="flowSetting"
                :formUuid.sync="formConfig.uuid"
                :uuid="processConfig.uuid"
                :name="processConfig.name"
                :formConfig="formConfig"
                :stepList="stepList"
                :processConfig="processConfig"
                @changeFlowName="changeFlowName"
                @updateformitemList="updateformitemList"
                @changeRelateForm="changeRelateForm"
              ></FlowSetting>
            </TabPane>
            <TabPane :label="$t('term.process.effectivenesstimesetting')" name="tacticssetting">
              <TacticsSetting
                ref="slaSetting"
                :slaListPorps="slaList"
                :canvasNodeList="stepList"
                :formConfig="formConfig"
                :startNodeuuid="startNodeuuid"
                @slaIn="nodesHighlight"
                @slaOut="nodesHighlight([])"
              ></TacticsSetting>
            </TabPane>
            <TabPane :label="$t('term.process.scoresetting')" name="scoresetting" class="tab-content">
              <ScoreSetting ref="scoreSetting" :scoreConfig="scoreConfig" :canvasNodeList="stepList"></ScoreSetting>
            </TabPane>
            <TabPane v-if="nodeConfig" :label="$t('term.process.nodesetting')" name="nodesetting">
              <FlownodeSetting
                :key="nodeConfig.uuid"
                ref="nodeSetting"
                :formhandlerList="formhandlerList"
                :prevNodes="prevNodes"
                :allPrevNodes="allPrevNodes"
                :isStart="isNodeStart"
                :nodeChildren="nodeChildren"
                :nodeConfig="nodeConfig"
                :formConfig="formConfig"
                :stepList="stepList"
                :nodeAllLinksList="nodeAllLinksList"
                @toFlowSetting="toFlowSetting"
                @setNodeName="setNodeName"
                @updateNode="updateNode"
              ></FlownodeSetting>
            </TabPane>
            <TabPane v-if="linkConfig" :label="$t('term.process.linksetting')" name="linksetting">
              <FlowLinkSetting :config="linkConfig" @setlinkname="setLinkName"></FlowLinkSetting>
            </TabPane>
          </Tabs>
        </div>
      </template>
    </TsContain>

    <!-- 关联服务弹窗 -->
    <RelationService :isShow="relevanceModel" :processUuid="processUuid" @close="closeService"></RelationService>
    <!-- 关联服务end -->
    <TsDialog
      type="modal"
      :isShow.sync="draftModel"
      :title="$t('term.process.restoredrafts')"
      :okText="$t('page.recover')"
      :cancelText="$t('page.cancel')"
      @on-ok="draftOk"
    >
      <p style="margin-bottom: 10px">
        <span>{{ $t('term.process.savedraftflow') }}</span>
        <span style="margin-left: 36px">{{ $t('term.process.autosaveinterval') }}</span>
      </p>
      <TsTable :theadList="draftKey" :tbodyList="draftData" @clickTr="draftCurrentChange"></TsTable>
    </TsDialog>
  </div>
</template>
<script>
import { NodeFactory } from '@/views/pages/process/flow/floweditor/element/core/NodeFactory.js';
import { ElementFactory } from '@/views/pages/process/flow/floweditor/element/core/ElementFactory.js';

import LeftNode from './flowedit/flow-left-node.vue';
import FlownodeSetting from './flowedit/FlownodeSetting.vue';
import FlowSetting from './flowedit/FlowSetting.vue';
import TacticsSetting from './flowedit/TacticsSetting.vue';
import FlowLinkSetting from './flowedit/FlowLinkSetting.vue';
import ScoreSetting from './flowedit/ScoreSetting.vue';
import { store, mutations } from './flowedit/floweditState.js';

export default {
  name: 'FlowEdit',
  provide() {
    return {
      flowObj: this.flowObj
    };
  },
  components: {
    FlownodeSetting,
    FlowSetting,
    TacticsSetting,
    FlowLinkSetting,
    ScoreSetting,
    LeftNode,
    RelationService: () => import('./flowedit/relation-service.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    FlowEditor: () => import('@/views/pages/process/flow/floweditor/flow-editor.vue')
  },
  filters: {},
  props: [''],
  data() {
    return {
      isReturn: true, //是否返回管理页
      type: 'slider',
      flowName: '',
      seletedList: {},
      nodeConfig: null, //当前节点的数据
      linkConfig: null, //连线的数据
      scoreConfig: {
        //评分设置
        scoreTemplateId: null,
        isActive: 0,
        isAuto: 1,
        config: { autoTime: 3, autoTimeType: 'naturalDay' }
      },
      prevNodes: [],
      allPrevNodes: [],
      isNodeStart: false,
      validCardOpen: false,
      validList: [],
      processConfig: { uuid: null, name: '' }, //流程设置相关数据
      formConfig: {
        //表单相关数据
        uuid: ''
      }, //全局的表单数据
      stepList: [], //流程的所有步骤数据
      nodeList: [], //左边可以拖动的节点列表
      nodeChildren: [], // 编辑节点的子节点
      relevanceModel: false, //关联模态框
      referenceCount: 0,
      isInit: false, //接口回调初始化完成，修复调用时间过长导致的数据不同步
      activeTab: 'flowsetting',
      slaList: [],
      draftPrevData: '',
      draftModel: false,
      draftKey: [
        {
          title: this.$t('term.process.autosavedatetime'),
          key: 'fcd'
        },
        {
          title: this.$t('page.filename'),
          key: 'name'
        }
      ],
      draftData: [], //草稿列表
      isNew: false, //新增判断是否是新流程
      portData: [], //接口数据
      startNodeuuid: null,
      processUuid: '', //流程id
      formhandlerList: [], //表单控件的数据
      nodeAllLinksList: [], //当前节点的所有连线数据
      formSceneUuidList: [], // 表单场景uuid列表
      flowObj: {
        //流程数据，跨组件调用
        TopoVm: null,
        stepList: this.stepList
      },
      //新的开始
      graph: null,
      dnd: null,
      flowConfig: {}, //流程设计器的设置
      flowData: null //流程数据
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.query.draftuuid) {
      this.isDraft = true;
    } else {
      this.isDraft = false;
    }
    this.processConfig.uuid = this.$route.query.uuid || this.$route.query.draftuuid || null;
    this.processConfig.name = this.$route.query.name || '';
    this.flowName = this.$route.query.name || '';
    this.isNew = this.$route.query.isnew || false;
    this.draftList(this.processConfig.uuid);
    if (this.$route.query.activeTab) {
      //从策略页面跳转过滤，定位tab
      this.activeTab = this.$route.query.activeTab;
    }
  },
  async mounted() {
    // // 初始化
    // window.vm = Vm = this;
    // let config = Object.assign(viewOpts, {
    //   'canvas.autoadjust': true, //显示辅助线
    //   'anchor.size': 4 //连接点大小
    // });
    // TopoVm = this.$topoVm = new Topo(this.$refs.topo, config, this);
    // this.$topoVm.draw();

    // // 获取节点列表数据
    await this.getNodeList();

    // await this.initFlow('init');
    this.getWorkerdispatcher();
    this.selectNodeByStepUuid();
    // this.flowObj.TopoVm = TopoVm;
  },
  beforeDestroy() {
    //this.$topoVm.destroy(); //销毁topo里面注册的事件
  },
  destroyed() {
    clearInterval(this.interval);
    this.clearObservable();
  },
  methods: {
    //新的开始
    test() {
      console.log(JSON.stringify(this.graph.toJSON()));
    },
    async ready(graph, dnd) {
      this.graph = graph;
      this.dnd = dnd;
      await this.initFlow('init');
      this.graph.fromJSON(this.finalFlowData);
      // if (this.flowData) {
      //this.graph.fromJSON(this.flowData);
      //} else {
      //默认增加开始和结束节点
      if (this.finalFlowData.cells.length === 0) {
        const startNode = NodeFactory.createNode(this.graph, { type: 'start' }, { type: 'start', handler: 'start', position: { x: 200, y: 360 } });
        const endNode = NodeFactory.createNode(this.graph, { type: 'end' }, { type: 'end', handler: 'end', position: { x: 600, y: 360 } });
        this.graph.addNode(startNode);
        this.graph.addNode(endNode);
      }
      //}
      this.isInit = true;
    },
    drag(event, component) {
      //仅提取必要信息
      const { icon, name, handler, type, isAllowStart } = component;
      const config = { icon, name, handler, type, isAllowStart };
      const uuid = this.$utils.setUuid();
      config.id = uuid;
      config.uuid = uuid;
      const node = NodeFactory.createNode(this.graph, { handler, type }, config);
      this.dnd.start(node, event);
    },
    nodeUnSelected() {
      //由于nodeslect用nextTick封装了，这里也需要封装，否则有可能会导致执行顺序错乱
      this.$nextTick(() => {
        this.currentWidgetId = null;
        this.currentWidget = null;
        this.selectedNode = null;
      });
    },
    nodeSelected(nodeData, node) {
      this.showNodeSetting(nodeData.config);

      //组装links数据，需要和老数据保持一致，关键是config中的结构
      const edges = this.graph.getConnectedEdges(node);
      const links = [];
      edges.forEach(edge => {
        const link = { config: { name: edge.getProp('name'), type: edge.getProp('type'), source: edge.getSourceCellId(), target: edge.getTargetCellId() } };
        links.push(link);
      });
      this.getNodeAllLinksList(links);
    },
    //新的结束
    selectNodeByStepUuid() {
      // 根据步骤id选中节点并高亮
      if (this.$route.query.stepUuid && !this.$utils.isEmpty(this.stepList)) {
        // 从表单场景跳转过来，勾选对应的节点并且打开对应节点的编辑页面
        let nodeConfig = this.stepList.find(item => item.uuid == this.$route.query.stepUuid);
        if (nodeConfig) {
          this.showNodeSetting(nodeConfig);
          let nodeVm = this.$topoVm.getNodeByUuid(nodeConfig.uuid);
          nodeVm && nodeVm.select(); // 节点选中
        }
      }
    },
    selectNode(d) {
      var config = this.stepList.find(item => item.uuid == d.getUuid());
      this.selectTimeout && clearTimeout(this.selectTimeout);
      this.showNodeSetting(config);
      this.getNodeAllLinksList(d.links);
    },
    unSelectNode(d) {
      if (this.activeTab == 'nodesetting') {
        this.selectTimeout = setTimeout(function() {
          clearTimeout(Vm.selectTimeout);
          Vm.showNodeSetting(null);
          Vm.showLinkSetting(null);
        }, 10);
        //更新节点数据
        this.setNodeSetting();
      } else {
        this.nodeConfig = null;
      }
    },
    async getNodeList() {
      // 获取节点列表数据
      await this.$api.process.process.processComponent().then(res => {
        if (res.Status == 'OK') {
          let hideList = ['start', 'end'];
          let nodesData = res.Return.map(d => {
            d = nodeDataTransform(d);
            hideList.includes(d.handler) && (d._isHide = true); //不需要显示的节点
            d.handler == 'end' && (this.processConfig = Object.assign(d.config.processConfig, this.processConfig)); //初始化流程设置的配置数据从end节点拿取
            return d;
          });
          this.nodeList.push(...nodesData);
        } else {
          Vm.$Message.warning({ content: this.$t('message.process.cannotnodelist'), duration: 3, closable: true });
        }
      });
    },
    setLinkName(value) {
      this.linkConfig.name = value;
      var link = this.$topoVm.getLinkByUuid(this.linkConfig.uuid);
      link && link.setName(value);
    },
    changeFlowName(value) {
      // 改变流程名称
      this.processConfig.name = value;
    },
    //返回流程列表
    goflowList() {
      this.$router.push({
        path: '/flow-overview'
      });
    },
    closeService(val) {
      this.relevanceModel = val;
    },
    relevanceList() {
      //关联服务
      this.relevanceModel = true;
      this.processUuid = this.processConfig.uuid;
    },
    deleteFlow() {
      // 删除流程图
      if (this.isNew) {
        this.$Message.error(this.$t('message.process.notsaveflow'));
        return;
      }
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', { target: this.$t('term.process.flow') }),
        btnType: 'error',
        'on-ok': vnode => {
          let getData = {
            uuid: this.processConfig.uuid
          };
          vnode.isShow = false;
          this.$api.process.process
            .delProcess(getData)
            .then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
                this.$router.push({
                  path: '/flow-overview',
                  query: { validRouter: true } //删除的时候跳转路由不需要进行对比校验
                });
              }
            })
            .catch(error => {
              this.$Message.error(error.data.Message);
            });
        }
      });
    },
    reset() {
      // 重置流程图
      this.$createDialog({
        title: this.$t('page.tip'),
        content: this.$t('term.process.resetflowtip'),
        'on-ok': vnode => {
          this.initFlow('init');
          vnode.isShow = false;
          this.$Message.success(this.$t('message.executesuccess'));
        }
      });
    },
    createdBasicsNodes() {
      let list = JSON.parse(JSON.stringify(startEndNode));
      list.forEach(item => {
        item.config = { handler: item.handler, name: item.name, stepConfig: {}, type: item.type };
      });
      return list;
    },
    async initFlow(action) {
      // 初始化流程
      // 获取topo图数据
      if (this.processConfig.uuid && !this.isNew) {
        if (this.isDraft) {
          try {
            await this.$api.process.process
              .processDraftGet({
                uuid: this.$route.query.draftuuid
              })
              .then(res => {
                if (res.Status == 'OK') {
                  let data = res.Return.config && typeof res.Return.config == 'string' ? JSON.parse(res.Return.config) : res.Return.config;
                  this.flowData = data;
                  this.referenceCount = res.Return.referenceCount;
                  //注释旧代码
                  //this.initTopo(data, action);
                } else {
                  Vm.$Message.warning({
                    content: this.$t('message.process.notinitdata'),
                    duration: 3,
                    closable: true
                  });
                }
              });
          } catch (err) {
            console.log(err);
          }
        } else {
          try {
            await this.$api.process.process.getProcess({ uuid: this.processConfig.uuid }).then(res => {
              if (res.Status == 'OK') {
                let data = res.Return.config && typeof res.Return.config == 'string' ? JSON.parse(res.Return.config) : res.Return.config;
                this.flowData = data;
                this.referenceCount = res.Return.referenceCount;
                Object.assign(this.processConfig, data.process.processConfig);
                this.processConfig.uuid = res.Return.uuid;
                this.processConfig.name = res.Return.name;
                //注释旧代码
                //this.initTopo(data, action);
              } else {
                Vm.$Message.warning({
                  content: this.$t('message.process.notinitdata'),
                  duration: 3,
                  closable: true
                });
              }
            });
          } catch (err) {
            console.log(err);
          }
        }
      } else {
        //新的没有设置流程信息
        //this.initTopo({}, action);
      }
    },
    initTopo(config, action) {
      // 初始化流程图
      let _this = this;
      if (!config && !this.isNew) return;
      let data = config || {};

      if (action === 'init') {
        this.isInit = true;
      }

      var topodata = data.topo || {
        nodes: this.createdBasicsNodes(),
        links: []
      };

      // 数据
      topodata.links &&
        topodata.links.forEach(link => {
          //旧数据转为新类型 之后可以考虑去掉
          link.type = link.dirType || link.type || 'forward';
        });
      this.$topoVm.fromJson(topodata);
      // formconfig
      this.formConfig = (data.process && data.process.formConfig) || {
        uuid: ''
      };
      // 评分
      this.scoreConfig = data.process && data.process.scoreConfig && data.process.scoreConfig.isActive ? data.process.scoreConfig : { scoreTemplateId: null, isActive: 0, isAuto: 1, config: { autoTime: 3, autoTimeType: 'naturalDay' } };
      // sla
      this.slaList.splice(0);
      this.slaList.push(...((data.process && data.process.slaList) || []));
      //步骤节点数据
      this.stepList =
        data.process && data.process.stepList
          ? data.process.stepList
          : topodata.nodes.map(item => {
            return { uuid: item.uuid, handler: item.handler, name: item.name, stepConfig: {}, type: item.type };
          });
      this.stepList.forEach(item => {
        //给stepList塞值,由于旧的数据没有导致的问题  之后可以考虑去掉
        var list = ['type'];
        list.forEach(key => {
          if (!item[key]) {
            topodata.nodes.find(n => n.uuid == item.uuid && (item[key] = n[key].toLowerCase()));
          }
        });
      });
      if (action === 'init') {
        this.$nextTick(() => {
          let data = Vm.getFlowData();
          this.draftPrevData = this.$utils.deepClone(data);
          this.interval = setInterval(this.draftAdd, 30 * 1000);
          this.portData = this.$utils.deepClone(data);
        });
      }
      this.flowObj.stepList = this.stepList;
    },
    flowDataValid(action) {
      let _this = this;
      //保存节点数据
      this.activeTab === 'nodesetting' && this.setNodeSetting();
      //节点校验
      let allNode = this.$topoVm.getNodes();
      allNode.forEach(vm => {
        //给节点塞必要的值
        let nodeConfig = _this.stepList.find(item => {
          return item.uuid == vm.getUuid();
        });
        if (setInitData[nodeConfig.handler] instanceof Function) {
          setInitData[nodeConfig.handler](nodeConfig, vm, _this);
        }
      });
      // 流程数据验证
      if (action !== 'save') this.validCardOpen = true;
      var is = nodeValid(allNode);
      return is;
    },
    getShape(data) {
      // 获取形状dom
      return TopoVm && TopoVm.getShapePath(data, { fill: 'white' }).outerHTML;
    },
    setNodeName(val) {
      var node = this.$topoVm.getNodeByUuid(this.nodeConfig.uuid);
      node && node.setName(val);
    },
    validItemClick(item) {
      if (item.focus) {
        if (this.validCardOpen) {
          this.flowDataValid();
        }
        item.focus();
      }
      if (item.href) {
        this.$nextTick(() => {
          try {
            document.querySelector(item.href) && document.querySelector(item.href).scrollIntoView(true);
          } catch (e) {
            console.info(e);
          }
          this.$refs.nodeSetting.validNodeData(item.href);
        });
      }
    },
    getFlowData(action) {
      // 获取整个流程数据
      // 获取流程数据
      // topo数据
      var topoConfig = JSON.parse(JSON.stringify(this.$topoVm.toJson()));
      var slaList = (Vm.$refs.slaSetting && JSON.parse(JSON.stringify(Vm.$refs.slaSetting.slaList))) || [];
      let processConfig = { processConfig: this.processConfig };
      let connectionList = topoConfig.links
        ? topoConfig.links.map(d => ({
          uuid: d.uuid,
          fromStepUuid: d.source,
          toStepUuid: d.target,
          conditionConfig: {},
          name: d.name,
          type: d.dirType || d.type || 'forward'
        }))
        : [];
      if (this.activeTab === 'nodesetting') {
        //跟新节点对应的表单数据
        this.setNodeSetting();
      } else if (this.activeTab == 'flowsetting') {
        //跟新流程对应的表单数据
        processConfig = this.$refs.flowSetting ? this.$refs.flowSetting.getJsonValue(action) : {};
        this.formConfig = this.$refs.flowSetting ? processConfig.formConfig : this.formConfig;
        action && (this.processConfig = processConfig.processConfig);
      }
      // 获取节点列表数据
      let flowFinallConfig = {
        process: {
          processConfig: processConfig.processConfig,
          formConfig: this.formConfig,
          slaList: slaList || [],
          stepList: this.stepList || [],
          connectionList: connectionList || [],
          scoreConfig: this.scoreConfig.isActive ? this.scoreConfig : { isActive: 0 }
        },
        topo: topoConfig
      };
      if (this.formConfig && this.formConfig.extendConfig) {
        flowFinallConfig.process.formConfig.extendConfig = (this.formConfig && this.formConfig.extendConfig) || null;
      } else {
        delete this.formConfig.extendConfig;
      }
      // 保存数据
      let data = {
        uuid: this.processConfig.uuid,
        name: this.processConfig.name,
        isActive: 1,
        referenceCount: this.referenceCount,
        config: flowFinallConfig
      };

      return data;
    },
    async flowSave(isGoFlow) {
      // 保存流程
      // 如果是设置节点打开
      // 验证数据
      await this.getFormSceneuuidList(this.formConfig.uuid);
      if (!this.flowDataValid('save')) {
        this.isReturn = false;
        this.validCardOpen = true;
        this.draftAdd();
        return false;
      } else {
        this.isReturn = true;
      }
      let saveData = this.$utils.deepClone(this.getFlowData(true));
      saveData.config &&
        saveData.config.process &&
        saveData.config.process.stepList.length > 0 &&
        saveData.config.process.stepList.forEach(item => {
          if (item && item.stepConfig && item.stepConfig.hasOwnProperty('formSceneUuid') && item.stepConfig.formSceneUuid) {
            // 如果某些步骤节点，找不到匹配的场景名称时，回填失败，表单场景下拉框处为空
            item.stepConfig['formSceneUuid'] = !this.formSceneUuidList.includes(item.stepConfig.formSceneUuid) ? '' : item.stepConfig.formSceneUuid;
          }
        });
      await this.$api.process.process.processSave(saveData).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.portData = saveData;
          this.draftPrevData = this.$utils.deepClone(saveData);

          this.$route.meta.isSkip = true;
          if (!isGoFlow) {
            this.$router.push({
              path: '/flow-edit',
              query: {
                uuid: this.processConfig.uuid,
                name: this.processConfig.name,
                referenceCount: this.referenceCount || 0
              }
            });
          }
        } else {
          Vm.$Message.warning({
            content: this.$t('message.savefailed'),
            duration: 3,
            closable: true
          });
          // 添加草稿
          this.draftAdd();
        }
      });
    },
    showLinkSetting(config) {
      // 线选中触发该事件，展示线编辑组件
      if (config) {
        this.linkConfig = config;
        // 切tab
        this.$nextTick(() => {
          this.nodeConfig = null;
          this.activeTab = 'linksetting';
        });
      } else {
        this.activeTab = 'flowsetting';
        this.$nextTick(() => {
          this.linkConfig = null;
        });
      }
    },
    showNodeSetting(config) {
      // 节点选中后，触发该事件，展示节点数据编辑组件
      let _this = this;
      if (config) {
        this.linkConfig = null;
        this.nodeConfig = config;
        this.setPrevNodes();
        // 子节点添加
        this.nodeChildren.splice(0);
        let nodeVm = this.$topoVm.getNodeByUuid(config.uuid);
        let nodeChildren = nodeVm.getNextNodes().map(d => _this.stepList.find(item => item.uuid == d.getUuid()));
        this.nodeChildren.push(...nodeChildren);

        // 切tab
        this.$nextTick(() => {
          this.activeTab = 'nodesetting';
        });
      } else {
        this.activeTab = 'flowsetting';
        this.$nextTick(() => {
          this.nodeConfig = null;
          this.setPrevNodes();
        });
      }
    },
    setPrevNodes() {
      // 获取节点的所有前置节点
      let _this = this;
      if (this.nodeConfig) {
        var vm = TopoVm.getNodeByUuid(this.nodeConfig.uuid);
        if (!vm) return;
        let allPrevNodes = vm.getAllPrevNodes();
        allPrevNodes = allPrevNodes.map(item => _this.stepList.find(step => step.uuid == item.getUuid()));
        let parentNodes = vm.getPrevNodes();
        let prevNodes = allPrevNodes.filter(d => d.type !== 'start' && d.type !== 'end' && d.handler != 'condition' && d.handler != 'distributary' && d.handler != 'autoexec');
        let isStart = parentNodes.some(d => d.getConfig() && d.getConfig().handler === 'start');
        this.isNodeStart = isStart;
        this.prevNodes.splice(0);
        this.prevNodes.push(...prevNodes);
        this.allPrevNodes.splice(0);
        this.allPrevNodes.push(...allPrevNodes);
      } else {
        this.prevNodes.splice(0);
        this.allPrevNodes.splice(0);
        this.isNodeStart = false;
      }

      let allNode = TopoVm.getNodes();
      allNode.forEach(a => {
        let nodeCurrent = TopoVm.getNodeByUuid(a.getUuid());
        let nodeParent = nodeCurrent.getPrevNodes();
        if (nodeParent.some(d => d.getConfig() && d.getConfig().handler === 'start')) {
          this.startNodeuuid = a.getUuid();
        }
      });
    },
    setNodeSetting() {
      // 获取节点设置
      let nodeConfig = {};
      if (this.$refs.nodeSetting) {
        //获取节点表单授权的数据，跟新整体的表单授权数据
        let newnodeConfig = this.$refs.nodeSetting.saveProcessFormConfig() || {};
        this.updateNode(newnodeConfig);
        //获取节点的数据
        let nodeConfig = this.$refs.nodeSetting.getValueList();
        this.stepList.find((item, i) => {
          if (item.uuid == nodeConfig.uuid) {
            this.stepList[i] = nodeConfig;
          }
          return item.uuid == nodeConfig.uuid;
        });
      }
      return nodeConfig;
    },
    getProcessFormConfig(action) {
      return this.$refs.nodeSetting.saveProcessFormConfig(action);
    },
    nodesHighlight(item) {
      // 节点高亮处理
      var uuidList = (item.processStepUuidList && item.processStepUuidList.map(d => d)) || [];
      if (Array.isArray(uuidList)) {
        this.$topoVm.highlight(uuidList);
      }
    },
    drop(event) {
      // 拖拽结束
      let data = JSON.parse(event.dataTransfer.getData('item'));
      data.uuid = this.$utils.setUuid();
      data.x = event.offsetX;
      data.y = event.offsetY;
      var p = this.$topoVm.positionTransform(data);
      data.x = p.x - data.width / 2;
      data.y = p.y - data.height / 2;
      data.uuid = data.uuid || this.$utils.setUuid();
      nodeDataTransform(data);
      data.config = {
        uuid: data.uuid,
        name: data.name,
        handler: data.handler,
        isAllowStart: data.isAllowStart,
        type: data.type,
        stepConfig: data.config || {}
      };

      // 添加节点
      // nodeDataTransform(data);
      this.stepList.push(data.config);
      this.flowObj.stepList = this.stepList;
      let node = this.$topoVm.addNode(data);
      node.select();
    },
    toFlowSetting() {
      // 切换到流程设置tab
      this.$nextTick(() => {
        this.activeTab = 'flowsetting';
      });
    },
    draftCurrentChange(currentRow) {
      // 草稿
      this.draftCurrentData = currentRow;
    },
    draftOk() {
      // 草稿列表确认

      this.draftModel = false;
      Vm.$api.process.process
        .processDraftGet({
          uuid: this.draftCurrentData.uuid
        })
        .then(res => {
          if (res.Status == 'OK') {
            let draftConfig = res.Return;
            this.processConfig.name = draftConfig.name;
            let config = draftConfig.config;
            this.initTopo(config, this.$utils.setUuid());
            this.selectNodeByStepUuid();
          }
        });
    },
    async draftAdd() {
      // 添加草稿
      let data = this.getFlowData(false);
      let draftData = this.$utils.deepClone(data);
      delete this.portData.config.topo.svg;
      delete draftData.config.topo;
      delete this.draftPrevData.config.topo;
      let isSame = this.$utils.isSame(this.draftPrevData, draftData);
      if (isSame) {
        // 没有改变
      } else {
        // 有改变
        await Vm.$api.process.process.processDraftSave({ processUuid: draftData.uuid, name: draftData.name, config: data.config }).then(res => {
          if (res.Status == 'OK') {
            this.draftPrevData = draftData;
          }
        });
      }
    },
    draftList(uuid) {
      // 草稿列表
      this.$api.process.process
        .processDraftList({
          processUuid: uuid
        })
        .then(res => {
          if (res.Status == 'OK') {
            let draftList = res.Return;
            draftList.forEach(d => {
              d.fcd = this.$options.filters.formatDate(d.fcd);
            });
            this.draftData.splice(0);
            this.draftData.push(...draftList);
            if (this.draftData[0]) {
              this.draftCurrentData = this.draftData[0];
              this.draftData[0]._highlight = true;
            }

            if (draftList.length) {
              this.draftModel = true;
            } else {
              this.draftModel = false;
            }
          }
        });
    },
    goCreatecatalog() {
      window.open(HOME + '/process.html#/catalog-manage?processUuid=' + this.processConfig.uuid, '_blank');
    },
    removeAuthconfig(node) {
      if (node && node.uuid) {
        this.removeFormauth(node.uuid);
      }
    },
    removeFormauth(id) {
      let _this = this;
      //删除与表单相关的扩展属性
      if (_this.formConfig.extendConfig) {
        for (let key in _this.formConfig.extendConfig) {
          for (let uuid in _this.formConfig.extendConfig[key]) {
            uuid == id && delete _this.formConfig.extendConfig[key][uuid];
          }
        }
      }
    },
    restFormconfig(list) {
      //合并相同表单条件的流程节点组件
      let _this = this;
      if (list && list.length > 0) {
        list.map(li => {
          let sameSetting = list.filter((l, lindex) => {
            if (l.attributeUuid == li.attributeUuid && l.action == li.action && l.processStepUuidList != li.processStepUuidList) {
              _this.$set(l, 'attributeUuid', null);
              _this.$set(l, 'action', null);
              return { processStepUuidList: l.processStepUuidList };
            }
          });
          if (li.attributeUuid && li.action) {
            if (sameSetting.length > 0) {
              let newlist = [];
              newlist = _this.$utils.concatArr(newlist, li.processStepUuidList);
              sameSetting.forEach(s => {
                newlist = _this.$utils.concatArr(newlist, s.processStepUuidList);
              });
              li.processStepUuidList = newlist;
            }
          }
        });
      }
      let mewlist = list.filter(li => {
        return li.attributeUuid && li.action;
      });
      return mewlist;
    },
    updateNode(list, nodeUuid) {
      let _this = this;
      nodeUuid = nodeUuid || (this.nodeConfig ? this.nodeConfig.uuid : null);
      if (list.extendConfig && this.nodeConfig && nodeUuid) {
        //扩展属性赋值
        _this.formConfig.extendConfig = _this.formConfig.extendConfig || {};
        for (let key in list.extendConfig) {
          _this.formConfig.extendConfig = _this.formConfig.extendConfig || {};
          _this.formConfig.extendConfig[key] = _this.formConfig.extendConfig[key] || {};
          _this.formConfig.extendConfig[key][nodeUuid] = list.extendConfig[key];
        }
      }
    },
    getNodeAllLinksList(list) {
      //节点的所有连线
      if (list) {
        this.nodeAllLinksList = list;
      }
    },
    setNodeAllLinksList() {
      //更新节点连线
      let _this = this;
      if (_this.nodeConfig) {
        var vm = TopoVm.getNodeByUuid(this.nodeConfig.uuid);
        if (!vm) return;
        _this.nodeAllLinksList = vm.links;
      }
    },
    updateformitemList(list) {
      //更新表单组件
      mutations.setFormItemList(list);
    },
    //获取分派器下拉列表
    getWorkerdispatcher() {
      let data = {};
      this.$api.process.process.workerdispatcher(data).then(res => {
        if (res.Status == 'OK') {
          mutations.setAutomaticList(res.Return);
        }
      });
    },
    clearObservable() {
      //清空状态管理的数据
      store.allFormitemList = []; //表单组件
      store.automaticList = []; //分派器下拉列表
    },
    async getFormSceneuuidList(uuid) {
      //获取表单指定版本的数据，渲染表单
      if (uuid) {
        await this.$api.framework.form.getFormByVersionUuid({ uuid: uuid }).then(res => {
          if (res.Status == 'OK') {
            try {
              let formConfig = res.Return.formConfig || {};
              formConfig.sceneList &&
                formConfig.sceneList.forEach(item => {
                  if (item.uuid) {
                    this.formSceneUuidList.push(item.uuid);
                  }
                });
              if (formConfig.uuid) {
                this.formSceneUuidList.unshift(formConfig.uuid);
              }
            } catch (error) {
              this.formSceneUuidList = [];
            }
          }
        });
      }
    },
    changeRelateForm(formUuid) {
      // 关联表单值改变
      // 默认给所有步骤节点，选上【默认场景】，删除关联表单，清空表单场景值
      let noFormSceneNodeList = ['start', 'end', 'distributary', 'condition', 'timer']; // 不需要表单场景节点列表
      if (formUuid) {
        this.$api.framework.form.getFormByVersionUuid({ uuid: formUuid }).then(res => {
          if (res.Status == 'OK') {
            try {
              let formConfig = res.Return.formConfig || {};
              let defaultSceneUuid = formConfig.defaultSceneUuid || formConfig.uuid;
              formConfig.sceneList &&
                formConfig.sceneList.forEach(item => {
                  if (item.uuid) {
                    this.formSceneUuidList.push(item.uuid);
                  }
                });
              if (formConfig.uuid) {
                this.formSceneUuidList.unshift(formConfig.uuid);
              }
              this.stepList &&
                !this.$utils.isEmpty(this.stepList) &&
                this.stepList.forEach(item => {
                  if (item && item.handler && !noFormSceneNodeList.includes(item.handler) && item.stepConfig) {
                    this.$set(item.stepConfig, 'formSceneUuid', formConfig && formConfig.uuid ? defaultSceneUuid : '');
                  }
                });
            } catch (error) {
              this.formSceneUuidList = [];
            }
          }
        });
      } else {
        this.stepList &&
          !this.$utils.isEmpty(this.stepList) &&
          this.stepList.forEach(item => {
            if (item && item.handler && !noFormSceneNodeList.includes(item.handler) && item.stepConfig) {
              this.$set(item.stepConfig, 'formSceneUuid', '');
            }
          });
      }
    },
    setNodeChildren() {
      //更新选中节点的子节点
      if (this.nodeConfig) {
        this.nodeChildren.splice(0);
        let nodeVm = this.$topoVm.getNodeByUuid(this.nodeConfig.uuid);
        let nodeChildren = nodeVm.getNextNodes().map(d => this.stepList.find(item => item.uuid == d.getUuid()));
        this.nodeChildren.push(...nodeChildren);
      }
    }
  },
  computed: {
    automaticList() {
      //分派器（用于校验和分派器选择）
      return store.automaticList; //使用Vue.observable()进行状态管理
    },
    allFormitemList() {
      //表单组件
      return store.allFormitemList;
    },
    //转换旧数据为新数据
    finalFlowData() {
      const cells = [];
      if (this.flowData && this.flowData.topo && this.flowData.topo.nodes) {
        const nodes = this.flowData.topo.nodes;
        if (nodes && nodes.length > 0) {
          nodes.forEach(n => {
            const { name, icon, type, uuid, x, y, config } = n;
            const element = ElementFactory.getElement({ handler: config.handler, type: config.type });
            if (element) {
              cells.push({
                view: 'vue-shape-view',
                id: uuid,
                shape: config.type,
                type: config.type,
                handler: config.handler,
                isAllowStart: config.isAllowStart,
                icon,
                position: { x: x, y: y },
                size: {
                  width: element.prop.width,
                  height: element.prop.height
                },
                config,
                name,
                ports: element.config.ports
              });
            }
          });
        }
        const links = this.flowData.topo.links;
        const portMap = { L: 'left', R: 'right', B: 'bottom', T: 'top' };
        if (links && links.length > 0) {
          links.forEach(d => {
            const { uuid, type, source, target, sAnchor, tAnchor } = d;

            cells.push({
              id: uuid,
              shape: 'edge',
              type,
              source: { cell: source, port: portMap[sAnchor.dir] },
              target: { cell: target, port: portMap[tAnchor.dir] },
              router: {
                name: 'manhattan'
              },
              attrs: {
                line: {
                  strokeWidth: 1,
                  targetMarker: {
                    class: 'marker',
                    name: 'classic',
                    width: 12,
                    height: 8
                  },
                  class: 'line',
                  sourceMarker: {
                    class: 'marker',
                    name: null,
                    width: 12,
                    height: 8
                  }
                }
              }
            });
          });
        }
      } else if (this.flowData && this.flowData.topo && this.flowData.topo.cells) {
        return this.flowData.topo.cells;
      }
      return { cells: cells };
    }
  },
  watch: {
    activeTab(newValue, oldValue) {
      // 右边active切换的时候
      if (oldValue == 'nodesetting') {
        //从节点tab页切走时 保存节点数据
        this.setNodeSetting();
      } else if (oldValue == 'flowsetting') {
        //从流程设置切走的时候，保存表单id
        let formConfig = this.$refs.flowSetting && this.$refs.flowSetting.getJsonValue().formConfig ? this.$refs.flowSetting.getJsonValue().formConfig : null;
        this.formConfig = formConfig ? { uuid: formConfig.uuid } : {};
      }
    },
    'scoreConfig.isActive'(val) {
      //当评分设置关闭时需要删除结束节点的回退线
      if (!val) {
        let endNode = this.$topoVm.nodes.find(d => d.getType() == 'end');
        for (let i = 0; i < endNode.links.length;) {
          let link = endNode.links[i];
          link.getType() == 'backward' ? link.destory() : i++;
        }
      }
    }
  },
  beforeRouteLeave(from, to, next, url) {
    if (!this.$utils.isEmpty(this.portData)) {
      let draftData = this.getFlowData();
      delete this.portData.config.topo.svg;
      delete draftData.config.topo.svg;
      let isSame = this.$utils.isSame(JSON.parse(JSON.stringify(this.portData)), JSON.parse(JSON.stringify(draftData)));
      if ((from && from.query.validRouter) || isSame) {
        //form.query.validRouter 代表不用进行跳转校验，如删除时候
        //当没有改动时直接跳转页面
        url ? this.$utils.gotoHref(url) : next();
      } else {
        let _this = this;
        this.$utils.jumpDialog.call(
          this,
          {
            save: {
              //保存数据
              fn: async vnode => {
                return await _this.flowSave(true);
              }
            },
            noSave: {
              //存草稿
              fn: vnode => {
                vnode.isShow = false;
                _this.draftAdd();
                url ? _this.$utils.gotoHref(url) : next();
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
      next();
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
/deep/ .usertxt-ul {
  //用户列表纯文字展示
  .usertxt-li {
    word-break: break-all;

    &:not(:last-of-type):after {
      content: '|';
      opacity: 0.6;
      margin-left: 2px;
      margin-right: 2px;
    }
  }
}
.div-btn-contain {
  float: right;
}

.node-itemul {
  margin-top: -5px;
  list-style: none;
  font-size: 0;
  // overflow: auto;
  // height: calc(100vh - @top-height - @actionbar-height);
  .node-itemli {
    list-style: none;
    width: 100%;
    font-size: 12px;
    text-align: center;
    padding-bottom: 20px;

    .item-text {
      margin-top: -6px;
    }
  }
}

.second-contain {
  display: flex;
  justify-content: center;
  padding-bottom: 0;
  height: 100%;
}

.col-left-contain {
  width: 106px;
  padding-right: 16px;
  text-align: center;
  height: 100%;
  overflow-y: auto;
}
.col-center-contain {
  flex: 1;
  position: relative;
  border-radius: 10px;
  .cell-group {
    max-height: 340px;
    overflow: auto;
  }
  .cell-icon {
    font-size: 20px;
  }
  .cell-item {
    display: flex;
    white-space: normal;
  }
}

.col-right-contain {
  margin-left: 10px;
  height: 100%;
  overflow: hidden;
  border-radius: 10px;
}
/deep/ .setting-box {
  .tip-text {
    font-size: @font-size-small;
  }

  > .name {
    width: 100%;
    padding: 16px;

    .title {
      margin-bottom: @space-xs;
    }
  }

  .control-box {
    padding: 0 16px;
  }

  .permission-list {
    padding: 4px 16px;

    .list {
      &.list-bottom:not(:last-of-type) {
        padding-bottom: 16px;
      }

      .top {
        position: relative;
        width: 100%;
        height: 40px;
        line-height: 40px;
        padding-right: 60px;

        .edit-icon {
          position: absolute;
          top: 0;
          right: 0;

          .del-inform {
            padding-left: @space-sm;
          }
        }
      }

      .content {
        .second-title {
          margin-bottom: @space-xs;
        }
      }
    }
  }

  .add-btn {
    display: inline;
    padding-left: 16px;
    cursor: pointer;
  }

  .control-setting {
    //开关操作区
    position: relative;
    width: 100%;
    height: 40px;
    line-height: 40px;

    .control-btn {
      position: absolute;
      right: 0;
    }

    .tip {
      padding-right: @space-xs;
      font-size: @font-size-small;
    }
  }

  .edit-setting {
    padding: 6px 10px;
    border-radius: 6px;
  }
}
</style>
