<template>
  <div>
    <TsFormItem :label="$t('page.displayformat')" labelPosition="top">
      <div class="padding-sm bg-op radius-sm">
        <TsFormRadio
          :value="config.format"
          :dataList="formatList"
          transfer
          border="border"
          :disabled="disabled"
          @on-change="(val)=>{ changeFormat(val) }"
        ></TsFormRadio>
      </div>
    </TsFormItem>
    <TsFormItem :label="$t('page.css')" labelPosition="top">
      <div class="padding-sm bg-op radius-sm">
        <TsFormRadio
          :value="config.styleType"
          :dataList="getShowTypeList(config.format)"
          :disabled="disabled"
          @on-change="(val)=>{
            setConfig('styleType', val);
          }"
        ></TsFormRadio>
      </div>
    </TsFormItem>
    <!-- 校验 -->
    <TsFormItem :label="$t('page.validate')" labelPosition="top">
      <div class="padding-sm radius-sm" :class="validClass('validValueList')">
        <div class="flex-between" style="display:flex">
          <span>{{ $t('page.weekday') }}</span>
          <Checkbox
            :value="checkValidType('workdate')"
            label="custom"
            :disabled="disabled"
            @on-change="changeValidType(arguments, 'workdate')"
          ></Checkbox>
        </div>
        <div class="flex-between" style="display:flex">
          <div>
            <span>{{ $t('page.custom') }}</span>
            <Poptip
              width="570"
              :transfer="true"
              placement="top"
              trigger="hover"
            >
              <b class="tsfont-info-o text-href"></b>
              <div slot="content">
                <p>{{ $t('term.framework.timevalue') }}</p>
                <ul style="margin: 2px 0px 2px 40px;">
                  <li>{{ $t('term.framework.timevaluedesc') }}</li>
                  <li>{{ $t('term.framework.positiveintegerdesc') }}</li>
                  <li>{{ $t('term.framework.neglectintegerdesc') }}</li>
                </ul>
                <ul>
                  <li>{{ $t('term.framework.writetimedesc') }}</li>
                </ul>
              </div>
            </Poptip>
          </div>
          <Checkbox
            :value="checkValidType('custom')"
            label="custom"
            :disabled="disabled"
            @on-change="changeValidType(arguments, 'custom')"
          ></Checkbox>
        </div>
        <!-- 自定义校验 -->
        <div v-if="checkValidType('custom')">
          <TsRow
            v-for="(valid, vindex) in config.validValueList"
            :key="vindex"
            :gutter="8"
            class="filter-row"
          >
            <Col span="6">
              <TsFormSelect
                ref="validText"
                v-model="valid.text"
                :dataList="filterDataList"
                :validateList="validateList"
                border="bottom"
                :disabled="disabled"
              ></TsFormSelect>
            </Col>
            <Col span="7">
              <TsFormSelect
                ref="validFilter"
                v-model="valid.filter"
                :search="true"
                :dataList="getFilterData()"
                :validateList="validateList"
                border="bottom"
                :disabled="disabled"
                @on-change="()=>changeFilter(valid.filter,vindex)"
              >
              </TsFormSelect>
            </Col>
            <Col span="11">
              <TsRow v-if="valid.filter!=='custom'" :gutter="8">
                <Col span="10">
                  <TsFormInput
                    ref="validValue"
                    v-model="valid.value"
                    type="number"
                    :validateList="numberValid"
                    :min="-Infinity"
                    border="bottom"
                    :disabled="disabled"
                  />
                </Col>
                <Col span="14">
                  <TsFormSelect
                    ref="validFilter"
                    v-model="valid.unit"
                    :dataList="handleNowOpt(config.format)"
                    :validataList="numValid"
                    border="bottom"
                    :clearable="false"
                    :disabled="disabled"
                  ></TsFormSelect>
                </Col>
              </TsRow>
              <TsFormDatePicker
                v-else-if="valid.filter=='custom'"
                ref="validValue"
                v-model="valid.value"
                value-type="format"
                :format="getFormat"
                :type="getType"
                :validateList="validateList"
                width="100%"
                transfer
                border="bottom"
                :disabled="disabled"
              ></TsFormDatePicker>
            </Col>
            <i
              v-if="!disabled"
              class="tsfont-close-o valid-remove text-tip-active"
              :title="$t('page.delete')"
              @click="removeFilter(vindex)"
            ></i>
          </TsRow>
          <span v-if="!disabled" class="tsfont-plus text-href" @click="addFilter">{{ $t('page.rule') }}</span>
        </div>
      </div>
    </TsFormItem>

    <TsFormItem :label="$t('page.inputtip')" labelPosition="top">
      <TsFormInput
        :value="config.placeholder"
        :maxlength="50"
        :disabled="disabled"
        @on-change="val => {
          setConfig('placeholder', val);
        }"
      ></TsFormInput>
    </TsFormItem>
    <!-- 默认值 -->
    <TsFormItem :label="$t('page.defaultvalue')" labelPosition="top">
      <div class="bg-op padding-sm radius-sm">
        <div>{{ $t('page.custom') }}</div>
        <!-- 自定义组件 -->
        <div class="pt-sm">
          <TsRow :gutter="8">
            <Col :span="nowExpression=='equal' ?24:12">
              <TsFormSelect
                v-model="nowExpression"
                :validateList="validateList"
                :dataList="nowList"
                :clearable="false"
                transfer
                :disabled="disabled"
                @on-change="()=>{

                  changeDefaultValue()
                }"
              ></TsFormSelect>
            </Col>
            <Col v-if="nowExpression=='others'" span="12">
              <TsFormDatePicker
                v-model="defaultValue"
                value-type="format"
                :type="getType"
                :format="getFormat"
                transfer
                :disabled="disabled"
                @on-change="changeDefaultValue()"
              ></TsFormDatePicker>
            </Col>
            <template v-if="nowExpression=='less-than' || nowExpression=='greater-than'">
              <Col span="7">
                <TsFormInput
                  v-model="nowValue"
                  :validateList="numValid"
                  type="number"
                  :disabled="disabled"
                  @on-change="changeDefaultValue()"
                ></TsFormInput>
              </Col>
              <Col span="5">
                <TsFormSelect
                  v-model="nowUnit"
                  :validateList="validateList"
                  :dataList="handleNowOpt(config.format)"
                  :clearable="false"
                  transfer
                  :disabled="disabled"
                  @on-change="changeDefaultValue()"
                ></TsFormSelect>
              </Col>
            </template>
          </TsRow>
        </div>
      </div>
    </TsFormItem>
  </div>
