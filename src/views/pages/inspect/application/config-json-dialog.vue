<template>
  <TsDialog v-bind="dialogConfig" @on-ok="saveDraft" @on-close="$emit('close')">
    <template v-slot>
      <div class="padding">
        <div v-if="summary" class="summary-grid pb-md">
          <div class="summary-item bg-op">
            <div class="text-grey">字段数</div>
            <div class="summary-value">{{ summary.fieldCount || 0 }}</div>
          </div>
          <div class="summary-item bg-op">
            <div class="text-grey">硬件层</div>
            <div class="summary-value">{{ summary.layerCount && summary.layerCount.hardware || 0 }}</div>
          </div>
          <div class="summary-item bg-op">
            <div class="text-grey">内核层</div>
            <div class="summary-value">{{ summary.layerCount && summary.layerCount.kernel || 0 }}</div>
          </div>
          <div class="summary-item bg-op">
            <div class="text-grey">OS层</div>
            <div class="summary-value">{{ summary.layerCount && summary.layerCount.os || 0 }}</div>
          </div>
          <div class="summary-item bg-op">
            <div class="text-grey">应用层</div>
            <div class="summary-value">{{ summary.layerCount && summary.layerCount.application || 0 }}</div>
          </div>
        </div>
        <div v-if="aiCandidate" class="pb-md">
          <div class="ai-candidate-header bg-op radius-sm" @click="toggleAiCandidate">
            <div>
              <span class="text-grey">AI候选说明</span>
              <span v-if="aiAnalysisDurationText" class="text-tip margin-left">{{ aiAnalysisDurationText }}</span>
              <span v-if="aiCallModeText" class="text-tip margin-left">{{ aiCallModeText }}</span>
            </div>
            <span class="text-action">{{ isShowAiCandidate ? '收起' : '展开' }}</span>
          </div>
          <div v-if="isShowAiCandidate" class="margin-top-sm">
            <TsCodemirror
              v-model="aiCandidateValue"
              codeMode="json"
              :isReadOnly="true"
              height="220px"
            ></TsCodemirror>
          </div>
        </div>
        <TsCodemirror
          v-model="draftValue"
          codeMode="json"
          :isReadOnly="!editable"
          height="calc(100vh - 240px)"
        ></TsCodemirror>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsCodemirror: () => import('@/resources/plugins/TsCodemirror/TsCodemirror.vue')
  },
  props: {
    title: {
      type: String,
      default: '配置详情'
    },
    value: {
      type: [String, Object],
      default: null
    },
    summary: {
      type: Object,
      default: null
    },
    aiCandidate: {
      type: [String, Object],
      default: null
    },
    editable: {
      type: Boolean,
      default: false
    },
    saveText: {
      type: String,
      default: '保存草稿'
    },
    saveLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      draftValue: '{}',
      aiCandidateValue: '{}',
      isShowAiCandidate: false
    };
  },
  computed: {
    dialogConfig() {
      return {
        type: 'slider',
        title: this.title,
        maskClose: true,
        isShow: true,
        width: 'large',
        hasFooter: this.editable,
        okText: this.saveText,
        loading: this.saveLoading
      };
    },
    displayValue() {
      if (!this.value) {
        return '{}';
      }
      if (typeof this.value === 'string') {
        try {
          return JSON.stringify(JSON.parse(this.value), null, 2);
        } catch (e) {
          return this.value;
        }
      }
      return JSON.stringify(this.value, null, 2);
    },
    displayAiCandidateValue() {
      if (!this.aiCandidate) {
        return '{}';
      }
      if (typeof this.aiCandidate === 'string') {
        try {
          return JSON.stringify(JSON.parse(this.aiCandidate), null, 2);
        } catch (e) {
          return this.aiCandidate;
        }
      }
      return JSON.stringify(this.aiCandidate, null, 2);
    },
    aiAnalysisDurationText() {
      let duration = this.aiCandidateSummary && this.aiCandidateSummary.analysisDurationMillis;
      if (duration === undefined || duration === null) {
        return '';
      }
      if (duration < 1000) {
        return `AI分析耗时 ${duration}ms`;
      }
      return `AI分析耗时 ${(duration / 1000).toFixed(2)}s`;
    },
    aiCallModeText() {
      let callMode = this.aiCandidateSummary && this.aiCandidateSummary.callMode;
      if (!callMode) {
        return '';
      }
      if (callMode === 'stream') {
        return '流式兜底';
      }
      if (callMode === 'chat') {
        return '普通调用';
      }
      return callMode;
    },
    aiCandidateSummary() {
      if (!this.aiCandidate) {
        return null;
      }
      let candidate = this.aiCandidate;
      if (typeof candidate === 'string') {
        try {
          candidate = JSON.parse(candidate);
        } catch (e) {
          return null;
        }
      }
      return candidate && candidate.summary ? candidate.summary : null;
    }
  },
  watch: {
    value: {
      handler() {
        this.draftValue = this.displayValue;
      },
      immediate: true
    },
    aiCandidate: {
      handler() {
        this.aiCandidateValue = this.displayAiCandidateValue;
        this.isShowAiCandidate = false;
      },
      immediate: true
    }
  },
  methods: {
    saveDraft() {
      this.$emit('save', this.draftValue);
    },
    toggleAiCandidate() {
      this.isShowAiCandidate = !this.isShowAiCandidate;
    }
  }
};
</script>
<style lang="less" scoped>
.summary-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}
.summary-item {
  padding: 12px 16px;
  border-radius: 8px;
}
.summary-value {
  font-size: 20px;
  font-weight: 600;
  padding-top: 4px;
}
.ai-candidate-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  cursor: pointer;
}
</style>
