<template>
  <div class="form-li">
    <span v-if="readonly" :class="[readonlyClass, readonlyTextHighlightClass]">
      <template v-if="currentValue && currentValue.length > 0">
        <span
          v-for="(item, dindex) in currentValue"
          :key="dindex"
          style="display:flex;"
        >
          {{ getSelectedText(item) }}
          <span v-if="dindex < currentValue.length - 1" class="text-grey tsform-readonly-sperate">{{ sperateText }}</span>
        </span>
      </template>
      <template v-else>-</template>
    </span>
    <div v-else :style="getStyle">
      <template v-if="nodeList && nodeList.length">
        <CheckboxGroup
          v-model="currentValue"
          :class="getClass"
          :readonly="readonly"
          @on-change="onChangeValue"
        >
          <Checkbox
            v-for="(data, index) in nodeList"
            :key="data[valueName]"
            :label="data[valueName]"
            :disabled="disabled || data.disabled"
          ><slot
            name="label"
            :node="data"
            :index="index"
          >{{ data[textName] || '-' }}</slot></Checkbox>
        </CheckboxGroup>
      </template>
      <template v-else>
        <div>-</div>
      </template>
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
  </div>
</template>
<script>
import formMixins from '@/resources/mixins/formMixins.js';
export default {
  name: 'TsFormCheckbox',
  tagComponent: 'TsForm',
  mixins: [formMixins],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    dataList: Array,
    name: String,
    valueName: {
      default: 'value'
    },
    textName: {
      default: 'text'
    },
    value: {
      //默认值 
      type: [Array, String],
      default: () => []
    },
    url: {
      //通过url初始化数据
      type: String,
      default: ''
    },
    params: Object,
    rootName: {
      //通过url来获取数据的rootName
      default: ''
    },
    vertical: {
      //横向 false，纵向 true
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    onChange: Function, //改变时触发
    isChangeWrite: {
      //赋值时，是否需要出发on-change事件
      type: Boolean,
      default: true
    },
    sperateText: {
      type: String,
      default: '|'
    },
    dealDataByUrl: {//特殊情况 通过url获取的数据可能需要额外的封装之后才能使用
      type: Function
    },
    ajaxType: {
      type: String,
      default: 'post'
    }
  },
  data() {
    return {
      currentValue: [],
      validMesage: this.errorMessage || '',
      nodeList: [],
      currentValidList: this.filterValid(this.validateList) || [],
      currentRequestSeq: 0,
      setSelectTime: null
    };
  },
  created() {
    this.nodeList = this.url ? [] : this.normalizeNodeList(this.dataList);
    this.currentValue = this.handleCurrentValue(this.value) || [];
    this.setSelectList();
    this.initDataListByUrl();
  },
  mounted() {},
  beforeDestroy() {
    this.currentRequestSeq += 1;
    this.setSelectTime && clearTimeout(this.setSelectTime);
    this.setSelectTime = null;
    this.cancelAxios && this.cancelAxios.cancel();
    this.cancelAxios = null;
  },
  methods: {
    normalizeNodeList(nodeList) {
      return Array.isArray(nodeList) ? this.$utils.deepClone(nodeList).slice(0, 500) : [];
    },
    getSelectedItems(valueList) {
      let selectedList = [];
      if (this.nodeList && this.nodeList.length && valueList && valueList.length) {
        selectedList = this.nodeList.filter(n => {
          return valueList.includes(n[this.valueName]);
        });
      }
      return selectedList;
    },
    buildRequestOptions(params) {
      let ajaxArr = { method: this.ajaxType, url: this.url, cancelToken: this.cancelAxios.token };
      let needdataLi = ['post', 'put'];
      needdataLi.indexOf(this.ajaxType) < 0 ? Object.assign(ajaxArr, { params: params }) : Object.assign(ajaxArr, { data: params });
      return ajaxArr;
    },
    initDataListByUrl() {
      let _this = this;
      if (this.readonly && !this.$utils.isEmpty(this.historyValue)) {
        // 只读模式下不需要调接口获取数据
        return false;
      }
      this.cancelAxios && this.cancelAxios.cancel();
      this.cancelAxios = null;
      if (_this.url) {
        _this.nodeList = [];
        let params = { pageSize: 100 };
        typeof _this.params == 'object' && (params = Object.assign(params, _this.params));
        const requestSeq = ++this.currentRequestSeq;
        this.cancelAxios = this.$https.CancelToken.source();
        let ajaxArr = this.buildRequestOptions(params);
        this.$https(ajaxArr).then(res => {
          if (requestSeq !== this.currentRequestSeq) {
            return;
          }
          if (res && res.Status == 'OK') {
            let nodeList = _this.rootName ? (res.Return?.[_this.rootName] || []) : res.Return;
            if (_this.dealDataByUrl && typeof _this.dealDataByUrl == 'function') {
              nodeList = _this.dealDataByUrl(nodeList);
            }
            _this.nodeList = _this.normalizeNodeList(nodeList);
            _this.handleDisabledNodeList();
            this.setSelectList();
          }
        });
      } else {
        this.currentRequestSeq += 1;
        _this.nodeList = _this.normalizeNodeList(_this.dataList);
        if (_this.nodeList && _this.nodeList.length) {
          this.handleDisabledNodeList();
          this.handleEchoFailedDefaultValue();
        }
        this.setSelectList();
      }
    },
    handleDisabledNodeList() {
      if (this.disabled && !this.$utils.isEmpty(this.historyValue)) {
        const nodeValueSet = new Set(this.nodeList.map(item => item[this.valueName]));
        const newItems = this.historyValue.filter(item => !nodeValueSet.has(item[this.valueName]));
        if (Array.isArray(this.nodeList) && newItems.length > 0) {
          this.nodeList.unshift(...newItems);
        }
      }
    },
    handleEchoFailedDefaultValue() {
      // 处理回显失败默认值，回显失败清空默认值
      // if (this.isClearEchoFailedDefaultValue && !this.$utils.isEmpty(this.nodeList)) {
      //   let selectedList = [];
      //   let valueList = this.currentValue instanceof Array ? this.currentValue : [this.currentValue];
      //   valueList.forEach((item, index) => {
      //     if (item && !this.nodeList.find((n) => n[this.valueName] == item)) {
      //       selectedList.push(item[this.valueName]);
      //       this.currentValue.splice(index, 1);
      //     }
      //   });
      //   if (!this.$utils.isEmpty(selectedList)) {
      //     this.onChangeValue();
      //   }
      // }
    },
    onChangeValue(val, item) {
      let isSame = JSON.stringify(this.value) == JSON.stringify(this.currentValue);
      let value = this.$utils.deepClone(this.currentValue);
      //20210129_zqp_新增支持on-change方法第二个参数获取选中的选项的完整数据
      let selectedItem = this.getSelectedItems(value);
      let label = [];
      if (selectedItem.length > 0) {
        selectedItem.forEach(n => {
          label.push(n[this.textName]);
        });
        if (this.isCustomValue) {
          value = selectedItem;
        }
      }
      this.$emit('update:value', value);
      this.$emit('change', value, selectedItem);
      if (!(!this.isChangeWrite && isSame)) {
        //改变值时出发on-change事件
        this.$emit('on-change', value, selectedItem);
        typeof this.onChange == 'function' && this.onChange(value, selectedItem);
      }
      if (!isSame) {
        //值不相同时，触发校验
        if (this.currentValidList.length > 0) {
          this.valid(this.currentValue);
        }
      } else {
        this.validMesage = '';
      }
      this.setSelectList(label);
    },
    setSelectList(selectedLabel) {
      let _this = this;
      _this.setSelectTime && clearTimeout(_this.setSelectTime);
      if (selectedLabel) { //label通过外部传过来
        _this.setSelectTime = null;
        _this.$emit('change-label', selectedLabel);
      } else {
        this.setSelectTime = setTimeout(function() {
          _this.setSelectTime = null;
          let label = null;
          if (_this.nodeList && _this.nodeList.length && _this.currentValue.length) {
            let selectedItem = [];
            selectedItem = _this.nodeList.filter(n => {
              return _this.currentValue.includes(n[_this.valueName]);
            });
            label = selectedItem.map(s => {
              return s[_this.textName];
            });
            _this.$emit('change-label', label);
          } else {
            _this.$emit('change-label', []);
          }
          _this.handleEchoFailedDefaultValue();
        }, 100);
      }
    }
  },
  computed: {
    getClass() {
      let reslutClass = { 'ivu-checkbox-group-vertical': this.vertical };
      this.className && (reslutClass[this.className] = true);
      return reslutClass;
    }
  },
  watch: {
    value: {
      handler(newValue, oldValue) {
        let isSame = this.$utils.isSame(this.handleCurrentValue(newValue), this.currentValue);
        if (!isSame) {
          this.currentValue = this.handleCurrentValue(this.$utils.deepClone(newValue)) || [];
          this.validMesage = '';
          this.setSelectList();
        }
      },
      deep: true
    },
    dataList: {
      handler(newValue) {
        if (!this.url) {
          this.$set(this, 'nodeList', this.normalizeNodeList(newValue));
          this.handleDisabledNodeList();
          this.setSelectList();
        }
      },
      deep: true
    },
    url(newValue, oldValue) {
      if (newValue != oldValue) {
        this.initDataListByUrl();
      }
    },
    params(newValue, oldValue) {
      if (newValue != oldValue && this.$utils.isSame(newValue, oldValue)) {   
        return; 
      }
      this.initDataListByUrl();
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.ivu-checkbox-group-vertical {
  .ivu-checkbox-group-item {
    display: block;
    height: 30px;
    line-height: 30px;
  }
}
//只读模式的样式修改
.tsform-checkbox-readonly {
  .ivu-checkbox-wrapper-disabled,
  .ivu-checkbox-disabled {
    opacity: 0.7;
  }
}

.block-span { //块状选项
  .ivu-checkbox-group,
  .ivu-radio-group {
    width: 100%;
    padding: 12px 0px 7px;
  }

  .ivu-checkbox-wrapper,
  .ivu-radio-wrapper {
    margin-right: 10px;
    margin-bottom: 5px;
    border-radius: 16px;
    padding: 4px 10px;
    line-height: 1.4;
  }
  .ivu-checkbox-wrapper,
  .ivu-radio-wrapper {
    background-color: @default-background;
  }
  .ivu-checkbox-wrapper-checked,
  .ivu-radio-wrapper-checked {
    background: var(--condition-checkbox-color, @condition-checkbox-color);
    color: @default-op;
  }
    //隐藏多选框
  ::v-deep .ivu-checkbox {
    display: none;
  }
}
.theme-dark {
  .block-span {
    .ivu-checkbox-wrapper,
    .ivu-radio-wrapper {
      background-color: @dark-gray;
    }
    .ivu-checkbox-wrapper-checked,
    .ivu-radio-wrapper-checked {
      background: var(--condition-checkbox-color, @condition-checkbox-color);
      color: @default-op;
    }
  }
}
</style>
