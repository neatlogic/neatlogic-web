<template>
  <div style="position: relative;">
    <i v-if="setting.config.isRequired" class="require-tip">*</i>
    <TsFormDatePicker 
      v-if="setting" 
      v-model="currentValue" 
      :name="setting.uuid" 
      :transfer="transfer" 
      :type="getType" 
      :validateList="getValidList" 
      value-type="format" 
      :width="setting.config.width" 
      :format="getFormat" 
      :showType="setting.config.showType" 
      :disabled="isReadonly || false"
      :placeholder="setting.config.placeholder || ''" 
      :time-picker-options="timePickerOptions"
      :options="option"
      readonlyClass=""
      @on-change="updatethis(currentValue)"
    ></TsFormDatePicker>
    <DatePicker v-else type="date" placeholder="选择日期"></DatePicker>
    <div v-if="setting.config.desc" class="component-tips ts-info">{{ setting.config.desc }}</div>
  </div>
</template>
<script>
import TsFormDatePicker from '@/resources/plugins/TsForm/TsFormDatePicker';
import viewmixin from './viewmixin.js';
export default {
  name: 'Formdate',
  components: { TsFormDatePicker },
  mixins: [viewmixin],
  props: {
    setting: Object,
    value: [String, Number],
    isReadonly: Boolean,
    componentList: {
      type: Array,
      default: () => []
    },
    formView: {
      //是否通过form-view页面进行初始化，如果不是则需要把defaultValue值给 value
      type: Boolean,
      default: true
    },
    transfer: {
      type: Boolean,
      default: true      
    }
  },
  data() {
    let _this = this;
    return {
      currentValue: _this.value || '',
      timePickerOptions: {
        disabledHours: [],
        disabledMinutes: []
      }
    };
  },
  created() {},
  methods: {
    updatethis: function(val) {
      this.$emit('update', val);
    },
    updateValue: function(val) {
      this.$set(this, 'currentValue', val || '');
    },
    getValue: function(val) {
      return this.currentValue;
    },
    async validateValue(validConifg) {
      let isVaild = true;
      isVaild = this.$children[0].valid();
      if (isVaild && this.setting.config.validType && this.setting.config.validType.indexOf('workdate') >= 0 && this.currentValue) {
        //校验工作时间
        isVaild = await this.validWorkDate(validConifg);
      }
      return isVaild;
    },
    async validWorkDate(validConifg) {
      //工作时间的校验，需要服务id
      let _this = this;
      let valid = true;
      if (validConifg && (validConifg.channelUuid || validConifg.processTaskId)) {
        let data = {
          data: _this.currentValue,
          attributeUuid: this.setting.uuid,
          config: {}
        };
        validConifg.processTaskId ? (data.config.processTaskId = validConifg.processTaskId) : (data.config.channelUuid = validConifg.channelUuid);
        let res = await this.$api.framework.form.validFormDate(data);
        if (res.Status == 'OK' && res.Return && res.Return.result) {
          _this.$children[0].validMesage = '';
        } else {
          valid = false;
          _this.$children[0].validMesage = '日期不在工作时间范围内';
        }
      }
      return valid;
    },
    handleDate(dateValue) {
      // 处理时间方法
      let year = new Date(dateValue).getFullYear(); 
      let month = new Date(dateValue).getMonth() + 1;
      let day = new Date(dateValue).getDate();
      let currentYMD = `${year}-${month}-${day}`;
      return new Date(currentYMD).getTime();
    },
    handleLaterAndEqualDisableDate(currentValue, calculateValue, unit) {
      // 处理大于等于规则时，小时和分钟置灰
      let _this = this;
      let disabledHours = ''; // 禁用小时
      let disabledMinutes = ''; // 禁用分钟
      if (currentValue > calculateValue) {
        _this.timePickerOptions.disabledHours = [];
        _this.timePickerOptions.disabledMinutes = [];
      } else if (currentValue <= calculateValue) {
        if ((unit == 'day' || unit == 'hour' || unit == 'month' || unit == 'year')) {
          disabledHours = new Date(calculateValue).getHours();
          disabledMinutes = new Date(calculateValue).getMinutes();
          _this.timePickerOptions.disabledHours = [];
          if (disabledHours && disabledHours != 'NAN') {
            for (let i = 1; i < disabledHours; i++) {
              _this.timePickerOptions.disabledHours.push(i);
            }
          }
          if (disabledMinutes && disabledMinutes != 'NAN') {
            for (let i = 1; i < disabledMinutes; i++) {
              _this.timePickerOptions.disabledMinutes.push(i);
            }
          }
        }
      }
    },
    handleLaterAndEqual(unit, minDate, num) {
      // 处理大于等于规则时，处理置灰时间边界
      let date = new Date(this.$utils.deepClone(minDate));
      if (unit == 'hour') {
        //小时
        date.setDate(date.getDate() - 1);
        date.setHours(date.getHours() - num);
        minDate = new Date(date).getTime();
      } else if (unit == 'day') {
        // 天
        date.setDate(date.getDate() - 1);
        minDate = new Date(date).getTime();
      } else if (unit == 'month') {
        // 月份
        date.setDate(date.getDate() - 1);
        minDate = new Date(date).getTime();
      } else if (unit == 'year') {
        // 年
        date.setDate(date.getDate() - 1);
        minDate = new Date(date).getTime();
      }
      return minDate;
    },
    handleEarlierAndEqualDisableDate(currentValue, calculateValue, unit) {
      // 处理小于等于规则时，置灰时分
      let _this = this;
      let currentYMD = _this.handleDate(currentValue); // 当前值
      let calculateYMD = _this.handleDate(calculateValue); // 计算后值
      let disabledHours = '';
      let disabledMinutes = '';
      if (currentYMD == calculateYMD) {
        if ((unit == 'day' || unit == 'hour' || unit == 'month' || unit == 'year')) {
          let currentHour = new Date(currentValue).getHours();
          disabledHours = new Date(calculateValue).getHours();
          disabledMinutes = new Date(calculateValue).getMinutes();
          let disabledHoursOne = disabledHours + 1; // 不禁用边界值
          let disabledMinutesOne = disabledMinutes + 1; // 不禁用边界值
          _this.timePickerOptions.disabledHours = [];
          if (disabledHours && disabledHours != 'NAN') {
            for (let i = disabledHoursOne; i <= 23; i++) {
              _this.timePickerOptions.disabledHours.push(i);
            }
          }
          if (disabledMinutes && disabledMinutes != 'NAN' && currentHour >= disabledHours) {
            for (let i = disabledMinutesOne; i <= 59; i++) {
              _this.timePickerOptions.disabledMinutes.push(i);
            }
          } else {
            _this.timePickerOptions.disabledMinutes = [];
          }
        }
      } else {
        _this.timePickerOptions.disabledHours = [];
        _this.timePickerOptions.disabledMinutes = [];
      }
    },
    handleEarlierAndEqual(unit, maxDate, num) {
      // 处理小于等于规则时，置灰日期边界
      let date = new Date(this.$utils.deepClone(maxDate));
      if (unit == 'hour') {
        //小时
        date.setDate(date.getDate() + 1);
        date.setHours(date.getHours() + num);
        maxDate = new Date(date).getTime();
      } else if (unit == 'day') {
        // 天
        date.setDate(date.getDate() + 1);
        maxDate = new Date(date).getTime();
      } else if (unit == 'month') {
        // 月份
        date.setDate(date.getDate() + 1);
        maxDate = new Date(date).getTime();
      } else if (unit == 'year') {
        // 年份
        date.setDate(date.getDate() + 1);
        maxDate = new Date(date).getTime();
      }
      return maxDate;
    }
  },
  computed: {
    getFormat() {
      if (this.setting.config) {
        let styleType = this.setting.config.styleType || '-';
        return this.setting.config.showType.replace(/\-/g, styleType);
      } else {
        return 'yyyy-MM-dd HH:mm';
      }
    },
    getType() {
      if (this.setting.config.showType && this.setting.config.showType.indexOf(' HH') >= 0) {
        return 'datetime';
      } else {
        let type = 'datetime';
        if (this.setting.config && this.setting.config.showType) {
          this.setting.config.showType == 'yyyy' && (type = 'year');
          this.setting.config.showType == 'yyyy-MM' && (type = 'month');
          this.setting.config.showType == 'yyyy-MM-dd' && (type = 'date');
        }
        return type;
      }
    },
    getValidList() {
      let _this = this;
      let config = this.setting.config;
      let validateList = config.isRequired ? ['required'] : [];
      let dateText = {
        later: '大于',
        earlier: '小于',
        laterAndEqual: '大于等于',
        earlierAndEqual: '小于等于'
      };
      let unitText = {
        hour: '小时',
        day: '天',
        month: '月',
        year: '年'
      };
      let plusMinusSign = {
        later: 'add',
        earlier: 'reduce',
        laterAndEqual: 'add',
        earlierAndEqual: 'reduce'
      };
   
      //自定义校验
      if (config.validType && config.validType.indexOf('custom') >= 0 && config.validValueList && config.validValueList.length > 0) {
        config.validValueList.forEach(item => {
          //text  filter value
          if (!item.filter || !item.text) {
            //为空校验
            return;
          } else if (item.filter == 'custom' && item.value) {
            //自定义
            validateList.push({
              name: 'tomore',
              trigger: 'change',
              message: '日期需要' + (dateText[item.text]) + item.value,
              validator: (rule, value) => {
                let currentValue = new Date(_this.$utils.handleInvalidDate(value, config.showType, config.styleType)).getTime();
                let calculateValue = new Date(_this.$utils.handleInvalidDate(item.value, config.showType, config.styleType)).getTime();
                if (value == '') {
                  return true;
                } else if (item.text == 'later') {
                  return currentValue > calculateValue;
                } else if (item.text == 'earlier') {
                  return currentValue < calculateValue;
                } else if (item.text == 'laterAndEqual') {
                  _this.handleLaterAndEqualDisableDate(currentValue, calculateValue, item.unit);
                  return currentValue >= calculateValue;
                } else if (item.text == 'earlierAndEqual') {
                  _this.handleEarlierAndEqualDisableDate(currentValue, calculateValue, item.unit);
                  return currentValue <= calculateValue;
                }
                return true;
              }
            });
          } else if (item.filter == 'nowDay') {
            //当前时间
            validateList.push({
              name: 'tomore',
              trigger: 'change',
              message: '日期需要' + (dateText[item.text]) + '当前填写日期' + item.value + unitText[item.unit],
              validator: (rule, value) => {
                let currentValue = new Date(_this.$utils.handleInvalidDate(value, config.showType || '', config.styleType)).getTime();
                let calculateValue = new Date(_this.$utils.timestampCalculation(item.unit, item.value || 0, null, config.showType || '', config.styleType, plusMinusSign[item.text])).getTime();
                if (value == '') {
                  return true;
                } else if (item.text == 'later') {
                  return currentValue > calculateValue;
                } else if (item.text == 'earlier') {
                  return currentValue < calculateValue;
                } else if (item.text == 'laterAndEqual') {
                  _this.handleLaterAndEqualDisableDate(currentValue, calculateValue, item.unit);
                  return currentValue >= calculateValue;
                } else if (item.text == 'earlierAndEqual') {
                  _this.handleEarlierAndEqualDisableDate(currentValue, calculateValue, item.unit);
                  return currentValue <= calculateValue;
                }
                return true;
              }
            });
          } else {
            //表单相同组件
            for (let i = 0; i < this.componentList.length; i++) {
              if (this.componentList[i].uuid == item.filter) {
                let component = this.componentList[i];
                validateList.push({
                  name: 'tomore',
                  trigger: 'change',
                  message: '日期需要' + (dateText[item.text]) + component.label + item.value + unitText[item.unit],
                  validator: (rule, value) => {
                    let configValue = component.config.value || component.config.valueQuote; // 解决自定义规则，没有校验的问题
                    let currentValue = new Date(_this.$utils.handleInvalidDate(value, config.showType || '', config.styleType)).getTime();
                    let calculateValue = new Date(_this.$utils.timestampCalculation(item.unit, item.value || 0, configValue, config.showType || '', config.styleType, plusMinusSign[item.text])).getTime();
                    if (value == '' || !configValue) {
                      return true;
                    } else if (item.text == 'laterAndEqual') {
                      _this.handleLaterAndEqualDisableDate(currentValue, calculateValue, item.unit);
                      return currentValue >= calculateValue;
                    } else if (item.text == 'earlierAndEqual') {
                      _this.handleEarlierAndEqualDisableDate(currentValue, calculateValue, item.unit);
                      return currentValue <= calculateValue;
                    } else if (item.text == 'later') {
                      return currentValue > calculateValue;
                    } else if (item.text == 'earlier') {
                      return currentValue < calculateValue;
                    }
                    return true;
                  }
                });
                break;
              }
            }
          }
        });
      }
      return validateList;
    },
    option(date) {
      // 晚于的最大日期取里面最大的，早于的最小日期取里面最小的
      let _this = this;
      let config = this.setting.config;
      let minDate = '';//早于，可选择区间里最小的日期
      let maxDate = '';//晚于，可选择区间里最大的日期
      if (config.validType && config.validType.indexOf('custom') >= 0 && config.validValueList && config.validValueList.length > 0) {
        config.validValueList.forEach(item => {
          if (item.filter == 'custom' && item.value) {
            //自定义
            if (item.text == 'later' || item.text == 'laterAndEqual') {
              minDate = minDate ? Math.min(new Date(minDate).getTime(), new Date(this.$utils.handleInvalidDate(item.value, this.setting.config.showType || '', config.styleType)).getTime()) : new Date(this.$utils.handleInvalidDate(item.value, config.showType || '', config.styleType)).getTime();
              if (item.text == 'laterAndEqual') {
                // 处理禁用日期边界
                minDate = _this.handleLaterAndEqual(item.unit, minDate, 0);
              }
            } else if (item.text == 'earlier' || item.text == 'earlierAndEqual') {
              maxDate = maxDate ? Math.max(new Date(maxDate).getTime(), new Date(this.$utils.handleInvalidDate(item.value, this.setting.config.showType || '', config.styleType)).getTime()) : new Date(this.$utils.handleInvalidDate(item.value, config.showType || '', config.styleType)).getTime();
              if (item.text == 'earlierAndEqual') {
                // 处理禁用日期边界
                maxDate = _this.handleEarlierAndEqual(item.unit, maxDate, 1);
              }
            }
          } else if (item.filter == 'nowDay') {
            //当前时间
            if (item.text == 'later' || item.text == 'laterAndEqual') {
              let newValue = _this.$utils.timestampCalculation(item.unit, item.value || 0, null, this.setting.config.showType || '', this.setting.config.styleType);
              minDate = minDate ? Math.min(new Date(minDate).getTime(), new Date(newValue).getTime()) : new Date(newValue).getTime();
              if (item.text == 'laterAndEqual') {
                // 处理禁用日期边界
                minDate = _this.handleLaterAndEqual(item.unit, minDate, item.value);
              }
            } else if (item.text == 'earlier' || item.text == 'earlierAndEqual') {
              let newValue = _this.$utils.timestampCalculation(item.unit, -(item.value || 0), null, this.setting.config.showType || '', this.setting.config.styleType);
              maxDate = maxDate ? Math.max(new Date(maxDate).getTime(), new Date(newValue).getTime()) : new Date(newValue).getTime();
              if (item.text == 'earlierAndEqual') {
                // 处理禁用日期边界
                maxDate = _this.handleEarlierAndEqual(item.unit, maxDate, item.value);
              }
            }
          } else {
            //表单相同组件
            let comparedValue = '';
            if (this.componentList.length > 0) {
              this.componentList.forEach(c => {
                if (c.uuid == item.filter) {
                  comparedValue = c.config.value;
                }
              });
            }
            if (comparedValue) {
              if (item.text == 'later' || item.text == 'laterAndEqual') {
                // 大于等于某个时间段
                let newValue = _this.$utils.timestampCalculation(item.unit, item.value || 0, comparedValue, this.setting.config.showType || '', this.setting.config.styleType);
                minDate = minDate ? Math.min(new Date(minDate).getTime(), new Date(newValue).getTime()) : new Date(newValue).getTime();
                if (item.text == 'laterAndEqual') {
                  // 处理禁用日期边界
                  minDate = _this.handleLaterAndEqual(item.unit, minDate, item.value);
                }
              } else if (item.text == 'earlier' || item.text == 'earlierAndEqual') {
                let newValue = _this.$utils.timestampCalculation(item.unit, -(item.value || 0), comparedValue, this.setting.config.showType || '', this.setting.config.styleType);
                maxDate = maxDate ? Math.max(new Date(maxDate).getTime(), new Date(newValue).getTime()) : new Date(newValue).getTime();
                if (item.text == 'earlierAndEqual') {
                  // 处理禁用日期边界
                  maxDate = _this.handleEarlierAndEqual(item.unit, maxDate, item.value);
                }
              }
            }
          }
        });
      }
      return {
        disabledDate(date) {
          let curTime = new Date();
          new Date(date.setHours(curTime.getHours()));
          new Date(date.setMinutes(curTime.getMinutes()));
          return date && ((maxDate && date.valueOf() >= maxDate) || (minDate && date.valueOf() <= minDate));
        }  
      };
    }
  },
  watch: {
    value: function(newValue, oldValue) {
      if (newValue != this.currentValue) {
        this.currentValue = this.value || '';
      }
    }
  }
};

function getFormat(config) {
  if (config) {
    let styleType = config.styleType || '-';
    return config.showType.replace(/\-/g, styleType);
  } else {
    return 'yyyy-MM-dd HH:mm';
  }
}
</script>
<style lang="less" scoped>
.readonly-container {
  position: relative;
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0;
  }
}
.component-tips {
  text-align: left;
  font-size: 90%;
  opacity: 0.6;
  word-break: break-all;
  display: block;
  &:before {
    margin-right: 3px;
  }
}
</style>
