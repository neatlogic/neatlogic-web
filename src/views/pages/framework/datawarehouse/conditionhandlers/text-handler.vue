<template>
  <div>
    <TsFormInput
      border="border"
      :value="value"
      @on-change="change"
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
    value: {type: [Object, Array, String, Number]}
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
  methods: { change(val) {
    this.$emit('change', val);
  }},
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
