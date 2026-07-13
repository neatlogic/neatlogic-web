<template>
  <div v-if="expression && itemMap['ex_' + expression + '_ConditionHandler']">
    <component
      :is="itemMap['ex_' + expression + '_ConditionHandler']"
      :disabled="readonly"
      v-bind="conditionItem.config"
      :value="finalValue"
      @change="changeValue"
    ></component>
  </div>
  <div v-else>
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
    conditionItemData: { type: Object }, //条件数据
    expression: { type: String }, //表达式，某些表达式可能需要特殊的组件
    value: { type: [String, Number, Boolean, Array] }
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
      if (['text', 'number', 'boolean', 'html', 'json'].includes(this.conditionItem.type)) {
        if (Array.isArray(this.value)) {
          return this.value.length > 0 ? this.value[0] : null;
        }
        return this.value;
      } else {
        return this.value;
      }
    },
    usingPlugin() {
      //计算当前条件插件在用什么插件，在插件发生切换时需要清空value
      if (this.expression && this.itemMap['ex_' + this.expression + '_ConditionHandler']) {
        return 'ex_' + this.expression;
      } else {
        return this.conditionItem.type;
      }
    }
  },
  watch: {
    usingPlugin: {
      handler: function(val) {
        //当条件发生切换时，清空value值，避免不同插件对value值不适配
        console.log('change', val);
        this.$set(this.conditionItemData, 'valueList', null);
      },
      deep: true
    }
  }
};
</script>
<style lang="less"></style>
