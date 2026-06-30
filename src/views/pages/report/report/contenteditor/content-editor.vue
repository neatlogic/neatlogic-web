<template>
  <div class="report-content-editor">
    <div class="editor-toolbar border-base-bottom">
      <RadioGroup v-model="editMode" type="button">
        <Radio label="visual">可视化</Radio>
        <Radio label="source">源码</Radio>
      </RadioGroup>
      <div class="toolbar-actions">
        <Dropdown trigger="click" @on-click="insertWidget">
          <Button>
            插入组件
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
      <div class="visual-main border-base-right">
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
    <div v-else class="source-layout">
      <div class="source-help">
        <ContentHelp></ContentHelp>
      </div>
      <TsCodemirror
        codeMode="xml"
        :value.sync="contentLocal"
        height="calc(100vh - 300px)"
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
  height: calc(100vh - 240px);
  min-height: 480px;
  border: 1px solid var(--border-color);
  color: var(--text-color);
  background: var(--blockbg);
  .editor-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 48px;
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
    height: calc(100% - 48px);
    min-height: 0;
  }
  .visual-main,
  .visual-property {
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }
  .visual-main {
    background: var(--body-bg);
  }
  .visual-property {
    background: var(--blockbg);
  }
  .source-layout {
    height: calc(100% - 48px);
    padding: 10px;
    overflow: auto;
    background: var(--blockbg);
  }
  .source-help {
    margin-bottom: 8px;
  }
}
</style>
