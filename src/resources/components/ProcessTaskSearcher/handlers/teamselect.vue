<template>
  <div v-if="!isReadOnly">
    <UserSelect
      ref="searchInputer"
      :multiple="config.isMultiple"
      :transfer="true"
      border="border"
      :groupList="config.initConfig.groupList"
      :value="conditionData && conditionData.valueList"
      :validateList="[{ name: 'required', message: ' ' }]"
      :includeList="config.initConfig.includeList"
      :excludeList="config.initConfig.excludeList"
      @change="change"
    ></UserSelect>
  </div>
  <span v-else>value</span>
</template>
<script>
export default {
  name: '',
  components: {
    UserSelect: resolve => require(['@/resources/components/UserSelect/UserSelect.vue'], resolve)
  },
  props: {
    isReadOnly: { type: Boolean, default: false },
    mode: { type: String, default: 'simple' },
    condition: { type: Object },
    conditionData: { type: Object } //当前组件在工单中心配置中的数据
  },
  data() {
    return { config: this.condition.config };
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
