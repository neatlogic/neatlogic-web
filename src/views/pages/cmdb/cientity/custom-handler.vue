<template>
  <div>
    <TsFormInput
      ref="propHandler"
      border="border"
      :value="value"
      :validateList="validateList"
      @change="setData"
    ></TsFormInput>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  props: {
    attrData: {type: Object},
    valueList: {type: Array}
  },
  data() {
    return {
      validateList: [],
      value: ''
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (this.attrData.isRequired == 1) {
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
    setData(value) {
      this.$emit('setData', [value]);
    },
    valid() {
      const handler = this.$refs['propHandler'];
      return handler.valid();
    }
  },
  filter: {},
  computed: {},
  watch: {valueList: {
    handler: function(val) {
      if (val && val.length > 0) {
        this.value = val[0];
      }
    },
    deep: true,
    immediate: true
  }}
};
</script>
<style lang="less">
</style>
