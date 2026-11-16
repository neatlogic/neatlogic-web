<template>
  <div class="env-autoconfig-box bg-op env-autoconfig-radius">
    <Loading :loadingShow="loading" type="fix"></Loading>
    <div class="text-left">
      <ul class="pt-nm pl-nm action-group">
        <template v-if="hasAutoConfig">
          <li v-if="hasEditConfigAuth" class="action-item tsfont-edit text-href" @click="isShowEnvEdit = true">{{ $t('page.edit') }}</li>
          <Tooltip
            v-else
            max-width="400"
            placement="right"
            transfer
            :content="$t('term.deploy.noconfigauthtip')"
          >
            <span class="tsfont-edit text-disabled action-item">{{ $t('page.edit') }}</span>
          </Tooltip>
        </template>
        <li class="action-item tsfont-task text-href" @click="isShowEnvAutoConfigAudit = true">{{ $t('page.audit') }}</li>
      </ul>
    </div>
    <div v-if="hasAutoConfig" class="padding">
      <TsTable :theadList="envTheadList" :tbodyList="defaults" :fixedHeader="false">
        <template slot="value" slot-scope="{row}">
          <span>{{ displayValue(row) }}</span>
        </template>
      </TsTable>
    </div>
    <div v-else class="autocfg-box flex-center text-grey">
      <template v-if="hasEditConfigAuth">
        <span>{{ $t('term.deploy.notconfigfiletip') }}</span>
        <span class="tsfont-plus text-href ml-xs" @click="isShowEnvEdit = true">{{ $t('page.config') }}</span>
      </template>
      <NoData v-else></NoData>
    </div>
    <div class="border-bottom border-color"></div>
    <div class="padding">
      <div v-if="hasInstance" class="pb-xs">
        <span class="pr-nm">{{ $t('term.deploy.configfilecasedifference') }}</span>
        <span v-if="hasEditConfigAuth" class="tsfont-plus text-href" @click="openEnvDifferenceEdit()">{{ $t('page.add') }}</span>
      </div>
      <div v-else class="flex-center diff-empty text-grey">
        <template v-if="hasEditConfigAuth">
          <span>{{ $t('term.deploy.notconfigdifftip') }}</span>
          <span class="text-href pl-xs" @click="openEnvDifferenceEdit()">{{ $t('page.add') }}</span>
        </template>
        <NoData v-else></NoData>
      </div>
      <div v-for="item in instanceAutoConfigList" :key="item.instanceId" class="pb-nm">
        <div class="operation-box pb-xs">
          <span>{{ getIPPortName(item) }}</span>
          <div v-if="hasEditConfigAuth" class="action-group">
            <span class="action-item tsfont-edit text-action" @click="openEnvDifferenceEdit(item)">{{ $t('page.edit') }}</span>
            <span class="action-item tsfont-task text-action" @click="openEnvDifferenceAudit(item)">{{ $t('page.audit') }}</span>
            <span class="tsfont-trash-o text-action" @click="delEnvDifference(item)">{{ $t('page.delete') }}</span>
          </div>
        </div>
        <TsTable :theadList="envTheadList" :tbodyList="item.keyValueList" :fixedHeader="false">
          <template slot="value" slot-scope="{row}"><span>{{ displayValue(row) }}</span></template>
        </TsTable>
      </div>
    </div>
    <EnvAutoconfigEdit
      v-if="isShowEnvEdit"
      :isEdit="hasAutoConfig"
      :busy="saving"
      allowUnsetText
      :tableData="{tbodyList:defaults}"
      :params="params"
      @close="isShowEnvEdit = false"
      @save="saveAutoConfig"
    ></EnvAutoconfigEdit>
    <EnvAutoconfigAudit
      v-if="isShowEnvAutoConfigAudit"
      :instanceId="0"
      :params="params"
      @close="closeAutoConfigAudit"
    ></EnvAutoconfigAudit>
    <EnvAutoconfigInstanceDifferenceEdit
      v-if="isShowEnvDifferenceEdit"
      :instanceId="instanceId"
      :params="params"
      @close="closeDifference"
    ></EnvAutoconfigInstanceDifferenceEdit>
    <EnvAutoconfigAudit
      v-if="isShowEnvDifferenceAudit"
      :instanceId="instanceId"
      :params="params"
      @close="closeEnvDifferenceAudit"
    ></EnvAutoconfigAudit>
  </div>
