<template>
  <TsDialog
    v-if="isShow"
    v-bind="dialogConfig"
    @on-close="handleClose"
    @on-ok="handleOk"
  >
    <template v-slot>
      <div class="input-border">
        <TsForm ref="form" :itemList="formConfig" labelPosition="right">
          <template v-slot:basicInfo>
            <div v-if="formConfig?.basic?.value === 'true'">
              <TsForm ref="basicForm" :item-list="basicFormConfig"></TsForm>
            </div>
          </template>
        </TsForm>
      </div>
    </template>
    <template v-slot:footer>
      <Button @click.native="handleClose">{{ $t('page.cancel') }}</Button>
      <Button
        type="primary"
        :disabled="dialogConfig.isButtonDisabled"
        :loading="dialogConfig.loading"
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
        width: 'medium',
        loading: false,
        isButtonDisabled: false
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
        },
        basic: {
          type: 'radio',
          name: 'basicSupport',
          value: 'false',
          label: 'basic认证',
          validateList: ['required'],
          valueName: 'value',
          textName: 'text',
          dataList: [
            { value: 'true', text: this.$t('page.yes') },
            { value: 'false', text: this.$t('page.no') }
          ],
          isHidden: true,
          onChange: val => {
            if (val === 'false') {
              this.$set(this.basicFormConfig['username'], 'value', null);
              this.$set(this.basicFormConfig['password'], 'value', null);
              this.$set(this.formConfig.basicInfo, 'isHidden', true);
            } else {
              this.$set(this.formConfig.basicInfo, 'isHidden', false);
            }
          }
        },
        basicInfo: {
          hideLabel: true,
          type: 'slot',
          lable: '',
          isHidden: true
        }
      },
      basicFormConfig: {
        username: {
          type: 'text',
          name: 'username',
          value: '',
          maxlength: 20,
          width: 400,
          label: this.$t('page.username'),
          validateList: ['required']
        },
        password: {
          type: 'password',
          name: 'password',
          value: '',
          maxlength: 20,
          width: 400,
          label: this.$t('page.password'),
          validateList: [
            {
              name: 'passcode',
              message: this.$t('message.passcode')
            }
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
        ...this.$refs.form.getFormValue(),
        ...(this.$refs.basicForm ? this.$refs.basicForm.getFormValue() : {})
      };
      params.handler = this.currentApiData.handler;
      params.isActive = this.currentApiData.isActive;
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
          if (res.Return.basicSupport) {
            this.$set(this.formConfig.basic, 'isHidden', false);
            if (res.Return.username) {
              this.$set(this.formConfig['basic'], 'value', 'true');
              this.$set(this.formConfig.basicInfo, 'isHidden', false);
              this.basicFormConfig['username']['value'] = res.Return.username;
            } else {
              this.$set(this.formConfig['basic'], 'value', 'false');
              this.$set(this.formConfig.basicInfo, 'isHidden', true);
            }
          }
          this.updateMcpFormItem(res.Return);
          this.dialogConfig.isButtonDisabled = false;
        }
      });
    }
  }
};
</script>
