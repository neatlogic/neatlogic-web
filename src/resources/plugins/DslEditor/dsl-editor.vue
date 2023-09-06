<template>
  <div style="position: relative">
    <div style="border-bottom:1px solid #ccc;" class="padding-xs" @click="$refs['input'].focus()">
      <DslExpression v-if="expressionData" :expressionData="expressionData"></DslExpression>
      <pre v-else style="display:inline-block">{{ value }}</pre>
      <div style="display:inline-block"><input
        ref="input"
        v-model="tmpValue"
        type="text"
        style="width:20px;border:0px;height:100%"
        @keyup="input"
      /></div>
    </div>
    <div v-if="keyword.value && suggestList && suggestList.length >0">
      <span class="mr-xs">关键字：</span><span class="mr-xs">{{ keyword.value }}</span>
      <span class="mr-xs">可选属性：</span>
      <Tag
        v-for="(suggest,index) in suggestList"
        :key="index"
        class="cursor"
        @on-click="chooseAttr(suggest)"
      >{{ suggest }}</Tag>
    </div>
  
  </div>
</template>
<script>
import antlr4 from 'antlr4';
import CmdbDSLLexer from './parser/CmdbDSLLexer';
import CmdbDSLParser from './parser/CmdbDSLParser';
import CmdbDSLVisitor from './parser/CmdbDSLVisitor.js';
import ErrorListener from './parser/ErrorListener.js';
export default {
  name: '',
  components: {
    DslExpression: resolve => require(['@/resources/plugins/DslEditor/dsl-expression.vue'], resolve)
  },
  props: {
    suggestList: {type: Array}
  },
  data() {
    return {
      exceptWordList: ['+', '-', '*', '/', '&&', '&', '|', '||', '[', ']', '(', ')', 'like', 'not like', 'exclude', 'include'],
      value: '',
      expressionData: null,
      keyword: {},
      tmpValue: '',
      timmer: null//延时执行避免一次爆发太多请求
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
    input(e) {
      if (e.keyCode == 8 || e.keyCode == 46) {
        if (this.value.length > 0) {
          this.value = this.value.slice(0, -1);
        }
      } else if (e.key.length === 1) {
        this.value += e.key;
      }
      this.tmpValue = '';
    },
    chooseAttr(suggest) {
      if (this.keyword && this.keyword.value && suggest) {
        const before = str.slice(0, this.keyword.start);
        const after = str.slice(this.keyword.end);
        console.log('b', this.value);
        this.value = before + suggest + after;
        console.log('a', this.value);
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
      } catch (e) {
        this.expressionData = null;
        console.error(e);
      }
    },
    createKeyword() {
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
    }
  },
  filter: {},
  computed: {
  },
  watch: {
    value: {
      handler: function(val) {
        this.createAst(val);
        this.createKeyword();
      }
    }
  }
};
</script>
<style lang="less"></style>
