<template>
  <TsDialog
    type="modal"
    width="medium"
    :isShow="true"
    :title="$t(isEdit ? 'dialog.title.edittarget' : 'dialog.title.addtarget', {target:$t('page.param')})"
    :okText="$t('page.save')"
    :loading="busy"
    :okBtnDisable="busy"
    @on-ok="save"
    @on-close="$emit('close',false)"
  >
    <ParameterEditor
      ref="editor"
      :initialRows="tableData.tbodyList || []"
      :allowUnsetText="allowUnsetText"
    ></ParameterEditor>
  </TsDialog>
</template>
<script>
import ParameterEditor from './parameter-editor.vue';
export default {
  components: {ParameterEditor},
  props: {
    isEdit: Boolean, busy: Boolean, allowUnsetText: Boolean,
    params: {type: Object, default: () => ({})},
    tableData: {type: Object, default: () => ({tbodyList: []})}
  },
  methods: {
    // 表单和文本模式只返回统一的参数数组，保存时机由所属页面决定。
    save() {
      if (this.busy) return;
      const keyValueList = this.$refs.editor.read();
      if (keyValueList) this.$emit('save', {...this.params, keyValueList});
    }
  }
};
</script>
