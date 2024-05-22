<template>
  <TsFormSelect
    ref="formitem"
    :value="actualValue"
    v-bind="protocolConfig"
    :readonly="readonly"
    :disabled="disabled"
    :validateList="validateList"
    :readonlyTextIsHighlight="readonlyTextIsHighlight"
    @change="
      val => {
        setValue(val);
      }
    "
  ></TsFormSelect>
</template>
<script>
import base from '@/resources/plugins/TsSheet/form/component/base.vue';
import validmixin from '@/resources/plugins/TsSheet/form/component/common/validate-mixin.js';

export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  extends: base,
  mixins: [validmixin],
  props: {
    readonly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
      protocolConfig: {
        dynamicUrl: '/api/rest/resourcecenter/account/protocol/search',
        multiple: false,
        rootName: 'tbodyList',
        search: true,
        clearable: true,
        transfer: true,
        border: 'border',
        dealDataByUrl: this.$utils.getProtocolDataList
      }
    };
  },
  beforeCreate() {},
  created() {
  },
  beforeMount() {},
  mounted() {},
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
