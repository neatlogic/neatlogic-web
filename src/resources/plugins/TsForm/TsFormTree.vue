<template>
  <div class="form-li">
    <span v-if="readonly" :class="[readonlyClass, readonlyTextHighlightClass]" :title="readonlyTitle">
      <template v-if="multiple">
        <span v-if="selectedList.length > 0">
          <template v-for="(selected, sindex) in selectedList">
            <span :key="sindex" style="display:flex;">
              {{ selected[textName] }}
              <span v-if="sindex < selectedList.length - 1" class="tsform-readonly-sperate">{{ sperateText }}</span>
            </span>
          </template>
        </span>
        <span v-else class="text-grey">-</span>
      </template>
      <template v-else>
        <div class="overflow" :title="selectedList.length>0 ? (showPath ?selectedList[0]._path : selectedList[0][textName]):'-' ">
          <span v-if="selectedList.length>0">{{ showPath ?selectedList[0]._path : selectedList[0][textName] }}</span>
          <span v-else class="text-grey">-</span>
        </div>
      </template>
    </span>
    <div
      v-else
      :class="borderClass"
      class="form-tree"
      :style="getStyle"
    >
      <div
        v-click-outside:false="onClickOutside"
        v-click-outside:false.mousedown="onClickOutside"
        v-click-outside:false.touchstart="onClickOutside"
        class="select-body"
        :class="getClass"
      >
        <Dropdown
          ref="dropdownContain"
          style="width:100%"
          trigger="custom"
          :visible="isVisible"
          :transfer="transfer"
          placement="bottom-start"
          transfer-class-name="form-transfer-tree"
        >
          <div
            tabindex="-1"
            class="ivu-input  select-top"
            :disabled="disabled"
            @click="handleOpen"
          >
            <template v-if="multiple">
              <Tag
                v-for="(selected, index) in selectedList"
                :key="index"
                :name="selected[valueName]"
                :closable="!disabled"
                :fade="false"
                @on-close="removeItem($event, index, selected.nodeKey)"
              >{{ selected[textName] }}</Tag>
              <input
                v-if="!(disabled || readonly) && search && url"
                v-model="searchKeyWord"
                type="text"
                :placeholder="placeholder"
                autocomplete="off"
                spellcheck="false"
                class="ivu-input search-input"
                @input="filterNode($event)"
              />
            </template>
            <template v-else>
              <input
                v-if="!(disabled || readonly) && search && url"
                v-model="searchKeyWord"
                type="text"
                :placeholder="placeholder"
                autocomplete="off"
                spellcheck="false"
                class="ivu-input search-input"
                @input="filterNode($event)"
              />
              <template v-else>
                <Tooltip
                  placement="top-start"
                  max-width="300"
                  transfer
                  theme="light"
                  style="width: 100%"
                  :content="searchKeyWord"
                  :disabled="$utils.isEmpty(searchKeyWord)"
                >
                  <div
                    class="overflow empty-placeholder single-span"
                    :class="[disabled ? 'empty-placeholder-disable' : '']"
                    :placeholder="placeholder"
                  >{{ searchKeyWord }}</div>
                </Tooltip>
              </template>
            </template>
            <i class="ivu-icon tsfont-down ivu-select-arrow"></i>
            <i v-if="getClearable" class="clearBtn text-icon ivu-icon tsfont-close-s bg-op" @click.stop="clearValue"></i>
          </div>
          <DropdownMenu v-if="!(disabled || readonly)" slot="list" ref="dropdown">
            <Tree
              v-if="nodeList && nodeList.length>0"
              :ref="treeRef"
              class="tsFormTree dropdown-ul"
              :class="[{'single':!multiple,'last':selectLastLevel} ]"
              :data="nodeList"
              :render="renderContent"
              :multiple="multiple || false"
              :show-checkbox="multiple || false"
              :check-strictly="true"
              :childrenKey="childrenKey"
              :load-data="loadData"
              @on-select-change="onSelectChange"
              @on-check-change="onCheckChange"
            ></Tree>
            <li v-else class="ivu-dropdown-item"><span class="text-tip">{{ $t('page.nodata') }}</span></li>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
    <div v-if="desc && !descType" class="text-tip tips">{{ desc }}</div>
    <Alert v-else-if="desc && descType" :type="descType">{{ desc }}</Alert>
    <transition name="fade">
      <slot name="validMessage">
        <span
          v-if="validMesage != ''"
          class="form-error-tip"
          :title="validMesage"
          v-html="validMesage"
        ></span>
      </slot>
    </transition>
  </div>
