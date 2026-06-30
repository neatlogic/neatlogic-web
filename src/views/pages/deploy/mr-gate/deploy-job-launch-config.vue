<template>
  <TsForm ref="form" v-model="formValue" :item-list="formConfig"></TsForm>
</template>

<script>
export default {
  name: 'DeployJobGateLaunchConfig',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  model: {
    prop: 'value',
    event: 'input'
  },
  props: {
    value: { type: Object, default: () => ({}) },
    appSystemId: { type: [Number, String] },
    appModuleId: { type: [Number, String] }
  },
  data() {
    const formValue = this.buildValue(this.value);
    return {
      formValue: formValue,
      loadToken: 0,
      envList: [],
      scenarioList: []
    };
  },
  mounted() {
    this.loadDeployConfig();
  },
  methods: {
    valid() {
      return this.$refs.form ? this.$refs.form.valid() : true;
    },
    getFormValue() {
      const nextValue = this.syncSelectedText(this.formValue);
      if (!this.isSameValue(nextValue, this.formValue)) {
        this.formValue = nextValue;
      }
      return this.buildValue(nextValue);
    },
    isSameValue(a, b) {
      return JSON.stringify(a || {}) === JSON.stringify(b || {});
    },
    buildValue(value) {
      const data = value || {};
      return {
        appSystemId: data.appSystemId || this.appSystemId || null,
        appModuleId: data.appModuleId || this.appModuleId || null,
        envId: data.envId || null,
        envName: data.envName || '',
        scenarioId: data.scenarioId || null,
        scenarioName: data.scenarioName || '',
        versionSource: this.getVersionSource(data.versionSource)
      };
    },
    getVersionSource(value) {
      if (value === 'sourceBranch' || value === 'mrVersion') {
        return value;
      }
      return 'targetBranch';
    },
    isSameId(a, b) {
      return (a || '') + '' === (b || '') + '';
    },
    findItemById(list, id, idKey) {
      if (!id) {
        return null;
      }
      return (list || []).find(item => this.isSameId(item[idKey], id)) || null;
    },
    findSelectableItem(list, id, idKey, defaultItem) {
      const dataList = list || [];
      const currentItem = this.findItemById(dataList, id, idKey);
      if (currentItem) {
        return currentItem;
      }
      if (id) {
        return {};
      }
      if (defaultItem && defaultItem[idKey] && defaultItem.isEnable !== false) {
        return defaultItem;
      }
      return dataList.find(item => item.isEnable !== false) || dataList[0] || {};
    },
    syncSelectedText(value) {
      const data = this.buildValue(value);
      const env = this.findItemById(this.envList, data.envId, 'id');
      const scenario = this.findItemById(this.scenarioList, data.scenarioId, 'scenarioId');
      return {
        ...data,
        envName: env ? env.name : '',
        scenarioName: scenario ? scenario.scenarioName : ''
      };
    },
    loadDeployConfig() {
      const appSystemId = this.formValue.appSystemId || this.appSystemId;
      const appModuleId = this.formValue.appModuleId || this.appModuleId;
      if (!appSystemId) {
        this.envList = [];
        this.scenarioList = [];
        return;
      }
      const params = {
        appSystemId: appSystemId
      };
      if (appModuleId) {
        params.appModuleId = appModuleId;
      }
      const currentToken = ++this.loadToken;
      this.$api.deploy.job.getCreateJobData(params).then(res => {
        if (currentToken !== this.loadToken) {
          return;
        }
        if (res && res.Status === 'OK') {
          const returnData = res.Return || {};
          const envList = returnData.envList || [];
          const scenarioList = returnData.scenarioList || [];
          this.envList = envList;
          this.scenarioList = scenarioList;
          const env = this.findSelectableItem(envList, this.formValue.envId, 'id', returnData.defaultSelectEnv);
          const scenario = this.findSelectableItem(scenarioList, this.formValue.scenarioId, 'scenarioId', returnData.defaultSelectScenario);
          const nextValue = {
            ...this.formValue,
            appSystemId: appSystemId || null,
            appModuleId: appModuleId || null,
            envId: env.id || null,
            envName: env.name || '',
            scenarioId: scenario.scenarioId || null,
            scenarioName: scenario.scenarioName || ''
          };
          if (!this.isSameValue(nextValue, this.formValue)) {
            this.formValue = nextValue;
          }
        }
      });
    }
  },
  computed: {
    formConfig() {
      return {
        envId: {
          type: 'select',
          label: '环境',
          validateList: ['required'],
          dataList: this.envDataList,
          transfer: true,
          search: true,
          desc: '从发布模块当前应用配置查询后选择'
        },
        scenarioId: {
          type: 'select',
          label: '场景名称',
          validateList: ['required'],
          dataList: this.scenarioDataList,
          transfer: true,
          search: true,
          desc: '从发布模块当前应用配置查询后选择'
        },
        versionSource: {
          type: 'select',
          label: '版本号',
          validateList: ['required'],
          dataList: [
            { value: 'sourceBranch', text: '源分支' },
            { value: 'targetBranch', text: '目标分支' },
            { value: 'mrVersion', text: 'MR版本号' }
          ],
          transfer: true,
          onChange: value => {
            if ((value === null || value === undefined || value === '') && this.formValue.versionSource) {
              return;
            }
            this.$set(this.formValue, 'versionSource', this.getVersionSource(value));
          },
          desc: '选择使用MR源分支、目标分支或MR版本号作为发布版本号'
        }
      };
    },
    envDataList() {
      return (this.envList || []).map(item => ({
        value: item.id,
        text: item.name,
        disabled: item.isEnable === false
      }));
    },
    scenarioDataList() {
      return (this.scenarioList || []).map(item => ({
        value: item.scenarioId,
        text: item.scenarioName,
        disabled: item.isEnable === false
      }));
    }
  },
  watch: {
    value: {
      handler(value) {
        const nextValue = this.buildValue(value);
        if (!this.isSameValue(nextValue, this.formValue)) {
          this.formValue = nextValue;
          this.loadDeployConfig();
        }
      },
      deep: true
    },
    formValue: {
      handler(value) {
        const nextValue = this.syncSelectedText(value);
        if (!this.isSameValue(nextValue, value)) {
          this.formValue = nextValue;
          return;
        }
        if (!this.isSameValue(nextValue, this.value)) {
          this.$emit('input', nextValue);
        }
      },
      deep: true
    },
    appSystemId(value) {
      if (!this.formValue.appSystemId && value) {
        this.$set(this.formValue, 'appSystemId', value);
      }
      this.loadDeployConfig();
    },
    appModuleId(value) {
      if (!this.formValue.appModuleId && value) {
        this.$set(this.formValue, 'appModuleId', value);
      }
      this.loadDeployConfig();
    }
  }
};
</script>
