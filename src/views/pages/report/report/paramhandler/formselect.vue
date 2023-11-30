<template>
  <div>
    <TsFormSelect
      v-model="value"
      v-bind="myConfig"
      border="border"
      :search="true"
      :transfer="true"
      :isCustomValue="true"
      :validateList="validateList"
    ></TsFormSelect>
  </div>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
export default {
  name: '',
  components: {
    TsFormSelect
  },
  props: {
    config: {
      type: Object
    },
    validateList: {
      type: Array,
      default: function() {
        return [];
      }
    }
  },
  data() {
    return {
      myConfig: {
        dynamicUrl: '/api/rest/matrix/column/data/search/forselect',
        rootName: 'dataList',
        params: {
          matrixUuid: this.config.matrix,
          valueField: this.config.valueKey,
          textField: this.config.textKey,
          keywordColumn: this.config.textKey
        }
      },
      value: ''
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() { 
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {},
  filter: {},
  computed: {},
  watch: {
    value: {
      handler: function(val, oldVal) {
        !this.$utils.isSame(val, oldVal) && this.$emit('setParam', val);
      }
    },
    config: {
      handler: function(val, oldVal) {
        if (this.config && this.config.defaultValue) {
          !this.$utils.isSame(val, oldVal) && (this.value = this.config.defaultValue);
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less">
</style>
