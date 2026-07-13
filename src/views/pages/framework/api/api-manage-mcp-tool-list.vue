<template>
  <TsDialog
    :isShow="isShow"
    :title="$t('term.framework.mcptoollisttest')"
    type="slider"
    width="large"
    :hasFooter="false"
    :maskClose="true"
    @on-close="close"
  >
    <TsFormItem :label="$t('page.module')" :labelWidth="100">
      <TsFormSelect
        v-model="moduleScope"
        url="/api/rest/module/list"
        valueName="value"
        textName="text"
        :clearable="true"
        transfer
        :placeholder="$t('term.framework.queryallmodulesplaceholder')"
      ></TsFormSelect>
    </TsFormItem>
    <TsFormItem :label="$t('term.framework.calladdress')" :labelWidth="100">
      <span>{{ endpoint }}</span>
    </TsFormItem>
    <TsFormItem :label="$t('term.framework.requestbody')" :labelWidth="100">
      <JsonViewer boxed copyable :value="requestBody"></JsonViewer>
    </TsFormItem>
    <TsFormItem :labelWidth="100">
      <Button
        style="width:100%"
        type="primary"
        :loading="isLoading"
        @click="executeListTools"
      >{{ $t('term.framework.gettoollist') }}</Button>
    </TsFormItem>
    <TsFormItem v-if="result" :label="$t('term.framework.toollistresult')" :labelWidth="100">
      <JsonViewer boxed copyable :value="result"></JsonViewer>
    </TsFormItem>
  </TsDialog>
</template>

<script>
export default {
  name: 'ApiManageMcpToolList',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    JsonViewer: () => import('vue-json-viewer')
  },
  props: {
    isShow: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      moduleScope: null,
      isLoading: false,
      result: null
    };
  },
  methods: {
    close() {
      this.$emit('close');
    },
    executeListTools() {
      this.isLoading = true;
      this.result = null;
      this.$api.framework.apiManage
        .mcpCall(this.endpoint, this.requestBody)
        .then(res => {
          this.result = res;
        })
        .catch(error => {
          this.result = error && error.data ? error.data : error;
        })
        .finally(() => {
          this.isLoading = false;
        });
    }
  },
  computed: {
    endpoint() {
      return this.moduleScope ? `/api/mcp/${this.moduleScope}` : '/api/mcp';
    },
    requestBody() {
      return {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        endpoint: this.endpoint
      };
    }
  }
};
</script>
