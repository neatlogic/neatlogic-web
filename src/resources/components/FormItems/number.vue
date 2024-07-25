<template>
  <TsFormInput
    ref="formItem"
    :value="value"
    type="number"
    :readonly="readonly"
    v-bind="getSetting"
    @on-change="updateval"
  ></TsFormInput>
</template>

<script>
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
export default {
  name: '',
  components: {
    TsFormInput
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    config: Object,
    value: {
      type: [String, Number],
      default: null
    },
    readonly: {
      type: Boolean,
      default: false
    },
    isRequired: {
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
    },
    valid() {
      return this.$refs.formItem.valid();
    }
  },

  filter: {},

  computed: {
    getSetting() {
      let setting = this.config.config;
      let json = {};
      if (setting) {
        json.readonlyClass = setting.readonlyClass;
      }
      if (this.isRequired) {
        json.validateList = ['required'];
      }
      return json;
    }
  },

  watch: {}
};
</script>

