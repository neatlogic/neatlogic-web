<template>
  <component
    :is="rendererComponent"
    ref="control"
    :value="$utils.deepClone(value)"
    :config="config"
    :context="context"
    :mode="mode"
    :readonly="mode === 'readonly'"
    :disabled="disabled"
    :isRequired="isRequired"
    :defaultValue="$utils.deepClone(value)"
    :phaseList="config.phaseList"
    @input="update"
    @change="update"
  ></component>
</template>
<script>
import editHandlers from '@/views/pages/autoexec/components/param/view/index.js';
import readonlyHandlers from '@/views/pages/autoexec/components/param/readonly/index.js';
import { editorProps as props } from '../../editor-contract.js';

// 动态下拉参数继续复用支持矩阵数据的自动执行控件。
function resolveRuntimeRenderer(type, mode) {
  const handler = `${type}Handler`;
  if (!editHandlers[handler]) return mode === 'readonly' ? readonlyHandlers.textHandler : editHandlers.defaultInput;
  return mode === 'readonly' ? (readonlyHandlers[handler] || editHandlers[handler]) : editHandlers[handler];
}

export default {
  name: 'RuntimeParam',
  props,
  methods: {
    update(value) {
      if (this.$utils.isSame(value, this.value)) return;
      this.$emit('input', this.$utils.deepClone(value));
      this.$emit('change', this.$utils.deepClone(value));
    },
    getValue() {
      const control = this.$refs.control;
      return control?.getValue ? control.getValue() : this.$utils.deepClone(this.value);
    },
    async valid() {
      const control = this.$refs.control;
      return control?.valid ? await control.valid() : true;
    }
  },
  computed: {
    config() {
      const param = (this.context.runtimeParamList || []).find(param => param.key === this.definition.paramKey) || {};
      const source = param.config || param;
      const config = {
        ...source,
        type: param.type,
        desc: param.description,
        phaseList: (this.context.toolConfig?.combopPhaseList || []).map(phase => ({ text: phase.name, value: phase.name })),
        // 旧控件会向校验列表追加规则，只隔离这个可变数组。
        validateList: [...(source.validateList || [])]
      };
      if (['file', 'node'].includes(param.type)) config.showNumber = 6;
      return config;
    },
    rendererComponent() {
      return resolveRuntimeRenderer(this.definition.type, this.mode);
    }
  }
};
</script>
