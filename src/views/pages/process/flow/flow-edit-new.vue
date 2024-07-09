<template>
  <div class="flow-edit">
    <TsContain :rightWidth="340" :siderWidth="105" border="border">
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <span>{{ processName }}</span>
      </template>
      <template v-slot:topRight>
        <div class="div-btn-contain action-group" style="text-align: right">
          <span class="action-item tsfont-rotate-right" @click="saveFlow()">TEST</span>
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
            <LeftNode v-if="!['start', 'end'].includes(node.handler)" :key="'1' + index" :node="node"></LeftNode>
          </li>
        </ul>
      </template>
      <template v-slot:content>
        <div ref="graph" style="height: 100%" class="col-center-contain col-contain tsscroll-container bg-block">
          <Card
            v-if="validList && validList.length > 0"
            class="radius-lg"
            style="width: 320px"
            :padding="0"
            :style="{ position: 'absolute', 'z-index': 10, top: '10px', right: '10px' }"
          >
            <p slot="title" class="text-title">{{ $t('page.validate') }}</p>
            <a slot="extra" href="javascript:void(0);" @click.prevent="validList = []">
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
            :callback="{ validateNode: validateNode }"
            @ready="ready"
            @node:selected="nodeSelected"
            @node:unselected="nodeUnSelected"
            @node:removed="nodeRemoved"
            @edge:selected="edgeSelected"
          ></FlowEditor>
        </div>
      </template>
      <template v-slot:right>
        <div class="col-right-contain col-contain">
          <!-- 20200213_zqp_调整:value为v-model实现数据双向绑定以监听activeTab的变化-->
          <Tabs v-model="activeTab" class="block-tabs" :animated="false">
            <TabPane :label="$t('term.process.flowsetting')" name="flowsetting">
              <FlowSetting
                v-if="isReady"
                ref="flowSetting"
                :formUuid="formConfig.uuid"
                :uuid="processUuid"
                :name="processName"
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
                :startNodeUuid="startNodeUuid"
                @slaIn="nodesHighlight"
                @slaOut="nodesHighlight([])"
              ></TacticsSetting>
            </TabPane>
            <TabPane :label="$t('term.process.scoresetting')" name="scoresetting" class="tab-content">
              <ScoreSetting ref="scoreSetting" :scoreConfig="scoreConfig" :canvasNodeList="stepList"></ScoreSetting>
            </TabPane>
            <TabPane v-if="currentNodeData && currentNode" :label="$t('term.process.nodesetting')" name="nodesetting">
              <FlowNodeSetting
                :key="currentNodeData.uuid"
                ref="nodeSetting"
                :formhandlerList="formhandlerList"
                :prevNodes="getAllPrevNodesData(currentNode, { include: null, exclude: ['start', 'end', 'condition', 'distributary'] })"
                :allPrevNodes="getAllPrevNodesData(currentNode)"
                :isStart="isNodeStart"
                :nodeChildren="nodeChildren"
                :nodeConfig="currentNodeData"
                :formConfig="formConfig"
                :stepList="stepList"
                :nodeAllLinksList="getEdgeDataList(currentNode)"
                @toFlowSetting="toFlowSetting"
                @setNodeName="setNodeName"
                @updateNode="updateNode"
              ></FlowNodeSetting>
            </TabPane>
            <TabPane v-if="currentLinkData" :label="$t('term.process.linksetting')" name="linksetting">
              <FlowLinkSetting :config="currentLinkData" @setlinkname="setLinkName"></FlowLinkSetting>
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
import { store, mutations } from './flowedit/floweditState.js';

