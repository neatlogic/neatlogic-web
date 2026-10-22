<template>
  <TsDialog v-bind="dialogConfig" @on-close="close">
    <template v-slot>
      <TsFormItem :label="$t('page.name')" :required="true">
        <TsFormInput
          ref="nameInput"
          v-model="itemData.name"
          :maxlength="100"
          :validateList="['required']"
        ></TsFormInput>
      </TsFormItem>
      <TsFormItem :label="$t('term.framework.selfcheck.target')" :required="true">
        <TsFormSelect
          ref="targetSelect"
          v-model="itemData.apiToken"
          mode="group"
          dynamicUrl="/api/rest/selfcheck/target/search"
          rootName="tbodyList"
          childrenName="apiList"
          parentValueName="moduleGroup"
          parentTextName="moduleGroupName"
          valueName="token"
          textName="name"
          :dynamicDefaultValue="itemData.apiToken ? [itemData.apiToken] : []"
          :pageSize="50"
          :search="true"
          :groupCollapsible="true"
          :validateList="['required']"
          transfer
          @on-change="changeTarget"
        >
          <template v-slot:option="{ item: api }">
            <div>
              <span>{{ api.name }}</span>
              <span class="text-grey ml-xs">{{ api.risk }}</span>
              <div class="text-grey fz10">{{ api.token }}</div>
            </div>
          </template>
        </TsFormSelect>
      </TsFormItem>
      <TsFormItem v-if="currentTarget" :label="$t('page.description')">
        <div>{{ currentTarget.description || '-' }}</div>
        <div class="text-grey fz10 mt-xs">{{ currentTarget.token }} · {{ currentTarget.risk }}</div>
      </TsFormItem>
      <TsFormItem :label="$t('page.isactive')">
        <TsFormSwitch v-model="itemData.isActive" :trueValue="1" :falseValue="0"></TsFormSwitch>
      </TsFormItem>
      <TsFormItem :label="$t('term.framework.selfcheck.apitimeout')">
        <TsFormInput
          v-model="itemData.apiTimeout"
          type="number"
          :min="1"
          :max="120"
          width="120px"
        >
          <template v-slot:append>{{ $t('page.second') }}</template>
        </TsFormInput>
      </TsFormItem>
      <TsFormItem v-if="currentTarget" :label="$t('term.framework.selfcheck.requestparamdescription')">
        <TsTable
          v-if="inputParamList.length"
          :theadList="requestParamTheadList"
          :tbodyList="inputParamList"
          :hideAction="true"
        ></TsTable>
        <div v-else class="text-tip">{{ $t('term.framework.selfcheck.norequestparam') }}</div>
      </TsFormItem>
      <TsFormItem :label="$t('term.framework.selfcheck.requestparam')">
        <TsMonacoEditor
          v-model="requestParamText"
          codeMode="json"
          height="180px"
          :modelUri="modelUri('request')"
        ></TsMonacoEditor>
      </TsFormItem>
      <TsFormItem v-if="currentTarget" :label="$t('term.framework.selfcheck.responseparamdescription')">
        <TsTable
          v-if="outputParamList.length"
          :theadList="responseParamTheadList"
          :tbodyList="outputParamList"
          :hideAction="true"
        ></TsTable>
        <div v-else class="text-tip">{{ $t('term.framework.selfcheck.noresponseparam') }}</div>
      </TsFormItem>
      <TsFormItem :label="$t('term.framework.selfcheck.script')" :required="true">
        <div class="text-tip mb-xs">{{ $t('term.framework.selfcheck.scriptbodytip') }}</div>
        <div class="mb-xs">
          <span v-if="validating" class="text-grey">{{ $t('page.validating') }}</span>
          <span v-else-if="isScriptValid" class="text-success tsfont-check">{{ $t('message.validatesuccess') }}</span>
          <span v-else-if="scriptValidated" class="text-error tsfont-close">{{ $t('term.framework.selfcheck.scriptinvalid') }}</span>
        </div>
        <TsMonacoEditor
          ref="scriptEditor"
          v-model="itemData.verifyScript"
          codeMode="selfcheck-javascript"
          height="320px"
          :languageExtension="languageExtension"
          :modelUri="modelUri('script')"
          :markerList="diagnosticList"
          markerOwner="selfcheck-validate"
          @change="scheduleValidate"
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
      </TsFormItem>
      <TsFormItem :label="$t('term.framework.selfcheck.scripttimeout')">
        <TsFormInput
          v-model="itemData.scriptTimeout"
          type="number"
          :min="1"
          :max="10"
          width="120px"
        >
          <template v-slot:append>{{ $t('page.second') }}</template>
        </TsFormInput>
      </TsFormItem>
    </template>
    <template v-slot:footer>
      <Button @click="close">{{ $t('page.cancel') }}</Button>
      <Button :loading="testing" @click="testItem">{{ $t('term.framework.selfcheck.testitem') }}</Button>
      <Button type="primary" :loading="validating" @click="confirm">{{ $t('page.confirm') }}</Button>
    </template>
    <TsDialog
      v-if="testResult"
      :isShow="true"
      type="slider"
      width="large"
      :title="$t('term.framework.selfcheck.testresult')"
      :hasFooter="false"
      @on-close="testResult = null"
    >
      <SelfCheckExecutionResult :result="testResult"></SelfCheckExecutionResult>
    </TsDialog>
  </TsDialog>
