<template>
  <div class="nested-selector">
    <div v-if="!state" class="text-grey">{{ $t('page.dataloading') }}</div>
    <template v-else>
      <div v-for="(error, index) in state.validationErrors" :key="index" class="text-error mb-xs">
        <a v-if="error.childPage" class="text-error" @click="locateError(error)">{{ error.error }}</a>
        <span v-else>{{ error.error }}</span>
      </div>
      <div v-if="useSavedTable">
        <div v-if="state.status === 'loading'" class="text-grey">{{ $t('form.nestedSelector.loading') }}</div>
        <div v-if="state.error" class="text-error">
          {{ state.error }} <span v-if="!disabled" class="text-action" @click="$emit('retryNestedSelector', state.key)">{{ $t('page.retry') }}</span>
        </div>
        <div v-if="!state.ready && !state.snapshot && state.invalid" class="text-grey">{{ $t('term.framework.filterqueryinvalid') }}</div>
        <TsFormInput
          v-if="snapshotSearchColumns.length && !disabled"
          v-model="snapshotKeyword"
          class="mb-sm"
          :placeholder="$t('page.keyword')"
          @on-change="page = 1"
        ></TsFormInput>
        <TsTable
          :theadList="snapshotHeaders"
          :tbodyList="snapshotPage"
          :rowNum="snapshotRows.length"
          :currentPage="page"
          :pageSize="pageSize"
          :fixedHeader="false"
          :canSelectRow="config.saveMode !== 'allMatched'"
          keyName="uuid"
          @changeCurrent="page = $event"
          @changePageSize="pageSize = $event; page = 1"
        >
          <template v-for="header in snapshotHeaders" :slot="header.key" slot-scope="{ row }">
            <FormItem
              v-if="header.isExtra && config.saveData !== false"
              :key="header.key"
              ref="extraFields"
              :formItem="getExtraFormItem(header.column, row)"
              :formItemList="extraDefinitions"
              :value="row[header.key]"
              :formData="{ ...formData, ...state.row, ...row }"
              :formDataForWatch="{ ...formDataForWatch, ...state.row, ...row }"
              :readonly="readonly"
              :disabled="disabled || state.blocked || state.status === 'loading'"
              :showStatusIcon="false"
              :externalData="externalData"
              :extendConfigList="extendConfigList"
              mode="read"
              @change="$emit('changeNestedExtra', { key: state.key, rowUuid: row.uuid, attrUuid: header.key, value: $event })"
            ></FormItem>
            <span v-else :key="header.key">{{ displaySnapshotValue(row[header.key]) }}</span>
          </template>
        </TsTable>
      </div>
      <template v-else-if="!state.ready">
        <div v-if="state.invalid" class="text-grey">{{ $t('term.framework.filterqueryinvalid') }}</div>
      </template>
      <template v-else>
        <div v-if="state.status === 'loading' || state.status === 'queued'" class="text-grey">{{ $t('form.nestedSelector.loading') }}</div>
        <div v-if="state.browseError" class="text-error">
          {{ state.browseError }} <span class="text-action" @click="$emit('retryNestedSelector', state.key)">{{ $t('page.retry') }}</span>
        </div>
        <Selector
          :key="state.identity + state.viewVersion"
          ref="selector"
          :formItem="selectorItem"
          :formItemList="formItemList"
          :referenceFormItemList="referenceFormItemList"
          :value="config.saveData === false ? [] : value"
          :filter="state.filter"
          :filterReady="state.ready"
          :filterInvalid="state.invalid"
          :formData="formData"
          :formDataForWatch="formDataForWatch"
          :externalData="externalData"
          :extendConfigList="extendConfigList"
          :readonly="readonly || displayOnly"
          :disabled="disabled"
          :mode="mode"
          :dataProvider="state.loadPage"
          @setValue="changeSelection"
        ></Selector>
      </template>
    </template>
  </div>
