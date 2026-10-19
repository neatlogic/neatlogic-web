<template>
  <div>
    <TsFormItem v-if="grouped || !$utils.isEmpty(context.preCondition)" :label="$t('term.autoexec.precondition')">
      <PreconditionDetail
        :defaultValue="$utils.deepClone(context.preCondition)"
        :canEdit="mode === 'service-edit' && !disabled"
        @changeValue="updatePrecondition"
      ></PreconditionDetail>
    </TsFormItem>
    <ServiceParamField
      ref="field"
      :value="value"
      :definition="definition"
      :context="context"
      :mode="mode"
      :disabled="disabled"
      :getEditor="getTargetControl"
      @input="update"
    >
      <template v-slot:editor="editor">
        <AddTarget
          :id="context.combopId"
          ref="control"
          :value="$utils.deepClone(editor.value || {})"
          :filterSearchValue="$utils.deepClone(editor.value || {})"
          :canEdit="editor.mode !== 'readonly' && !editor.disabled"
          :type="context.executeConfig.whenToSpecify || 'runtime'"
          :executeConfig="executeConfig"
          :runtimeParamList="context.runtimeParamList"
          :needBorder="context.needExecuteUser || context.needProtocol"
          :isRequired="editor.isRequired"
          :preCondition="context.preCondition"
          @on-ok="editor.update(getTargetControl().getValue())"
        ></AddTarget>
      </template>
    </ServiceParamField>
  </div>
</template>
<script>
import AddTarget from '@/views/pages/autoexec/detail/runnerDetail/add-target.vue';
import PreconditionDetail from '@/views/pages/autoexec/detail/actionDetail/precondition-detail.vue';
import TsFormItem from '@/resources/plugins/TsForm/TsFormItem';
import ServiceParamField from '../../service-param-field.vue';

export default {
  name: 'ExecuteTarget',
  components: { AddTarget, PreconditionDetail, TsFormItem, ServiceParamField },
  props: {
    value: { type: Object, required: true },
    definition: { type: Object, required: true },
    context: { type: Object, required: true },
    mode: { type: String, default: 'service-edit' },
    disabled: Boolean,
    grouped: { type: Boolean, default: true }
  },
  methods: {
    update(value) {
      this.$emit('input', this.$utils.deepClone(value));
      this.$emit('change', this.$utils.deepClone(value));
    },
    updatePrecondition(value) {
      this.$emit('precondition', this.$utils.deepClone(value));
    },
    getTargetControl() {
      return this.$refs.control;
    },
    getValue() {
      return this.$refs.field ? this.$refs.field.getValue() : this.$utils.deepClone(this.value);
    },
    async valid() {
      return !this.$refs.field || (await this.$refs.field.valid());
    }
  },
  computed: {
    executeConfig() {
      const { executeUser, protocolId } = this.context.executeConfig;
      return { executeUser, protocolId };
    }
  }
};
</script>
