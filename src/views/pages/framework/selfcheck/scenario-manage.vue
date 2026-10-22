<template>
  <div>
    <TsContain>
      <template v-slot:topLeft>
        <div class="action-group">
          <span v-auth="['SELF_CHECK_MODIFY']" class="action-item tsfont-plus text-action" @click="addScenario">{{ $t('term.framework.selfcheck.newscenario') }}</span>
          <span class="action-item tsfont-formstaticlist text-action" @click="showRunHistory">{{ $t('term.framework.selfcheck.runhistory') }}</span>
        </div>
      </template>
      <template v-slot:topRight>
        <CombineSearcher v-model="searchValue" v-bind="searchConfig" @change="searchScenario(1)"></CombineSearcher>
      </template>
      <template v-slot:content>
        <TsTable
          v-bind="tableData"
          :theadList="theadList"
          @changeCurrent="searchScenario"
          @changePageSize="changePageSize"
        >
          <template v-slot:name="{ row }">
            <span v-if="$AuthUtils.hasRole('SELF_CHECK_EXECUTE')" class="text-href" @click="showRunScenario(row)">{{ row.name }}</span>
            <span v-else>{{ row.name }}</span>
          </template>
          <template v-slot:status="{ row }">
            <TsFormSwitch
              :value="row.status === 'ENABLED'"
              :trueValue="true"
              :falseValue="false"
              :showStatus="true"
              :trueText="$t('page.isactived')"
              :falseText="$t('page.ban')"
              :readonly="!$AuthUtils.hasRole('SELF_CHECK_MODIFY')"
              :disabled="isScenarioStatusUpdating(row)"
              :beforeChange="() => beforeChangeScenarioStatus(row)"
            ></TsFormSwitch>
          </template>
          <template v-slot:isScriptValid="{ row }">
            <span v-if="row.isScriptValid === true || row.isScriptValid === 1" class="text-success tsfont-check">{{ $t('term.framework.selfcheck.valid') }}</span>
            <span v-else class="text-error tsfont-close">{{ $t('term.framework.selfcheck.invalid') }}</span>
          </template>
          <template v-slot:lcu="{ row }">
            <UserCard v-if="row.lcu" :uuid="row.lcu"></UserCard>
          </template>
          <template v-slot:action="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li v-auth="['SELF_CHECK_MODIFY']" class="tsfont-edit" @click="editScenario(row)">{{ $t('page.edit') }}</li>
                <li v-auth="['SELF_CHECK_MODIFY']" class="tsfont-trash-o" @click="deleteScenario(row)">{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </template>
    </TsContain>
  </div>
</template>
<script>
export default {
  name: 'SelfCheckScenarioManage',
  components: {
    TsContain: () => import('@/resources/components/TsContain/TsContain.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    CombineSearcher: () => import('@/resources/components/CombineSearcher/CombineSearcher.vue'),
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch')
  },
  data() {
    return {
      searchValue: {},
      searchParam: {
        currentPage: 1,
        pageSize: 20
      },
      statusUpdatingIdList: [],
      tableData: {},
      searchConfig: {
        labelPosition: 'left',
        searchList: [
          {
            type: 'select',
            name: 'status',
            label: this.$t('page.status'),
            dataList: [
              { value: 'DRAFT', text: this.$t('term.framework.selfcheck.scenariostatus.draft') },
              { value: 'ENABLED', text: this.$t('term.framework.selfcheck.scenariostatus.enabled') },
              { value: 'DISABLED', text: this.$t('term.framework.selfcheck.scenariostatus.disabled') }
            ],
            transfer: true
          }
        ]
      },
      theadList: [
        { key: 'name', title: this.$t('page.name') },
        { key: 'description', title: this.$t('page.description') },
        { key: 'status', title: this.$t('page.status') },
        { key: 'itemCount', title: this.$t('term.framework.selfcheck.itemcount') },
        { key: 'isScriptValid', title: this.$t('term.framework.selfcheck.scriptstatus') },
        { key: 'lcu', title: this.$t('page.updateuser') },
        { key: 'lcd', title: this.$t('page.updatetime'), type: 'time' },
        { key: 'action', title: '', align: 'right' }
      ]
    };
  },
  created() {
    this.searchScenario();
  },
  methods: {
    searchScenario(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      const params = Object.assign({}, this.searchParam, this.searchValue);
      this.$api.framework.selfcheck.searchScenario(params).then(res => {
        if (res.Status === 'OK') {
          this.tableData = res.Return || {};
        }
      });
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchScenario(1);
    },
    addScenario() {
      this.$router.push({ name: 'scenario-edit' });
    },
    editScenario(row) {
      this.$router.push({ name: 'scenario-edit', query: { id: row.id } });
    },
    showRunScenario(row) {
      this.$router.push({ name: 'scenario-run', query: { scenarioId: row.id } });
    },
    showRunHistory() {
      this.$router.push({ name: 'run-manage' });
    },
    isScenarioStatusUpdating(row) {
      return this.statusUpdatingIdList.includes(row.id);
    },
    /** 状态接口成功后再切换开关，失败时由 TsFormSwitch 保持原状态。 */
    async beforeChangeScenarioStatus(row) {
      const targetStatus = row.status === 'ENABLED' ? 'DISABLED' : 'ENABLED';
      if (targetStatus === 'ENABLED' && row.isScriptValid !== true && row.isScriptValid !== 1) {
        this.$Message.warning(this.$t('term.framework.selfcheck.enableblocked'));
        return false;
      }
      if (this.isScenarioStatusUpdating(row)) {
        return false;
      }
      this.statusUpdatingIdList.push(row.id);
      try {
        const res = await this.$api.framework.selfcheck.updateScenarioStatus({
          id: row.id,
          status: targetStatus,
          version: row.version
        });
        if (res.Status === 'OK') {
          this.$set(row, 'status', targetStatus);
          if (res.Return && res.Return.version) {
            this.$set(row, 'version', res.Return.version);
          }
          this.$Message.success(this.$t('message.updatesuccess'));
          return true;
        }
      } catch {
        return false;
      } finally {
        this.statusUpdatingIdList = this.statusUpdatingIdList.filter(id => id !== row.id);
      }
      return false;
    },
    deleteScenario(row) {
      this.$createDialog({
        title: this.$t('page.warning'),
        content: this.$t('dialog.content.deleteconfirm', { target: row.name }),
        btnType: 'error',
        onOk: vnode => {
          this.$api.framework.selfcheck.deleteScenario({ id: row.id }).then(res => {
            if (res.Status === 'OK') {
              vnode.isShow = false;
              this.$Message.success(this.$t('message.deletesuccess'));
              this.searchScenario(1);
            }
          });
        }
      });
    }
  }
};
</script>
