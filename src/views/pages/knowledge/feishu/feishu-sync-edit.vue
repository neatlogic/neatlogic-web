<template>
  <TsDialog v-bind="dialogConfig" @on-close="close">
    <template v-slot:header>
      <div>{{ formData.id ? '编辑同步配置' : '新增同步配置' }}</div>
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
      // 表单提交数据沿用原接口入参结构，编辑时 token 留空表示不覆盖旧 token。
      formData: this.buildFormData(this.configData),
      formConfig: []
    };
  },
  created() {
    this.initFormConfig();
    // 编辑弹框打开时按 id 拉取最新配置，避免使用列表页缓存的旧行数据。
    this.getLatestConfigById();
  },
  methods: {
    buildFormData(configData) {
      // 兼容旧数据：旧配置没有 userAccessToken 时，用空字符串初始化表单。
      return {
        id: configData && configData.id ? configData.id : null,
        name: configData && configData.name ? configData.name : '',
        // baseUrl: configData && configData.baseUrl ? configData.baseUrl : 'https://lqnnbz38z5y.feishu.cn',
        appId: configData && configData.appId ? configData.appId : '',
        appSecret: configData && configData.appSecret ? configData.appSecret : '',
        // appSecret: '',
        // userAccessToken: '',
        // spaceId: configData && configData.spaceId ? configData.spaceId : '',
        // spaceName: configData && configData.spaceName ? configData.spaceName : '',
        knowledgeCircleId: configData && configData.knowledgeCircleId ? configData.knowledgeCircleId : null,
        isActive: configData && configData.isActive !== undefined ? configData.isActive : 1
      };
    },
    initFormConfig() {
      this.formConfig = [
        {
          type: 'text',
          name: 'name',
          label: '名称',
          value: this.formData.name,
          width: '100%',
          maxlength: 100,
          validateList: ['required'],
          onChange: value => {
            this.formData.name = value;
          }
        },
        // {
        //   type: 'text',
        //   name: 'baseUrl',
        //   label: '飞书平台地址',
        //   value: this.formData.baseUrl,
        //   width: '100%',
        //   validateList: ['required'],
        //   onChange: value => {
        //     this.formData.baseUrl = value;
        //   }
        // },
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
          type: 'text',
          name: 'appSecret',
          label: 'App Secret',
          value: this.formData.appSecret,
          width: '100%',
          validateList: ['required'],
          onChange: value => {
            this.formData.appSecret = value;
          }
        },
        {
          type: 'select',
          name: 'knowledgeCircleId',
          label: '知识圈',
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
        },
        // {
        //   type: 'password',
        //   name: 'userAccessToken',
        //   label: 'User Access Token',
        //   value: this.formData.userAccessToken,
        //   width: '100%',
        //   placeholder: isEdit ? '编辑时留空表示不修改' : '',
        //   validateList: isEdit ? [] : ['required'],
        //   onChange: value => {
        //     this.formData.userAccessToken = value;
        //   }
        // },
        // {
        //   type: 'text',
        //   name: 'spaceId',
        //   label: 'Wiki Space ID',
        //   value: this.formData.spaceId,
        //   width: '100%',
        //   validateList: ['required'],
        //   onChange: value => {
        //     this.formData.spaceId = value;
        //   }
        // },
        // {
        //   type: 'text',
        //   name: 'spaceName',
        //   label: 'Wiki Space 名称',
        //   value: this.formData.spaceName,
        //   width: '100%',
        //   onChange: value => {
        //     this.formData.spaceName = value;
        //   }
        // },
        {
          type: 'radio',
          name: 'isActive',
          label: '启用',
          value: this.formData.isActive,
          dataList: [
            { value: 1, text: this.$t('page.yes') },
            { value: 0, text: this.$t('page.no') }
          ],
          validateList: ['required'],
          onChange: value => {
            this.formData.isActive = value;
          }
        }
      ];
    },
    getLatestConfigById() {
      if (!this.formData.id) {
        return;
      }
      // 接口入参保持为 {id}，返回后重建表单配置以刷新 TsForm 中的 value。
      this.$api.knowledge.feishu.getConfig({ id: this.formData.id }).then(res => {
        if (res.Status === 'OK' && res.Return) {
          this.formData = this.buildFormData({
            ...this.formData,
            ...res.Return
          });
          this.initFormConfig();
        }
      });
    },
    save() {
      const form = this.$refs.form;
      if (form && form.valid()) {
        // 保存前复制一份，避免删除空 token 时影响当前表单再次提交。
        const params = { ...this.formData };
        // if (params.id && !params.userAccessToken) {
        //   delete params.userAccessToken;
        // }
        this.$api.knowledge.feishu.saveConfig(params).then(res => {
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