export default {
  name: 'FlowEdit',
  provide() {
    return {
      flowObj: this.flowObj
    };
  },
  components: {
    FlowNodeSetting: () => import('@/views/pages/process/flow/flowedit/FlownodeSetting.vue'),
    FlowSetting: () => import('@/views/pages/process/flow/flowedit/FlowSetting.vue'),
    TacticsSetting: () => import('@/views/pages/process/flow/flowedit/TacticsSetting.vue'),
    FlowLinkSetting: () => import('@/views/pages/process/flow/flowedit/FlowLinkSetting.vue'),
    ScoreSetting: () => import('@/views/pages/process/flow/flowedit/ScoreSetting.vue'),
    LeftNode: () => import('./flow-left-node-new.vue'),
    RelationService: () => import('./flowedit/relation-service.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    FlowEditor: () => import('@/views/pages/process/flow/floweditor/flow-editor.vue')
  },
  filters: {},
  props: [''],
  data() {
    return {
      processUuid: null, //流程uuid
      processDraftUuid: null, //流程草稿uuid
      processName: null, //流程名称
      isSelected: false, //用于在节点选中时，触发computed计算
      isReturn: true, //是否返回管理页
      type: 'slider',
      flowName: '',
      seletedList: {},
      currentNode: null, //当前选中节点对象
      currentNodeData: null, //当前选中节点的数据
      currentLinkData: null, //当前选中连线数据
      scoreConfig: {
        //评分设置
        scoreTemplateId: null,
        isActive: 0,
        isAuto: 1,
        config: { autoTime: 3, autoTimeType: 'naturalDay' }
      },
      //prevNodes: [],
      //allPrevNodes: [],
      //isNodeStart: false,
      validCardOpen: false,
      validList: [],
      nodeList: [], //左边可以拖动的节点列表
      //nodeChildren: [], // 编辑节点的子节点
      relevanceModel: false, //关联模态框
      referenceCount: 0,
      isReady: false, //接口回调初始化完成，修复调用时间过长导致的数据不同步
      isNodeReady: false, //判断画图是否完成，增加删除节点都要修改此值，用于激活computed
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
      formhandlerList: [], //表单控件的数据
      nodeAllLinksList: [], //当前节点的所有连线数据
      formSceneUuidList: [], // 表单场景uuid列表
      flowObj: {
        //流程数据，跨组件调用
      },
      //新的开始
      graph: null,
      dnd: null,
      flowConfig: {}, //流程设计器的设置
      flowData: { process: { formConfig: {} } } //流程数据
    };
  },
  beforeCreate() {},
  created() {
    if (this.$route.query.draftuuid) {
      this.isDraft = true;
    } else {
      this.isDraft = false;
    }
    this.processUuid = this.$route.query.uuid;
    this.processDraftUuid = this.$route.query.draftuuid;
    this.processName = this.$route.query.name;
    this.flowName = this.$route.query.name || '';
    this.isNew = this.$route.query.isnew || false;
    this.getDraftList(this.processUuid);
    if (this.$route.query.activeTab) {
      //从策略页面跳转过滤，定位tab
      this.activeTab = this.$route.query.activeTab;
    }
  },
  async mounted() {
    // 获取节点列表数据
    await this.getNodeList();
    this.getWorkerdispatcher();
    this.selectNodeByStepUuid();
  },
  beforeDestroy() {},
  destroyed() {
    clearInterval(this.interval);
    this.clearObservable();
  },
  methods: {
    //新的开始
   
    //拖拽完成后验证节点是否允许生效，也可以用来做callback使用
    validateNode(node) {
      //触发相关computed计算
      this.isNodeReady = false;
      this.$nextTick(() => {
        this.isNodeReady = true;
      });
    },
   
    test() {
      console.log(JSON.stringify(this.graph.toJSON()));
    },
    //保存流程
    saveFlow() {
      this.validFlow();
    },
    //校验流程
    validFlow() {
      //必须触发一次保存设置
      this.updateNodeSetting();

      const flowSetting = this.$refs.flowSetting;
      const validList = [];
      if (flowSetting) {
        const flowSettingData = flowSetting.getJsonValue();
        validList.push({
          type: !flowSettingData.isValid ? 'error' : 'success',
          msg: '【' + this.$t('term.process.flowsetting') + '】' + flowSettingData.validMessage,
          focus: () => {
            this.activeTab = 'flowsetting';
          }
        });

        if (flowSettingData.processConfig.notifyPolicyConfig && flowSettingData.processConfig.notifyPolicyConfig.isCustom && (!flowSettingData.processConfig.notifyPolicyConfig.policyId || !flowSettingData.processConfig.notifyPolicyConfig.hasOwnProperty('policyId'))) {
          // 自定义通知策略必填
          validList.push({
            type: 'error',
            msg: '【' + this.$t('term.process.flowsetting') + '】' + this.$t('form.validate.required', { target: this.$t('page.notificationstrategy') }),
            focus: () => {
              this.activeTab = 'flowsetting';
            }
          });
        }
        //验证步骤节点
        this.stepList.forEach(step => {
          const element = ElementFactory.getElement({ handler: step.handler, type: step.type });
          const node = this.graph.getCellById(step.uuid);
          if (element && node) {
            if (element.valid && typeof element.valid === 'function') {
              const vs = element.valid({ node: node, graph: this.graph, view: this });
              if (vs && vs.length > 0) {
                vs.forEach(v => {
                  validList.push({
                    type: 'error',
                    href: v.href,
                    msg: '【' + (step.name || '无名节点') + '】' + v.msg,
                    focus: () => {
                      this.graph.select(node);
                    }
                  });
                });
              } else {
                validList.push({ type: 'success', msg: '【' + (step.name || '无名节点') + '】' + this.$t('term.process.nodevalidpassed') });
              }
            }
          } else {
            if (!element) {
              validList.push({ type: 'error', msg: '节点定义' + step.handler + '不存在' });
            }
            if (!node) {
              validList.push({ type: 'error', msg: '节点' + step.handler + '不存在' });
            }
          }
        });
        this.validList = validList.sort((a, b) => {
          let a1 = a.type === 'error' ? 1 : 0;
          let b1 = b.type === 'error' ? 1 : 0;
          return b1 - a1;
        });
        console.log('graph topo:', JSON.stringify(this.graph.toJSON()));
        console.log(JSON.stringify(this.stepList));
      }
    },
    setFormUuid(uuid) {
      this.flowData.process.formConfig.uuid = uuid;
    },
    //获取流程信息
    async getProcessByUuid() {
      if (this.processUuid) {
        await this.$api.process.process.getProcess({ uuid: this.processUuid }).then(res => {
          this.flowData = res.Return.config;
          this.processName = res.Return.name;
        });
      }
    },
    //获取流程草稿信息
    async getProcessDraftByUuid() {
      if (this.processDraftUuid) {
        await this.$api.process.process
          .processDraftGet({
            uuid: this.processDraftUuid
          })
          .then(res => {
            this.flowData = res.Return.config;
          });
      }
    },
    //流程图ready后的回调方法
    async ready(graph, dnd) {
      this.graph = graph;
      this.dnd = dnd;
      if (this.processUuid && !this.isNew && !this.isDraft) {
        await this.getProcessByUuid();
      } else if (this.processDraftUuid && !this.isNew && this.isDraft) {
        await this.getProcessDraftByUuid();
      }
      this.graph.fromJSON(this.finalFlowData);
      //默认增加开始和结束节点
      if (this.finalFlowData.cells.length === 0) {
        const startId = this.$utils.setUuid();
        const endId = this.$utils.setUuid();
        const startNode = NodeFactory.createNode(
          this.graph,
          { type: 'start' },
          {
            id: startId,
            type: 'start',
            handler: 'start',
            position: { x: 200, y: 200 },
            data: {
              uuid: startId,
              handler: 'start',
              name: '开始',
              stepConfig: {},
              type: 'start'
            }
          }
        );
        const endNode = NodeFactory.createNode(
          this.graph,
          { type: 'end' },
          {
            id: endId,
            type: 'end',
            handler: 'end',
            position: { x: 600, y: 200 },
            data: {
              uuid: endId,
              handler: 'end',
              name: '结束',
              stepConfig: {},
              type: 'end'
            }
          }
        );
        this.graph.addNode(startNode);
        this.graph.addNode(endNode);
      }
      //}
      this.isReady = true;
      this.isNodeReady = true;
    },
    drag(event, component) {
      //仅提取必要信息
      const { name, handler, type, isAllowStart, chartConfig } = component;
      const config = { name, handler, type, isAllowStart, icon: chartConfig.icon };
      const uuid = this.$utils.setUuid();
      config.id = uuid;
      //数据复制一份到config，和老数据保持一致
      config.data = { uuid, name, handler, type, isAllowStart, stepConfig: {} };
      const node = NodeFactory.createNode(this.graph, { handler, type }, config);
      this.dnd.start(node, event);
      //this.stepList.push(config.config);
      //this.flowObj.stepList = this.stepList;
    },
    showNodeSetting(config) {
      if (config && this.currentNodeData !== config) {
        this.currentLinkData = null;
        this.currentNodeData = null;
        //切换前先保存节点设置
        this.updateNodeSetting();
        // 切tab
        this.$nextTick(() => {
          this.currentNodeData = config;
          if (this.activeTab !== 'nodesetting') {
            this.activeTab = 'nodesetting';
          }
        });
      } else {
        this.currentNodeData = null;
        this.activeTab = 'flowsetting';
      }
    },
    nodeRemoved() {
      this.isNodeReady = false;
      this.$nextTick(() => {
        this.isNodeReady = true;
      });
    },
    nodeUnSelected() {
      //this.$nextTick(() => {
      if (this.activeTab === 'nodesetting') {
        this.activeTab = 'flowsetting';
      }
      this.currentNodeData = null;
      this.currentNode = null;
      this.isSelected = false;
      //});
    },
    edgeSelected(edge) {
      //切换前先保存当前选中节点设置
      this.updateNodeSetting();
      //先清空选中数据，强制刷新相关组件
      this.isSelected = false;
      this.currentNode = null;
      this.currentNodeData = null;
      this.currentLinkData = null;
      this.$nextTick(() => {
        this.currentLinkData = edge.getData();
        this.isSelected = true;
      });
    },
    nodeSelected(node) {
      //切换前先保存当前选中节点设置
      this.updateNodeSetting();
      //先清空选中数据，强制刷新相关组件
      this.isSelected = false;
      this.currentNode = null;
      this.currentNodeData = null;
      this.currentLinkData = null;
      this.$nextTick(() => {
        this.currentNode = node;
        this.currentNodeData = node.getData();
        if (this.activeTab !== 'nodesetting') {
          this.activeTab = 'nodesetting';
        }
        this.isSelected = true;
      });
    },
    /**
     * 获取节点相关的边数据列表
     *
     * @param node 节点对象
     * @returns 返回一个边数据列表的数组，每个元素包含边的配置信息
     */
    getEdgeDataList(node) {
      const linkList = [];
      //组装links数据，需要和老数据保持一致，关键是config中的结构
      const edges = this.graph.getConnectedEdges(node);
      edges.forEach(edge => {
        linkList.push({
          config: {
            name: edge.getProp('name'),
            type: edge.getProp('type'),
            source: edge.getSourceCellId(),
            target: edge.getTargetCellId()
          }
        });
      });
      return linkList;
    },
    /**
     * 获取指定节点的前置节点数据列表
     *
     * @param node 指定的节点
     * @returns 返回前置节点数据列表
     */
    getPrevNodesData(node, { include, exclude } = {}) {
      let prevNodeList = [];
      const nodeList = this.getPrevNodes(node, { include, exclude });
      nodeList.forEach(node => {
        prevNodeList.push(node.getData());
      });
      return prevNodeList;
    },
    /**
     * 获取指定节点及其之前所有节点的数据
     *
     * @param node 要获取数据的节点
     * @returns 返回一个数组，包含指定节点及其之前所有节点的数据
     */
    getAllPrevNodesData(node, { include, exclude } = {}) {
      const prevNodeList = this.getAllPrevNodes(node, { include, exclude });
      return prevNodeList.map(n => n.getData());
    },
    /**
     * 获取给定节点的所有前序节点列表
     *
     * @param node 节点对象或节点ID
     * @returns 前序节点列表
     */
    getAllPrevNodes(node, { include, exclude }) {
      let prevNodeList = [];
      if (node) {
        prevNodeList = this.getPrevNodes(node, { include, exclude });
        if (prevNodeList.length > 0) {
          const nodeSet = new Set();
          prevNodeList.forEach(n => {
            nodeSet.add(n.id);
          });
          let size = prevNodeList.length;
          for (let i = 0; i < size; i++) {
            const n = prevNodeList[i];
            const tmpList = this.getPrevNodes(n, { include, exclude });
            tmpList.forEach(tmp => {
              //判断新的关系是否存在，不存在则加入nodeList继续循环
              if (!nodeSet.has(tmp.id) && node.id !== tmp.id) {
                nodeSet.add(tmp.id);
                prevNodeList.push(tmp);
              }
            });
            size = prevNodeList.length; //重新修正新的size
          }
        }
      }
      return prevNodeList;
    },
    /**
     * 获取给定节点的所有后续节点的数据
     *
     * @param node 给定的节点
     * @returns 返回一个数组，包含给定节点的所有后续节点的数据
     */
    getAllNextNodesData(node) {
      const nextNodeList = this.getAllNextNodes(node);
      return nextNodeList.map(n => n.getData());
    },
    /**
     * 获取给定节点的所有后续节点
     *
     * @param node 给定的节点
     * @returns 返回给定节点的所有后续节点数组
     */
    getAllNextNodes(node) {
      let nextNodeList = [];
      nextNodeList = this.getNextNodes(node);
      if (nextNodeList.length > 0) {
        const nodeSet = new Set();
        nextNodeList.forEach(n => {
          nodeSet.add(n.id);
        });
        let size = nextNodeList.length;
        for (let i = 0; i < size; i++) {
          const n = nextNodeList[i];
          const tmpList = this.getNextNodes(n);
          tmpList.forEach(tmp => {
            //判断新的关系是否存在，不存在则加入nodeList继续循环
            if (!nodeSet.has(tmp.id) && node.id !== tmp.id) {
              nodeSet.add(tmp.id);
              nextNodeList.push(tmp);
            }
          });
          size = nextNodeList.length; //重新修正新的size
        }
      }
      return nextNodeList;
    },
    /**
     * 获取给定节点的前序节点列表,exclude优先级高于include
     *
     * @param node 节点对象或节点ID
     * @returns 前序节点列表
     */
    getPrevNodes(node, { include, exclude } = {}) {
      const prevNodeList = [];
      if (node) {
        let incommingEdges = this.graph.getIncomingEdges(node);
        incommingEdges = incommingEdges && incommingEdges.filter(d => d.getProp('type') === 'forward');
        incommingEdges &&
          incommingEdges.forEach(d => {
            const source = d.getSourceCell();
            let need = false;
            if (!include || include.includes(source.getProp('handler'))) {
              need = true;
            }
            if (exclude && exclude.includes(source.getProp('handler'))) {
              need = false;
            }
            if (need) {
              prevNodeList.push(source);
            }
          });
      }
      return prevNodeList;
    },
    /**
     * 获取指定节点的下一个节点列表
     *
     * @param node 目标节点
     * @returns 返回包含下一个节点对象的数组
     */
    getNextNodes(node) {
      const nextNodeList = [];
      if (node) {
        let outgoingEdges = this.graph.getOutgoingEdges(node);
        outgoingEdges = outgoingEdges && outgoingEdges.filter(d => d.getProp('type') === 'forward');
        outgoingEdges &&
          outgoingEdges.forEach(d => {
            nextNodeList.push(d.getTargetCell());
          });
      }
      return nextNodeList;
    },
    /**
     * 更新节点设置，由于节点设置组件没有监听数据变化，所以需要在切换页签，点击校验，点击保存等需要获取数据的时候手动触发
     *
     */
    updateNodeSetting() {
      if (this.$refs.nodeSetting) {
        const nodeConfig = this.$refs.nodeSetting.getValueList();
        const node = this.graph.getCellById(nodeConfig.uuid);
        if (node) {
          node.setData(nodeConfig);
        }
      }
    },
    setNodeName(val) {
      if (this.currentNodeData) {
        const node = this.graph.getCellById(this.currentNodeData.uuid);
        if (node) {
          node.setProp('name', val);
          //赋值config，触发节点change:data事件
          const config = this.$utils.deepClone(node.getData() || {});
          config.name = val;
          node.setData(config);
        }
      }
    },

    changeRelateForm(formUuid) {
      //节点设置needformscene为true时，需要更新节点的表单场景id
      this.formSceneUuidList = [];
      this.isNodeReady = false;
      if (formUuid) {
        this.$api.framework.form.getFormByVersionUuid({ uuid: formUuid }).then(res => {
          this.$set(this.flowData.process.formConfig, 'uuid', formUuid);
          const formConfig = res.Return.formConfig;
          let defaultSceneUuid = formConfig.defaultSceneUuid || formConfig.uuid;
          if (formConfig.sceneList && formConfig.sceneList.length > 0) {
            formConfig.sceneList.forEach(item => {
              if (item.uuid) {
                this.formSceneUuidList.push(item.uuid);
              }
            });
          }
          if (formConfig.uuid) {
            this.formSceneUuidList.unshift(formConfig.uuid);
          }
          const nodes = this.graph.getNodes();
          nodes.forEach(n => {
            if (n.getProp('setting') && n.getProp('setting')['needformscene']) {
              const nodeConfig = n.getData();
              this.$set(nodeConfig.stepConfig, 'formSceneUuid', defaultSceneUuid);
              n.setData(nodeConfig);
            }
          });
          this.isNodeReady = true;
        });
      } else {
        this.$set(this.flowData.process.formConfig, 'uuid', '');
        const nodes = this.graph.getNodes();
        nodes.forEach(n => {
          if (n.getProp('setting') && n.getProp('setting')['needformscene']) {
            const nodeConfig = n.getData();
            this.$set(nodeConfig.stepConfig, 'formSceneUuid', '');
            n.setData(nodeConfig);
          }
        });
        this.$nextTick(() => {
          this.isNodeReady = true;
        });
      }
    },

    //新的结束
    //下面都是旧方法======================================================
    //=================================================================
    //====================================================================
    selectNodeByStepUuid() {
      // 根据步骤id选中节点并高亮
      if (this.$route.query.stepUuid && !this.$utils.isEmpty(this.stepList)) {
        // 从表单场景跳转过来，勾选对应的节点并且打开对应节点的编辑页面
        let currentNodeData = this.stepList.find(item => item.uuid == this.$route.query.stepUuid);
        if (currentNodeData) {
          this.showNodeSetting(currentNodeData);
          let nodeVm = this.$topoVm.getNodeByUuid(currentNodeData.uuid);
          nodeVm && nodeVm.select(); // 节点选中
        }
      }
    },
    async getNodeList() {
      // 获取节点列表数据
      await this.$api.process.process.processComponent().then(res => {
        this.nodeList = res.Return;
      });
    },
    setLinkName(value) {
      this.currentLinkData.name = value;
      var link = this.$topoVm.getLinkByUuid(this.currentLinkData.uuid);
      link && link.setName(value);
    },
    changeFlowName(value) {
      // 改变流程名称
      this.processName = value;
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
            uuid: this.processUuid
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
          //this.initFlow('init');
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
    flowDataValid(action) {
      let _this = this;
      //保存节点数据
      this.activeTab === 'nodesetting' && this.setNodeSetting();
      //节点校验
      let allNode = this.$topoVm.getNodes();
      allNode.forEach(vm => {
        //给节点塞必要的值
        let currentNodeData = _this.stepList.find(item => {
          return item.uuid == vm.getUuid();
        });
        if (setInitData[currentNodeData.handler] instanceof Function) {
          setInitData[currentNodeData.handler](currentNodeData, vm, _this);
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

    validItemClick(item) {
      if (item.focus) {
        item.focus();
        if (this.validList.length > 0) {
          this.validFlow();
        }
      }
      this.$nextTick(() => {
        if (item.href) {
          if (this.$refs.nodeSetting) {
            this.$refs.nodeSetting.validNodeData(item.href);
            this.$utils.jumpTo(item.href, 'instant', this.$refs['codeContent']);
          }
        }
      });
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
                uuid: this.processUuid,
                name: this.processName,
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
        this.currentLinkData = config;
        // 切tab
        this.$nextTick(() => {
          this.currentNodeData = null;
          this.activeTab = 'linksetting';
        });
      } else {
        this.activeTab = 'flowsetting';
        this.$nextTick(() => {
          this.currentLinkData = null;
        });
      }
    },

    setNodeSetting() {
      // 获取节点设置
      let currentNodeData = {};
      if (this.$refs.nodeSetting) {
        //获取节点表单授权的数据，跟新整体的表单授权数据
        let newnodeConfig = this.$refs.nodeSetting.saveProcessFormConfig() || {};
        this.updateNode(newnodeConfig);
        //获取节点的数据
        let currentNodeData = this.$refs.nodeSetting.getValueList();
        this.stepList.find((item, i) => {
          if (item.uuid == currentNodeData.uuid) {
            this.stepList[i] = currentNodeData;
          }
          return item.uuid == currentNodeData.uuid;
        });
      }
      return currentNodeData;
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
            this.processName = draftConfig.name;
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
    //获取草稿列表
    getDraftList(uuid) {
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
      window.open(HOME + '/process.html#/catalog-manage?processUuid=' + this.processUuid, '_blank');
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
      nodeUuid = nodeUuid || (this.currentNodeData ? this.currentNodeData.uuid : null);
      if (list.extendConfig && this.currentNodeData && nodeUuid) {
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
      if (_this.currentNodeData) {
        var vm = TopoVm.getNodeByUuid(this.currentNodeData.uuid);
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
    //流程设置
    processConfig() {
      if (this.flowData && this.flowData.process) {
        return this.flowData.process.processConfig || {};
      }
      return {};
    },
    //开始节点uuid
    startNodeUuid() {
      if (this.isSelected) {
        const nodes = this.graph.getNodes();
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].getProp('handler') === 'start') {
            return nodes[i].id;
          }
        }
      }
      return null;
    },
    //当前节点是否开始节点
    isNodeStart() {
      if (this.isSelected && this.currentNodeData) {
        const prevNodeList = this.getPrevNodes(this.currentNodeData.uuid);
        if (prevNodeList.length === 1 && prevNodeList[0].getProp('handler') === 'start') {
          return true;
        }
      }
      return false;
    },
    //当前节点的前置节点
    prevNodes() {
      let prevNodeList = [];
      if (this.isSelected && this.currentNodeData) {
        const nodeList = this.getPrevNodes(this.currentNodeData.uuid);
        nodeList.forEach(node => {
          prevNodeList.push(node.getData());
        });
      }
      return prevNodeList;
    },
    //表单配置
    formConfig() {
      if (this.flowData && this.flowData.process) {
        return this.flowData.process.formConfig || {};
      }
      return {};
    },
    //步骤列表
    stepList() {
      if (this.isNodeReady) {
        const nodes = this.graph.getNodes();
        return nodes.map(d => d.getData());
      }
      return [];
    },
    //当前节点的后续节点（数据）
    nodeChildren() {
      const nextNodeData = [];
      if (this.isSelected && this.currentNodeData) {
        const node = this.graph.getCellById(this.currentNodeData.uuid);
        const edges = this.graph.getOutgoingEdges(node);
        edges &&
          edges.forEach(edge => {
            nextNodeData.push(edge.getTargetCell().getData());
          });
      }
      return nextNodeData;
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
              //有些节点数据的config并没有uuid，为了一直补充上
              if (!config.uuid) {
                config.uuid = uuid;
              }
              cells.push({
                view: 'vue-shape-view',
                id: uuid,
                shape: config.type,
                type: config.type,
                handler: config.handler,
                isAllowStart: config.isAllowStart,
                setting: element.setting,
                icon,
                position: { x: x, y: y },
                data: config,
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
            const dashConfig = {};
            if (type === 'backward') {
              dashConfig.strokeDasharray = 5;
            }
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
                  ...dashConfig,
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
    stepList(newValue, oldValue) {
      this.flowObj.stepList = this.stepList;
    },
    activeTab(newValue, oldValue) {
      // 右边active切换的时候
      if (oldValue === 'nodesetting') {
        //从节点tab页切走时 保存节点数据
        this.updateNodeSetting();
      } else if (oldValue === 'flowsetting') {
        //从流程设置切走的时候，保存表单id
        let formConfig = this.$refs.flowSetting && this.$refs.flowSetting.getJsonValue().formConfig ? this.$refs.flowSetting.getJsonValue().formConfig : {};
        this.setFormUuid(formConfig.uuid);
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
      if (next) {
        next();
      }
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
