<template>
  <TsDialog v-bind="dialogConfig" @on-ok="saveSetting" @on-close="$emit('close')">
    <template v-slot>
      <div class="padding">
        <div class="text-tip pb-md">当前设置为全局配置，会作用于该维度下所有配置基线草稿生成。</div>
        <TsFormSelect
          ref="modelSelect"
          v-model="formData.modelId"
          label="大模型"
          transfer
          border="border"
          :dataList="modelList"
          valueName="value"
          textName="text"
          :validateList="validateList"
          :clearable="false"
        ></TsFormSelect>
        <div v-if="currentModelText" class="text-tip margin-top">{{ currentModelText }}</div>
        <TsFormInput
          ref="promptInput"
          v-model="formData.prompt"
          class="margin-top"
          label="Prompt"
          type="textarea"
          :rows="12"
          border="border"
        ></TsFormInput>
        <div class="text-tip margin-top">{{ promptTip }}</div>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  props: {
    schemaName: {
      type: String,
      default: 'os'
    }
  },
  data() {
    return {
      loadingShow: false,
      modelList: [],
      formData: {
        modelId: null,
        prompt: ''
      },
      currentModel: null,
      currentSetting: null,
      defaultPrompt: '',
      validateList: ['required']
    };
  },
  mounted() {
    this.getSetting();
  },
  computed: {
    dialogConfig() {
      return {
        type: 'modal',
        title: '大模型设置',
        isShow: true,
        width: 'medium',
        loading: this.loadingShow
      };
    },
    currentModelText() {
      if (!this.currentModel) {
        return '';
      }
      let modelName = this.currentModel.modelName ? ` (${this.currentModel.modelName})` : '';
      return `当前已选择：${this.currentModel.name || this.currentModel.modelName || ''}${modelName}`;
    },
    promptTip() {
      if (!this.defaultPrompt) {
        return '';
      }
      if (this.currentSetting && this.currentSetting.prompt) {
        return '当前使用自定义 Prompt。清空或恢复为默认文案后保存，将回退为代码默认 Prompt。';
      }
      return '当前未单独设置 Prompt，已回显代码默认 Prompt。';
    }
  },
  methods: {
    getSetting() {
      this.loadingShow = true;
      this.$api.inspect.applicationInspect.getConfigAiSetting({
        schemaName: this.schemaName
      }).then(res => {
        if (res && res.Status === 'OK') {
          let modelList = res.Return.modelList || [];
          this.modelList = modelList.map(item => {
            let text = item.text || item.modelName || item.value;
            if (item.modelName && item.modelName !== text) {
              text = `${text} (${item.modelName})`;
            }
            return {
              value: item.value,
              text: text
            };
          });
          let setting = res.Return.setting || {};
          this.currentSetting = setting;
          this.defaultPrompt = res.Return.defaultPrompt || '';
          this.currentModel = res.Return.model || null;
          this.formData.modelId = setting.modelId || (this.modelList.length > 0 ? this.modelList[0].value : null);
          this.formData.prompt = setting.prompt || res.Return.effectivePrompt || this.defaultPrompt;
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    saveSetting() {
      if (this.$refs.modelSelect && !this.$refs.modelSelect.valid()) {
        return;
      }
      this.loadingShow = true;
      this.$api.inspect.applicationInspect.saveConfigAiSetting({
        schemaName: this.schemaName,
        modelId: this.formData.modelId,
        prompt: this.formData.prompt
      }).then(res => {
        if (res && res.Status === 'OK') {
          this.$Message.success('大模型设置已保存');
          this.$emit('refresh');
          this.$emit('close');
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    }
  }
};
</script>
