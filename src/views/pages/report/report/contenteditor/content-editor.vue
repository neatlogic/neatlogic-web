<template>
  <div class="report-content-editor">
    <div class="editor-toolbar">
      <RadioGroup v-model="editMode" type="button">
        <Radio label="visual">{{ $t('term.report.visual') }}</Radio>
        <Radio label="source">{{ $t('term.report.source') }}</Radio>
      </RadioGroup>
      <div class="toolbar-actions">
        <Dropdown trigger="click" @on-click="insertWidget">
          <Button>
            {{ $t('term.report.insertcomponent') }}
            <i class="tsfont-down"></i>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem
              v-for="rule in ruleList"
              :key="rule.name"
              :name="rule.name"
            >
              <i :class="rule.icon"></i>
              <span class="pl-xs">{{ rule.label }}</span>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
    <div v-if="editMode === 'visual'" class="visual-layout">
      <div class="visual-main bg-op radius-md">
        <VisualEditor
          :content="contentLocal"
          :tokenList="tokenList"
          :ruleMap="ruleMap"
          :selectedTokenId="selectedTokenId"
          @select-token="selectToken"
          @move-token="moveToken"
        ></VisualEditor>
      </div>
      <div class="visual-property">
        <ComponentPropertyPanel
          :token="selectedToken"
          :rule="selectedRule"
          :reportData="reportData"
          @change="changeTokenConfig"
        ></ComponentPropertyPanel>
      </div>
    </div>
    <div v-else class="source-layout padding-sm">
      <div class="source-help">
        <ContentHelp></ContentHelp>
      </div>
      <TsCodemirror
        class="source-code"
        codeMode="xml"
        :value.sync="contentLocal"
        height="100%"
      ></TsCodemirror>
    </div>
  </div>
</template>
<script>
import { tokenizeContent, replaceToken, swapToken } from './content-tokenizer';
import { ruleList, ruleMap } from './rules';

export default {
  name: 'ReportContentEditor',
  components: {
    TsCodemirror: () => import('@/resources/plugins/TsCodemirror/TsCodemirror.vue'),
    ContentHelp: () => import('../content-help.vue'),
    VisualEditor: () => import('./visual-editor.vue'),
    ComponentPropertyPanel: () => import('./component-property-panel.vue')
  },
  model: {
    prop: 'value',
    event: 'input'
  },
  props: {
    value: { type: String, default: '' },
    reportData: { type: Object }
  },
  data() {
    return {
      editMode: 'visual',
      contentLocal: this.value || '',
      selectedTokenId: null,
      ruleList,
      ruleMap
    };
  },
  methods: {
    selectToken(tokenId) {
      this.selectedTokenId = tokenId;
    },
    changeTokenConfig(config) {
      if (!this.selectedToken || !this.selectedRule || !this.selectedToken.parsed) {
        return;
      }
      const nextSource = this.selectedRule.stringify(config, {
        reportData: this.reportData,
        token: this.selectedToken
      });
      this.updateContent(replaceToken(this.contentLocal, this.selectedToken, nextSource));
    },
    moveToken({ tokenId, direction }) {
      this.updateContent(swapToken(this.contentLocal, this.tokenList, tokenId, direction));
      this.selectedTokenId = tokenId;
    },
    insertWidget(ruleName) {
      const rule = this.ruleMap[ruleName];
      if (!rule) {
        return;
      }
      const source = rule.stringify(rule.parse('{}'), {
        reportData: this.reportData
      });
      const prefix = this.contentLocal && !/\n$/.test(this.contentLocal) ? '\n' : '';
      this.updateContent(`${this.contentLocal || ''}${prefix}${source}`);
    },
    updateContent(content) {
      const nextContent = content || '';
      if (nextContent !== this.contentLocal) {
        this.contentLocal = nextContent;
      }
    }
  },
  computed: {
    tokenList() {
      return tokenizeContent(this.contentLocal, this.ruleMap);
    },
    selectedToken() {
      return this.tokenList.find(token => token.id === this.selectedTokenId) || null;
    },
    selectedRule() {
      return this.selectedToken ? this.ruleMap[this.selectedToken.name] : null;
    }
  },
  watch: {
    value(val) {
      if (val !== this.contentLocal) {
        this.contentLocal = val || '';
      }
    },
    contentLocal(val) {
      this.$emit('input', val || '');
      if (this.selectedTokenId && !this.tokenList.find(token => token.id === this.selectedTokenId)) {
        this.selectedTokenId = null;
      }
    }
  }
};
</script>
<style lang="less" scoped>
.report-content-editor {
  // 由页面正文提供可用高度，工具栏固定，编辑区域使用剩余空间。
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  color: var(--text-color);
  background: var(--blockbg);
  .editor-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 48px;
    flex-shrink: 0;
    padding: 0 12px;
    background: var(--blockbg);
  }
  .toolbar-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .visual-layout {
    display: grid;
    grid-template-columns: minmax(420px, 1fr) 300px;
    grid-template-rows: minmax(0, 1fr);
    flex: 1;
    min-height: 0;
  }
  .visual-main,
  .visual-property {
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }
  .visual-property {
    background: var(--blockbg);
  }
  .source-layout {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    background: var(--blockbg);
  }
  .source-help {
    flex-shrink: 0;
    margin-bottom: 8px;
  }
  .source-code {
    flex: 1;
    min-height: 0;
  }
}
</style>
