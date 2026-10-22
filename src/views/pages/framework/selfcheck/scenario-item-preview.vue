<template>
  <Tabs v-model="currentTab" :animated="false">
    <TabPane :label="$t('term.framework.selfcheck.requestparam')" name="request">
      <TsMonacoEditor
        v-if="currentTab === 'request'"
        :value="requestParamText"
        codeMode="json"
        height="260px"
        :isReadOnly="true"
        :isCopy="true"
        :modelUri="modelUri('request')"
      ></TsMonacoEditor>
    </TabPane>
    <TabPane :label="$t('term.framework.selfcheck.script')" name="script">
      <TsMonacoEditor
        v-if="currentTab === 'script'"
        :value="item.verifyScript || ''"
        codeMode="selfcheck-javascript"
        height="320px"
        :isReadOnly="true"
        :isCopy="true"
        :modelUri="modelUri('script')"
        :languageExtension="languageExtension"
      ></TsMonacoEditor>
    </TabPane>
  </Tabs>
</template>
<script>
import { createSelfCheckLanguageExtension } from './selfcheck-language-extension.js';

export default {
  name: 'SelfCheckScenarioItemPreview',
  components: {
    TsMonacoEditor: () => import('@/resources/plugins/TsMonacoEditor/TsMonacoEditor.vue')
  },
  props: {
    item: { type: Object, required: true }
  },
  data() {
    return { currentTab: 'request' };
  },
  methods: {
    /** 以稳定检查项标识隔离只读编辑器模型。 */
    modelUri(type) {
      return `inmemory://selfcheck/scenario-preview/${this.item.id}/${type}`;
    }
  },
  computed: {
    requestParamText() {
      const value = this.item.requestParam;
      if (typeof value === 'string') {
        try {
          return JSON.stringify(JSON.parse(value), null, 2);
        } catch (error) {
          return value;
        }
      }
      return JSON.stringify(value || {}, null, 2);
    },
    languageExtension() {
      return createSelfCheckLanguageExtension(null, key => this.$t(key));
    }
  }
};
</script>
