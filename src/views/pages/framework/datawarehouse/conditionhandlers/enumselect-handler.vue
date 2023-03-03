<template>
  <div>
    <TsFormSelect
      :value="value"
      :isMultiple="config.isMultiple"
      transfer
      url="/api/rest/universal/enum/get"
      :params="{enumClass: config.enum}"
      border="border"
      @on-change="change"
    ></TsFormSelect>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  props: {
    config: {type: Object},
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
  methods: {
    change(val) {
      this.$emit('change', val);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
