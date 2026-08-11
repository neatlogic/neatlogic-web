<template>
  <div>
    <TsFormItem label="Webhook Url" :required="true" labelPosition="top">
      <div v-if="appType.config.webhookUrl" class="bg-op padding-md radius-md mt-md mb-md">
        <Code class="bg-block">
          <span id="webhookUrl">{{ webhookUrlFull }}</span>
          <span class="ml-sm tsfont-copy cursor" @click="$utils.copyText('#webhookUrl')"></span>
        </Code>
      </div>
      <div>
        <a @click="createWebhookUrl()">{{ $t('page.recreate') }}</a>
      </div>
    </TsFormItem>
    <TsFormItem label="Secret Token" labelPosition="top">
      <div v-if="appType.config.secretToken" class="bg-op padding-md radius-md mt-md mb-md">
        <Code class="bg-block">
          <span id="secretToken">{{ appType.config.secretToken }}</span>
          <span class="ml-sm tsfont-copy cursor" @click="$utils.copyText('#secretToken')"></span>
        </Code>
      </div>
      <div>
        <a v-if="appType.config.secretToken" class="mr-sm" @click="clearSecretToken()">{{ $t('page.clear') }}</a>
        <a @click="createSecretToken()">{{ $t('page.recreate') }}</a>
      </div>
    </TsFormItem>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem')
  },
  props: {
    appType: { type: Object }
  },
  data() {
    return {
      webhookUrlPrefix: '',
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
    this.getWebhookUrlConfig();
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
      this.$set(this.appType.config, 'webhookUrl', this.$utils.setUuid());
    },
    createSecretToken() {
      this.$set(this.appType.config, 'secretToken', this.$utils.setUuid());
    },
    clearSecretToken() {
      this.$set(this.appType.config, 'secretToken', null);
    },
    getWebhookUrlConfig() {
      this.$api.rdm.webhook.getWebhookUrlConfig().then(res => {
        this.webhookUrlPrefix = res.Return.webhookUrlPrefix || '';
      });
    },
    save() {
    }
  },
  filter: {},
  computed: {
    webhookUrlFull() {
      if (!this.appType.config.webhookUrl) {
        return '';
      }
      return this.webhookUrlPrefix + this.appType.config.webhookUrl;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: auto auto;
}
</style>
