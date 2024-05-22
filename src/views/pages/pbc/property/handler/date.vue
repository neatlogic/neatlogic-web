<template>
  <div>
    <TsFormDatePicker
      ref="propertyHandler"
      :validateList="property.restraint == 'M'?[{name:'required',message:' '}]:[]"
      :value="value"
      format="yyyy-MM-dd"
      type="date"
      :transfer="true"
      @on-change="setData"
    ></TsFormDatePicker>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormDatePicker: () => import('@/resources/plugins/TsForm/TsFormDatePicker.vue')
  },
  props: {value: {type: String},
    property: { type: Object }},
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
