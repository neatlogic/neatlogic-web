<template>
  <div>
    <TsFormInput
      ref="handler"
      border="border"
      :value="value"
      :clearable="true"
      @change="setData"
    ></TsFormInput>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  props: {
    attrData: { type: Object },
    valueList: { type: Array }
  },
  data() {
    return {
      validateList: []
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
    setData(val) {
      this.$emit('setData', [val]);
      this.$emit('setValue', [val]);
    },
    valid() {
      //验证数据合法性
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
      return '';
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
