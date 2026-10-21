<template>
  <div>
    <Alert show-icon>
      {{ $t('page.help') }}：
      <template slot="desc">
        <div>{{ $t('term.framework.outputtransformhelp') }}</div>
        <JavascriptHelp></JavascriptHelp>
      </template>
    </Alert>
    <TsRow>
      <Col :span="paramList.length ? 13 : 24">
        <TsCodemirror :value.sync="content" height="300px"></TsCodemirror>
        <TransformTest :content="content"></TransformTest>
      </Col>
      <Col v-if="paramList.length" :span="1">
        <i class="tsfont-double-arrow-right"></i>
      </Col>
      <Col v-if="paramList.length" :span="10">
        <Table
          size="small"
          row-key="_integrationParamKey"
          :columns="columns"
          :data="paramList"
          border
        ></Table>
      </Col>
    </TsRow>
  </div>
</template>
<script>
import {mergeIntegrationParams, withParamRowKeys, withPatternMode} from './integration-param-utils.js';

export default {
  components: {
    TransformTest: () => import('./transform-test.vue'),
    TsCodemirror: () => import('@/resources/plugins/TsCodemirror/TsCodemirror.vue'),
    JavascriptHelp: () => import('./javascript-help.vue') },
  props: {
    integration: { type: Object },
    handlerPattern: { type: Array },
    allowEditParam: { type: Number }
  },
  data() {
    return {
      content: '',
      columns: [
        { title: this.$t('page.name'), key: 'name', tree: true },
        { title: this.$t('page.type'), key: 'typeText' }
      ]
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
  },
  filter: {},
  computed: {
    // 输出转换使用同一合并规则，同时保留固定和自定义输出定义。
    paramList() {
      // 按当前处理器关联固定默认值，保留输入输出隔离和完整子字段结构。
      return withParamRowKeys(mergeIntegrationParams(withPatternMode(this.handlerPattern, 'output'), this.integration && this.integration.config && this.integration.config.param, 'output', this.integration && this.integration.handler));
    },
    savedContent() {
      return (this.integration && this.integration.config && this.integration.config.output && this.integration.config.output.content) || '';
    }
  },
  watch: {
    // 仅观察输出脚本，初始化回显不触发配置重写，避免父子组件循环更新。
    savedContent: {
      handler(val) {
        if (val !== this.content) this.content = val;
      },
      immediate: true
    },
    content(val) {
      if (val !== this.savedContent) this.$emit('setOutput', {content: val});
    }
  }
};
</script>
<style lang="less"></style>
