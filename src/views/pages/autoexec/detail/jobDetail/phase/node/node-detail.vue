<template>
  <div class="content-main">
    <Tabs
      ref="test"
      v-model="tabValue"
      class="tab-contain block-tabs2"
      :animated="false"
      :class="{'page-tabs':mode=='page'}"
      @on-click="changeTab"
    >
      <TabPane
        v-if="phaseData.execMode != 'sqlfile'"
        :label="$t('term.autoexec.standardoutput')"
        class="padding"
        :class="getTabDetailClass()"
        name="standardOutput"
      >
        <div style="display:grid;grid-template-columns:228px auto">
          <div style="overflow-y: auto;" :style="{ height: 'calc(100vh - ' + (mode === 'page' ? !$utils.isEmptyObj(jobData.extraInfo) ? '310px': '215px' : '190px') + ')' }">
            <div v-if="operationList && operationList.length">
              <div
                v-for="(step, sindex) in operationList"
                :key="sindex"
                class="step-item radius-sm mb-nm cursor bg-op"
                :class="{ 'active block-primary': step.status == 'running' }"
              >
                <div :class="locationId === step.name.replace(/[-\.\/]+?/gi, '_') + '_' + step.id?'operation-items-focus':'operation-items'">
                  <Dropdown
                    v-if="step && step.type !== 'tool'"
                    transfer
                    trigger="click"
                    placement="bottom"
                  >
                    <span class="tsfont-option-horizontal"></span>
                    <DropdownMenu slot="list">
                      <DropdownItem v-if="step && (step.type !== 'tool')" @click.native="openScriptContentDialog(step)">
                        <div>
                          <span class="action-item">{{ $t('term.autoexec.scriptcontent') }}</span>
                        </div>
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
                <template v-if="step && step.condition">
                  <!-- IF-Block -->
                  <div
                    class="padding"
                  >
                    <div v-if="locationId === step.name.replace(/[-\.\/]+?/gi, '_') + '_' + step.id" class="fz10 text-info fixed-icon tsfont-location-o"></div>
                    <div style="white-space:nowrap" class="overflow">
                      <span class="stepIndex tips icon-right" :class="getStepIndexClass(step)" @click.stop></span>
                      <span class="stepName name" :class="{ 'text-primary': step.status == 'running' }" :title="step.name">{{ getOperationName(step) }}</span>
                    </div>
                    <div v-if="step.description" class="stepType overflow description-pl">
                      <span class="text-tip fz10 tips" :title="step.description">{{ step.description }}</span>
                    </div>
                  </div>
                  <div v-if="!$utils.isEmpty(step.ifList) || !$utils.isEmpty(step.elseList)" class="divide-line border-color"></div>
                  <div v-if="!$utils.isEmpty(step.ifList)" class="padding-sm">
                    <div>
                      <div class="text-grey pb-xs">{{ $t('page.condition') }}</div>
                      <div class="overflow mb-sm" style="white-space: nowrap;" :title="step.condition">{{ step.condition }}</div>
                    </div>
                    <div>
                      <div class="text-grey pb-xs">{{ $t('term.autoexec.satisfiedexecution') }}</div>
                      <div
                        v-for="item in step.ifList"
                        :key="item.id"
                        class="condition-border border-color padding-sm radius-sm mb-sm"
                      >
                        <div :class="locationId === item.name.replace(/[-\.\/]+?/gi, '_') + '_' + item.id?'operation-items-focus':'operation-items'">
                          <Dropdown v-if="item && item.type !== 'tool'" trigger="click" placement="bottom">
                            <span class="tsfont-option-horizontal"></span>
                            <DropdownMenu slot="list">
                              <DropdownItem v-if="item && item.type !== 'tool'" @click.native="openScriptContentDialog(item)">
                                <div>
                                  <span class="action-item">{{ $t('term.autoexec.scriptcontent') }}</span>
                                </div>
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </div>
                        <div @click="locate(item)">
                          <div v-if="locationId === item.name.replace(/[-\.\/]+?/gi, '_') + '_' + item.id" class="fz10 text-info fixed-icon tsfont-location-o"></div>
                          <div style="white-space:nowrap" class="overflow">
                            <span class="stepIndex tips icon-right" :class="getStepIndexClass(item)" @click.stop></span>
                            <span class="stepName name" :class="{ 'text-primary': item.status == 'running' }" :title="item.name">{{ getOperationName(item) }}</span>
                          </div>
                          <div v-if="item.description" class="stepType overflow description-pl">
                            <span class="text-tip fz10 tips" :title="item.description">{{ item.description }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div v-if="!$utils.isEmpty(step.elseList)">
                      <div class="text-grey pb-xs">{{ $t('term.autoexec.otherwiseexecute') }}</div>
                      <div
                        v-for="item in step.elseList"
                        :key="item.id"
                        class="condition-border border-color radius-sm padding-sm mb-sm else-list-box"
                      >
                        <div :class="locationId === item.name.replace(/[-\.\/]+?/gi, '_') + '_' + item.id?'operation-items-focus':'operation-items'">
                          <Dropdown v-if="item && item.type !== 'tool'" trigger="click" placement="bottom">
                            <span class="tsfont-option-horizontal"></span>
                            <DropdownMenu slot="list">
                              <DropdownItem v-if="item && item.type !== 'tool'" @click.native="openScriptContentDialog(item)">
                                <div>
                                  <span class="action-item">{{ $t('term.autoexec.scriptcontent') }}</span>
                                </div>
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </div>
                        <div @click="locate(item)">
                          <div v-if="locationId === item.name.replace(/[-\.\/]+?/gi, '_') + '_' + item.id" class="fz10 text-info fixed-icon tsfont-location-o"></div>
                          <div style="white-space:nowrap" class="overflow">
                            <span class="stepIndex tips icon-right" :class="getStepIndexClass(item)" @click.stop></span>
                            <span class="stepName name" :class="{ 'text-primary': item.status == 'running' }" :title="item.name">{{ getOperationName(item) }}</span>
                          </div>
                          <div v-if="item.description" class="stepType overflow description-pl">
                            <span class="text-tip fz10 tips" :title="item.description">{{ item.description }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
                <template v-else-if="step && step.loopItems">
                  <!-- LOOP-Block -->
                  <div
                    class="padding"
                  >
                    <div v-if="locationId === step.name.replace(/[-\.\/]+?/gi, '_') + '_' + step.id" class="fz10 text-info fixed-icon tsfont-location-o"></div>
                    <div style="white-space:nowrap" class="overflow">
                      <span class="stepIndex tips icon-right" :class="getStepIndexClass(step)" @click.stop></span>
                      <span class="stepName name" :class="{ 'text-primary': step.status == 'running' }" :title="step.name">{{ getOperationName(step) }}</span>
                    </div>
                    <div v-if="step.description" class="stepType overflow description-pl">
                      <span class="text-tip fz10 tips" :title="step.description">{{ step.description }}</span>
                    </div>
                  </div>
                  <div v-if="!$utils.isEmpty(step.operations)" class="divide-line border-color"></div>
                  <div v-if="!$utils.isEmpty(step.operations)" class="padding-sm">
                    <div>
                      <div class="text-grey pb-xs">{{ $t('term.autoexec.loopitem') }}</div>
                      <div class="overflow mb-sm" style="white-space: nowrap;" :title="step.loopItems">{{ step.loopItems }}</div>
                    </div>
                    <div>
                      <div class="text-grey pb-xs">{{ $t('term.autoexec.loopoperation') }}</div>
                      <div
                        v-for="item in step.operations"
                        :key="item.id"
                        class="condition-border border-color padding-sm radius-sm mb-sm"
                      >
                        <div :class="locationId === item.name.replace(/[-\.\/]+?/gi, '_') + '_' + item.id?'operation-items-focus':'operation-items'">
                          <Dropdown v-if="item && item.type !== 'tool'" trigger="click" placement="bottom">
                            <span class="tsfont-option-horizontal"></span>
                            <DropdownMenu slot="list">
                              <DropdownItem v-if="item && item.type !== 'tool'" @click.native="openScriptContentDialog(item)">
                                <div>
                                  <span class="action-item">{{ $t('term.autoexec.scriptcontent') }}</span>
                                </div>
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </div>
                        <div @click="locate(item)">
                          <div v-if="locationId === item.name.replace(/[-\.\/]+?/gi, '_') + '_' + item.id" class="fz10 text-info fixed-icon tsfont-location-o"></div>
                          <div style="white-space:nowrap" class="overflow">
                            <span class="stepIndex tips icon-right" :class="getStepIndexClass(item)" @click.stop></span>
                            <span class="stepName name" :class="{ 'text-primary': item.status == 'running' }" :title="item.name">{{ getOperationName(item) }}</span>
                          </div>
                          <div v-if="item.description" class="stepType overflow description-pl">
                            <span class="text-tip fz10 tips" :title="item.description">{{ item.description }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
                <div
                  v-else
                  class="padding"
                  @click="locate(step)"
                >
                  <div v-if="locationId === step.name.replace(/[-\.\/]+?/gi, '_') + '_' + step.id" class="fz10 text-info fixed-icon tsfont-location-o"></div>
                  <div style="white-space:nowrap" class="overflow">
                    <span class="stepIndex tips icon-right" :class="getStepIndexClass(step)" @click.stop></span>
                    <span class="stepName name" :class="{ 'text-primary': step.status == 'running' }" :title="step.name">{{ getOperationName(step) }}</span>
                  </div>
                  <div v-if="step.description" class="stepType overflow description-pl">
                    <span class="text-tip fz10 tips" :title="step.description">{{ step.description }}</span>
                  </div>

                </div>
              </div>
            </div>
            <Loading v-else-if="loading" loadingShow></Loading>
            <div v-else class="text-tip" style="margin-top:35px">{{ $t('page.notarget', {target: $t('term.autoexec.runscript')}) }}</div>
          </div>
          <div>
            <NodeLog
              v-if="tabValue == 'standardOutput'"
              ref="stdoutLog"
              :jobData="jobData"
              :phaseData="phaseData"
              :nodeData="nodeData"
              :runnerData="runnerData"
              :mode="mode"
              :locationId="locationId"
              :isHasExtraInfo="!$utils.isEmptyObj(jobData.extraInfo)"
            ></NodeLog>
          </div>
        </div>
      </TabPane>
      <TabPane
        v-if="phaseData.execMode == 'sqlfile'"
        :label="$t('term.autoexec.executionresult')"
        class="padding"
        :class="getTabDetailClass()"
        name="executeResult"
      >
        <NodeLog
          v-if="tabValue == 'executeResult'"
          :jobData="jobData"
          :phaseData="phaseData"
          :nodeData="nodeData"
          :runnerData="runnerData"
          :mode="mode"
          :isHasExtraInfo="!$utils.isEmptyObj(jobData.extraInfo)"
        ></NodeLog>
      </TabPane>
      <TabPane
        v-if="phaseData.execMode == 'sqlfile'"
        :label="$t('term.autoexec.scriptcontent')"
        class="padding"
        :class="getTabDetailClass()"
        name="scriptContent"
      >
        <SqlContent
          v-if="tabValue == 'scriptContent'"
          :nodeData="nodeData"
          :jobData="jobData"
          :phaseData="phaseData"
          :mode="mode"
          :isHasExtraInfo="!$utils.isEmptyObj(jobData.extraInfo)"
        ></SqlContent>
      </TabPane>
      <TabPane
        :label="$t('page.inputparam')"
        class="padding"
        :class="getTabDetailClass()"
        name="inputParameters"
        style="paddint-top:0px"
      >
        <NodeParam
          v-if="tabValue == 'inputParameters'"
          :id="nodeData.id"
          :jobPhaseId="phaseData.id"
          :resourceId="nodeData.resourceId"
          :sqlName="nodeData.sqlFile"
          :jobId="jobData.id"
          :type="'input'"
        ></NodeParam>
      </TabPane>
      <TabPane
        :label="$t('page.outputparam')"
        class="padding"
        :class="getTabDetailClass()"
        name="outputParameters"
        style="paddint-top:0px"
      >
        <NodeParam
          v-if="tabValue == 'outputParameters'"
          :id="nodeData.id"
          :jobPhaseId="phaseData.id"
          :resourceId="nodeData.resourceId"
          :sqlName="nodeData.sqlFile"
          :jobId="jobData.id"
          :type="'output'"
        ></NodeParam>
      </TabPane>
      <TabPane
        :label="$t('term.autoexec.runrecord')"
        class="padding"
        :class="getTabDetailClass()"
        name="record"
      >
        <Record v-if="tabValue == 'record'" :nodeData="nodeData" :phaseData="phaseData"></Record>
      </TabPane>
      <template v-if="customTemplateList.length">
        <TabPane
          v-for="(t,tIndex) in customTemplateList"
          :key="tIndex"
          :label="t.name"
          :name="'customTemplate_'+t.operationId"
          class="padding"
          :class="getTabDetailClass()"
        >
          <CustomTemplateViewer
            v-if="tabValue == 'customTemplate_'+t.operationId && !isCustomTemplateShow"
            :config="t.config"
            :template="t.template"
            :data="customTemplateData"
          ></CustomTemplateViewer>
        </TabPane>
      </template>
    </Tabs>
    <ScriptContentDialog
      v-if="isShowScriptContentDialog"
      :title="operationTitle"
      :scriptData="operationData"
      @close="isShowScriptContentDialog = false"
    ></ScriptContentDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    NodeLog: () => import('@/views/pages/autoexec/detail/logcomponents/node-log.vue'),
    Record: () => import('./record.vue'),
    NodeParam: () => import('./param.vue'),
    SqlContent: () => import('@/views/pages/autoexec/detail/logcomponents/sql-content.vue'), // 脚本内容
    ScriptContentDialog: () => import('@/views/pages/autoexec/detail/script-content-dialog.vue'),
    CustomTemplateViewer: () => import('@/resources/components/customtemplate/customtemplate-viewer.vue')
  },
  filters: {},
  directives: {},
  props: {
    jobData: { type: Object }, //作业信息
    phaseData: { type: Object }, //阶段信息
    nodeData: { type: Object, default: () => {} }, //节点信息
    runnerData: { type: Object }, //执行器信息
    mode: { type: String, default: 'page' } //page或dialog两种模式，用来决定日志框高度
  },
  data() {
    return {
      operationList: [], //脚本步骤列表
      tabValue: this.phaseData.execMode != 'sqlfile' ? 'standardOutput' : 'executeResult',
      loading: false,
      startPos: 0,
      endPos: 0,
      timmer: null,
      locationId: null, //日志定位行id
      isShowScriptContentDialog: false,
      operationTitle: '', // 脚本内容弹窗title
      operationData: {},
      customTemplateList: [], //自定义模板列表
      customTemplateData: {},
      isCustomTemplateShow: true,
      customTemplateTimmer: null,
      operationEndingStatusList: ['completed', 'aborted', 'failed'] //终点状态节点列表，非终点状态列表的需要定时刷新。
    };
  },
  beforeCreate() {},
  created() {
    if (this.phaseData.execMode != 'sqlfile') {
      this.getOperationList();
      this.getjobCustomTemplateListList();
      this.timmer = setTimeout(() => {
        this.refreshOperationStatus();
      }, 3000);
    }
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
    if (this.customTemplateTimmer) {
      clearTimeout(this.customTemplateTimmer);
      this.customTemplateTimmer = null;
    }
  },
  destroyed() {},
  methods: {
    openScriptContentDialog(operation) {
      this.isShowScriptContentDialog = true;
      if (operation) {
        this.operationData = {
          operationId: operation.id,
          jobId: this.jobData.id
        };
        this.operationTitle = operation.name || '';
      } else {
        this.operationData = {};
        this.operationTitle = '';
      }
    },
    locate(operation) {
      if (this.locationId !== operation.name.replace(/[-\.\/]+?/gi, '_') + '_' + operation.id) {
        this.locationId = operation.name.replace(/[-\.\/]+?/gi, '_') + '_' + operation.id;
      } else {
        this.locationId = '';
      }
    },
    getOperationList() {
      let param = {
        jobPhaseId: this.phaseData.id,
        status: this.nodeData.status,
        resourceId: this.nodeData.resourceId,
        sqlName: this.nodeData.sqlFile || null
      };
      this.$api.autoexec.job.getOperationList(param).then(res => {
        let data = res.Return;
        this.$set(this, 'operationList', data.operationStatusList);
      });
    },
    refreshOperationStatus() {
      if (this.timmer) {
        clearTimeout(this.timmer);
        this.timmer = null;
      }
      if (this.nodeData.status === 'pending') {
        this.timmer = setTimeout(() => {
          this.refreshOperationStatus();
        }, 3000);
      } else {
        let param = {
          jobPhaseId: this.phaseData.id,
          status: this.nodeData.status,
          resourceId: this.nodeData.resourceId,
          sqlName: this.nodeData.sqlFile || null
        };
        this.$api.autoexec.job.getOperationList(param).then(res => {
          let data = res.Return;
          let isRefresh = data.isRefresh;
          this.$set(this, 'operationList', data.operationStatusList);
          if (isRefresh === 1) {
            this.timmer = setTimeout(() => {
              this.refreshOperationStatus();
            }, 3000);
          }
        });
      }
    },
    getOperationName(step) {
      if (step.name) {
        return step.name;
      } else {
        return '-';
      }
    },
    getjobCustomTemplateListList() { //自定义模板列表
      this.$api.autoexec.job.getjobCustomTemplateListList({jobPhaseId: this.phaseData.id}).then(res => {
        if (res.Status == 'OK') {
          this.customTemplateList = res.Return || [];
        }
      });
    },
    getJobCustomdata(operationId) { //更新当前自定义模板参数，运行时定时刷新
      if (!operationId) {
        return;
      }
      let data = {
        jobPhaseId: this.phaseData.id,
        resourceId: this.nodeData.resourceId,
        operationId: operationId
      };
      this.$api.autoexec.job.getJobCustomdata(data).then(res => {
        if (res.Status == 'OK') {
          this.customTemplateData = res.Return || {};
          if ((this.nodeData && this.nodeData.status === 'running') || this.phaseData.status === 'running') {
            this.customTemplateTimmer = setTimeout(() => {
              this.getJobCustomdata(operationId);
            }, 3000);
          }
        }
      }).finally(() => {
        this.isCustomTemplateShow = false;
      });
    },
    changeTab(name) {
      if (this.customTemplateTimmer) {
        clearTimeout(this.customTemplateTimmer);
        this.customTemplateTimmer = null;
      }
      this.isCustomTemplateShow = true;
      if (name.includes('customTemplate')) {
        let operationId = parseInt(name.split('_')[1]);
        this.getJobCustomdata(operationId);
      }
    },
    getTabDetailClass() {
      if (this.mode === 'page') {
        if (this.$utils.isEmptyObj(this.jobData.extraInfo)) {
          return 'tab-detail';
        } else {
          return 'tab-detail-extra';
        }
      } else if (this.mode === 'dialog') {
        return 'tab-detail-dialog';
      }
    }
  },
  computed: {
    getStepIndexClass() {
      return function(step) {
        let arr = [];
        if (step.status == 'succeed') {
          arr.push('tsfont-check-o text-success');
        } else if (step.status == 'running') {
          arr.push('tsfont-play-o text-primary');
        } else if (step.status == 'failed') {
          arr.push('tsfont-close-o text-danger');
        } else {
          arr.push('tsfont-sla text-grey');
        }
        return arr;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.step-item {
  width: 212px;
  position: relative;

}
.page-tabs {
  /deep/ .ivu-tabs-bar {
    width: calc(100% - 280px);
  }
}
.divide-line {
  border-bottom: 1px solid;
}
.condition-border {
  position: relative;
  border: 1px solid;
}
.description-pl {
  padding-left: 18px;
}
.else-list-box:last-of-type {
  margin-bottom: 0;
}

.operation-items-focus{
  position: absolute;
  right: 20px;
  top: 0;
}
.operation-items{
  position: absolute;
  right: 3px;
  top: 0;
}

.fixed-icon {
    position: absolute;
    right: 3px;
    top: 0px;
  }

.tab-detail {
  height: calc(100vh - 56px - 56px - 56px - 15px);
  overflow-y: auto;
}

.tab-detail-dialog {
  height: calc(100vh - 56px - 56px - 45px);
  overflow-y: auto;
}

.tab-detail-extra {
  height: calc(100vh - 56px - 56px - 110px - 56px);
  overflow-y: auto;
}
</style>
