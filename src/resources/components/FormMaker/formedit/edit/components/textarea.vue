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
    <!-- start_高度 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey">高度（单位:px）</label>
      <div class="formsetting-text">
        <TsFormInput
          ref="heightValid"
          v-model="setting.height"
          type="number"
          placeholder="请输入大于等于32的数值"
          :validateList="validateSetting.heightValid"
        ></TsFormInput>
      </div>
    </div>
    <!-- end_高度 -->
    <!-- start_字符长度 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey">字符长度</label>
      <div class="formsetting-text">
        <TsFormInput
          ref="textareaMaxlength"
          v-model="setting.textareaMaxlength"
          :validateList="validateSetting.textareaMaxlength"
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
          :validateList="validateSetting.defaultValueList"
          :maxlength="setting.textareaMaxlength"
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
  name: 'Formdtextarea',
  components: { TsFormInput },
  props: {
    setting: Object
  },
  data() {
    let _this = this;
    return {
      changeInput: 'formtextarea',
      validateSetting: {
        textareaMaxlength: ['number', {
          name: 'max1000',
          validator: function(rule, value) {
            if (value == '' || value == null || value == undefined) {
              return true;
            }
            return value <= 1000;
          },
          trigger: 'change',
          message: '请输入小于等于1000的值'
        }
        ],
        defaultValueList: [{
          name: 'tomore',
          validator: function(rule, value) {
            if (value == '' || value == null || value == undefined) {
              return true;
            } else if (_this.setting.textareaMaxlength) {
              return value.length <= _this.setting.textareaMaxlength;
            }
            return true;
          },
          trigger: 'change',
          message: '字符长度过长'
        }
        ],
        heightValid: [{
          name: 'max32',
          validator: function(rule, value) {
            if (value === '' || value === null || value === undefined) {
              return true;
            } else {
              return value >= 32;
            }
          },
          trigger: 'change',
          message: '请输入大于等于32的数值'
        }]
      }
    };
  },
  created() {},
  mounted() {},
  methods: {
    //切换插件
    change(val) {
      this.$parent.updateOwnsetting('handler', val);
    },
    onChangeMaxlength() {
      this.$refs.defaultValueList.valid();
    },
    validComponent() {
      let _this = this;
      let componet = [
        { ref: 'defaultValueList', message: '默认值：请填写正确格式' },
        { ref: 'textareaMaxlength', message: '字符长度:请输入小于等于1000的值' },
        { ref: 'heightValid', message: '高度:请输入大于等于32的数值' }
      ];
      let validList = [];
      componet.forEach(item => {
        _this.$refs[item.ref] && !_this.$refs[item.ref].valid() && validList.push(item.message);
      });
      return validList;
    }
  },
  computed: {},
  watch: {}
};
</script>
