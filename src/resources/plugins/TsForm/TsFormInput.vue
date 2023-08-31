<template>
  <div class="form-li" :class="borderClass">
    <!-- <input v-if="type == 'password'" type="text" class="hidden" />
    <input v-if="type == 'password'" type="password" class="hidden" /> -->
    <span v-if="readonly" :class="[readonlyClass, readonlyTextHighlightClass]" :title="readonlyTitle">{{ currentValue || currentValue === 0 ? currentValue : '-' }}</span>
    <div v-else :style="getStyle">
      <Input
        v-if="type != 'number'"
        ref="input"
        v-model="currentValue"
        :placeholder="disabled? '' : placeholder"
        :rows="rows"
        :class="getClass"
        :type="type"
        :disabled="disabled"
        :size="size"
        :maxlength="maxlength"
        :show-word-limit="getShowWordLimit"
        :password="type == 'password' ? showPassword : false"
        :autosize="type == 'textarea' ? autosize : ''"
        :clearable="getClearable"
        :showRemain="showRemain"
        :suffix="suffix"
        :search="search"
        :style="setThemeColor()"
        :autocomplete="type == 'password'? 'new-password': 'off'"
        @on-change="onChangeValue"
        @on-focus="onFocusValue"
        @on-enter="onEnterValue"
        @on-blur="onBlurValue"
        @on-keyup="onEvent($event, 'keyup')"
        @on-keydown="onEvent($event, 'keydown')"
        @on-search="onSearchValue"
        @on-clear="onClearValue"
      >
        <span v-if="prepend" slot="prepend" v-html="prepend"></span>
        <span v-if="append" slot="append" v-html="append"></span>
      </Input>
      <InputNumber
        v-else
        ref="input"
        v-model="currentValue"
        :class="getClass"
        :style="setThemeColor()"
        :min="min"
        :max="max"
        :disabled="disabled"
        :placeholder="placeholder"
        @on-change="onChangeValue"
        @on-focus="onFocusValue"
        @on-enter="onEnterValue"
        @on-blur="onBlurValue"
        @on-keyup="onEvent($event, 'keyup')"
        @on-keydown="onEvent($event, 'keydown')"
        @on-search="onSearchValue"
        @on-clear="onClearValue"
      ></InputNumber>
      <div v-if="desc && !descType" class="text-tip tips desc-text-mt">{{ desc }}</div>
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
export default {
  name: 'TsFormInput',
  tagComponent: 'TsForm',
  mixins: [formMixins],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    type: String,
    name: String,
    value: {
      //默认值
      type: [String, Number],
      default: ''
    },
    maxlength: [Number, String], //最长值
    showWordLimit: {
      type: Boolean,
      default: true
    },
    placeholder: {
      type: String,
      default() {
        return this.$t('form.placeholder.pleaseinput', {target: ''});
      }
    },
    onChange: Function, //改变时触发
    onBlur: Function, //失去焦点时触发
    onFocus: Function, //获取焦点时触发
    showPassword: {
      //当类型为password时，是否显示明文和密码的切换
      type: Boolean,
      default: true
    },
    autosize: {
      //当类型为textarea时高度随内容变化
      type: [Boolean, Object]
    },
    isChangeWrite: {
      //赋值时，是否需要出发on-change事件
      type: Boolean,
      default: true
    },
    prepend: String,
    append: String,
    suffix: String,
    rows: {
      type: Number,
      default: 5
    },
    height: {
      //默认没有高度，高度只针对textarea
      type: [String, Number, Boolean],
      default: false
    },
    showRemain: {
      //在开启showWordLimit前提下，显示剩余字数，默认是显示已输入数/总数，将此参数设为true只显示剩余字数
      type: Boolean,
      default: true
    },
    search: {
      //是否显示为搜索型输入框
      type: Boolean,
      default: false
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number
    },
    theme: Object //主题
  },
  data() {
    return {
      currentValue: this.$utils.isEmpty(this.value) ? (this.type != 'number' ? '' : null) : this.value,
      validMesage: this.errorMessage || '',
      currentValidList: this.filterValid(this.validateList) || [],
      readonlyTitle: null,
      isValidPass: true // valid()方法验证是否都通过，默认true
    };
  },
  mounted() {
    this.readonly && this.initReadolyTitle();
    this.setTextareaHeight();
  },
  beforeDestroy() {},
  methods: {
    setThemeColor() {
      if (this.theme) {
        if (this.theme.common || this.theme.TsFormInput) {
          // 自定义主题颜色
          let themeConfig = this.$utils.mergeObj(this.theme.common, this.theme.TsFormInput);
          return themeConfig;
        }
      }
    },
    onChangeValue: function() {
      this.currentValue = this.getForbidContent ? this.currentValue.replace(new RegExp(this.getForbidContent), '') : this.currentValue; //过滤掉禁止输入的字符串
      let value = typeof this.currentValue === 'string' ? this.currentValue.trim() : this.currentValue;
      let isSame = this.value == value;
      // this.type == 'number' && value && (value = Math.floor(value));
      this.$emit('change', value);
      this.$emit('update:value', value);
      if (!(!this.isChangeWrite && isSame)) {
        //改变值时出发on-change事件
        this.$emit('on-change', value);
        typeof this.onChange == 'function' && this.onChange(value);
      }

      if (!isSame) {
        if (this.currentValidList.length > 0 && this.canValid('change', this.currentValidList)) {
          this.valid(this.currentValue);
        }
      } else {
        this.validMesage = '';
        this.isValidPass = true;
      }
    },
    onFocusValue: function() {
      typeof this.onFocus == 'function' && this.onFocus(this.currentValue);
      this.$emit('on-focus');
    },
    onEnterValue: function() {
      this.$emit('on-enter');
    },
    onSearchValue() {
      //this.$emit('on-enter');
      this.$emit('on-search');
    },
    onClearValue() {
      this.$emit('on-clear');
    },
    onBlurValue: function() {
      typeof this.onBlur == 'function' && this.onBlur(this.currentValue);
      this.$emit('on-blur', this.currentValue);
      if (this.currentValidList.length > 0 && this.canValid('blur', this.currentValidList)) {
        this.valid(this.currentValue);
      }
    },
    onEvent(evt, type) {
      this.$emit('on-' + type, evt, this.currentValue);
    },
    initReadolyTitle() {
      let width = this.$el.clientWidth;
      let text_length = 0;
      let str = JSON.stringify(this.currentValue);
      for (var i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 256) {
          text_length = text_length + 1;
        } else {
          text_length = text_length + 0.5;
        }
      }
      this.readonlyTitle = width > text_length * 14 ? null : str;
    },
    setTextareaHeight() {
      //dingl 2021-1-7 调整高度使用元素
      if (this.type == 'textarea' && this.height && this.$refs.input && this.$refs.input.$refs.textarea) {
        if (typeof this.height == 'number' && this.height < 32) {
          return;
        } else {
          let height = typeof this.height == 'number' ? this.height + 'px' : this.height;
          this.$refs.input.$refs.textarea.style.height = height;
        }
      }
    },
    focus() {
      this.$refs.input && this.$refs.input.focus();
    }
  },
  computed: {
    getClass() {
      let classNameList = [];
      if (typeof this.width == 'string' && ['small', 'large', 'middle'].includes(this.width)) {
        classNameList.push('input-' + small);
      }
      if (!this.isValidPass) {
        classNameList.push('tsForm-formItem-error');
      }
      return classNameList;
    },
    getShowWordLimit: function() {
      let _this = this;
      if (_this.type == 'password') {
        return false;
      }
      return _this.showWordLimit && !!_this.maxlength;
    },
    getClearable: function() {
      let _this = this;
      let clearable = this.clearable;
      if (typeof this.clearable == 'undefined') {
        clearable = true;
        _this.validateList &&
          _this.validateList.forEach(item => {
            typeof item == 'string' && item == 'required' && !_this.multiple && (clearable = false);
            typeof item == 'object' && item.name == 'required' && !_this.multiple && (clearable = false);
          });
      }
      return clearable;
    }
  },
  watch: {
    value(newValue, oldValue) {
      let isSame = this.$utils.isSame(newValue, this.currentValue);
      if (!isSame) {
        if (newValue !== null && newValue !== undefined && this.currentValue !== null && this.currentValue !== undefined && newValue.toString() == this.currentValue.toString()) {
          //主要是兼容 number  和 string 對比相同的情况下面 1 和 "1"
          return;
        }
        this.currentValue = newValue !== null && newValue !== undefined ? newValue : '';
        this.validMesage = '';
        this.isValidPass = true;
        this.$emit('change-label', this.currentValue, {text: this.currentValue, value: this.currentValue});
      }
    },
    height() {
      this.setTextareaHeight();
    },
    type() {
      this.setTextareaHeight();
    }
  }
};
</script>
<style lang="less" scoped>
.tsform-input-readonly {
  cursor: not-allowed;
  .ivu-input {
    cursor: not-allowed;
  }
  .ivu-input-icon-clear {
    display: none !important;
  }
}
/deep/.ivu-input-small {
  /*由于设置了size不生效，所以补一个样式 */
  height: 24px !important;
  font-size: 12px !important;
}
</style>
