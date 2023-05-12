<template>
  <div>
    <Rate
      :value="actualValue"
      :disabled="disabled || readonly"
      :count="config.count"
      :show-text="config.showText"
      @on-change="
        val => {
          setValue(val);
        }
      "
    />
  </div>
</template>
<script>
import base from './base.vue';
import validmixin from './common/validate-mixin.js';
export default {
  name: '',
  components: {},
  extends: base,
  mixins: [validmixin],
  props: {},
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
    actualValue() {
      if (this.value) {
        if (this.value instanceof Array && this.value.length > 0) {
          return Number(this.value[0]);
        } else {
          return Number(this.value);
        }
      }
      return null;
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
