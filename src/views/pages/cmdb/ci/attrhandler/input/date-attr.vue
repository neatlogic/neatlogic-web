<template>
  <div>
    <TsFormDatePicker
      ref="handler"
      border="border"
      :transfer="true"
      :value="value"
      :disabled="disabled"
      :validateList="validateList"
      type="date"
      format="yyyy-MM-dd"
      @change="setData"
    ></TsFormDatePicker>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormDatePicker: resolve =>
      require(['@/resources/plugins/TsForm/TsFormDatePicker'], resolve)
  },
  props: {
    disabled: {type: Boolean, default: false},
    attrData: {type: Object},
    valueList: {type: Array}
  },
  data() {
    return {
      validateList: []
    };
  },
  beforeCreate() {},
  created() {
    if (this.attrData) {
      if (this.attrData.isRequired || this.attrData.isCiUnique) {
        this.validateList.push('required');
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
      if (val) {
        this.$emit('setData', [val.toString()]);
        this.$emit('setValue', [val.toString()]);
      } else {
        this.$emit('setData', []);
        this.$emit('setValue', []);
      }
    },
    valid() { //验证数据合法性
      const handler = this.$refs['handler'];
      return handler.valid();
    }
  },
  filter: {},
  computed: {
    value: function() {
      if (this.valueList && this.valueList.length > 0) {
        return this.valueList[0];
      } 
      return null;
    }},
  watch: {
    /*attrData: {
      handler: function() {
        if (this.attrData) {
          if (this.attrData.isRequired == 1) {
            this.validateList.push('required');
          }
        }
      },
      deep: true,
      immediate: true
    }*/
  }
};
</script>
<style lang="less">
</style>
