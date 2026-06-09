<template>
  <TsDialog
    v-bind="dialogConfig"
    @on-close="closeDialog"
  >
    <template v-slot>
      <Loading :loadingShow="isLoading" type="fix"></Loading>
      <div class="ai-assistant-dialog">
        <div v-if="configChecked && !isConfigActive" class="section">
          <div class="bg-warning-grey radius-sm padding-sm">
            <span class="tsfont-warning-o text-warning btn-icon"></span>
            <span>自动化脚本AI助手未启用或未完成模型/RAG配置。</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">需求</div>
          <textarea
            v-model="requirement"
            class="requirement-input radius-sm border-color bg-op"
            placeholder="描述你想生成或修改的自定义脚本，例如采集字段、输出结构、异常处理要求、需要使用的内置工具。"
          ></textarea>
          <div class="action-group mt-sm">
            <span
              class="action-item tsfont-ai"
              :class="{ disable: isGenerating || !isConfigActive }"
              @click="startTask"
            >生成建议</span>
            <span
              v-if="taskId"
              class="text-tip"
            >任务：{{ taskId }} {{ taskData.status ? '(' + taskData.status + ')' : '' }}</span>
          </div>
        </div>

        <div v-if="summaryText" class="section">
          <div class="section-title">摘要</div>
          <div>{{ summaryText }}</div>
        </div>

        <div v-if="generatedScript" class="section">
          <div class="section-title section-title-with-action">
            <span>脚本</span>
            <span class="action-item tsfont-plus" @click="applyScript(generatedScript)">替换到编辑器</span>
          </div>
          <TsCodemirror
            v-model="generatedScript"
            mode="text"
            :disabled="true"
          ></TsCodemirror>
        </div>

        <div v-if="specText" class="section">
          <div class="section-title">脚本规格</div>
          <TsCodemirror
            v-model="specText"
            mode="json"
            :disabled="true"
          ></TsCodemirror>
        </div>

        <div v-if="outputContractText" class="section">
          <div class="section-title">输出契约</div>
          <TsCodemirror
            v-model="outputContractText"
            mode="json"
            :disabled="true"
          ></TsCodemirror>
        </div>

        <div v-if="dictionaryText" class="section">
          <div class="section-title section-title-with-action">
            <span>字典片段</span>
            <span
              v-clipboard="dictionaryText"
              v-clipboard:success="clipboardSuccess"
              class="action-item tsfont-copy"
            >复制</span>
          </div>
          <TsCodemirror
            v-model="dictionaryText"
            mode="json"
            :disabled="true"
          ></TsCodemirror>
        </div>

        <div v-if="validationCommands.length" class="section">
          <div class="section-title">校验命令</div>
          <ul class="plain-list">
            <li v-for="(item,index) in validationCommands" :key="index">
              <span class="code-text">{{ item }}</span>
            </li>
          </ul>
        </div>

        <div v-if="riskList.length || warningList.length || issueList.length" class="section">
          <div class="section-title">风险与问题</div>
          <ul class="plain-list">
            <li v-for="(item,index) in riskList" :key="'risk-' + index">{{ item }}</li>
            <li v-for="(item,index) in warningList" :key="'warning-' + index">{{ item }}</li>
            <li v-for="(item,index) in issueList" :key="'issue-' + index">{{ item }}</li>
          </ul>
          <div v-if="suggestion" class="mt-xs">{{ suggestion }}</div>
        </div>

        <div v-if="evidenceText" class="section">
          <div class="section-title">依据</div>
          <TsCodemirror
            v-model="evidenceText"
            mode="json"
            :disabled="true"
          ></TsCodemirror>
        </div>
      </div>
    </template>
  </TsDialog>
