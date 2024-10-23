<template>
  <TsFormDatePicker
    ref="formitem"
    :value="actualValue"
    :readonly="readonly"
    :disabled="disabled"
    :type="getType"
    :format="getFormat"
    :validateList="getValidateList"
    :time-picker-options="timePickerOptions"
    :options="option"
    :readonlyTextIsHighlight="readonlyTextIsHighlight"
    border="border"
    transfer
    @on-change=" val => {
      setValue(val);
    }"
  ></TsFormDatePicker>
</template>
<script>
import base from './base.vue';
import validmixin from './common/validate-mixin.js';
import TsFormDatePicker from '@/resources/plugins/TsForm/TsFormDatePicker';
export default {
  name: '',
  components: {
    TsFormDatePicker
  },
  extends: base,
  mixins: [validmixin],
  props: {
    readonly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
      timePickerOptions: {
        disabledHours: [],
        disabledMinutes: []
      },
      unitList: ['minute', 'hour', 'day', 'month', 'year']
    };
  },
  beforeCreate() {},
  created() {
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
    async validData(validConifg) {
      const errorList = [];
      let isVaild = true;
      if (!this.$refs.formitem.valid()) {
        errorList.push({uuid: this.formItem.uuid, error: this.$refs.formitem.validMesage});
      }
      if (this.formItem.config.validType && this.formItem.config.validType.indexOf('workdate') >= 0 && this.actualValue) {
        //校验工作时间
        isVaild = await this.validWorkDate(validConifg);
        if (!isVaild) {
          errorList.push({uuid: this.formItem.uuid, error: this.$refs.formitem.validMesage});
        }
      }
      return errorList;
    },
    async validWorkDate(validConifg) {
      //工作时间的校验，需要服务id或者工单id
      let valid = true;
      if (validConifg && (validConifg.channelUuid || validConifg.processTaskId)) {
        let data = {
          data: this.actualValue,
          attributeUuid: this.formItem.uuid,
          config: {}
        };
        validConifg.processTaskId ? (data.config.processTaskId = validConifg.processTaskId) : (data.config.channelUuid = validConifg.channelUuid);
        let res = await this.$api.framework.form.validFormDate(data);
        if (res.Status == 'OK' && res.Return && res.Return.result) {
          this.$children[0].validMesage = '';
        } else {
          valid = false;
          this.$children[0].validMesage = this.$t('term.framework.datenotworktime');
        }
      }
      return valid;
    },
    validConfig() {
      const errorList = this.validDataForAllItem();
      if (!this.$utils.isEmpty(this.config.validType) && !this.$utils.isEmpty(this.config.validValueList)) {
        for (let i = 0; i < this.config.validValueList.length; i++) {
          if (!this.config.validValueList[i].text || this.$utils.isEmpty(this.config.validValueList[i].value) || !this.config.validValueList[i].filter) {
            errorList.push({ field: 'validValueList', error: this.$t('message.completerequired', {'target': this.$t('term.framework.cusvalid')}) });
            break;
          }
        }
      } 
      return errorList;
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
      let disabledHours = ''; // 禁用小时
      let disabledMinutes = ''; // 禁用分钟
      if (currentValue > calculateValue) {
        this.timePickerOptions.disabledHours = [];
        this.timePickerOptions.disabledMinutes = [];
      } else if (currentValue <= calculateValue) {
        if (this.unitList.includes(unit)) {
          disabledHours = new Date(calculateValue).getHours();
          disabledMinutes = new Date(calculateValue).getMinutes();
          this.timePickerOptions.disabledHours = [];
          if (disabledHours && disabledHours != 'NAN') {
            for (let i = 1; i < disabledHours; i++) {
              this.timePickerOptions.disabledHours.push(i);
            }
          }
          if (disabledMinutes && disabledMinutes != 'NAN') {
            for (let i = 1; i < disabledMinutes; i++) {
              this.timePickerOptions.disabledMinutes.push(i);
            }
          }
        }
      }
    },
    handleLaterAndEqual(unit, minDate, num) {
      // 处理大于等于规则时，处理置灰时间边界
      let date = new Date(this.$utils.deepClone(minDate));
      if (unit == 'minute') {
        // 分钟
        date.setDate(date.getDate() - 1); // -1表示禁用日期的前一天可选，即禁用日期的前一天可选
        date.setMinutes(date.getMinutes() + num);
        minDate = new Date(date).getTime();
      } else if (unit == 'hour') {
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
      let currentYMD = this.handleDate(currentValue); // 当前值
      let calculateYMD = this.handleDate(calculateValue); // 计算后值
      let disabledHours = '';
      let disabledMinutes = '';
      if (currentYMD == calculateYMD) {
        if (this.unitList.includes(unit)) {
          let currentHour = new Date(currentValue).getHours();
          disabledHours = new Date(calculateValue).getHours();
          disabledMinutes = new Date(calculateValue).getMinutes();
          let disabledHoursOne = disabledHours + 1; // 不禁用边界值
          let disabledMinutesOne = disabledMinutes + 1; // 不禁用边界值
          this.timePickerOptions.disabledHours = [];
          if (disabledHours && disabledHours != 'NAN') {
            for (let i = disabledHoursOne; i <= 23; i++) {
              this.timePickerOptions.disabledHours.push(i);
            }
          }
          if (disabledMinutes && disabledMinutes != 'NAN' && currentHour >= disabledHours) {
            for (let i = disabledMinutesOne; i <= 59; i++) {
              this.timePickerOptions.disabledMinutes.push(i);
            }
          } else {
            this.timePickerOptions.disabledMinutes = [];
          }
        }
      } else {
        this.timePickerOptions.disabledHours = [];
        this.timePickerOptions.disabledMinutes = [];
      }
    },
    handleEarlierAndEqual(unit, maxDate, num) {
      // 处理小于等于规则时，置灰日期边界
      let date = new Date(this.$utils.deepClone(maxDate));
      if (unit == 'minute') {
        // 分钟
        date.setMinutes(date.getMinutes() + num);
        maxDate = new Date(date).getTime();
      } else if (unit == 'hour') {
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
    },
    getDate(unit = null, value = 0, timstamp = null) { //根据单位跟数量计算需要的时间差（ms）
      let returnDate;
      let format = this.config.format || '';
      let styleType = this.config.styleType; 
      returnDate = this.$utils.getDateByFormat(this.$utils.calculateDate(unit, value, timstamp), format, styleType);
      // 修复工单中心传递yyyy|MM|dd 的格式给后端，正常的应该是yyyyMMdd 
      return returnDate && returnDate.replace(/\|/g, '');
    },
    getDateValue(value) {
      let arr = value && value.split('_') || [];
      let newdate = this.$utils.getDateByFormat(new Date(), this.config.format);
      if (arr[0] == 'less-than' || arr[0] == 'greater-than' && !this.$utils.isEmpty(arr[1])) {
        newdate = this.getDate(arr[2], arr[0] == 'less-than' ? Number(-arr[1]) : Number(arr[1]));
        return newdate;
      } else if (arr[0] == 'others' && arr[1]) {
        return arr[1];
      } else if (arr[0] == 'equal') {
        return newdate;
      } else {
        return value;
      }
    }
  },
  filter: {},
  computed: {
    actualValue() {
      if (this.value) {
        if (this.value instanceof Array && this.value.length > 0) {
          return this.value[0];
        } else if (typeof this.value == 'string') {
          let arr = this.value.split('_') || [];
          let newdate = this.$utils.getDateByFormat(new Date(), this.config.format);
          if (arr[0] == 'less-than' || arr[0] == 'greater-than' && !this.$utils.isEmpty(arr[1])) {
            newdate = this.getDate(arr[2], arr[0] == 'less-than' ? Number(-arr[1]) : Number(arr[1]));
            this.setValue(newdate);
            return newdate;
          } else if (arr[0] == 'others') {
            if (arr[1]) {
              this.setValue(arr[1]);
              return arr[1];
            } else {
              this.setValue('');
              return null;
            }
          } else if (arr[0] == 'equal') {
            this.setValue(newdate);
            return newdate;
          } else {
            return this.value;
          }
        } else {
          return this.value;
        }
      }
      return null;
    },
    getFormat() {
      if (this.config) {
        let styleType = this.config.styleType || '-';
        return this.config.format.replace(/\-/g, styleType);
      } else {
        return 'yyyy-MM-dd HH:mm';
      }
    },
    getType() {
      if (this.config.format && this.config.format.indexOf(' HH') >= 0) {
        return 'datetime';
      } else {
        let type = 'datetime';
        if (this.config && this.config.format) {
          this.config.format == 'yyyy' && (type = 'year');
          this.config.format == 'yyyy-MM' && (type = 'month');
          this.config.format == 'yyyy-MM-dd' && (type = 'date');
        }
        return type;
      }
    },
    getValidateList() {
      let validateList = this.validateList;
      let dateText = {
        later: this.$t('term.framework.later'),
        earlier: this.$t('term.framework.earlier'),
        laterAndEqual: this.$t('term.framework.laterandequal'),
        earlierAndEqual: this.$t('term.framework.earlierandequal')
      };
      let unitText = {
        minute: this.$t('page.minute'),
        hour: this.$t('page.hour'),
        day: this.$t('page.day'),
        month: this.$t('page.month'),
        year: this.$t('page.year')
      };
      //自定义校验
      if (this.config.validType && this.config.validType.indexOf('custom') >= 0 && !this.$utils.isEmpty(this.config.validValueList)) {
        this.config.validValueList.forEach(item => {
          //text  filter value
          if (!item.filter || !item.text) {
            //为空校验
            return;
          } else if (item.filter == 'custom' && item.value) {
            //需要进行比较组件类型：自定义
            validateList.push({
              name: 'tomore',
              trigger: 'change',
              message: this.$t('term.framework.dateneed') + (dateText[item.text]) + item.value,
              validator: (rule, value) => {
                let currentValue = new Date(this.$utils.handleInvalidDate(value, this.config.format, this.config.styleType)).getTime();
                let calculateValue = new Date(this.$utils.handleInvalidDate(item.value, this.config.format, this.config.styleType)).getTime();
                if (value == '') {
                  return true;
                } else if (item.text == 'later') {
                  return currentValue > calculateValue;
                } else if (item.text == 'earlier') {
                  return currentValue < calculateValue;
                } else if (item.text == 'laterAndEqual') {
                  this.handleLaterAndEqualDisableDate(currentValue, calculateValue, item.unit);
                  return currentValue >= calculateValue;
                } else if (item.text == 'earlierAndEqual') {
                  this.handleEarlierAndEqualDisableDate(currentValue, calculateValue, item.unit);
                  return currentValue <= calculateValue;
                }
                return true;
              }
            });
          } else if (item.filter == 'nowDay') {
            //需要进行比较组件类型：填写时间
            validateList.push({
              name: 'tomore',
              trigger: 'change',
              message: this.$t('term.framework.dateneed') + (dateText[item.text]) + this.$t('term.framework.currdate') + item.value + unitText[item.unit],
              validator: (rule, value) => {
                let currentValue = this.$utils.handleInvalidDate(value, this.config.format || '', this.config.styleType);
                if (typeof currentValue === 'object') {
                  currentValue = this.$utils.getDateByFormat(new Date(currentValue), this.config.format);
                }  
                currentValue = new Date(currentValue).getTime();
                let calculateValue = new Date(this.$utils.timestampCalculation(item.unit, item.value || 0, null, this.config.format || '', this.config.styleType)).getTime();
                if (value == '') {
                  return true;
                } else if (item.text == 'later') {
                  return currentValue > calculateValue;
                } else if (item.text == 'earlier') {
                  return currentValue < calculateValue;
                } else if (item.text == 'laterAndEqual') {
                  this.handleLaterAndEqualDisableDate(currentValue, calculateValue, item.unit);
                  return currentValue >= calculateValue;
                } else if (item.text == 'earlierAndEqual') {
                  this.handleEarlierAndEqualDisableDate(currentValue, calculateValue, item.unit);
                  return currentValue <= calculateValue;
                }
                return true;
              }
            });
          } else {
            // 表单同类型组件，例如日期组件
            if (this.formItemList) {
              for (let i = 0; i < this.formItemList.length; i++) {
                if (this.formItemList[i].uuid == item.filter) {
                  let component = this.formItemList[i];
                  let formValue = this.formData[item.filter];
                  validateList.push({
                    name: 'tomore',
                    trigger: 'change',
                    message: this.$t('term.framework.dateneed') + (dateText[item.text]) + component.label + item.value + unitText[item.unit],
                    validator: (rule, value) => {
                      let configValue = formValue || component.config.valueQuote; // 解决自定义规则，没有校验的问题
                      configValue = this.getDateValue(configValue);
                      let currentValue = new Date(this.$utils.handleInvalidDate(value, this.config.format || '', this.config.styleType)).getTime();
                      let calculateValue = new Date(this.$utils.timestampCalculation(item.unit, item.value || 0, configValue, this.config.format || '', this.config.styleType)).getTime();
                      if (value == '' || !configValue) {
                        return true;
                      } else if (item.text == 'laterAndEqual') {
                        this.handleLaterAndEqualDisableDate(currentValue, calculateValue, item.unit);
                        return currentValue >= calculateValue;
                      } else if (item.text == 'earlierAndEqual') {
                        this.handleEarlierAndEqualDisableDate(currentValue, calculateValue, item.unit);
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
          }
        });
      }
      return validateList;
    },
    option() {
      // 晚于的最大日期取里面最大的，早于的最小日期取里面最小的
      let _this = this;
      let config = this.config;
      let minDate = '';//早于，可选择区间里最小的日期
      let maxDate = '';//晚于，可选择区间里最大的日期
      let unit = '';
      if (config.validType && config.validType.indexOf('custom') >= 0 && config.validValueList && config.validValueList.length > 0) {
        config.validValueList.forEach(item => {
          unit = item.text;
          if (item.filter == 'custom' && item.value) {
            //自定义
            if (item.text == 'later' || item.text == 'laterAndEqual') {
              minDate = minDate ? Math.min(new Date(minDate).getTime(), new Date(this.$utils.handleInvalidDate(item.value, this.config.format || '', config.styleType)).getTime()) : new Date(this.$utils.handleInvalidDate(item.value, config.format || '', config.styleType)).getTime();
              if (item.text == 'laterAndEqual') {
                // 处理禁用日期边界
                minDate = _this.handleLaterAndEqual(item.unit, minDate, 0);
              }
            } else if (item.text == 'earlier' || item.text == 'earlierAndEqual') {
              maxDate = maxDate ? Math.max(new Date(maxDate).getTime(), new Date(this.$utils.handleInvalidDate(item.value, this.config.format || '', config.styleType)).getTime()) : new Date(this.$utils.handleInvalidDate(item.value, config.format || '', config.styleType)).getTime();
              if (item.text == 'earlierAndEqual') {
                // 处理禁用日期边界
                maxDate = _this.handleEarlierAndEqual(item.unit, maxDate, 1);
              }
            }
          } else if (item.filter == 'nowDay') {
            //当前时间
            if (item.text == 'later' || item.text == 'laterAndEqual') {
              let newValue = _this.$utils.timestampCalculation(item.unit, item.value || 0, null, this.config.format || '', this.config.styleType);
              minDate = minDate ? Math.min(new Date(minDate).getTime(), new Date(newValue).getTime()) : new Date(newValue).getTime();
              if (item.text == 'laterAndEqual') {
                // 处理禁用日期边界
                minDate = _this.handleLaterAndEqual(item.unit, minDate, item.value);
              }
            } else if (item.text == 'earlier' || item.text == 'earlierAndEqual') {
              let newValue = _this.$utils.timestampCalculation(item.unit, item.value || 0, null, this.config.format || '', this.config.styleType);
              maxDate = maxDate ? Math.max(new Date(maxDate).getTime(), new Date(newValue).getTime()) : new Date(newValue).getTime();
              if (item.text == 'earlierAndEqual') {
                // 处理禁用日期边界
                maxDate = _this.handleEarlierAndEqual(item.unit, maxDate, item.value);
              }
            }
          } else {
            //表单相同组件
            let comparedValue = '';
            if (this.formItemList && this.formItemList.length > 0) {
              this.formItemList.forEach(c => {
                if (c.uuid == item.filter) {
                  comparedValue = c.config.value;
                }
              });
            }
            if (comparedValue) {
              if (item.text == 'later' || item.text == 'laterAndEqual') {
                // 大于等于某个时间段
                let newValue = _this.$utils.timestampCalculation(item.unit, item.value || 0, comparedValue, this.config.format || '', this.config.styleType);
                minDate = minDate ? Math.min(new Date(minDate).getTime(), new Date(newValue).getTime()) : new Date(newValue).getTime();
                if (item.text == 'laterAndEqual') {
                  // 处理禁用日期边界
                  minDate = _this.handleLaterAndEqual(item.unit, minDate, item.value);
                }
              } else if (item.text == 'earlier' || item.text == 'earlierAndEqual') {
                let newValue = _this.$utils.timestampCalculation(item.unit, ((item.value > 0 ? -(item.value) : item.value) || 0), comparedValue, this.config.format || '', this.config.styleType);
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
          // 处理禁用日期边界, -86400000 为一天的毫秒数，表示不禁用当天
          let curTime = new Date();
          new Date(date.setHours(curTime.getHours()));
          new Date(date.setMinutes(curTime.getMinutes()));
          if (unit == 'later' || unit == 'earlier') {
            // 大于或者小于的时候，需要减去一天的毫秒数，否则会禁用当天
            return date && ((maxDate && date.valueOf() - 86400000 >= maxDate) || (minDate && date.valueOf() <= minDate - 86400000));
          } else {
            return date && ((maxDate && date.valueOf() > maxDate) || (minDate && date.valueOf() < minDate));
          }
        }  
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped></style>
