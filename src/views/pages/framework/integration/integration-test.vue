<template>
  <div>
    <div v-if="isRunned && rawStatusCode != null" class="mb-sm">
      <span class="mr-md">{{ $t('term.framework.integrationstatus.rawCode') }} {{ rawStatusCode }}</span>
      <span>{{ $t('term.framework.integrationstatus.effectiveCode') }} {{ statusCode }}</span>
      <div v-if="statusCodeTransformDetail" class="text-tip text-word-break">{{ statusCodeTransformDetail }}</div>
    </div>
    <Tabs name="testTabs">
      <TabPane :label="$t('term.framework.requestparam')" tab="testTabs" :index="1">
        <TsCodemirror height="200px" :value.sync="content"></TsCodemirror>
      </TabPane>
      <TabPane
        v-if="isRunned && transformedParam"
        :label="$t('term.framework.sendingparam')"
        name="transformedParam"
        tab="testTabs"
        :index="2"
      >
        <TsCodemirror :is-read-only="true" :value="transformedParam"></TsCodemirror>
      </TabPane>
      <TabPane
        v-if="isRunned && rawResult"
        :label="$t('page.originalresults')"
        name="rawResult"
        tab="testTabs"
        :index="3"
      >
        <TsCodemirror :is-read-only="true" :value="rawResult"></TsCodemirror>
      </TabPane>
      <TabPane
        v-if="isRunned && transformedResult"
        :label="$t('term.framework.transferresult')"
        name="transformedResult"
        tab="testTabs"
        :index="4"
      >
        <TsCodemirror :is-read-only="true" :value="transformedResult"></TsCodemirror>
      </TabPane>
      <TabPane
        v-if="isRunned && error"
        :label="$t('page.exception')"
        name="error"
        tab="testTabs"
        :index="5"
      >
        <TsCodemirror :is-read-only="true" :value="error"></TsCodemirror>
      </TabPane>
    </Tabs>
  </div>
</template>
<script>
import { defaultTypeName } from './defaults-editor/index.js';
import TsCodemirror from '@/resources/plugins/TsCodemirror/TsCodemirror.vue';
import {mergeIntegrationParams, withPatternMode} from './integration-param-utils.js';
import {cloneJson, isDefaultEnabled, validateDefaultConfig} from './integration-default-utils.js';

export default {
  components: { TsCodemirror },
  props: { integration: { type: Object }, handlerPattern: { type: Array } },
  data() {
    return {
      lastGeneratedContent: '',
      rawResult: '',
      rawStatusCode: null,
      statusCode: null,
      statusCodeTransformDetail: '',
      content: '',
      isRunned: false,
      error: '',
      transformedResult: '',
      transformedParam: ''
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    resetTestResult() {
      // 新一轮测试先移除上一轮诊断内容；解析或请求失败也不能继续展示旧成功结果。
      this.rawResult = '';
      this.rawStatusCode = null;
      this.statusCode = null;
      this.statusCodeTransformDetail = '';
      this.transformedResult = '';
      this.transformedParam = '';
      this.error = '';
      this.isRunned = false;
    },
    // 只美化实际收到的 JSON 文本，空响应和未生成的转换结果保持为空。
    formatResponse(value) {
      if (!value) return value;
      try {
        return JSON.stringify(JSON.parse(value), null, 2);
      } catch (e) {
        return value;
      }
    },
    test: function(callback) {
      this.resetTestResult();
      if (this.content || this.isMcp) {
        try {
          let param = this.content ? JSON.parse(this.content) : {};
          this.integration.paramObj = param;
          this.$api.framework.integration
            .testIntegration(this.integration)
            .then(res => {
              if (res.Status == 'OK') {
                this.rawStatusCode = res.Return.rawStatusCode;
                this.statusCode = res.Return.statusCode;
                this.statusCodeTransformDetail = res.Return.statusCodeTransformDetail;
                this.rawResult = this.formatResponse(res.Return.rawResult);
                this.transformedResult = this.formatResponse(res.Return.transformedResult);
                this.transformedParam = res.Return.transformedParam;
                this.error = res.Return.error;
              }
              this.isRunned = true;
              callback();
            })
            .catch(error => {
              if (error && error.data && error.data.Message) {
                this.$Message.error(error.data.Message);
              } else {
                console.error(error);
                this.$Message.error(this.$t('term.framework.requestfail'));
              }
              callback();
            });
        } catch (e) {
          console.error(e);
          this.$Message.error(this.$t('term.framework.paramformaterror'));
          callback();
        }
      } else {
        this.$Message.error(this.$t('term.framework.noparam'));
        callback();
      }
    },
    buildJson: function(elements, type) {
      let json = {};
      elements.forEach(element => {
        // 示例优先使用当前有效的输入默认值，深拷贝防止手工测试污染配置。
        if (isDefaultEnabled(element.defaultConfig) && !validateDefaultConfig(element, element.defaultConfig)) {
          json[element.name] = cloneJson(element.defaultConfig.value);
        } else if (element.children && element.children.length) {
          json[element.name] = this.buildJson(element.children, element.type);
        } else {
          // 历史自定义参数可能没有 typeName，也必须生成对应的测试入口。
          json[element.name] = defaultTypeName(element.type, element.typeName || element.type);
        }
      });
      if (type === 'jsonArray' || type === 'array') {
        return [json];
      } else {
        return json;
      }
    }
  },
  filter: {},
  computed: {
    isMcp: function() {
      return this.integration && this.integration.method === 'mcp';
    },
    computedContent: function() {
      return JSON.stringify(this.buildJson(this.paramList), null, 2);
    },
    // 测试请求只合并输入，输出定义不得混入生成的请求参数。
    paramList() {
      return mergeIntegrationParams(withPatternMode(this.handlerPattern, 'input'), this.integration && this.integration.config && this.integration.config.param, 'input', this.integration && this.integration.handler);
    }
  },
  watch: {
    computedContent: {
      handler: function(val) {
        // 仅更新未经手动修改的示例；异步规范回显和参数变更不得清空用户测试数据。
        if (this.content === this.lastGeneratedContent) this.content = val;
        this.lastGeneratedContent = val;
      },
      immediate: true
    }
  }
};
</script>
