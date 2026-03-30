<template>
  <TsDialog v-bind="dialogConfig" @on-ok="saveSetting" @on-close="$emit('close')">
    <template v-slot>
      <div class="padding">
        <div class="text-tip pb-md">当前设置为全局配置，会作用于该维度下所有配置基线草稿生成和自动基线比对。</div>
        <TsForm
          ref="form"
          v-model="formData"
          :item-list="formConfig"
          label-position="top"
        ></TsForm>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  data() {
    return {
      loadingShow: false,
      modelList: [],
      viewOptionList: [],
      formData: {
        viewName: '',
        modelId: null,
        prompt: ''
      },
      currentModel: null,
      currentSetting: null,
      defaultViewName: '',
      defaultPrompt: '',
      validateList: ['required']
    };
  },
  mounted() {
    this.getSetting();
  },
  methods: {
    getSetting() {
      this.loadingShow = true;
      this.$api.inspect.applicationInspect.getConfigAiSetting().then(res => {
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
          this.viewOptionList = res.Return.viewOptionList || [];
          this.defaultViewName = res.Return.defaultViewName || '';
          this.defaultPrompt = res.Return.defaultPrompt || '';
          this.currentModel = res.Return.model || null;
          this.formData.viewName = setting.viewName || res.Return.effectiveViewName || this.defaultViewName || (this.viewOptionList[0] ? this.viewOptionList[0].value : '');
          this.formData.modelId = setting.modelId || (this.modelList.length > 0 ? this.modelList[0].value : null);
          this.formData.prompt = setting.prompt || res.Return.effectivePrompt || this.defaultPrompt;
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    saveSetting() {
      if (this.$refs.form && !this.$refs.form.valid()) {
        return;
      }
      this.loadingShow = true;
      this.$api.inspect.applicationInspect.saveConfigAiSetting({
        viewName: this.formData.viewName,
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
  },
  computed: {
    formConfig() {
      return {
        viewName: {
          type: 'select',
          label: '操作系统入口',
          transfer: true,
          border: 'border',
          valueName: 'value',
          textName: 'text',
          clearable: false,
          validateList: this.validateList,
          dataList: this.viewOptionList,
          desc: this.viewTip
        },
        modelId: {
          type: 'select',
          label: '大模型',
          transfer: true,
          border: 'border',
          valueName: 'value',
          textName: 'text',
          clearable: false,
          validateList: this.validateList,
          dataList: this.modelList,
          desc: this.currentModelText
        },
        prompt: {
          type: 'textarea',
          label: 'Prompt',
          border: 'border',
          rows: 12,
          desc: this.promptTip
        }
      };
    },
    dialogConfig() {
      return {
        type: 'modal',
        title: '配置设置',
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
    viewTip() {
      if (!this.defaultViewName) {
        return '';
      }
      if (this.currentSetting && this.currentSetting.viewName) {
        return '当前使用自定义操作系统入口。恢复为默认入口后保存，将回退为应用清单默认第一项。';
      }
      return '当前未单独设置操作系统入口，已回显应用清单默认第一项。';
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
  }
};
</script>
