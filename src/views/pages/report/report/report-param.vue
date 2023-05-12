<template>
  <div class="report-param-wrap">
    <div v-if="myParamList && myParamList.length > 0" class="tstable-container">
      <table class="tstable-body">
        <thead>
          <tr>
            <th style="width:15%">{{ $t('page.name') }}</th>
            <th style="width:15%">{{ $t('page.tag') }}</th>
            <th style="width:40%">{{ $t('term.report.control') }}</th>
            <th style="width:15%">{{ $t('page.width') }}</th>
            <th style="width: 5%">{{ $t('page.isrequired') }}</th>
            <th style="width:10%;" class="text-right">
              <a href="javascript:void(0)" @click="addParam">
                <i class="tsfont-plus-o" style="font-size: 13px;"></i>
              </a>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(param,index) in myParamList" :key="index">
            <td><TsFormInput v-model="param.name" :validateList="['required']"></TsFormInput></td>
            <td>
              <TsFormInput v-model="param.label" :validateList="['required']"></TsFormInput></td>
            <td>
              <div :class="[param.type == 'formdaterange' || param.type == 'formdate' ? 'flex-start': '']">
                <TsFormSelect
                  v-model="param.type"
                  :transfer="true"
                  :dataList="controllerTypeList"
                  :validateList="['required']"
                ></TsFormSelect>
                <TsFormSelect
                  v-if="param.type == 'formdaterange'"
                  v-model="param.config.tsFormDatePickerType"
                  :transfer="true"
                  :dataList="param.config.datePickerTypeList"
                  :validateList="['required']"
                  :class="[param.type == 'formdaterange' ? 'date-form-margin' : '']"
                  @on-change="handleDateFormatType(param.config.tsFormDatePickerType, param)"
                ></TsFormSelect>
                <TsFormSelect
                  v-if="param.type == 'formdaterange'"
                  v-model="param.config.tsFormDatePickerFormat"
                  :transfer="true"
                  :dataList="param.config.dateFormatList"
                  :validateList="['required']"
                  :class="[param.type == 'formdaterange' ? 'date-form-margin' : '']"
                ></TsFormSelect>
                <TsFormSelect
                  v-if="param.type == 'formdate'"
                  v-model="param.config.tsFormDateFormat"
                  :transfer="true"
                  :dataList="yearMonthDayFormatList"
                  :validateList="['required']"
                  :class="[param.type == 'formdate' ? 'formdate-form-margin' : '']"
                ></TsFormSelect>
              </div>
            </td>
            <td>
              <TsFormSelect
                v-model="param.width"
                :transfer="true"
                :dataList="widthTypeList"
                :validateList="['required']"
              ></TsFormSelect>
            </td>
            <td>
              <TsFormSwitch
                v-model="param.config.isRequired"
                :true-value="1"
                :false-value="0"
              >
              </TsFormSwitch>
            </td>
            <td class="text-right">
              <a v-if="param.type" href="javascript:void(0)" @click="configParam(param)">
                <i class="ts-setting"></i>
              </a>
              <a class="pl-xs" href="javascript:void(0)" @click="delParam(index)">
                <i class="tsfont-minus-o"></i>
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <a
      v-if="!myParamList || myParamList.length == 0"
      href="javascript:void(0)"
      class="text-action tsfont-plus"
      @click="addParam"
    >{{ $t('page.param') }}</a>
    <TsDialog :is-show="isShow" v-bind="paramDialogConfig" @on-close="close">
      <template v-slot:header>
        <div>{{ $t('term.report.paramconfig') }}</div>
      </template>
      <template v-slot>
        <component :is="currentParam.type+'config'" ref="paramComponent" :config="currentParam.config"></component>
      </template>
      <template v-slot:footer>
        <Button @click="close">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="setConfig">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import * as configs from './paramconfig';
