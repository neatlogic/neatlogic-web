<template>
  <div>
    <component
      :is="handlerComponent"
      v-if="handlerComponent"
      ref="attrHandler"
      :attrData="attrData"
      :valueList="valueList"
      :mode="mode"
      :disabled="disabled"
      @setData="setData"
      @select="selectNewCiEntity($event)"
    ></component>
  </div>
</template>
<script>
import * as coreHandlers from '../ci/attrhandler/search';
import { getAttrHandlerComponentMap } from '../ci/attrhandler/attrhandler-extension.js';

export default {
  name: '',
  props: {
    disabled: { type: Boolean, default: false },
    mode: { type: String, default: 'search' }, //search或condition
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
    // 仅可编辑条件允许继续传递选择事件。
    selectNewCiEntity(value) {
      if (!this.disabled) {
        this.$emit('select', value);
      }
    },
    // 固定过滤条件禁止子控件回传修改。
    setData(value, actualValue) {
      if (this.disabled) {
        return;
      }
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
  computed: {
    handlerComponent() {
      if (!this.attrData || !this.attrData.type) {
        return null;
      }
      return getAttrHandlerComponentMap('search', coreHandlers)[this.attrData.type + 'attr'];
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
