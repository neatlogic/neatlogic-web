<template>
  <div>
    <TsFormInput
      ref="propertyHandler"
      :validateList="property.restraint == 'M'?[{name:'required',message:' '}]:[]"
      :value="value"
      @on-change="setData"
    ></TsFormInput>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput.vue'], resolve)
  },
  props: { 
    value: { type: String }, 
    property: { type: Object } },
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
<style lang="less"></style>
