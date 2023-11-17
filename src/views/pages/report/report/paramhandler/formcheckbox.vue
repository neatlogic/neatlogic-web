<template>
  <div>
    <TsFormCheckbox
      v-model="value"
      v-bind="myConfig"
      border="border"
      :search="true"
      :isValueObject="true"
      :validateList="validateList"
    ></TsFormCheckbox>
  </div>
</template>
<script>
import TsFormCheckbox from '@/resources/plugins/TsForm/TsFormCheckbox';
export default {
  name: '',
  components: {
    TsFormCheckbox
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
        url: '/api/rest/matrix/column/data/search/forselect',
        rootName: 'dataList',
        params: {
          matrixUuid: this.config.matrix,
          valueField: this.config.valueKey,
          textField: this.config.textKey
        }
      },
      value: []
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
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