</template>
<script>
import base from '../base.vue';
// 单元格只管理本地搜索/分页并转发交互；快照、提交值和异步状态由父表持有。
// 可编辑的手动选择直接复用原选择器；全量结果及受限快照保留本地展示。
export default {
  components: {
    Selector: () => import('../formtableselector/index.vue'),
    FormItem: () => import('@/resources/plugins/TsSheet/form-item.vue'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  extends: base,
  props: { nestedSelectorState: { type: Object } },
  data() { return { page: 1, pageSize: this.formItem.config.pageSize || 10, snapshotKeyword: '', showSavedRecords: false, extraItems: {} }; },
  methods: {
    getExtraFormItem(column, row) {
      const key = JSON.stringify([row.uuid, column.uuid]);
      if (!this.extraItems[key]) this.$set(this.extraItems, key, this.$utils.deepClone(column));
      const item = this.extraItems[key];
      (item.config?.sourceColumnList || []).forEach(filter => {
        if (filter.valueColumn) {
          this.$set(filter, 'valueList', Array.isArray(row[filter.valueColumn]) ? row[filter.valueColumn] : [row[filter.valueColumn]]);
          filter.expression = 'equal';
        }
      });
      return item;
    },
    async locateError(error) {
      this.showSavedRecords = true;
      this.snapshotKeyword = '';
      await this.$nextTick();
      this.page = error.childPage;
      // 手动选择的错误页使用原选择器展示已选记录，仍保留增删入口。
      if (this.$refs.selector) this.$refs.selector.tablePageConfig.currentPage = error.childPage;
      await this.$nextTick();
      await this.validData();
    },
    displaySnapshotValue(value) {
      if (Array.isArray(value)) return value.map(this.displaySnapshotValue).join('、');
      if (value && typeof value === 'object') return value.text ?? value.name ?? value.label ?? value.value ?? '';
      return value == null ? '' : value;
    },
    changeSelection(value) {
      if (!this.readonly && !this.disabled && !this.displayOnly) this.$emit('setValue', value, 'selection');
    },
    async validDataBase() { return this.validData(); },
    async validData() {
      if (this.config.saveData === false || this.readonly || this.disabled || this.state?.blocked) return [];
      const fields = this.$refs.extraFields ? (Array.isArray(this.$refs.extraFields) ? this.$refs.extraFields : [this.$refs.extraFields]) : [];
      for (const field of fields) await field.validData();
      // 候选列表只更新当前页错误样式，提交结果统一由父表计算。
      if (this.$refs.selector) await this.$refs.selector.validData();
      return [];
    }
  },
  computed: {
    state() { return this.nestedSelectorState; },
    extraDefinitions() { return [...(this.config.dataConfig || []), ...this.formItemList, ...this.referenceFormItemList]; },
    displayOnly() { return this.config.saveData === false || this.config.saveMode === 'allMatched'; },
    useSavedTable() {
      return !!this.state && (this.state.blocked ||
        (this.config.saveData !== false && this.config.saveMode === 'allMatched') ||
        (this.state.snapshot && (this.readonly || this.disabled || !this.state.ready)));
    },
    selectorItem() {
      return { ...this.formItem, config: { ...this.config, mode: this.displayOnly ? 'normal' : (this.showSavedRecords ? 'dialog' : this.config.mode) } };
    },
    snapshotSearchColumns() { return (this.config.dataConfig || []).filter(column => column.isSearch); },
    snapshotRows() {
      const rows = this.state?.currentValue || [];
      const keyword = this.snapshotKeyword.trim().toLowerCase();
      return keyword ? rows.filter(row => this.snapshotSearchColumns.some(column => String(this.displaySnapshotValue(row[column.uuid])).toLowerCase().includes(keyword))) : rows;
    },
    snapshotPage() {
      const rows = this.snapshotRows.slice((this.page - 1) * this.pageSize, this.page * this.pageSize);
      // 全量保存不使用行选择；历史选中标记只在展示副本中清除。
      return this.config.saveMode === 'allMatched' ? rows.map(row => ({ ...row, _selected: false, isSelected: false })) : rows;
    },
    snapshotHeaders() {
      return (this.config.dataConfig || []).filter(column => column.isPC).map(column => ({ key: column.uuid, title: column.label, column, isExtra: column.isExtra, isRequired: this.config.saveData !== false && !!column.config?.isRequired }));
    }
  },
  watch: {
    // 查询结果或本地搜索结果变化后回到首页，避免停留在已经不存在的页码。
    'state.identity'() { this.page = 1; this.extraItems = {}; this.showSavedRecords = false; },
    snapshotKeyword() { this.page = 1; },
    'snapshotRows.length'() { this.page = 1; }
  }
};
</script>
<style lang="less" scoped>
.nested-selector {
  min-width: 360px;
  max-width: 100%;
  overflow-x: auto;
}
</style>