</template>
<script>
export default {
  components: {
    EnvAutoconfigEdit: () => import('./env-autoconfig-edit'),
    EnvAutoconfigAudit: () => import('./env-autoconfig-audit'),
    EnvAutoconfigInstanceDifferenceEdit: () => import('./env-autoconfig-instance-difference-edit'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  props: {params: {type: Object, default: () => ({})}, hasEditConfigAuth: Boolean},
  data() {
    return {loading: false, saving: false, defaults: [], instanceAutoConfigList: [], instanceId: null,
      isShowEnvEdit: false, isShowEnvAutoConfigAudit: false, isShowEnvDifferenceEdit: false, isShowEnvDifferenceAudit: false};
  },
  methods: {
    // 环境参数变化后清空旧视图，仅接收当前环境的响应。
    async getEnvInfo() {
      const scope = JSON.stringify(this.params);
      this.loading = true;
      this.defaults = [];
      this.instanceAutoConfigList = [];
      try {
        const res = await this.$api.deploy.applicationConfig.getEnvInfo({...this.params});
        if (scope !== JSON.stringify(this.params) || res.Status !== 'OK') return;
        this.defaults = res.Return?.envAutoConfigList || [];
        this.instanceAutoConfigList = (res.Return?.instanceAutoConfigList || []).filter(item => item.keyValueList?.length);
      } finally {
        if (scope === JSON.stringify(this.params)) this.loading = false;
      }
    },
    displayValue(row) {
      if (row.isEmpty || (!row.value && !row.filledFields?.includes('value'))) return this.$t('page.settonull');
      return row.type === 'password' ? '••••••••' : row.value;
    },
    openEnvDifferenceEdit(item) {
      this.instanceId = item?.instanceId || null;
      this.isShowEnvDifferenceEdit = true;
    },
    openEnvDifferenceAudit(item) {
      this.instanceId = item.instanceId;
      this.isShowEnvDifferenceAudit = true;
    },
    // 审计回滚成功后重新读取正式值，避免后续编辑沿用回滚前的数据。
    async closeAutoConfigAudit(needRefresh = false) {
      this.isShowEnvAutoConfigAudit = false;
      if (needRefresh) await this.getEnvInfo();
    },
    // 实例差异与环境默认变量共用刷新入口，取消审计时保留当前列表。
    async closeEnvDifferenceAudit(needRefresh = false) {
      this.isShowEnvDifferenceAudit = false;
      if (needRefresh) await this.getEnvInfo();
    },
    closeDifference(refresh) {
      this.isShowEnvDifferenceEdit = false;
      if (refresh) this.getEnvInfo();
    },
    getIPPortName(item) {
      return item.instanceIp ? item.instanceIp + (item.instancePort ? ':' + item.instancePort : '') + (item.instanceName ? '[' + item.instanceName + ']' : '') : '';
    },
    // 正式配置保存期间阻止重复提交，失败后保留编辑副本。
    async saveAutoConfig(params) {
      if (this.saving) return;
      this.saving = true;
      try {
        const res = await this.$api.deploy.applicationConfig.saveEnvAutoConfig({...params, instanceId: 0});
        if (res.Status === 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.isShowEnvEdit = false;
          await this.getEnvInfo();
        }
      } finally { this.saving = false; }
    },
    delEnvDifference(item) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: this.$t('term.deploy.casedifference')}),
        btnType: 'error',
        'on-ok': async vnode => {
          if (this.saving) return;
          this.saving = true;
          try {
            const res = await this.$api.deploy.applicationConfig.delEnvExample({...this.params, instanceId: item.instanceId});
            if (res.Status === 'OK') {
              vnode.isShow = false;
              this.instanceAutoConfigList = this.instanceAutoConfigList.filter(row => row.instanceId !== item.instanceId);
              this.$Message.success(this.$t('message.deletesuccess'));
            }
          } finally { this.saving = false; }
        }
      });
    }
  },
  computed: {
    hasAutoConfig() { return !!this.defaults.length; },
    hasInstance() { return !!this.instanceAutoConfigList.length; },
    envTheadList() {
      return [{key: 'key', title: this.$t('page.variablename')}, {key: 'typeText', title: this.$t('page.type')},
        {key: 'value', title: this.$t('page.variablevalue')}];
    }
  },
  watch: {params: {deep: true, immediate: true, handler() {
    this.isShowEnvEdit = false;
    this.isShowEnvDifferenceEdit = false;
    this.isShowEnvAutoConfigAudit = false;
    this.isShowEnvDifferenceAudit = false;
    this.getEnvInfo();
  }}}
};
</script>
<style scoped>
.env-autoconfig-box {height:calc(100vh - 50px - 50px - 32px - 16px);overflow-y:auto;border-radius:0 10px 10px}
.autocfg-box {height:148px}
.diff-empty {height:128px}
.border-bottom {border-bottom:1px solid}
.operation-box {display:flex;justify-content:space-between}
</style>
