<template>
  <div>
    <TsFormInput
      ref="handler"
      border="border"
      :disabled="disabled"
      :value="value"
      :validateList="validateList"
      maxlength="500"
      @change="setData"
    ></TsFormInput>
    <div class="text-grey">
      <span v-if="attrData.config.type == 'outterlink'">外部链接：使用新窗口打开页面，必须是http或https开头</span>
      <span v-else-if="attrData.config.type == 'innerlink'">内部链接：使用当前窗口打开页面，支持http、https或/开头，支持跳转到其他模块</span>
      <span v-else-if="attrData.config.type == 'route'">内部路由：仅支持跳转到配置管理模块其他页面，使用/开头</span>
    </div>
    <div v-if="error" class="text-error">{{ error }}</div>
  </div>
</template>
<script>
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
export default {
  name: '',
  components: {
    TsFormInput
  },
  props: {
    disabled: {type: Boolean, default: false},
    attrData: { type: Object },
    valueList: { type: Array }
  },
  data() {
    return {
      error: '',
      validateList: []
    };
  },
  beforeCreate() {},
  created() {
    if (this.attrData) {
      if (this.attrData.isRequired || this.attrData.isCiUnique) {
        this.validateList.push('required');
      }
      if (this.attrData.validConfig && this.attrData.validConfig.regex) {
        this.validateList.push({ name: 'regex', pattern: this.attrData.validConfig.regex });
      }
    } 
  },
  beforeMount() {},
  mounted() {
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    setData(val) {
      this.$emit('setData', [val]);
      this.$emit('setValue', [val]);
    },
    valid() {
      //验证数据合法性
      if (this.attrData.isRequired) {
        const handler = this.$refs['handler'];
        this.error = '';
        if (!handler.valid()) {
          return false;
        }
        const value = this.value.toLowerCase();
        if (this.attrData.config.type == 'outterlink') {
          if (!value.startsWith('http') && !value.startsWith('https')) {
            this.error = '外部链接需要是http或https开头';
            return false;
          }
        } else if (this.attrData.config.type == 'innerlink') {
          if (!value.startsWith('http') && !value.startsWith('https') && !value.startsWith('/')) {
            this.error = '内部链接需要是http或https或/开头';
            return false;
          }
        } else if (this.attrData.config.type == 'route') {
          if (!value.startsWith('/')) {
            this.error = '内部路由需要是/开头';
            return false;
          }
        }
      }
      return true;
    }
  },
  filter: {},
  computed: {
    value: function() {
      if (this.valueList && this.valueList.length > 0) {
        return this.valueList[0];
      } 
      return '';
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
