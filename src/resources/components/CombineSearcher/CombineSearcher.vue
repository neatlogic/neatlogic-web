<template>
  <div class="form-li">
    <div v-if="readonly">
      <span v-if="(totalText && Object.keys(totalText).length) ||$slots.textItem" class="tag-item">
        <span
          v-for="(text,tindex) in getShowTotalText(totalText)"
          :key="tindex"
          :name="tindex"
          :fade="false"
          class="tag-item-text border-color radius-sm overflow bg-op"
        >
          <span class="text-title">{{ getLabel(tindex) }}</span>
          <span class="ml-xs mr-xs">:</span>
          <template v-if="text && typeof text =='object' && text.length">
            <template v-for="(item,iindex) in text">
              <span :key="iindex+'_text'">{{ item }}</span>
              <span v-if="iindex<text.length-1" :key="iindex+'_sperate'" class="tag-item-sperate">|</span>
            </template>
          </template>
          <span v-else>{{ text }}</span>
        </span>
        <TsForm
          ref="form"
          v-model="searchValue"
          :itemList="searchList"
          :labelPosition="labelPosition"
          :labelWidth="labelWidth"
          filterEmpty
          :textConfig.sync="textConfig"
          class="none"
        ></TsForm>
      </span>
    </div>
    <template v-else>
      <div
        v-click-outside:false="onClickOutside"
        v-click-outside:false.mousedown="onClickOutside"
        v-click-outside:false.touchstart="onClickOutside"
        class="combinesearcher-container text-left"
        @keydown.tab="handleKeydown"
      > 
        <Dropdown
          ref="dropdownContain"
          trigger="custom"
          :visible="isVisible"
          style="width:100%"
          :transfer="transfer"
          transferClassName="combinesearcher-drop"
        >
          <div
            class="combinesearcher-target bg-op border-color clearfix radius-sm"
            :class="{seachable:search,clearable:clearable && totalText && Object.keys(totalText).length,'form-target':!border}"
            @click="clickItem"
          >
            <span class="search-box tsfont-search" @click="handleSearch"></span>
            <div ref="tagItem" class="search-main">
              <span v-if="(totalText && Object.keys(totalText).length) ||$slots.textItem" class="tag-item">
                <slot
                  name="textItem"                 
                  :valueConfig="searchValue"
                  :textConfig="textConfig"
                >
                  <Tag
                    v-for="(text,tindex) in totalText"
                    :key="tindex"
                    :name="tindex"
                    :closable="closableValue(tindex)"
                    :fade="false"
                    @on-close="removeItem(tindex)"
                  >
                    <span class="text-title">{{ getLabel(tindex) }}</span>
                    <span class="ml-xs mr-xs">:</span>
                    <template v-if="text && typeof text =='object' && text.length">
                      <template v-for="(item,iindex) in text">
                        <span :key="iindex+'_text'">{{ item }}</span>
                        <span v-if="iindex<text.length-1" :key="iindex+'_sperate'" class="tag-item-sperate">|</span>
                      </template>
                    </template>
                    <span v-else>{{ text }}</span>
                  </Tag>
                </slot>
              </span>
              <TsFormInput
                v-if="search"
                ref="input"
                v-model.trim="keyword"
                v-bind="searchConfig"
                :placeholder="placeholder"
                style="max-width:100%;display:inline-block;"
                :style="getInputWidth(keyword)"
                @on-enter="addKeyword"
                @on-keyup="delLast"
              />
            </div>
            <div v-if="searchList && searchList.length > 0" class="icon-dropdown" @click.stop="handleToggleOpen">
              <slot name="filter"><span class="tsfont-filter"></span></slot> 
            </div>
            <div v-if="clearable && totalText && Object.keys(totalText).length" class="tsfont-close-s icon-dropdown bg-op item-clear" @click.stop="clearSearch"></div>
          </div>
          <DropdownMenu v-if="searchList && searchList.length > 0" slot="list" ref="dropdown">
            <li :style="'padding: 16px 20px;width:' + width + 'px;max-height:500px;overflow:auto;'" @click="isVisible = true">
              <TsForm
                ref="form"
                v-model="searchValue"
                :itemList="searchList"
                :labelPosition="labelPosition"
                :labelWidth="labelWidth"
                filterEmpty
                :textConfig.sync="textConfig"
                :width="inputWidth"
              >
                <template v-for="item in searchList" :slot="item.name">
                  <slot
                    :name="item.name"
                    :valueConfig="searchValue"
                    :textConfig="textConfig"
                    :item="item"
                  ></slot>
                </template>
              </TsForm>
            </li>
            <li v-if="searchList && searchList.length && isShowButton" style="padding: 6px 10px 6px 4px;">
              <div class="text-right">
                <!-- ??????????????????????????? -->
                <div v-if="$slots['action']">
                  <slot name="action"></slot>
                </div>
                <div v-else>
                  <Button ghost class="mr-nm" @click.native="isVisible = false">{{ $t('button.cancel') }}</Button>
                  <Button type="primary" @click.native="doSearch">{{ $t('button.confirm') }}</Button>
                </div>
              </div>
            </li>
          </DropdownMenu>
        </Dropdown>
      </div>
    </template>
  </div> 
