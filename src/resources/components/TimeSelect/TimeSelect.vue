<!-- 授权 -->
<template>
  <div class="form-li">
    <div v-if="disabled || readonly" :class="readonlyClass">{{ showText }}</div>
    <div
      v-else
      v-click-outside:false="onClickOutside"
      v-click-outside:false.mousedown="onClickOutside"
      v-click-outside:false.touchstart="onClickOutside"
      class="form-li select-body timeselect-contain"
      :class="borderClass"
      @click.stop
    >
      <Dropdown
        ref="dropdownContain"
        style="width:100%"
        trigger="custom"
        :visible="isVisible"
        :transfer="transfer"
        placement="bottom-start"
      >
        <div class="search-contain" @click="handleOpen">
          <span class="search-input ivu-select-selection empty-placeholder bg-op" :class="validMesage ? 'border-color-error' : 'border-color'" :placeholder="placeholder">{{ showText }}</span>
          <i :class="['ivu-select-arrow', { 'tsfont-down': !isVisible }, { 'tsfont-up': isVisible }]"></i>
          <i v-if="showText && clearable" class="clearBtn text-icon ivu-icon tsfont-close-s bg-op" @click="clearValue"></i>
        </div>
        <DropdownMenu slot="list" ref="dropdown" class="list-contain">
          <li
            v-for="(item, index) in timeList"
            :key="index"
            :class="getliClass(item)"
            @click.stop="onChange(item.value, item)"
          >
            {{ item.text }}
          </li>
          <template v-if="isMore">
            <li class="ivu-dropdown-item line border-color"></li>
            <li :class="getliClass(datetimerange)" @click.stop="onChange(datetimerange.value, datetimerange)">
              {{ datetimerange.text }}
            </li>
            <li v-if="showTimeRange && isVisible" @click.stop>
              <TsFormDatePicker
                v-model="timeValue"
                border="border"
                :separator="' ' + separator + ' '"
                :type="getCustomTimeType(type)"
                :splitPanels="isRelative"
                :format="format"
                :value-type="valueType"
                :placeholder="placeholder"
                :clearable="clearable"
                @on-change="saveTimeRange"
                @on-ok="isVisible = false"
              ></TsFormDatePicker>
            </li>
          </template>
        </DropdownMenu>
      </Dropdown>
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
import TsFormDatePicker from '@/resources/plugins/TsForm/TsFormDatePicker.vue';
import TransferDom from '../../directives/transfer-dom.js';
import { directive as ClickOutside } from '../../directives/v-click-outside-x.js';
import formScrollMixins from '@/resources/mixins/formScrollMixins.js';
export default {
  name: 'TimeSelect',
  components: { TsFormDatePicker },
  directives: { TransferDom, ClickOutside },
  mixins: [formScrollMixins, formMixins],
  tagComponent: 'TsForm',
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    isMore: {
      //是否支持自定义时间
      type: Boolean,
      default: true
    },
    dataList: Array, //自定义下拉数据
    value: [Object, String],
    clearable: {
      type: Boolean,
      default: true
    },
    type: {
      //自定义时间的类型
      type: String,
      default: 'daterange'
    },
    format: {
      //自定义时间的时间格式
      type: String,
      default: 'yyyy-MM-dd'
    },
    placeholder: {
      type: String,
      default() {
        return this.$t('page.pleaseselect');
      }
    },
    valueType: {
      //获取时间 字符串  时间戳  等
      type: String,
      default: 'timestamp' // timestamp  format
    },
    transfer: {
      type: Boolean,
      default: false
    },
    isRelative: {
      type: Boolean,
      default: true
    },
    separator: {
      type: String,
      default: '-'
    },
    readonlyClass: {
      type: String,
      default: ''
    },
    scrollParent: [Object, String]
  },
  data() {
    var datetimerange = { value: '_datetimerange', text: this.$t('page.custom') };
    // if (this.isMore) {
    //   dataList.push(datetimerange);
    // }
    return {
      datetimerange: datetimerange,
      isVisible: false,
      timeList: [
        { value: '1', text: this.$t('page.lastday'), timeUnit: 'day' },
        { value: '1', text: this.$t('page.lastweek'), timeUnit: 'week' },
        { value: '15', text: this.$t('page.lasthalfmonth'), timeUnit: 'day' },
        { value: '1', text: this.$t('page.lastmonth'), timeUnit: 'month' },
        { value: '6', text: this.$t('page.lastsixmonths'), timeUnit: 'month' },
        { value: '1', text: this.$t('page.lastyear'), timeUnit: 'year' }
      ],
      timeValue: null,
      showText: '',
      showTimeRange: false,
      currentValue: this.value || {},
      validMesage: this.errorMessage || '',
      currentValidList: this.filterValid(this.validateList) || []
    };
  },
  created() {
    this.initShowText();
  },
  beforeMount() {},
  mounted() {
    const $el = this.$refs.dropdown ? this.$refs.dropdown.$el || null : null;
    if ($el) {
      $el.parentNode.style.maxHeight = 'initial';
      $el.parentNode.style.overflow = 'initial';
    }
  },
  beforeDestroy() {},
  methods: {
    getCustomTimeType(customTimeType) {
      // 修复CombineSearcher 组件，timeselect 组件内容显示问题
      return customTimeType == 'timeselect' ? 'daterange' : customTimeType;
    },
    initShowText() {
      let _this = this;
      if (this.currentValue && this.currentValue.timeRange) {
        //回写固定时间
        let selectedItem = this.timeList.find(function(item, index) {
          if (item.value == _this.currentValue.timeRange && (!item.timeUnit || item.timeUnit == _this.currentValue.timeUnit)) {
            _this.$set(_this.timeList[index], 'selected', true);
            return item;
          }
        });
        selectedItem && (this.showText = selectedItem.text);
        this.showTimeRange = false;
      } else if (this.currentValue && this.currentValue.startTime) {
        //会写自定义时间
        this.showTimeRange = true;
        _this.$set(_this.datetimerange, 'selected', true);
        this.dealTimeValue(true, true);
      } else {
        this.showTimeRange = false;
        this.timeValue = null;
        this.showText = '';
      }
    },
    onChange(value, item) {
      if (item.selected) {
        return;
      }

      if (value == '_datetimerange') {
        //自定义
        this.showTimeRange = true;
        this.$nextTick(function() {
          this.updatePosition();
        });
      } else {
        this.showTimeRange = false;
        this.timeValue = null;
        this.timeList.forEach(time => {
          time.selected && (time.selected = false);
        });
        this.datetimerange.selected = false;
        this.$set(item, 'selected', true);
        this.showText = item.text;
        this.currentValue = { timeRange: item.value, timeUnit: item.timeUnit };
        this.valid(this.currentValue);
        this.$emit('change', this.currentValue, item);
        this.$emit('on-change', this.currentValue, item);
        this.$emit('change-label', item.text); // 解决combineSearch 组件内容显示问题
        this.$emit('update:value', this.currentValue);
        this.isVisible = false;
      }
    },
    formatDatetime(date) {
      return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + date.getDate();
    },
    saveTimeRange() {
      //时间插件确认按钮
      this.timeList.forEach(time => {
        time.selected && (time.selected = false);
      });
      this.$set(this.datetimerange, 'selected', true);
      this.dealTimeValue(false, true);
      if (!this.showText || !this.showText.trim()) {
        this.showText = '';
        this.currentValue = null;
      } else if (this.type.indexOf('range') >= 0 || this.type.indexOf('timeselect') >= 0) {
        this.currentValue = { startTime: this.timeValue[0] || null, endTime: this.handleEndTime(this.timeValue[1]) };
      } else {
        this.currentValue = { startTime: this.timeValue || null, endTime: this.timeValue || null };
      }
      this.valid(this.currentValue);
      let text = '';
      if (this.currentValue.startTime) {
        text += this.formatDatetime(new Date(this.currentValue.startTime));
      }
      if (this.currentValue.endTime) {
        if (text) {
          text += '~';
          text += this.formatDatetime(new Date(this.currentValue.endTime));
        }
      }
      this.$emit('change', this.currentValue, { value: this.currentValue, text: text });
      this.$emit('on-change', this.currentValue, { value: this.currentValue, text: text });
      this.$emit('change-label', this.showText); // 修复CombineSearcher 组件时间组件内容显示问题
      this.$emit('update:value', this.currentValue);
    },
    handleEndTime(endTime) {
      /* 处理结束时间 
        时间格式是年月日时分秒，结束时间取默认值，其他格式小时分钟秒钟截至到：23:59:59
       */
      let newDate = null;
      if (endTime && this.format && this.format.indexOf('HH') < 0) {
        newDate = new Date(endTime);
        newDate.setHours(23);
        newDate.setMinutes(59);
        newDate.setSeconds(59);
        newDate = new Date(newDate).getTime();
      }
      return newDate || endTime;
    },
    clearValue() {
      //清除值
      this.showText = '';
      this.timeValue = null;
      this.showTimeRange = false;
      this.currentValue = null;
      this.isVisible = false;
      this.timeList.forEach(time => {
        time.selected && (time.selected = false);
      });
      this.datetimerange.selected = false;
      this.$emit('change', this.currentValue);
      this.$emit('on-change', this.currentValue, null);
      this.$emit('change-label', null);
    },
    hideOption() {
      this.isVisible = false;
    },
    dealTimeValue(setValue, setText) {
      if (setValue) {
        let timeValue = null;
        if (this.type.indexOf('range') >= 0 || this.type.indexOf('timeselect') >= 0) {
          timeValue = [this.currentValue.startTime, this.currentValue.endTime];
        } else {
          timeValue = this.currentValue.startTime;
        }
        this.timeValue = timeValue;
      }

      if (setText) {
        let showText = '';
        if (this.timeValue instanceof Array) {
          //数组的回显
          this.timeValue.forEach(item => {
            let text = this.valueType == 'timestamp' && item ? this.$utils.getDateByFormat(item, this.format) : item;
            showText = showText ? showText + ' ' + this.separator + ' ' + text : showText + text;
          });
        } else {
          //字符串的回显
          this.valueType == 'timestamp' && this.timeValue ? (showText = this.$utils.getDateByFormat(this.timeValue, this.format)) : (showText = this.timeValue);
        }
        this.showText = showText;
      }
    },
    onClickOutside(event) {
      //点击外部，dropdown消失
      if (this.isVisible) {
        const $el = this.$refs.dropdown ? this.$refs.dropdown.$el || null : null;
        if (!$el || $el === event.target || $el.contains(event.target)) {
          return;
        }
        this.isVisible = false;
        !this.datetimerange.selected && (this.showTimeRange = false);
        const $contain = this.$refs.dropdownContain ? this.$refs.dropdownContain.$el || null : null;
        if ((!$contain && $contain === event.target) || $contain.contains(event.target)) {
          return;
        }
      }
    },
    handleOpen() {
      if (this.disabled || this.readonly) {
        return;
      }

      this.isVisible = !this.isVisible;
      this.isVisible && this.updatePosition();
    },
    updatePosition() {
      //更新dropdown，下拉框的位置
      if (this.$el) {
        setWidth(this.$el.querySelector('.select-body') || null, this.$refs.dropdown ? this.$refs.dropdown.$el : null, this.transfer);
        // this.$refs.dropdownContain && this.$refs.dropdownContain.$children[0].update();
        this.$refs.dropdownContain && this.$refs.dropdownContain.$refs.drop && this.$refs.dropdownContain.$refs.drop.update();
      }
    },
    currentValidTimeSelect(currentValue) {
      // 验证时间范围必填
      let isValid = true;
      let currentValidList = this.filterValid(this.validateList) || [];
      if ((!currentValue || JSON.stringify(currentValue, null, 2) == '{}') && !this.$utils.isEmpty(currentValidList) && (currentValidList instanceof Array) && currentValidList.find((item) => item.name == 'required')) {
        if (!currentValue || (!currentValue.timeRange && !currentValue.startTime)) {
          this.validMesage = '请选择时间范围';
          isValid = false;
        }
      } else {
        this.validMesage = '';
        isValid = true;
      }
      return isValid;
    }
  },
  computed: {
    getStartDate() {
      let startDate = null;
      if (this.startTime) {
        startDate = new Date(startDate);
      }
      return startDate;
    },
    getliClass() {
      return function(item) {
        return ['ivu-dropdown-item', { selected: item.selected }];
      };
    }
  },
  watch: {
    value: {
      handler(newValue, oldValue) {
        if (JSON.stringify(newValue) != JSON.stringify(this.currentValue)) {
          this.currentValue = this.value;
          this.timeList.forEach(item => {
            this.$set(item, 'selected', false);
          });
          this.datetimerange.selected = false;
          this.initShowText();
        }
      },
      deep: true
    },
    dataList: {
      handler(val) {
        if (val && val.length > 0) {
          this.timeList = this.$utils.deepClone(val);
        }
      },
      immediate: true,
      deep: true
    }
  }
};

