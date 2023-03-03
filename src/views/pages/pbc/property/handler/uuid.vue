<template>
  <div>
    <TsFormInput
      ref="propertyHandler"
      :value="value"
      placeholder="系统自动生成唯一标识"
      :disabled="true"
    ></TsFormInput>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormInput: resolve =>
      require(['@/resources/plugins/TsForm/TsFormInput.vue'], resolve)
  },
  props: {value: {type: String}, property: { type: Object }},
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
  methods: { setData() {
      
  },
  valid() {
    return this.$refs['propertyHandler'].valid();
  } },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
