<template>
  <TsFormTree
    ref="formitem"
    :value="actualValue"
    v-bind="getConfig"
    :readonly="readonly"
    :disabled="disabled"
    :readonlyTextIsHighlight="readonlyTextIsHighlight"
    transfer
    @change="
      val => {
        setValue(val);
      }
    "
  ></TsFormTree>
</template>
<script>
import base from './base.vue';
import validmixin from './common/validate-mixin.js';
import TsFormTree from '@/resources/plugins/TsForm/TsFormTree';
export default {
  name: '',
  components: {
    TsFormTree
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
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    validConfig() {
      const errorList = this.validDataForAllItem();
      if (!this.config.url) {
        errorList.push({ field: 'url', error: this.$t('term.framework.treeselect') + '：' + this.$t('form.validate.required', {'target': this.$t('page.datasource')}) });
      }
      return errorList;
    }
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
    },
    getConfig() {
      let setting = this.config.config ? this.config.config : {};
      let config = {
        url: setting.url,
        desc: '',
        params: {isActive: 1},
        valueName: setting.valueName || 'uuid',
        textName: setting.textName || 'name',
        childrenKey: setting.childrenKey || 'children',
        validateList: [],
        placeholder: this.config.placeholder,
        clearable: true,
        showPath: true,
        sperateText: '>',
        border: 'border'
      };
      return config;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped></style>
