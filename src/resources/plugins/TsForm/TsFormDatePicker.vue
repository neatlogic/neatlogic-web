<template>
  <div class="form-li">
    <span v-if="readonly" :class="readonlyClass " :title="readonlyTitle">
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
        :options="getDateOptions()"
        :confirm="confirm"
        :open="open"
        :time-picker-options="getTimeDisabledList(value)"
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
import formMixins from '@/resources/mixins/formMixins.js';
import formScrollMixins from '@/resources/mixins/formScrollMixins.js';
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
      //?????????false  ??????????????????????????????
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: true
    },
    value: {
      //?????????
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
      //??????????????????value?????????????????????
      type: String,
      default: 'normal' // normal timestamp  format
    },
    splitPanels: {
      //range????????????
      type: Boolean,
      default: false
    },
    transfer: Boolean, //??????transfer??????
    border: String, //??????????????? border bottom none
    onBlur: Function, //?????????????????????
    onFocus: Function, //?????????????????????
    onChange: Function, //???????????????
    isChangeWrite: {
      //??????????????????????????????on-change??????
      type: Boolean,
      default: true
    },
    scrollParent: [Object, String],
    options: [Object], //???????????????????????????????????????????????????????????????????????????????????? 1????????????  disabledDate???Funtion???value???{return Boolean}  2???shortcuts ???[{text:string, value:function(){return value}???onClick :function(){}}]
    confirm: {
      //???????????????????????????
      type: Boolean,
      default: false
    },
    open: {
      //?????????????????????????????????????????????true ????????????false ????????????
      type: Boolean,
      default: null
    },
    separator: {
      //?????????
      type: String,
      default: '-'          
    },
    placement: {
      type: String,
      default: 'bottom-start'      
    },
    timePickerOptions: { //??????????????????
      type: Object,
      default: null
    },
    selectableRange: {//??????????????????????????????0??????????????????????????????????????????5???????????????selectableRange: () => { const now = new Date().getTime(); return [now + 5 * 60 * 1000, 0];}
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
      currentValidMesage: ''
    };
  },
  mounted() {
    this.readonly && this.initReadolyTitle();
  },
  beforeDestroy() {},
  methods: {
    getCurrentValue: function() {
      let _this = this;
      let format = formatSeting(_this.type, _this.format);
      let valueType = this.valueType;
      let value = null;
      let multiple = _this.multiple;
      if (typeof _this.value == 'number') {
        value = _this.changeDateFormat(new Date(_this.value), format, true, valueType);
      } else if (_this.value instanceof Array) {
        let arry = [];
        arry = _this.value.map(function(item) {
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
    onChangeValue() {
      let _this = this;
      let time = _this.getFormatValue();

      let isSame = (_this.value == time);
      _this.$emit('update:value', time);
      _this.$emit('change', time);
      if (!(!this.isChangeWrite && isSame)) {
        //??????????????????on-change??????
        _this.$emit('on-change', time);
      }

      if (!isSame) {
        typeof _this.onChange == 'function' && _this.onChange(time);
        this.currentValidDate(time);
        if (_this.currentValidList.length > 0) {
          _this.valid(time);
        }
      } else {
        _this.validMesage = '';
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
      this.$emit('on-ok');
    },
    onClickoutside() {
      //???????????????????????????????????????
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
    //???????????????????????????????????????????????????????????????
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
        //???value????????????
        return value;
      }
      let newValue = '';
      let styleType = '-';
      format && format.indexOf('/') >= 0 && (styleType = '/');
      format && format.indexOf('|') >= 0 && (styleType = '');
      if (format.indexOf('yyyy') < 0 && format.indexOf('MM') < 0) {
        //??????format ????????? ???  ??? ????????????????????????
        // ??????????????????????????????????????????(format='yyyy')????????????????????????????????????Date()??????
        return value;
      }

      if (this.readonly && typeof value == 'string') {
        return value;
      }
      // normal timestamp  format
      if ((format == 'yyyy-MM-dd HH:mm:ss' || format == 'yyyy/MM/dd HH:mm:ss' || valueType == 'timestamp') && !isInit && valueType != 'format') {
        //???????????????????????????format??????????????????????????????
        return new Date(value).getTime();
      }
      //?????????  valueType=='format'  ????????????
      value instanceof Number && (value = new Date(value));
      if (this.type.indexOf('time') != -1 && typeof value == 'string' && (format.indexOf('yyyy') > 0 || format.indexOf('MM') > 0)) {
        //?????????????????????????????????????????????format????????????yyyy-mm-dd???
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
    currentValidDate(value) { //????????????????????????
      let isValid = true;
      if (value && this.selectableRange && typeof this.selectableRange == 'function') {
        let timeList = this.selectableRange();
        if ((timeList[0] && timeList[0] > value) || (timeList[1] && timeList[1] < value)) {
          this.currentValidMesage = this.desc || '????????????????????????';
          isValid = false;
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
        placeholder = '???????????????';
      } else if (_this.type == 'year') {
        placeholder = '????????????';
      } else if (_this.type == 'month') {
        placeholder = '???????????????';
      } else if (_this.type == 'time') {
        placeholder = '???????????????';
      } else if (_this.type == 'timerange') {
        placeholder = '?????????????????????';
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
    getClass: function() {
      let _this = this;
      let resultjson = [];
      // if (typeof _this.width == 'string' && ['small', 'large', 'middle'].indexOf(_this.width) >= 0) {
      //   resultjson.push("input-" + small);
      // }
      _this.validMesage && resultjson.push('tsForm-formItem-error');
      return resultjson;
    },
    getDateOptions() {
      return () => {
        let options = this.options || {};
        if (this.selectableRange && typeof this.selectableRange == 'function') {
          let dateTimeList = this.selectableRange();
          options.disabledDate = function(date) {
            return date && (dateTimeList[0] && date.valueOf() < dateTimeList[0] - 86400000) || (dateTimeList[1] && date.valueOf() > dateTimeList[1]);
          };
        }
        return options;
      };
    },
    getTimeDisabledList() { //????????????
      return (value) => {
        let timePickerOptions = {};
        let disabledHoursList = [];
        let disabledMinutesList = [];
        if (this.type == 'datetime' && this.selectableRange && typeof this.selectableRange == 'function') {
          let dateTimeList = this.selectableRange(); 
          let startTime = dateTimeList[0] > 0 ? new Date(dateTimeList[0]) : 0;
          let endTime = dateTimeList[1] > 0 ? new Date(dateTimeList[1]) : 0;
          let startHours = 0;
          let startMinutes = 0;
          let endHours = 0;
          let endMinutes = 0;
          if (startTime > 0) {
            startHours = startTime.getHours();
            startMinutes = startTime.getMinutes();
            if ((!value && this.$utils.getDateByFormat(startTime, 'yyyy-MM-dd') == this.$utils.getCurrenttime('yyyy-MM-dd')) || (value && this.$utils.getDateByFormat(value, 'yyyy-MM-dd') == this.$utils.getDateByFormat(startTime, 'yyyy-MM-dd'))) { //????????????
              let selectTime = -1;
              if (value) {
                selectTime = new Date(value).getHours();
              }
              for (let i = 0; i < startHours; i++) {
                disabledHoursList.push(i);
              }
              if (selectTime <= startHours) {
                for (let i = 0; i <= startMinutes; i++) {
                  disabledMinutesList.push(i);
                }
              }
            }
          }
          if (endTime > 0) {
            endHours = endTime.getHours();
            endMinutes = endTime.getMinutes();
            if ((!value && this.$utils.getDateByFormat(endTime, 'yyyy-MM-dd') == this.$utils.getCurrenttime('yyyy-MM-dd')) || (value && this.$utils.getDateByFormat(value, 'yyyy-MM-dd') == this.$utils.getDateByFormat(endTime, 'yyyy-MM-dd'))) { //????????????
              for (let i = 0; i > endHours && i < 24; i++) {
                !disabledHoursList.find(item => item == i) && disabledHoursList.push(i);
              }
              for (let i = 0; i > endMinutes && i < 60; i++) {
                !disabledMinutesList.find(item => item == i) && disabledMinutesList.push(i);
              }
            }
          }
          timePickerOptions.disabledHours = disabledHoursList;
          timePickerOptions.disabledMinutes = disabledMinutesList;
        }
        return timePickerOptions;
      };
    }
  },
  watch: {
    value(newValue, oldValue) {
      let _this = this;
      if (newValue instanceof Array) {
        if (JSON.stringify(newValue) != JSON.stringify(this.getFormatValue())) {
          let value = _this.getCurrentValue();
          _this.currentValue = value.value;
          _this.currentMultiple = value.multiple;
          _this.validMesage = '';
        }
      } else if (newValue != this.getFormatValue()) {
        let value = _this.getCurrentValue();
        _this.currentValue = value.value;
        _this.currentMultiple = value.multiple;
        _this.validMesage = '';
      }
    },
    format(newValue, oldValue) {
      this.$emit('change', this.getFormatValue());
    },
    readonly(newValue, oldValue) { //???????????????????????????????????????iview???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????currentValue??????
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
