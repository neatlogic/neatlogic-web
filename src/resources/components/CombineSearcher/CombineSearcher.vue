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
            <li :style="'padding: 16px 20px;width:' + width + 'px;max-height:400px;overflow:auto;'" @click="isVisible = true">
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
            <li v-if="searchList && searchList.length && isShowButton" style="padding: 6px 10px 6px 4px;" :class="isShowAdvanceMode ? 'flex-between' : ''">
              <div v-if="isShowAdvanceMode" class="text-left">
                <span class="tsfont-left text-action" @click="switchMode">{{ $t('page.advancedmode') }}</span>
              </div>
              <div class="text-right">
                <!-- 自定义底部操作按钮 -->
                <div v-if="$slots['action']">
                  <slot name="action"></slot>
                </div>
                <div v-else>
                  <Button ghost class="mr-nm" @click.native="handleCancel">{{ $t('page.cancel') }}</Button>
                  <Button type="primary" @click.native="doSearch">{{ $t('page.search') }}</Button>
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
    placeholder: {//如果有关键字搜索，提示文案
      type: String,
      default() {
        return this.$t('form.placeholder.keyword');
      }
    },
    searchList: {//下拉的搜索列表，与表单组件同样的数据结构
      type: [Boolean, Array],
      default: function() {
        return [];
      }
    },
    labelPosition: {//下拉的表单的label位置
      type: String,
      default: 'top'
    },
    labelWidth: {//label的宽度设置，主要是用于左右布局时，宽度过长或者过窄
      type: Number,
      default: 120
    },
    search: {//是否可以搜索（提供关键字回车组合搜索功能）
      type: Boolean,
      default: true
    },
    transfer: {
      type: Boolean,
      default: true
    },
    keywordName: {//搜索的关键字对应接口的key名
      type: String,
      default: 'keyword'      
    },
    keywordText: {//搜索的关键字对应显示的label中文名
      type: String,
      default() {
        return this.$t('page.keyword');
      }      
    },
    value: {
      type: [String, Object, Boolean]
    },
    isShowButton: {//是否显示搜索和取消按钮
      type: Boolean,
      default: true
    },
    clearable: { type: Boolean, default: true },
    disabledList: { //不可删除的属性
      type: Array,
      default: () => []
    },
    readonly: {
      type: Boolean,
      default: false
    },
    border: { //是否存在边框，默认存在
      type: Boolean,
      default: true
    },
    showSearchNumber: { //只读模式下：展示搜索条件的数量，（默认值-1，展示所有）
      type: Number,
      default: -1
    },
    searchMode: {
      type: String, // 搜索模式可选：实时搜索(realtimeSearch)，非实时搜索(clickBtnSearch)
      default: 'realtimeSearch' // 默认实时搜索
    },
    isShowAdvanceMode: {
      // 底部是否显示高级模式文案
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isCloseAutomaticSearch: false, // 是否关闭实时搜索
      isVisible: false,
      keyword: '', //输入框的值
      searchConfig: {
        size: 'small',
        border: 'none'
      },
      width: 200,
      searchValue: {}, //下拉的所有值数据，{key1:value1,key2:value2}
      textConfig: {}, //下拉的所有text数据，{key1:text1,key2:text2}
      inputWidth: '100%',
      keywordValue: '', //组件内部对应搜索关键字的值
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
      //如果是带搜索的点击空白处聚焦搜索输入框，如果是纯下拉的点击空白处展开收起下拉
      if (this.search) {
        this.$refs.input && this.$refs.input.focus();
      }
    },
    handleToggleOpen() {
      this.isVisible = !this.isVisible;
      if (this.isVisible && this.searchMode == 'clickBtnSearch') {
        this.isCloseAutomaticSearch = true; // 关闭实时搜索
      }
    },
    switchMode() {
      this.$emit('switchMode');
    },
    initWidth() {
      this.$el && (this.width = this.$el.getBoundingClientRect().width);
    },
    onClickOutside(event) {
      //点击外部，dropdown消失
      if (this.isVisible) {
        const $el = this.$refs.dropdown ? this.$refs.dropdown.$el || null : null;
        if ((!$el && $el === event.target) || $el.contains(event.target)) {
          return;
        }
        const $contain = this.$refs.dropdownContain ? this.$refs.dropdownContain.$el || null : null;
        if ((!$contain && $contain === event.target) || $contain.contains(event.target)) {
          return;
        }
        //这里是单独针对下拉里面的tsform下拉组件的tranfer
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
      //删除某个属性
      if (this.searchValue && Object.keys(this.searchValue).length && Object.keys(this.searchValue).includes(key)) {
        this.$nextTick(() => {
          this.$delete(this.searchValue, key);
          this.$delete(this.totalText, key);
          this.$delete(this.textConfig, key);
          let totalSearch = this.getFullSearch();
          this.$emit('remove-label');
          this.$emit('change', totalSearch);
        });
      }
      //只有在搜索模式下才去匹配输入框的，如果是删除下拉的属性会在watch里触发，如果是删除关键词的还需要在这里触发一次change
      if (this.search && key == this.keywordName) {
        this.$set(this, 'keywordValue', '');
        this.$delete(this.totalText, key);
        let totalSearch = this.getFullSearch();
        this.$emit('remove-label');
        this.$emit('change', totalSearch);
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
        this.$emit('change', newValue);
        this.keyword = '';
      }
    },
    handleCancel() {
      // 点击取消
      this.isVisible = false;
      if (this.searchMode == 'clickBtnSearch' && !this.isVisible) {
        // 点击取消按钮时，删除已选择但是没有搜索的字段
        for (let key in this.searchValue) {
          if (key && !this.totalText.hasOwnProperty([key])) {
            this.$nextTick(() => {
              this.$delete(this.searchValue, key);
              this.$delete(this.textConfig, key);
              this.$delete(this.totalText, key);
            });
          }
        }
      }
    },
    doSearch(val) {
      this.isVisible = false;
      let fullSearch = this.getFullSearch();
      if (this.searchMode == 'clickBtnSearch') {
        this.refreshTextConfig(); // 点击确认时，需要把搜索结果显示在搜索栏中
      }
      this.$emit('change', fullSearch);
    },
    clearSearch() {
      this.keyword = '';
      this.keywordValue = '';
      this.searchValue = {};
      this.totalText = {};
      this.isVisible = false;
      this.$refs.form && this.$refs.form.clearFormInput(); // 解决input输入框清空失败的问题
      this.$forceUpdate();
      this.$emit('change', {});
    },
    handleSearch() {
      this.$emit('change', this.getFullSearch());
    },
    getFullSearch() {
      let fullSearch = {};
      if (this.searchValue && Object.keys(this.searchValue).length) {
        for (let s in this.searchValue) {
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
        //清除searchList和关键字（keywordName）中没有定义的属性值，避免回显错误的选项 
        if (this.totalText) {
          for (let k in this.totalText) {
            if (!this.searchList.find(s => s.name == k) && k != this.keywordName) {
              this.$delete(this.totalText, k);
            } else if (k && this.totalText[k] instanceof Array) {
              // 清除为空的数组，避免回显为空情况
              this.totalText[k] = this.totalText[k].filter(d => d && d.toString().trim() != '');
              if (this.totalText[k].length == 0) {
                this.$delete(this.totalText, k);
              }
            } else if (k && this.totalText[k] && typeof this.totalText[k].toString() == 'string' && this.$utils.isEmpty(this.totalText[k])) {
            // 清除为空的字符串，避免回显为空情况
              this.$delete(this.totalText, k);
            }  
          }
        }
      });
    },
    delLast(e) {
      if (e && e.key == 'Backspace') {
        //没有值的情况下，默认删除倒数第一个选项
        if (!this.keyword && this.totalText && Object.keys(this.totalText).length) {
          this.$nextTick(() => {
            let lastKey = Object.keys(this.totalText)[Object.keys(this.totalText).length - 1];
            this.removeItem(lastKey);
          });
        }
      }
    },
    focus() {
      //聚焦输入框,或者下拉展开
      if (this.search) {
        this.$refs.input && this.$refs.input.focus();
      } else {
        this.isVisible = true;
      }
    },
    getShowTotalText(obj) { //处理只读模式下，展示搜索条件数量
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
    //监听父容器滚动时，收起
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
      // 提供给外部使用，非实时搜索时，点击搜索按钮，需要把条件显示在搜索栏中
      if (this.textConfig && typeof this.textConfig == 'object') {
        if (Object.keys(this.textConfig).length) {
          Object.entries(this.textConfig).forEach(([key, val]) => {
            this.$set(this.totalText, key, val);
          });
          Object.keys(this.totalText).forEach(k => {
            if ((k != this.keywordName || (k == this.keywordName && !this.search)) && !Object.keys(this.textConfig).includes(k)) {
              // (k == this.keywordName && !this.search) 修复关键字搜索，放到searchList里时，关键字删除不了的问题
              this.$delete(this.totalText, k);
            }
          });
        } else {
          Object.keys(this.totalText).length &&
            Object.keys(this.totalText).forEach(k => {
              if (k != this.keywordName || (k == this.keywordName && !this.search)) {
                // (k == this.keywordName && !this.search) 修复关键字搜索，放到searchList里时，关键字删除不了的问题
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
        if (key == this.keywordName) { // 搜索框隐藏时，有关键字也可正常回显
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
      handler(val, oldval) {
        if (val) {
          let totalSearch = this.getFullSearch();
          let isEmit = this.$utils.isSame(totalSearch, this.value);
          if (!isEmit) {
            if (this.searchMode == 'realtimeSearch') {
              console.log('searchValue', totalSearch);
              this.$emit('change', totalSearch);
            }
          }
        }
      },
      deep: true
    },
    value: {
      handler(val) {
        if (val && typeof val == 'object') {
          //先判断是否相等，如果有输入框搜索的先分割成2个地方的，如果是单纯下拉的就直接回显（不然输入框搜索的回显会进到下拉的回显里，改变值时会被清空）
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
          if (this.searchMode == 'realtimeSearch' || (this.searchMode == 'clickBtnSearch' && !this.isCloseAutomaticSearch)) {
            this.refreshTextConfig();
          }
        }
      },
      deep: true,
      immediate: true
    },
    totalText: {
      handler(val) {
        if (this.$refs.tagItem) {
          //自动滚动到后面
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
