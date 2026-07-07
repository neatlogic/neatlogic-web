<template>
  <div>
    <TsFormItem :label="label" labelPosition="top">
      <TsFormRadio
        v-model="action"
        :dataList="actionList"
        :disabled="!targetApp"
      ></TsFormRadio>
      <div class="text-grey mt-xs">
        <div>{{ $t('term.rdm.useoriginaldesc') }}</div>
        <div>{{ $t('term.rdm.createcopydesc') }}</div>
      </div>
      <div v-if="!targetApp" class="text-grey mt-xs">{{ $t('term.rdm.targetappdisabled') }}</div>
    </TsFormItem>
    <div class="mt-md">
      <Button type="primary" :disabled="!targetApp" @click="save">{{ $t('page.save') }}</Button>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio')
  },
  props: {
    appData: { type: Object },
    toAppType: { type: String, required: true },
    relType: { type: String, required: true },
    label: { type: String, required: true }
  },
  data() {
    return {
      action: 'original',
      appList: [],
      actionList: [
        { value: 'original', text: this.$t('term.rdm.useoriginal') },
        { value: 'copy', text: this.$t('term.rdm.createcopy') }
      ]
    };
  },
  created() {
    this.initAction();
    this.getProjectAppList();
  },
  methods: {
    initAction() {
      const strategy = this.relStrategyList.find(item => item.toAppType === this.toAppType && item.relType === this.relType);
      this.action = strategy && strategy.action === 'copy' ? 'copy' : 'original';
    },
    getProjectAppList() {
      if (this.appData && this.appData.projectId) {
        this.$api.rdm.project.getAppByProjectId(this.appData.projectId, { isActive: 1 }).then(res => {
          this.appList = res.Return || [];
        });
      }
    },
    save() {
      const config = this.$utils.deepClone(this.appData.config || {});
      const relStrategyList = (config.relStrategyList || []).filter(item => !(item.toAppType === this.toAppType && item.relType === this.relType));
      if (this.action === 'copy') {
        relStrategyList.push({
          toAppType: this.toAppType,
          relType: this.relType,
          action: this.action
        });
      }
      config.relStrategyList = relStrategyList;
      this.$api.rdm.app.saveAppConfig({ id: this.appData.id, config: config }).then(res => {
        if (res.Status === 'OK') {
          this.$set(this.appData, 'config', config);
          this.$Message.success(this.$t('message.savesuccess'));
        }
      });
    }
  },
  computed: {
    relStrategyList() {
      return (this.appData && this.appData.config && this.appData.config.relStrategyList) || [];
    },
    targetApp() {
      return this.appList.find(item => item.type === this.toAppType);
    }
  },
  watch: {
    relStrategyList() {
      this.initAction();
    }
  }
};
</script>
<style lang="less" scoped></style>
