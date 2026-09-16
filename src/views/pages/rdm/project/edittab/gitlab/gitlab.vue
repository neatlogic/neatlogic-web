<template>
  <Tabs v-model="currentTab">
    <TabPane :label="$t('term.rdm.webhooksetting')" name="webhook">
      <TsFormItem label="Webhook Url" :required="true" labelPosition="top">
        <div v-if="webhookData.webhookUrl" class="bg-op padding-md radius-md mt-md mb-md">
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
        <div v-if="webhookData.secretToken" class="bg-op padding-md radius-md mt-md mb-md">
          <Code class="bg-block">
            <span id="secretToken">{{ webhookData.secretToken }}</span>
            <span class="ml-sm tsfont-copy cursor" @click="$utils.copyText('#secretToken')"></span>
          </Code>
        </div>
        <div>
          <a v-if="webhookData.secretToken" class="mr-sm" @click="clearSecretToken()">{{ $t('page.clear') }}</a>
          <a @click="createSecretToken()">{{ $t('page.recreate') }}</a>
        </div>
      </TsFormItem>
    </TabPane>
    <TabPane
      v-if="eventSettingComponent"
      :label="$t('term.rdm.eventsetting')"
      name="event"
      class="pl-md"
    >
      <component
        :is="eventSettingComponent"
        v-if="currentTab === 'event'"
        :key="appData.id"
        :appId="appData.id"
        :projectId="appData.projectId"
      ></component>
    </TabPane>
  </Tabs>
</template>
<script>
import { SettingBase } from '../base-setting.js';
export default {
  name: '',
  defaultSettingTab: 'webhook',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem')
  },
  extends: SettingBase,
  data() {
    return {
      currentTab: 'webhook',
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
      this.save();
    },
    createSecretToken() {
      this.$set(this.webhookData, 'secretToken', this.$utils.setUuid());
      this.save();
    },
    clearSecretToken() {
      this.$set(this.webhookData, 'secretToken', null);
      this.save();
    },
    getWebhookConfig() {
      if (this.appData.id) {
        this.$api.rdm.webhook.getWebhookConfigByAppId(this.appData.id).then(res => {
          if (res.Return) {
            this.webhookData = res.Return;
          }
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
  computed: {
    webhookUrlFull() {
      if (!this.webhookData.webhookUrl) {
        return '';
      }
      return this.webhookData.webhookUrlFull || ((this.webhookData.webhookUrlPrefix || '') + this.webhookData.webhookUrl);
    }
  }
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: auto auto;
}
</style>
