<template>
  <div class="report-param-wrap">
    <div v-if="myParamList && myParamList.length > 0" class="tstable-container">
      <table class="tstable-body">
        <colgroup>
          <col style="width: 40px;">
          <col style="width: calc(15% - 10px);">
          <col style="width: calc(15% - 10px);">
          <col style="width: 40%;">
          <col style="width: calc(15% - 10px);">
          <col style="width: 5%;">
          <col style="width: calc(10% - 10px);">
        </colgroup>
        <thead>
          <tr>
            <th class="param-drag-column"></th>
            <th>{{ $t('page.name') }}</th>
            <th>{{ $t('page.tag') }}</th>
            <th>{{ $t('term.report.control') }}</th>
            <th>{{ $t('page.width') }}</th>
            <th>{{ $t('page.isrequired') }}</th>
            <th class="text-right">
              <a href="javascript:void(0)" @click="addParam">
                <i class="tsfont-plus-o" style="font-size: 13px;"></i>
              </a>
            </th>
          </tr>
        </thead>
        <Draggable
          tag="tbody"
          :list="myParamList"
          handle=".param-drag-handle"
          :animation="200"
          ghost-class="param-row-ghost"
          chosen-class="param-row-chosen"
          drag-class="param-row-drag"
        >
          <tr v-for="(param,index) in myParamList" :key="getParamKey(param)">
            <td class="param-drag-column">
              <span class="param-drag-handle tsfont-drag" :title="$t('page.sort')"></span>
            </td>
            <td><TsFormInput v-model="param.name" border="border" :validateList="['required']"></TsFormInput></td>
            <td>
              <TsFormInput v-model="param.label" border="border" :validateList="['required']"></TsFormInput></td>
            <td>
              <div :class="[param.type == 'formdaterange' || param.type == 'formdate' ? 'flex-start': '']">
                <TsFormSelect
                  v-model="param.type"
                  :transfer="true"
                  :dataList="controllerTypeList"
                  :validateList="['required']"
                  border="border"
                ></TsFormSelect>
                <TsFormSelect
                  v-if="param.type == 'formdaterange'"
                  v-model="param.config.tsFormDatePickerType"
                  :transfer="true"
                  :dataList="param.config.datePickerTypeList"
                  :validateList="['required']"
                  :class="[param.type == 'formdaterange' ? 'date-form-margin' : '']"
                  border="border"
                  @on-change="handleDateFormatType(param.config.tsFormDatePickerType, param)"
                ></TsFormSelect>
                <TsFormSelect
                  v-if="param.type == 'formdaterange'"
                  v-model="param.config.tsFormDatePickerFormat"
                  :transfer="true"
                  :dataList="param.config.dateFormatList"
                  :validateList="['required']"
                  :class="[param.type == 'formdaterange' ? 'date-form-margin' : '']"
                  border="border"
                ></TsFormSelect>
                <TsFormSelect
                  v-if="param.type == 'formdate'"
                  v-model="param.config.tsFormDateFormat"
                  :transfer="true"
                  :dataList="yearMonthDayFormatList"
                  :validateList="['required']"
                  :class="[param.type == 'formdate' ? 'formdate-form-margin' : '']"
                  border="border"
                ></TsFormSelect>
              </div>
            </td>
            <td>
              <TsFormSelect
                v-model="param.width"
                :transfer="true"
                :dataList="widthTypeList"
                :validateList="['required']"
                border="border"
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
                <i class="tsfont-setting"></i>
              </a>
              <a class="pl-xs" href="javascript:void(0)" @click="delParam(index)">
                <i class="tsfont-minus-o"></i>
              </a>
            </td>
          </tr>
        </Draggable>
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
        <component
          :is="currentParam.type + 'config'"
          ref="paramComponent"
          :paramList="myParamList"
          :rowData="currentParam"
          :config="currentParam.config"
        ></component>
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
import Draggable from 'vuedraggable';
import * as configs from './paramconfig';
const paramKeys = new WeakMap();
let nextParamKey = 0;
export default {
  name: '',
  components: {
    Draggable,
    TsFormInput,
    TsFormSelect,
    ...configs,
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
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
        width: 'medium'
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
    getParamKey(param) {
      if (!paramKeys.has(param)) {
        paramKeys.set(param, ++nextParamKey);
      }
      return paramKeys.get(param);
    },
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
    setConfig(config) {
      const paramComponent = this.$refs['paramComponent'];
      if (paramComponent && paramComponent.valid && !paramComponent.valid()) {
        return false;
      }
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
  .tstable-body {
    width: 100%;
    table-layout: fixed;
    > thead > tr > th,
    > tbody > tr > td {
      vertical-align: middle;
      &.param-drag-column {
        padding-left: 8px;
        padding-right: 8px;
        text-align: center;
      }
    }
  }
  .param-drag-handle {
    display: inline-block;
    cursor: grab;
    user-select: none;
    &:hover {
      color: var(--primary-color);
    }
    &:active {
      cursor: grabbing;
    }
  }
  .param-row-chosen > td {
    background-color: var(--primary-hover-color, rgba(45, 140, 240, 0.08));
  }
  .param-row-ghost {
    opacity: 0.4;
    > td {
      background-color: var(--primary-hover-color, rgba(45, 140, 240, 0.08));
      box-shadow: inset 0 1px var(--primary-color, #2d8cf0), inset 0 -1px var(--primary-color, #2d8cf0);
    }
  }
  .param-row-drag {
    opacity: 0.9;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
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
