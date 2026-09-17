<template>
  <div class="tsmonaco-editor" @keydown.stop>
    <Loading
      v-if="isLoading || editorLoading"
      :text="loadingText"
      :loadingShow="isLoading || editorLoading"
      type="fix"
    ></Loading>
    <div v-if="loadError" class="text-error padding-md border-base radius-sm">
      {{ $t('page.loadingfailed') }}: {{ loadError }}
    </div>
    <template v-else>
      <i
        v-if="isCopy && currentValue"
        v-clipboard="currentValue"
        v-clipboard:success="clipboardSuccess"
        class="text-href tsmonaco-copy"
      >copy</i>
      <div
        ref="editorContainer"
        class="tsmonaco-container border-base radius-sm"
        :class="!isValidPass ? 'border-color-error' : 'border-color'"
        :style="containerStyle"
      ></div>
      <transition name="fade">
        <slot name="validMessage">
          <span
            v-if="validMesage"
            class="form-error-tip"
            :title="validMesage"
            v-html="validMesage"
          ></span>
        </slot>
      </transition>
    </template>
  </div>
</template>

<script>
import formMixins from '@/resources/mixins/formMixins.js';
import clipboard from '@/resources/directives/clipboard.js';
import { configureMonacoWorker } from './monaco-loader.js';

