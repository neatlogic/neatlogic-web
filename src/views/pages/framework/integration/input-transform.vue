<template>
  <div>
    <Alert show-icon>
      {{ $t('page.help') }}：
      <template slot="desc">
        <div>{{ $t('message.framework.jshelp') }}</div>
        <JavascriptHelp></JavascriptHelp>
      </template>
    </Alert>
    <TsRow>
      <Col v-if="paramList.length" :span="10">
        <Table
          size="small"
          row-key="_integrationParamKey"
          :columns="columns"
          :data="paramList"
          border
        ></Table>
      </Col>
      <Col v-if="paramList.length" :span="1">
        <i class="tsfont-double-arrow-right"></i>
      </Col>
      <Col :span="paramList.length ? 13 : 24">
        <TsCodemirror :value.sync="content" height="300px"></TsCodemirror>
        <TransformTest :content="content"></TransformTest>
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
        { title: this.$t('page.type'), key: 'typeName' }
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
  methods: {},
  filter: {},
  computed: {
    // 转换提示同时列出固定和自定义输入，树行键保留层级，编辑权限不影响展示。
    paramList() {
      return withParamRowKeys(mergeIntegrationParams(withPatternMode(this.handlerPattern, 'input'), this.integration && this.integration.config && this.integration.config.param, 'input'));
    },
    savedContent() {
      return (this.integration && this.integration.config && this.integration.config.input && this.integration.config.input.content) || '';
    }
  },
  watch: {
    // 仅回显对应脚本，避免其它配置更新覆盖尚未同步的编辑内容。
    savedContent: {
      handler(val) {
        if (val !== this.content) this.content = val;
      },
      immediate: true
    },
    content(val) {
      if (val !== this.savedContent) this.$emit('setInput', {content: val});
    }
  }
};
</script>
<style lang="less"></style>
