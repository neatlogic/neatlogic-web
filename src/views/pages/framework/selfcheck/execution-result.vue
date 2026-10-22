<template>
  <div>
    <div v-if="!stepMode" class="grid mb-md">
      <div>
        <span class="text-grey mr-xs">{{ $t('page.status') }}</span>
        <span :class="getStatusClass(result.status)">{{ getStatusText(result.status) }}</span>
      </div>
      <div>
        <span class="text-grey mr-xs">{{ $t('term.framework.selfcheck.duration') }}</span>
        <span>{{ result.durationMs == null ? '-' : result.durationMs + ' ms' }}</span>
      </div>
      <div v-if="result.cleanupStatus">
        <span class="text-grey mr-xs">{{ $t('term.framework.selfcheck.cleanupstatus') }}</span>
        <span :class="getStatusClass(result.cleanupStatus)">{{ getStatusText(result.cleanupStatus) }}</span>
      </div>
    </div>
    <div v-if="hasTruncatedData" class="text-warning tsfont-warning-s mb-md">
      {{ $t('term.framework.selfcheck.datatruncated') }}
    </div>
    <div v-if="stepMode && phaseList.length" class="bg-grey padding-sm mb-md text-word-break">
      <div class="execution-phase-list">
        <div v-for="(phase, index) in phaseList" :key="index" class="mr-lg">
          <span class="text-bold mr-xs">{{ getPhaseText(phase.phase) }}</span>
          <span :class="getStatusClass(phase.status)" class="mr-xs">{{ getStatusText(phase.status) }}</span>
          <span class="text-grey">{{ phase.durationMs == null ? '-' : phase.durationMs + ' ms' }}</span>
        </div>
      </div>
      <template v-for="(phase, index) in phaseList">
        <div v-if="phase.message || phase.errorType || phase.traceId" :key="'detail-' + index" class="mt-sm">
          <span class="text-grey mr-xs">{{ getPhaseText(phase.phase) }}</span>
          <span v-if="phase.message" :class="phase.status === 'FAILED' ? 'text-error' : ''">{{ phase.message }}</span>
          <div v-if="phase.errorType" class="text-grey mt-xs">
            <span class="mr-xs">{{ $t('term.framework.selfcheck.errortype') }}</span>{{ phase.errorType }}
          </div>
          <div v-if="phase.traceId" class="text-grey mt-xs">Trace ID: {{ phase.traceId }}</div>
        </div>
      </template>
    </div>
    <TsTable
      v-else-if="phaseList.length"
      :theadList="phaseTheadList"
      :tbodyList="phaseList"
      :hideAction="true"
      class="mb-md"
    >
      <template v-slot:status="{ row }">
        <span :class="getStatusClass(row.status)">{{ getStatusText(row.status) }}</span>
      </template>
      <template v-slot:durationMs="{ row }">
        <span>{{ row.durationMs == null ? '-' : row.durationMs + ' ms' }}</span>
      </template>
      <template v-slot:message="{ row }">
        <span :class="row.status === 'FAILED' ? 'text-error' : ''">{{ row.message || '-' }}</span>
      </template>
    </TsTable>
    <Tabs v-model="currentTab" :animated="false">
      <TabPane :label="$t('page.request')" name="request">
        <TsMonacoEditor
          v-if="!stepMode || currentTab === 'request'"
          :value="formatJson(result.requestSnapshot)"
          codeMode="json"
          height="260px"
          :isReadOnly="true"
          :isCopy="true"
          :modelUri="modelUri('request')"
        ></TsMonacoEditor>
      </TabPane>
      <TabPane :label="$t('term.framework.selfcheck.responseverdict')" name="response">
        <div class="mb-md text-word-break">
          <span class="text-grey mr-xs">{{ $t('term.framework.selfcheck.scriptresult') }}</span>
          <span v-if="scriptReturnNotice" class="text-grey">{{ $t(scriptReturnNotice) }}</span>
          <code v-else>{{ formatJson(result.scriptResult) }}</code>
        </div>
        <div class="text-grey mb-xs">context.response</div>
        <TsMonacoEditor
          v-if="!stepMode || currentTab === 'response'"
          :value="formatJson(result.responseSnapshot)"
          codeMode="json"
          height="260px"
          :isReadOnly="true"
          :isCopy="true"
          :modelUri="modelUri('response')"
        ></TsMonacoEditor>
      </TabPane>
      <TabPane :label="$t('term.framework.selfcheck.console')" name="console">
        <TsTable
          :theadList="consoleTheadList"
          :tbodyList="consoleLogList"
          :hideAction="true"
        ></TsTable>
      </TabPane>
      <TabPane :label="$t('term.framework.selfcheck.script')" name="script">
        <TsMonacoEditor
          v-if="!stepMode || currentTab === 'script'"
          ref="scriptEditor"
          :value="result.verifyScript || ''"
          codeMode="selfcheck-javascript"
          height="320px"
          :isReadOnly="true"
          :isCopy="true"
          :modelUri="modelUri('script')"
          :languageExtension="scriptLanguageExtension"
          :markerList="diagnosticList"
          markerOwner="selfcheck-result"
          @ready="revealPendingDiagnostic"
        ></TsMonacoEditor>
        <ul v-if="diagnosticList.length" class="mt-md">
          <li
            v-for="(diagnostic, index) in diagnosticList"
            :key="index"
            class="text-error text-href mb-xs"
            @click="revealDiagnostic(diagnostic)"
          >
            <span>{{ getDiagnosticText(diagnostic) }}</span>
            <div v-if="diagnostic.sourceSnippet" class="text-grey mt-xs">
              <code>{{ diagnostic.sourceSnippet }}</code>
            </div>
          </li>
        </ul>
      </TabPane>
    </Tabs>
  </div>
