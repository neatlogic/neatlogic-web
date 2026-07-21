<template>
  <div>
    <draggable
      v-if="phaseOperationList && phaseOperationList.length"
      class="phaseOperationList"
      :class="'drag_' + dragStatus + ' edit_' + (canEdit && operationType=='combop')"
      tag="ul"
      forceFallback
      :list="list"
      handle=".item-sort"
      dragClass="hide-li"
      allbackOnBody
      :disabled="!(canEdit && operationType=='combop')"
      @start="changeDragStatus('start')"
      @end="changeDragStatus('end')"
    >
      <li v-for="(step, sindex) in list" :id="'id_' + combopConfig.combopUuid + '_' + step.uuid" :key="sindex+'_'+step.uuid">
        <div v-if="step.operation" class="inner-block radius-lg" :class="{'hide-li':dragStatus == 'start' || !phaseShowMap[step.uuid], 'show-li': phaseShowMap[step.uuid], 'bg-op': step.operationName != 'native/IF-Block' && step.operationName != 'native/LOOP-Block', 'border-base': step.operationName == 'native/IF-Block' || step.operationName == 'native/LOOP-Block'}">
          <div class="script-title border-color cursor-pointer" @click="toggleshow(step)">
            <div class="overflow">
              【{{ typeText(step.operationType) }}】
              <span class="text-action name" :title="step.operationName" @click.stop="gotoDateil(step)">{{ step.operationName }}</span>
              <RiskItem v-if="step.operation.riskVo" :text="step.operation.riskVo.name" :color="step.operation.riskVo.color"></RiskItem>
            </div>
            <div class="text-tip description overflow">
              <span v-if="step.description" :title="step.description">{{ step.description }}</span>
              <span v-else-if="!canEdit">-</span>
              <i v-if="canEdit" class="text-action edit-des tsfont-edit" @click.stop="editDescription(step)"></i>
            </div>
            <i v-if="canEdit && operationType=='combop'" class="item-sort tsfont-bar"></i>
            <i class="item-index text-tip">#{{ sindex+1 }}</i>
            <span class="item-actionIcon" @click.stop>
              <Tooltip
                v-if="isToolHelpVisible(step)"
                placement="top"
                :transfer="true"
                :content="$t('page.help')"
              >
                <i
                  class="item-help tsfont-question-o text-tip"
                  @click="openToolHelpDialog(step)"
                ></i>
              </Tooltip>
              <Tooltip
                v-if="canEdit && operationType=='combop'"
                placement="top"
                :transfer="true"
                :content="$t('page.copy')"
              >
                <i
                  class="item-copy tsfont-copy text-tip"
                  @click="copyScript(step)"
                ></i>
              </Tooltip>
              <Tooltip
                v-if="canEdit && operationType=='combop'"
                placement="top"
                :transfer="true"
                :content="$t('page.delete')"
              >
                <i
                  class="item-delete tsfont-close text-tip"
                  @click="deleteScript(step,sindex)"
                ></i>
              </Tooltip>
              <Tooltip
                placement="top"
                :transfer="true"
                :content="phaseShowMap[step.uuid] ? $t('page.packup') : $t('page.expand')"
              >
                <i
                  class="item-toggle tsfont text-tip"
                  @click="toggleshow(step)"
                ></i>
              </Tooltip>
            </span>
          </div>
          <item
            :is="geScriptType(step)"
            v-if="phaseShowMap[step.uuid]"
            :ref="'toolDetail'+step.uuid"
            :config="step"
            :canEdit="canEdit"
            :isFirst="getFirstStatus(stepIndex, sindex)"
            :prevList="getPrev(sindex, prevStepList)"
            :paramList="paramList"
            :paramsTypeList="paramsTypeList"
            :failPolicyOption="failPolicyOption"
            :inputTypeList="inputTypeList"
            :combopConfig="combopConfig"
            :prevStepList="prevStepList"
            :execMode="execMode"
            :operationType="operationType"
            @change="val=>{changeStep(val,step.uuid)}"
          ></item>
        </div>
        <div v-else class="inner-block radius-lg hide-li" :class="{'bg-op': step.operationName != 'native/IF-Block' && step.operationName != 'native/LOOP-Block', 'border-base': step.operationName == 'native/IF-Block'&& step.operationName != 'native/LOOP-Block'}">
          <div class="script-title border-color">
            <div class="overflow">
              【{{ typeText(step.operationType) }}】
              <span class="name" :title="step.operationName">{{ step.operationName }}</span>
            </div>
            <div class="text-error pt-xs">【{{ $t('term.autoexec.tooldeleted') }}】</div>
            <i v-if="canEdit && operationType=='combop'" class="item-sort tsfont-bar"></i>
            <i class="item-index text-tip">#{{ sindex+1 }}</i>
            <span class="item-actionIcon">
              <Tooltip
                v-if="canEdit && operationType=='combop'"
                placement="top"
                :transfer="true"
                :content="$t('page.delete')"
              >
                <i
                  class="item-delete tsfont-close text-tip"
                  @click="deleteScript(step,sindex)"
                ></i>
              </Tooltip>
            </span>
          </div>
        </div>
      </li>
    </draggable>
    <div v-else class="text-tip line-2">{{ $t('page.notarget', {target: $t('page.script')}) }}</div>
    <TsDialog
      :title="$t('term.autoexec.tooldescription')"
      type="modal"
      :isShow.sync="showDialog"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TsFormItem :label="$t('page.description')" labelWidth="80">
            <TsFormInput v-model="description" :maxlength="256" border="border"></TsFormInput>
          </TsFormItem>
        </div>
      </template>
    </TsDialog>
    <TsDialog
      v-if="isToolHelpShow && helpStep"
      :isShow.sync="isToolHelpShow"
      :title="$t('term.autoexec.toolhelptitle', {target: helpStep.operationName})"
      type="slider"
      width="large"
      @on-close="closeToolHelpDialog"
    >
      <template v-slot>
        <div class="tool-help-content">
          <Loading :loadingShow="helpLoading" type="fix"></Loading>
          <DocumentonlineContent
            v-if="onlineHelpContent"
            :content="onlineHelpContent"
          ></DocumentonlineContent>
          <template v-else-if="!helpLoading">
            <div class="tool-help-overview bg-op padding radius-lg mb-md">
              <div class="tool-help-overview-item">
                <div class="text-tip">{{ $t('page.description') }}</div>
                <div>{{ helpStep.description || helpOperation.description || '-' }}</div>
              </div>
              <div class="tool-help-overview-item">
                <div class="text-tip">{{ $t('page.executionmode') }}</div>
                <div>{{ helpOperation.execModeText || helpOperation.execMode || execMode || '-' }}</div>
              </div>
              <div class="tool-help-overview-item">
                <div class="text-tip">{{ $t('term.autoexec.risklevel') }}</div>
                <div>{{ helpRiskName }}</div>
              </div>
            </div>
            <div class="item-list">
              <div class="h4 pb-md">{{ $t('page.inputparam') }}</div>
              <div v-if="!helpInputParamList.length" class="text-tip">{{ $t('page.notarget', {target: $t('page.inputparam')}) }}</div>
              <ParamsReadonly
                v-for="(item, index) in helpInputParamList"
                :key="`help-input-${index}`"
                :typeList="paramsTypeList"
                :config="item"
              ></ParamsReadonly>
            </div>
            <div v-if="helpOperation.argument" class="item-list">
              <div class="h4 pb-md">{{ $t('term.autoexec.freeparameter') }}</div>
              <ParamsReadonly :typeList="paramsTypeList" :config="helpOperation.argument"></ParamsReadonly>
            </div>
            <div class="item-list">
              <div class="h4 pb-md">{{ $t('page.outputparam') }}</div>
              <div v-if="!helpOutputParamList.length" class="text-tip">{{ $t('page.notarget', {target: $t('page.outputparam')}) }}</div>
              <ParamsReadonly
                v-for="(item, index) in helpOutputParamList"
                :key="`help-output-${index}`"
                :config="item"
              ></ParamsReadonly>
            </div>
          </template>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="closeToolHelpDialog">{{ $t('page.close') }}</Button>
        <Button
          v-if="onlineHelpContent"
          :disabled="helpLoading"
          @click="downloadOnlineHelp"
        >{{ $t('term.autoexec.downloadtoolhelp') }}</Button>
        <Button
          v-else
          v-download="helpExportWord"
          v-download:prevent="helpLoading || downloadLoading"
          :loading="helpLoading || downloadLoading"
        >{{ $t('term.autoexec.downloadtoolhelp') }}</Button>
        <Button
          v-if="autoexecToolUsageAiAssistantComponent"
          type="primary"
          @click="openToolUsageAiFromHelp"
        >{{ $t('term.autoexec.toolusageaihelp') }}</Button>
      </template>
    </TsDialog>
    <component
      :is="autoexecToolUsageAiAssistantComponent"
      v-if="autoexecToolUsageAiAssistantComponent"
      ref="toolUsageAiAssistant"
    ></component>
  </div>