export default {
  name: 'TsMonacoEditor',
  directives: { clipboard },
  tagComponent: 'TsForm',
  mixins: [formMixins],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: { type: String, default: '' },
    codeMode: { type: String, default: 'javascript' },
    isReadOnly: { type: Boolean, default: false },
    height: { type: String, default: '220px' },
    autoHeight: { type: Boolean, default: false },
    lineNumbers: { type: Boolean, default: true },
    placeholder: { type: String, default: '' },
    isCopy: { type: Boolean, default: false },
    isLoading: { type: Boolean, default: false },
    loadingText: { type: String, default: '' },
    config: { type: Object, default: () => ({}) },
    languageExtension: { type: Object, default: null },
    modelUri: { type: String, default: '' },
    markerList: { type: Array, default: () => [] },
    markerOwner: { type: String, default: 'ts-monaco' }
  },
  data() {
    return {
      monaco: null,
      editor: null,
      modelInstance: null,
      currentValue: this.value || '',
      validMesage: this.errorMessage || '',
      currentValidList: this.filterValid(this.validateList) || [],
      isValidPass: true,
      editorLoading: true,
      loadError: '',
      applyingExternalValue: false,
      autoHeightValue: this.height,
      resizeObserver: null,
      disposableList: [],
      languageDisposableList: [],
      modelMap: new Map(),
      viewStateMap: new Map()
    };
  },
  mounted() {
    this.initEditor();
  },
  beforeDestroy() {
    this.disposeEditor();
  },
  methods: {
    /** 延迟加载Monaco并创建独立模型，避免普通页面加载编辑器依赖。 */
    async initEditor() {
      try {
        configureMonacoWorker();
        const module = await import('./monaco-loader.js');
        if (this._isDestroyed || !this.$refs.editorContainer) {
          return;
        }
        this.monaco = module.loadMonaco();
        this.registerLanguageDefinition();
        this.modelInstance = this.getOrCreateModel();
        const autoHeightConfig = this.autoHeight
          ? {
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            overviewRulerLanes: 0,
            scrollbar: {
              vertical: 'hidden',
              horizontal: 'hidden',
              handleMouseWheel: false,
              alwaysConsumeMouseWheel: false
            }
          }
          : {};
        const editorConfig = Object.assign(
          {
            model: this.modelInstance,
            theme: this.editorTheme,
            readOnly: this.isReadOnly || this.disabled,
            lineNumbers: this.lineNumbers ? 'on' : 'off',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 13,
            lineHeight: 21,
            tabSize: 2,
            insertSpaces: true,
            formatOnPaste: true,
            quickSuggestions: { other: true, comments: false, strings: true },
            quickSuggestionsDelay: 50,
            suggestOnTriggerCharacters: true,
            tabCompletion: 'on',
            suggest: {
              showKeywords: true,
              showFields: true,
              showProperties: true,
              showVariables: true,
              showFunctions: true
            },
            wordWrap: 'on',
            fixedOverflowWidgets: false,
            automaticLayout: false,
            placeholder: this.placeholder
          },
          this.config || {},
          autoHeightConfig,
          {
            model: this.modelInstance,
            theme: this.editorTheme,
            readOnly: this.isReadOnly || this.disabled,
            lineNumbers: this.lineNumbers ? 'on' : 'off'
          }
        );
        this.editor = this.monaco.editor.create(this.$refs.editorContainer, editorConfig);
        this.registerEditorEvents();
        this.registerLanguageExtension();
        this.applyMarkers();
        this.resizeObserver = new ResizeObserver(() => this.refresh());
        this.resizeObserver.observe(this.$refs.editorContainer);
        this.updateAutoHeight();
        this.$emit('ready', this.editor);
      } catch (error) {
        this.loadError = error && error.message ? error.message : String(error);
        console.error('Monaco编辑器初始化失败', error);
      } finally {
        this.editorLoading = false;
      }
    },
    /** 转发常用编辑器事件，并保持Ts表单组件的校验行为。 */
    registerEditorEvents() {
      this.disposableList.push(this.editor.onDidChangeModelContent(event => {
        if (this.applyingExternalValue) {
          return;
        }
        this.currentValue = this.modelInstance.getValue();
        this.$emit('update:value', this.currentValue);
        this.$emit('change', this.currentValue);
        if (this.currentValidList.length > 0 && this.canValid('change', this.currentValidList)) {
          this.valid(this.currentValue);
        }
        this.triggerSuggest(event);
      }));
      this.disposableList.push(this.editor.onDidFocusEditorWidget(() => this.$emit('onFocus')));
      this.disposableList.push(this.editor.onDidBlurEditorWidget(() => {
        this.$emit('onBlur');
        if (this.currentValidList.length > 0 && this.canValid('blur', this.currentValidList)) {
          this.valid(this.currentValue);
        }
      }));
      this.disposableList.push(this.editor.onDidScrollChange(event => this.$emit('onScroll', event)));
      if (this.autoHeight) {
        this.disposableList.push(this.editor.onDidContentSizeChange(event => {
          if (event.contentHeightChanged) {
            this.updateAutoHeight(event.contentHeight);
          }
        }));
      }
    },
    /** 输入标识符或点号时主动唤起候选，避免隐藏页签恢复后首次自动补全不触发。 */
    triggerSuggest(event) {
      if (!this.editor || this.isReadOnly || this.disabled || !event || event.isFlush || event.changes.length !== 1) {
        return;
      }
      const text = event.changes[0].text;
      const extensionTriggerCharacters = this.languageExtension && Array.isArray(this.languageExtension.triggerCharacters)
        ? this.languageExtension.triggerCharacters
        : [];
      if (!/^[a-zA-Z_$]$/.test(text) && text !== '.' && !extensionTriggerCharacters.includes(text)) {
        return;
      }
      this.$nextTick(() => {
        if (this.editor && this.editor.hasTextFocus()) {
          this.editor.trigger('ts-monaco-editor', 'editor.action.triggerSuggest', {});
        }
      });
    },
    /** 注册当前业务语言的词法和编辑配置，业务实现必须保证重复调用安全。 */
    registerLanguageDefinition() {
      const extension = this.languageExtension;
      if (!this.monaco || !extension || typeof extension.registerLanguage !== 'function') {
        return;
      }
      extension.registerLanguage({
        monaco: this.monaco,
        language: this.currentLanguage
      });
    },
    /** 注册只服务于当前模型的业务补全与悬浮扩展。 */
    registerLanguageExtension() {
      this.disposeLanguageExtension();
      const extension = this.languageExtension;
      if (!this.monaco || !this.modelInstance || !extension) {
        return;
      }
      if (typeof extension.provideCompletionItems === 'function') {
        this.languageDisposableList.push(this.monaco.languages.registerCompletionItemProvider(this.currentLanguage, {
          triggerCharacters: extension.triggerCharacters || [],
          provideCompletionItems: (model, position, context, token) => {
            if (model !== this.modelInstance) {
              return { suggestions: [] };
            }
            return extension.provideCompletionItems({
              monaco: this.monaco,
              model,
              position,
              context,
              token
            }) || { suggestions: [] };
          }
        }));
      }
      if (typeof extension.provideHover === 'function') {
        this.languageDisposableList.push(this.monaco.languages.registerHoverProvider(this.currentLanguage, {
          provideHover: (model, position, token) => {
            if (model !== this.modelInstance) {
              return null;
            }
            return extension.provideHover({
              monaco: this.monaco,
              model,
              position,
              token
            });
          }
        }));
      }
      if (typeof extension.provideFoldingRanges === 'function') {
        this.languageDisposableList.push(this.monaco.languages.registerFoldingRangeProvider(this.currentLanguage, {
          provideFoldingRanges: (model, context, token) => {
            if (model !== this.modelInstance) {
              return [];
            }
            return extension.provideFoldingRanges({
              monaco: this.monaco,
              model,
              context,
              token
            }) || [];
          }
        }));
      }
    },
    disposeLanguageExtension() {
      this.languageDisposableList.splice(0).forEach(disposable => disposable.dispose());
    },
    saveData() {
      return this.modelInstance ? this.modelInstance.getValue() : this.currentValue;
    },
    /** 获取或创建当前URI对应的模型，并保留不同业务资源的独立编辑状态。 */
    getOrCreateModel() {
      const uri = this.monaco.Uri.parse(this.currentModelUri);
      let model = this.modelMap.get(uri.toString()) || this.monaco.editor.getModel(uri);
      if (!model) {
        model = this.monaco.editor.createModel(this.currentValue, this.currentLanguage, uri);
      } else {
        this.monaco.editor.setModelLanguage(model, this.currentLanguage);
        if (model.getValue() !== this.currentValue) {
          this.applyingExternalValue = true;
          model.setValue(this.currentValue);
          this.applyingExternalValue = false;
        }
      }
      this.modelMap.set(uri.toString(), model);
      return model;
    },
    /** 切换模型前保存视图状态，避免多个规则资产共用撤销栈、光标和滚动位置。 */
    attachModel() {
      if (!this.monaco || !this.editor) {
        return;
      }
      const previousModel = this.editor.getModel();
      if (previousModel) {
        this.viewStateMap.set(previousModel.uri.toString(), this.editor.saveViewState());
      }
      this.currentValue = this.value || '';
      this.registerLanguageDefinition();
      this.modelInstance = this.getOrCreateModel();
      this.editor.setModel(this.modelInstance);
      const viewState = this.viewStateMap.get(this.modelInstance.uri.toString());
      if (viewState) {
        this.editor.restoreViewState(viewState);
      }
      this.registerLanguageExtension();
      this.applyMarkers();
      this.refresh();
    },
    refresh() {
      if (this.editor) {
        this.editor.layout();
      }
    },
    /** 自动高度模式下按实际内容增高编辑器，并避免相同高度反复触发布局。 */
    updateAutoHeight(contentHeight) {
      if (!this.autoHeight || !this.editor) {
        return;
      }
      const configuredHeight = Number.parseFloat(this.height);
      const minHeight = Number.isFinite(configuredHeight) ? configuredHeight : 0;
      const nextHeight = `${Math.max(minHeight, Math.ceil(contentHeight || this.editor.getContentHeight()))}px`;
      if (this.autoHeightValue === nextHeight) {
        return;
      }
      this.autoHeightValue = nextHeight;
      this.$nextTick(() => {
        if (this.editor) {
          this.editor.layout();
        }
      });
    },
    insertText(text) {
      if (!this.editor || this.isReadOnly || this.disabled || !text) {
        return;
      }
      const selection = this.editor.getSelection();
      this.editor.executeEdits('ts-monaco-insert', [{ range: selection, text, forceMoveMarkers: true }]);
      this.editor.focus();
    },
    /** 将编辑器定位到后端诊断返回的行列位置。 */
    revealPosition(position) {
      if (!this.editor || !position) {
        return;
      }
      const lineNumber = Math.max(1, Number(position.line || position.lineNumber || 1));
      const column = Math.max(1, Number(position.column || position.startColumn || 1));
      this.editor.setPosition({ lineNumber, column });
      this.editor.revealPositionInCenter({ lineNumber, column });
      this.editor.focus();
    },
    revealMarker(marker) {
      this.revealPosition(marker);
    },
    /** 将通用诊断结构转换为Monaco Marker，并应用到当前模型。 */
    applyMarkers() {
      if (!this.monaco || !this.modelInstance) {
        return;
      }
      const markerList = (this.markerList || []).map(marker => {
        const startLineNumber = Math.max(1, Number(marker.line || marker.lineNumber || marker.startLineNumber || 1));
        const startColumn = Math.max(1, Number(marker.column || marker.startColumn || 1));
        return {
          severity: this.getMarkerSeverity(marker),
          message: marker.message || marker.code || '',
          code: marker.code,
          startLineNumber,
          startColumn,
          endLineNumber: Math.max(startLineNumber, Number(marker.endLine || marker.endLineNumber || startLineNumber)),
          endColumn: Math.max(startColumn + 1, Number(marker.endColumn || startColumn + 1))
        };
      });
      this.monaco.editor.setModelMarkers(this.modelInstance, this.markerOwner, markerList);
    },
    getMarkerSeverity(marker) {
      if (typeof marker.severity === 'number') {
        return marker.severity;
      }
      if (marker.level === 'warning' || marker.severity === 'warning') {
        return this.monaco.MarkerSeverity.Warning;
      }
      if (marker.level === 'info' || marker.severity === 'info') {
        return this.monaco.MarkerSeverity.Info;
      }
      return this.monaco.MarkerSeverity.Error;
    },
    clipboardSuccess() {
      this.$Message.success(this.$t('message.copysuccess'));
    },
    /** 销毁编辑器、模型、监听器和业务Provider，避免切换配置页后残留。 */
    disposeEditor() {
      this.disposeLanguageExtension();
      this.disposableList.splice(0).forEach(disposable => disposable.dispose());
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
      }
      if (this.editor) {
        const model = this.editor.getModel();
        if (model) {
          this.viewStateMap.set(model.uri.toString(), this.editor.saveViewState());
        }
        this.editor.dispose();
        this.editor = null;
      }
      this.modelMap.forEach(model => {
        if (!model.isDisposed()) {
          this.monaco.editor.setModelMarkers(model, this.markerOwner, []);
          model.dispose();
        }
      });
      this.modelMap.clear();
      this.viewStateMap.clear();
      this.modelInstance = null;
    }
  },
  computed: {
    containerStyle() {
      return { height: this.autoHeight ? this.autoHeightValue : this.height };
    },
    currentLanguage() {
      const modeMap = {
        js: 'javascript',
        'text/javascript': 'javascript',
        javascript: 'javascript',
        json: 'json',
        bash: 'shell',
        ksh: 'shell',
        csh: 'shell',
        sh: 'shell',
        cmd: 'bat',
        vbscript: 'vb'
      };
      return modeMap[this.codeMode] || this.codeMode || 'javascript';
    },
    currentModelUri() {
      if (this.modelUri) {
        return this.modelUri;
      }
      const extensionMap = {
        javascript: 'js',
        typescript: 'ts',
        json: 'json',
        yaml: 'yaml',
        xml: 'xml',
        freemarker: 'ftl',
        plaintext: 'txt',
        python: 'py',
        ruby: 'rb',
        perl: 'pl',
        powershell: 'ps1',
        shell: 'sh',
        bat: 'cmd',
        vb: 'vbs',
        'approval-drl': 'drl'
      };
      const extension = extensionMap[this.currentLanguage] || 'txt';
      return `inmemory://ts-monaco/${this._uid}/model.${extension}`;
    },
    editorTheme() {
      return this.$store.getters.themeType === 'dark' ? 'vs-dark' : 'vs';
    }
  },
  watch: {
    value(value) {
      const newValue = value || '';
      const isExternalChange = this.currentValue !== newValue;
      this.currentValue = newValue;
      if (
        this.modelInstance &&
        this.monaco &&
        this.modelInstance.uri.toString() === this.monaco.Uri.parse(this.currentModelUri).toString() &&
        this.modelInstance.getValue() !== newValue
      ) {
        this.applyingExternalValue = true;
        this.modelInstance.setValue(newValue);
        this.applyingExternalValue = false;
      }
      if (isExternalChange) {
        this.validMesage = '';
        this.isValidPass = true;
      }
    },
    currentLanguage(value) {
      if (this.monaco && this.modelInstance) {
        this.registerLanguageDefinition();
        this.monaco.editor.setModelLanguage(this.modelInstance, value);
        this.registerLanguageExtension();
      }
    },
    currentModelUri() {
      this.attachModel();
    },
    isReadOnly() {
      if (this.editor) {
        this.editor.updateOptions({ readOnly: this.isReadOnly || this.disabled });
      }
    },
    disabled() {
      if (this.editor) {
        this.editor.updateOptions({ readOnly: this.isReadOnly || this.disabled });
      }
    },
    lineNumbers(value) {
      if (this.editor) {
        this.editor.updateOptions({ lineNumbers: value ? 'on' : 'off' });
      }
    },
    placeholder(value) {
      if (this.editor) {
        this.editor.updateOptions({ placeholder: value });
      }
    },
    config: {
      deep: true,
      handler(value) {
        if (this.editor) {
          this.editor.updateOptions(Object.assign({}, value || {}, {
            readOnly: this.isReadOnly || this.disabled,
            lineNumbers: this.lineNumbers ? 'on' : 'off'
          }));
        }
      }
    },
    editorTheme(value) {
      if (this.monaco) {
        this.monaco.editor.setTheme(value);
      }
    },
    languageExtension: {
      deep: true,
      handler() {
        this.registerLanguageDefinition();
        this.registerLanguageExtension();
      }
    },
    markerList: {
      deep: true,
      handler() {
        this.applyMarkers();
      }
    },
    markerOwner(value, oldValue) {
      if (this.monaco && this.modelInstance && oldValue) {
        this.monaco.editor.setModelMarkers(this.modelInstance, oldValue, []);
      }
      this.applyMarkers();
    }
  }
};
</script>

<style scoped lang="less">
.tsmonaco-editor {
  position: relative;
  .tsmonaco-copy {
    position: absolute;
    right: 8px;
    top: 4px;
    z-index: 2;
  }
  .tsmonaco-container {
    overflow: visible;
  }
}
</style>
