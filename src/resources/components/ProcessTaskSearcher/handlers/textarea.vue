<template>
  <div v-if="config">
    <div v-if="mode == 'simple'">
      <TsFormInput
        ref="searchInputer"
        :value="conditionData && conditionData.valueList && conditionData.valueList[0]"
        type="textarea"
        border="border"
        :validateList="[{ name: 'required', message: ' ' }]"
        @on-change="change"
      ></TsFormInput>
    </div>
    <div v-else>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  props: {
    mode: {
      type: String,
      default: 'simple'
    },
    condition: { type: Object },
    conditionData: {type: Object}//当前组件在工单中心配置中的数据
  },
  data() {
    return { 
      config: this.condition.config
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
    valid() {
      if (this.$refs['searchInputer']) {
        return this.$refs['searchInputer'].valid();
      }
      return true; 
    },
    change(val) {
      this.$emit('change', val, val);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
