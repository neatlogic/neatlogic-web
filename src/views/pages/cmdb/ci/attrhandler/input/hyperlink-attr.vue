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
      <span v-if="attrData.config.type == 'outterlink'">{{ $t('term.cmdb.outerlinkinputtip') }}</span>
      <span v-else-if="attrData.config.type == 'innerlink'">{{ $t('term.cmdb.innerlinkinputtip') }}</span>
      <span v-else-if="attrData.config.type == 'route'">{{ $t('term.cmdb.innerrouteinputtip') }}</span>
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
            this.error = this.$t('term.cmdb.outerlinkvalidtip');
            return false;
          }
        } else if (this.attrData.config.type == 'innerlink') {
          if (!value.startsWith('http') && !value.startsWith('https') && !value.startsWith('/')) {
            this.error = this.$t('term.cmdb.innerlinkvalidtip');
            return false;
          }
        } else if (this.attrData.config.type == 'route') {
          if (!value.startsWith('/')) {
            this.error = this.$t('term.cmdb.innerroutevalidtip');
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
