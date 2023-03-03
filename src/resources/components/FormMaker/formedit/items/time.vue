<template>
  <TsFormDatePicker
    :value="value"
    width="100%"
    transfer
    v-bind="getSetting"
    :readonly="readonly"
    @on-change="updateval"
  ></TsFormDatePicker>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormDatePicker: resolve => require(['@/resources/plugins/TsForm/TsFormDatePicker'], resolve)
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    config: Object,
    value: [String, Number, Array],
    readonly: {
      type: Boolean,
      default: false
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

  methods: {
    updateval(val) {
      this.$emit('change', val);
    }
  },

  filter: {},

  computed: {
    getSetting() {
      let setting = this.config.config;
      let json = this.$utils.deepClone(setting);
      if (setting.styleType) {
        //format的处理
        json.format = setting.showType;
      }

      //type的处理
      if (!setting.type) {
        json.type = 'time';
      }

      //valueType的处理
      if (!setting.valueType) {
        json.valueType = 'format';
      }
      json.width = '100%';
      json.desc = '';
      json.isRequired = false;
      return json;
    }
  },

  watch: {
    value: {
      handler(value) {
        if (this.config.config.valueType == 'timeRange' && !(value instanceof Array)) {
          this.$emit('change', []);
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
/deep/ .tsform-date-readonly {
  opacity: 1;
  cursor: text;
  .tsform-readonly {
    cursor: text;
  }
}
</style>
