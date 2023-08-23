<template>
  <div class="form-li" :style="getStyle">
    <span v-if="readonly" :class="[readonlyClass, readonlyTextHighlightClass]">{{ value == trueValue ? trueText:falseText }}</span>
    <template v-else>
      <i-switch
        ref="switch"
        v-model="currentValue"
        :true-value="trueValue"
        :false-value="falseValue"
        :disabled="disabled"
        :before-change="handleBeforeChange"
        @on-change="onChangeValue"
      />
      <span v-if="showStatus" class="status-text" @click="toogle">{{ value === trueValue ? trueText : falseText }}</span>
    </template>
    <div v-if="desc && !descType" class="text-tip tips">{{ desc }}</div>
    <Alert v-else-if="desc && descType" :type="descType">{{ desc }}</Alert>
  </div>
</template>
<script>
import formMixins from '@/resources/mixins/formMixins.js';
export default {
  name: 'TsFormSwitch',
  mixins: [formMixins],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    name: String, 
    falseValue: {//true  false  默认为false
      //false 时对应的值
      type: [String, Number, Boolean],
      default: 0
    },
    trueValue: {
      //true 时对应的值
      type: [String, Number, Boolean],
      default: 1
    },
    value: {
      type: [String, Number, Boolean],
      default: false
    },
    onChange: Function, //改变时触发,
    beforeChange: Function, //改变前触发，如果返回true则切换，返回false则不切换
    showStatus: { // 是否在切换开关右侧显示开关状态的文本，默认是打开时显示“已激活”，关闭时显示“已禁用”
      type: Boolean,
      default: false
    },
    trueText: {
      type: String,
      default() {
        return this.$t('page.enable');
      }
    },
    falseText: {
      type: String,
      default() {
        return this.$t('page.disable');
      }
    }
  },
  data() {
    return {
      currentValue: this.value
    };
  },
  methods: {
    onChangeValue() {
      this.$emit('update:value', this.currentValue);
      this.$emit('change', this.currentValue);
      this.$emit('on-change', this.currentValue);
      typeof this.onChange == 'function' && this.onChange(this.currentValue);
    },
    toogle() {
      this.$refs?.switch.$el?.click();
    },
    handleBeforeChange() {
      let _this = this;
      return new Promise((resolve) => {
        let isToggle = true;
        if (_this.beforeChange && typeof _this.beforeChange == 'function') {
          isToggle = _this.beforeChange();
        }
        if (isToggle) {
          resolve();
        }
      });
    }
  },
  watch: {
    value(newValue, oldValue) {
      let _this = this;
      if (newValue != _this.currentValue) {
        _this.currentValue = newValue;
      }
    }
  }
};
</script>

<style lang="less" scoped>
.status-text {
  padding-left: 5px;
}
</style>
