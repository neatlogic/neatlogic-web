<template>
  <div>
    <component
      :is="attrData.type+'attr'"
      ref="attrHandler"
      :attrData="attrData"
      :valueList="valueList"
      @setData="setData"
    ></component>
  </div>
</template>
<script>
import Handlers from './handlerIndex.js';
export default {
  name: '',
  components: {
    ...Handlers
  },
  props: {
    attrData: { type: Object },
    valueList: {type: Array}
  },
  data() {
    return {};
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {
  },
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    setData(value, actualValue) {
      if (typeof value == 'undefined' || value == null) {
        value = [];
      }

      if (typeof actualValue == 'undefined' || actualValue == null) {
        actualValue = value;
      }

      if (Array.isArray(value)) {
        this.$emit('setData', value, actualValue);
      } else {
        this.$emit('setData', [value], [actualValue]);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
  }
};
</script>
<style lang="less">
</style>
