<template>
  <div v-if="!isReadOnly">
    <div class="grid">
      <div>
        <UserSelect
          ref="searchInputer"
          :multiple="config.isMultiple"
          :transfer="true"
          border="border"
          :groupList="config.initConfig?config.initConfig.groupList:config.groupList"
          :value="conditionData && conditionData.valueList"
          :validateList="[{ name: 'required', message: ' ' }]"
          :includeList="config.initConfig?config.initConfig.includeList:config.includeList"
          :excludeList="config.initConfig?config.initConfig.excludeList:config.excludeList"
          @change="change"
        ></UserSelect>
      </div>
      <div>
        <TsFormSwitch
          :value="isFilterTeamRole"
          :trueValue="true"
          :falseValue="false"
          @on-change="toggleTeamRole"
        ></TsFormSwitch>
      </div>
      <div><span class="text-grey">排除分组角色</span></div>
    </div>
  </div>
  <span v-else>value</span>
</template>
<script>
export default {
  name: '',
  components: {
    UserSelect: () => import('@/resources/components/UserSelect/UserSelect.vue'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
  },
  props: {
    isReadOnly: { type: Boolean, default: false },
    mode: { type: String, default: 'simple' },
    condition: { type: Object },
    conditionData: { type: Object } //当前组件在工单中心配置中的数据
  },
  data() {
    return {
      config: this.condition.config,
      isFilterTeamRole: false
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
    },
    toggleTeamRole() {

    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: auto 20px 100px;
  grid-gap: 10px;
}</style>