export default {
  name: '',
  components: {
    TsFormInput, 
    TsFormSelect,
    ...configs,
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve)
  },
  props: {
    paramList: {
      type: Array,
      default: function() {
        return [];
      }
    }
  },
  data() {
    let _this = this;
    return {
      myParamList: [],
      controllerTypeList: [
        {value: 'forminput', text: this.$t('page.input'), hasconfig: false},
        {value: 'formselect', text: this.$t('page.select'), hasconfig: true},
        {value: 'formselects', text: this.$t('page.multiselect'), hasconfig: true},
        {value: 'formcheckbox', text: this.$t('page.checkbox'), hasconfig: true},
        {value: 'formradio', text: this.$t('page.radio'), hasconfig: true},
        {value: 'formdaterange', text: this.$t('page.timerange'), hasconfig: false},
        {value: 'formdate', text: this.$t('page.date'), hasconfig: false}
      ],
      widthTypeList: [
        {value: 24, text: '100%'},
        {value: 12, text: '50%'},
        {value: 8, text: '30%'}
      ],
      datePickerTypeList: [
        // 显示格式
        {
          text: this.$t('page.datetimerangetext'),
          value: 'datetimerange'
        },
        {
          text: this.$t('page.daterangetext'),
          value: 'daterange'
        }
      ],
      yearMonthDayHourFormatList: [
        // 样式格式
        {
          text: 'yyyy-MM-dd HH:mm',
          value: 'yyyy-MM-dd HH:mm'
        },
        {
          text: ' yyyy/MM/dd HH:mm',
          value: ' yyyy/MM/dd HH:mm'
        },
        {
          text: 'yyyyMMdd HH:mm',
          value: 'yyyy|MM|dd HH:mm'
        }
      ],
      yearMonthDayFormatList: [
        // 样式格式
        {
          text: 'yyyy-MM-dd',
          value: 'yyyy-MM-dd'
        },
        {
          text: ' yyyy/MM/dd',
          value: ' yyyy/MM/dd'
        },
        {
          text: 'yyyyMMdd',
          value: 'yyyy|MM|dd'
        }
      ],
      currentParam: {},
      isShow: false,
      paramDialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: false,
        width: 'small'
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    addParam: function() {
      let _this = this;
      this.myParamList.push(
        {
          name: '', 
          label: '', 
          type: '', 
          config: {
            isRequired: 0, 
            tsFormDatePickerType: '', 
            tsFormDatePickerFormat: '', 
            tsFormDateFormat: '',
            datePickerTypeList: _this.datePickerTypeList,
            dateFormatList: []
          }
        }
      );
    },
    delParam: function(index) {
      this.myParamList.splice(index, 1);
    },
    setConfig: function(config) {
      this.paramList.forEach(element => {
        if (element.name == this.currentParam.name) {
          element.config = {...element.config, ...this.$refs['paramComponent'].setConfig()};
        }
      });

      this.close();
    },
    configParam: function(param) {
      this.currentParam = param;
      this.isShow = true;
    },
    close: function() {
      this.isShow = false;
      this.currentParam = {};
    },
    handleDateFormatType(formatType, params) {
      // 处理时间格式联动
      let formatTypeObj = {
        'datetimerange': this.yearMonthDayHourFormatList,
        'daterange': this.yearMonthDayFormatList
      };
      this.$set(params.config, 'dateFormatList', formatTypeObj[formatType]);
    }
  },
  filter: {},
  computed: {},
  watch: {
    paramList: {
      handler: function(val) {
        if (val) {
          this.myParamList = val;
          this.myParamList.forEach((item) => {
            if (item.config && !item.config.hasOwnProperty('tsFormDatePickerType')) {
              item.config.tsFormDatePickerType = '';
              item.config.datePickerTypeList = this.datePickerTypeList;
              item.config.dateFormatList = [];
            }
            if (!item.config.hasOwnProperty('tsFormDatePickerFormat')) {
              item.config.tsFormDatePickerFormat = '';
              item.config.datePickerTypeList = this.datePickerTypeList;
              item.config.dateFormatList = this.dateFormatList;
            }
            if (!item.config.hasOwnProperty('tsFormDateFormat')) {
              item.config.tsFormDateFormat = '';
            }
          });
        }
      },
      deep: true,
      immediate: true
    },
    myParamList: {
      handler: function(val) {
        this.$emit('setParam', val);
      }, deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.report-param-wrap {
  .date-form-margin {
    width: 100%;
    margin-left: 10px;
  }
  .formdate-form-margin {
    width: 50%;
    margin-left: 10px;
  }
}
</style>
