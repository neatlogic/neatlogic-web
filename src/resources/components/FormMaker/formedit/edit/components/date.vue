<template>
  <div>
    <!-- start_必填 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey label-switch">
        必填
        <i-switch v-model="setting.isRequired" class="label-right" />
      </label>
    </div>
    <!-- end_必填 -->
    <!-- start_显示格式 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey">显示格式</label>
      <div class="formsetting-text bg-block">
        <RadioGroup v-model="setting.showType" class="col-2 more" @on-change="changeShowType">
          <Radio label="yyyy-MM-dd HH:mm">年-月-日 时:分</Radio>
          <Radio label="yyyy-MM-dd">年-月-日</Radio>
          <Radio label="yyyy-MM">年-月</Radio>
          <Radio label="yyyy">年</Radio>
        </RadioGroup>
      </div>
    </div>
    <!-- end_显示格式 -->

    <!-- 样式 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey">样式</label>
      <div class="formsetting-text bg-block">
        <!-- 年月日时分 -->
        <RadioGroup v-if="setting.showType == 'yyyy-MM-dd HH:mm'" v-model="setting.styleType" class="col-2 more">
          <Radio label="-">yyyy-MM-dd HH:mm</Radio>
          <Radio label="/">yyyy/MM/dd HH:mm</Radio>
          <Radio label="|">yyyyMMdd HH:mm</Radio> 
        </RadioGroup>
   
        <!-- 年月日 -->
        <RadioGroup v-if="setting.showType == 'yyyy-MM-dd'" v-model="setting.styleType" class="col-2 more">
          <Radio label="-">yyyy-MM-dd</Radio>
          <Radio label="/">yyyy/MM/dd</Radio>
          <Radio label="|">yyyyMMdd</Radio> 
        </RadioGroup>

        <!-- 年月 -->
        <RadioGroup v-if="setting.showType == 'yyyy-MM'" v-model="setting.styleType" class="col-2 more">
          <Radio label="-">yyyy-MM</Radio>
          <Radio label="/">yyyy/MM</Radio>
          <Radio label="|">yyyyMM</Radio> 
        </RadioGroup>

        <!-- 年 -->
        <RadioGroup v-if="setting.showType == 'yyyy'" v-model="setting.styleType" class="col-2 more">
          <Radio label="">yyyy</Radio>
        </RadioGroup>
      </div>
    </div>
    <!-- 校验 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey">校验</label>
      <div class="formsetting-text bg-block">
        <span v-if="showWorkDate" class="formsetting-label label-switch">
          工作日
          <Checkbox
            class="label-right"
            label="workdate"
            :value="checkValidType('workdate')"
            style="top:0px;margin-right: 0;"
            @on-change="changeValidType(arguments, 'workdate')"
          ></Checkbox>
        </span>
        <span class="formsetting-label label-switch">
          自定义
          <Checkbox
            class="label-right"
            label="custom"
            :value="checkValidType('custom')"
            style="top:0px;margin-right: 0;"
            @on-change="changeValidType(arguments, 'custom')"
          ></Checkbox>
        </span>
        <div v-if="checkValidType('custom')" class="filter-container">
          <Row v-for="(valid, vindex) in setting.validValueList" :key="vindex" class="filter-row">
            <Col span="5">
              <TsFormSelect
                ref="validText"
                v-model="valid.text"
                :dataList="filterTextList"
                border="bottom"
                :validateList="customValid"
              ></TsFormSelect>
            </Col>
            <Col span="8" style="padding:0px 6px;">
              <TsFormSelect
                ref="validFilter"
                v-model="valid.filter"
                :dataList="filterList"
                :validateList="customValid"
                border="bottom"
                @on-change="changeFilter(arguments,vindex)"
              ></TsFormSelect>
            </Col>
            <Col span="11">
              <div v-if="valid.filter!=='custom'">
                <TsFormInput
                  ref="validValue"
                  v-model="valid.value"
                  border="bottom"
                  style="width: 50%;float:left;padding-right:6px;"
                  :validateList="numberValid" 
                  type="number"
                />
                <TsFormSelect
                  ref="validFilter"
                  v-model="valid.unit"
                  style="width: 50%;float:left;"
                  :dataList="handleNowOpt(setting.showType)"
                  :validateList="customValid"
                  :validataList="numValid"
                  border="bottom"
                  :clearable="false"
                ></TsFormSelect>
              </div>
              <TsFormDatePicker
                v-else-if="valid.filter=='custom'"
                ref="validValue"
                v-model="valid.value"
                value-type="format"
                :format="getFormat"
                :type="getType"
                :validateList="customValid"
                width="100%"
                border="bottom"
              ></TsFormDatePicker>
            </Col>
            <i class="tsfont-close-o valid-remove" title="删除" @click="removeFilter(vindex)"></i>
          </Row>
          <span class="tsfont-plus text-href span-btn" @click="addFilter">规则</span>
        </div>
      </div>
    </div>
    <!-- end_校验 -->

    <!-- start_默认值 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey">默认值</label>
      <div class="formsetting-text bg-block">
        <RadioGroup v-model="setting.defaultValueType" class="col-2" @on-change="changeDefaultValueType">
          <Radio label="self">自定义</Radio>
          <Radio label="quote">引用</Radio>
        </RadioGroup>
        <!-- 自定义组件 -->
        <div style="padding-top:14px">
          <!-- 自定义_start -->
          <Row v-if="setting.defaultValueType == 'self'" :gutter="8">
            <Col :span="setting.nowExpression=='equal' ?24:12"><TsFormSelect
              v-model="setting.nowExpression"
              :validateList="customValid"
              :dataList="nowList"
              transfer
              :clearable="false"
              @on-change="clearnowSetting"
            ></TsFormSelect></Col>
            <Col v-if="setting.nowExpression=='others'" span="12"><TsFormDatePicker
              v-model="setting.defaultValueList"
              value-type="format"
              :type="getType"
              :format="getFormat"
              width="100%"
            ></TsFormDatePicker></Col>
            <Col v-if="setting.nowExpression=='less-than' || setting.nowExpression=='greater-than'" span="7"><TsFormInput v-model="setting.nowValue" :validateList="numValid" type="number"></TsFormInput></Col>
            <Col v-if="setting.nowExpression=='less-than' || setting.nowExpression=='greater-than'" span="5"><TsFormSelect
              v-model="setting.nowUnit"
              :validateList="customValid"
              :dataList="handleNowOpt(setting.showType)"
              transfer
              :clearable="false"
            ></TsFormSelect></Col>
          </Row>
          <!-- 自定义_end -->
          <!-- 引用_start -->
          <TsFormSelect
            v-else-if="setting.defaultValueType == 'quote'"
            v-model="setting.quoteUuid"
            :dataList="getComponentList"
            transfer
            placeholder="请选择引用组件"
          ></TsFormSelect>
          <!-- 引用_end -->
        </div>
      </div>
    </div>
    <!-- end_默认值 -->

    <!-- start_输入提示 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey">输入提示</label>
      <div class="formsetting-text">
        <TsFormInput
          v-model="setting.placeholder"
          type="text"
          width="100%"
          maxlength="50"
        ></TsFormInput>
      </div>
    </div>
    <!-- end_输入提示 -->
  </div>
