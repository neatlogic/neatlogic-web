<template>
  <TsDialog
    type="modal"
    width="medium"
    :isShow="true"
    :loading="busy"
    :okBtnDisable="!ready || busy"
    :okText="$t('page.save')"
    :title="$t(instanceId ? 'dialog.title.edittarget' : 'dialog.title.addtarget', {target: $t('term.deploy.casedifference')})"
    @on-ok="save"
    @on-close="$emit('close', false)"
  >
    <DifferenceForm
      v-if="ready"
      ref="form"
      :instanceId="instanceId"
      :instanceField="instanceField"
      :initialRows="rows"
      :variables="variables"
      inheritPassword
      allowUnsetText
    ></DifferenceForm>
  </TsDialog>
</template>
<script>
import DifferenceForm from './env-instance-difference-form.vue';
export default {
  components: {DifferenceForm},
  props: {instanceId: [String, Number], params: {type: Object, default: () => ({})}},
  data() {
    const {appSystemId, appModuleId, envId} = this.params;
    return {
      ready: false,
      busy: false,
      rows: [],
      variables: [],
      instanceField: {
        name: 'instanceId', type: 'select', label: this.$t('page.instance'), labelPosition: 'top', transfer: true,
        validateList: ['required'], dynamicUrl: 'api/rest/deploy/app/module/env/auto/config/instance/search',
        params: {appSystemId, appModuleId, envId, isAutoConfig: 0}, rootName: 'tbodyList',
        dealDataByUrl: list => (list || []).map(({id, ip, port, name}) => ({
          value: id, text: ip ? ip + (port ? ':' + port : '') + (name ? '[' + name + ']' : '') : ''
        }))
      }
    };
  },
  // 正式配置从原环境接口读取可覆盖变量及实例当前值。
  async created() {
    this.busy = true;
    try {
      const {appSystemId, appModuleId, envId} = this.params;
      const res = await this.$api.deploy.applicationConfig.getEnvInfo({appSystemId, appModuleId, envId});
      if (res.Status !== 'OK') return;
      const {envAutoConfigList, instanceAutoConfigList} = res.Return;
      this.variables = (envAutoConfigList || []).map(v => ({text: v.key, value: v.key, componentType: v.type || 'text', variableValue: v.value}));
      const group = (instanceAutoConfigList || []).find(item => item.instanceId == this.instanceId);
      this.rows = (group?.keyValueList || []).map(v => ({...v, isEmpty: Object.prototype.hasOwnProperty.call(v, 'value') && !v.value ? 1 : 0}));
      this.ready = true;
    } finally {
      this.busy = false;
    }
  },
  methods: {
    // 更换所属实例时沿用正式接口的原实例删除参数。
    async save() {
      if (this.busy || !this.ready) return;
      const values = this.$refs.form.read();
      if (!values) {
        this.$Notice.warning({title: this.$t('page.tip'), desc: this.$t('page.requiredparameterhasnullvalue')});
        return;
      }
      const {appSystemId, appModuleId, envId} = this.params;
      const payload = {appSystemId, appModuleId, envId, ...values};
      if (this.instanceId && values.instanceId != this.instanceId) payload.deleteInstanceId = this.instanceId;
      this.busy = true;
      try {
        const res = await this.$api.deploy.applicationConfig.saveEnvAutoConfig(payload);
        if (res.Status === 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.$emit('close', true);
        }
      } finally {
        this.busy = false;
      }
    }
  }
};
</script>
