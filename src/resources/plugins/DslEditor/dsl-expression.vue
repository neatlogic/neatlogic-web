<template v-if="expressionData">
  <span v-if="expressionData">
    <span v-if="expressionData.type === 'expression' && expressionData.attr">
      <span class="item text-warning attr">
        <i class="text-href">{{ expressionData.attr }}</i>
        <!--<Poptip :transfer="true">
          <a>{{ expressionData.attr }}</a>
          <div slot="title"><i>Custom title</i></div>
          <div slot="content">asdfasdfasfasfafdas</div>
        </Poptip>-->
      </span>
      <span class="item text-grey expression">
        <b>{{ expressionData.connector }}</b>
      </span>
      <span class="item" :class="getValueClass(expressionData.valuetype)">{{ expressionData.value }}</span>
      <span v-show="isNeedInputer" class="item">
        <input
          ref="focusinputer"
          class="inputer"
          type="text"
          @keydown="backspace"
          @input="input"
        />
      </span>
    </span>
    <span v-else-if="expressionData.type === 'join' && expressionData.left && expressionData.right && isValid(expressionData.left) && isValid(expressionData.right)">
      <DslExpression v-if="expressionData.left" :needInputer="false" :expressionData="expressionData.left"></DslExpression>
      <span class="item text-grey expression">
        <b>{{ expressionData.connector }}</b>
      </span>
      <DslExpression
        v-if="expressionData.right"
        :ref="nextNeedInputer ? 'focusinputer' : 'inputer'"
        :needInputer="nextNeedInputer"
        :expressionData="expressionData.right"
        @input="input"
        @backspace="backspace"
      ></DslExpression>
    </span>
    <span v-else-if="expressionData.type === 'group' && expressionData.children && expressionData.children.length > 0">
      <span class="item text-grey expression"><b>(</b></span>
      <DslExpression
        v-for="(child, index) in expressionData.children"
        :key="index"
        :ref="nextNeedInputer ? 'focusinputer' : 'inputer'"
        :needInputer="nextNeedInputer"
        :expressionData="child"
        @input="input"
        @backspace="backspace"
      ></DslExpression>
      <span class="item text-grey expression"><b>)</b></span>
      <span v-show="isNeedInputer" class="item">
        <input
          ref="focusinputer"
          class="inputer"
          type="text"
          @keydown="backspace"
          @input="input"
        />
      </span>
    </span>
  </span>
</template>
<script>

export default {
  name: '',
  components: {
    DslExpression: resolve => require(['@/resources/plugins/DslEditor/dsl-expression.vue'], resolve)
  },
  props: {
    needInputer: { type: Boolean, default: false },
    expressionData: { type: Object }
  },
  data() {
    return {
      nextNeedInputer: false //用户传递到下层dslexpression
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (this.needInputer && this.expressionData && this.expressionData.type === 'join') {
      this.nextNeedInputer = true;
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    focus() {
      const input = this.$refs['focusinputer'];
      input && input.focus();
    },
    backspace(e) {
      if (!e || e.keyCode == 8 || e.keyCode == 46) {
        this.$emit('backspace');
      }
    },
    input(e) {
      let v = '';
      if (e.data) {
        v += e.data;
      } else if (e.inputType === 'insertFromPaste') {
        v += e.target.value;
      } else {
        v += e;
      }
      if (e.target) {
        e.target.value = '';
      }
      this.$emit('input', v);
    },
    isValid(expressionData) {
      if (expressionData) {
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
  computed: {
    isNeedInputer() {
      if (this.needInputer && this.expressionData && ['expression', 'group'].includes(this.expressionData.type)) {
        return true;
      }
      return false;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.inputer {
  outline: none;
  width: 20px;
  border: 0px;
  height: 100%;
  background: transparent;
}
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