</template>
<script>
import clipboard from '@/resources/directives/clipboard.js';
export default {
  name: 'AiAssistantDialog',
  components: {
    TsCodemirror: () => import('@/resources/plugins/TsCodemirror/TsCodemirror')
  },
  directives: { clipboard },
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    context: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      isLoading: false,
      isGenerating: false,
      configChecked: false,
      isConfigActive: true,
      requirement: '',
      taskId: null,
      taskData: {},
      output: {},
      pollTimer: null,
      dialogConfig: {
        title: 'AI助手',
        type: 'slider',
        width: 'large',
        isShow: this.isShow,
        hasFooter: false
      }
    };
  },
  beforeDestroy() {
    this.clearPollTimer();
  },
  methods: {
    closeDialog() {
      this.clearPollTimer();
      this.$emit('update:isShow', false);
    },
    resetData() {
      this.clearPollTimer();
      this.isLoading = false;
      this.isGenerating = false;
      this.taskId = null;
      this.taskData = {};
      this.output = {};
    },
    loadConfig() {
      this.configChecked = false;
      this.$api.autoexec.script.getAiAssistantConfig().then(res => {
        if (res.Status == 'OK') {
          let config = res.Return || {};
          this.isConfigActive = config.isActive == 1;
        }
      }).finally(() => {
        this.configChecked = true;
      });
    },
    startTask() {
      if (this.isGenerating || !this.isConfigActive) {
        return;
      }
      if (!this.requirement || !this.requirement.trim()) {
        this.$Message.warning('请输入需求');
        return;
      }
      this.resetData();
      this.isLoading = true;
      this.isGenerating = true;
      const params = {
        text: this.requirement.trim(),
        form: {
          scriptContext: this.context || {}
        }
      };
      this.$api.autoexec.script.startAiAssistantTask(params).then(res => {
        if (res.Status == 'OK') {
          const result = res.Return || {};
          this.taskId = result.taskId;
          if (this.taskId) {
            this.getTask();
          }
        }
      }).finally(() => {
        this.isLoading = false;
      });
    },
    getTask() {
      if (!this.taskId) {
        return;
      }
      this.$api.autoexec.script.getAiAssistantTask({ id: this.taskId }).then(res => {
        if (res.Status == 'OK') {
          this.taskData = res.Return || {};
          this.output = this.taskData.output || {};
          this.syncPollState();
        }
      });
    },
    syncPollState() {
      this.clearPollTimer();
      if (['running', 'pausing', 'terminating'].includes(this.taskData.status)) {
        this.pollTimer = setTimeout(() => {
          this.getTask();
        }, 5000);
      } else {
        this.isGenerating = false;
      }
    },
    clearPollTimer() {
      if (this.pollTimer) {
        clearTimeout(this.pollTimer);
        this.pollTimer = null;
      }
    },
    applyScript(code) {
      this.$emit('applyScript', code);
      this.closeDialog();
    },
    clipboardSuccess() {
      this.$Message.success(this.$t('message.copysuccess'));
    },
    toPrettyText(value) {
      if (value == null || value === '') {
        return '';
      }
      if (typeof value == 'string') {
        return value;
      }
      return JSON.stringify(value, null, 2);
    },
    toArray(value) {
      if (!value) {
        return [];
      }
      const list = Array.isArray(value) ? value : [value];
      return list.map(item => {
        return typeof item == 'string' ? item : JSON.stringify(item);
      });
    },
    isEmptyValue(value) {
      if (value == null || value === '') {
        return true;
      }
      if (Array.isArray(value)) {
        return value.length === 0;
      }
      if (typeof value == 'object') {
        return Object.keys(value).length === 0;
      }
      return false;
    }
  },
  computed: {
    summaryText() {
      return this.output.summary || this.output.suggestion || '';
    },
    generatedScript: {
      get() {
        if (this.output.script) {
          return this.output.script;
        }
        const review = this.output.review || {};
        if (review.script || review.finalScript) {
          return review.script || review.finalScript;
        }
        const generate = this.output.generate || {};
        return generate.script || '';
      },
      set() {}
    },
    specText: {
      get() {
        return this.toPrettyText(this.output.spec);
      },
      set() {}
    },
    outputContractText: {
      get() {
        if (this.isEmptyValue(this.output.outputContract)) {
          return '';
        }
        return this.toPrettyText(this.output.outputContract);
      },
      set() {}
    },
    dictionaryText: {
      get() {
        if (this.isEmptyValue(this.output.dictionaryChanges)) {
          return '';
        }
        return this.toPrettyText(this.output.dictionaryChanges);
      },
      set() {}
    },
    evidenceText: {
      get() {
        if (this.isEmptyValue(this.output.ragEvidence) && this.isEmptyValue(this.output.knowledgeEvidence) && this.isEmptyValue(this.output.toolCatalog) && this.isEmptyValue(this.output.evidence)) {
          return '';
        }
        const evidence = {
          ragEvidence: this.output.ragEvidence || null,
          knowledgeEvidence: this.output.knowledgeEvidence || null,
          toolCatalog: this.output.toolCatalog || null,
          evidence: this.output.evidence || null
        };
        return this.toPrettyText(evidence);
      },
      set() {}
    },
    validationCommands() {
      return this.toArray(this.output.validationCommands);
    },
    riskList() {
      return this.toArray(this.output.riskList);
    },
    warningList() {
      return this.toArray(this.output.warnings);
    },
    issueList() {
      return this.toArray(this.output.issueList);
    },
    suggestion() {
      return this.output.suggestion || '';
    }
  },
  watch: {
    isShow: {
      handler(val) {
        this.dialogConfig.isShow = val;
        if (val) {
          this.resetData();
          this.loadConfig();
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.ai-assistant-dialog {
  .section {
    margin-bottom: 16px;
  }
  .section-title {
    font-weight: bold;
    margin-bottom: 8px;
  }
  .section-title-with-action {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .requirement-input {
    width: 100%;
    min-height: 120px;
    padding: 8px;
    resize: vertical;
    border: 1px solid;
  }
  .plain-list {
    padding-left: 18px;
    li {
      margin-bottom: 6px;
    }
  }
  .code-text {
    font-family: monospace;
  }
  .btn-icon {
    &:before {
      padding-right: 4px;
    }
  }
}
</style>
