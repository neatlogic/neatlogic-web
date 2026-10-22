<template>
  <div>
    <TsContain>
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="tsfont-left text-action" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <span>{{ scenarioData.id ? $t('term.framework.selfcheck.editscenario') : $t('term.framework.selfcheck.newscenario') }}</span>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <div class="action-item">
            <TsFormSwitch
              :value="isScenarioEnabled"
              :trueValue="true"
              :falseValue="false"
              :showStatus="true"
              :trueText="$t('page.isactived')"
              :falseText="$t('page.ban')"
              :disabled="isStatusSwitchDisabled"
              :beforeChange="beforeChangeScenarioStatus"
            ></TsFormSwitch>
          </div>
          <div class="action-item">
            <Button
              type="primary"
              :loading="saving"
              :disabled="statusUpdating"
              @click="saveScenario"
            >{{ $t('page.save') }}</Button>
          </div>
        </div>
      </template>
      <template v-slot:content>
        <div class="mb-md">
          <TsFormItem :label="$t('page.name')" :required="true">
            <TsFormInput
              ref="nameInput"
              v-model="scenarioData.name"
              :maxlength="100"
              :validateList="['required']"
            ></TsFormInput>
          </TsFormItem>
          <TsFormItem :label="$t('page.description')">
            <TsFormInput v-model="scenarioData.description" type="textarea" :maxlength="500"></TsFormInput>
          </TsFormItem>
        </div>
        <TsFormItem :label="$t('term.framework.selfcheck.checkitem')">
          <div class="action-group mb-md">
            <span class="action-item tsfont-plus text-action" @click="addItem">{{ $t('term.framework.selfcheck.checkitem') }}</span>
            <span v-if="hasInvalidItem" class="action-item text-error tsfont-warning-s">{{ $t('term.framework.selfcheck.invaliditemtip') }}</span>
          </div>
          <TsTable
            :theadList="theadList"
            :tbodyList="scenarioData.itemList"
            :hideAction="true"
            :canDrag="true"
            @updateRowSort="updateRowSort"
          >
            <template v-slot:target="{ row }">
              <span>{{ getTargetName(row) }}</span>
              <span class="text-grey ml-xs">{{ row.apiToken }}</span>
            </template>
            <template v-slot:isActive="{ row }">
              <span v-if="row.isActive === 1 || row.isActive === true" class="text-success">{{ $t('page.yes') }}</span>
              <span v-else class="text-grey">{{ $t('page.no') }}</span>
            </template>
            <template v-slot:isScriptValid="{ row }">
              <span v-if="row.isScriptValid === true || row.isScriptValid === 1" class="text-success tsfont-check">{{ $t('term.framework.selfcheck.valid') }}</span>
              <span v-else class="text-error tsfont-close">{{ $t('term.framework.selfcheck.invalid') }}</span>
            </template>
            <template v-slot:action="{ row, index }">
              <div class="tstable-action">
                <ul class="tstable-action-ul">
                  <li class="tsfont-edit" @click="editItem(row, index)">{{ $t('page.edit') }}</li>
                  <li class="tsfont-trash-o" @click="deleteItem(index)">{{ $t('page.delete') }}</li>
                </ul>
              </div>
            </template>
          </TsTable>
        </TsFormItem>
      </template>
    </TsContain>
    <SelfCheckScenarioItemEdit v-if="editingItem" :item="editingItem.data" @close="closeItemEdit"></SelfCheckScenarioItemEdit>
  </div>
