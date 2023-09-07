<template>
  <div class="item-container">
    <div v-if="expressionData.type === 'expression' && expressionData.attr" class="item-container">
      <div class="item text-warning attr">
        <Poptip :transfer="true">
          <a>{{ expressionData.attr }}</a>
          <div slot="title"><i>Custom title</i></div>
          <div slot="content">asdfasdfasfasfafdas</div>
        </Poptip>
      </div>
      <div class="item text-grey expression">
        <b>{{ expressionData.connector }}</b>
      </div>
      <div class="item" :class="getValueClass(expressionData.valuetype)">{{ expressionData.value }}</div>
    </div>
    <div v-else-if="expressionData.type === 'join' && expressionData.left && expressionData.right && isValid(expressionData.left) && isValid(expressionData.right)" class="item-container">
      <DslExpression v-if="expressionData.left" :expressionData="expressionData.left"></DslExpression>
      <div class="item text-grey expression">
        <b>{{ expressionData.connector }}</b>
      </div>
      <DslExpression v-if="expressionData.right" :expressionData="expressionData.right"></DslExpression>
    </div>
    <div v-else-if="expressionData.type === 'group' && expressionData.children && expressionData.children.length > 0" class="item-container">
      <div class="item text-grey expression"><b>(</b></div>
      <DslExpression v-for="(child, index) in expressionData.children" :key="index" :expressionData="child"></DslExpression>
      <div class="item text-grey expression"><b>)</b></div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    DslExpression: resolve => require(['@/resources/plugins/DslEditor/dsl-expression.vue'], resolve)
  },
  props: {
    expressionData: { type: Object }
  },
  data() {
    return {};
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
    isValid(expressionData) {
      if (expressionData.type === 'expression') {
        if (expressionData.attr) {
          return true;
        }
      } else if (expressionData.type === 'join') {
        if (expressionData.left && expressionData.right) {
          return true;
        }
      } else if (expressionData.type === 'group') {
        return true;
      }
      return false;
    },
    getValueClass(valuetype) {
      if (valuetype === 'number') {
        return 'text-primary';
      } else if (valuetype === 'string') {
        return 'text-error';
      } else if (valuetype === 'calc') {
        return 'text-success';
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.item-container {
  display: inline-block;
}
.item {
  display: inline-block;
  padding: 0px 2px;
  vertical-align: bottom;
}
.expression {
  font-weight: bold;
  font-size: 12px;
}
.attr {
  font-style: italic;
  font-weight: bold;
}
</style>
