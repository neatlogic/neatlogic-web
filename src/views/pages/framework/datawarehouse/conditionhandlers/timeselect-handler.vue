<template>
  <div>
    <TimeSelect
      v-bind="timeSelectConfig" 
      :value="value"
      border="border"
      @change="change"
    ></TimeSelect>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TimeSelect: resolve => require(['@/resources/components/TimeSelect/TimeSelect.vue'], resolve)
  },
  props: {
    value: {type: [Object, Array, String, Number]}
  },
  data() {
    return {timeSelectConfig: {
      //时间选择器的数据（含各种默认配置）
      border: 'border',
      placement: 'bottom-start',
      clearable: true,
      transfer: true,
      width: '100%'
    } };
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
  }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
