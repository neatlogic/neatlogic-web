<template>
  <div>
    <TsFormItem label="多选" labelPosition="left" contentAlign="right">
      <TsFormSwitch
        v-model="config.isMultiple"
        :trueValue="true"
        :falseValue="false"
        :disabled="disabled"
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem label="类别" labelPosition="top" required>
      <div class="radius-sm padding-md" :class="validClass('typeList')">
        <StaticDataEditor v-model="config.typeList" :disabled="disabled"></StaticDataEditor>
      </div>
    </TsFormItem>
    <TsFormItem label="选项" labelPosition="top" required>
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
  methods: {},
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
