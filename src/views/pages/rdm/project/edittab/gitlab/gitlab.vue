<template>
  <div>
    <TsForm ref="form" v-model="appData.config" :item-list="formConfig">
      <template v-slot:secret>
        <div>
          <TsFormSwitch
            v-model="appData.config.enableSecret"
            :true-text="$t('term.rdm.stopsecret')"
            :false-text="$t('term.rdm.enablesecret')"
            :true-value="true"
            :false-value="false"
          ></TsFormSwitch>
          <TsFormInput
            v-if="appData.config.enableSecret"
            v-model="appData.config.secret"
            border="border"
          ></TsFormInput>
        </div>
      </template>
    </TsForm>
    <div style="text-align: right" class="mt-md">
      <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  props: {
    appData: { type: Object }
  },
  data() {
    return {
      formConfig: [
        {
          type: 'text',
          name: 'webhook',
          label: 'Webhook URL',
          validateList: ['required']
        },
        {
          type: 'slot',
          name: 'secret',
          label: 'Secret Token'
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    save() {
      const form = this.$refs['form'];
      if (form && form.valid()) {
        this.$api.rdm.app
          .saveAppConfig({
            id: this.appData.id,
            config: this.appData.config
          })
          .then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.savesuccess'));
            }
          });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
