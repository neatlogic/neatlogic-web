<template>
  <div>
    <TsFormSelect
      ref="propertyHandler"
      :transfer="true"
      :dataList="property.enumList"
      :value="value"
      :validateList="property.restraint == 'M'?[{name:'required',message:' '}]:[]"
      @on-change="setData"
    ></TsFormSelect>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: resolve =>
      require(['@/resources/plugins/TsForm/TsFormSelect.vue'], resolve)
  },
  props: {
    value: {type: String},
    property: {type: Object}
  },
  data() {
    return {};
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
    setData(val) {
      this.$emit('setData', val);
    },
    valid() {
      return this.$refs['propertyHandler'].valid();
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
