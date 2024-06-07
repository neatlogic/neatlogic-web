<template>
  <div>
    <div
      class="container"
      @click="focusInputer"
    >
      <Tag v-for="(word, index) in words" :key="index">{{ word }}</Tag>
      <input
        ref="inputer"
        v-model="inputValue"
        class="inputer"
        :size="(inputValue && inputValue.length) || 1"
        style="display:inline-block"
        @blur="blurInputer"
        @focus="focusInputer"
        @keydown="validInput"
        @keyup="getInput"
        @input="getInputValue"
      />
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
export default {
  name: '',
  components: {
    //TsFormInput:()=>import('@/resources/plugins/TsForm/TsFormInput')
  },
  props: {
    ciId: { type: Number }
  },
  data() {
    return {
      currentItem: null,
      inputWidth: '1.5ch',
      inputValue: '',
      isAttrRelListShow: false,
      tokens: ['==', '>=', '<=', '>', '<', '!=', '&&', '||', '+', '-', '*', '/', 'include', 'exclude', '(', ')', '[', ']'],
      words: [],
      attrRelList: [],
      attrRelMap: {}, //根据模型id存放列表
      predictionTokens: [], //备选关键字列表
      timmer: null, //搜索延时
      isPredictionReady: false//预测是否显示
    };
  },
  beforeCreate() {},
  created() {
    if (this.ciId) {
      this.getAttrRelList(this.ciId);
    }
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
    blurInputer() {
      this.isPredictionReady = false;
    },
    focusInputer() {
      this.$refs['inputer'].focus();
      this.getPredictionAttrRelList();
      this.isPredictionReady = true;
    },
    validInput(event) {
      if (event.key == 'Backspace') {
        if (this.inputValue == '') {
          if (this.words.length > 0) {
            this.words.splice(this.words.length - 1, 1);
            event.returnValue = false;
          }
        }
      } else if (event.key == 'ArrowUp' || event.key == 'ArrowLeft') {
        if (this.predictions && this.predictions.length > 0) {
          const selectedIndex = this.predictions.findIndex(element => element.selected);
          if (selectedIndex == -1) {
            this.$set(this.predictions[this.predictions.length - 1], 'selected', true);
          } else {
            if (selectedIndex == 0) {
              this.$set(this.predictions[selectedIndex], 'selected', false);
              this.$set(this.predictions[this.predictions.length - 1], 'selected', true);
            } else {
              this.$set(this.predictions[selectedIndex], 'selected', false);
              this.$set(this.predictions[selectedIndex - 1], 'selected', true);
            }
          }
        }
        event.returnValue = false;
      } else if (event.key == 'ArrowDown' || event.key == 'ArrowRight') {
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
        event.returnValue = false;
      } else if (event.key == 'Enter') {
        this.autoComplete();
        event.returnValue = false;
      }
    },
    getInputValue() {
      if (this.inputValue && this.inputValue.length > 0) {
        for (let i = 0; i < this.inputValue.length; i++) {
          this.words.push(this.inputValue[i]);
        }
        this.inputValue = '';
      }
    },
    getInput(event) {
      this.predictionTokens = [];
      const matchTokens = this.tokens.filter(d => d.indexOf(this.inputValue) == 0);
      if (matchTokens.length == 1) {
        this.words.push(matchTokens[0]);
        this.inputValue = '';
      } else if (matchTokens.length > 1) {
        matchTokens.forEach(element => {
          this.predictionTokens.push({ name: element });
        });
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
      return this.attrRelMap[ciId];
    },
    async getPredictionAttrRelList() {
      let attrRelList = [];
      //if (this.inputValue) {
      const s = this.inputValue.split('.');
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
      //}
      this.attrRelList = attrRelList;
    },
    autoComplete() {
      if (this.keyword) {
        if (this.keyword.indexOf('"') == 0) {
          //字符串
          if (this.keyword.indexOf('"') == this.keyword.lastIndexOf('"')) {
            //只有一个括号时补充括号
            this.inputValue += '"';
            this.addWords();
          }
        } else if (!isNaN(parseFloat(this.keyword))) {
          //数字
          this.addWords();
        } else {
          //变量
          let selectedItem;
          if (this.predictions.length > 1) {
            selectedItem = this.predictions.find(element => element.name == this.keyword || element.selected);
          } else if (this.predictions.length == 1) {
            selectedItem = this.attrRelList[0];
          }
          if (selectedItem) {
            if (this.keyword != selectedItem.name) {
              if (this.keywordPrefix) {
                this.inputValue = this.keywordPrefix + '.' + selectedItem.name;
              } else {
                this.inputValue = selectedItem.name;
              }
            } else {
              this.addWords();
            }
          }
        }
      }
    },
    addWords() {
      if (this.inputValue) {
        this.words.push(this.inputValue);
        this.inputValue = '';
      }
    }
  },
  filter: {},
  computed: {
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
    }
  },
  watch: {
    keyword: {
      handler: function(val) {
        this.getPredictionAttrRelList();
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
    border: 0px;
    outline: none;
    background: transparent;
  }
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
