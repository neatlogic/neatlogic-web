<template>
  <TsDialog
    type="modal"
    width="medium"
    :isShow="true"
    :maskClose="false"
    :okBtnDisable="disabled || !!pending || !!resolved.error"
    @on-ok="saveSchema"
    @on-close="closeDialog"
  >
    <template v-slot:header><span>元素类型设置：{{ pattern.name }}</span></template>
    <template v-slot>
      <div v-if="resolved.error" class="mb-sm">
        <div class="text-error">{{ resolved.error }}，请重新配置。</div>
        <span class="text-href" :class="{ disable: disabled }" @click="requestReset">按当前规范重新配置</span>
      </div>
      <SchemaEditor
        v-if="schemaDraft"
        :key="schemaEditorKey"
        :schema="schemaDraft"
        :declared="declared"
        :initialSteps="schemaSteps"
        :disabled="disabled || !!pending || !!resolved.error"
        :path="pattern.name"
        @change="changeSchemaDraft"
      ></SchemaEditor>
      <div v-if="schemaError" class="text-error mt-sm">{{ schemaError }}</div>
      <!-- 清理确认仍在当前弹窗内进行，取消后恢复原结构和值。 -->
      <div v-if="pending" class="border-warning padding mt-sm">
        <div class="text-warning">{{ pending.message }}</div>
        <div class="action-group mt-xs">
          <span class="action-item text-href" :class="{ disable: disabled }" @click="confirmPending">清空受影响的值并应用</span>
          <span class="action-item text-href" @click="cancelPending">取消变更</span>
        </div>
      </div>
    </template>
  </TsDialog>
</template>
<script>
import SchemaEditor from './schema-editor.vue';
import SchemaEditorBase from './schema-editor-base.js';
export default {
  name: 'SchemaDialog',
  components: { SchemaEditor },
  extends: SchemaEditorBase,
  props: {
    initialSteps: { type: Array, default: () => [] }
  },
  created() {
    // 打开时复制完整结构，当前子级路径只控制视图，不能修改来源定义。
    this.beginSchemaDraft(this.initialSteps);
  },
  methods: {
    finishSchema() { this.$emit('close'); },
    closeDialog() {
      this.cancelSchemaDraft();
      this.$emit('close');
    }
  }
};
</script>