</template>
<script>
import { createSelfCheckLanguageExtension } from './selfcheck-language-extension.js';

export default {
  name: 'SelfCheckExecutionResult',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsMonacoEditor: () => import('@/resources/plugins/TsMonacoEditor/TsMonacoEditor.vue')
  },
  props: {
    result: { type: Object, default: () => ({}) },
    stepMode: { type: Boolean, default: false }
  },
  data() {
    return {
      // 诊断优先定位脚本，断言失败优先对照判定依据，其余结果从请求开始查看。
      currentTab: (this.result.diagnosticList || []).length ? 'script' : (this.result.status === 'ASSERT_FAILED' ? 'response' : 'request'),
      pendingDiagnostic: null,
      phaseTheadList: [
        { key: 'phase', title: this.$t('term.framework.selfcheck.phase') },
        { key: 'status', title: this.$t('page.status') },
        { key: 'durationMs', title: this.$t('term.framework.selfcheck.duration') },
        { key: 'errorType', title: this.$t('term.framework.selfcheck.errortype') },
        { key: 'message', title: this.$t('page.message') },
        { key: 'traceId', title: 'Trace ID' }
      ],
      consoleTheadList: [
        { key: 'level', title: this.$t('term.framework.selfcheck.loglevel') },
        { key: 'message', title: this.$t('page.content') }
      ]
    };
  },
  methods: {
    /** 使用已知阶段的翻译，未知阶段保留后端标识，避免丢失执行信息。 */
    getPhaseText(phase) {
      const knownPhaseList = ['SCRIPT_COMPILE', 'TARGET_EXECUTE', 'SCRIPT_EXECUTE', 'CLEANUP', 'ORCHESTRATE'];
      if (knownPhaseList.includes(phase)) {
        return this.$t(`term.framework.selfcheck.phaseLabels.${phase.toLowerCase()}`);
      }
      return phase || '-';
    },
    modelUri(type) {
      return `inmemory://selfcheck/result/${this.result.id || 'test'}/${type}`;
    },
    formatJson(value) {
      if (value == null || value === '') {
        return '';
      }
      if (typeof value === 'string') {
        try {
          return JSON.stringify(JSON.parse(value), null, 2);
        } catch (error) {
          return value;
        }
      }
      return JSON.stringify(value, null, 2);
    },
    getStatusText(status) {
      return this.$t(`term.framework.selfcheck.status.${String(status || 'UNKNOWN').toLowerCase()}`);
    },
    getStatusClass(status) {
      if (status === 'SUCCEED' || status === 'SUCCESS') {
        return 'text-success';
      }
      if (status === 'PENDING' || status === 'RUNNING') {
        return 'text-warning';
      }
      if (!status || status === 'NOT_REQUIRED') {
        return 'text-grey';
      }
      return 'text-error';
    },
    getDiagnosticText(diagnostic) {
      const line = diagnostic.startLine || diagnostic.line || 1;
      const column = diagnostic.startColumn || diagnostic.column || 1;
      return `${line}:${column} ${diagnostic.errorType || ''} ${diagnostic.message || ''}`;
    },
    /** 切换到脚本并保留待定位诊断，兼容步骤模式下编辑器的延迟挂载。 */
    revealDiagnostic(diagnostic) {
      this.pendingDiagnostic = diagnostic;
      this.currentTab = 'script';
      this.$nextTick(this.revealPendingDiagnostic);
    },
    /** 编辑器异步初始化后再定位，避免加载期间点击诊断丢失位置。 */
    revealPendingDiagnostic() {
      const editor = this.$refs.scriptEditor;
      if (this.pendingDiagnostic && editor && editor.editor) {
        editor.revealMarker(this.pendingDiagnostic);
        this.pendingDiagnostic = null;
      }
    }
  },
  computed: {
    /** 只使用真实阶段记录判断脚本是否执行，不从总状态补造阶段。 */
    scriptExecutionPhase() {
      return this.phaseList.find(phase => phase.phase === 'SCRIPT_EXECUTE');
    },
    /** 返回 false、0 或历史对象均为已有快照，不能按真假值判断是否存在。 */
    hasScriptReturnValue() {
      return this.result.scriptResult != null && this.result.scriptResult !== '';
    },
    /** 异常时后端保存的 false 并非真实 return，需结合阶段状态展示缺失原因。 */
    scriptReturnNotice() {
      if (this.scriptExecutionPhase) {
        const returnStatusList = ['SUCCEED', 'SUCCESS', 'ASSERT_FAILED'];
        if (returnStatusList.includes(this.scriptExecutionPhase.status) && this.hasScriptReturnValue) {
          return '';
        }
        return 'term.framework.selfcheck.scriptnoreturn';
      }
      if (this.phaseList.length) {
        return 'term.framework.selfcheck.scriptnotexecuted';
      }
      // 历史记录即使缺少阶段，也不能把明确的脚本异常标记显示为真实返回值。
      if (['SCRIPT_RUNTIME_ERROR', 'SCRIPT_RESULT_ERROR', 'SCRIPT_TIMEOUT'].includes(this.result.status)) {
        return 'term.framework.selfcheck.scriptnoreturn';
      }
      if (['SCRIPT_SYNTAX_ERROR', 'TARGET_ERROR', 'TARGET_TIMEOUT'].includes(this.result.status)) {
        return 'term.framework.selfcheck.scriptnotexecuted';
      }
      // 旧记录缺少阶段列表时保留原始结果，不推断脚本一定未执行。
      if (this.hasScriptReturnValue) {
        return '';
      }
      return 'term.framework.selfcheck.scriptnoreturn';
    },
    phaseList() {
      return this.result.phaseList || [];
    },
    consoleLogList() {
      return (this.result.consoleLogList || []).map(item => {
        if (typeof item === 'string') {
          return { level: 'log', message: item };
        }
        return item;
      });
    },
    diagnosticList() {
      return this.result.diagnosticList || [];
    },
    hasTruncatedData() {
      return (this.result.truncatedFieldList || []).length > 0 ||
        this.result.requestTruncated === true ||
        this.result.responseTruncated === true ||
        this.result.scriptResultTruncated === true ||
        this.result.consoleTruncated === true;
    },
    scriptLanguageExtension() {
      return createSelfCheckLanguageExtension(null, key => this.$t(key));
    }
  }
};
</script>
<style scoped lang="less">
.execution-phase-list {
  display: flex;
  flex-wrap: wrap;
}
</style>
