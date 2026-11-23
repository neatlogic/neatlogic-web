<template>
  <section class="execution-summary" :class="{'border-bottom': recordId != null}">
    <Button
      v-if="canGoBack"
      type="text"
      icon="ios-arrow-back"
      class="back-to-records mb-sm"
      @click="$emit('back')"
    >{{ $t('term.autoexec.backtoexecutionrecords') }}</Button>
    <div class="script-line">
      <h3>{{ name }}</h3>
      <span v-if="version != null" class="text-tip">V{{ version }}</span>
      <span v-if="status" class="result-state" :class="state.color">
        <Icon v-if="state.icon" :type="state.icon" aria-hidden="true"></Icon>{{ state.text }}
      </span>
    </div>
    <div v-if="$scopedSlots.target" class="target-line"><slot name="target"></slot></div>
    <div v-if="recordId != null" class="execution-meta">
      <span>{{ idLabel }} <b>{{ recordId }}</b></span>
      <span>{{ $t('page.timecost') }} <b>{{ durationText }}</b></span>
      <span v-if="startMillis !== null">{{ $utils.getDateByFormat(startMillis, 'yyyy-MM-dd') }}</span>
      <Button
        v-if="canCopyExecute && copyForm"
        class="copy-execute"
        type="default"
        :loading="openingCopy"
        @click="openCopy"
      ><span class="tsfont-copy" aria-hidden="true"></span> {{ $t('term.autoexec.copyexecute') }}</Button>
    </div>
    <TsDialog
      v-if="copyAudit && canCopyExecute"
      :isShow="true"
      :title="$t('term.autoexec.copyexecute')"
      @on-close="cancelCopy"
    >
      <component
        :is="copyForm"
        ref="copyForm"
        :copyAudit="copyAudit"
        @ready="copyReady = $event"
      ></component>
      <div v-if="copyError" class="text-error" role="alert">{{ copyError }}</div>
      <template v-slot:footer>
        <Button :disabled="copySubmitting" @click="cancelCopy">{{ $t('page.cancel') }}</Button>
        <Button
          type="primary"
          :disabled="!copyReady || copySubmitting"
          :loading="copySubmitting"
          @click="executeCopy"
        >{{ $t('page.execute') }}</Button>
      </template>
    </TsDialog>
  </section>
</template>
<script>
import { timestamp } from './execution-time.js';

// 工单执行和单目标审计共用摘要，编号含义和目标选择方式由入口提供。
export default {
  props: {
    canGoBack: Boolean,
    canCopyExecute: Boolean,
    copyForm: [Function, Object],
    loadCopy: Function,
    submitCopy: Function,
    name: [String, Number],
    version: [String, Number],
    status: String,
    recordId: [String, Number],
    idLabel: String,
    startTime: [Number, String],
    endTime: [Number, String]
  },
  data() {
    return {openingCopy: false, copySubmitting: false, copyReady: false, copyAudit: null, copyError: '', requestId: null, fingerprint: null};
  },
  methods: {
    // 两个入口在各自的授权范围内重新读取目标，表单和按钮在此共用。
    async openCopy() {
      if (!this.canCopyExecute || this.openingCopy || this.copyAudit) return;
      this.openingCopy = true;
      try {
        const audit = await this.loadCopy();
        if (this._isDestroyed || !this.canCopyExecute) return;
        if (!audit?.canCopyExecute || !audit.copyDefinition) {
          this.$emit('copy-unavailable');
          this.$Message.error(this.$t('term.autoexec.manual.unavailable'));
          return;
        }
        this.copyReady = false;
        this.copyError = '';
        this.requestId = null;
        this.fingerprint = null;
        this.copyAudit = audit;
      } catch (error) {
        if (!this._isDestroyed && this.canCopyExecute) {
          this.$emit('copy-unavailable');
          this.$Message.error(this.errorMessage(error));
        }
      } finally {
        this.openingCopy = false;
      }
    },
    // 保留抽屉中的原记录、目标和页签。
    cancelCopy() {
      if (!this.copySubmitting) this.copyAudit = null;
    },
    // 一次草稿的同参网络重试复用请求标识，新草稿重新生成。
    async executeCopy() {
      if (!this.canCopyExecute || !this.copyReady || this.copySubmitting) return;
      this.copySubmitting = true;
      this.copyError = '';
      try {
        const data = this.$refs.copyForm?.collect();
        if (!data) return;
        const fingerprint = JSON.stringify(data);
        if (this.fingerprint !== fingerprint) {
          this.fingerprint = fingerprint;
          this.requestId = this.$utils.setUuid();
        }
        const id = await this.submitCopy(this.copyAudit, data, this.requestId);
        if (this._isDestroyed) return;
        this.copyAudit = null;
        this.$emit('copied', id);
      } catch (error) {
        this.copyError = this.errorMessage(error);
      } finally {
        this.copySubmitting = false;
      }
    },
    // 优先展示接口给出的业务原因。
    errorMessage(error) {
      return error?.response?.data?.Message || error?.Message || error?.message || this.$t('page.loadingfailed');
    }
  },
  computed: {
    state() {
      return {
        success: {text: this.$t('term.autoexec.auditstatus.success'), color: 'text-success', icon: 'md-checkmark-circle'},
        failed: {text: this.$t('term.autoexec.auditstatus.failed'), color: 'text-error', icon: 'md-close-circle'},
        partial: {text: this.$t('term.autoexec.auditstatus.partial'), color: 'text-warning', icon: 'md-alert'},
        running: {text: this.$t('page.running'), color: 'text-primary'},
        pending: {text: this.$t('term.autoexec.pendingrun'), color: 'text-tip'}
      }[this.status] || {text: this.status, color: 'text-tip'};
    },
    startMillis() { return timestamp(this.startTime); },
    // 历史记录可能缺少结束时间，无法计算时显示占位符。
    durationText() {
      const end = timestamp(this.endTime);
      if (this.startMillis === null || end === null || end < this.startMillis) return '—';
      return this.$t('term.autoexec.auditseconds', {count: Math.floor((end - this.startMillis) / 1000)});
    }
  }
};
</script>
<style scoped>
.back-to-records { padding-inline-start: 0; border-inline-start-width: 0; }
.execution-summary { padding: 16px 0 24px; font-size: 14px; }
.execution-summary.border-bottom { padding-top: 24px; border-bottom: 1px solid var(--border-color, rgba(128,140,157,.23)); }
.script-line, .target-line, .execution-meta, .result-state { display: flex; align-items: center; }
.script-line, .target-line, .execution-meta { flex-wrap: wrap; gap: 6px 12px; overflow-wrap: anywhere; }
.script-line h3 { margin: 0; font-size: 20px; line-height: 1.5; font-weight: 600; }
.result-state { gap: 6px; font-size: 16px; font-weight: 500; }
.target-line { margin-top: 8px; }
.execution-meta { margin-top: 18px; }
.execution-meta > span + span { border-left: 1px solid rgba(128,140,157,.32); padding-left: 12px; }
.copy-execute { margin-inline-start: auto; }
.execution-meta b { font-weight: 400; margin-left: 4px; }
</style>