</template>
<script>
import { createDefaultScript, createSelfCheckLanguageExtension, createSelfCheckSchemaFieldList } from './selfcheck-language-extension.js';

export default {
  name: 'SelfCheckScenarioItemEdit',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsMonacoEditor: () => import('@/resources/plugins/TsMonacoEditor/TsMonacoEditor.vue'),
    SelfCheckExecutionResult: () => import('./execution-result.vue')
  },
  props: {
    item: { type: Object, default: null }
  },
  data() {
    const isNew = !this.item;
    const itemData = this.item
      ? this.$utils.deepClone(this.item)
      : {
        name: '',
        isActive: 1,
        apiToken: '',
        requestParam: {},
        verifyScript: createDefaultScript(),
        scriptTimeout: 3,
        apiTimeout: 30
      };
    let requestParamText = '';
    if (typeof itemData.requestParam === 'string') {
      try {
        requestParamText = JSON.stringify(JSON.parse(itemData.requestParam), null, 2);
      } catch {
        requestParamText = itemData.requestParam;
      }
    } else {
      requestParamText = JSON.stringify(itemData.requestParam || {}, null, 2);
    }
    return {
      itemData,
      requestParamText,
      currentTarget: null,
      previousApiToken: itemData.apiToken || '',
      isAutoScript: isNew,
      applyingDefaultScript: false,
      diagnosticList: itemData.diagnosticList || [],
      isScriptValid: itemData.isScriptValid === true || itemData.isScriptValid === 1,
      scriptValidated: itemData.isScriptValid != null,
      validateTimer: null,
      validating: false,
      testing: false,
      testResult: null,
      validationRequestId: 0,
      dialogConfig: {
        title: this.$t('term.framework.selfcheck.itemconfig'),
        type: 'slider',
        width: 'large',
        maskClose: false,
        isShow: true
      },
      requestParamTheadList: [
        { key: 'path', title: this.$t('page.name') },
        { key: 'typeDisplay', title: this.$t('page.type') },
        { key: 'requiredText', title: this.$t('page.isrequired'), width: 90 },
        { key: 'ruleText', title: this.$t('page.rule') },
        { key: 'descriptionText', title: this.$t('page.description') }
      ],
      responseParamTheadList: [
        { key: 'path', title: this.$t('page.name') },
        { key: 'typeDisplay', title: this.$t('page.type') },
        { key: 'descriptionText', title: this.$t('page.description') }
      ]
    };
  },
  created() {
    this.loadCurrentTarget();
  },
  beforeDestroy() {
    clearTimeout(this.validateTimer);
  },
  methods: {
    modelUri(type) {
      return `inmemory://selfcheck/item/${this.itemData.id || 'new'}/${type}`;
    },
    loadCurrentTarget() {
      if (!this.itemData.apiToken) {
        return;
      }
      this.$api.framework.selfcheck.searchTarget({
        currentPage: 1,
        pageSize: 1,
        defaultValue: [this.itemData.apiToken]
      }).then(res => {
        if (res.Status === 'OK') {
          this.currentTarget = this.findTarget(res.Return && res.Return.tbodyList, this.itemData.apiToken);
          if (this.currentTarget && this.currentTarget.defaultScript) {
            this.isAutoScript = this.itemData.verifyScript === this.currentTarget.defaultScript;
          }
        }
      });
    },
    findTarget(groupList, token) {
      for (const group of groupList || []) {
        const target = (group.apiList || []).find(api => api.token === token);
        if (target) {
          return target;
        }
      }
      return null;
    },
    changeTarget(value) {
      const target = arguments[2];
      if (!value) {
        this.previousApiToken = '';
        this.currentTarget = null;
        return;
      }
      if (this.previousApiToken && this.previousApiToken !== value && (!this.isAutoScript || this.hasRequestContent())) {
        const nextToken = value;
        this.itemData.apiToken = this.previousApiToken;
        this.$createDialog({
          title: this.$t('page.warning'),
          content: this.$t('term.framework.selfcheck.switchapiconfirm'),
          onOk: vnode => {
            this.applyTarget(nextToken, target);
            vnode.isShow = false;
          }
        });
        return;
      }
      this.applyTarget(value, target);
    },
    hasRequestContent() {
      const text = (this.requestParamText || '').trim();
      if (!text || text === '{}') {
        return false;
      }
      try {
        return Object.keys(JSON.parse(text)).length > 0;
      } catch {
        return true;
      }
    },
    applyTarget(token, target) {
      this.itemData.apiToken = token;
      this.previousApiToken = token;
      this.currentTarget = target || null;
      if (this.isAutoScript) {
        this.applyingDefaultScript = true;
        this.itemData.verifyScript = (target && target.defaultScript) || createDefaultScript();
        this.$nextTick(() => {
          this.applyingDefaultScript = false;
          this.scheduleValidate();
        });
      }
    },
    scheduleValidate() {
      if (!this.applyingDefaultScript) {
        const defaultScriptList = [createDefaultScript()];
        if (this.currentTarget && this.currentTarget.defaultScript) {
          defaultScriptList.push(this.currentTarget.defaultScript);
        }
        this.isAutoScript = defaultScriptList.includes(this.itemData.verifyScript);
      }
      clearTimeout(this.validateTimer);
      this.scriptValidated = false;
      this.isScriptValid = false;
      this.validateTimer = setTimeout(() => this.validateScript(), 800);
    },
    async validateScript() {
      clearTimeout(this.validateTimer);
      if (!this.itemData.verifyScript) {
        this.scriptValidated = true;
        this.isScriptValid = false;
        this.diagnosticList = [];
        return false;
      }
      const script = this.itemData.verifyScript;
      const requestId = ++this.validationRequestId;
      this.validating = true;
      try {
        const res = await this.$api.framework.selfcheck.validateScript({ script });
        if (requestId !== this.validationRequestId || script !== this.itemData.verifyScript) {
          return false;
        }
        if (res.Status === 'OK') {
          const result = res.Return || {};
          this.scriptValidated = true;
          this.isScriptValid = result.valid === true || result.valid === 1;
          this.diagnosticList = result.diagnosticList || [];
          return this.isScriptValid;
        }
      } finally {
        if (requestId === this.validationRequestId) {
          this.validating = false;
        }
      }
      return false;
    },
    parseRequestParam() {
      try {
        const value = JSON.parse(this.requestParamText || '{}');
        if (!value || Array.isArray(value) || typeof value !== 'object') {
          throw new Error(this.$t('term.framework.selfcheck.requestobjectrequired'));
        }
        return value;
      } catch (error) {
        this.$Message.error(error.message || this.$t('term.framework.selfcheck.requestjsoninvalid'));
        return null;
      }
    },
    validBasic() {
      const nameValid = this.$refs.nameInput && this.$refs.nameInput.valid();
      const targetValid = this.$refs.targetSelect && this.$refs.targetSelect.valid();
      if (!nameValid || !targetValid || !this.itemData.verifyScript) {
        this.$Message.warning(this.$t('message.completerequired', { target: this.$t('term.framework.selfcheck.itemconfig') }));
        return false;
      }
      return true;
    },
    buildItemData(requestParam) {
      const result = Object.assign({}, this.itemData, {
        requestParam,
        isScriptValid: this.isScriptValid,
        diagnosticList: this.diagnosticList,
        apiName: this.currentTarget && this.currentTarget.name
      });
      result.apiTimeout = Math.min(120, Math.max(1, Number(result.apiTimeout) || 30));
      result.scriptTimeout = Math.min(10, Math.max(1, Number(result.scriptTimeout) || 3));
      return result;
    },
    buildSubmitData(itemData) {
      return {
        id: itemData.id,
        name: itemData.name,
        isActive: itemData.isActive,
        sort: itemData.sort,
        apiToken: itemData.apiToken,
        requestParam: itemData.requestParam,
        verifyScript: itemData.verifyScript,
        apiTimeout: itemData.apiTimeout,
        scriptTimeout: itemData.scriptTimeout
      };
    },
    async confirm() {
      if (!this.validBasic()) {
        return;
      }
      const requestParam = this.parseRequestParam();
      if (requestParam == null) {
        return;
      }
      await this.validateScript();
      this.$emit('close', this.buildItemData(requestParam));
    },
    async testItem() {
      if (!this.validBasic()) {
        return;
      }
      const requestParam = this.parseRequestParam();
      if (requestParam == null) {
        return;
      }
      const valid = await this.validateScript();
      if (!valid) {
        this.$Message.warning(this.$t('term.framework.selfcheck.fixscriptbeforetest'));
        return;
      }
      this.testing = true;
      try {
        const params = this.buildSubmitData(this.buildItemData(requestParam));
        const res = await this.$api.framework.selfcheck.testItem(params);
        if (res.Status === 'OK') {
          const result = res.Return || {};
          result.verifyScript = result.verifyScript || params.verifyScript;
          this.testResult = result;
        }
      } finally {
        this.testing = false;
      }
    },
    getDiagnosticText(diagnostic) {
      const line = diagnostic.startLine || diagnostic.line || 1;
      const column = diagnostic.startColumn || diagnostic.column || 1;
      return `${line}:${column} ${diagnostic.errorType || ''} ${diagnostic.message || ''}`;
    },
    revealDiagnostic(diagnostic) {
      if (this.$refs.scriptEditor) {
        this.$refs.scriptEditor.revealMarker(diagnostic);
      }
    },
    close() {
      this.$emit('close');
    },
    formatSchemaField(field) {
      const ruleList = [];
      if (field.rule) {
        ruleList.push(field.rule);
      }
      if (field.maxLength) {
        ruleList.push(`${this.$t('page.maxlength')}: ${field.maxLength}`);
      }
      const descriptionList = [];
      if (field.description) {
        descriptionList.push(field.description);
      }
      if (field.help && field.help !== field.description) {
        descriptionList.push(field.help);
      }
      return Object.assign({}, field, {
        typeDisplay: field.typeText || field.type || '-',
        requiredText: field.required ? this.$t('page.yes') : this.$t('page.no'),
        ruleText: ruleList.join(' / ') || '-',
        descriptionText: descriptionList.join(' / ') || '-'
      });
    }
  },
  computed: {
    inputParamList() {
      return createSelfCheckSchemaFieldList(this.currentTarget && this.currentTarget.inputSchema).map(field => this.formatSchemaField(field));
    },
    outputParamList() {
      return createSelfCheckSchemaFieldList(this.currentTarget && this.currentTarget.outputSchema).map(field => this.formatSchemaField(field));
    },
    languageExtension() {
      return createSelfCheckLanguageExtension(this.currentTarget, key => this.$t(key));
    }
  }
};
</script>
