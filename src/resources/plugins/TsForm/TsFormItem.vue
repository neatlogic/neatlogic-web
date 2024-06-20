<template>
  <div :class="classes" :style="getWidth">
    <label
      :class="[prefixCls + '-label', 'overflow']"
      :for="labelFor"
      :style="labelStyles"
      :title="label.length > 4 ? label : ''"
    >
      <FormSlot>{{ label }}</FormSlot>
      <div v-if="labelPosition === 'top' && buttonList && buttonList.length > 0" class="ml-xs" style="display: inline-block">
        <div class="item-group">
          <div
            v-for="(btn, index) in buttonList"
            :key="index"
            :title="btn.title"
            class="cursor"
            :class="btn.icon"
            @click="btn.click()"
          >{{ btn.name }}</div>
          <div></div>
        </div>
      </div>
      <Poptip
        v-if="tooltip"
        :transfer="true"
        word-wrap
        trigger="hover"
        width="300"
      >
        <i class="tsfont-info-o text-tip-active tips" :style="{ 'margin-left': '3px', transform: 'translateY(-1px)' }"></i>
        <div slot="content" class="tooltip-content" v-html="tooltip"></div>
      </Poptip>
      <!-- <Tooltip
        v-if="tooltip"
        theme="light"
        :offset="-12"
        max-width="500"
        :placement="tipPlacement"
        transfer
        style="line-height: initial;"
        :transfer-class-name="prefixCls + '-label-tooltip'"
      >
        <i class="tsfont-info-o text-tip-active tips" :style="{ 'margin-left': '3px', transform: 'translateY(-1px)' }"></i>
        <div
          slot="content"
          class="tooltip-content"
          style="white-space:normal;word-break:break-all"
          v-html="tooltip"
        ></div>
      </Tooltip>-->
    </label>
    <div :class="[prefixCls + '-content']" :style="contentStyles">
      <slot></slot>
    </div>
  </div>
</template>
<script>
const prefixCls = 'ivu-form-item';
import FormSlot from './label-slot';
export default {
  name: 'TsFormItem',
  tagComponent: 'TsForm',
  components: { FormSlot },
  props: {
    label: {
      type: String,
      default: ''
    },
    labelWidth: {
      default: 120
    },
    labelStrong: {
      type: Boolean,
      default: false
    },
    error: {
      type: String
    },
    labelFor: {
      type: String
    },
    labelPosition: {
      type: String,
      default: 'right'
    },
    contentAlign: {
      //内容水平对齐
      type: String
    },
    labelAlign: {
      //对label标签的垂直位置进行布局，只有在labelPosition的值不为'top'时才生效
      type: String,
      default: 'top',
      validator(value) {
        return ['top', 'center'].includes(value);
      }
    },
    validateList: {
      type: Array,
      default: function() {
        return [];
      }
    },
    name: {
      type: String
    },
    itemWidth: {
      type: [Number, String], //数字和百分比
      default: '100%'
    },
    required: {
      type: Boolean, //必填
      default: false
    },
    tooltip: {
      type: String, //label右侧的tooltip提示文本
      default: ''
    },
    tipPlacement: {
      type: String, //label右侧的tooltip提示文本方向
      default: 'top'
    },
    type: {
      type: String, //类型
      default: ''
    },
    readonly: {
      type: Boolean,
      default: false
    },
    disabled: {
      //true  false  默认为false
      type: Boolean,
      default: false
    },
    buttonList: { type: Array },
    theme: Object //主题
  },
  data() {
    return {
      prefixCls: prefixCls,
      validateMessage: '',
      validateDisabled: false,
      validator: {}
    };
  },
  created() {},
  methods: {
    onFieldBlur() {
      this.validate('blur');
    },
    onFieldChange() {
      if (this.validateDisabled) {
        this.validateDisabled = false;
        return;
      }
      this.validate('change');
    },
    dispatch(componentName, eventName, params) {
      let parent = this.$parent || this.$root;
      let name = parent.$options.name;

      while (parent && (!name || name !== componentName)) {
        parent = parent.$parent;

        if (parent) {
          name = parent.$options.name;
        }
      }
      if (parent) {
        parent.$emit.apply(parent, [eventName].concat(params));
      }
    }
  },
  computed: {
    classes() {
      let required = getRequired(this.validateList, this.required) || this.required;
      return [
        'ivu-form-item',
        'tsform-item',
        `ivu-form-label-${this.labelPosition}`,
        {
          'label-align-center': this.labelPosition !== 'top' && this.labelAlign === 'center',
          [`${prefixCls}-required`]: required || false
        },
        {
          disabled: this.readonly || this.disabled
        }
      ];
    },
    labelStyles() {
      let style = {};
      //const labelWidth = this.labelWidth === 0 || this.labelWidth ? this.labelWidth : this.FormInstance ? this.FormInstance.labelWidth :0;
      const labelWidth = this.labelWidth || 0;
      if (this.labelPosition != 'top') {
        style.width = `${labelWidth}px`;
      }
      if (this.labelStrong) {
        style.fontWeight = 'bold';
      }
      return style;
    },
    contentStyles() {
      let style = {};
      //const labelWidth = this.labelWidth === 0 || this.labelWidth ? this.labelWidth : this.FormInstance ? this.FormInstance.labelWidth :0;
      const labelWidth = this.labelWidth || 0;
      if (this.labelPosition != 'top') {
        style.marginLeft = `${labelWidth}px !important`;
      }
      if (this.contentAlign) {
        style['text-align'] = this.contentAlign;
      }
      return style;
    },
    getWidth() {
      let resultJson = {};
      if (typeof this.itemWidth == 'number') {
        resultJson.width = this.itemWidth + 'px';
      } else if (typeof this.itemWidth == 'string' && this.itemWidth.indexOf('%') >= 0) {
        resultJson.width = this.itemWidth;
      }
      return resultJson;
    }
  },
  watch: {
    error: {
      handler(val) {
        this.validateMessage = val;
      },
      immediate: true
    },

    required(n, o) {
      this.isRequired = n;
      if (o && !n) {
        // this.resetField();
      }
    }
  }
};

function getRequired(validateList, required) {
  let hasRequired = false;
  if (validateList && validateList.length > 0) {
    for (let i = 0; i < validateList.length; i++) {
      let valid = validateList[i];
      if ((typeof valid == 'string' && valid == 'required') || (typeof valid == 'object' && valid.name == 'required')) {
        hasRequired = true;
        break;
      }
    }
  }
  !hasRequired && (hasRequired = required || false);

  return hasRequired;
}
</script>
<style lang="less" scoped>
.ivu-form-label-left {
  > .ivu-form-item-label {
    position: absolute;
    line-height: 32px;
    padding: 0px @space-normal 0px 0;
  }
  // &.ivu-form-item-required{
  //   .ivu-form-item-label{
  //     padding-left: 3px;
  //     &:before{

  //     }
  //   }
  // }
}
.ivu-form-item .ivu-form-item {
  margin-bottom: @space-sm;
}
.label-align-center {
  position: relative;
  & > .ivu-form-item-label {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }
}
.ivu-form-item-label {
  > span {
    // display: inline-block;
  }
}
</style>
