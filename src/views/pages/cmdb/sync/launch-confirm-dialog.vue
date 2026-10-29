<template>
  <div>
    <TsDialog v-bind="dialogConfig" :showCloseIcon="!isBusy" @on-close="close()">
      <template v-slot>
        <div>
          <div class="mb-md">{{ $t('term.cmdb.executecollectmappingconfirm', { collection: collection.collectionName, ci: collection.ciLabel }) }}</div>
          <div v-if="isLoading" class="text-grey">{{ $t('page.loading') }}</div>
          <div v-if="loadFailed" class="text-error mb-md">
            {{ $t('term.cmdb.syncconditionloadfailed') }}
            <Button size="small" class="ml-sm" @click="getConditionList()">{{ $t('page.retry') }}</Button>
          </div>
          <div class="text-href">
            <span @click="toggleCondition()">{{ $t('term.cmdb.setfiltercondition') }}</span>
            <span :class="{ 'tsfont-drop-down': !isShowCondition, 'tsfont-drop-up': isShowCondition }"></span>
          </div>
          <div v-if="isShowCondition && conditionData" class="mt-md">
            <TsTable v-bind="conditionData" :fixedHeader="false">
              <template v-slot:field="{ row }">
                <div>{{ row.name }}</div>
                <div class="text-grey fz10">{{ row.desc }}</div>
              </template>
              <template v-slot:expression="{ row }">
                <TsFormSelect
                  :dataList="row.expressionList"
                  :disabled="isBusy || loadFailed"
                  :transfer="true"
                  :value="getConditionExpression(row.name)"
                  @change="
                    value => {
                      setConditionExpression(row, value);
                    }
                  "
                ></TsFormSelect>
              </template>
              <template v-slot:value="{ row }">
                <TsFormInput
                  :value="getConditionValue(row.name)"
                  :disabled="isBusy || loadFailed"
                  @change="
                    value => {
                      setConditionValue(row, value);
                    }
                  "
                ></TsFormInput>
              </template>
            </TsTable>
            <div class="mt-sm">
              <Button type="text" :disabled="isBusy || loadFailed" @click="clearCondition()">{{ $t('page.clear') }}</Button>
              <span>
                <Button
                  v-if="!isTesting"
                  type="text"
                  :disabled="isBusy || loadFailed"
                  @click="testCondition()"
                >{{ $t('term.cmdb.testfiltercondition') }}</Button>
                <span v-else class="text-grey">
                  <span>{{ $t('term.cmdb.testing') }}</span><span class="text-loading bg-info ml-xs"></span>
                </span>
              </span>
              <span v-if="matchConditionCount > 0">{{ $t('term.cmdb.matchconditionrecord', { count: matchConditionCount + (matchConditionCount > 99 ? '+' : '') }) }}</span>
              <span v-else-if="matchConditionCount == 0">{{ $t('term.cmdb.nomatchconditionrecord') }}</span>
            </div>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <Button :disabled="isBusy" @click="close()">{{ $t('page.cancel') }}</Button>
        <Button
          v-if="$AuthUtils.hasRole('SYNC_MODIFY')"
          :loading="isSaving"
          :disabled="isBusy || loadFailed"
          @click="saveDefaultCondition()"
        >{{ $t('term.cmdb.saveconditionpreset') }}</Button>
        <Button
          type="primary"
          :loading="isLaunching"
          :disabled="isBusy || loadFailed"
          @click="confirm()"
        >{{ $t('page.execute') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  props: {
    collection: { type: Object }
  },
  data() {
    return {
      isLoading: true,
      loadFailed: false,
      isSaving: false,
      isLaunching: false,
      isTesting: false,
      matchConditionCount: -1,
      isShowCondition: false,
      dialogConfig: {
        title: this.$t('dialog.title.executeconfirm'),
        isShow: true,
        maskClose: false,
        width: 'medium'
      },
      conditionData: {
        tbodyList: [],
        theadList: [
          { key: 'field', title: this.$t('page.attribute') },
          { key: 'type', title: this.$t('page.type') },
          { key: 'expression', title: this.$t('term.cmdb.expression') },
          { key: 'value', title: this.$t('page.value'), tooltip: this.$t('term.cmdb.multiplevaluecommatip') }
        ]
      },
      conditionList: []
    };
  },
  created() {
    this.getConditionList();
  },
  methods: {
    // 只关闭空闲弹窗，执行成功时同时通知列表刷新。
    close(refresh) {
      if (!this.isBusy) {
        this.$emit('close', refresh);
      }
    },
    // 测试当前完整条件，不修改已保存的预设。
    async testCondition() {
      if (this.isBusy || this.loadFailed || !this.validateConditionList()) {
        return;
      }
      this.isTesting = true;
      this.matchConditionCount = -1;
      try {
        const res = await this.$api.cmdb.sync.testCondition({ collectionId: this.collection.id, conditionList: this.conditionList });
        this.matchConditionCount = res.Return || 0;
      } finally {
        this.isTesting = false;
      }
    },
    // 收起编辑区域时保留条件，避免折叠操作意外扩大同步范围。
    toggleCondition() {
      this.isShowCondition = !this.isShowCondition;
    },
    // 明确清空本次条件，只有再次保存才会删除预设。
    clearCondition() {
      if (this.isBusy || this.loadFailed) {
        return;
      }
      this.conditionList = [];
      this.matchConditionCount = -1;
    },
    // 独立保存共享预设，成功后保留弹窗供继续执行。
    async saveDefaultCondition() {
      if (this.isBusy || this.loadFailed || !this.$AuthUtils.hasRole('SYNC_MODIFY') || !this.validateConditionList()) {
        return;
      }
      this.isSaving = true;
      try {
        await this.$api.cmdb.sync.saveSyncCiCollectionCondition({ id: this.collection.id, conditionList: this.conditionList });
        this.$Message.success(this.$t('message.savesuccess'));
      } finally {
        this.isSaving = false;
      }
    },
    // 显式传递当前条件，空数组表示本次跳过预设。
    async confirm() {
      if (this.isBusy || this.loadFailed || !this.validateConditionList()) {
        return;
      }
      this.isLaunching = true;
      try {
        await this.$api.cmdb.sync.launchSyncCiCollection({ id: this.collection.id, conditionList: this.conditionList });
        this.$Message.success(this.$t('message.runsuccess'));
        this.isLaunching = false;
        this.close([this.collection.id]);
      } finally {
        this.isLaunching = false;
      }
    },
    // 阻止不完整、已失效或与字段类型不符的条件被忽略后继续同步。
    validateConditionList() {
      const isValid = this.conditionList.every(condition => {
        const field = this.conditionData.tbodyList.find(row => row.name === condition.field);
        return field && String(field.type).toLowerCase() === String(condition.type).toLowerCase() &&
          field.expressionList.some(expression => expression.value === condition.expression) &&
          condition.value != null && String(condition.value).trim() !== '';
      });
      if (!isValid) {
        this.isShowCondition = true;
        this.$Message.error(this.$t('term.cmdb.syncconditioninvalid'));
      }
      return isValid;
    },
    // 读取当前字段的比较表达式。
    getConditionExpression(field) {
      const condition = this.conditionList.find(item => item.field === field);
      return condition && condition.expression;
    },
    // 更新比较表达式并清除过期的测试结果。
    setConditionExpression(condition, value) {
      this.setConditionProperty(condition, 'expression', value);
    },
    // 读取当前字段的过滤值。
    getConditionValue(field) {
      const condition = this.conditionList.find(item => item.field === field);
      return condition && condition.value;
    },
    // 更新过滤值并清除过期的测试结果。
    setConditionValue(condition, value) {
      this.setConditionProperty(condition, 'value', value);
    },
    // 两个输入均清空时删除条件；仅清空一项时保留另一项并由提交校验提示。
    setConditionProperty(field, property, value) {
      if (this.isBusy || this.loadFailed) {
        return;
      }
      const index = this.conditionList.findIndex(item => item.field === field.name);
      const item = { field: field.name, type: field.type, ...this.conditionList[index], [property]: value };
      if ((item.expression == null || item.expression === '') && (item.value == null || item.value === '')) {
        if (index > -1) {
          this.$delete(this.conditionList, index);
        }
      } else if (index > -1) {
        this.$set(this.conditionList, index, item);
      } else {
        this.conditionList.push(item);
      }
      this.matchConditionCount = -1;
    },
    // 同时加载字段和最新预设，任意请求失败时禁止保存和执行。
    async getConditionList() {
      this.isLoading = true;
      this.loadFailed = false;
      try {
        const [fields, detail] = await Promise.all([
          this.$api.cmdb.sync.getFieldByCollection(this.collection.id),
          this.$api.cmdb.sync.getSyncCiCollectionById(this.collection.id)
        ]);
        if (!detail.Return || !Array.isArray(fields.Return)) {
          this.loadFailed = true;
          return;
        }
        this.conditionData.tbodyList = fields.Return;
        this.conditionList = this.$utils.deepClone(detail.Return.defaultConditionList || []);
        this.isShowCondition = this.conditionList.length > 0;
        this.matchConditionCount = -1;
      } catch (error) {
        this.loadFailed = true;
      } finally {
        this.isLoading = false;
      }
    }
  },
  computed: {
    // 所有远程操作互斥，避免测试、保存和执行使用不同版本的条件。
    isBusy() {
      return this.isLoading || this.isTesting || this.isSaving || this.isLaunching;
    }
  }
};
</script>
