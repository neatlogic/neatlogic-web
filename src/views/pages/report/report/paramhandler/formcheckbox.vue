<template>
  <div>
    <TsFormCheckbox
      v-model="value"
      v-bind="myConfig"
      :dataList="dataList"
      border="border"
      :search="true"
      :dealDataByUrl="formatDataList"
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
        dynamicUrl: '/api/rest/matrix/column/data/search/forselect',
        rootName: 'dataList',
        params: {
          matrixUuid: this.config.matrix,
          valueField: this.config.valueKey,
          textField: this.config.textKey
        }
      },
      value: [],
      dataList: []
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
  methods: {
    formatDataList: function(nodeList) {
      let dataList = [];
      if (nodeList.tbodyList) {
        nodeList.tbodyList.forEach(element => {
          dataList.push({
            //后端要求value值需要用&=&分隔，后期要改掉，后端直接返回正确的值
            value: element[this.config.valueKey].value + '&=&' + element[this.config.textKey].text,
            text: element[this.config.textKey].text
          });
        });
      }
      return dataList;
    }
  },
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