</template>
<script>
import draggable from 'vuedraggable';
import item from '@/views/pages/autoexec/components/script/item/index.js';
import RiskItem from '@/views/pages/autoexec/components/risk-item.vue';
import { storeScript, mutationsScript } from './script-state.js';
import ImportComponent from '@/views/components/import-component.js';
import ParamsReadonly from '@/views/pages/autoexec/components/param/params-readonly.vue';
import download from '@/resources/directives/download.js';
import { downloadBlobFile } from '@/resources/assets/js/downloadUtil.js';
export default {
  name: '',
  inject: {
    renderHeight: {
      default: () => {}
    }
  },
  components: {
    draggable,
    ...item,
    RiskItem,
    ParamsReadonly,
    DocumentonlineContent: () => import('@/views/pages/documentonline/document/documentonline-content.vue'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  filters: {},
  directives: { download },
  props: {
    canEdit: {
      //是否可以编辑 ，允许改变顺序、编辑修改、新增
      type: [Boolean],
      default: true
    },
    phaseOperationList: {
      //脚本列表
      type: [Array],
      default() {
        return [];
      }
    },
    prevStepList: {
      //前面的节点数据
      type: [Array]
    },
    combopConfig: {
      //当前阶段的数据
      type: [Object]
    },
    stepIndex: {
      type: [Number]
    },
    paramList: {
      type: Array,
      default() {
        return [];
      }
    },
    paramsTypeList: {
      type: Array,
      default() {
        return [];
      }
    },
    failPolicyOption: {
      type: Array,
      default() {
        return [];
      }
    },
    inputTypeList: {
      type: Array,
      default() {
        return [];
      }
    },
    execMode: String,
    operationType: {
      type: String,
      default: 'combop'
    },
    validPhaseOperationUuidList: {
      type: Array,
      default: () => {
        return [];
      }
    },
    parentPrevOperationList: { //父级上游工具列表
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    return {
      list: [],
      dragStatus: 'end', //标志拖拽状态，用于做拖拽时收起的效果
      isValid: true,
      showDialog: false,
      currentStep: null,
      description: '',
      isUpdateSort: false, //是否更新排序
      isToolHelpShow: false,
      helpStep: null,
      helpLoading: false,
      onlineHelpContent: '',
      downloadLoading: false,
      helpRequestId: 0
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    this.helpRequestId += 1;
  },
  destroyed() {},
  methods: {
    changeDragStatus(type) {
      this.dragStatus = type;
      if (type == 'end') {
        this.updatedSort();
        this.checkParamMappings();
      }
    },
    checkParamMappings() { //检查参数映射是否正确
      this.isUpdateSort = false;
      let list = this.$utils.deepClone(this.list);
      list.forEach((item, index) => {
        // 检查当前步骤的参数映射
        if (item.config && item.config.paramMappingList && item.config.paramMappingList.length) {
          let prevOutputList = this.getPrev(index, this.prevStepList);
          item.config.paramMappingList.forEach(param => {
            // 检查引用前序节点输出参数的映射
            if (param.mappingMode == 'prenodeoutputparam' || param.mappingMode == 'prenodeoutputparamkey') {
              if (!this.$utils.isEmpty(param.value) && Array.isArray(param.value)) {
                // 检查参数值是否在前置输出列表中
                const key = `${param.value[0]}_${param.value[1]}_${param.value[2]}`;
                let isParamValid = prevOutputList.some(output => {
                  return `${output.combopUuid}_${output.operationUuid}_${output.key}` === key;
                });
                if (!isParamValid) {
                  // 参数映射无效，设置标记或进行其他处理
                  this.$set(param, 'mappingMode', '');
                  this.$set(param, 'value', null);
                }
              }
            }
          });
        }
      });
      if (!this.$utils.isSame(list, this.list)) { //发生改变时更新列表
        this.list = list;
      }
    },
    updatedSort() {
      this.isUpdateSort = true;
      let list = this.$utils.deepClone(this.list);
      list.forEach((item, index) => {
        this.$set(item, 'sort', index);
      });
      if (!this.$utils.isSame(list, this.list)) {
        this.list = list;
      }
    },
    toggleshow(item) {
      mutationsScript.setCombopPhaseShowMap(item.uuid);
      this.renderHeight && this.renderHeight();
    },
    deleteScript(item, index) {
      this.$createDialog({
        title: this.$t('page.warning'),
        content: this.$t('dialog.content.deletetargetconfirm', {target: item.operationName}),
        btnType: 'error',
        'on-ok': vnode => {
          vnode.isShow = false;
          this.$nextTick(() => {
            this.list.splice(index, 1);
            this.updatedSort();
            this.$Message.success(this.$t('message.deletesuccess'));
          });
        }
      });
    },
    copyScript(item) {
      let newitem = this.$utils.deepClone(item);
      let prevlength = this.list.filter(p => { return p.operationId == newitem.operationId; });
      this.$delete(newitem, 'id');
      Object.assign(newitem, {
        uuid: this.$utils.setUuid(),
        letter: prevlength.length ? this.$utils.translateNumber(parseInt(prevlength.length), 'en') : null
      });
      this.updateCopyUuid(newitem);
      this.list.push(newitem);
      this.updatedSort();
      this.$forceUpdate();
    },
    updateCopyUuid(item) { //更新复制的脚本的uuid
      if (item.config) {
        if (!this.$utils.isEmpty(item.config.ifList)) {
          this.updatePhaseOperationUuidList(item.config.ifList);
        }
        if (!this.$utils.isEmpty(item.config.elseList)) {
          this.updatePhaseOperationUuidList(item.config.elseList);
        }
        if (!this.$utils.isEmpty(item.config.operations)) {
          this.updatePhaseOperationUuidList(item.config.operations);
        }
      }
    },
    updatePhaseOperationUuidList(phaseOperationList) {
      phaseOperationList.forEach(p => {
        this.$delete(p, 'id');
        this.$set(p, 'uuid', this.$utils.setUuid());
        if (!this.$utils.isEmpty(p.config.paramMappingList)) {
          p.config.paramMappingList.forEach(param => {
            if (param.mappingMode == 'prenodeoutputparam' || param.mappingMode == 'prenodeoutputparamkey') {
              this.$set(param, 'value', null);
            }
          });
        }
        if (p.config) {
          if (!this.$utils.isEmpty(p.config.ifList)) {
            this.updatePhaseOperationUuidList(p.config.ifList);
          }
          if (!this.$utils.isEmpty(p.config.elseList)) {
            this.updatePhaseOperationUuidList(p.config.elseList);
          }
          if (!this.$utils.isEmpty(p.config.operations)) {
            this.updatePhaseOperationUuidList(p.config.operations);
          }
        }
      });
    },
    updateList(list) {
      this.list = list.map((v, vindex) => {
        return {
          ...v,
          uuid: v.uuid || this.$utils.setUuid(),
          sort: vindex
        };
      });
      this.$forceUpdate();
    },
    valid() {
      this.isValid = true;
      //预置参数集
      if (this.$el.querySelectorAll('.profile-param').length) {
        if (this.validStep('.profile-param')) {
          this.isValid = false;
        }
      }
      //inputParam,输入参数
      if (this.$el.querySelectorAll('.input-param').length) {
        this.isValid = this.validStep('.input-param');
      }
      //自由参数
      if (this.$el.querySelectorAll('.argument-param').length) {
        if (this.validStep('.argument-param')) {
          this.isValid = false;
        }
      }
      //条件
      if (this.$el.querySelectorAll('.condition-param').length) {
        if (this.validStep('.condition-param')) {
          this.isValid = false;
        }
      }
      if (this.$el.querySelectorAll('.condition-tool-param').length) {
        if (this.validStep('.condition-tool-param')) {
          this.isValid = false;
        }
      }
      return this.isValid;
    },
    changeStep(config, id) {
      this.isUpdateSort = false;
      this.list.forEach(l => {
        if (l.uuid == id) {
          Object.assign(l, config);
        }
      });
    },
    gotoDateil(item) {
      if (item.operationType == 'script') {
        this.$router.push({
          path: '/script-detail',
          query: {
            scriptId: item.operationId
          }
        });
      } else if (item.operationType == 'tool') {
        this.$router.push({
          path: '/tool-detail',
          query: {
            id: item.operationId
          }
        });
      }
    },
    isToolHelpVisible(step) {
      return !!(
        this.operationType == 'combop' &&
        step &&
        step.operation &&
        step.operationType == 'tool' &&
        step.operationName != 'native/IF-Block' &&
        step.operationName != 'native/LOOP-Block'
      );
    },
    openToolHelpDialog(step) {
      this.helpStep = step;
      this.onlineHelpContent = '';
      this.isToolHelpShow = true;
      this.loadOnlineToolHelp();
    },
    closeToolHelpDialog() {
      this.helpRequestId += 1;
      this.helpLoading = false;
      this.isToolHelpShow = false;
      this.helpStep = null;
      this.onlineHelpContent = '';
    },
    async loadOnlineToolHelp() {
      // 商业在线文档按完整工具路径精确匹配，失败时展示工具自身的结构化帮助。
      const toolName = this.helpStep && this.helpStep.operationName;
      if (!toolName) {
        return;
      }
      const requestId = ++this.helpRequestId;
      const toolNameList = toolName.split('/');
      const keyword = toolNameList[toolNameList.length - 1];
      const silentRequestConfig = {headers: {unConsole: 1}};
      this.helpLoading = true;
      try {
        const searchRes = await this.$api.documentonline.searchDocument({keyword: keyword, pageSize: 100}, silentRequestConfig);
        const documentList = searchRes.Status === 'OK' && searchRes.Return ? searchRes.Return.tbodyList || [] : [];
        const expectedPathSuffix = `/${toolName}.md`;
        const document = documentList.find(item => item.filePath && item.filePath.endsWith(expectedPathSuffix));
        if (!document) {
          return;
        }
        const detailRes = await this.$api.documentonline.getDocumentDetail({filePath: document.filePath}, silentRequestConfig);
        if (requestId === this.helpRequestId && detailRes.Status === 'OK' && detailRes.Return && detailRes.Return.content) {
          this.onlineHelpContent = detailRes.Return.content;
        }
      } catch (error) {
        // 在线文档是可选能力，异常时不阻断工具帮助和 AI 辅助入口。
      } finally {
        if (requestId === this.helpRequestId) {
          this.helpLoading = false;
        }
      }
    },
    downloadOnlineHelp() {
      if (!this.onlineHelpContent || !this.helpStep) {
        return;
      }
      const toolNameList = this.helpStep.operationName.split('/');
      const fileName = toolNameList[toolNameList.length - 1] || 'tool';
      downloadBlobFile(this.onlineHelpContent, {
        defaultFileName: `[${fileName}]帮助.md`,
        type: 'text/markdown;charset=utf-8'
      });
    },
    openToolUsageAiFromHelp() {
      const step = this.helpStep;
      const documentContent = this.onlineHelpContent;
      this.closeToolHelpDialog();
      this.$nextTick(() => {
        this.openToolUsageAiAssistant(step, documentContent);
      });
    },
    openToolUsageAiAssistant(step, documentContent = '') {
      const assistant = this.$refs.toolUsageAiAssistant;
      if (!step || !assistant || !assistant.openDialog) {
        return;
      }
      assistant.openDialog({
        toolContext: this.buildToolUsageContext(step),
        documentContent: documentContent
      });
    },
    buildToolUsageContext(step) {
      // 这里只收集当前工具卡片上下文，避免助手被误用成组合工具整体评估入口。
      const operation = step.operation || {};
      const config = step.config || {};
      return {
        phaseName: this.combopConfig && this.combopConfig.combopName,
        combopId: this.combopConfig && this.combopConfig.combopId,
        combopUuid: this.combopConfig && this.combopConfig.combopUuid,
        operationId: step.operationId,
        operationType: step.operationType,
        operationName: step.operationName,
        operationUuid: step.uuid,
        operationLetter: step.letter || null,
        description: step.description || operation.description || '',
        riskVo: operation.riskVo || null,
        failPolicy: step.failPolicy,
        execMode: this.execMode,
        profileId: config.profileId || null,
        inputParamList: operation.inputParamList || [],
        argument: operation.argument || null,
        outputParamList: operation.outputParamList || [],
        paramMappingList: config.paramMappingList || [],
        argumentMappingList: config.argumentMappingList || []
      };
    },
    validStep(className) { //校验阶段(包括：输入参数，自由参数，预置参数集)
      let isValid = true;
      if (this.$el.querySelectorAll(className).length) {
        let childrendom = this.$el.querySelectorAll(className);
        if (childrendom && childrendom.length > 0) {
          childrendom.forEach(children => {
            if (children.__vue__ && children.__vue__.valid) {
              if (!children.__vue__.valid()) {
                this.setShowStep(children.__vue__.$options.parent);
                isValid = false;
              }
            }
          });
        }
        return isValid;
      }
    },
    setShowStep(parent) { //设置父级的显示
      if (parent) {
        if (parent.step) {
          mutationsScript.setCombopPhaseShowMap(parent.step.uuid, true);
        } else {
          if (parent.$options.parent) {
            this.setShowStep(parent.$options.parent);
          }
        }
      }
    },
    refreshProfile() {
      if (this.phaseOperationList && this.phaseOperationList.length) {
        this.phaseOperationList.forEach(item => {
          if (item.config && item.config.profileId) {
            this.$refs['toolDetail' + item.uuid] && this.$refs['toolDetail' + item.uuid][0].refreshProfile(item.config.profileId);
          }
        });
      }
    },
    editDescription(step) {
      this.currentStep = step;
      this.description = step.description;
      this.showDialog = true;
    },
    okDialog() {
      this.isUpdateSort = false;
      this.list.forEach(item => {
        if (item.uuid === this.currentStep.uuid) {
          this.$set(item, 'description', this.description);
        }
      });
      this.closeDialog();
    },
    closeDialog() {
      this.currentStep = null;
      this.description = '';
      this.showDialog = false;
    },
    getPrevOperation(list) {
      let operationList = [];
      list.forEach(item => {
        operationList.push(item);
        if (item.config && !this.$utils.isEmpty(item.config.ifList)) {
          operationList.push(...this.getPrevOperation(item.config.ifList));
        } 
        if (item.config && !this.$utils.isEmpty(item.config.elseList)) {
          operationList.push(...this.getPrevOperation(item.config.elseList));
        } 
        if (item.config && !this.$utils.isEmpty(item.config.operations)) {
          operationList.push(...this.getPrevOperation(item.config.operations));
        }
      });
      return operationList;
    }
  },
  computed: {
    autoexecToolUsageAiAssistantComponent() {
      return ImportComponent && ImportComponent.autoexecToolUsageAiAssistant ? ImportComponent.autoexecToolUsageAiAssistant : null;
    },
    helpOperation() {
      return this.helpStep && this.helpStep.operation ? this.helpStep.operation : {};
    },
    helpRiskName() {
      const riskVo = this.helpOperation.riskVo || {};
      return riskVo.name || this.helpOperation.riskName || '-';
    },
    helpInputParamList() {
      return this.helpOperation.inputParamList || [];
    },
    helpOutputParamList() {
      return this.helpOperation.outputParamList || [];
    },
    helpExportWord() {
      return {
        url: '/api/binary/autoexec/tool/param/export',
        method: 'post',
        params: {toolId: this.helpStep && this.helpStep.operationId, isAll: 0},
        changeStatus: status => {
          if (status === 'start') {
            this.downloadLoading = true;
          } else if (status === 'success' || status === 'error') {
            this.downloadLoading = false;
          }
        }
      };
    },
    phaseShowMap() {
      return storeScript.phaseShowMap || {};
    },
    getPrev() {
      return function(index, prevStepList) {
        let list = [];
        let newList = [];
        if (!this.$utils.isEmpty(this.parentPrevOperationList)) {
          list.push(...this.parentPrevOperationList);
        }
        //当前阶段的前面的所有输出参数
        if (prevStepList && prevStepList.length) {
          list.push(...prevStepList);
        }
        //同一个阶段的前面的脚本
        newList = this.list.filter((l, lindex) => {
          return lindex < index;
        });
        newList = this.getPrevOperation(newList);
        newList.forEach(n => {
          if (n.operation && n.operation.outputParamList && n.operation.outputParamList.length) {
            let item = n.operation.outputParamList;
            item.forEach(i => {
              list.push({
                ...i,
                ...this.combopConfig,
                operationId: n.operationId,
                operationName: n.operationName,
                operationUuid: n.uuid,
                operationLetter: n.letter || null,
                operationDes: n.description
              });
            });
          }
        });
        return list;
      };
    },
    getFirstStatus() {
      return function(stepIndex, scriptIndex) {
        //判断当前脚本是否第一个阶段的第一个脚本或者父级工具不存在上游工具，此时没有选择上游输出参数的选项
        return !stepIndex && !scriptIndex && this.$utils.isEmpty(this.parentPrevOperationList);
      };
    },
    typeText() {
      return type => {
        let text = this.$t('term.autoexec.toollibrary');
        if (type == 'script') {
          text = this.$t('page.custom');
        } else if (type == 'tool') {
          text = this.$t('term.autoexec.toollibrary');
        }
        return text;
      };
    },
    geScriptType() {
      return (step) => {
        let type = 'common';
        if (step.operationName == 'native/IF-Block') {
          type = 'ConditionTool';
        } else if (step.operationName == 'native/LOOP-Block') {
          type = 'LoopBlock';
        }
        return type;
      };
    }
  },
  watch: {
    phaseOperationList: {
      handler(val) {
        //判断是否相等
        if (val && !this.$utils.isSame(val, this.list)) {
          this.list = val.map((v, vindex) => {
            if (v.config) {
              if (v.operationName != 'native/IF-Block' && v.operationName != 'native/LOOP-Block') {
                this.$set(v.config, 'profileId', v.config.profileId || null);
              }
            }
            return {
              ...v,
              uuid: v.uuid || this.$utils.setUuid()
            };
          });
          this.updatedSort();
        }
      },
      deep: true,
      immediate: true
    },
    list: {
      handler(val) {
        if (this.canEdit) {
          this.$emit('sortList', val, this.isUpdateSort);
        }
      },
      deep: true
    },
    validPhaseOperationUuidList: {
      handler(val) {
        if (!this.$utils.isEmpty(val)) {
          val.forEach(item => {
            mutationsScript.setCombopPhaseShowMap(item, true);
          });
        }
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.phaseOperationList {
  > li {
    padding: 0 0 10px;
    // &:last-of-type{
    //   padding-bottom: 0px;
    // }
    .inner-block {
      padding: 16px 16px 10px;
      .script-title {
        width: 100%;
        padding-left: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid;
        .item-actionIcon{
          position: absolute;
          top: 0;
          right: 0;
          opacity: 0;
        }
        .item-index{
          position: absolute;
          top: 2px;
          left: 0;
          font-style: normal;
          font-size: 80%;
        }
        .item-toggle{
          cursor: pointer;
          width: 16px;
          display: inline-block;
          &:before {
            content: '\e9d5'; // tsfont-up
          }
        }
      }
      ::v-deep .script-detail {
        padding: 0 16px;
        .failPolicy-item{
          .ivu-radio-wrapper:not(:last-of-type){
            margin-right: 30px;
          }
        }
      }
      &:hover{
        .item-actionIcon{
          opacity: 1;
        }
      }
    }
  }

  &.drag_start li .show-li,
  li .hide-li {
    &.inner-block {
      .item-toggle {
        &:before {
          content: '\e892'; // tsfont-down
        }
      }
      .script-title {
        border-color: transparent !important;
        padding-bottom: 6px;
      }
      ::v-deep .script-detail {
        display: none;
      }
    }
  }
  &.edit_true{
    .script-title{
      .item-sort{
        position: absolute;
        top: 2px;
        left: 0;
        cursor: move;
        width: 16px;
        opacity: 0;
      }
      .item-index{
        cursor: move;
      }

    }
    >li:hover{
      .item-sort{
        opacity: 1 !important;
      }
      .item-index{
        display: none;
      }
    }
  }
}
::v-deep .list-title {
  margin: 16px 0;
}
.script-title {
  display: block;
  text-align: left;
  position: relative;
  padding-right: 64px;
  &:before{
    margin-right: 4px;
    font-size: 120%;
  }
  .item-delete,.item-copy,.item-help{
    cursor: pointer;
    width: 16px;
    text-align: center;
    margin-right: 8px;
    display: inline-block;
    // opacity: 0;
  }
  .name{
    padding-right: 10px;
    // font-weight: 550;
  }
  .description{
    position: relative;
    max-width: 100%;
    padding-top: 6px;
    padding-left: 6px;
    font-size: 12px;
    display: inline-block;
    padding-right: 20px;
    min-height: 24px;
    .edit-des{
      position: absolute;
      right: 0;
    }
  }
}
.tool-help-content {
  min-height: 300px;
  position: relative;

  .item-list {
    padding-bottom: 16px;
  }
}
.tool-help-overview {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  .tool-help-overview-item {
    > div:last-child {
      padding-top: 6px;
      word-break: break-word;
    }
  }
}
</style>
