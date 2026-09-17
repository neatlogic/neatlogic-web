<template>
  <div>
    <TsFormDatePicker
      ref="handler"
      :disabled="disabled"
      border="border"
      :value="value"
      :type="type"
      :format="format"
      :transfer="true"
      @change="setData"
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
    disabled: { type: Boolean, default: false },
    propConfig: {type: Object},
    attrData: {type: Object},
    valueList: {type: Array}
  },
  data() {
    return {
      type: 'datetime',
      format: 'yyyy-MM-dd'
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init() {
      if (this.attrData) {
        this.type = this.attrData.config.type;
        this.format = this.attrData.config.format;
      }
    },
    // 禁用状态下不修改或回传固定条件。
    setData(val) {
      if (this.disabled) {
        return;
      }
      this.$emit('setData', [val]);
      this.$emit('setValue', [val]);
    }
  },
  filter: {},
  computed: {
    value: function() {
      if (this.valueList && this.valueList.length > 0) {
        return this.valueList[0];
      } else {
        if (this.propConfig) {
          return this.propConfig.value;
        } else {
          return '';
        }
      }
    }},
  watch: {
    propConfig: {
      handler: function(val) {
        if (val) {
          this.init();
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less">
</style>