</template>
<script>
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput.vue';
import TsForm from '@/resources/plugins/TsForm/TsForm.vue';
import { directive as ClickOutside } from '../../directives/v-click-outside-x';
export default {
  name: 'CombineSearcher',
  components: {
    TsForm,
    TsFormInput
  },
  filters: {},
  directives: { ClickOutside },
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    placeholder: {//???????????????????????????????????????
      type: String,
      default() {
        return this.$t('form.placeholder.keyword');
      }
    },
    searchList: {//????????????????????????????????????????????????????????????
      type: [Boolean, Array],
      default: function() {
        return [];
      }
    },
    labelPosition: {//??????????????????label??????
      type: String,
      default: 'top'
    },
    labelWidth: {//label???????????????????????????????????????????????????????????????????????????
      type: Number,
      default: 120
    },
    search: {//???????????????????????????????????????????????????????????????
      type: Boolean,
      default: true
    },
    transfer: {
      type: Boolean,
      default: true
    },
    keywordName: {//?????????????????????????????????key???
      type: String,
      default: 'keyword'      
    },
    keywordText: {//?????????????????????????????????label?????????
      type: String,
      default: '?????????'      
    },
    value: {
      type: [String, Object, Boolean]
    },
    isShowButton: {//?????????????????????????????????
      type: Boolean,
      default: true
    },
    clearable: { type: Boolean, default: true },
    disabledList: { //?????????????????????
      type: Array,
      default: () => []
    },
    readonly: {
      type: Boolean,
      default: false
    },
    border: { //?????????????????????????????????
      type: Boolean,
      default: true
    },
    showSearchNumber: { //????????????????????????????????????????????????????????????-1??????????????????
      type: Number,
      default: -1
    },
    searchMode: {
      type: String, // ?????????????????????????????????(automatic)???????????????(manual)
      default: 'automatic' // ??????????????????
    }
  },
  data() {
    return {
      isCloseAutomaticSearch: false, // ????????????????????????
      isVisible: false,
      keyword: '', //???????????????
      searchConfig: {
        size: 'small',
        border: 'none'
      },
      width: 200,
      searchValue: {}, //???????????????????????????{key1:value1,key2:value2}
      textConfig: {}, //???????????????text?????????{key1:text1,key2:text2}
      inputWidth: '100%',
      keywordValue: '', //???????????????????????????????????????
      totalText: {},
      validMesage: ''
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    let _this = this;
    window.addEventListener('resize', _this.initWidth);
  },
  beforeUpdate() {},
  updated() {
    this.initWidth();
  },
  activated() {},
  deactivated() {},
  beforeDestroy() {
    let _this = this;
    window.removeEventListener('resize', _this.initWidth);
  },
  destroyed() {},
  methods: {
    clickItem() {
      //??????????????????????????????????????????????????????????????????????????????????????????????????????????????????
      if (this.search) {
        this.$refs.input && this.$refs.input.focus();
      }
    },
    handleToggleOpen() {
      this.isVisible = !this.isVisible;
      if (this.isVisible && this.searchMode == 'manual') {
        this.isCloseAutomaticSearch = true; // ??????????????????
      }
    },
    initWidth() {
      this.$el && (this.width = this.$el.getBoundingClientRect().width);
    },
    onClickOutside(event) {
      //???????????????dropdown??????
      if (this.isVisible) {
        const $el = this.$refs.dropdown ? this.$refs.dropdown.$el || null : null;
        if ((!$el && $el === event.target) || $el.contains(event.target)) {
          return;
        }
        const $contain = this.$refs.dropdownContain ? this.$refs.dropdownContain.$el || null : null;
        if ((!$contain && $contain === event.target) || $contain.contains(event.target)) {
          return;
        }
        //????????????????????????????????????tsform???????????????tranfer
        if (this.$refs.dropdown.$el.querySelectorAll('.form-li').length) {
          let canStop = false;
          this.$refs.dropdown.$el.querySelectorAll('.form-li').forEach(element => {
            if (element.__vue__ && element.__vue__.transfer) {
              let $dropEl = null;
              let eleVue = element.__vue__;
              if (eleVue && eleVue.$refs.dropdown) {
                $dropEl = eleVue.$refs.dropdown.$el;
              } else if (eleVue && eleVue.$children[0] && eleVue.$children[0].$refs.drop) {
                $dropEl = eleVue.$children[0].$refs.drop.$el;
              }
              if ($dropEl && ($dropEl === event.target || $dropEl.contains(event.target))) {
                canStop = true;
              }
            }
          });
          if (canStop) {
            return;
          }
        }
        this.isVisible = false;
      }
    },
    removeItem(key) {
      //??????????????????
      if (this.searchValue && Object.keys(this.searchValue).length && Object.keys(this.searchValue).includes(key)) {
        this.$nextTick(() => {
          this.$delete(this.searchValue, key);
          this.$delete(this.totalText, key);
          this.$delete(this.textConfig, key);
          if (this.searchMode == 'manual') { // ???????????????????????????????????????????????????change
            let totalSearch = this.getFullSearch();
            this.$emit('change', totalSearch, this.searchMode);
          }
        });
      }
      //???????????????????????????????????????????????????????????????????????????????????????watch?????????????????????????????????????????????????????????????????????change
      if (this.search && key == this.keywordName) {
        this.$set(this, 'keywordValue', '');
        this.$delete(this.totalText, key);
        let totalSearch = this.getFullSearch();
        this.$emit('change', totalSearch, this.searchMode);
      }
    },
    addKeyword() {
      if (this.keyword) {
        this.$set(this, 'keywordValue', this.keyword);
        this.$set(this.totalText, this.keywordName, this.keyword);
        let newValue = this.$utils.deepClone(this.searchValue);
        let keywordObj = {};
        keywordObj[this.keywordName] = this.keyword;
        Object.assign(newValue, keywordObj);
        this.isVisible = false;
        this.$emit('change', newValue, this.searchMode);
        this.keyword = '';
      }
    },
    doSearch(val) {
      this.isVisible = false;
      let fullSearch = this.getFullSearch();
      this.$emit('confirm', fullSearch);
    },
    clearSearch() {
      this.keyword = '';
      this.keywordValue = '';
      this.searchValue = {};
      this.totalText = {};
      this.isVisible = false;
      this.$refs.form && this.$refs.form.clearFormInput(); // ??????input??????????????????????????????
      this.$forceUpdate();
      if (this.searchMode == 'manual') {
        this.$emit('change', {}, this.searchMode);// ?????????????????????????????????????????????change
      }
    },
    handleSearch() {
      this.$emit('change', this.getFullSearch(), this.searchMode);
    },
    getFullSearch() {
      let fullSearch = {};
      if (this.searchValue && Object.keys(this.searchValue).length) {
        for (var s in this.searchValue) {
          if (this.searchValue[s] != null && this.searchValue[s] != '') {
            let newitem = {};
            newitem[s] = this.searchValue[s];
            Object.assign(fullSearch, newitem);
          }
        }
       
        Object.assign(fullSearch, this.searchValue);
      }
      if (this.search && this.keywordValue) {
        let keywordObj = {};
        keywordObj[this.keywordName] = this.keywordValue;
        Object.assign(fullSearch, keywordObj);
      }
      return this.$utils.deepClone(fullSearch);
    },
    handleKeydown(e) {
      //console.log(e);
    },
    updateVal(val) {
      this.$nextTick(() => { 
        this.searchValue = this.$utils.deepClone(val);
        this.totalText = this.$utils.deepClone(val);
        //??????searchList???????????????keywordName???????????????????????????????????????????????????????????? 
        if (this.totalText) {
          for (let k in this.totalText) {
            if (!this.searchList.find(s => s.name == k) && k != this.keywordName) {
              this.$delete(this.totalText, k);
            } else if (k && this.totalText[k] instanceof Array) {
              // ????????????????????????????????????????????????
              this.totalText[k] = this.totalText[k].filter(d => d && d.toString().trim() != '');
              if (this.totalText[k].length == 0) {
                this.$delete(this.totalText, k);
              }
            } else if (k && typeof this.totalText[k].toString() == 'string' && this.$utils.isEmpty(this.totalText[k])) {
            // ???????????????????????????????????????????????????
              this.$delete(this.totalText, k);
            }  
          }
        }
      });
    },
    delLast(e) {
      if (e && e.key == 'Backspace') {
        //?????????????????????????????????????????????????????????
        if (!this.keyword && this.totalText && Object.keys(this.totalText).length) {
          this.$nextTick(() => {
            let lastKey = Object.keys(this.totalText)[Object.keys(this.totalText).length - 1];
            this.removeItem(lastKey);
          });
        }
      }
    },
    focus() {
      //???????????????,??????????????????
      if (this.search) {
        this.$refs.input && this.$refs.input.focus();
      } else {
        this.isVisible = true;
      }
    },
    getShowTotalText(obj) { //????????????????????????????????????????????????
      let totalText = {};
      if (!this.$utils.isEmpty(obj) && this.showSearchNumber > 0 && Object.keys(obj).length > this.showSearchNumber) {
        let keysList = Object.keys(obj);
        let newTotalText = {};
        for (let i = 0; i < this.showSearchNumber; i++) {
          let key = keysList[i];
          newTotalText[key] = obj[key];
        }
        totalText = newTotalText;
      } else {
        totalText = obj;
      }
      return totalText;
    },
    //?????????????????????????????????
    onScroll(event) {
      if (this.isVisible && this.$refs.dropdown) {
        if (this.$refs.dropdown.$el.querySelectorAll('.form-li').length) {
          this.$refs.dropdown.$el.querySelectorAll('.form-li').forEach(el => {
            let elVue = el.__vue__;
            if (elVue && elVue.transfer && elVue.isVisible) {
              elVue.isVisible = false;
            }
          });
        }
        this.isVisible = false;
      }
    },
    refreshTextConfig() {
      // ??????????????????????????????????????????????????????????????????????????????????????????????????????
      if (this.textConfig && typeof this.textConfig == 'object') {
        if (Object.keys(this.textConfig).length) {
          Object.entries(this.textConfig).forEach(([key, val]) => {
            this.$set(this.totalText, key, val);
          });
          Object.keys(this.totalText).forEach(k => {
            if (k != this.keywordName && !Object.keys(this.textConfig).includes(k)) {
              this.$delete(this.totalText, k);
            }
          });
        } else {
          Object.keys(this.totalText).length && Object.keys(this.totalText).forEach(k => {
            if (k != this.keywordName) {
              this.$delete(this.totalText, k);
            }
          });            
        }
      }
      this.$emit('change-label', this.totalText);
    }
  },
  computed: {
    getLabel() {
      return function(key) {
        if (this.search && key == this.keywordName) {
          return this.keywordText;
        } else {
          let item = this.searchList.find(s => { return s.name == key; });
          return item ? item.label : '-';
        }
      };
    },
    getInputWidth() {
      return function(txt) {
        let text_length = 0;
        let place_length = 0;
        if (txt.length) {
          for (let i = 0; i < txt.length; i++) {
            if (txt.charCodeAt(i) > 256) {
              text_length = text_length + 1;
            } else {
              text_length = text_length + 0.5;
            }
          }
        }
        if (this.placeholder && this.placeholder.length) {
          for (let i = 0; i < this.placeholder.length; i++) {
            if (this.placeholder.charCodeAt(i) > 256) {
              place_length = place_length + 1;
            } else {
              place_length = place_length + 0.5;
            }
          }          
        }
        return {
          width: Math.max(100, Math.max(text_length, place_length) * 13 + 20) + 'px'
        };
      };
    },
    closableValue() {
      return key => {
        let value = this.disabledList.includes(key);
        return !value;
      };
    }
  },
  watch: {
    searchValue: {
      handler: function(val, oldval) {
        let _this = this;
        if (val) {
          let totalSearch = _this.getFullSearch();
          let isEmit = this.$utils.isSame(totalSearch, _this.value);
          if (!isEmit) {
            this.$emit('change', totalSearch);
          }
        }
      },
      deep: true
    },
    value: {
      handler(val) {
        if (val && typeof val == 'object') {
          //???????????????????????????????????????????????????????????????2????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
          if (this.search) {
            let fullSearch = this.getFullSearch();
            let isSame = this.$utils.isSame(val, fullSearch);
            if (!isSame) {
              let keywordName = this.keywordName;
              if (val[keywordName]) {
                let { keywordName, ...params} = val;
                this.updateVal(params);
                this.keywordValue = this.$utils.deepClone(val[keywordName]);
              } else {
                this.updateVal(val);
                this.keywordValue = '';
              }
            }
          } else {
            let fullSearch = this.getFullSearch();
            let isSame = this.$utils.isSame(val, fullSearch);
            if (!isSame) {
              this.updateVal(val);
            }
          }
        }
      },
      deep: true,
      immediate: true
    },
    textConfig: {
      handler(val) {
        if (val && typeof val == 'object') {
          if (this.searchMode == 'automatic') {
            this.refreshTextConfig();
          } else if (this.searchMode == 'manual' && !this.isCloseAutomaticSearch) {
            // ????????????
            this.refreshTextConfig();
          }
        }
        this.$emit('change-label', this.totalText);
      },
      deep: true,
      immediate: true
    },
    totalText: {
      handler(val) {
        if (this.$refs.tagItem) {
          //?????????????????????
          if (this.$refs.tagItem.scrollWidth > this.$refs.tagItem.offsetWidth) {
            this.$refs.tagItem.scroll({
              top: 0,
              left: this.$refs.tagItem.scrollWidth - this.$refs.tagItem.offsetWidth
            });
          }
        }
      },
      deep: true,
      immediate: true      
    }
    
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.combinesearcher-target {
  position: relative;
  box-sizing: border-box;
  padding: 0 26px 0 30px;
  border: 1px solid; 
  line-height: 30px;
  height: 32px;
  .search-box {
    position: absolute;
    top: 1px;
    left: 10px;
    z-index: 1;
    width: 26px;
    height: 30px;
    line-height: 30px;
    cursor: pointer;
  }
  .icon-dropdown {
    position: absolute;
    top: 0;
    right: 8px;
    width: 18px;
    text-align: center;
    line-height: 30px;
    height: 30px;
    cursor: pointer;
    transform: scale(0.9);
    &.item-clear{
      right: 24px;
      display: none;
    }
  }
  &.clearable{
    padding-right: 45px;
    &:hover{
      .icon-dropdown{
          &.item-clear{
            display: block;
            opacity: .4;
            &:hover{
              opacity: .8;
            }
          }  
      }
    }
  }
  /deep/ .ivu-input-wrapper {
    display: block;
    .ivu-input {
      height: 30px;
      padding: 10px 10px 7px 5px;
      font-size:12px;
    }
  }
  .search-main{
    font-size: 0;
    white-space: nowrap;
    word-break: keep-all;
    overflow: auto;
    >*{
      font-size: 1rem;
    }
  }
  .tag-item{
    display:inline-block;
    padding-left: 4px;
    line-height: 28px;
    white-space: nowrap;
    .tag-item-sperate{
      text-align: center;
      opacity: .4;
      margin-left: 2px;
      margin-right: 2px;
    }
  }
  /deep/ .ivu-tag-text{
    >*{
      vertical-align: initial;
    }
  }
  // &.seachable{
  //   .tag-item{
  //     max-width: calc(100% - 200px);
  //   }
  // }
}
.none{
  display: none;
}
.tag-item-text{
  border: 1px dashed;
  padding: 0 16px;
  line-height: 30px;
  display: inline-block;
  white-space: nowrap;
  text-align: center;
  &:not(:last-of-type){
    margin-right: 10px;
  }
}
</style>
<style lang="less">
.combinesearcher-drop{
  max-height: none;
}
</style>
