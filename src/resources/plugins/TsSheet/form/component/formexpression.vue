<template>
  <div>
    {{ expressionValue }}
  </div>
</template>
<script>
import base from './base.vue';
import validmixin from './common/validate-mixin.js';
export default {
  name: '',
  components: {
  
  },
  extends: base,
  mixins: [validmixin],
  props: {
    readonly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
      expressionValue: '',
      whiteList: ['formtext', 'formdate', 'formtime', 'formselect', 'formradio', 'formnumber']
    };
  },
  beforeCreate() {},
  created() {
    this.init();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init() {
      let value = '';
      if (this.formData && this.config && !this.$utils.isEmpty(this.config.expression)) {
        const expression = this.config.expression;
        if (expression.type === 'strExpression') {
          expression.list.forEach(item => {
            if (item.mappingMode === 'constant') {
              value += item.value;
            } else if (item.mappingMode === 'formCommonComponent') {
              const uuidList = item.value.split('#');
              const formItemValue = this.formData[uuidList[0]] || '';
              if (!this.$utils.isEmpty(formItemValue)) {
                if (typeof formItemValue === 'object') {
                  if (uuidList[1]) {
                    value += formItemValue[uuidList[1]] || '';
                  } else {
                    value += formItemValue['value'] || '';
                  }
                } else if (Array.isArray(formItemValue)) {
                  formItemValue.forEach(a => {
                    if (typeof a === 'object') {
                      if (uuidList[1]) {
                        value += a[uuidList[1]] || '';
                      } else {
                        value += a['value'] || '';
                      }
                    } else {
                      value += a;
                    }
                  });
                } else {
                  value += formItemValue;
                }
              }
            }
          });
        } else if (expression.type === 'jsExpression' && expression.jsValue) {
          const data = this.getFormlabelMapping(this.formData);
          value = this.safeEval(expression.jsValue, data);
        }
      }
      if (!this.$utils.isSame(value, this.expressionValue)) {
        this.$nextTick(() => {
          this.expressionValue = this.$utils.deepClone(value);
          this.setValue(value);
        });
      }
    },
    safeEval(jsExpression, formData) {
      try {
        const func = new Function('data', `${jsExpression}`);
        return func(formData);
      } catch (error) {
        console.error('Error evaluating expression:', error);
        return null;
      }
    },
    getFormlabelMapping(formData) {
      let data = {};
      this.formItemList.forEach(item => {
        if (this.whiteList.includes(item.handler)) {
          data[item.label] = this.getValueString(formData[item.uuid]);
        } else {
          if (item.config && item.config.dataConfig) {
            const findItem = item.config.dataConfig.find(a => a.uuid === this.formItem.uuid);
            if (findItem) {
              item.config.dataConfig.forEach(a => {
                const label = item.label + '.' + a.label;
                if (this.whiteList.includes(a.handler)) {
                  data[label] = this.getValueString(formData[a.uuid]);
                }
              });
            }
          }
        }
      });
      return data;
    },
    getValueString(data) {
      if (!this.$utils.isEmpty(data)) {
        if (Array.isArray(data)) {
          return data[0].value;
        } else if (typeof data === 'object') {
          return data.value;
        } else {
          return data;
        }
      } else {
        return '';
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
    value: {
      handler(val) {
        this.expressionValue = this.$utils.deepClone(val);
      },
      deep: true,
      immediate: true
    },
    formData: {
      handler(val) {
        this.init();
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less">
</style>
