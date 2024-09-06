<template>
  <div>
       
  </div>
</template>
<script>
import base from './base.vue';
import validmixin from './common/validate-mixin.js';
import TsTable from '@/resources/components/TsTable/TsTable.vue';
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
      expressionValue: ''
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
      if (this.formData && this.config && this.$utils.isEmpty(this.config.expressionList)) {
        this.config.expressionList.forEach(item => {
          if (item.mappingMode === 'constant') {
            value += item.value;
          } else if (item.mappingMode === 'formCommonComponent') {
            const uuidList = item.value.split('#');
            const formItemValue = this.formData[uuidList[0]];
            if (!this.$utils.isEmpty(formItemValue)) {
              if (typeof formItemValue === 'object') {
                if (uuidList[1]) {
                  value += formItemValue[uuidList[1]];
                } else {
                  value += formItemValue['text'];
                }
              } else if (Array.isArray(formItemValue)) {
                formItemValue.forEach(a => {
                  if (typeof a === 'object') {
                    if (uuidList[1]) {
                      value += a[uuidList[1]];
                    } else {
                      value += a['text'];
                    }
                  } else {
                    value += a;
                  }
                });
              } else {
                value += formItemValue;
              }
            }

            value += this.formData[uuidList[0]];
          } else if (item.mappingMode === 'formTableComponent') {
            //
          }
        });
      }
    }
   
  },
  filter: {},
  computed: {},
  watch: {
    value: {
      handler(val) {
        console.log('value', val);
      },
      deep: true,
      immediate: true
    },
    'config.expressionList': {
      handler: function(val) {
        console.log('expressionList', val);
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less">
</style>
