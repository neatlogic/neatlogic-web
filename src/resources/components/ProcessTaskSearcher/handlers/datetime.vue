<template>
  <div v-if="config">
    <TimeSelect
      ref="searchInputer"
      :value="conditionData && conditionData.valueList && conditionData.valueList[0]"
      :transfer="true"
      :validateList="[{ name: 'required', message: ' ' }]"
      @change="change"
    ></TimeSelect>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TimeSelect: () => import('@/resources/components/TimeSelect/TimeSelect.vue')
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
    change(val, option) {
      let text = '';
      if (option) {
        if (option instanceof Array) {
          option.forEach(d => {
            if (text) {
              text += '、';
            }
            text += d.text;
          });
        } else {
          text += option.text;
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
<style lang="less"></style>
