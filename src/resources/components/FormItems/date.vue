<template>
  <TsFormDatePicker
    :value="value"
    :readonly="readonly"
    transfer
    v-bind="getSetting"
    width="100%"
    @on-change="updateval"
  ></TsFormDatePicker>
</template>

<script>
export default {
  name: '',
  components: {
    TsFormDatePicker: () => import('@/resources/plugins/TsForm/TsFormDatePicker')
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
        let styleType = this.config.config.styleType || '-';
        json.format = this.config.config.format.replace(/\-/g, styleType);
      }

      //type的处理
      if (!setting.type && setting.format && setting.format.indexOf(' HH') >= 0) {
        json.type = 'datetime';
      } else if (!setting.type && setting.format) {
        setting.format == 'yyyy' && (json.type = 'year');
        setting.format == 'yyyy-MM' && (json.type = 'month');
        setting.format == 'yyyy-MM-dd' && (json.type = 'date');
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
        if (this.config.config.valueType && this.config.config.valueType.indexOf('Range') >= 0 && !(value instanceof Array)) {
          this.$emit('change', []);
        }
      }
    },
    immediate: true
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
