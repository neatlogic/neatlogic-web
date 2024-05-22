<template>
  <div v-if="config">
    <TsFormDatePicker
      ref="searchInputer"
      v-bind="config"
      border="border"
      type="time"
      :value="conditionData && conditionData.valueList && conditionData.valueList[0]"
      :validateList="[{ name: 'required', message: ' ' }]"
      transfer
      @on-change="change"
    ></TsFormDatePicker>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormDatePicker: () => import('@/resources/plugins/TsForm/TsFormDatePicker')
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
  mounted() {},
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
      let text = '';
      if (val) {
        if (val instanceof Array) {
          val.forEach(d => {
            if (text) {
              text += '、';
            }
            text += d;
          });
        } else {
          text += val;
        }
      }
      this.$emit('change', val, text);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
