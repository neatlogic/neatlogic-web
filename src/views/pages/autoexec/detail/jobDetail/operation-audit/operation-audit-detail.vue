<template>
  <div>
    <TsTable
      v-if="targetHeaders.length"
      v-bind="detail.targets"
      :tbodyList="targetRows"
      :hideAction="false"
      :theadList="targetHeaders"
      :showPager="detail.objectType !== 'job' && detail.targets.rowNum > detail.targets.pageSize"
      :showTotal="false"
      height="auto"
      @changeCurrent="$emit('change-page', $event)"
    >
      <template v-slot:previousExecUser="{ row }">
        <UserCard v-if="row.previousExecUser" :uuid="row.previousExecUser" @click.native.stop></UserCard>
        <span v-else>-</span>
      </template>
      <template v-slot:currentExecUser="{ row }">
        <UserCard v-if="row.currentExecUser" :uuid="row.currentExecUser" @click.native.stop></UserCard>
        <span v-else>-</span>
      </template>
    </TsTable>
  </div>
</template>
<script>
import TsTable from '@/resources/components/TsTable/TsTable.vue';
// 详情只负责显示专用审计 DTO，数据请求和选中状态归外层面板所有。
export default {
  name: 'JobOperationAuditDetail',
  components: { TsTable, UserCard: () => import('@/resources/components/UserCard/UserCard.vue') },
  props: { detail: { type: Object, required: true } },
  computed: {
    // 目标快照采用与最新问题一致的内嵌表格，保留服务端分页。
    targetHeaders() {
      // 作业名称已在主记录展示，展开区仅保留请求级上下文。
      if (this.detail.objectType === 'job') return this.fields.map(field => ({ key: field.key, title: field.label }));
      return [
        { key: 'phaseName', title: this.$t('page.jobaudit.object.phase') },
        { key: 'nodeName', title: this.$t('page.jobaudit.object.node') },
        { key: 'host', title: 'IP' },
        { key: 'sqlFile', title: this.$t('page.jobaudit.object.sql') },
        { key: 'objectId', title: 'ID' }
      ].filter(field => !['phaseName', 'nodeName', 'host', 'sqlFile'].includes(field.key) || this.detail.targets.tbodyList.some(target => target[field.key])).concat(this.fields.map(field => ({ key: field.key, title: field.label })));
    },
    // 请求级上下文与目标快照合并展示，不修改接口返回对象。
    targetRows() {
      const context = {};
      this.fields.forEach(field => { context[field.key] = this.detail[field.key]; });
      if (this.detail.objectType === 'job') return [context];
      return this.detail.targets.tbodyList.map(target => ({ ...target, ...context }));
    },
    // 只展示本次动作有意义的字段，避免固定大表单产生空白噪声。
    fields() {
      const list = [];
      ['strategyText', 'previousExecUser', 'currentExecUser', 'interactionType', 'interactionValue'].forEach(key => {
        if (this.detail[key]) list.push({ key, label: this.$t(`page.jobaudit.${key}`) });
      });
      return list;
    }
  }
};
</script>
