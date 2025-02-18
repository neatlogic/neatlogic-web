<template>
  <div>
    <component
      :is="itemMap[conditionItem.type + 'ConditionHandler']"
      :disabled="readonly"
      v-bind="conditionItem.config"
      :value="finalValue"
      @change="changeValue"
    ></component>
  </div>
</template>
<script>
import * as handlers from '@/resources/components/Condition/components/index.js';

export default {
  name: '',
  components: {
    ...handlers
  },
  props: {
    readonly: { type: Boolean, default: false },
    conditionItem: { type: Object },
    value: { type: [String, Array] }
  },
  data() {
    return {
      itemMap: handlers
    };
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
    changeValue() {
      this.$emit('change', ...arguments);
    }
  },
  filter: {},
  computed: {
    finalValue() {
      if (['text', 'number'].includes(this.conditionItem.type)) {
        return this.value && this.value.length > 0 && this.value[0];
      } else {
        return this.value;
      }
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