</template>
<script>
import TsFormDatePicker from '@/resources/plugins/TsForm/TsFormDatePicker';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
export default {
  name: 'Formdate',
  components: {
    TsFormDatePicker,
    TsFormSelect,
    TsFormInput
  },
  props: {
    uuid: String,
    setting: Object,
    controllerList: Array
  },
  data() {
    let _this = this;
    return {
      type: 'datetime',
      filterList: [],
      customValid: ['required'],
      numberValid: ['number'],
      numValid: ['required', 'integer_p'],
      filterTextList: [
        { text: '大于', value: 'later' },
        { text: '小于', value: 'earlier' },
        { text: '大于等于', value: 'laterAndEqual' },
        { text: '小于等于', value: 'earlierAndEqual' }
      ],
      showWorkDate: false, //是否展示工作时间校验
      nowList: [
        { text: '填写当天', value: 'equal'},
        { text: '填写当天前', value: 'less-than' },
        { text: '填写当天后', value: 'greater-than' },
        { text: '指定日期', value: 'others' }
      ],
      nowOpt: [
        {text: '小时', value: 'hour'},
        {text: '天', value: 'day'},
        {text: '月', value: 'month'},
        {text: '年', value: 'year'}
      ]
    };
  },
  created() {
    this.initDatesetting();
    this.getFilterData();
  },
  methods: {
    handleNowOpt(showType) {
      // 处理，根据显示格式，联动自定义下拉列表
      let timeTypeList = this.$utils.deepClone(this.nowOpt);
      if (!showType || (timeTypeList && timeTypeList.length == 0)) {
        return this.nowOpt;
      }
      if (showType.indexOf('HH') >= 0) {
        timeTypeList = this.nowOpt;
      } else if (showType.indexOf('dd') >= 0) {
        timeTypeList.splice(0, 1);
      } else if (showType.indexOf('MM') >= 0) {
        timeTypeList.splice(0, 2);
      } else if (showType.indexOf('yyyy') >= 0) {
        timeTypeList.splice(0, 3);
      }
      return timeTypeList; 
    },
    initDatesetting: function() {
      this.$set(this.setting, 'showType', this.setting.showType || 'yyyy-MM-dd HH:mm');
      this.$set(this.setting, 'styleType', this.setting.styleType || '-');
      if (this.setting.defaultValueList && this.setting.defaultValueType == 'self') {
        this.$set(this.setting, 'nowExpression', 'others');
      }
      this.changeShowType(this.setting.showType);
    },
    changeDefaultValueType(val) {
      //改变默认值类型
      this.setting.defaultValueList = null;
      this.setting.quoteUuid = '';
      this.$set(this.setting, 'nowExpression', 'equal');
      this.$set(this.setting, 'nowUnit', '');
      this.$set(this.setting, 'nowValue', '');    
    },
    changeValidType(arg, type) {
      this.setting.validType = this.setting.validType || [];
      if (arg[0]) {
        //选中
        this.setting.validType.push(type);
        type == 'custom' && (this.setting.validValueList = []);
      } else {
        //取消选中
        let index = this.setting.validType.indexOf(type);
        this.setting.validType.splice(index, 1);
      }
    },
    getFilterData() {
      let _this = this;
      let filterList = [
        // { text: "当天", value: "day" },
        // { text: "当天前", value: "day-before" },
        // { text: "当天后", value: "day-after" },
        { text: '自定义', value: 'custom' },
        { text: '填写当天', value: 'nowDay' }
      ];
      this.controllerList.forEach(item => {
        if (item.handler == 'formdate' && item.value != _this.uuid) {
          filterList.push({ text: item.text, value: item.value });
        }
      });
      this.filterList = filterList;
    },
    addFilter() {
      if (!this.setting.validValueList) {
        this.$set(this.setting, 'validValueList', []);
      }
      this.setting.validValueList.push({ text: '', value: '', filter: '', unit: 'day'});
    },
    removeFilter(index) {
      this.setting.validValueList.splice(index, 1);
    },
    changeFilter(arg, index) {
      let filter = this.setting.validValueList[index];
      //arg[0] == 'custom' ? filter.value = '' : filter.value = 0;
      filter.value = '';
      filter.unit = 'day';
    },
    changeShowType(value) {
      //改变时间格式
      if (value == 'yyyy-MM-dd' || value == 'yyyy-MM-dd HH:mm') {
        this.showWorkDate = true;
      } else {
        this.showWorkDate = false;
      }
    },
    validComponent() {
      let _this = this;
      let componet = [
        { ref: 'validText', message: '自定义校验：请填写完整', isArray: true },
        { ref: 'validFilter', message: '自定义校验：请填写完整', isArray: true },
        { ref: 'validValue', message: '自定义校验：请填写完整', isArray: true }
      ];
      let validList = [];
      let isValid = true;
      componet.forEach(item => {
        if (item.isArray) {
          _this.$refs[item.ref] && _this.$refs[item.ref].forEach(ref => {
            !ref.valid() && (isValid = false);
          });
        } else {
          _this.$refs[item.ref] && !_this.$refs[item.ref].valid() && (isValid = false);
        }
      });
      !isValid && validList.push('自定义校验：请填写完整');
      return validList;
    },
    clearnowSetting(val) {
      if (val != 'equal') {
        this.$set(this.setting, 'nowUnit', 'day');
        this.$set(this.setting, 'nowValue', 1);        
      } else {
        this.$set(this.setting, 'nowUnit', '');
        this.$set(this.setting, 'nowValue', '');          
      }
    }
  },
  computed: {
    getComponentList() {
      let changeJSON = ['formdate'];
      return this.controllerList.filter(item => {
        return changeJSON.indexOf(item.handler) >= 0 && item.value != this.uuid;
      });
    },
    checkValidType() {
      return type => {
        return this.setting.validType && this.setting.validType.indexOf(type) >= 0;
      };
    },
    getFormat() {
      if (this.setting) {
        let styleType = this.setting.styleType || '-';
        return this.setting.showType.replace(/\-/g, styleType);
      } else {
        return 'yyyy-MM-dd HH:mm';
      }
    },
    getType() {
      let type = 'datetime';
      if (this.setting && this.setting.showType) {
        this.setting.showType == 'yyyy' && (type = 'year');
        this.setting.showType == 'yyyy-MM' && (type = 'month');
        this.setting.showType == 'yyyy-MM-dd' && (type = 'date');
      }
      return type;
    }
  },
  watch: {
    'setting.showType': {
      handler(val) {
        this.initDatesetting();
      }
    },
    'setting.styleType': {
      handler(val) {
        this.initDatesetting();
      }
    },
    showWorkDate(val) {
      if (!val) {
        let index = this.setting.validType.indexOf('workdate');
        index >= 0 && this.setting.validType.splice(index, 1);
      }
    },
    uuid(newValue, oldValue) {
      if (newValue != oldValue) {
        this.initDatesetting();
        this.getFilterData();
      }
    }
  }
};
</script>
<style scoped lang="less">
.filter-container {
  .span-btn {
    width: 100%;
    text-align: center;
    line-height: 2;
    padding-top: 4px;
  }
  .filter-row {
    padding-top: 8px;
    padding-right: 16px;
    &:hover {
      .valid-remove {
        visibility: visible;
      }
    }
    .valid-remove {
      position: absolute;
      top: 13px;
      right: 0px;
      cursor: pointer;
      visibility: hidden;
    }
  }
}
</style>
