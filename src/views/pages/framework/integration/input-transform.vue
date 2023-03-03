<template>
  <div>
    <Alert show-icon>
      帮助：
      <template slot="desc">
        <div>编写javascript，将原请求参数格式转换成目标地址所需的数据格式，原请求参数不符合json格式或不定义转换规则，则直接传送原请求参数。</div>
        <JavascriptHelp></JavascriptHelp>
      </template>
    </Alert>
    <TsRow>
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
      <Col v-if="(allowEditParam == 0 && handlerPattern && handlerPattern.length > 0) || (allowEditParam == 1 && paramList && paramList.length > 0)" :span="1">
        <i class="ts-angle-double-right"></i>
      </Col>
      <Col :span="(allowEditParam == 0 && handlerPattern && handlerPattern.length > 0) || (allowEditParam == 1 && paramList && paramList.length > 0) ? 13 : 24">
        <TsCodemirror :value.sync="content" height="300px"></TsCodemirror>
        <TransformTest :content="content"></TransformTest>
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
      content: '',
      paramList: [],
      columns: [
        { title: '名称', key: 'name', tree: true },
        { title: '类型', key: 'typeName' }
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
    config: function() {
      return { content: this.content };
    }
  },
  watch: {
    integration: {
      handler: function(val) {
        if (val.config.input) {
          this.content = val.config.input.content;
        } else {
          this.content = '';
        }
        this.paramList = [];
        if (val.config.param && val.config.param.paramList) {
          val.config.param.paramList.forEach(element => {
            if (element.name && element.type && element.mode == 'input') {
              this.paramList.push(element);
            }
          });
        }
      },
      deep: true
    },
    config: {
      handler: function(val) {
        this.$emit('setInput', val);
      },
      deep: true
    }
  }
};
</script>
<style lang="less"></style>