function setWidth($contain, $target, transfer) {
  if ($contain && $target) {
    let newWidth = $contain.clientWidth || 0;
    let oldWidth = $target.clientWidth || 0;
    if (newWidth != oldWidth) {
      $target.parentNode.style.minWidth = newWidth + 'px';
    }
    $target.parentNode.style.width = 'auto';
    // if (transfer) {
    //   $target.parentNode.style.width = 'auto';
    // }
  }
}
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.read-container {
  border: 1px solid;
  line-height: 30px;
  padding: 0 8px;
  border-radius: 2px;
}
.timeselect-contain {
  position: relative;
  display: block;
  vertical-align: middle;
  width: 100%;
  .search-contain {
    position: relative;
    text-align: left;
    .search-input {
      line-height: 30px;
      padding-right: 20px;
      overflow: hidden;
      padding: 0px 10px;
      height: 32px;
      border: 1px solid;
      &:empty:before {
        content: attr(placeholder);
      }
    }
    &:hover {
      .clearBtn {
        display: block;
      }
    }
    .clearBtn {
      position: absolute;
      right: 4px;
      top: 50%;
      -webkit-transform: translateY(-50%);
      transform: translateY(-50%);
      display: none;
    }
    .dropIcon {
      position: absolute;
      right: 0;
      top: 50%;
      -webkit-transform: translateY(-50%);
      transform: translateY(-50%);
    }
  }
}
ul.list-contain {
  min-width: 100%;
  border-radius: 2px;
  z-index: 2;
  line-height: 1.6;
  &.bottom-start {
    left: 0px;
  }
  &.bottom-end {
    right: 0px;
    left: auto;
  }
  &.top-start {
    bottom: 32px;
  }
  &.top-end {
    bottom: 32px;
    right: 0px;
    left: auto;
  }
  > li {
    cursor: pointer;
    padding: 7px 16px;
    // min-width: 225px;
  }
  .datetimerange {
    border-top: 1px solid;
    padding-top: 8px;
    padding-bottom: 8px;
  }
}
</style>
<style lang="less">
.ivu-select-dropdown {
  .ivu-dropdown-item.line {
    border-top: 1px solid;
    padding: 0px;
    margin: 5px 0px;
    cursor: auto;
  }
}
</style>