</template>
<script>
import formMixins from '@/resources/mixins/formMixins.js';
import formScrollMixins from '@/resources/mixins/formScrollMixins.js';
import { directive as ClickOutside } from '../../directives/v-click-outside-x.js';
export default {
  name: 'TsFormTree',
  tagComponent: 'TsForm',
  directives: { ClickOutside },
  mixins: [formMixins, formScrollMixins],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    name: String,
    multiple: {
      default: false
    },
    value: {
      //多选是是array 单选是String
      type: [String, Array, Number]
    },
    transfer: {
      type: Boolean,
      default: false
    },
    onChange: Function, //改变时触发
    url: String,
    search: {//通过调用接口来进行搜索
      type: Boolean,
      default: false
    },
    rootName: {
      //通过url来获取数据的rootName
      type: String,
      default: ''
    },
    valueName: {
      //option渲染值
      type: String,
      default: 'value'
    },
    textName: {
      //text渲染值
      type: String,
      default: 'text'
    },
    keyword: {
      type: String,
      default: 'keyword'
    },
    dataList: Array,
    size: {
      default: ''
    },
    childrenKey: {
      default: 'children'
    },
    params: Object,
    placeholder: {
      type: String,
      default() {
        return this.$t('page.pleaseselect');
      }
    },
    clearable: {
      type: Boolean,
      default: true
    },
    selectLastLevel: {
      type: Boolean,
      default: false
    },
    showPath: {
      //之争对与单选
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    sperateText: {
      type: String,
      default: '/'
    },
    ajaxType: {
      type: String,
      default: 'post'
    },
    onChangelabel: Function //改变时获取text触发
  },
  data() {
    return {
      isVisible: false, //下拉选项显示
      currentValue: this.value,
      showValue: '',
      selectedList: [], //选中的列表，精确匹配
      treeRef: 'trf' + new Date().toString(),
      nodeList: [],
      validMesage: '',
      currentValidList: this.filterValid(this.validateList) || [],
      readonlyTitle: null,
      searchKeyWord: '', //回显的值通过nodeList自行匹配 不需要调用接口
      isValidPass: true
    };
  },
  created() {
    this.initNodeList();
  },
  mounted() {
    this.$nextTick(function() {
      this.readonly && this.initReadolyTitle();
    });
  },
  beforeDestroy() {
    this.cancelAxios && this.cancelAxios.cancel();
    this.cancelAxios1 && this.cancelAxios1.cancel();
  },
  methods: {
    initNodeList: function() {
      var _this = this;
      //通过url获取数据
      if (_this.url) {
        let params = {};
        this.cancelAxios1 && this.cancelAxios1.cancel();
        this.cancelAxios1 = this.$https.CancelToken.source();
        typeof _this.params == 'object' && Object.assign(params, _this.params);
        let ajaxArr = { method: _this.ajaxType, url: _this.url, cancelToken: _this.cancelAxios1.token};
        let needdataLi = ['post', 'put'];
        needdataLi.indexOf(_this.ajaxType) < 0 ? Object.assign(ajaxArr, { params: params }) : Object.assign(ajaxArr, { data: params });
        this.$https(ajaxArr).then(res => {
          if (res && res.Status == 'OK') {
            _this.nodeList = res.Return;
            if (_this.rootName) {
              let rootAry = _this.rootName.split('.');
              rootAry.forEach(str => {
                _this.nodeList = _this.nodeList[str];
              });
            }
            _this.selectedList = [];
            _this.nodeList.forEach(item => _this.flattenChildren(item, null, ''));
            if (!_this.multiple) {
              _this.searchKeyWord = _this.selectedList[0] ? (_this.showPath ? _this.selectedList[0]._path : _this.selectedList[0][_this.textName]) : '';
            }
            this.readonly && this.initReadolyTitle();
          }
        });
      } else {
        this.selectedList = [];
        _this.nodeList = _this.dataList || [];
        (_this.currentValue || _this.showPath) && _this.nodeList.forEach(item => _this.flattenChildren(item, null, ''));
        if (!this.multiple) {
          this.searchKeyWord = this.selectedList[0] ? (this.showPath ? this.selectedList[0]._path : this.selectedList[0][this.textName]) : '';
        }
        this.readonly && this.initReadolyTitle();
      }
    },
    flattenChildren(node, parent, path, isSearch) {
      //node当前节点，parent父节点，path对应的层级路径，isSearch搜索是不对selectedList进行改改
      let _this = this;
      node._path = (path || '') + (path ? ' ' + this.sperateText + ' ' + node[this.textName] : node[this.textName]);
      if (!_this.multiple && node[_this.valueName] == _this.currentValue) {
        //单选
        _this.$set(node, 'selected', true);
        !isSearch && _this.selectedList.push(node);
        parent && _this.$set(parent, 'expand', true);
        return false;
      } else if (!!_this.multiple && (_this.currentValue && _this.currentValue.indexOf(node[_this.valueName]) >= 0)) {
        //多选
        _this.$set(node, 'checked', true);
        _this.$set(node, 'selected', true);
        parent && _this.$set(parent, 'expand', true);
        !isSearch && _this.selectedList.push(node);
      } else {
        _this.$set(node, 'checked', false);
        _this.$set(node, 'selected', false);
        // parent && _this.$set(parent, 'expand', false); //子元素有选中时，父级默认打开
      }

      if (node[_this.childrenKey] && node[_this.childrenKey].length > 0) {
        this.selectLastLevel && (node.disabled = true);
        node[_this.childrenKey].forEach(child => _this.flattenChildren(child, node, node._path, isSearch));
      }
      parent && node.expand && _this.$set(parent, 'expand', true);
      if (isSearch && this.searchKeyWord && parent) {
        this.$set(parent, 'expand', true);
      }
    },
    searchNodeByUrl(searchKeyWord) {
      let _this = this;
      let params = {};
      if (!_this.url) {
        // 解决url不传递，CombineSearcher 删除选中项后，控制台接口报错问题
        return false;
      }
      typeof this.params == 'object' && Object.assign(params, this.params);
      params[this.keyword] = searchKeyWord;

      let cancel = this.cancelAxios;
      cancel && (this.cancelAxios = null) && cancel.cancel();

      const CancelToken = this.$https.CancelToken;
      this.cancelAxios = CancelToken.source();
      let ajaxArr = { method: _this.ajaxType, url: _this.url, cancelToken: _this.cancelAxios.token };
      let needdataLi = ['post', 'put'];
      needdataLi.indexOf(_this.ajaxType) < 0 ? Object.assign(ajaxArr, { params: params }) : Object.assign(ajaxArr, { data: params });
      this.$https(ajaxArr).then(res => {
        if (res && res.Status == 'OK') {
          _this.nodeList = _this.setNodeList(res.Return);
          _this.nodeList.forEach(item => _this.flattenChildren(item, '', '', true));
        }
        this.cancelAxios = null;
        this.setTimeSearch = null;
      });
    },
    setNodeList(res) {
      //统一处理接口返回的数据
      let nodeList = res;
      if (this.rootName) {
        let rootAry = this.rootName.split('.');
        rootAry.forEach(str => {
          nodeList = nodeList[str];
        });
      }
      if (this.dealDataByUrl && typeof this.dealDataByUrl == 'function') {
        nodeList = this.dealDataByUrl(nodeList);
      }
      return nodeList;
    },
    renderContent: function(h, { root, node, data }) {
      let _this = this;
      return h('span', {
        class: data.className,
        props: {
          data: data
        },
        domProps: {
          innerHTML: data[_this.textName]
        },
        on: {
          click: function(event) {
            if (data[_this.childrenKey] && data[_this.childrenKey].length > 0 && _this.selectLastLevel) {
              _this.$set(data, 'expand', !data.expand);
            }
          }
        }
      });
    },
    onSelectChange: function(selectAllNode, node) {
      //点击文案
      let _this = this;
      let selectValue = [];
      selectAllNode.forEach(element => {
        selectValue.push(element[_this.valueName]);
      });
      if (this.multiple) {
        node.checked != node.selected && _this.$refs[_this.treeRef].handleCheck({ checked: node.selected, nodeKey: node.nodeKey }); //手动选择树节点
        _this.currentValue = selectValue;
      } else {
        _this.currentValue = selectValue[0];
      }
      this.selectedList = selectAllNode;
      this.onChangeValue();
      !this.multiple && (this.isVisible = false);
    },
    onCheckChange: function(selectAllNode, node) {
      //点击checkbox
      let _this = this;
      let selectValue = [];
      selectAllNode.forEach(element => {
        selectValue.push(element[_this.valueName]);
      });
      node.checked != node.selected && _this.$refs[_this.treeRef].handleSelect(node.nodeKey); //手动选择树节点
      _this.currentValue = selectValue;
      _this.selectedList = selectAllNode;
      this.onChangeValue();
    },
    filterNode: function() {
      this.searchKeyWord = this.getForbidContent ? this.searchKeyWord.replace(new RegExp(this.getForbidContent), '') : this.searchKeyWord;//过滤掉禁止输入的字符串
      !this.isVisible && (this.isVisible = true);
      this.setTimeSearch && clearTimeout(this.setTimeSearch);
      this.setTimeSearch = setTimeout(() => {
        this.searchNodeByUrl(this.searchKeyWord);
      }, 250);
    },
    removeItem: function(event, index, nodeKey) {
      let _this = this;
      _this.selectedList.splice(index, 1);
      _this.currentValue.splice(index, 1);
      this.onChangeValue();
      _this.$refs[_this.treeRef].handleCheck({
        checked: false,
        nodeKey: nodeKey
      });
      //手动选择树节点
      if (_this.currentValidList.length > 0) {
        _this.valid(_this.currentValue);
      }
    },
    onChangeValue() {
      if (!this.multiple) {
        this.searchKeyWord = this.selectedList[0] ? (this.showPath ? this.selectedList[0]._path : this.selectedList[0][this.textName]) : '';
      }      
      let label = this.multiple ? this.selectedList.map(s => s[this.textName]) 
        : this.selectedList.length > 0 ? this.selectedList[0][this.textName] : '';
      let valueObject = this.selectedList.map((item) => { 
        return { 'value': item[this.valueName], 'text': item[this.textName] }; 
      });
      valueObject = this.multiple ? valueObject : (valueObject[0] || {});
      this.$emit('change', this.currentValue, valueObject);
      this.$emit('on-change', this.currentValue, valueObject);
      this.$emit('change-label', label, valueObject);
      typeof this.onChange == 'function' && this.onChange(this.currentValue, valueObject);
      let isSame = false;
      if (this.multiple) {
        isSame = JSON.stringify(this.value) == JSON.stringify(this.currentValue);
        //toValue = this.currentValue.concat([]);
      } else if (this.value == this.currentValue) {
        isSame = true;
      }
      if (!isSame) {
        if (this.currentValidList.length > 0 && this.canValid('change', this.currentValidList)) {
          this.valid(this.currentValue);
        }
      } else {
        this.validMesage = '';
        this.isValidPass = true;
      }
    },
    updatePosition() {
      if (this.$el) {
        setWidth(this.$el.querySelector('.select-body') || null, this.$refs.dropdown ? this.$refs.dropdown.$el : null, this.transfer);
        this.$refs.dropdownContain && this.$refs.dropdownContain.$refs.drop && this.$refs.dropdownContain.$refs.drop.update();
      }
    },
    onClickOutside(event) {
      //点击外部，dropdown消失
      if (this.isVisible) {
        const $el = this.$refs.dropdown ? this.$refs.dropdown.$el || null : null;
        if (!$el || $el === event.target || $el.contains(event.target)) {
          return;
        }

        const $contain = this.$refs.dropdownContain ? this.$refs.dropdownContain.$el || null : null;

        if ((!$contain && $contain === event.target) || $contain.contains(event.target)) {
          return;
        } 
        
        if (this.transfer) {
        //如果是transfer的时候下拉的区域点击时是在dropdown外层的div上
          if ($el && $el.offsetParent && ($el.offsetParent === event.target || $el.offsetParent.contains(event.target))) {
            return;
          }
        }
        //如果点击区域不是自身元素则失去焦点
        this.isVisible = false;
        if (!this.multiple) {
          //单选
          let value = this.selectedList[0] ? (this.showPath ? this.selectedList[0]._path : this.selectedList[0][this.textName]) : '';
          if (this.searchKeyWord !== value) {
            this.searchKeyWord = value;
            this.initNodeList();
          }
        } else if (this.searchKeyWord) {
          this.searchKeyWord = '';
          this.initNodeList();
        }
      }
    },
    clearValue() {
      //是否更新下拉数据
      if (this.searchKeyWord) {
        this.searchKeyWord = '';
        this.setTimeSearch && clearTimeout(this.setTimeSearch);
        this.setTimeSearch = setTimeout(() => {
          this.searchNodeByUrl(this.searchKeyWord);
        }, 250);
      }
      //清除数据
      this.selectedList.forEach(item => {
        item.selected = false;
        item.checked = false;
      });
      this.selectedList = [];
      this.multiple ? (this.currentValue = []) : (this.currentValue = '');
      this.onChangeValue();
    },
    handleOpen: function() {
      if (this.disabled || this.readonly) {
        return;
      }
      this.isVisible = !this.isVisible;
    },
    initReadolyTitle() {
      if (!this.$el) {
        return;
      }
      let width = this.$el.clientWidth;
      let text_length = 0;
      let str = '';
      this.selectedList.forEach((i, sindex) => {
        let text = '';
        if (sindex < this.selectedList.length - 1) {
          text = i[this.textName] + this.sperateText;
        } else {
          text = i[this.textName];
        }
        str = str + text;
      });
      for (var i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 256) {
          text_length = text_length + 1;
        } else {
          text_length = text_length + 0.5;
        }
      }
      this.readonlyTitle = width > text_length * 14 ? null : str;
    },
    loadData(item, callback) {
      this.$emit('load-data', item, callback);
    }
  },
  computed: {
    getClass() {
      let classNameList = [];
      if (typeof this.width == 'string' && ['small', 'large', 'middle'].indexOf(this.width) >= 0) {
        classNameList.push('input-' + small);
      }
      this.disabled && classNameList.push('tsform-select-disabled');
      this.readonly && classNameList.push('tsform-select-readonly');
      if (!this.isValidPass) {
        classNameList.push('tsForm-formItem-error');
      }
      this.isVisible && classNameList.push('ivu-select-visible');
      this.focussing && classNameList.push('tsform-select-focus');
      return classNameList;
    },
    getClearable: function() {
      let _this = this;
      let clearable = _this.clearable;
      !clearable &&
        _this.validateList &&
        _this.validateList.forEach(item => {
          typeof item == 'string' && item == 'required' && !_this.multiple && (clearable = false);
          typeof item == 'object' && item.name == 'required' && !_this.multiple && (clearable = false);
        });
      if (this.disabled || this.readonly || this.selectedList.length == 0) {
        clearable = false;
      }

      return clearable;
    }
  },
  watch: {
    url() {
      this.initNodeList();
    },
    dataList() {
      this.initNodeList();
    },
    value: function(newValue, oldValue) {
      let _this = this;
      //if (JSON.stringify(newValue) != JSON.stringify(this.currentValue)) {
      //以上这个条件不知道什么意思，加上会导致修改数据时，大于原值层次的_path无法更新，导致选中回显为空，先注释掉
      this.currentValue = this.$utils.deepClone(newValue);
      this.selectedList = [];
      if (this.currentValue /*&& this.currentValue.length > 0*/) { //当this.currentValue是数字时，this.currentValue.length==false导致无法回显value值
        this.nodeList.forEach(item => this.flattenChildren(item)); 
      }
      this.validMesage = '';
      this.isValidPass = true;
      if (!this.multiple) {
        this.searchKeyWord = this.selectedList[0] ? (this.showPath ? this.selectedList[0]._path : this.selectedList[0][this.textName]) : '';
      } else {
        this.searchKeyWord = '';
      }
      if (this.$utils.isEmpty(newValue)) {
        // 如果为空，删除默认选中状态
        _this.nodeList.forEach((item) => {
          item.selected = false;
          item.checked = false;
        });
        _this.nodeList.forEach(item => _this.flattenChildren(item, null, ''));
      }
      //}
    },
    isVisible(val) {
      if (val) {
        this.$nextTick(() => {
          this.updatePosition();
        });
      }
    },
    params: {
      handler(newValue, oldValue) {
        if (newValue != oldValue && JSON.stringify(newValue) == JSON.stringify(oldValue)) {
          return false;
        } else {
          this.initNodeList();
        }
      },
      deep: true
    },
    selectedList: {
      handler(val) {
        let label = this.multiple ? this.selectedList.map(s => s[this.textName]) 
          : this.selectedList.length > 0 ? this.selectedList[0][this.textName] : '';
        this.$emit('change-label', label, this.multiple ? val : val[0] || {});
        typeof this.onChangelabel == 'function' && this.onChangelabel(label);
      },
      deep: true,
      immediate: true
    }
  }
};

