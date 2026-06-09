<template>
  <TsDialog v-bind="dialogConfig" @on-close="close">
    <template v-slot:header>
      <div>{{ $t('page.setapplicationcredentials') }}设置应用凭证</div>
    </template>
    <template v-slot>
      <TsForm ref="form" :item-list="formConfig" :labelWidth="120"></TsForm>
    </template>
    <template v-slot:footer>
      <Button @click="close()">{{ $t('page.cancel') }}</Button>
      <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
    </template>
  </TsDialog>
</template>

<script>
export default {
  name: 'FeishuSyncEdit',
  components: {
    TsDialog: () => import('@/resources/plugins/TsDialog/TsDialog.vue'),
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {
    configData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      dialogConfig: {
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'medium'
      },
      // 应用凭证表单只维护 App ID、App Secret 和知识圈三个字段。
      formData: this.buildFormData(this.configData),
      formConfig: []
    };
  },
  created() {
    this.initFormConfig();
    // 每次打开应用凭证弹框都重新获取最新数据，避免使用页面缓存的旧凭证。
    this.getLatestAppCredentials();
  },
  methods: {
    buildFormData(configData) {
      // 凭证接口可能尚未保存过数据，空值统一初始化为表单可识别的默认值。
      return {
        appId: configData && configData.appId ? configData.appId : '',
        appSecret: configData && configData.appSecret ? configData.appSecret : '',
        knowledgeCircleId: configData && configData.knowledgeCircleId ? configData.knowledgeCircleId : null
      };
    },
    initFormConfig() {
      this.formConfig = [
        {
          type: 'text',
          name: 'appId',
          label: 'App ID',
          value: this.formData.appId,
          width: '100%',
          validateList: ['required'],
          onChange: value => {
            this.formData.appId = value;
          }
        },
        {
          type: 'password',
          name: 'appSecret',
          label: 'App Secret',
          value: this.formData.appSecret,
          width: '100%',
          validateList: ['required'],
          showPassword: false,
          clearable: true,
          onChange: value => {
            this.formData.appSecret = value;
          }
        },
        {
          type: 'select',
          name: 'knowledgeCircleId',
          label: this.$t('term.knowledge.intellectualcircle'),
          value: this.formData.knowledgeCircleId,
          width: '100%',
          transfer: true,
          search: true,
          url: '/api/rest/knowledge/circle/search',
          rootName: 'circleList',
          valueName: 'id',
          textName: 'name',
          validateList: ['required'],
          onChange: value => {
            // 保存值字段按接口要求写入 knowledgeCircleId。
            this.formData.knowledgeCircleId = value;
          }
        }
      ];
    },
    getLatestAppCredentials() {
      // 应用凭证弹框打开时固定调用 get 接口，返回后重建表单配置以刷新 TsForm 的 value。
      this.$api.knowledge.feishu.getAppCredentials({}).then(res => {
        if (res.Status === 'OK') {
          // Return 为 null 时也按最新空数据处理，避免继续显示旧缓存凭证。
          this.formData = this.buildFormData({
            ...(res.Return || {})
          });
          this.initFormConfig();
        }
      });
    },
    save() {
      const form = this.$refs.form;
      if (form && form.valid()) {
        // 保存前复制一份，避免接口处理过程中影响当前表单数据。
        const params = { ...this.formData };
        this.$api.knowledge.feishu.saveAppCredentials(params).then(res => {
          if (res.Status === 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(true);
          }
        });
      }
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    }
  }
};
</script>
