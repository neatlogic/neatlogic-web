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
      <div class="formsetting-text">
        <RadioGroup v-model="setting.showType" class="col-2">
          <Radio label="HH:mm:ss">时:分:秒</Radio>
          <Radio label="HH:mm">时:分</Radio>
        </RadioGroup>
      </div>
    </div>
    <!-- end_显示格式 -->

    <!-- 校验 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey">校验</label>
      <div class="formsetting-text bg-block">
        <!-- <span class="formsetting-label  label-switch">
          工作日
          <Checkbox class="label-right" label="common" :value="checkValidType('common')" @on-change="changeValidType(arguments,'common')" style="top:0px;margin-right: 0;"></Checkbox>
        </span> -->
        <span class="formsetting-label  label-switch">
          自定义
          <Checkbox
            class="label-right"
            label="custom"
            :value="checkValidType('custom')"
            style="top:0px;margin-right: 0;"
            @on-change="changeValidType(arguments, 'custom')"
          ></Checkbox>
        </span>
        <!-- 自定义校验 start -->
        <div v-if="checkValidType('custom')" class="filter-container">
          <Row v-for="(valid, vindex) in setting.validValueList" :key="vindex" class="filter-row">
            <Col span="6">
              <TsFormSelect
                ref="validText"
                v-model="valid.text"
                :dataList="filterTextList"
                :validateList="customValid"
                border="bottom"
              ></TsFormSelect>
            </Col>
            <Col span="9" style="padding:0px 6px;">
              <TsFormSelect
                ref="validFilter"
                v-model="valid.filter"
                :dataList="filterList"
                :validateList="customValid"
                border="bottom"
              >
              </TsFormSelect>
            </Col>
            <Col span="9">
              <div v-if="valid.filter == 'day-after' || valid.filter == 'day-before'">
                <TsFormInput
                  v-model="valid.value"
                  type="number"
                  border="bottom"
                  style="width: 80%;display: inline-block;"
                  @on-change="valid.value == ''"
                />
                天
              </div>
              <TsFormDatePicker
                v-else-if="valid.filter == 'custom'"
                ref="validValue"
                v-model="valid.value"
                value-type="format"
                :format="setting.showType"
                :validateList="customValid"
                type="time"
                width="100%"
                border="bottom"
              ></TsFormDatePicker>
            </Col>
            <i class="tsfont-close-o valid-remove" title="删除" @click="removeFilter(vindex)"></i>
          </Row>
          <span class="tsfont-plus text-href span-btn" @click="addFilter">规则</span>
        </div>
        <!-- 自定义校验 end -->
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
          <TsFormDatePicker
            v-if="setting.defaultValueType == 'self'"
            v-model="setting.defaultValueList"
            type="time"
            valueType="format"
            :format="setting.showType"
            width="100%"
          ></TsFormDatePicker>
          <!-- 引用 -->
          <TsFormSelect
            v-else-if="setting.defaultValueType == 'quote'"
            v-model="setting.quoteUuid"
            :dataList="getComponentList"
            placeholder="请选择引用组件"
          ></TsFormSelect>
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
  name: 'Formtime',
  components: { TsFormDatePicker, TsFormSelect, TsFormInput },
  props: {
    uuid: String,
    setting: Object,
    controllerList: Array
  },
  data() {
    return {
      type: 'time',
      filterList: [],
      customValid: ['required'],
      filterTextList: [
        { text: '晚于', value: 'later' },
        { text: '早于', value: 'earlier' }
      ]
    };
  },
  created() {
    this.initTimesetting();
    this.getFilterData();
  },
  methods: {
    initTimesetting: function() {
      this.$set(this.setting, 'showType', this.setting.showType || 'HH:mm:ss');
    },
    changeDefaultValueType(val) {
      //改变默认值类型
      this.setting.defaultValueList = null;
      this.setting.quoteUuid = '';
    },
    changeValidType(arg, type) {
      this.setting.validType = this.setting.validType || [];
      if (arg[0]) {
        //选中
        this.setting.validType.push(type);
        this.setting.validValueList = [];
      } else {
        //取消选中
        let index = this.setting.validType.indexOf(type);
        this.setting.validType.splice(index, 1);
      }
    },
    getFilterData() {
      let filterList = [{ text: '自定义', value: 'custom' }];
      let _this = this;
      this.controllerList.forEach((item, index) => {
        if (item.handler == 'formtime' && item.value != _this.uuid) {
          filterList.push({ text: item.text, value: item.value });
        }
      });
      this.filterList = filterList;
    },
    addFilter() {
      if (!this.setting.validValueList) {
        this.$set(this.setting, 'validValueList', []);
      }
      this.setting.validValueList.push({ text: '', value: '', filter: '' });
    },
    removeFilter(index) {
      this.setting.validValueList.splice(index, 1);
    },
    validComponent() {
      let _this = this;
      let validList = [];
      if (this.checkValidType('custom')) {
        let componet = [
          { ref: 'validText', message: '自定义校验：请填写完整', isArray: true },
          { ref: 'validFilter', message: '自定义校验：请填写完整', isArray: true },
          { ref: 'validValue', message: '自定义校验：请填写完整', isArray: true }
        ];
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
      }
      return validList;
    }
  },
  computed: {
    getComponentList() {
      let changeJSON = ['formtime'];
      return this.controllerList.filter(item => {
        return changeJSON.indexOf(item.handler) >= 0 && item.value != this.uuid;
      });
    },
    checkValidType() {
      return type => {
        return this.setting.validType && this.setting.validType.indexOf(type) >= 0;
      };
    }
  },
  watch: {
    setting(val) {
      this.initTimesetting();
    },
    uuid(newValue, oldValue) {
      if (newValue != oldValue) {
        this.initTimesetting();
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
  .option-line {
    border-top: 1px solid;
    padding-top: 9px;
    margin-top: 3px;
  }
}
</style>
