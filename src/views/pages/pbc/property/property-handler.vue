<template>
  <div>
    <component
      :is="property.inputType+'handler'"
      ref="propertyHandler"
      :value="value"
      :property="property"
      @setData="setData"
    ></component>
  </div>
</template>
<script>
import * as handlers from './handler/index.js';

export default {
  name: '',
  components: {
    ...handlers
  },
  props: {
    index: {type: Number}, //如果是complex数据，需要记录数组索引
    property: {type: Object},
    value: {type: [String, Object, Number, Boolean], default: null}
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
    valid() {
      return this.$refs['propertyHandler'].valid();
    },
    setData(value) {
      this.$emit('setData', this.property, this.index, value);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
