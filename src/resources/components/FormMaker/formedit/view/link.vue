<template>
  <div style="position: relative;">
    <i v-if="setting.config.isRequired" class="require-tip">*</i>
    <a
      v-if="setting"
      class="text-href"
      :href="setting.config.value ? setting.config.value : 'javascript:void(0);'"
      :target="setting.config.target || '_self'"
      :style="setWidth"
    >{{ setting.config.text || '超链接' }}</a>
    <a v-else class="text-href" href="javascriot:void(0);">超链接</a>
    <div v-if="setting.config.desc" class="component-tips ts-info">{{ setting.config.desc }}</div>
  </div>
</template>
<script>
export default {
  name: 'Forminput',
  components: {},
  props: {
    setting: Object,
    value: String,
    isReadonly: Boolean,
    formView: {
      //是否通过form-view页面进行初始化，如果不是则需要把defaultValue值给 value
      type: Boolean,
      default: true
    },
    componentList: {
      //同一个表单的所有组件,主要用来做数据引用
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    let _this = this;
    return {
      currentValue: _this.value
    };
  },
  created() {},
  methods: {
    updatethis: function(val) {
      this.$emit('update', val);
    },
    updateValue: function(val) {
      this.$set(this, 'currentValue', val);
    },
    getValue: function(val) {
      return this.currentValue;
    },
    validateValue: function() {
      let isVaild = true;
      return isVaild;
    }
  },
  computed: {
    setWidth() {
      let style = { display: 'block', wordBreak: 'break-all' };
      if (this.setting.config.width) {
        Object.assign(style, {
          width: this.setting.config.width
        });
      }
      return style;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.readonly-container {
  position: relative;
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0;
  }
}
.component-tips {
  text-align: left;
  font-size: 90%;
  opacity: 0.6;
  word-break: break-all;
  display: block;
  &:before {
    margin-right: 3px;
  }
}
</style>
