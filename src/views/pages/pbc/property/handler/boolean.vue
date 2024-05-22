<template>
  <div>
    <TsFormRadio
      ref="propertyHandler"
      :validateList="property.restraint == 'M'?[{name:'required',message:' '}]:[]"
      :value="value"
      :dataList="dataList"
      @on-change="setData"
    ></TsFormRadio>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio.vue')
  },
  props: {
    value: {type: [Boolean, String]},
    property: { type: Object }
  },
  data() {
    return {
      dataList: [{value: 'True', text: 'True'}, {value: 'False', text: 'False'}]
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
</style>'
