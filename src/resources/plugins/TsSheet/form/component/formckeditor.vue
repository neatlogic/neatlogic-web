<template>
  <TsCkeditor
    ref="formitem"
    :value="actualValue"
    :readonly="readonly"
    :disabled="disabled"
    :readonlyTextIsHighlight="readonlyTextIsHighlight"
    @ready="$emit('resize')"
    @change="
      val => {
        setValue(val);
      }
    "
  ></TsCkeditor>
</template>
<script>
import base from './base.vue';
import validmixin from './common/validate-mixin.js';
import TsCkeditor from '@/resources/plugins/TsCkeditor/TsCkeditor.vue';
export default {
  name: '',
  components: {
    TsCkeditor
  },
  extends: base,
  mixins: [validmixin],
  props: {
    readonly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
    };
  },
  beforeCreate() {},
  created() {
  },
  beforeMount() {},
  mounted() {
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
  },
  filter: {},
  computed: {
    actualValue() {
      if (this.value) {
        if (this.value instanceof Array && this.value.length > 0) {
          return this.value[0];
        } else {
          return this.value;
        }
      }
      return null;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped></style>
