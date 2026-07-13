<template>
  <div class="component-property-panel">
    <div v-if="!token" class="empty-tip text-grey">{{ $t('term.report.selectreportcomponent') }}</div>
    <div v-else-if="!rule" class="empty-tip text-grey">
      <div class="text-title">{{ token.name }}</div>
      <div class="mt-xs">{{ $t('term.report.componentrulenotfound') }}</div>
    </div>
    <div v-else-if="!token.parsed" class="empty-tip text-grey">
      <div class="text-title">{{ rule.label }}</div>
      <div class="mt-xs">{{ $t('term.report.componentparamnotjson') }}</div>
      <div class="code-preview mt-xs">{{ token.argsText }}</div>
    </div>
    <div v-else>
      <div class="panel-title">
        <i :class="rule.icon"></i>
        <span>{{ rule.label }}</span>
      </div>
      <TsForm
        ref="propertyForm"
        :key="token.id"
        :itemList="formConfig"
        :dataConfig="formData"
        labelPosition="top"
        @change="changeConfig"
      ></TsForm>
    </div>
  </div>
</template>
<script>
export default {
  name: 'ComponentPropertyPanel',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {
    token: { type: Object },
    rule: { type: Object },
    reportData: { type: Object }
  },
  data() {
    return {
      formData: {},
      formConfig: {}
    };
  },
  methods: {
    getFormDataByFormConfig(formConfig) {
      const data = {};
      Object.keys(formConfig || {}).forEach(key => {
        data[key] = formConfig[key].value;
      });
      return data;
    },
    initForm() {
      if (!this.token || !this.rule || !this.token.parsed) {
        this.formData = {};
        this.formConfig = {};
        return;
      }
      const config = this.$utils.deepClone(this.token.config || {});
      this.formConfig = this.rule.getFormConfig(config, {
        reportData: this.reportData,
        token: this.token
      });
      this.formData = this.getFormDataByFormConfig(this.formConfig);
    },
    changeConfig(config) {
      const oldData = this.formData && this.formData.data;
      this.formData = this.$utils.deepClone(config || {});
      if (oldData !== this.formData.data && this.rule && this.token) {
        this.formConfig = this.rule.getFormConfig(this.formData, {
          reportData: this.reportData,
          token: this.token
        });
        this.formData = this.getFormDataByFormConfig(this.formConfig);
      }
      this.$emit('change', this.formData);
    }
  },
  watch: {
    token: {
      handler() {
        this.initForm();
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.component-property-panel {
  height: 100%;
  padding: 12px;
  overflow: auto;
  .panel-title {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 12px;
    font-weight: bold;
  }
  .empty-tip {
    padding: 12px;
    line-height: 1.6;
  }
  .code-preview {
    padding: 8px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    word-break: break-all;
    background: var(--blockbg);
    font-family: monospace;
  }
}
</style>
