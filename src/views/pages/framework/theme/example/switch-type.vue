<template>
  <div>
    <TsFormSwitch v-model="config.value" v-bind="config" :class="type"></TsFormSwitch>
  </div>
</template>
<script>
import TsFormSwitch from '@/resources/plugins/TsForm/TsFormSwitch';
export default {
  name: '',
  components: {
    TsFormSwitch
  },
  props: {item: Object, type: String},
  data() {
    return {
      config: {
        value: 1,
        examplesType: 'switch',
        falseValue: 0,
        trueValue: 1,
        trueText: this.$t('page.isactived'),
        falseText: this.$t('page.ban')
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.init(this.item.value);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init(val) {
      if (this.type === 'light') {
        document.body.style.setProperty('--light-switch', val);
      } else {
        document.body.style.setProperty('--dark-switch', val);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
    'item.value': {
      handler(val) {
        this.init(val);
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.dark{
  /deep/.ivu-switch.ivu-switch-checked{
    background-color: var(--dark-switch, #96BEF8);
    border-color: var(--dark-switch, #96BEF8);
  }
}
.light{
  /deep/.ivu-switch.ivu-switch-checked{
     background-color: var(--light-switch, #0D4E5D);
     border-color: var(--light-switch, #0D4E5D);
  }
}
</style>
