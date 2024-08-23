<template>
  <div class="flow-edit">
    <TsContain :rightWidth="340" :siderWidth="105" border="border">
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <span>
          <b class="text-grey">{{ processName }}</b>
        </span>
      </template>
      <template v-slot:topRight>
        <div class="div-btn-contain action-group" style="text-align: right">
          <!-- <span class="action-item tsfont-rotate-right" @click="resetFlow()">{{ $t('page.reset') }}</span>-->
          <span class="action-item tsfont-xitongpeizhi" @click.prevent="validFlow()">{{ $t('page.validate') }}</span>
          <span class="action-item tsfont-tool" @click="isRelativeServiceShow = true">
            {{ $t('term.process.relcatalog') }}
            <span v-if="referenceCount > 0" class="reference-number">{{ referenceCount }}</span>
          </span>
          <div class="action-item">
            <Button type="info" ghost @click="saveFlowDraft()">{{ $t('page.staging') }}</Button>
          </div>
          <span v-if="referenceCount > 0 || isNew == true" class="action-item">
            <Button disabled>{{ $t('page.delete') }}</Button>
          </span>
          <span v-else-if="referenceCount == 0 && isNew == false" class="action-item">
            <Button type="error" @click="deleteFlow()">{{ $t('page.delete') }}</Button>
          </span>
          <span class="action-item">
            <Button type="primary" @click="saveFlow(true)">{{ $t('page.save') }}</Button>
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
          <div style="height: 34px">
            <FlowEditorToolbar
              :selectedNode="currentNode"
              :selectedEdge="currentEdge"
              :graph="graph"
              mode="graph"
            ></FlowEditorToolbar>
          </div>
          <div style="height: calc(100% - 40px)">
            <FlowEditor
              ref="flowEditor"
              :config="flowConfig"
              :muted="true"
              :callback="{ validateNode: validateNode }"
              @ready="ready"
              @node:selected="nodeSelected"
              @node:unselected="nodeUnSelected"
              @node:removed="nodeRemoved"
              @edge:selected="edgeSelected"
              @edge:unselected="edgeUnSelected"
            ></FlowEditor>
          </div>
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
                @changeFlowName="updateFlowName"
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
                :prevNodes="getAllPrevNodesData(currentNode, { include: allowDispatchStepWorkerNode, exclude: null })"
                :allPrevNodes="getAllPrevNodesData(currentNode)"
                :isStart="isNodeStart"
                :nodeChildren="nodeChildren"
                :nodeConfig="currentNodeData"
                :formConfig="formConfig"
                :stepList="stepList"
                :nodeAllLinksList="getEdgeDataList(currentNode)"
                @toFlowSetting="toFlowSetting"
                @setNodeName="updateNodeName"
                @updateNode="updateNode"
              ></FlowNodeSetting>
            </TabPane>
            <TabPane v-if="currentEdgeData" :label="$t('term.process.linksetting')" name="linksetting">
              <FlowLinkSetting :config="currentEdgeData" @setlinkname="setEdgeName"></FlowLinkSetting>
            </TabPane>
          </Tabs>
        </div>
      </template>
    </TsContain>

    <!-- 关联服务弹窗 -->
    <RelationService v-if="isRelativeServiceShow" :processUuid="processUuid" @close="isRelativeServiceShow = false"></RelationService>
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
        <!-- <span style="margin-left: 36px">{{ $t('term.process.autosaveinterval') }}</span> -->
      </p>
      <TsTable :theadList="draftKey" :tbodyList="draftData" @clickTr="selectDraftRow"></TsTable>
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
    FlowEditorToolbar: () => import('@/views/pages/process/flow/floweditor/flow-editor-toolbar.vue'),
    FlowNodeSetting: () => import('@/views/pages/process/flow/flowedit/FlownodeSetting.vue'),
    FlowSetting: () => import('@/views/pages/process/flow/flowedit/FlowSetting.vue'),
    TacticsSetting: () => import('@/views/pages/process/flow/flowedit/TacticsSetting.vue'),
    FlowLinkSetting: () => import('@/views/pages/process/flow/flowedit/FlowLinkSetting.vue'),
    ScoreSetting: () => import('@/views/pages/process/flow/flowedit/ScoreSetting.vue'),
    LeftNode: () => import('./flow-left-node-new.vue'),
    RelationService: () => import('./flowedit/relation-service-new.vue'),
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
      currentEdge: null, //当前选中边
      currentEdgeData: null, //当前选中连线数据
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
      isRelativeServiceShow: false, //关联模态框
      referenceCount: 0,
      isReady: false, //接口回调初始化完成，修复调用时间过长导致的数据不同步
      isFlowReady: false, //流程数据就绪，用于激活finalFlowData重新计算
      dataTimestamp: 0, //数据时间戳，在有需要的地方修改他，用于激活computed
      activeTab: 'flowsetting',
      slaList: [],
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
      flowData: { process: { formConfig: {} } }, //流程数据
      allowDispatchStepWorkerNode: [] //允许指派任务的节点
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
  },
  beforeDestroy() {},
  destroyed() {
    clearInterval(this.interval);
    this.clearObservable();
  },
  methods: {
    //新的开始
    beforeLeaveCompare(oldData) {
      // 离开当前页面，数据对比
      let currentData = this.getFlowData();
      delete oldData.config.topo.svg;
      delete oldData.config.topo.canvas;
      delete currentData.config.topo.svg;
      delete currentData.config.topo.canvas;
      const isSame = this.$utils.isSame(oldData, currentData);
      return isSame;
    },
    async beforeLeave() {
      //离开页面，二次弹窗，点击'确认按钮'，存储数据,
      return await this.saveFlow();
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
          this.$api.process.process.delProcess(getData).then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.deletesuccess'));
              this.$router.push({
                path: '/flow-overview',
                query: { validRouter: true } //删除的时候跳转路由不需要进行对比校验
              });
            }
          });
        }
      });
    },
    resetFlow() {
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
    getGraphData(needTransfer) {
      if (this.graph) {
        const graphData = this.graph.toJSON();
        if (needTransfer) {
          const topoData = {
            canvas: { uuid: this.$utils.setUuid() }
          };
          //处理节点
          const nodeList = [];
          graphData.cells
            .filter(d => d.shape !== 'edge')
            .forEach(node => {
              const { id, position, data } = node;
              const element = ElementFactory.getElement({ handler: data.handler, type: data.type });
              if (element) {
                nodeList.push({
                  uuid: id,
                  name: data.name,
                  type: data.type,
                  class: '',
                  handler: data.handler,
                  x: position.x,
                  originalX: position.x,
                  y: position.y,
                  originalY: position.y,
                  config: data,
                  ...element.oldSetting
                });
              }
            });
          topoData.nodes = nodeList;
          //处理联线
          const linkList = [];
          graphData.cells
            .filter(d => d.shape === 'edge')
            .forEach(edge => {
              const { id, data, source, target, type } = edge;
              linkList.push({
                uuid: id,
                type: type,
                name: data.name,
                style: type === 'forward' ? 'solid' : 'dotted',
                target: target.cell,
                source: source.cell,
                tAnchor: {
                  dir: target.port.substring(0, 1).toUpperCase()
                },
                sAnchor: {
                  dir: source.port.substring(0, 1).toUpperCase()
                },
                movecircle: false,
                adjustPath: null,
                adjustPoints: null,
                animationTimes: 0
              });
            });
          topoData.links = linkList;
          return topoData;
        }
        return graphData;
      }
      return null;
    },
    getFlowData(action) {
      var topoConfig = this.getGraphData(true);
      var slaList = (this.$refs.slaSetting && this.$refs.slaSetting.slaList) || [];
      let connectionList = topoConfig.links
        ? topoConfig.links.map(d => ({
          uuid: d.uuid,
          fromStepUuid: d.source,
          toStepUuid: d.target,
          conditionConfig: {},
          name: d.name,
          type: d.type || 'forward'
        }))
        : [];
      if (this.activeTab === 'nodesetting') {
        //跟新节点对应的表单数据
        this.updateNodeSetting();
      } else if (this.activeTab === 'flowsetting') {
        //跟新流程对应的表单数据
        this.updateFlowSetting();
      }
      let flowFinallConfig = {
        process: {
          processConfig: this.processConfig,
          formConfig: this.formConfig,
          slaList: slaList || [],
          stepList: this.stepList || [],
          connectionList: connectionList || [],
          scoreConfig: this.scoreConfig.isActive ? this.scoreConfig : { isActive: 0 }
        },
        topo: topoConfig
      };
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
    /**
     * 保存流程草稿
     *
     * @returns {Promise<void>} 异步操作，无返回值
     */
    async saveFlowDraft() {
      //清空所有选择
      this.graph.cleanSelection();
      // 添加草稿
      const draftData = this.getFlowData(false);
      await this.$api.process.process.processDraftSave({ processUuid: draftData.uuid, name: this.processName, config: draftData.config }).then(res => {
        if (res.Status === 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
        }
      });
    },
    setEdgeName(value) {
      if (this.currentEdge && this.currentEdgeData) {
        this.currentEdgeData.name = value;
        const edge = this.graph.getCellById(this.currentEdge.id);
        if (edge) {
          edge.setLabels(value);
          const data = edge.getData();
          data.name = value;
          edge.setData(data);
        }
      }
    },
    //拖拽完成后验证节点是否允许生效，也可以用来做callback使用
    validateNode(node) {
      //触发相关computed计算
      this.dataTimestamp = new Date().getTime();
    },
    //保存流程
    async saveFlow(needRefresh) {
      //清空所有选择
      this.graph.cleanSelection();
      this.validFlow(true);
      if (this.validList && this.validList.length > 0) {
        return false;
      }
      const saveData = this.getFlowData(false);
      //console.log(JSON.stringify(saveData, null, 2));
      await this.$api.process.process.processSave(saveData).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.$route.meta.isSkip = true;
          if (needRefresh) {
            this.$router.push({
              path: '/flow-edit',
              query: {
                uuid: saveData.uuid,
                name: saveData.name,
                referenceCount: this.referenceCount || 0,
                time: new Date().getTime()
              }
            });
          }
        }
      });
    },
    //校验流程
    validFlow(isSlient) {
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
        if (isSlient) {
          this.validList = this.validList.filter(v => v.type === 'error');
        }
        //console.log('graph topo:', JSON.stringify(this.graph.toJSON()));
        //console.log(JSON.stringify(this.stepList));
      }
    },
    //获取流程信息
    async getProcessByUuid() {
      if (this.processUuid) {
        this.isFlowReady = false;
        await this.$api.process.process.getProcess({ uuid: this.processUuid }).then(res => {
          this.flowData = res.Return.config;
          //console.log(JSON.stringify(this.flowData, null, 2));
          this.processName = res.Return.name;
          this.referenceCount = res.Return.referenceCount;
          if (this.flowData.process) {
            this.slaList = this.flowData.process.slaList;
            // 评分
            if (this.flowData.process.scoreConfig && this.flowData.process.scoreConfig.isActive) {
              this.scoreConfig = this.flowData.process.scoreConfig;
            }
          }
          this.isFlowReady = true;
        });
      }
    },
    //获取流程草稿信息
    async getProcessDraftByUuid() {
      if (this.processDraftUuid) {
        this.isFlowReady = false;
        await this.$api.process.process
          .processDraftGet({
            uuid: this.processDraftUuid
          })
          .then(res => {
            this.flowData = res.Return.config;
            this.processName = res.Return.name;
            if (this.flowData.process) {
              this.slaList = this.flowData.process.slaList;
              // 评分
              if (this.flowData.process.scoreConfig && this.flowData.process.scoreConfig.isActive) {
                this.scoreConfig = this.flowData.process.scoreConfig;
              }
            }
            this.isFlowReady = true;
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
        //如果参数存在步骤uuid，需要默认选中节点
        if (this.$route.query.stepUuid) {
          const node = this.graph.getCellById(this.$route.query.stepUuid);
          if (node) {
            this.graph.select(node);
          }
        }
      }
      //}
      this.isReady = true;
      this.dataTimestamp = new Date().getTime();
      this.$nextTick(() => {
        this.$addWatchData(this.getFlowData());
        setTimeout(() => {
          this.graph.centerContent();
        }, 500);
      });
    },
    drag(event, component) {
      //仅提取必要信息
      const { name, handler, type, isAllowStart, chartConfig, config: stepConfig } = component;
      const config = { name, handler, type, isAllowStart, icon: chartConfig.icon };
      const uuid = this.$utils.setUuid();
      config.id = uuid;
      //数据复制一份到config，和老数据保持一致
      config.data = { uuid, name, handler, type, isAllowStart, stepConfig: stepConfig || {} };
      const node = NodeFactory.createNode(this.graph, { handler, type }, config);
      this.dnd.start(node, event);
      //this.stepList.push(config.config);
      //this.flowObj.stepList = this.stepList;
    },
    nodeRemoved() {
      this.dataTimestamp = new Date().getTime();
    },
    edgeUnSelected() {
      if (this.activeTab === 'linksetting') {
        this.activeTab = 'flowsetting';
      }
      this.currentEdgeData = null;
      this.currentEdge = null;
      this.isSelected = false;
    },
    edgeSelected(edge) {
      //切换前先保存当前选中节点设置
      this.updateNodeSetting();
      //先清空选中数据，强制刷新相关组件
      this.isSelected = false;
      this.currentNode = null;
      this.currentNodeData = null;
      this.currentEdge = null;
      this.currentEdgeData = null;
      this.$nextTick(() => {
        this.currentEdge = edge;
        this.currentEdgeData = edge.getData();
        if (this.activeTab !== 'linksetting') {
          this.activeTab = 'linksetting';
        }
        this.isSelected = true;
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

    nodeSelected(node) {
      //切换前先保存当前选中节点设置
      this.updateNodeSetting();
      //先清空选中数据，强制刷新相关组件
      this.isSelected = false;
      this.currentNode = null;
      this.currentNodeData = null;
      this.currentEdge = null;
      this.currentEdgeData = null;
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
    getAllPrevNodes(node, { include, exclude } = {}) {
      let prevNodeList = [];
      if (node) {
        prevNodeList = this.getPrevNodes(node);
        if (prevNodeList.length > 0) {
          const nodeSet = new Set();
          prevNodeList.forEach(n => {
            nodeSet.add(n.id);
          });
          let size = prevNodeList.length;
          for (let i = 0; i < size; i++) {
            const n = prevNodeList[i];
            const tmpList = this.getPrevNodes(n);
            tmpList.forEach(tmp => {
              //判断新的关系是否存在，不存在则加入nodeList继续循环
              if (!nodeSet.has(tmp.id) && node.id !== tmp.id) {
                nodeSet.add(tmp.id);
                prevNodeList.push(tmp);
              }
            });
            size = prevNodeList.length; //重新修正新的size
          }
          //过滤include和exclude
          prevNodeList = prevNodeList.filter(n => {
            const handler = n.getProp('handler');
            return (include && include.length > 0 ? include.includes(handler) : true) && (exclude && exclude.length > 0 ? !exclude.includes(handler) : true);
          });
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
     * @param isNeedBackward 是否需要获取反向的节点
     * @returns 返回包含下一个节点对象的数组
     */
    getNextNodes(node, { isNeedBackward = false } = {}) {
      const nextNodeList = [];
      if (node) {
        let outgoingEdges = this.graph.getOutgoingEdges(node);
        outgoingEdges = outgoingEdges && outgoingEdges.filter(d => isNeedBackward || d.getProp('type') === 'forward');
        outgoingEdges &&
          outgoingEdges.forEach(d => {
            nextNodeList.push(d.getTargetCell());
          });
      }
      return nextNodeList;
    },
    /**
     * 更新流程设置
     *
     * @description 当从流程设置页面切换时，保存表单的id
     */
    updateFlowSetting() {
      //从流程设置切走的时候，保存表单id
      if (this.$refs.flowSetting) {
        const process = this.$refs.flowSetting ? this.$refs.flowSetting.getJsonValue() : {};
        const formConfig = process.formConfig ? process.formConfig : {};
        //console.log(JSON.stringify(formConfig, null, 2));
        this.$set(this.flowData.process, 'processConfig', process.processConfig);
        this.flowData.process.formConfig.uuid = formConfig.uuid;
      }
    },
    /**
     * 更新节点设置，由于节点设置组件没有监听数据变化，所以需要在切换页签，点击校验，点击保存等需要获取数据的时候手动触发
     *
     */
    updateNodeSetting() {
      if (this.$refs.nodeSetting) {
        //避免错误的回退，修改数据不激活历史操作
        this.graph.disableHistory();
        const nodeConfig = this.$refs.nodeSetting.getValueList();
        const node = this.graph.getCellById(nodeConfig.uuid);
        if (node) {
          node.setData(nodeConfig, { deep: false }); //与原数据进行浅 merge
          node.setData(nodeConfig);
          this.dataTimestamp = new Date().getTime();
        }
        this.graph.enableHistory();
      }
    },
    updateNodeName(val) {
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
    //表单变化后更新相关节点的表单场景
    changeRelateForm(formUuid) {
      //节点设置needformscene为true时，需要更新节点的表单场景id
      this.formSceneUuidList = [];
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
          this.dataTimestamp = new Date().getTime();
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
        this.dataTimestamp = new Date().getTime();
      }
    },
    updateFlowName(value) {
      this.processName = value;
    },
    // 获取节点列表数据
    async getNodeList() {
      await this.$api.process.process.processComponent().then(res => {
        this.nodeList = res.Return;
        this.allowDispatchStepWorkerNode = this.nodeList.filter(item => item.allowDispatchStepWorker).map(item => item.handler);
      });
    },
    selectDraftRow(row) {
      this.processDraftUuid = row.uuid;
    },
    async draftOk() {
      // 草稿列表确认
      if (!this.processDraftUuid) {
        return;
      }
      this.draftModel = false;
      await this.getProcessDraftByUuid();
      this.graph.fromJSON(this.finalFlowData);
    },
    //获取草稿列表
    getDraftList(uuid) {
      // 草稿列表
      this.draftData = [];
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
            this.draftData = draftList;
            if (this.draftData[0]) {
              this.processDraftUuid = this.draftData[0].uuid;
              this.draftData[0]._selected = true;
            }

            if (draftList.length) {
              this.draftModel = true;
            } else {
              this.draftModel = false;
            }
          }
        });
    },
    //新的结束

    //下面都是旧方法======================================================
    //=================================================================
    //====================================================================

    validItemClick(item) {
      if (item.focus) {
        item.focus();
        if (this.validList.length > 0) {
          this.validFlow();
        }
      }
      setTimeout(() => {
        if (item.href) {
          if (this.$refs.nodeSetting) {
            this.$refs.nodeSetting.validNodeData(item.href);
            this.$utils.jumpTo(item.href, 'instant', this.$refs['codeContent']);
          }
        }
      }, 200);
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
          this.$addWatchData(saveData);
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
        this.currentEdgeData = config;
        // 切tab
        this.$nextTick(() => {
          this.currentNodeData = null;
          this.activeTab = 'linksetting';
        });
      } else {
        this.activeTab = 'flowsetting';
        this.$nextTick(() => {
          this.currentEdgeData = null;
        });
      }
    },
    getProcessFormConfig(action) {
      return this.$refs.nodeSetting.saveProcessFormConfig(action);
    },
    nodesHighlight(item) {
      // 节点高亮处理
      const flowEditor = this.$refs.flowEditor;
      var uuidList = (item.processStepUuidList && item.processStepUuidList.map(d => d)) || [];
      if (!this.$utils.isEmpty(uuidList)) {
        flowEditor.disableCells({exclude: uuidList});
      } else {
        flowEditor.clearHighlight();
      }
    },
    toFlowSetting() {
      // 切换到流程设置tab
      this.$nextTick(() => {
        this.activeTab = 'flowsetting';
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
      if (this.dataTimestamp) {
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
      if (this.isFlowReady && this.flowData && this.flowData.topo && this.flowData.topo.nodes) {
        //旧数据真正的数据在stepList中，因此需要从这里提取，新版本stepList和topo的数据都是一致的。
        const stepList = this.flowData.process.stepList;
        const nodes = this.flowData.topo.nodes;
        if (nodes && nodes.length > 0) {
          nodes.forEach(n => {
            const { name, icon, uuid, x, y } = n;
            const config = stepList.find(d => d.uuid === uuid);
            const element = ElementFactory.getElement({ handler: config.handler, type: config.type });
            if (element) {
              //有些节点数据的config并没有uuid，为了一致需要补充上
              if (!config.uuid) {
                config.uuid = uuid;
              }
              //设置评分时，结束节点可以连回退线
              if (element.type == 'end' && this.scoreConfig.isActive) {
                this.$set(element.setting, 'linkout', true);
              }
              cells.push({
                view: 'vue-shape-view',
                id: uuid,
                shape: element.handler || element.type,
                type: config.type,
                handler: config.handler,
                isAllowStart: config.isAllowStart,
                setting: element.setting,
                icon: element.oldSetting ? element.oldSetting.icon : icon,
                position: { x: x, y: y },
                data: config,
                name,
                ports: element.config.ports
              });
            }
          });
        }
        const links = this.flowData.topo.links;
        //console.log(JSON.stringify(links, null, 2));
        const portMap = { L: 'left', R: 'right', B: 'bottom', T: 'top' };
        if (links && links.length > 0) {
          links.forEach(d => {
            const { uuid, name, type, source, target, sAnchor, tAnchor } = d;
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
              labels: [
                {
                  attrs: {
                    label: {
                      text: name
                    }
                  }
                }
              ],
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
              },
              data: { name }
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
      this.flowObj.graph = this.graph;
    },
    activeTab(newValue, oldValue) {
      // 右边active切换的时候
      if (oldValue === 'nodesetting') {
        //从节点tab页切走时 保存节点数据
        this.updateNodeSetting();
      } else if (oldValue === 'flowsetting') {
        this.updateFlowSetting();
      }
    },
    'scoreConfig.isActive'(val) {
      const graphData = this.graph.toJSON();
      graphData.cells.forEach(d => {
        if (d.type == 'end') {
          this.$set(d.setting, 'linkout', !!val);
        }
      });
      this.graph.fromJSON(graphData);
      //当评分设置关闭时需要删除结束节点的回退线
      if (!val) {
        const endNode = this.stepList.find(d => d.type == 'end');
        const edges = this.graph.getOutgoingEdges(endNode.uuid);
        if (!this.$utils.isEmpty(edges)) {
          this.graph.removeCells(edges);
        }
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
