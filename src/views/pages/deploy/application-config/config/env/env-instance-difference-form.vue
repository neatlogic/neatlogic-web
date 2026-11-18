<template>
  <div>
    <TsForm
      ref="form"
      v-model="formValue"
      :item-list="[instanceField]"
      class="pt-nm pb-nm"
    ></TsForm>
    <ParameterEditor
      ref="editor"
      :initialRows="initialRows"
      :variables="variables"
      :inheritPassword="inheritPassword"
      :allowUnsetText="allowUnsetText"
    ></ParameterEditor>
  </div>
</template>
<script>
import ParameterEditor from './parameter-editor.vue';
export default {
  components: {
    ParameterEditor,
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {
    instanceId: [String, Number],
    instanceField: {type: Object, required: true},
    variables: {type: Array, required: true},
    initialRows: {type: Array, required: true},
    showPassword: {type: Boolean, default: false},
    inheritPassword: Boolean,
    allowUnsetText: Boolean
  },
  data() { return {formValue: {instanceId: this.instanceId}}; },
  methods: {
    // 实例选择在两种编辑模式中保持不变，参数校验共用环境定义。
    read() {
      if (!this.$refs.form.valid()) return null;
      const keyValueList = this.$refs.editor.read();
      return keyValueList ? {instanceId: this.formValue.instanceId, keyValueList} : null;
    },
    // 提交浮卡可直接聚焦失效的变量引用，不依赖表单内部组件结构。
    focusVariable(index) { this.$refs.editor.focusRow(index); }
  }
};
</script>