</template>
<script>
import base from './base-config.vue';

export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormDatePicker: () => import('@/resources/plugins/TsForm/TsFormDatePicker'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  extends: base,
  props: {},
  data() {
    return {
      formatList: [
        { value: 'yyyy-MM-dd HH:mm', text: this.$t('page.year') + '-' + this.$t('page.month') + '-' + this.$t('page.da') + ' ' + this.$t('page.hou') + ':' + this.$t('page.minu') },
        { value: 'yyyy-MM-dd', text: this.$t('page.year') + '-' + this.$t('page.month') + '-' + this.$t('page.da') },
        { value: 'yyyy-MM', text: this.$t('page.year') + '-' + this.$t('page.month') },
        { value: 'yyyy', text: this.$t('page.year') }
      ],
      filterDataList: [
        { text: this.$t('term.framework.later'), value: 'later' },
        { text: this.$t('term.framework.earlier'), value: 'earlier' },
        { text: this.$t('term.framework.laterandequal'), value: 'laterAndEqual' },
        { text: this.$t('term.framework.earlierandequal'), value: 'earlierAndEqual' }
      ],
      validateList: ['required'],
      numberValid: ['integer'],
      numValid: ['required', 'integer_p'],
      nowOpt: [
        {text: this.$t('page.minute'), value: 'minute'},
        {text: this.$t('page.hour'), value: 'hour'},
        {text: this.$t('page.day'), value: 'day'},
        {text: this.$t('page.month'), value: 'month'},
        {text: this.$t('page.year'), value: 'year'}
      ],
      nowList: [
        { text: this.$t('term.framework.equal'), value: 'equal'},
        { text: this.$t('term.framework.lessthan'), value: 'less-than' },
        { text: this.$t('term.framework.greaterthan'), value: 'greater-than' },
        { text: this.$t('term.framework.othersdate'), value: 'others' }
      ],
      nowExpression: 'others',
      defaultValue: null,
      nowValue: 1,
      nowUnit: 'day'
    };
  },
  beforeCreate() {},
  created() {
    if (this.config.defaultValue) {
      let arr = this.config.defaultValue.split('_');
      this.nowExpression = arr[0];
      if (arr[0] == 'less-than' || arr[0] == 'greater-than') {
        arr[1] && (this.nowValue = parseInt(arr[1]));
        arr[2] && (this.nowUnit = arr[2]);
      } else if (arr[0] == 'others') {
        arr[1] && (this.defaultValue = arr[1]);
      }
    }
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
    changeValidType(arg, type) {
      let validType = this.config.validType || [];
      if (arg[0]) {
        //选中
        validType.push(type);
      } else {
        //取消选中
        let index = validType.indexOf(type);
        validType.splice(index, 1);
        type == 'custom' && this.setConfig('validValueList', []);
      }
      this.setConfig('validType', validType);
    },
    removeFilter(index) {
      this.config.validValueList.splice(index, 1);
    },
    addFilter() {
      if (!this.config.validValueList) {
        this.$set(this.config, 'validValueList', []);
      }
      this.config.validValueList.push({ text: '', value: '', filter: '', unit: 'day'});
    },
    changeFormat(val) {
      this.setConfig('format', val);
      if (val == 'yyyy-MM') {
        this.nowUnit = 'month';
      } else if (val == 'yyyy') {
        this.nowUnit = 'year';
      } else {
        this.nowUnit = 'day';
      }
      this.changeDefaultValue();
    },
    handleNowOpt(format) {
      // 处理，根据显示格式，联动自定义下拉列表
      let timeTypeList = this.$utils.deepClone(this.nowOpt);
      if (!format || (timeTypeList && timeTypeList.length == 0)) {
        return this.nowOpt;
      }
      if (format.indexOf('HH') >= 0) {
        timeTypeList = this.nowOpt;
      } else if (format.indexOf('dd') >= 0) {
        timeTypeList.splice(0, 1);
      } else if (format.indexOf('MM') >= 0) {
        timeTypeList.splice(0, 2);
      } else if (format.indexOf('yyyy') >= 0) {
        timeTypeList.splice(0, 3);
      }
      return timeTypeList;
    },
    changeFilter(type, index) {
      let filter = this.config.validValueList[index];
      if (type != 'custom') {
        filter.value = 0; // 处理value值类型是number时，props传递值控制台报错问题
      } else {
        filter.value = '';
      }
      filter.unit = 'day';
    },
    changeDefaultValue() {
      let value = '';
      if (this.nowExpression) {
        value = this.nowExpression;
      }
      if (this.defaultValue) {
        value += '_' + this.defaultValue;
      }
      if (this.nowExpression == 'less-than' || this.nowExpression == 'greater-than') {
        if (!this.$utils.isEmpty(this.nowValue)) {
          value += '_' + this.nowValue;
        }
        if (this.nowUnit) {
          value += '_' + this.nowUnit;
        }
      }
      this.setConfig('defaultValue', value);
    },
    clearnowSetting(val) {
      this.defaultValue = null;
      this.nowValue = 0;
      this.nowUnit = '';
    }
  },
  filter: {},
  computed: {
    getShowTypeList() {
      return (format) => {
        let dataList = [];
        if (format == 'yyyy-MM-dd HH:mm') {
          dataList = [
            {
              text: 'yyyy-MM-dd HH:mm',
              value: '-'
            },
            {
              text: 'yyyy/MM/dd HH:mm',
              value: '/'
            },
            {
              text: 'yyyy|MM|dd HH:mm',
              value: '|'
            }
          ];
        } else if (format == 'yyyy-MM-dd') {
          dataList = [
            {
              text: 'yyyy-MM-dd',
              value: '-'
            },
            {
              text: 'yyyy/MM/dd',
              value: '/'
            },
            {
              text: 'yyyy|MM|dd',
              value: '|'
            }
          ];
        } else if (format == 'yyyy-MM') {
          dataList = [
            {
              text: 'yyyy-MM',
              value: '-'
            },
            {
              text: 'yyyy/MM',
              value: '/'
            },
            {
              text: 'yyyy|MM',
              value: '|'
            }
          ];
        } else if (format == 'yyyy') {
          dataList = [
            {
              text: 'yyyy',
              value: ''
            }
          ];
        }
        return dataList;
      };
    },
    checkValidType() {
      return type => {
        return this.config.validType && this.config.validType.indexOf(type) >= 0;
      };
    },
    getFilterData() {
      return () => {
        let filterList = [
          { text: this.$t('page.custom'), value: 'custom' },
          { text: this.$t('term.framework.writetime'), value: 'nowDay' }
        ];
        this.formItemList.forEach((item) => {
          if (item.handler == 'formdate' && item.uuid != this.formItem.uuid) {
            filterList.push({ text: item.label, value: item.uuid });
          }
        });
        return filterList;
      };
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
      let type = 'datetime';
      if (this.config && this.config.format) {
        this.config.format == 'yyyy' && (type = 'year');
        this.config.format == 'yyyy-MM' && (type = 'month');
        this.config.format == 'yyyy-MM-dd' && (type = 'date');
      }
      return type;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
/deep/ .ivu-radio-group {
  width: 100%;
}
/deep/ .ivu-radio-group-item  {
  width: calc(50% - 16px);
}
.filter-row {
  position: relative;
  padding-right: 12px;
  .valid-remove {
    position: absolute;
    right: -8px;
    top: 0;
    display: none;
  }
  &:hover {
    .valid-remove {
      display: block;
    }
  }
}
</style>
