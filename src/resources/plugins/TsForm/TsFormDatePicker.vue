<template>
  <div class="form-li">
    <span v-if="readonly" :class="[readonlyClass, readonlyTextHighlightClass]" :title="readonlyTitle">
      <template v-if="type && type.indexOf('range')>=0 && (currentValue instanceof Array)"> {{ currentValue[0] }} - {{ currentValue[1] }}</template>
      <template v-else> {{ currentValue || '-' }}</template>
    </span>
    <div
      v-else
      :class="borderClass"
      :style="getStyle"
    >
      <DatePicker
        v-if="type != 'time' && type != 'timerange'"
        v-model="currentValue"
        style="width:100%"
        :placement="placement"
        :class="getClass"
        :type="type"
        :format="getFormat"
        :readonly="readonly"
        :disabled="disabled"
        :size="size"
        :multiple="currentMultiple"
        :placeholder="getPlaceholder"
        :clearable="getClearable"
        :split-panels="splitPanels"
        :transfer="transfer"
        :editable="false"
        :options="dateOptions"
        :confirm="confirm"
        :open="open"
        :time-picker-options="getTimeOptions()"
        @on-change="onChangeValue"
        @on-ok="onOk"
        @on-clear="onClear"
        @on-clickoutside="onClickoutside"
      >
        <slot></slot>
      </DatePicker>
      <TimePicker
        v-else
        v-model="currentValue"
        v-bind="options"
        style="width:100%"
        :separator="separator"
        :placement="placement"
        :class="getClass"
        :type="type"
        :format="getFormat"
        :readonly="readonly"
        :disabled="disabled"
        :size="size"
        :placeholder="getPlaceholder"
        :split-panels="splitPanels"
        :clearable="getClearable"
        :transfer="transfer"
        :editable="false"
        :confirm="confirm"
        :open="open"
        @on-change="onChangeValue"
        @on-ok="onOk"
        @on-clickoutside="onClickoutside"
        @on-clear="onClear"
      >
        <slot></slot>
      </TimePicker>
      <div v-if="desc && !descType && !validMesage" class="text-tip tips">{{ desc }}</div>
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
import { parseDate } from 'neatlogic-ui/iview/components/date-picker/util';
import formMixins from '@/resources/mixins/formMixins.js';
import formScrollMixins from '@/resources/mixins/formScrollMixins.js';

// MySQL TIMESTAMP(3) 使用 UTC 边界，面板仍按浏览器本地时间显示。
const timestampMin = Date.UTC(1970, 0, 1, 0, 0, 1);
const timestampMax = Date.UTC(2038, 0, 19, 3, 14, 7, 499);

// 两个闭区间有交集时，允许继续选择其中的日期或时刻。
function overlapsRange(start, end, [min, max]) {
  return min <= max && start <= max && end >= min;
}

// 日期、年月按其代表的本地起点判断；日期时间保留原始毫秒。
function selectionTime(date, type) {
  if (type === 'datetime' || type === 'datetimerange') return date.getTime();
  const start = new Date(date);
  if (type === 'year') start.setMonth(0, 1);
  if (type === 'month') start.setDate(1);
  return start.setHours(0, 0, 0, 0);
}

