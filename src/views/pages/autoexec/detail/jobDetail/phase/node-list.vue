<template>
  <div v-if="jobData && phaseData" class="bg-op radius-lg padding">
    <div id="slot"></div>
    <Row>
      <Col :span="16">
        <div class="div-btn-contain action-group no-line">
          <template v-if="jobData.isCanExecute && nodeData">
            <span class="action-item tsfont-minus-o" :class="{ disable: selectedNodeList.length <= 0 || phaseData.status == 'running' }" @click="ignoreNode()">{{ $t('page.ignore') }}</span>
            <span class="action-item tsfont-minus-o" :class="phaseData.status == 'running'?'disable':''" @click="ignoreAllNode()">{{ $t('page.ignoreall') }}</span>
            <span class="action-item tsfont-restart" :class="{ disable: selectedNodeList.length <= 0 || phaseData.status == 'running' }" @click="resetNode()">{{ $t('page.reset') }}</span>
            <span class="action-item tsfont-restart" :class="phaseData.status == 'running'?'disable':''" @click="resetAllNode()">{{ $t('page.resetall') }}</span>
            <span class="action-item tsfont-run" :class="phaseData.status == 'running'?'disable':''" @click="refirePhase()">{{ $t('page.executeall') }}</span>
          </template>
          <span class="action-item">
            <Poptip transfer placement="bottom"> 
              <span class="text-action">
                <i class="tsfont-adapter pr-icon"></i><span>{{ $t('term.autoexec.actuatorinformation') }}</span>
              </span>
              <div slot="content">
                <TsTable
                  v-bind="runnerTableConfig"
                >
                  <template v-slot:ipPort="{ row }">
                    <span>{{ row.host }}:{{ row.port }}</span>
                  </template>
                </TsTable>
              </div>
            </Poptip>
          </span>
          <span v-if="canExportNode" class="action-item">
            <Dropdown trigger="hover" placement="bottom">
              <span class="tsfont-option-horizontal"></span>
              <DropdownMenu slot="list">
                <DropdownItem>
                  <div>
                    <span v-if="!downloadLoadingNode" v-download="downloadNodeUrl" class="action-item tsfont-download">{{ $t('term.autoexec.exportnode') }}</span>
                    <span v-if="downloadLoadingNode" class="action-item disable" :title="$t('page.downloadloadingtip')">
                      <Icon type="ios-loading" size="18" class="loading icon-right"></Icon>
                      {{ $t('term.autoexec.exportnode') }}
                    </span>
                  </div>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </span>
        </div>
      </Col>
      <Col :span="8">
        <CombineSearcher v-model="searchParam" v-bind="searchConfig" @change="searchNode(1)"></CombineSearcher>
      </Col>
    </Row>
    <div v-if="phaseData.statusCountVoList && phaseData.statusCountVoList.length > 0" class="div-status">
      <div class="bg-tip-grey padding radius-md com-status">
        <Row class="block-div">
          <Col
            class="col-span custom-flex"
            span="10"
          >
            <span
              v-for="status in phaseData.statusCountVoList"
              :key="status.status"
              class="status-text"
              :class="'text-' + status.status"
              :style="{ color: status.statusVo.color }"
            >{{ status.statusVo.text }} {{ status.count }}</span> 
          </Col>
          <Col
            class="col-span custom-flex text-right"
            span="14"
          >
            <span v-if="phaseData.jobGroupVo.policy" class="status-text text-pending">{{ $t('term.deploy.executivestrategy') }}:{{ phaseData.jobGroupVo.policy }} </span>
            <Tooltip
              v-if="phaseData.parallelPolicy === 'parallel' && parallelCount"
              max-width="320"
              theme="light"
              transfer
            >
              <span class="status-text text-pending">{{ $t('term.autoexec.parall') }}:{{ parallelCount }} </span>
              <div slot="content">
                <div>{{ $t('term.autoexec.parall') }}{{ $t('page.source') }}: {{ phaseData.roundCountFrom }}</div>
                <div>{{ $t('term.autoexec.batchquantity') }}: {{ roundCount }}</div>
              </div>
            </Tooltip>
            <Tooltip
              v-if="phaseData.parallelPolicy === 'roundCount' && roundCount"
              max-width="320"
              theme="light"
              transfer
            >
              <span class="status-text text-pending">{{ $t('term.autoexec.batchquantity') }}:{{ roundCount }} </span>
              <div slot="content">
                {{ $t('term.autoexec.batchquantity') }}{{ $t('page.source') }}: {{ phaseData.roundCountFrom }}
              </div>
            </Tooltip>
            <Tooltip
              v-if="phaseData.userName"
              max-width="320"
              theme="light"
              transfer
            >
              <span class="status-text text-pending">{{ $t('page.executeuser') }}:{{ phaseData.userName }} </span>
              <div slot="content">
                {{ $t('page.executeuser') }}{{ $t('page.source') }}: {{ phaseData.userNameFrom }}
              </div>
            </Tooltip>
            <Tooltip
              v-if="phaseData.protocol"
              max-width="320"
              theme="light"
              transfer
            >
              <span class="status-text text-pending">{{ $t('page.protocol') }}:{{ phaseData.protocol }}</span>
              <div slot="content">
                {{ $t('page.protocol') }}{{ $t('page.source') }}: {{ phaseData.protocolFrom }}
              </div>
            </Tooltip>
          </Col>
        </Row>
      </div>
    </div>
    <div ref="tableBox">
      <TsTable
        v-if="nodeData"
        ref="nodeTable"
        v-bind="nodeData"
        :theadList="theadList"
        multiple
        :height="tableHeight"
        @changeCurrent="changeCurrentPage"
        @changePageSize="changePageSize"
        @getSelected="getSelected"
      >
        <template v-slot:sqlFile="{ row }">
          <!--sql-list.vue专用-->
          <span class="text-href" :class="{ 'text-grey through': row.isDelete === 1 }" @click.stop="viewNodeDetail(row, row.sqlFile)">{{ row.sqlFile }}</span>
        </template>
        <template v-slot:host="{ row }">
          <!--兼容sql-list.vue的场景-->
          <span
            v-if="!row.sqlFile"
            class="text-href"
            :class="{ 'text-grey through': row.isDelete === 1 }"
            @click.stop="viewNodeDetail(row)"
          >{{ row.host }}{{ row.port ? ':' + row.port : '' }}</span>
          <span v-else :class="{ 'text-grey through': row.isDelete === 1 }">{{ row.host }}{{ row.port ? ':' + row.port : '' }}</span>
          <span v-if="row.warnCount" class="ml-xs tsfont-warning-o text-warning">{{ row.warnCount }}</span>
        </template>
        <template v-slot:version="{ row }">
          <span v-if="row && row.extraInfo && row.extraInfo.version">{{ row.extraInfo.version }}</span>
          <span v-else>-</span>
        </template>
        <template v-slot:isModified="{row}">
          <span :class="{'text-warning': row.isModified == 1,'':row.isModified == 0}">
            {{ row.isModified == 1?$t('page.yes'):$t('page.no') }}
          </span>
        </template>
        <template v-slot:blueGreenName="{ row }">
          <span v-if="row && row.extraInfo && row.extraInfo.blueGreenName">{{ row.extraInfo.blueGreenName }}({{ row.extraInfo.blueGreenSort }})</span>
          <span v-else>-</span>
        </template>
        <template v-slot:nodeName="{ row }">
          <span :class="{ 'text-grey': row.isDelete === 1 }">{{ row.nodeName }}</span>
        </template>
        <template v-slot:costTime="{ row }">
          <span :class="{ 'text-grey': row.isDelete === 1 }">{{ row.costTime }}</span>
        </template>
        <template v-slot:startTime="{ row }">
          <span v-if="row.startTime" class="overflow" :class="{ 'text-grey': row.isDelete === 1 }">
            <div v-if="row.startTime" class="fz10">
              <span>{{ row.startTime | formatDate }}</span>
              <span class="text-grey ml-xs">{{ $t('page.begin') }}</span>
            </div>
            <div v-if="row.endTime" class="fz10">
              <span>{{ row.endTime | formatDate }}</span>
              <span class="text-grey ml-xs">{{ $t('page.finish') }}</span>
            </div>
          </span>
        </template>
        <template v-slot:statusVo="{ row }">
          <span v-if="row.isDelete === 1" class="text-grey">{{ row.statusName }}</span>
          <span v-else-if="row.status == 'running'">
            <Progress
              hide-info
              :percent="99"
              status="active"
              style="width:50px"
            />
          </span>
          <span
            v-else
            :class="{
              'text-success': row.status == 'succeed',
              'text-error': row.status == 'failed',
              'text-grey': row.status == 'pending',
              'text-warning': row.status == 'waiting' || row.status == 'ignored' || row.status == 'aborted' || row.status == 'aborting' || row.status == 'waitInput' || row.status == 'paused' || row.status == 'invalid'
            }"
          >
            <Tooltip
              v-if="row.status == 'invalid'"
              :transfer="true"
              placement="bottom-start"
              trigger="hover"
              max-width="400"
            >
              <span class="ml-xs tsfont-warning-o text-warn">{{ row.statusName }}</span>
              <div slot="content">{{ row.errorMsg }}</div>
            </Tooltip>
            <span v-else>{{ row.statusName }}</span>
          </span>
        </template>
        <template v-slot:action="{ row }">
          <div class="tstable-action">
            <ul class="tstable-action-ul">
              <li v-if="row.runnerHost && phaseData.execMode != 'sqlfile'">
                <Tooltip
                  :transfer="true"
                  placement="bottom-start"
                  trigger="hover"
                >
                  <span class="action-item tsfont-adapter text-action">{{ $t('term.autoexec.actuatorinformation') }}</span>
                  <div slot="content">{{ row.runnerHost }}{{ row.runnerPort ? ':' + row.runnerPort : '' }}</div>
                </Tooltip>
              </li>
              <template v-if="phaseData.status != 'running' && jobData.isCanExecute && row.isDelete != 1">
                <li
                  v-for="(action, index) in statusActionMapping[row.status]"
                  :key="index"
                  :class="actionMap[action].icon"
                  @click.stop="actionMap[action].fn(row)"
                >{{ actionMap[action].text }}</li>
              </template>
            </ul>
          </div>
        </template>
      </TsTable>
    </div>
    <!-- 节点详情弹出框 -->
    <NodeDialog
      v-if="isNodeDetailDialogShow"
      :jobData="jobData"
      :phaseData="phaseData"
      :nodeData="currentNode"
      :nodeTitle="nodeTitle"
      @close="closeNodeDetailDialog"
    ></NodeDialog>
    <ResetDialog
      v-if="actionParam && isResetDialogShow"
      :jobId="actionParam.jobId"
      :phaseId="actionParam.phaseId"
      :nodeList="actionParam.nodeList"
      :isAll="actionParam.isResetAll"
      :statusActionMapping="statusActionMapping"
      @close="closeResetDialog"
    ></ResetDialog>
    <IgnoreDialog
      v-if="actionParam && isIgnoreDialogShow"
      :jobId="actionParam.jobId"
      :phaseId="actionParam.phaseId"
      :nodeList="actionParam.nodeList"
      :isAll="actionParam.isIgnoreAll"
      :statusActionMapping="statusActionMapping"
      @close="closeIgnoreDialog"
    ></IgnoreDialog>
    <RefirePhaseDialog
      v-if="isRefireDialogShow"
      :phaseId="phaseData.id"
      :phaseName="phaseData.name"
      :execMode="phaseData.execMode"
      @close="closeRefireDialog"
    ></RefirePhaseDialog>
  </div>
  <div v-else>
    <NoData></NoData>
  </div>
