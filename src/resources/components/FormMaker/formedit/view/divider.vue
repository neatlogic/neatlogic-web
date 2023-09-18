<template>
  <div>
    <div class="divider" :style="dividerWidtgh"></div>
    <div v-if="setting.config.desc" class="component-tips tsfont-info-o">{{ setting.config.desc }}</div>
  </div>
</template>

<script>
export default {
  name: 'Formdivider',
  components: {},
  props: {
    setting: Object,
    formView: {
      //是否通过form-view页面进行初始化，如果不是则需要把defaultValue值给 value
      type: Boolean,
      default: true
    },
    componentList: {
      //同一个表单的所有组件,主要用来做数据引用
      type: Array,
      default: () => {
        return [];
      }
    }
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

  methods: {},

  filter: {},

  computed: {
    dividerWidtgh() {
      let value = this.setting.config;
      this.$set(value, 'dividerWidth', Math.max(value.dividerWidth, 1));
      let style = `width:${value.width};
      border-top:${value.dividerWidth}px ${value.dividerType} ${value.dividerColor};`;
      return style;
    }
  },

  watch: {}
};
</script>
<style lang="less" scoped></style>