</template>
<script>
export default {
  name: 'SelfCheckScenarioEdit',
  components: {
    TsContain: () => import('@/resources/components/TsContain/TsContain.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    SelfCheckScenarioItemEdit: () => import('./scenario-item-edit.vue')
  },
  data() {
    return {
      scenarioData: {
        id: null,
        name: '',
        description: '',
        status: 'DRAFT',
        version: null,
        itemList: []
      },
      editingItem: null,
      saving: false,
      statusUpdating: false,
      theadList: [
        { key: 'name', title: this.$t('page.name') },
        { key: 'target', title: this.$t('term.framework.selfcheck.target') },
        { key: 'isActive', title: this.$t('page.isactive') },
        { key: 'isScriptValid', title: this.$t('term.framework.selfcheck.scriptstatus') },
        { key: 'action' }
      ]
    };
  },
  created() {
    if (this.$route.query.id) {
      this.getScenario(this.$route.query.id);
    }
  },
  methods: {
    getScenario(id) {
      return this.$api.framework.selfcheck.getScenario({ id }).then(res => {
        if (res.Status === 'OK') {
          const data = res.Return || {};
          data.itemList = data.itemList || [];
          this.scenarioData = data;
          this.resetSort();
        }
      });
    },
    addItem() {
      this.editingItem = { index: -1, data: null };
    },
    editItem(row, index) {
      this.editingItem = { index, data: row };
    },
    closeItemEdit(item) {
      if (item) {
        if (this.editingItem.index > -1) {
          this.$set(this.scenarioData.itemList, this.editingItem.index, item);
        } else {
          this.scenarioData.itemList.push(item);
        }
        this.resetSort();
      }
      this.editingItem = null;
    },
    deleteItem(index) {
      this.$createDialog({
        title: this.$t('page.warning'),
        content: this.$t('dialog.content.deleteconfirm', { target: this.scenarioData.itemList[index].name }),
        btnType: 'error',
        onOk: vnode => {
          this.scenarioData.itemList.splice(index, 1);
          this.resetSort();
          vnode.isShow = false;
        }
      });
    },
    updateRowSort(event, list) {
      this.scenarioData.itemList = (list || []).slice();
      this.resetSort();
    },
    resetSort() {
      this.scenarioData.itemList.forEach((item, index) => {
        this.$set(item, 'sort', index + 1);
      });
    },
    getTargetName(row) {
      return row.apiName || row.apiToken;
    },
    buildSaveData() {
      const data = {
        id: this.scenarioData.id,
        name: this.scenarioData.name,
        description: this.scenarioData.description,
        status: this.scenarioData.status,
        version: this.scenarioData.version,
        itemList: this.scenarioData.itemList.map(item => ({
          id: item.id,
          name: item.name,
          isActive: item.isActive,
          sort: item.sort,
          apiToken: item.apiToken,
          requestParam: item.requestParam,
          verifyScript: item.verifyScript,
          apiTimeout: item.apiTimeout,
          scriptTimeout: item.scriptTimeout
        }))
      };
      if (this.hasInvalidItem && data.status === 'ENABLED') {
        data.status = 'DRAFT';
      }
      return data;
    },
    async saveScenario(showMessage = true) {
      if (!this.$refs.nameInput || !this.$refs.nameInput.valid()) {
        return false;
      }
      this.saving = true;
      try {
        const res = await this.$api.framework.selfcheck.saveScenario(this.buildSaveData());
        if (res.Status === 'OK') {
          const result = res.Return || {};
          this.scenarioData.id = result.id || this.scenarioData.id;
          this.scenarioData.version = result.version || this.scenarioData.version;
          if (Array.isArray(result.diagnosticList) && result.diagnosticList.length) {
            this.applySaveDiagnostic(result.diagnosticList);
          }
          if (result.isScriptValid === false || result.isScriptValid === 0) {
            this.scenarioData.status = 'DRAFT';
          }
          if (this.scenarioData.id) {
            await this.getScenario(this.scenarioData.id);
          }
          if (showMessage) {
            this.$Message.success(this.$t('message.savesuccess'));
          }
          if (!this.$route.query.id && this.scenarioData.id) {
            this.$router.replace({ name: 'scenario-edit', query: { id: this.scenarioData.id } });
          }
          return true;
        }
      } finally {
        this.saving = false;
      }
      return false;
    },
    applySaveDiagnostic(diagnosticList) {
      diagnosticList.forEach(diagnostic => {
        const item = this.scenarioData.itemList.find(row => String(row.id) === String(diagnostic.itemId));
        if (item) {
          this.$set(item, 'isScriptValid', false);
          this.$set(item, 'diagnosticList', diagnostic.diagnosticList || [diagnostic]);
        }
      });
    },
    /** 状态开关在接口成功后才真正切换，失败时由 TsFormSwitch 恢复原值。 */
    async beforeChangeScenarioStatus() {
      if (this.statusUpdating) {
        return false;
      }
      const targetStatus = this.isScenarioEnabled ? 'DISABLED' : 'ENABLED';
      if (targetStatus === 'ENABLED' && !this.canEnable) {
        return false;
      }
      this.statusUpdating = true;
      try {
        if (targetStatus === 'ENABLED') {
          const saved = await this.saveScenario(false);
          if (!saved || !this.canEnable) {
            return false;
          }
        }
        const res = await this.$api.framework.selfcheck.updateScenarioStatus({
          id: this.scenarioData.id,
          status: targetStatus,
          version: this.scenarioData.version
        });
        if (res.Status === 'OK') {
          this.scenarioData.status = targetStatus;
          if (res.Return && res.Return.version) {
            this.scenarioData.version = res.Return.version;
          }
          this.$Message.success(this.$t('message.updatesuccess'));
          return true;
        }
      } catch {
        return false;
      } finally {
        this.statusUpdating = false;
      }
      return false;
    }
  },
  computed: {
    activeItemList() {
      return this.scenarioData.itemList.filter(item => item.isActive === 1 || item.isActive === true);
    },
    hasInvalidItem() {
      return this.activeItemList.some(item => item.isScriptValid !== true && item.isScriptValid !== 1);
    },
    canEnable() {
      return !!this.scenarioData.id && this.activeItemList.length > 0 && !this.hasInvalidItem;
    },
    isScenarioEnabled() {
      return this.scenarioData.status === 'ENABLED';
    },
    isStatusSwitchDisabled() {
      return this.saving || this.statusUpdating || (!this.isScenarioEnabled && !this.canEnable);
    }
  }
};
</script>
