<template>
  <div class="form-li">
    <span v-if="readonly" :class="[readonlyClass, readonlyTextHighlightClass]">
      <template v-if="nodeList && nodeList.length > 0">
        <span
          v-for="(val, dindex) in value"
          :key="dindex"
          style="display:flex;"
        >
          {{ getText(val) }}
          <span v-if="dindex < value.length - 1" class="text-grey tsform-readonly-sperate">{{ sperateText }}</span>
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
      currentValue: this.value || [],
      validMesage: this.errorMessage || '',
      nodeList: this.url ? [] : this.dataList,
      currentValidList: this.filterValid(this.validateList) || []
    };
  },
  created() {
    this.setSelectList();
    this.initDataListByUrl();
  },
  mounted() {},
  beforeDestroy() {
    this.cancelAxios && this.cancelAxios.cancel();
  },
  methods: {
    test() {
      return false;
    },
    initDataListByUrl: function() {
      let _this = this;
      if (_this.url) {
        _this.nodeList = [];
        let params = { pageSize: 100 };
        typeof _this.params == 'object' && (params = Object.assign(params, _this.params));
        _this.nodeList = [];
        this.cancelAxios && this.cancelAxios.cancel();
        this.cancelAxios = this.$https.CancelToken.source();
        let ajaxArr = {method: _this.ajaxType, url: _this.url, cancelToken: this.cancelAxios.token };
        let needdataLi = ['post', 'put'];
        needdataLi.indexOf(_this.ajaxType) < 0 ? Object.assign(ajaxArr, {params: params}) : Object.assign(ajaxArr, {data: params});
        this.$https(ajaxArr).then(res => {
          if (res && res.Status == 'OK') {
            _this.nodeList = _this.rootName ? (res.Return?.[_this.rootName] || []) : res.Return;
            _this.nodeList && _this.nodeList.length > 500 && (_this.nodeList.length = 500);
            if (_this.dealDataByUrl && typeof _this.dealDataByUrl == 'function') {
              _this.nodeList = _this.dealDataByUrl(_this.nodeList);
            }
            this.setSelectList();
          }
        });
      } else if (_this.nodeList && _this.nodeList.length) {
        this.handleEchoFailedDefaultValue();
        // if (!_this.value.length) {
        //   //如果没有值的
        //   let selectedItem = _this.nodeList.filter(n => {
        //     return n['isSelect'];
        //   }); 
        //   if (selectedItem.length) {
        //     _this.currentValue = selectedItem.map(s => { return s[_this.valueName]; });
        //     _this.onChangeValue();
        //   } 
        // }
      }
    },
    handleEchoFailedDefaultValue() {
      // 处理回显失败默认值，回显失败清空默认值
      let selectedList = [];
      let valueList = this.currentValue instanceof Array ? this.currentValue : [this.currentValue];
      valueList.forEach((item, index) => {
        if (item && !this.nodeList.find((n) => n[this.valueName] == item)) {
          selectedList.push(item[this.valueName]);
          this.currentValue.splice(index, 1);
        }
      });
      if (!this.$utils.isEmpty(selectedList) && this.isClearEchoFailedDefaultValue) {
        this.onChangeValue();
      }
    },
    onChangeValue(val, item) {
      let isSame = JSON.stringify(this.value) == JSON.stringify(this.currentValue);
      let value = JSON.parse(JSON.stringify(this.currentValue));
      //20210129_zqp_新增支持on-change方法第二个参数获取选中的选项的完整数据
      let selectedItem = [];
      let label = [];
      if (this.nodeList && this.nodeList.length && value && value.length) {
        selectedItem = this.nodeList.filter(n => {
          if (value.includes(n[this.valueName])) {
            label.push(n[this.textName]);
            return true;
          }
        });
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
        }, 100);
      }
      this.handleEchoFailedDefaultValue();
    }
  },
  computed: {
    getClass() {
      let reslutClass = { 'ivu-checkbox-group-vertical': this.vertical };
      this.className && (reslutClass[this.className] = true);
      return reslutClass;
    },
    getText() {
      let _this = this;
      return function(val) {
        let node = _this.nodeList.find(item => item[_this.valueName] == val);
        return node && node[_this.textName] ? node[_this.textName] : '-';
      };
    }
  },
  watch: {
    value(newValue, oldValue) {
      if (JSON.stringify(newValue) != JSON.stringify(this.currentValue)) {
        this.currentValue = JSON.parse(JSON.stringify(newValue || []));
        this.validMesage = '';
        this.setSelectList();
      }
    },
    dataList: {
      handler(newValue) {
        if (!this.url) {
          this.$set(this, 'nodeList', newValue);
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
  /deep/ .ivu-checkbox {
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
