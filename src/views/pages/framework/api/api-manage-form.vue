<template>
  <TsDialog
    v-if="isShow"
    v-bind="dialogConfig"
    @on-close="handleClose"
    @on-ok="handleOk"
  >
    <template v-slot>
      <Loading :loadingShow="isLoading" type="fix"></Loading>
      <div class="input-border">
        <TsForm ref="form" :itemList="formConfig" labelPosition="right">
          <template v-slot:requiredAuthList>
            <div v-if="!isLoading" class="required-auth-list">
              <template v-if="Array.isArray(currentApiData && currentApiData.requiredAuthList)">
                <template v-if="currentApiData.requiredAuthList.length">
                  <div class="required-auth-tags">
                    <Tag v-for="auth in currentApiData.requiredAuthList" :key="auth.name" class="required-auth-tag">
                      <span v-if="auth.displayName">{{ auth.displayName }} · </span><span class="text-grey">{{ auth.name }}</span>
                    </Tag>
                  </div>
                  <div v-if="currentApiData.requiredAuthList.length > 1" class="text-tip">{{ $t('term.framework.apirequiredauthany') }}</div>
                </template>
                <div v-else class="text-grey">{{ $t('term.framework.apirequiredauthnone') }}</div>
              </template>
              <div v-else class="text-grey">{{ $t('term.framework.apirequiredauthunavailable') }}</div>
            </div>
          </template>
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
import { hasMcpSupport } from './mcp-capability';

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
      isLoading: true,
      dialogConfig: {
        type: 'modal',
        title: this.$t('dialog.title.edittarget', {'target': this.$t('page.interface')}),
        isShow: true,
        width: 'medium',
        loading: false,
        isButtonDisabled: true
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
        requiredAuthList: {
          type: 'slot',
          label: this.$t('page.executeauthority'),
          tooltip: this.$t('term.framework.apirequiredauthhelp')
        },
        needAudit: {
          type: 'radio',
          name: 'needAudit',
          value: 1,
          label: this.$t('page.needaudit'),
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
          label: this.$t('term.framework.mcpservice'),
          disabled: false,
          isHidden: !hasMcpSupport(),
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
          label: this.$t('term.framework.basicauth'),
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
  async created() {
    await this.fetchFormValue(this.token);
  },
  methods: {
    isObjectApiType(type) {
      return type === 'object';
    },
    updateMcpFormItem(apiData) {
      // 隐藏 MCP 设置时保留详情值，类型限制只作用于可编辑的 MCP 开关。
      if (!this.isMcpAvailable || !this.formConfig || !this.formConfig.isMcp) {
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
    // 详情未就绪或保存中时禁止提交，只提交可编辑配置，不回传声明权限。
    async handleOk() {
      if (this.isLoading || this.dialogConfig.loading || this.dialogConfig.isButtonDisabled || !this.currentApiData) {
        return;
      }
      const isValid = Object.values(this.$refs)
        .filter(ref => ref)
        .every(ref => ref.valid());
      if (!isValid) {
        return;
      }
      this.dialogConfig.loading = true;
      try {
        const params = {
          ...this.$refs.form.getFormValue(),
          ...(this.$refs.basicForm ? this.$refs.basicForm.getFormValue() : {})
        };
        delete params.requiredAuthList;
        params.handler = this.currentApiData.handler;
        params.isActive = this.currentApiData.isActive;
        // 未开放 MCP 时回传原配置，避免普通配置保存被 DTO 默认值覆盖。
        if (!this.isMcpAvailable) {
          params.isMcp = this.currentApiData.isMcp;
        } else if (!this.isObjectApiType(this.currentApiData && this.currentApiData.type)) {
          params.isMcp = 0;
        }
        const res = await this.$api.framework.apiManage.save(params);
        if (res.Status === 'OK') {
          setTimeout(() => {
            this.$Message.success(this.$t('message.savesuccess'));
          }, 200);
          // 保存仅更新接口配置，刷新列表即可，保留目录树的展开状态和当前选中节点。
          this.$parent.getTableConfig();
          this.$emit('on-hide');
        }
      } finally {
        this.dialogConfig.loading = false;
      }
    },
    // 加载失败保留禁用状态，避免把未知权限误显示为无需权限。
    async fetchFormValue(token) {
      this.isLoading = true;
      this.currentApiData = null;
      this.dialogConfig.isButtonDisabled = true;
      Object.values(this.formConfig).forEach(item => {
        item.disabled = true;
      }); //从服务器获取数据时禁止修改表单内容
      try {
        const res = await this.$api.framework.apiManage.get({ token });
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
      } finally {
        this.isLoading = false;
      }
    }
  },
  computed: {
    isMcpAvailable: hasMcpSupport
  }
};
</script>

<style lang="less" scoped>
.required-auth-list {
  overflow-wrap: anywhere;
  // 与 TsForm 的 32px 表单行保持一致，避免 Tag 的默认外边距和行内基线造成偏移。
  .required-auth-tags {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    min-height: 32px;
  }
  .required-auth-tag {
    margin: 0;
    max-width: 100%;
    height: auto;
    white-space: normal;
  }
}
</style>
