<template>
  <div style="position: relative">
    <div class="expression-container pb-xs mb-xs" @click="$refs['input'] && $refs['input'].focus()">
      <DslExpression
        v-if="expressionData"
        ref="input"
        :expressionData="expressionData"
        :needInputer="true"
        @backspace="del"
        @input="input"
      ></DslExpression>
      <!--<pre v-else class="expression-original text-grey">{{ valueLocal }}</pre>-->
      <div v-else><Input
        ref="input-textarea"
        v-model="valueLocal"
        :autosize="{ minRows: 1 }"
        type="textarea"
        class="text-grey inputer-textarea"
      /></div>
      <!--<div v-if="expressionData" class="inputer-container"><input
        ref="input"
        class="inputer"
        type="text"
        @keyup="del"
        @input="input"
      /></div>-->
    </div>
    <div class="text-grey" style="line-height: 20px">帮助：输入表达式进行高级搜索，如果需要搜索关系或引用属性字段，可以使用a.b表示，例如env.name == "STG" && (port == 80 || port == 443 )</div>
    <div style="line-height: 20px">
      <span class="mr-xs text-grey">{{ $t('page.compareexpression') }}:</span>
      <Tag
        v-for="(op, index) in opList"
        :key="index"
        class="cursor"
        @click.native="chooseAttr(op)"
      >{{ op }}</Tag>
    </div>
    <div style="line-height: 20px">
      <span class="mr-xs text-grey">{{ $t('page.logicalexpression') }}:</span>
      <Tag
        v-for="(op, index) in joinList"
        :key="index"
        class="cursor"
        @click.native="chooseAttr(op)"
      >{{ op }}</Tag>
    </div>
    <div v-if="suggestList && suggestList.length > 0" style="line-height: 20px">
      <span class="mr-xs text-grey">{{ $t('term.cmdb.attributelist') }}:</span>
      <Tag
        v-for="(suggest, index) in suggestList"
        :key="index"
        class="cursor"
        @click.native="chooseAttr(suggest)"
      >{{ suggest.text }}</Tag>
    </div>

    <div></div>
  </div>
