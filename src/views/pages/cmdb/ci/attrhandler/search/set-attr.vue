<template>
  <div>
    <TsFormCheckbox
      ref="handler"
      :disabled="disabled"
      :value="value"
      :dataList="dataList"
      @change="setData"
    ></TsFormCheckbox>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormCheckbox: () => import('@/resources/plugins/TsForm/TsFormCheckbox')
  },
  props: {
    disabled: { type: Boolean, default: false },
    attrData: { type: Object },
    valueList: { type: Array }
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
    // 禁用状态下不修改或回传固定条件。
    setData(val) {
      if (this.disabled) {
        return;
      }
      this.$emit('setData', val);
      this.$emit('setValue', val);
    },
    valid() {
      //验证数据合法性
      const handler = this.$refs['handler'];
      return handler.valid();
    }
  },
  filter: {},
  computed: {
    dataList: function() {
      const dataList = [];
      if (this.attrData.config && this.attrData.config.members) {
        this.attrData.config.members.forEach(element => {
          if (element && element.trim()) {
            dataList.push({ text: element.trim(), value: element.trim() });
          }
        });
      }
      return dataList;
    },
    value: function() {
      if (this.valueList && this.valueList.length > 0) {
        return this.valueList;
      }
      return '';
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
