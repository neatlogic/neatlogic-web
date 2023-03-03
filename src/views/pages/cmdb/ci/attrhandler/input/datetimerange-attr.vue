<template>
  <div>
    <TsFormDatePicker
      ref="handler"
      border="border"
      :transfer="true"
      :value="value"
      :disabled="disabled"
      :validateList="validateList"
      :type="type"
      :format="format"
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
      validateList: [],
      type: this.attrData.config.type || 'datetime',
      format: this.attrData.config.format || 'yyyy-MM-dd'
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (this.attrData && this.attrData.isRequired == 1) {
      this.validateList.push('required');
    }
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
        if (this.type == 'time' || this.type == 'datetime') {
          return this.valueList[0];
        } else if (this.type == 'datetimerange' || this.type == 'timerange') {
          try {
            const v = this.valueList[0].split(',');
            if (v.length == 2) {
              return v;
            }
          } catch (e) {
            console.error('日期区间值：' + this.valueList[0] + '转换异常');
          }
        }
      } 
      return null;
    }},
  watch: {
    attrData: {
      handler: function() {
        if (this.attrData) {
          if (this.attrData.isRequired == 1) {
            this.validateList.push('required');
          }
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
