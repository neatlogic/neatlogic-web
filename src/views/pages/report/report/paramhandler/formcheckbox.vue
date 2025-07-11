<template>
  <div>
    <TsFormCheckbox
      v-model="value"
      v-bind="formConfig"
      border="border"
      :search="true"
      :isCustomValue="true"
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
    searchParam: {
      type: Object,
      default: function() {
        return {};
      }
    },
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
  computed: {
    formConfig() {
      const { matrix = '', valueKey = '', textKey = '', reactionFilterList = [] } = this.config || {};
      const config = {
        url: '/api/rest/matrix/column/data/search/forselect',
        rootName: 'dataList',
        params: {
          matrixUuid: matrix,
          valueField: valueKey,
          textField: textKey,
          filterList: []
        }
      };
      if (reactionFilterList && reactionFilterList.length > 0) {
        reactionFilterList.forEach((v) => {
          if (v?.matrixAttrUuid) {
            const searchValue = this.searchParam?.[v.formItemUuid];
            const valueList = Array.isArray(searchValue) ? searchValue : !this.$utils.isEmpty(searchValue) ? [searchValue] : [];
            config.params.filterList.push({
              uuid: v.matrixAttrUuid,
              valueList: valueList
            });
          }
        });
      }
      return config;
    }
  },
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
