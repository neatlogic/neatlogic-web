<template>
  <TsDialog
    v-if="isShow"
    v-bind="dialogConfig"
    @on-close="handleClose"
    @on-ok="handleOk"
  >
    <template v-slot>
      <div class="input-border">
        <TsForm ref="form" :itemList="formConfig" labelPosition="right"></TsForm>
      </div>
    </template>
    <template v-slot:footer>
      <Button @click.native="handleClose">{{ $t('page.cancel') }}</Button>
      <Button
        type="primary"
        @click.native="handleOk"
      >{{ $t('page.confirm') }}</Button>
    </template>
  </TsDialog>
</template>

<script>
export default {
  name: 'ApiForm',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {
    isShow: { type: Boolean, required: true },
    token: { type: String, default: '' }
  },
  data() {
    return {
      dialogConfig: {
        type: 'modal',
        title: this.$t('dialog.title.edittarget', {'target': this.$t('page.interface')}),
        isShow: true,
        width: 'medium'
      },
      formConfig: {
        token: {
          type: 'text',
          name: 'token',
          value: '',
          label: this.$t('page.address'),
          validateList: ['required', 'token', { name: 'searchUrl', url: 'api/rest/apimanage/save', message: this.$t('message.targetisexists', { target: this.$t('page.address') }) }],
          disabled: true
        },
        name: {
          type: 'text',
          name: 'name',
          value: '',
          label: this.$t('page.name'),
          validateList: [
            'required',
            'non-special',
            {
              name: 'searchUrl',
              url: 'api/rest/apimanage/save',
              message: this.$t('message.targetisexists', { target: this.$t('page.name') }),
              params: () => ({ token: this.token })
            }
          ],
          disabled: true
        },
        needAudit: {
          type: 'radio',
          name: 'needAudit',
          value: 1,
          label: '启用审计',
          validateList: ['required'],
          valueName: 'value',
          textName: 'text',
          dataList: [
            { value: 1, text: this.$t('page.yes') },
            { value: 0, text: this.$t('page.no') }
          ]
        },
        qps: {
          type: 'number',
          name: 'qps',
          label: this.$t('term.framework.qps'),
          value: 0,
          desc: this.$t('message.framework.qpstip'),
          validateList: ['required', 'integer_natural', 'number']
        },
        isMcp: {
          type: 'radio',
          name: 'isMcp',
          value: 0,
          label: 'MCP服务',
          disabled: false,
          validateList: ['required'],
          valueName: 'value',
          textName: 'text',
          dataList: [
            { value: 1, text: this.$t('page.yes') },
            { value: 0, text: this.$t('page.no') }
          ]
        }
      },
      currentApiData: null
    };
  },
  created() {
    this.fetchFormValue(this.token);
  },
  methods: {
    isObjectApiType(type) {
      return type === 'object';
    },
    updateMcpFormItem(apiData) {
      if (!this.formConfig || !this.formConfig.isMcp) {
        return;
      }
      const currentApiMode = apiData && apiData.type;
      if (!currentApiMode) {
        return;
      }
      const isObjectApi = this.isObjectApiType(currentApiMode);
      this.$set(this.formConfig.isMcp, 'disabled', !isObjectApi);
      if (!isObjectApi) {
        this.formConfig.isMcp.value = 0;
      }
    },
    handleClose() {
      this.$emit('on-hide');
      this.dialogConfig.title = '';
      this.currentApiData = null;
    },
    handleOk() {
      const isValid = Object.values(this.$refs)
        .filter(ref => ref)
        .every(ref => ref.valid());
      if (!isValid) {
        return;
      }
      this.dialogConfig.loading = true;
      const params = {
        ...(this.currentApiData || {}),
        ...this.$refs.form.getFormValue()
      };
      if (!this.isObjectApiType(this.currentApiData && this.currentApiData.type)) {
        params.isMcp = 0;
      }
      this.$api.framework.apiManage
        .save(params)
        .then(res => {
          if (res.Status === 'OK') {
            setTimeout(() => {
              this.$Message.success(this.$t('message.savesuccess'));
            }, 200);
            this.$parent.getTableConfig();
            this.$parent.getTree();
            this.$emit('on-hide');
          }
        })
        .finally(() => {
          this.dialogConfig.loading = false;
        });
    },
    fetchFormValue(token) {
      this.dialogConfig.isButtonDisabled = true;
      Object.values(this.formConfig).forEach(item => {
        item.disabled = true;
      }); //从服务器获取数据时禁止修改表单内容
      return this.$api.framework.apiManage.get({ token }).then(res => {
        if (res.Status === 'OK') {
          this.currentApiData = res.Return;
          Object.values(this.formConfig).forEach(item => {
            item.value = res.Return[item.name];
            if (!['token', 'name'].includes(item.name)) {
              item.disabled = false;
            }
          });
          this.updateMcpFormItem(res.Return);
          this.dialogConfig.isButtonDisabled = false;
        }
      });
    }
  }
};
</script>
