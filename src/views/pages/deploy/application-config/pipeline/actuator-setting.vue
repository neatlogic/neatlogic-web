<template>
  <div>
    <div v-if="moduleList.length">
      <TsFormItem v-for="(item,index) in moduleList" :key="index" :label="item.label">
        <TsFormSelect
          v-model="item.runnerGroupId"
          v-bind="runnerGroupConfig"
        ></TsFormSelect>
      </TsFormItem>
    </div>
    <div v-else class="text-center pt-nm">{{ $t('term.deploy.applynoaddmoduletip') }}</div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  props: {
    appSystemId: Number
  },
  data() {
    return {
      moduleList: [],
      runnerGroupConfig: {
        dynamicUrl: '/api/rest/runnergroup/search',
        rootName: 'tbodyList',
        textName: 'name',
        valueName: 'id',
        search: true,
        transfer: true,
        border: 'border'
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getModuleList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getModuleList() {
      if (!this.appSystemId) {
        return;
      }
      this.$api.deploy.applicationConfig.getAppModuleTreeList({ appSystemId: this.appSystemId }).then(res => {
        if (res && res.Status == 'OK') {
          let moduleList = res.Return || [];
          if (moduleList.length) {
            moduleList.forEach(item => {
              this.moduleList.push({
                label: item.abbrName,
                appSystemId: this.appSystemId,
                appModuleId: item.id,
                runnerGroupId: null
              });
            });
          }
        }
      });
    },
    save() {
      let list = [];
      this.moduleList.forEach(item => {
        if (item.runnerGroupId) {
          list.push({
            appSystemId: this.appSystemId,
            appModuleId: item.appModuleId,
            runnerGroupId: item.runnerGroupId
          });
        }
      });
      return list;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
