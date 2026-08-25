<template>
  <div>
    <component
      :is="handlerComponent"
      v-if="handlerComponent"
      ref="attrHandler"
      :disabled="disabled"
      :valueList="valueList"
      :attrData="attrData"
      :attrEntity="attrEntity"
      :ciEntityId="ciEntityId"
      :allowBatchAdd="allowBatchAdd"
      @setData="setData"
      @new="addNewCiEntity"
      @edit="editNewCiEntity($event)"
      @delete="deleteNewCiEntity($event)"
      @select="selectNewCiEntity($event)"
    ></component>
  </div>
</template>
<script>
import * as coreHandlers from '@/views/pages/cmdb/ci/attrhandler/input/index.js';
import { getAttrHandlerComponentMap } from '@/views/pages/cmdb/ci/attrhandler/attrhandler-extension.js';

export default {
  name: '',
  props: {
    disabled: { type: Boolean, default: false },
    allowBatchAdd: { type: Boolean, default: true },
    attrData: { type: Object },
    valueList: { type: Array },
    attrEntity: { type: Object },
    ciEntityId: { type: [String, Number] }
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
    addNewCiEntity() {
      this.$emit('new');
    },
    editNewCiEntity(uuid) {
      this.$emit('edit', uuid);
    },
    deleteNewCiEntity(item) {
      this.$emit('delete', item);
    },
    selectNewCiEntity(item) {
      this.$emit('select', item);
    },
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
    },
    valid() {
      const handler = this.$refs.attrHandler;
      return !handler || !handler.valid || handler.valid();
    }
  },
  filter: {},
  computed: {
    handlerComponent() {
      if (!this.attrData || !this.attrData.type) {
        return null;
      }
      return getAttrHandlerComponentMap('input', coreHandlers)[this.attrData.type + 'attr'];
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
