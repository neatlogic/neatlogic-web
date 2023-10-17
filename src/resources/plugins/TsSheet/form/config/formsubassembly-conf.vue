<template>
  <div>
    <TsFormItem :label="$t('term.pbc.adddata')" labelPosition="left" contentAlign="right">
      <TsFormSwitch
        v-model="config.isCanAdd"
        :trueValue="true"
        :falseValue="false"
        :disabled="disabled"
      ></TsFormSwitch>
    </TsFormItem>
    <!-- 场景编辑暂不支持子组件编辑 -->
    <Button
      v-if="!formItem.hasOwnProperty('inherit')"
      :disabled="!!formItem.inherit || disabled"
      type="primary"
      style="width:100%"
      ghost
      class="mt-nm"
      @click="editForm()"
    >
      <span class="tsfont-edit">
        编辑组件
      </span>
    </Button>
  </div>
</template>
<script>
import base from './base-config.vue';

export default {
  name: '',
  components: {
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve)
  },
  extends: base,
  props: {},
  data() {
    return {
     
    };
  },
  beforeCreate() {},
  async created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    editForm() {
      if (this.disabled) {
        return;
      }
      this.$emit('editSubForm');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