</template>
<script>
import antlr4 from 'antlr4';
import CmdbDSLLexer from './parser/ErrorLexer';
import CmdbDSLParser from './parser/CmdbDSLParser';
import CmdbDSLVisitor from './parser/CmdbDSLVisitor.js';
import ErrorListener from './parser/ErrorListener.js';
export default {
  name: '',
  components: {
    DslExpression: resolve => require(['@/resources/plugins/DslEditor/dsl-expression.vue'], resolve)
  },
  props: {
    value: { type: String },
    suggestList: { type: Array }
  },
  data() {
    return {
      opList: ['>', '<', '==', '>=', '<=', 'like', 'not like', 'exclude', 'include'],
      joinList: ['&&', '||'],
      valueLocal: this.value || '',
      expressionData: null,
      keyword: {},
      tmpValue: '',
      timmer: null //延时执行避免一次爆发太多请求
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
    resize(e) {
      const textarea = this.$refs['input-textarea'];
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
      }
    },
    del(e) {
      this.valueLocal = this.valueLocal.slice(0, -1);
    },
    input(value) {
      this.valueLocal += value;
    },
    chooseAttr(op) {
      if (this.valueLocal.endsWith(' ')) {
        this.valueLocal += (typeof op === 'object' ? op.value : op);
      } else {
        this.valueLocal += ' ' + (typeof op === 'object' ? op.value : op);
      }
    },
    createAst(input) {
      try {
        const inputStream = new antlr4.InputStream(input);
        const lexer = new CmdbDSLLexer(inputStream);
        const tokenStream = new antlr4.CommonTokenStream(lexer);
        const parser = new CmdbDSLParser(tokenStream);
        // 添加自定义的ErrorListener
        const errorListener = new ErrorListener();
        parser.removeErrorListeners(); // 移除默认的ErrorListener
        parser.addErrorListener(errorListener);
        // 以你的起始规则作为开始
        const parseTree = parser.expressions();
        const expressionList = [];
        const attrList = [];
        const visitor = new CmdbDSLVisitor(expressionList, attrList);
        visitor.visit(parseTree);
        this.expressionData = visitor.getRootExpression() || null;
        if (this.expressionData) {
          this.valueLocal = this.rewriteValue(this.expressionData);
          this.$emit('input', this.valueLocal);
        }
      } catch (e) {
        this.expressionData = null;
        //console.error('解释异常', e);
      }
    },
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
    //使用合法数据刷新value值
    rewriteValue(expressionData) {
      let value = '';
      if (expressionData) {
        if (expressionData.type === 'expression' && expressionData.attr) {
          value += expressionData.attr + ' ' + expressionData.connector + ' ' + expressionData.value;
        } else if (expressionData.type === 'join' && expressionData.left && expressionData.right && this.isValid(expressionData.left) && this.isValid(expressionData.right)) {
          value += this.rewriteValue(expressionData.left) + ' ' + expressionData.connector + ' ' + this.rewriteValue(expressionData.right);
        } else if (expressionData.type === 'group' && expressionData.children && expressionData.children.length > 0) {
          value += '(';
          expressionData.children.forEach(child => {
            value += this.rewriteValue(child);
          });
          value += ')';
        }
      }
      return value;
    }
    /*createKeyword() {
      const input = this.$refs.input;
      this.keyword = {};
      const stopWords = ['+', '-', '*', '/', '"', '&', '|', "'", ' '];
      if (input) {
        const index = input.selectionStart;
        if (index > 0 && this.value) {
          this.$set(this.keyword, 'start', index - 1);
          this.$set(this.keyword, 'end', index);
          for (let i = index - 1; i >= 0; i--) {
            if (stopWords.includes(this.value[i])) {
              break;
            }
            this.$set(this.keyword, 'start', i);
          }

          for (let i = index; i < this.value.length; i++) {
            if (stopWords.includes(this.value[i])) {
              break;
            }
            this.$set(this.keyword, 'end', i + 1);
          }
          if (typeof this.keyword.start != 'undefined' && typeof this.keyword.end != 'undefined') {
            let str = '';
            for (let i = this.keyword.start; i < this.keyword.end; i++) {
              str += this.value[i];
            }

            const regex = /^[a-zA-Z]+(\.[a-zA-Z]+)*$/;
            if (str && regex.test(str)) {
              this.$set(this.keyword, 'value', str);
              if (this.timmer) {
                window.clearTimeout(this.timmer);
              }
              this.timmer = window.setTimeout(() => {
                this.$emit('getSuggestList', this.keyword);
              }, 500);
            } else {
              this.keyword = {};
              this.$emit('clearSuggestList');
            }
          }
        }
      }
    }*/
  },
  filter: {},
  computed: {},
  watch: {
    valueLocal: {
      handler: function(val) {
        this.createAst(val);
        //this.createKeyword();
      },
      immediate: true
    },
    expressionData: {
      handler: function(val) {
        this.$nextTick(() => {
          if (val) {
            this.$refs['input'] && this.$refs['input'].focus();
          } else {
            this.$refs['input-textarea'] && this.$refs['input-textarea'].focus();
          }
        });
      }
    }
  }
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
.inputer-textarea {
  /deep/.ivu-input {
    outline: none;
    border-width: 0px !important;
    background: transparent;
  }
}
.expression-container {
  border-bottom: 1px solid #ccc;
  min-height: 30px;
  //white-space: norwap;
}
.expression-original {
  margin: 0px;
  display: inline-block;
  vertical-align: bottom;
  letter-spacing: -1px;
  font-size: 12px;
  word-break: break-all;
  white-space: normal;
}
.inputer-container {
  display: inline-block;
  height: 100%;
}
</style>