export default {
  name: 'TsFormDatePicker',
  tagComponent: 'TsForm',
  mixins: [formMixins, formScrollMixins],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    type: String, // text textarea  number   select   dynamicSelect  radio  checkbox  date time  timerange
    name: String,
    format: String, //yyyy-MM-dd HH:mm
    multiple: {
      //默认为false  是否可以选择多个日期
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: true
    },
    value: {
      //默认值
      default: function() {
        if (this.type == 'datetimerange' || this.type == 'timerange' || this.multiple == true) {
          return new Array();
        } else {
          return '';
        }
      }
    },
    placeholder: String,
    valueType: {
      //最终获取到的value值是否是时间戳
      type: String,
      default: 'normal' // normal timestamp  format
    },
    splitPanels: {
      //range时的联动
      type: Boolean,
      default: false
    },
    transfer: Boolean, //设置transfer的值
    border: String, //控件的样式 border bottom none
    onBlur: Function, //失去焦点时触发
    onFocus: Function, //获取焦点时触发
    onChange: Function, //改变时触发
    isChangeWrite: {
      //赋值时，是否需要出发on-change事件
      type: Boolean,
      default: true
    },
    scrollParent: [Object, String],
    options: [Object], //选择器额外配置，比如不可选日期与快捷选项，具体项详见下表 1、不可选  disabledDate：Funtion（value）{return Boolean}  2、shortcuts ：[{text:string, value:function(){return value}，onClick :function(){}}]
    confirm: {
      //是否显示底部控制栏
      type: Boolean,
      default: false
    },
    open: {
      //手动控制时间选择器的显示状态，true 为显示，false 为收起。
      type: Boolean,
      default: null
    },
    separator: {
      //分隔符
      type: String,
      default: '-'          
    },
    placement: {
      type: String,
      default: 'bottom-start'      
    },
    timePickerOptions: { //设置时间参数
      type: Object,
      default: null
    },
    selectableRange: {//设置不可选时间范围（0表示不限制），例子：选择范围5分钟之后：selectableRange: () => { const now = new Date().getTime(); return [now + 5 * 60 * 1000, 0];}
      type: Function,
      default: null
    }
  },
  data() {
    let _this = this;
    let value = _this.getCurrentValue();
    return {
      currentMultiple: value.multiple,
      validMesage: _this.errorMessage || '',
      currentValidList: _this.filterValid(_this.validateList) || [],
      currentValue: value.value,
      readonlyTitle: null,
      currentValidMesage: '',
      isValidPass: true
    };
  },
  mounted() {
    this.readonly && this.initReadolyTitle();
  },
  beforeDestroy() {},
  methods: {
    getCurrentValue: function() {
      // 编辑时保留原始毫秒；只读和纯时间控件沿用原来的字符串展示。
      const editableDate = !this.readonly && this.type !== 'time' && this.type !== 'timerange';
      let _this = this;
      let format = formatSeting(_this.type, _this.format);
      let valueType = this.valueType;
      let value = null;
      let multiple = _this.multiple;
      if (typeof _this.value == 'number') {
        const date = new Date(_this.value);
        value = editableDate ? date : _this.changeDateFormat(date, format, true, valueType);
      } else if (_this.value instanceof Array) {
        let arry = [];
        arry = _this.value.map(function(item) {
          if (editableDate && (typeof item === 'number' || item instanceof Date)) return new Date(item);
          if (typeof item == 'number') {
            return _this.changeDateFormat(new Date(item), format, true, valueType);
          } else if (format.indexOf('yyyy') >= 0 && !_this.readonly) {
            return new Date(_this.changeDateFormat(new Date(item), format, true, valueType));
          } else {
            return item;
          }
        });
        value = arry;
      } else {
        value = _this.value;
      }
      if (value instanceof Array) {
        multiple = true;
      }
      return {value: value, multiple: multiple};
    },
    // 0 表示调用方未限制该端；动态业务范围在使用时重新计算。
    getDateRange() {
      const [min, max] = this.selectableRange ? this.selectableRange() : [];
      return [Math.max(timestampMin, min || timestampMin), Math.min(timestampMax, max || timestampMax)];
    },
    // 校验原始候选，保留快捷选项、多选和范围端点的精度。
    isDateSelectionAllowed(value) {
      if (this.type === 'time' || this.type === 'timerange') return true;
      const dates = Array.isArray(value) ? value : [value];
      const filled = dates.filter(item => item != null && item !== '');
      if (!filled.length) return true;
      if (this.type?.endsWith('range') && filled.length !== 2) return false;
      const range = this.getDateRange();
      return filled.every(item => {
        const date = typeof item === 'string' ? parseDate(item, this.getFormat) : new Date(item);
        if (!date) return false;
        const time = selectionTime(date, this.type);
        if (!overlapsRange(time, time, range) || !overlapsRange(+date, +date, range)) return false;
        if (this.options?.disabledDate?.(new Date(date))) return false;
        if (this.type === 'datetime' || this.type === 'datetimerange') {
          const options = this.timePickerOptions || {};
          return !options.disabledHours?.includes(date.getHours()) &&
            !options.disabledMinutes?.includes(date.getMinutes()) && !options.disabledSeconds?.includes(date.getSeconds());
        }
        return true;
      });
    },
    // 底层面板可暂存边界日上的未完成选择；业务事件只发布有效值。
    checkDateSelection() {
      if (this.isDateSelectionAllowed(this.currentValue)) return true;
      this.validMesage = this.dateRangeMessage;
      this.isValidPass = false;
      return false;
    },
    // 单值面板可根据当前日期分别限制时、分、秒；范围面板两端共用配置，只传业务禁用项。
    getTimeOptions() {
      const options = { ...this.timePickerOptions };
      const date = this.currentValue;
      const range = this.getDateRange();
      const boundaryDay = this.type === 'datetime' && date instanceof Date &&
        (new Date(date).setHours(0, 0, 0, 0) < range[0] || new Date(date).setHours(24, 0, 0, 0) - 1 > range[1]);
      const units = [
        ['disabledHours', 24, 'setHours', 3600000],
        ['disabledMinutes', 60, 'setMinutes', 60000],
        ['disabledSeconds', 60, 'setSeconds', 1000]
      ];
      for (const [key, count, setter, duration] of units) {
        // 底层滚轮会追加禁用项，因此每次传入独立数组。
        const disabled = new Set(options[key]);
        if (boundaryDay) {
          for (let index = 0; index < count; index++) {
            const slot = new Date(date);
            const start = slot[setter](index, 0, 0, 0);
            if (!overlapsRange(start, start + duration - 1, range)) disabled.add(index);
          }
        }
        options[key] = [...disabled];
      }
      return options;
    },
    onChangeValue() {
      if (!this.checkDateSelection()) return;
      if (!this.isValidPass && this.validMesage === this.dateRangeMessage) {
        this.validMesage = '';
        this.isValidPass = true;
      }
      let _this = this;
      let time = _this.getFormatValue();

      let isSame = (_this.value == time);
      _this.$emit('update:value', time);
      _this.$emit('change', time);
      if (!(!this.isChangeWrite && isSame)) {
        //改变值时触发on-change事件
        _this.$emit('on-change', time);
      }

      if (!isSame) {
        typeof _this.onChange == 'function' && _this.onChange(time);
        if (_this.type === 'time' || _this.type === 'timerange') _this.myValid(time);
        if (_this.currentValidList.length > 0) {
          _this.valid(time);
        }
      } else {
        _this.validMesage = '';
        _this.isValidPass = true;
      }
    },
    getFormatValue() {
      let _this = this;
      let format = formatSeting(_this.type, _this.format);
      if (_this.currentValue instanceof Date) {
        return _this.changeDateFormat(_this.currentValue, format, false, _this.valueType);
      } else if (_this.currentValue instanceof Array) {
        // let valueList = _this.currentValue.filter(item => {
        //   let itemValue = _this.changeDateFormat(item, format, false, _this.valueType);
        //   return itemValue != '';
        // });

        let valueList = [];
        _this.currentValue.forEach(item => {
          let itemValue = _this.changeDateFormat(item, format, false, _this.valueType);
          itemValue != '' && valueList.push(itemValue);
        });
        return valueList.length ? valueList : null;
      } else {
        return _this.currentValue === '' ? null : _this.currentValue;
      }
    },
    onOk() {
      if (this.type === 'time' || this.type === 'timerange') {
        this.$emit('on-ok');
        return;
      }
      // 底层通过 input 同步 v-model；确认前先等同一轮的候选值更新。
      this.$nextTick(() => {
        if (this.checkDateSelection()) this.$emit('on-ok');
      });
    },
    onClickoutside() {
      //点击外部关闭下拉菜单时触发
      this.$emit('on-clickoutside');
    },
    onClear() {
      this.$emit('change-label', null);
      this.$emit('on-clear');
    },
    initReadolyTitle() {
      let width = this.$el.clientWidth;
      let text_length = 0;
      let str = '';
      if (this.type && this.type.indexOf('range') >= 0 && this.currentValue instanceof Array) {
        str = this.currentValue[0] + ' - ' + this.currentValue[1];
      } else {
        str = this.currentValue || '';
      }
      for (var i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 256) {
          text_length = text_length + 1;
        } else {
          text_length = text_length + 0.5;
        }
      }
      this.readonlyTitle = width > text_length * 14 ? null : str;
    },
    //监听父容器滚动时，导致滚出对应的容器的问题
    onScroll: function(event) {
      if (this.$children[0].visible && this.$children[0].$refs.drop) {
        let $contain = event.target;
        let $target = this.$children[0].$refs.drop.$el;
        let targetTop = $target.offsetTop;
        let containTop = $contain.getBoundingClientRect().top;
        if (!(targetTop > containTop + 10 && targetTop < containTop + $contain.clientHeight)) {
          this.$children[0].visible = false;
        }
      }
    },
    changeDateFormat(value, format, isInit, valueType) {
      if (!value) {
        //当value值为空时
        return value;
      }
      let newValue = '';
      let styleType = '-';
      format && format.indexOf('/') >= 0 && (styleType = '/');
      format && format.indexOf('|') >= 0 && (styleType = '');
      if (format.indexOf('yyyy') < 0 && format.indexOf('MM') < 0) {
        //如果format 不含有 年  月 ，直接返回字符串
        // 解决日期格式，格式类型是年份(format='yyyy')，没有返回年份，返回的是Date()类型
        return value;
      }

      if (this.readonly && typeof value == 'string') {
        return value;
      }
      // normal timestamp  format
      if ((format == 'yyyy-MM-dd HH:mm:ss' || format == 'yyyy/MM/dd HH:mm:ss' || valueType == 'timestamp') && !isInit && valueType != 'format') {
        //不是初始化值，并且format完整，直接获取时间戳
        return new Date(value).getTime();
      }
      //初始化  valueType=='format'  格式完整
      value instanceof Number && (value = new Date(value));
      if (this.type && this.type.indexOf('time') != -1 && typeof value == 'string' && (format.indexOf('yyyy') > 0 || format.indexOf('MM') > 0)) {
        //处理当格式是时间的但是用了错的format（比如：yyyy-mm-dd）
        value = new Date(value);
      }
      let arrayFormat = ['yyyy', 'MM', 'dd', 'HH', 'mm', 'ss'];

      if (format.indexOf('yyyy') >= 0) {
        newValue = value.getFullYear();
      }

      if (format.indexOf('MM') >= 0) {
        let mm = value.getMonth() + 1;
        mm < 10 && (mm = '0' + mm);
        newValue = newValue ? newValue + styleType + mm : mm;
      }

      if (format.indexOf('dd') >= 0) {
        let dd = value.getDate();
        dd < 10 && (dd = '0' + dd);
        newValue = newValue ? newValue + styleType + dd : newValue + dd;
      }

      if (format.indexOf('HH') >= 0) {
        let HH = value.getHours();
        HH < 10 && (HH = '0' + HH);
        newValue = newValue ? newValue + ' ' + HH : newValue + HH;
      }

      if (format.indexOf('mm') >= 0) {
        let mm = value.getMinutes();
        mm < 10 && (mm = '0' + mm);
        newValue = format.indexOf('HH') >= 0 ? newValue + ':' + mm : newValue + ' ' + mm;
      }

      if (format.indexOf('ss') >= 0) {
        let ss = value.getSeconds();
        ss < 10 && (ss = '0' + ss);
        newValue = format.indexOf('mm') >= 0 ? newValue + ':' + ss : newValue + ' ' + ss;
      }
      return newValue.toString().trim();
    },
    myValid(value) { //当前组件特殊校验
      let isValid = true;
      if (this.type !== 'time' && this.type !== 'timerange') {
        // valid() 可能收到格式化后的月份字符串；按面板原值校验才能保留年份。
        if (!this.readonly && !this.disabled && !this.isDateSelectionAllowed(this.currentValue)) {
          this.currentValidMesage = this.dateRangeMessage;
          isValid = false;
        }
      } else if (value && this.selectableRange) {
        let timeList = this.selectableRange();
        if ((timeList[0] && timeList[0] > value) || (timeList[1] && timeList[1] < value)) {
          this.currentValidMesage = this.dateRangeMessage;
          isValid = false;
        }
      }
      //datetimerange类型初始化空数组，必填校验
      if (isValid && Array.isArray(value) && !this.$utils.isEmpty(this.validateList)) {
        let isRequired = false;
        for (let i = 0; i < this.validateList.length; i++) {
          if (typeof this.validateList[i] == 'string') {
            if (this.validateList[i] == 'required') {
              isRequired = true;
            }
          } else if (typeof this.validateList[i] == 'object') {
            if (this.validateList[i].name == 'required') {
              isRequired = true;
            }
          }
        }
        if (isRequired) {
          for (let i = 0; i < value.length; i++) {
            if (!value[i]) {
              isValid = false;
              break;
            }
          }
        }
      }
      return isValid;
    }
  },
  computed: {
    getFormat: function() {
      let _this = this;
      return formatSeting(_this.type, _this.format, true);
    },
    getPlaceholder: function() {
      let _this = this;
      let placeholder = '';
      if (_this.placeholder) {
        placeholder = _this.placeholder;
      } else if (_this.type == 'datetime' || _this.type == 'datetimerange' || _this.type == 'date') {
        placeholder = this.$t('form.placeholder.pleaseselect', {target: this.$t('page.date')});
      } else if (_this.type == 'year') {
        placeholder = this.$t('form.placeholder.pleaseselect', {target: this.$t('page.particularyear')});
      } else if (_this.type == 'month') {
        placeholder = this.$t('form.placeholder.pleaseselect', {target: this.$t('page.particularmonth')});
      } else if (_this.type == 'time') {
        placeholder = this.$t('form.placeholder.pleaseselect', {target: this.$t('page.time')});
      } else if (_this.type == 'timerange') {
        placeholder = this.$t('form.placeholder.pleaseselect', {target: this.$t('page.timerange')});
      }
      return placeholder;
    },
    getClearable: function() {
      let _this = this;
      let clearable = _this.clearable;
      _this.validateList &&
        _this.validateList.forEach(item => {
          typeof item == 'string' && item == 'required' && !_this.multiple && (clearable = false);
          typeof item == 'object' && item.name == 'required' && !_this.multiple && (clearable = false);
        });
      return clearable;
    },
    getClass() {
      let classNameList = [];
      // if (typeof _this.width == 'string' && ['small', 'large', 'middle'].indexOf(_this.width) >= 0) {
      //   classNameList.push("input-" + small);
      // }
      if (!this.isValidPass) {
        classNameList.push('tsForm-formItem-error');
      }
      return classNameList;
    },
    dateRangeMessage() {
      return this.desc || this.$t('form.placeholder.pleaseselect', {target: this.$t('term.plugin.correcttime')});
    },
    dateOptions() {
      const options = this.options || {};
      return {
        ...options,
        disabledDate: (date, isTime) => {
          if (options.disabledDate?.(new Date(date), isTime)) return true;
          // 单值时间滚轮按小时、分钟、秒的区间禁用，允许继续调整未完成的时刻。
          if (isTime) return false;
          const range = this.getDateRange();
          if (this.type === 'datetime' || this.type === 'datetimerange') {
            const start = new Date(date).setHours(0, 0, 0, 0);
            const nextDay = new Date(date).setHours(24, 0, 0, 0);
            return !overlapsRange(start, nextDay - 1, range);
          }
          const time = selectionTime(date, this.type);
          return !overlapsRange(time, time, range);
        }
      };
    }
  },
  watch: {
    value(newValue, oldValue) {
      if (newValue instanceof Array) {
        if (JSON.stringify(newValue) != JSON.stringify(this.getFormatValue())) {
          let value = this.getCurrentValue();
          this.currentValue = value.value;
          this.currentMultiple = value.multiple;
          this.validMesage = '';
          this.isValidPass = true;
          this.$emit('change-label', this.currentValue);
        }
      } else if (newValue != this.getFormatValue()) {
        let value = this.getCurrentValue();
        this.currentValue = value.value;
        this.currentMultiple = value.multiple;
        this.validMesage = '';
        this.isValidPass = true;
        this.$emit('change-label', this.currentValue); // 修复combineSearcher 组件默认值回显异常问题
      }
    },
    format(newValue, oldValue) {
      if (this.checkDateSelection()) this.$emit('change', this.getFormatValue());
    },
    readonly(newValue, oldValue) { //在只读模式切换的时候，因为iview的值可能为日期格式，导致只读模式的数据显示不正确，因此在切换模式的时候需要跟新一下currentValue的值
      if (newValue != oldValue) {
        let value = this.getCurrentValue();
        this.currentValue = value.value;
      }
    }
  }
};

function formatSeting(type, format, isFilterSymbol = false) {
  let tempFormat = format ? JSON.parse(JSON.stringify(format)) : '';
  let resultJson = 'yyyy-MM-dd HH:mm:ss';
  if (tempFormat) {
    resultJson = isFilterSymbol ? tempFormat.replace(/\|/g, '') : tempFormat;
  } else if (type == 'year') {
    resultJson = 'yyyy';
  } else if (type == 'month') {
    resultJson = 'MM';
  } else if (type == 'time' || type == 'timerange') {
    resultJson = 'HH:mm:ss';
  } else if (type == 'date') {
    resultJson = 'yyyy-MM-dd';
  }
  return resultJson;
}
</script>
<style lang="less" scoped>
</style>
