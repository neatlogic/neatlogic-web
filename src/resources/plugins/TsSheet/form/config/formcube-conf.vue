<template>
  <div>
    <TsFormItem :label="$t('page.multipleselection')" labelPosition="left" contentAlign="right">
      <TsFormSwitch
        v-model="config.isMultiple"
        :trueValue="true"
        :falseValue="false"
        :disabled="disabled"
        @on-change="val => {
          changeMultiple(val);
        }"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem :label="$t('page.category')" labelPosition="top" required>
      <div class="radius-sm padding-md" :class="validClass('typeList')">
        <StaticDataEditor v-model="config.typeList" :disabled="disabled"></StaticDataEditor>
      </div>
    </TsFormItem>
    <TsFormItem :label="$t('page.option')" labelPosition="top" required>
      <div class="radius-sm padding-md" :class="validClass('optionList')">
        <StaticDataEditor v-model="config.optionList" :disabled="disabled"></StaticDataEditor>
      </div>
    </TsFormItem>
  </div>
</template>
<script>
import base from './base-config.vue';
export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    StaticDataEditor: resolve => require(['./common/static-data-editor.vue'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve)
  },
  extends: base,
  props: {},
  data() {
    return {
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
    changeMultiple(val) {
      if (!val && this.config.defaultValue instanceof Array && this.config.defaultValue.length > 0) {
        this.setConfig('defaultValue', [this.config.defaultValue[0]]);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
