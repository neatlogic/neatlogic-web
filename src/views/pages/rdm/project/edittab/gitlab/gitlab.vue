<template>
  <div>
    <TsFormItem label="Webhook Url" :required="true" labelPosition="top">
      <div v-if="webhookData.webhookUrl" class="bg-op padding-md radius-md mt-md mb-md">
        <Code class="bg-block">
          <span id="webhookUrl">/t/{{ tenant }}/rdm/webhook/gitlab?token={{ webhookData.webhookUrl }}</span>
          <span class="ml-sm tsfont-copy cursor" @click="$utils.copyText('#webhookUrl')"></span>
        </Code>
      </div>
      <div>
        <a @click="createWebhookUrl()">{{ $t('term.framework.recreate') }}</a>
      </div>
    </TsFormItem>
    <TsFormItem label="Secret Token" labelPosition="top">
      <div v-if="webhookData.secretToken" class="bg-op padding-md radius-md mt-md mb-md">
        <Code class="bg-block">
          <span id="secretToken">{{ webhookData.secretToken }}</span>
          <span class="ml-sm tsfont-copy cursor" @click="$utils.copyText('#secretToken')"></span>
        </Code>
      </div>
      <div>
        <a v-if="webhookData.secretToken" class="mr-sm" @click="clearSecretToken()">{{ $t('page.clear') }}</a>
        <a @click="createSecretToken()">{{ $t('term.framework.recreate') }}</a>
      </div>
    </TsFormItem>
    <div style="text-align: right" class="mt-md">
      <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve)
  },
  props: {
    appData: { type: Object }
  },
  data() {
    return {
      home: HOME,
      tenant: TENANT,
      webhookData: { appId: this.appData.id },
      formConfig: [
        {
          type: 'slot',
          name: 'webhookUrl',
          label: 'Webhook URL',
          validateList: ['required']
        },
        {
          type: 'slot',
          name: 'secretToken',
          label: 'Secret Token'
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.getWebhookConfig();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    createWebhookUrl() {
      this.$set(this.webhookData, 'webhookUrl', this.$utils.setUuid());
    },
    createSecretToken() {
      this.$set(this.webhookData, 'secretToken', this.$utils.setUuid());
    },
    clearSecretToken() {
      this.$set(this.webhookData, 'secretToken', null);
    },
    getWebhookConfig() {
      if (this.appData.id) {
        this.$api.rdm.webhook.getWebhookConfigByAppId(this.appData.id).then(res => {
          this.webhookData = res.Return;
        });
      }
    },
    save() {
      if (this.webhookData.webhookUrl) {
        this.$api.rdm.webhook.saveWebhookConfig(this.webhookData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
          }
        });
      } else {
        this.$Message.warning(this.$t('term.rdm.pleasecreatewebhookurl'));
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: auto auto;
}
</style>
