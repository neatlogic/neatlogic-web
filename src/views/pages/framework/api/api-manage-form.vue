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
          <!-- 认证方式自定义slot -->
          <template v-slot:authtype>
            <Row>
              <Col span="12">
                <TsFormSelect
                  ref="authtype"
                  v-model="formConfig['authtype'].value"
                  :dataList="formConfig['authtype'].dataList"
                  :transfer="true"
                  :validateList="formConfig['authtype'].validateList"
                  :clearable="formConfig['authtype'].clearable"
                  @on-change="authChange"
                ></TsFormSelect>
              </Col>
              <Col span="12">
                <Poptip
                  class="poptip"
                  word-wrap
                  width="500"
                  placement="bottom"
                  trigger="hover"
                  transfer
                >
                  <i class="tsfont-question-o text-href"></i>
                  <div slot="title">{{ authConfig ? authConfig.title : $t('page.nothave') }}</div>
                  <div v-if="authConfig" slot="content">
                    <p v-for="(item,index) in authConfig.detailList" :key="index">
                      <span class="tsfont-dot fz10">{{ item }}</span>
                    </p>
                  </div>
                </Poptip>
              </Col>
            </Row>
          </template>
          <!-- 请求时效自定义slot -->
          <template v-slot:timeout>
            <Row>
              <Col span="12">
                <TsFormInput
                  ref="timeout"
                  v-model="formConfig['timeout'].value"
                  type="number"
                  :validateList="formConfig['timeout'].validateList"
                ></TsFormInput>
              </Col>
              <Col span="12">
                <!-- <span>秒</span> -->
                <Poptip
                  class="poptip"
                  word-wrap
                  transfer
                  placement="bottom"
                  trigger="hover"
                >
                  <i class="tsfont-question-o text-href"></i>
                  <div slot="title">{{ $t('term.framework.timeout') }}</div>
                  <div slot="content">
                    {{ $t('message.framework.timeouttip') }}
                  </div>
                </Poptip>
              </Col>
            </Row>
          </template>
          <!-- 访问频率自定义slot -->
          <template v-slot:qps>
            <Row>
              <Col span="12">
                <TsFormInput
                  ref="qps"
                  v-model="formConfig['qps'].value"
                  type="number"
                  :validateList="formConfig['qps'].validateList"
                ></TsFormInput>
              </Col>
              <Col span="12">
                <!-- <span>次/秒</span> -->
                <Poptip
                  class="poptip"
                  transfer
                  word-wrap
                  placement="bottom"
                  trigger="hover"
                >
                  <i class="tsfont-question-o text-href"></i>
                  <div slot="title">{{ $t('term.framework.qps') }}</div>
                  <div slot="content">
                    <span v-html="$t('message.framework.qpstip')"></span>
                  </div>
                </Poptip>
              </Col>
            </Row>
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
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  props: {
    isShow: { type: Boolean, required: true },
    operationType: { type: String, required: true },
    apiType: { type: String, required: true },
    rowData: { type: Object, required: true }
  },
  data() {
    let vm = this;
    return {
      dialogConfig: {
        type: 'modal',
        title: '',
        isShow: true,
        width: '700px',
        loading: false,
        isButtonDisabled: false
      },
      defaultFormConfig: {
        token: {
          type: 'text',
          name: 'token',
          value: '',
          width: 400,
          label: this.$t('page.address'),
          validateList: [
            'required', 'token', { name: 'searchUrl', url: 'api/rest/apimanage/save', message: this.$t('message.targetisexists', {'target': this.$t('page.address')}) }
          ],
          disabled: false
        },
        name: {
          type: 'text',
          name: 'name',
          value: '',
          maxlength: 30,
          width: 400,
          label: this.$t('page.name'),
          validateList: [
            'required', 'non-special',
            {
              name: 'searchUrl',
              url: 'api/rest/apimanage/save',
              message: this.$t('message.targetisexists', {'target': this.$t('page.name')}),
              params: () => ({token: this.rowData.token})
            }
          ],
          disabled: false
        },
        handler: {
          type: 'select',
          clearable: false,
          name: 'handler',
          value: '',
          width: 400,
          label: this.$t('page.handler'),
          url: '/api/rest/apimanage/apihandler/list',
          params: {
            isPrivate: false
          },
          disabled: false,
          rootName: 'tbodyList',
          valueName: 'handler',
          textName: 'name',
          validateList: ['required']
        },
        isActive: {
          type: 'radio',
          name: 'isActive',
          value: 1,
          label: this.$t('page.status'),
          validateList: ['required'],
          valueName: 'value',
          textName: 'text',
          dataList: [
            { value: 1, text: this.$t('page.enable') },
            { value: 0, text: this.$t('page.disable') }
          ]
        },
        needAudit: {
          type: 'radio',
          name: 'needAudit',
          value: 1,
          label: this.$t('page.keeprecords'),
          validateList: ['required'],
          valueName: 'value',
          textName: 'text',
          dataList: [
            { value: 1, text: this.$t('page.yes') },
            { value: 0, text: this.$t('page.no') }
          ]
        },
        authtype: {
          type: 'slot',
          name: 'authtype',
          clearable: false,
          value: '',
          label: this.$t('page.authtype'),
          validateList: ['required'],
          valueName: 'value',
          textName: 'text',
          dataList: [
            // { value: '-', text: '无' },
            // { value: 'basic', text: 'Basic' },
            // { value: 'token', text: '用户令牌' },
            // { value: 'hmac-sha1', text: 'HMAC-SHA1' }
          ]
        },
        username: {
          type: 'text',
          name: 'username',
          value: '',
          maxlength: 20,
          width: 400,
          label: this.$t('page.username'),
          isHidden: true,
          validateList: ['required']
        },
        password: {
          type: 'password',
          name: 'password',
          value: '',
          maxlength: 20,
          width: 400,
          label: this.$t('page.password'),
          isHidden: true,
          validateList: ['required',
            {
              name: 'passcode',
              message: this.$t('message.passcode')
            }]
        },
        timeout: {
          type: 'slot',
          name: 'timeout',
          value: 0,
          width: 200,
          label: this.$t('term.framework.timeout'),
          validateList: ['required', 'integer_natural', 'number']
        },
        qps: {
          type: 'slot',
          name: 'qps',
          label: this.$t('term.framework.qps'),
          value: 0,
          validateList: ['required', 'integer_natural', 'number']
        },
        expire: {
          type: 'datetime',
          name: 'expire',
          value: '',
          transfer: true,
          label: this.$t('page.servicelife')
        },
        description: {
          type: 'textarea',
          name: 'description',
          value: '',
          label: this.$t('page.description')
        }
      },
      formConfig: {},
      authConfig: null
    };
  },
  mounted() {
    this.getAuthTypeList();
  },
  methods: {
    getAuthTypeList() {
      let data = {};
      this.$api.framework.apiManage.authTypeList(data).then(res => {
        if (res.Status === 'OK') {
          this.defaultFormConfig.authtype.dataList = res.Return;
        }
      });
    },
    authChange(val) {
      let nowList = this.defaultFormConfig.authtype.dataList.find(d => d.value == val);
      this.authConfig = nowList && nowList.help ? nowList.help : null;
    },
    createApi() {
      this.dialogConfig.title = this.$t('dialog.title.addtarget', {'target': this.$t('page.interface')});
      this.formConfig = this.$utils.deepClone(this.defaultFormConfig);
    },
    updateApi() {
      this.dialogConfig.title = this.$t('dialog.title.edittarget', {'target': this.$t('page.interface')});
      if (this.rowData.apiType === 'custom') {
        this.formConfig = this.$utils.deepClone(this.defaultFormConfig);
        this.fetchFormValue(this.rowData.token).then(() => {
          this.formConfig['token'].disabled = true;
        });
      } else if (this.rowData.apiType === 'system') {
        const { token, name, isActive, handler, needAudit, authtype, qps } = this.$utils.deepClone(this.defaultFormConfig);
        this.formConfig = { token, name, isActive, handler, needAudit, authtype, qps };
        this.formConfig['isActive'].isHidden = true;
        this.formConfig['handler'].isHidden = true;
        this.formConfig['authtype'].isHidden = true;
        this.fetchFormValue(this.rowData.token).then(() => {
          this.formConfig['token'].disabled = true;
          this.formConfig['name'].disabled = true;
        });
      }
    },
    copyApi() {
      this.dialogConfig.title = this.$t('dialog.title.copytarget', {'target': this.$t('page.interface')});
      this.formConfig = this.$utils.deepClone(this.defaultFormConfig);
      this.fetchFormValue(this.rowData.token).then(() => {
        this.formConfig['token'].value += '_copy';
        this.formConfig['name'].value += '_copy';
        this.formConfig['handler'].disabled = true;
      });
    },
    deleteApi({ token }) {
      this.$emit('on-hide');
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: token}),
        btnType: 'error',
        'on-ok': vnode => {
          const params = { token };
          this.$api.framework.apiManage
            .delete(params)
            .then(res => {
              if (res.Status == 'OK') {
                this.$Message.success(this.$t('message.deletesuccess'));
              }
            })
            .finally(() => {
              vnode.isShow = false;
              this.$parent.getTableConfig();
            });
        }
      });
    },
    handleClose() {
      this.$emit('on-hide');
      this.dialogConfig.title = '';
      this.formConfig = this.$utils.deepClone(this.defaultFormConfig);
    },
    handleOk() {
      const isValid = Object.values(this.$refs).every(ref => ref.valid());
      if (!isValid) {
        return;
      }
      this.dialogConfig.loading = true;
      const params = {
        ...this.$refs.form.getFormValue(),
        apiType: this.apiType,
        operationType: this.operationType === 'copy' ? 'create' : this.operationType
      };
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
          Object.values(this.formConfig).forEach(item => {
            item.value = res.Return[item.name];
            item.disabled = false;
          });
          this.dialogConfig.isButtonDisabled = false;
        }
      });
    }
  },
  computed: {
    // 根据认证类型,判断是否隐藏用户名和密码输入框
    areUsernameAndPasswordHidden() {
      let authType = this.formConfig['authtype'] && this.formConfig['authtype'].value;
      if (authType) this.authChange(authType);
      if (authType == 'basic' || authType == 'hmac-sha1') return false;
      return true;
    }
  },
  watch: {
    areUsernameAndPasswordHidden(value) {
      this.formConfig['username'].isHidden = value;
      this.formConfig['password'].isHidden = value;
    },
    isShow(isShow) {
      const strategies = {
        create: this.createApi,
        update: this.updateApi,
        copy: this.copyApi,
        delete: this.deleteApi
      };
      if (isShow) return strategies[this.operationType](this.rowData);
    }
  }
};
</script>

<style lang="less" scoped>
.poptip {
  margin-left: 6px;
}
</style>