</template>
<script>
import {store, mutations} from '../../jobDetailState.js';
import download from '@/resources/directives/download.js';
export default {
  name: '',
  components: {
    CombineSearcher: () => import('@/resources/components/CombineSearcher/CombineSearcher.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    ResetDialog: () => import('../reset-dialog.vue'),
    RefirePhaseDialog: () => import('../refire-phase-dialog.vue'),
    IgnoreDialog: () => import('../ignore-dialog.vue'),
    NodeDialog: () => import('../node-dialog.vue')
  },
  filters: {},
  directives: { download },
  props: {
    jobData: { type: Object },
    phaseData: { type: Object }
  },
  data() {
    const _this = this;
    return {
      downloadLoadingNode: false,
      selectedNodeList: [], //已选中的节点id列表
      isNodeDetailDialogShow: false,
      isResetDialogShow: false,
      isIgnoreDialogShow: false,
      isRefireDialogShow: false,
      currentNodeId: null, //当前选中节点
      actionParam: null, //执行忽略、重置等事件时的参数
      searchConfig: {
        placeholder: this.$t('term.autoexec.enterthenodenameoripaddress'),
        searchList: [
          {
            type: 'select',
            name: 'statusList',
            value: [],
            label: this.$t('page.status'),
            multiple: true,
            url: '/api/rest/universal/enum/get',
            params: { enumClass: 'neatlogic.framework.autoexec.constvalue.JobNodeStatus' },
            transfer: true
          },
          {
            type: 'radio',
            name: 'isDelete',
            value: '',
            label: this.$t('page.deleteornot'),
            valueName: 'value',
            textName: 'text',
            dataList: [
              {
                text: this.$t('page.yes'),
                value: 1
              },
              {
                text: this.$t('page.no'),
                value: 0
              }
            ],
            transfer: true
          }
        ]
      },
      endingStatusList: ['succeed', 'failed', 'aborted', 'ignored', 'paused', 'completed'],
      //这是终点状态节点列表，非终点状态列表的需要定时刷新。到达终点状态列表之后，还会再刷新一次，确保所有状态一致。
      searchParam: {},
      nodeData: { value: [] },
      timmer: null,
      theadList: [
        {
          title: 'ip',
          key: 'host'
        },
        {
          title: this.$t('term.process.nodename'),
          key: 'nodeName'
        },
        {
          title: this.$t('page.status'),
          key: 'statusVo'
        },
        {
          title: this.$t('page.timecost'),
          key: 'costTime'
        },
        {
          title: this.$t('page.startstoptime'),
          width: 300,
          key: 'startTime'
        },
        {
          title: '',
          key: 'action'
        }
      ],
      statusActionMapping: {
        pending: ['ignore', 'refire'],
        running: ['reset'],
        succeed: ['reset'],
        failed: ['ignore', 'reset', 'refire'],
        aborted: ['ignore', 'reset', 'refire'],
        aborting: ['ignore', 'reset', 'refire'],
        paused: ['ignore', 'reset', 'refire'],
        ignored: ['reset']
      },
      actionMap: {
        refire: {
          text: this.$t('page.reexecute'),
          icon: 'tsfont-run',
          fn: _this.refireNode
        },
        ignore: {
          text: this.$t('page.ignore'),
          icon: 'tsfont-minus-o',
          fn: _this.ignoreNode
        },
        reset: {
          text: this.$t('page.reset'),
          icon: 'tsfont-restart',
          fn: _this.resetNode
        }
      },
      nodeTitle: null,
      refreshTimes: 3, //完成后刷新次数
      isFirst: true,
      tableHeight: 150,
      runnerTableConfig: {
        theadList: [
          { title: this.$t('page.name'), key: 'name' },
          { title: this.$t('page.config'), key: 'ipPort' },
          { title: this.$t('page.status'), key: 'status' },
          { title: this.$t('term.autoexec.isfirenext'), key: 'isFireNext' },
          { title: this.$t('page.updatetime'), key: 'lcd', type: 'time' }
        ],
        tbodyList: this.phaseData.runnerVos,
        currentPage: 1,
        pageSize: 20,
        pageCount: 1
      }
    };
  },
  beforeCreate() {},
  created() {
    if (this.jobData.extraInfo && this.jobData.extraInfo.sourceType == 'deploy' && this.phaseData.execMode != 'sqlfile') {
      // 添加发布版本字段
      this.theadList.splice(1, 0, {
        title: this.$t('page.versions'),
        key: 'version'
      });
      //添加发布蓝绿
      this.theadList.splice(1, 0, {
        title: this.$t('term.deploy.blueSet'),
        key: 'blueGreenName'
      });
    }
    if (this.jobData.isCanExecute) {
      this.theadList.unshift({ key: 'selection' });
    }
    if (!this.$utils.isEmpty(mutations.getSearchParam())) {
      this.searchParam = mutations.getSearchParam();
    }
    this.searchNode();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    if (this.timmer) {
      clearTimeout(this.timmer);
      this.timmer = null;
    }
  },
  destroyed() {},
  methods: {
    changeCurrentPage(currentPage) {
      this.searchNode(currentPage);
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchNode(1);
    },
    ignoreNode(node) {
      if (this.phaseData.status == 'running') { //阶段状态判断:运行中状态：不可点击;其他状态，可以点击
        return false;
      }
      //如果node为空代表是批量模式，需要检查是否有选中数据
      if (!node && !this.selectedNodeList.length) {
        return;
      }
      this.actionParam = {};
      this.actionParam.jobId = this.jobData.id;
      this.actionParam.phaseId = this.phaseData.id;
      if (!node) {
        this.actionParam.nodeList = this.selectedNodeList;
      } else {
        this.actionParam.nodeList = [node];
      }
      this.isIgnoreDialogShow = true;
    },
    ignoreAllNode() {
      if (this.phaseData.status == 'running') { //阶段状态判断:运行中状态：不可点击;其他状态，可以点击
        return false;
      }
      this.actionParam = {};
      this.actionParam.jobId = this.jobData.id;
      this.actionParam.phaseId = this.phaseData.id;
      this.actionParam.isIgnoreAll = 1;
      this.isIgnoreDialogShow = true;
    },
    resetNode(node) {
      if (this.phaseData.status == 'running') { //阶段状态判断:运行中状态：不可点击;其他状态，可以点击
        return false;
      }
      //如果node为空代表是批量模式，需要检查是否有选中数据
      if (!node && !this.selectedNodeList.length) {
        return;
      }
      this.actionParam = {};
      this.actionParam.jobId = this.jobData.id;
      this.actionParam.phaseId = this.phaseData.id;
      this.actionParam.isResetAll = 0;
      if (!node) {
        this.actionParam.nodeList = this.selectedNodeList;
      } else {
        this.actionParam.nodeList = [node];
      }
      this.isResetDialogShow = true;
    },
    resetAllNode() {
      if (this.phaseData.status == 'running') { //阶段状态判断:运行中状态：不可点击;其他状态，可以点击
        return false;
      }
      this.actionParam = {};
      this.actionParam.jobId = this.jobData.id;
      this.actionParam.phaseId = this.phaseData.id;
      this.actionParam.isResetAll = 1;
      this.isResetDialogShow = true;
    },
    refirePhase() {
      if (this.phaseData.status == 'running') { //阶段状态判断:运行中状态：不可点击;其他状态，可以点击
        return false;
      }
      this.isRefireDialogShow = true;
    },
    refireNode(node) {
      const params = {
        jobId: this.jobData.id,
        jobPhaseId: this.phaseData.id,
        resourceIdList: [node.resourceId],
        sqlIdList: [node.id]
      };
      this.$createDialog({
        title: this.$t('dialog.title.updateconfirm'),
        content: this.$t('term.autoexec.skipallsuccessoperationcontinue'),
        'on-ok': vnode => {
          this.$api.autoexec.job
            .redoNode(params)
            .then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.executesuccess'));
                this.searchNode();
                this.$emit('refresh');
              }
            })
            .finally(() => {
              vnode.isShow = false;
            });
        }
      });
    },
    closeIgnoreDialog(needRefresh) {
      this.isIgnoreDialogShow = false;
      if (needRefresh) {
        this.refresh();
      }
    },
    closeResetDialog(needRefresh) {
      this.isResetDialogShow = false;
      if (needRefresh) {
        this.refresh();
      }
    },
    closeRefireDialog(needRefresh) {
      this.isRefireDialogShow = false;
      if (needRefresh) {
        this.refresh();
      }
    },
    refresh() {
      //this.searchNode();
      this.$emit('refresh');
    },
    refreshNode(nodeIdList) {
      if (this.timmer) {
        clearTimeout(this.timmer);
        this.timmer = null;
      }
      if (!this.$utils.isEmpty(nodeIdList) || this.refreshTimes > 0) {
        this.$api.autoexec.job
          .searchPhaseNode({
            nodeIdList: nodeIdList,
            needPage: false,
            jobPhaseId: this.phaseData.id
          })
          .then(res => {
            if (res.Return['tbodyList'] && res.Return['tbodyList'].length > 0) {
              const nodeIdList = [];
              res.Return['tbodyList'].forEach(node => {
                const oldNodeIndex = this.nodeData.tbodyList.findIndex(d => d.id === node.id);
                if (oldNodeIndex >= 0) {
                  node['isSelected'] = this.nodeData.tbodyList[oldNodeIndex]['_selected'];
                  this.$set(this.nodeData.tbodyList, oldNodeIndex, node);
                }
                if (!this.endingStatusList.includes(this.phaseData.status)) {
                  nodeIdList.push(node.id);
                }
                if (node && node.hasOwnProperty('isDelete') && (node.isDelete === 1)) {
                  // 已删除节点，复选框禁用不可勾选
                  node['isDisabled'] = true;
                }
              });
              if (this.$utils.isEmpty(nodeIdList)) {
                this.refreshTimes--;
              }
              if (nodeIdList.length > 0 || this.refreshTimes > 0) {
                this.timmer = setTimeout(() => {
                  this.refreshNode(nodeIdList);
                }, 3000);
              }
            }
          });
      }
    },
    searchNode(currentPage) {
      if (this.timmer) {
        clearTimeout(this.timmer);
        this.timmer = null;
      }
      this.searchParam.jobPhaseId = this.phaseData.id;
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
        this.searchParam.nodeIdList = [];
      }
      mutations.setSearchParam(this.searchParam);
      this.$api.autoexec.job.searchPhaseNode(this.searchParam).then(res => {
        this.nodeData = res.Return;
        if (this.isFirst) {
          this.getTableHeight();
        }
        const nodeList = res.Return.tbodyList;
        if (nodeList && nodeList.length > 0) {
          const nodeIdList = [];
          //由于phase状态变了以后node状态不会同步发生变化，需要修改成监听phase状态来判断node是否需要刷新
          if (!this.endingStatusList.includes(this.phaseData.status)) {
            nodeList.forEach(element => {
            //if (!this.endingStatusList.includes(element.status)) {
              nodeIdList.push(element.id);
              // }
            });
          }
          if (nodeIdList.length > 0) {
            this.refreshTimes = 3;  
          }
          this.timmer = setTimeout(() => {
            this.refreshNode(nodeIdList);
          }, 3000);
        }
        if (this.nodeData && this.nodeData.tbodyList && this.nodeData.tbodyList.length > 0) {
          // 节点被删除，复选框禁用
          this.nodeData.tbodyList.forEach((item) => {
            if (item && item.hasOwnProperty('isDelete') && (item.isDelete === 1)) {
              this.$set(item, 'isDisabled', true);
            }
          });
        }
      });
    },
    openNodeDetailDialog(node) {
      this.isNodeDetailDialogShow = true;
    },
    closeNodeDetailDialog() {
      this.isNodeDetailDialogShow = false;
    },
    getSelected(indexList, itemList) {
      this.selectedNodeList = itemList;
    },
    viewNodeDetail(row, title) {
      this.nodeTitle = title || row.host + (row.port ? ':' + row.port : '');
      this.currentNodeId = row.id;
      this.isNodeDetailDialogShow = true;
    },
    getTableHeight() {
      this.isFirst = false;
      const windowHeight = document.documentElement.clientHeight - 36;
      this.$nextTick(() => {
        if (this.$refs.tableBox) {
          let top = this.$refs.tableBox.getBoundingClientRect().top;
          const tableHeight = windowHeight - top;
          if (this.tableHeight < tableHeight) {
            this.tableHeight = tableHeight;
          }
        }
      });
    }
  },
  computed: {
    roundCount() {
      let roundCount = this.phaseData.roundCount;
      if (roundCount == 0) {
        return this.$t('term.autoexec.allserial');
      } else if (roundCount == 1) {
        return this.$t('term.autoexec.allparallel');
      } else if (roundCount == -1) {
        return this.$t('term.autoexec.bluegreenexecute');
      } else {
        return roundCount;
      }
    },
    parallelCount() {
      let parallelCount = this.phaseData.parallelCount;
      if (parallelCount == 0) {
        return this.$t('term.autoexec.allserial');
      } else if (parallelCount == 1) {
        return this.$t('term.autoexec.allparallel');
      } else if (parallelCount == -1) {
        return this.$t('term.autoexec.bluegreenexecute');
      } else {
        return parallelCount;
      }
    },
    currentNode() {
      if (this.currentNodeId && this.nodeData && this.nodeData.tbodyList && this.nodeData.tbodyList.length > 0) {
        return this.nodeData.tbodyList.find(d => d.id === this.currentNodeId);
      }
      return null;
    },
    downloadNodeUrl() {
      // 导出节点
      return {
        url: '/api/binary/autoexec/job/phase/node/export',
        method: 'post',
        params: {
          jobPhaseId: this.phaseData.id
        },
        changeStatus: status => {
          if (status == 'start') {
            this.downloadLoadingNode = true;
          } else if (status == 'success' || status == 'error') {
            this.downloadLoadingNode = false;
          }
        }
      };
    },
    canExportNode() {
      let phaseList = ['runner', 'sqlfile']; // 非runner阶段、非sqlfile阶段，才有导出节点
      if (this.phaseData && !phaseList.includes(this.phaseData.execMode)) {
        return true;
      } else {
        return false;
      }
    }
  },
  watch: {
    phaseData: {
      handler(val, oldval) {
        if (val) {
          this.$set(this.runnerTableConfig, 'tbodyList', val.runnerVos);
        }
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.through {
  text-decoration: line-through;
}
.through:hover {
  text-decoration: none;
}
.nodeListLiqu {
  ::v-deep .ivu-progress-bg {
    background-color: @default-disable!important;
  }
}
.div-status {
  padding-top: 10px;
  padding-bottom: 10px;
  > div {
    padding-top: 0px;
    padding-bottom: 0px;
    line-height: 31px;
    border: none;
    .status-text {
      margin-right: 10px;
    }
  }
}
</style>
