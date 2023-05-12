<template>
  <div>
    <TsFormCascader
      v-model="currentValue"
      :dataList="dataList"
      :format="format"
      :validateList="validateList"
      :disabled="disabled"
      transfer
      @change="changeValue"
    ></TsFormCascader>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormCascader: resolve => require(['@/resources/plugins/TsForm/TsFormCascader'], resolve)
  },
  props: {
    value: { //上游参数值
      type: [Array, String],
      default: null
    },
    dataList: Array,
    disabled: Boolean
  },
  data() {
    return {
      currentValue: [],
      validateList: ['required']
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
  methods: {
    format(labels, selectedData) {
      let data = selectedData && selectedData.length > 1 ? selectedData[1] : false;
      let text = '';
      if (labels && labels.length > 0) {
        text = labels[labels.length - 1] + (data && data.operationDes ? '[' + data.operationDes + ']' : '');
      }
      return text;
    },
    changeValue(val) {
      this.$emit('updateVal', val);
    }
  },
  filter: {},
  computed: {},
  watch: {
    value: {
      handler(val) {
        if (val) {
          this.currentValue = val;
        } else {
          this.currentValue = [];
        }
        this.$emit('updateVal', this.currentValue);
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less">
</style>
