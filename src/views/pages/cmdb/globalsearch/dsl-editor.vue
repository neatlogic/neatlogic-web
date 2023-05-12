<template>
  <div>
    <div class="container" @click="focusInputer">
      <span
        v-for="(word, index) in wordList"
        :key="index"
        :class="{ 'mr-xs': word.isEnd, 'text-error': !!word.error }"
        @click.stop="changeWord(word)"
      >
        <span v-if="!word.isEditing" class="span-text">{{ word.content }}</span>
        <input
          v-else
          :ref="'inputer_' + word.uuid"
          v-model="word.editContent"
          autofocus="autofocus"
          class="inputer"
          :size="word.editContent.length || 1"
          @click="getCursorPosition(word.uuid)"
          @keydown.stop="
            event => {
              if (event.key == 'Enter') {
                autoComplete(word);
              } else if (event.key === 'Backspace') {
                if (word.editContent == '') {
                }
              } else if (event.key == 'Tab') {
                loopPrediction();
                event.returnValue = false;
              }
            }
          "
          @blur.stop="
            () => {
              $set(word, 'isEditing', false);
              $set(word, 'editContent', '');
              isPredictionReady = false;
            }
          "
          @input.stop="
            event => {
              isPredictionReady = true;
              getPredictionAttrRelList(word.editContent);
            }
          "
        />
      </span>
      <!--<input
        ref="inputer"
        v-model="inputValue"
        class="inputer"
        :size="(inputValue && inputValue.length) || 1"
        @blur="blurInputer"
        @keydown.stop="event=>{
          if (event.key === 'Backspace') {
            if (inputValue === '') {
              if (charts.length > 0) {
                charts.splice(charts.length - 1, 1);
                event.returnValue = false;
              }
            }
          } else if (event.key === 'Tab') {
            loopPrediction();
            event.returnValue = false;
          } else if (event.key === 'Enter') {
            autoComplete();
            event.returnValue = false;
          }
        }"
        @focus="focusInputer"
        @input="
          event => {
            addInputValue();
            getPredictionAttrRelList();
          }
        "
      />-->
    </div>
    <div v-if="isPredictionReady">
      <div
        v-for="(item, index) in predictions"
        :key="index"
        class="predictionTag radius-md"
        :class="item.selected ? 'selected' : ''"
        @click="autoComplete()"
      >
        <span v-if="item.label">{{ item.label }}</span>
        <span v-if="item.name && item.label" class="text-grey">({{ item.name }})</span>
        <span v-if="item.name && !item.label">{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>
<script>
//import jsep from 'jsep';
//jsep.addBinaryOp('include');
//jsep.addBinaryOp('exclude');
//jsep.removeAllUnaryOps();
export default {
  name: '',
  components: {
    //TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  props: {
    ciId: { type: Number }
  },
  data() {
    return {
      TYPELIST: ['attr', 'quota_left', 'quota_right', 'bracket_left', 'bracket_right', 'calculate_expression', 'compare_expression', 'logical_expression', 'text_value', 'number_value', 'null_value'],
      currentItem: null,
      inputWidth: '1.5ch',
      inputValue: '',
      isAttrRelListShow: false,
      compareWords: ['==', '>=', '<=', '>', '<', '!=', 'include', 'exclude'],
      calculateWords: ['+', '-', '*', '/'],
      logicalWords: ['&&', '||'],
      compressWords: [' ', '.'],
      brackeyWords: ['(', ')', '[', ']'],
      quotaWords: ['"'],
      wordList: [],
      astData: {}, //语法分析树
      words: [], //词列表，词与词之间用空格分隔
      charts: [], //单字符，记录所有的输入字符，如果是连续空格则只保留一个
      attrRelList: [],
      attrRelMap: {}, //根据模型id存放列表
      predictionTokens: [], //备选关键字列表
      timmer: null, //搜索延时
      isPredictionReady: false, //预测是否显示
      cursorIndex: null //光标位置
    };
  },
  beforeCreate() {},
  created() {
    if (this.ciId) {
      this.getAttrRelList(this.ciId);
    }
    this.convertWordToCharts('&&abc');
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    keypressForEditInputer(event) {
      if (event.key == 'Tab') {
        this.loopPrediction();
        event.returnValue = false;
      }
    },
    getCursorPosition(uuid) {
      console.log(this.$refs['inputer_' + uuid][0].selectionStart);
    },
    enterWord(word, event) {
      if (event.key == 'Enter') {
        this.charts.splice(word.startIndex, word.endIndex - word.startIndex, ...this.convertWordToCharts(word.editContent));
      }
    },
    inputWord(word, event) {
      //console.log(word, event);
    },
    changeWord(word) {
      this.$set(word, 'isEditing', true);
      this.$set(word, 'editContent', word.content);
      this.$nextTick(() => {
        this.$refs['inputer_' + word.uuid][0].focus();
      });
    },
    isMatchToken(str, token) {
      let t = '';
      let index = -1;
      for (let i = 0; i < token.length; i++) {
        t += token[i];
        if (str.includes(t)) {
          index = str.lastIndexOf(t);
        } else {
          if (index > -1) {
            if (str.length - index < t.length) {
              return true;
            } else {
              return false;
            }
          } else {
            return false;
          }
        }
      }
      return false;
      //incainc  include
    },
    convertWordToCharts(word) {
      for (let i = 0; i < this.tokens.length; i++) {
        let token = '([^\\s])?(';

        for (let t = 0; t < this.tokens[i].length; t++) {
          token += '\\' + this.tokens[i][t];
        }
        token += ')([^\s])?';
        word = word.replace(new RegExp(token, 'g'), '$1 $2 $3');
      }
      word = word.replace(/\s+?/g, ' ');

      const charts = [];
      word.split('').forEach(w => {
        charts.push({ uuid: this.$utils.setUuid(), content: w });
      });

      return charts;
    },
    appendChart(c) {
      if (c != ' ') {
        const chartData = {};
        chartData.uuid = this.$utils.setUuid();
        chartData.content = c;
        this.charts.push(chartData);
        //自动给特殊字符前后加空格进行分隔
        //最长匹配token
        let startIndex = 0;
        for (let i = this.charts.length - 1; i >= 0; i--) {
          if (this.charts[i].content == ' ') {
            startIndex = i;
            break;
          }
        }
        if (this.charts.length - startIndex > 0) {
          let str = '';
          this.charts.slice(startIndex).forEach(c => {
            str += c.content;
          });
          let isHit = false;
          let matchCount = 0;
          let offsetIndex = -1;
          let tokenLength = 0;
          for (let i = 0; i < this.tokens.length; i++) {
            const token = this.tokens[i];
            if (str.includes(token)) {
              //取最长匹配
              if (!isHit || (isHit && tokenLength < token.length)) {
                isHit = true;
                offsetIndex = str.lastIndexOf(token);
                tokenLength = token.length;
              }
            } else if (this.isMatchToken(str, token)) {
              //近似的字符
              matchCount += 1;
            }
          }
          if (isHit && matchCount == 0) {
            //前后补充空格分割字符串
            this.charts.splice(startIndex + offsetIndex, 0, { uuid: this.$utils.setUuid(), content: ' ' });
            this.charts.splice(startIndex + offsetIndex + tokenLength + 1, 0, { uuid: this.$utils.setUuid(), content: ' ' });
          }
        }
      } else {
        if (this.charts[this.charts.length - 1] != ' ') {
          const chartData = {};
          chartData.uuid = this.$utils.setUuid();
          chartData.content = c;
          this.charts.push(chartData);
        }
      }
    },
    formateWord(word) {
      if (word == ' ') {
        return '&nbsp;';
      }
      return word;
    },
    blurInputer() {
      this.isPredictionReady = false;
    },
    focusInputer() {
      const word = this.wordList[this.wordList.length - 1];
      this.changeWord(word);
      //this.$refs['inputer'].focus();
      //this.getPredictionAttrRelList();
      //this.isPredictionReady = true;
    },
    loopPrediction() {
      if (this.predictions && this.predictions.length > 0) {
        const selectedIndex = this.predictions.findIndex(element => element.selected);
        if (selectedIndex == -1) {
          this.$set(this.predictions[0], 'selected', true);
        } else {
          if (selectedIndex == this.predictions.length - 1) {
            this.$set(this.predictions[selectedIndex], 'selected', false);
            this.$set(this.predictions[0], 'selected', true);
          } else {
            this.$set(this.predictions[selectedIndex], 'selected', false);
            this.$set(this.predictions[selectedIndex + 1], 'selected', true);
          }
        }
      }
    },
    addInputValue() {
      if (this.inputValue && this.inputValue.length > 0) {
        for (let i = 0; i < this.inputValue.length; i++) {
          //压缩空格
          let v = this.inputValue[i];
          let need = true;
          if (this.compressWords.includes(v) && this.charts[this.charts.length - 1].content == v) {
            need = false;
          }
          if (need) {
            this.appendChart(v);
          }
        }
        this.inputValue = '';
      }
    },
    async getAttrRelList(ciId) {
      if (ciId == -1) {
        return [];
      }
      if (!this.attrRelMap[ciId]) {
        await this.$api.cmdb.ci.searchCiAttrRel(ciId).then(res => {
          this.attrRelMap[ciId] = res.Return;
        });
      }
      return this.$utils.deepClone(this.attrRelMap[ciId]);
    },
    async getPredictionAttrRelList(word) {
      let attrRelList = [];
      const s = typeof word === 'undefined' ? this.currentKeyword.split('.') : word.split('.');
      let currentCiId = this.ciId;
      let prefix = '';
      while (s.length > 0) {
        attrRelList = await this.getAttrRelList(currentCiId);
        const keyword = s.splice(0, 1)[0];
        attrRelList = attrRelList.filter(d => keyword == '' || d.name.toLowerCase().indexOf(keyword.toLowerCase()) > -1);
        const item = attrRelList.find(d => d.name.toLowerCase() == keyword.toLowerCase());
        if (item && item.targetCiId) {
          currentCiId = item.targetCiId;
          if (prefix) {
            prefix += '.';
          }
          prefix = prefix + item.name;
        } else {
          currentCiId = -1; //代表没有匹配到模型
        }
      }
      this.attrRelList = attrRelList;
    },
    autoComplete(word) {
      let selectedItem;
      if (this.predictions.length > 0) {
        selectedItem = this.predictions.find(element => element.selected);
      }
      if (selectedItem) {
        let keywordPrefix = '';
        if (word.editContent && word.editContent.indexOf('.') > -1) {
          keywordPrefix = word.editContent.substr(0, word.editContent.lastIndexOf('.'));
        }
        if (word.editContent !== selectedItem.name) {
          if (keywordPrefix) {
            word.editContent = keywordPrefix + '.' + selectedItem.name;
          } else {
            word.editContent = selectedItem.name;
          }
        }
      }
      this.charts.splice(word.startIndex, word.endIndex - word.startIndex, ...this.convertWordToCharts(word.editContent));
    },
    validateWord(wordData) {
      const content = wordData.content;
      if (this.compareWords.includes(content)) {
        wordData.type = 'compare_expression';
      } else if (this.calculateWords.includes(content)) {
        wordData.type = 'calculate_expression';
      } else if (this.logicalWords.includes(content)) {
        wordData.type = 'logical_expression';
      } else if (content == 'null') {
        wordData.type = 'null_value';
        if (this.lastWord == null || this.lastWord.type != 'calculate_expression') {
          wordData.error = '值前面需要是计算符号';
        }
      } else if (content.startsWith('"')) {
        wordData.type = 'string_value';
        if (!content.endsWith('"')) {
          wordData.error = '请补充结束双引号';
        } else if (this.lastWord == null || this.lastWord.type != 'compare_expression') {
          wordData.error = '值前面需要是比较符号';
        }
      } else if (!isNaN(parseFloat(content))) {
        wordData.type = 'number_value';
        if (this.lastWord == null || this.lastWord.type != 'compare_expression') {
          wordData.error = '值前面需要是比较运算符';
        }
      } else if (this.brackeyWords.includes(content)) {
        wordData.type = 'brackey';
      } else {
        wordData.type = 'attr';
      }
    }
  },
  filter: {},
  computed: {
    tokens() {
      return [...this.brackeyWords, ...this.calculateWords, ...this.compareWords, ...this.logicalWords].sort((a, b) => {
        return b.length - a.length;
      });
    },
    lastWord() {
      if (this.wordList && this.wordList.length > 0) {
        return this.wordList[this.wordList.length - 1];
      }
      return null;
    },
    keywordPrefix() {
      //如果输入值带.，则返回除了最后一位的其他部分，用于自动完成完整的属性
      if (this.inputValue) {
        if (this.inputValue.indexOf('.') > -1) {
          return this.inputValue.substr(0, this.inputValue.lastIndexOf('.'));
        }
      }
      return '';
    },
    keyword() {
      if (this.inputValue) {
        if (this.inputValue.indexOf('.') == -1) {
          return this.inputValue;
        } else if (this.inputValue.endsWith('.')) {
          return '';
        } else {
          const s = this.inputValue.split('.');
          return s[s.length - 1];
        }
      }
      return '';
    },
    predictions() {
      return [...this.attrRelList, ...this.predictionTokens];
    },
    currentKeyword() {
      //当前需要预测的关键字
      if (this.wordList && this.wordList.length > 0) {
        const lastWord = this.wordList[this.wordList.length - 1];
        if (lastWord.type == 'attr') {
          return lastWord.content;
        }
      }
      return '';
    }
  },
  watch: {
    charts: {
      handler: function(val) {
        const charts = val;
        this.wordList.splice(0);
        const tokens = [...this.brackeyWords, ...this.calculateWords, ...this.compareWords, ...this.logicalWords];
        if (charts && charts.length > 0) {
          const subWordList = [];
          let startIndex = 0;
          let wordIndex = 0;
          charts.forEach((c, index) => {
            if (c.content != ' ') {
              if (subWordList.length == 0) {
                startIndex = index;
              }
              subWordList.push(c.content);
            } else {
              if (subWordList.length > 0) {
                const wordData = {};
                wordData.index = wordIndex;
                wordData.content = subWordList.join('');
                wordData.isEnd = true;
                wordData.startIndex = startIndex;
                wordData.endIndex = index;
                this.validateWord(wordData);
                this.wordList.push(wordData);
                wordIndex += 1;
                subWordList.splice(0);
                startIndex = 0;
              }
            }
          });
          if (subWordList.length > 0) {
            const wordData = {};
            wordData.index = wordIndex;
            wordData.isEnd = false; //没有接收到空格代表当前word还不完整
            wordData.content = subWordList.join('');
            wordData.startIndex = startIndex;
            wordData.endIndex = charts.length;
            this.validateWord(wordData);
            this.wordList.push(wordData);
          }
        }
        if (this.wordList.length == 0) {
          //如果没有任何内容，添加一个空词，用于输入
          const wordData = {};
          wordData.index = 0;
          wordData.isEnd = false;
          wordData.content = '';
          wordData.startIndex = 0;
          wordData.endIndex = 1;
          this.wordList.push(wordData);
        }
      },
      deep: true,
      immediate: true
    },
    wordList: {
      handler: function(val) {
        if (this.wordList && this.wordList.length > 0) {
          const lastWord = this.wordList[this.wordList.length - 1];
          if (!lastWord || (lastWord.type == 'attr' && !lastWord.isEnd) || lastWord.type == '') {
            this.isPredictionReady = true;
            this.getPredictionAttrRelList();
          }
        }
      }
    }
  }
};
</script>
<style lang="less" scoped>
.container {
  margin-top: 1px; //为了上border可以显示
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 5px;
  .inputer {
    display: inline-block;
    border: 0px;
    outline: none;
    background: transparent;
  }
}
.span-text {
  display: inline-block;
}
.predictionTag {
  display: inline-block;
  padding: 3px 5px;
  background: #eee;
  margin: 5px 5px 0px 0px;
}
.selected {
  color: #fff;
  background: darkblue;
}
</style>
