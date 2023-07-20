<template>
  <TsFormTree
    ref="formitem"
    :value="value"
    v-bind="getSetting"
    :readonly="readonly"
    transfer
    @change="updateval"
  >
    ></TsFormTree>
</template>

<script>
import TsFormTree from '@/resources/plugins/TsForm/TsFormTree';
export default {
  name: '',
  components: {
    TsFormTree
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    config: Object,
    value: [String, Boolean, Array],
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

  beforeMount() {
    this.val = this.value;
  },

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
      let config = {
        url: setting.url,
        desc: '',
        params: {isActive: 1},
        valueName: setting.valueName || 'uuid',
        textName: setting.textName || 'name',
        childrenKey: setting.childrenKey || 'children',
        validateList: [],
        placeholder: this.config.placeholder,
        clearable: true,
        showPath: true,
        sperateText: '>',
        border: 'border',
        readonlyClass: setting.readonlyClass
      };
      return config;
    }
  },

  watch: {}
};
</script>
<style lang="less" scoped></style>
