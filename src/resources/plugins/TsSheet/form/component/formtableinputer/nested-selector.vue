<template>
  <div class="nested-selector">
    <div v-if="!state" class="text-grey">{{ $t('page.dataloading') }}</div>
    <template v-else>
      <div v-if="state.snapshot || state.blocked || (config.saveData !== false && config.saveMode === 'allMatched')">
        <Button v-if="!readonly && !disabled" class="mb-sm" @click="$emit('editNestedSelector', state.key)">
          {{ config.saveMode === 'allMatched' ? $t('page.refresh') : $t('term.cmdb.selectagain') }}
        </Button>
        <div v-if="state.status === 'loading'" class="text-grey">{{ $t('form.nestedSelector.loading') }}</div>
        <div v-if="state.error" class="text-error">
          {{ state.error }} <span v-if="!disabled" class="text-action" @click="$emit('retryNestedSelector', state.key)">{{ $t('page.retry') }}</span>
        </div>
        <div v-if="!state.ready && !state.snapshot" class="text-grey">{{ $t('form.nestedSelector.filterRequired') }}</div>
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
          keyName="uuid"
          @changeCurrent="page = $event"
          @changePageSize="pageSize = $event; page = 1"
        >
          <template v-for="header in snapshotHeaders" :slot="header.key" slot-scope="{ row }">
            <span :key="header.key">{{ displaySnapshotValue(row[header.key]) }}</span>
          </template>
        </TsTable>
      </div>
      <div v-else-if="!state.ready" class="text-grey">{{ $t('form.nestedSelector.filterRequired') }}</div>
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
// 快照及全部匹配结果直接本地展示，其余候选列表通过 dataProvider 复用原选择器。
export default {
  components: {
    Selector: () => import('../formtableselector/index.vue'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  extends: base,
  props: { nestedSelectorState: { type: Object } },
  data() { return { page: 1, pageSize: this.formItem.config.pageSize || 10, snapshotKeyword: '' }; },
  methods: {
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
      if (this.config.saveData === false || this.displayOnly || this.state?.snapshot || this.readonly || this.disabled) return [];
      return this.$refs.selector ? this.$refs.selector.validData() : [];
    }
  },
  computed: {
    state() { return this.nestedSelectorState; },
    displayOnly() { return this.config.saveData === false || this.config.saveMode === 'allMatched'; },
    selectorItem() {
      return { ...this.formItem, config: { ...this.config, mode: this.displayOnly ? 'normal' : this.config.mode } };
    },
    snapshotSearchColumns() { return (this.config.dataConfig || []).filter(column => column.isSearch); },
    snapshotRows() {
      const rows = this.state?.snapshot ? this.state.snapshotRows : (this.state?.blocked ? (this.state.currentValue || []) : (this.state?.results || []));
      const keyword = this.snapshotKeyword.trim().toLowerCase();
      return keyword ? rows.filter(row => this.snapshotSearchColumns.some(column => String(this.displaySnapshotValue(row[column.uuid])).toLowerCase().includes(keyword))) : rows;
    },
    snapshotPage() { return this.snapshotRows.slice((this.page - 1) * this.pageSize, this.page * this.pageSize); },
    snapshotHeaders() {
      return (this.config.dataConfig || []).filter(column => column.isPC).map(column => ({ key: column.uuid, title: column.label }));
    }
  },
  watch: {
    // 查询结果或本地搜索结果变化后回到首页，避免停留在已经不存在的页码。
    snapshotRows() { this.page = 1; }
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
