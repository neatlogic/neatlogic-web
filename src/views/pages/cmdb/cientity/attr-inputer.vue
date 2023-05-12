<template>
  <div>
    <component
      :is="attrData.type+'attr'"
      ref="attrHandler"
      :disabled="disabled"
      :valueList="valueList"
      :attrData="attrData"
      :attrEntity="attrEntity"
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
import * as handlers from '../ci/attrhandler/input';
export default {
  name: '',
  components: {
    ...handlers
  },
  props: {
    disabled: {type: Boolean, default: false},
    allowBatchAdd: {type: Boolean, default: true},
    attrData: { type: Object },
    valueList: { type: Array },
    attrEntity: {type: Object}
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
      return handler.valid();
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