function setWidth($contain, $target, transfer) {
  if ($contain && $target) {
    let newWidth = $contain.clientWidth || 0;
    // let oldWidth = $target.clientWidth || 0;
    // if (newWidth != oldWidth) {
    //   $target.parentNode.style.minWidth = newWidth + 'px';
    // }
    $target.parentNode.style.minWidth = newWidth + 'px';
    $target.parentNode.style.width = 'auto';
  }
}
</script>
<style lang="less">

.form-tree {
  .empty-placeholder {
    line-height: 30px;
    &:empty:before {
      content: attr(placeholder);
    }
  }
  .ivu-dropdown {
    position: relative;
  }
  /deep/ .ivu-select-dropdown {
    min-width: 100%;
    width: auto;
    max-height: 200px;
    overflow: auto;
    &.ivu-select-dropdown-transfer {
      max-height: auto;
    }

  }
  .select-body {
    .select-top {
      width: 100%;
      display: inline-block;
      min-height: 32px;
      line-height: 30px;
      border-radius: 2px;
      height: auto;
      padding: 0 8px;
      padding-right: 18px;
      vertical-align: middle;
      cursor: pointer;
      text-align: left;
      .single-span {
        width: 100%;
      }
      .search-input {
        height: 28px;
        border: 0 none !important;
        padding: 0;
      }
      .clearBtn {
        position: absolute;
        right: 2px;
        top: 6px;
        padding: 2px;
        font-size: 14px;
        cursor: pointer;
        display: none;
        opacity: 1;
      }
      &:hover {
        .clearBtn {
          display: block;
        }
      }
      /deep/.ivu-tag {
        margin-top: 4px;
        float: left;
        .ivu-icon-ios-close {
          line-height: initial;
        }
      }
    }
  }
  .tsFormTree.dropdown-ul{
    max-height: 300px;
    overflow: auto;
  }
}

.tsFormTree.dropdown-ul{
   padding-right: 10px;
  &.ivu-tree {
      li {
        padding: 0px 0px 0px 10px !important;
      }
      &.single {
        &.last{
          .ivu-tree-arrow-disabled {
            & + .ivu-tree-title:hover {
              background: transparent;
              cursor: pointer;
            }
          }
        }
      
        .ivu-tree-title{
          //width: calc(100% - 20px);
          width:auto !important;
        }
      }
      .ivu-tree-arrow-disabled {
          & + .ivu-tree-title:hover {
            background: transparent;
            cursor: default;
          }
      }
      .ivu-icon-ios-arrow-forward:before {
        font-family: 'tsfont';
        content: '\e899'; // tsfont-drop-right字体图标
      }
      .ivu-tree-arrow i {
        vertical-align: baseline; // 修复向下/向左箭头图标和文案不对齐问题
      }
    }
}
.form-transfer-tree {
  max-height: 400px;
}
</style>
