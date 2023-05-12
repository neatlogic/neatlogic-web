<template>
  <div>
    <Alert show-icon>
      {{ $t('page.help') }}：
      <template slot="desc">
        <div>编写javascript，将返回结果转换成新的数据格式，返回结果不符合json格式或不定义转换规则，则直接返回原结果。</div>
        <JavascriptHelp></JavascriptHelp>
      </template>
    </Alert>
    <TsRow>
      <Col :span="(allowEditParam == 0 && handlerPattern && handlerPattern.length > 0) || (allowEditParam == 1 && paramList && paramList.length > 0) > 0 ? 13 : 24">
        <TsCodemirror :value.sync="content" height="300px"></TsCodemirror>
        <TransformTest :content="content"></TransformTest>
      </Col>
      <Col v-if="(allowEditParam == 0 && handlerPattern && handlerPattern.length > 0) || (allowEditParam == 1 && paramList && paramList.length > 0)" :span="1">
        <i class="ts-angle-double-right"></i>
      </Col>
      <Col v-if="allowEditParam == 0 && handlerPattern && handlerPattern.length > 0" :span="10">
        <Table
          size="small"
          row-key="name"
          :columns="columns"
          :data="handlerPattern"
          border
        ></Table>
      </Col>
      <Col v-if="allowEditParam == 1 && paramList && paramList.length > 0" :span="10">
        <Table
          size="small"
          row-key="name"
          :columns="columns"
          :data="paramList"
          border
        ></Table>
      </Col>
    </TsRow>
  </div>
</template>
<script>
export default {
  components: { 
    TransformTest: resolve =>
      require(['./transform-test.vue'], resolve),
    TsCodemirror: resolve =>
      require(['@/resources/plugins/TsCodemirror/TsCodemirror.vue'], resolve), 
    JavascriptHelp: resolve =>
      require(['./javascript-help.vue'], resolve) },
  props: {
    integration: { type: Object },
    handlerPattern: { type: Array },
    allowEditParam: { type: Number }
  },
  data() {
    return {
      paramList: [],
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
  methods: {
  },
  filter: {},
  computed: {},
  watch: {
    integration: {
      handler: function(val) {
        if (val.config.output) {
          this.content = val.config.output.content;
        } else {
          this.content = '';
        }
        this.paramList = [];
        if (val.config.param && val.config.param.paramList) {
          val.config.param.paramList.forEach(element => {
            if (element.name && element.type && element.mode == 'output') {
              this.paramList.push(element);
            }
          });
        }
      },
      deep: true
    },
    content: {
      handler: function(val) {
        this.$emit('setOutput', { content: val });
      },
      deep: true
    }
  }
};
</script>
<style lang="less"></style>
