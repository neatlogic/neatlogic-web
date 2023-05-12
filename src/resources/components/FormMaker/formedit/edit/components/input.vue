<template>
  <div class="input-border">
    <!-- start_必填 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey label-switch">
        必填
        <i-switch v-model="setting.isRequired" class="label-right" />
      </label>
    </div>
    <!-- end_必填 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey">切换组件</label>
      <div class="formsetting-text bg-block">
        <RadioGroup v-model="changeInput" class="col-2" @on-change="change">
          <Radio label="forminput">文本框</Radio>
          <Radio label="formtextarea">文本域</Radio>
        </RadioGroup>
      </div>
    </div>
    <!-- start_文本类型 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey">文本类型</label>
      <div class="formsetting-text bg-block">
        <RadioGroup v-model="setting.textType" class="col-4" @on-change="onChangeTextType">
          <Radio label="none">无</Radio>
          <Radio label="float">数字</Radio>
          <Radio label="ip">ip地址</Radio>
          <Radio label="mail">邮箱</Radio>
        </RadioGroup>
      </div>
    </div>
    <!-- end_文本类型 -->

    <!-- start_数字范围 -->
    <div v-if="setting.textType=='float'" class="formsetting-block">
      <label class="formsetting-label text-grey">数字范围</label>
      <div class="formsetting-text bg-block">
        <TsFormInput
          v-model="setting.minNumber"
          placeholder="最小值"
          type="number"
          :validateList="validateSetting.float"
          style="width:40%;display: inline-block;vertical-align: top;"
        />
        -
        <TsFormInput
          ref="maxNumber"
          v-model="setting.maxNumber"
          placeholder="最大值"
          type="number"
          :validateList="validateSetting.maxNumber"
          style="width:40%;display: inline-block; vertical-align: top;"
        />
      </div>
    </div>
    <!-- end_数字范围 -->

    <!-- start_小数位 -->
    <div v-if="setting.textType=='float'" class="formsetting-block">
      <label class="formsetting-label text-grey">小数位</label>
      <div class="formsetting-text">
        <TsFormInput 
          v-model="setting.decimalNumber" 
          placeholder="小数位" 
          :validateList="validateSetting.number" 
          type="number"
        ></TsFormInput>
      </div>
    </div>
    <!-- end_小数位 -->

    <!-- start_字符长度 -->
    <div v-if="setting.textType!='float'" class="formsetting-block">
      <label class="formsetting-label text-grey">字符长度</label>
      <div class="formsetting-text">
        <TsFormInput 
          ref="inputMaxlength" 
          v-model="setting.inputMaxlength" 
          :validateList="validateSetting.inputMaxlength" 
          type="number"
          @on-change="onChangeMaxlength"
        ></TsFormInput>
      </div>
    </div>
    <!-- end_字符长度 -->
    <!-- start_默认值 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey">默认值</label>
      <div class="formsetting-text">
        <TsFormInput 
          ref="defaultValueList" 
          v-model="setting.defaultValueList" 
          :validateList="getInputValueList" 
          :maxlength="setting.inputMaxlength"
        ></TsFormInput>
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
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
export default {
  name: 'Formdinput',
  components: { TsFormInput },
  props: {
    setting: Object
  },
  data() {
    let _this = this;
    return {
      changeInput: 'forminput',
      validateSetting: {
        number: ['number'],
        float: ['float'],
        maxNumber: [
          'float',
          {
            name: 'maxNumber',
            validator: function(rule, value) {
              if (value == '' || _this.setting.minNumber === '') {
                return true;
              } else {
                return value > _this.setting.minNumber;
              }
              // eslint-disable-next-line no-unreachable
              return value <= 1000;
            },
            trigger: 'change',
            message: '最大值不得小于等于最小值'
          }
        ],
        inputMaxlength: [
          'number',
          {
            name: 'max100',
            validator: function(rule, value) {
              if (value == '' || value == null || value == undefined) {
                return true;
              }
              return value <= 100;
            },
            trigger: 'change',
            message: '请输入小于等于100的整数'
          }
        ]
      }
    };
  },
  created() { },
  mounted() { },
  methods: {
    //切换插件
    change(val) {
      this.$parent.updateOwnsetting('handler', val);
    },
    onChangeMaxlength() {
      this.$nextTick().then(() => {
        this.$refs.defaultValueList.valid();
      });
    },
    onChangeTextType() {
      this.setting.minNumber = '';
      this.setting.maxNumber = '';
      this.setting.decimalNumber = '';
      this.setting.inputMaxlength = 50;
      this.$nextTick(() => {
        this.$refs.defaultValueList.valid();
      });
    },
    validComponent() {
      let _this = this;
      let componet = [
        { ref: 'defaultValueList', message: '默认值：' },
        { ref: 'inputMaxlength', message: '字符长度：' },
        { ref: 'maxNumber', message: '数值范围：' }
      ];
      let validList = [];
      componet.forEach(item => {
        _this.$refs[item.ref] && !_this.$refs[item.ref].valid() && validList.push(item.message + _this.$refs[item.ref].validMesage);
      });
      return validList;
    }
  },
  computed: {
    getInputValueList() {
      let _this = this;
      let validList = [];
      if (this.setting.textType && this.setting.textType != 'none') {
        validList.push(this.setting.textType);
      }

      if (this.setting.textType != 'float') { //非number类型验证长度
        validList.push({
          name: 'tomore',
          trigger: 'change',
          message: '字符长度过长',
          validator: (rule, value) => {
            if (value == '' || value == null || value == undefined) {
              return true;
            } else if (_this.setting.inputMaxlength) {
              return value.length <= _this.setting.inputMaxlength;
            }
            return true;
          }
        });
      } else if (this.setting.textType == 'float') { //number类型验证大小和小数位
        (this.setting.minNumber !== '' || this.setting.maxNumber !== '') && validList.push({//最大值，最小值的验证
          name: 'tonumber',
          trigger: 'change',
          message: '请输入' + (this.setting.minNumber ? '大于' + this.setting.minNumber : '') + (this.setting.maxNumber ? '小于' + this.setting.maxNumber : '') + '的数据',
          validator: (rule, value) => {
            let valid = true;
            if (value == '' || value == null || value == undefined) {
              return true;
            } else {
              if (_this.setting.minNumber !== null && _this.setting.minNumber !== undefined && _this.setting.minNumber !== '') {
                valid = parseFloat(value) >= parseFloat(_this.setting.minNumber);
              }
              if (valid && _this.setting.minNumber !== null && _this.setting.minNumber !== undefined && _this.setting.minNumber !== '') {
                valid = parseFloat(value) <= parseFloat(_this.setting.maxNumber);
              }
            }
            return valid;
          }
        });
        if (this.setting.decimalNumber !== '') {
          validList.push({//小数位验证
            name: 'decimal',
            trigger: 'change',
            message: '小数位' + _this.setting.decimalNumber,
            validator: (rule, value) => {
              if (value == '' || value == null || value == undefined) {
                return true;
              } else if (value.indexOf('.') < 0) {
                return true;
              } else {
                let index = value.indexOf('.');
                return value.substr(index + 1).length <= Math.floor(_this.setting.decimalNumber);
              }
              // eslint-disable-next-line no-unreachable
              return true;
            }
          });
        }
      }
      return validList;
    }
  },
  watch: {}
};
</script>
