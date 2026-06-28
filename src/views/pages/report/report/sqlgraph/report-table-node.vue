<template>
  <div class="report-table-node">
    <div class="node-header">
      <div class="overflow">
        <div class="text-title overflow">{{ data.label || data.tableName }}</div>
        <div class="text-grey overflow">{{ data.alias }} · {{ data.tableName }}</div>
      </div>
    </div>
    <div class="node-fields">
      <Tooltip
        v-for="field in visibleFieldList"
        :key="field.name"
        transfer
        placement="right"
        max-width="360"
        :disabled="!field.description"
      >
        <div class="field-row">
          <span class="field-name overflow">{{ field.name }}</span>
          <span v-if="getIndexLabel(field.name)" class="field-index">{{ getIndexLabel(field.name) }}</span>
          <span class="field-type text-grey overflow">{{ field.type }}</span>
        </div>
        <div slot="content" class="field-tooltip">
          <div class="field-tooltip-title">{{ field.name }} · {{ field.type }}</div>
          <div class="field-tooltip-desc">{{ field.description }}</div>
        </div>
      </Tooltip>
      <div v-if="hiddenFieldCount > 0" class="text-grey pl-xs pr-xs pt-xs">+{{ hiddenFieldCount }}</div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'ReportTableNode',
  inject: ['getNode'],
  data() {
    return {
      data: {}
    };
  },
  created() {
    const node = this.getNode();
    this.data = node.getData() || {};
    node.on('change:data', ({ current }) => {
      this.data = current || {};
    });
  },
  methods: {
    getIndexLabel(name) {
      return this.indexFieldMap[name] || '';
    }
  },
  computed: {
    visibleFieldList() {
      return (this.data.fields || []).slice(0, 12);
    },
    hiddenFieldCount() {
      return Math.max((this.data.fields || []).length - this.visibleFieldList.length, 0);
    },
    indexFieldMap() {
      const fieldMap = {};
      (this.data.indexes || []).forEach(index => {
        const label = index.primary ? 'PK' : index.unique ? 'UK' : 'IDX';
        (index.columns || []).forEach(column => {
          if (!fieldMap[column] || fieldMap[column] === 'IDX' || label === 'PK') {
            fieldMap[column] = label;
          }
        });
      });
      return fieldMap;
    }
  }
};
</script>
<style lang="less">
@import (reference) '~@/resources/assets/css/variable.less';
.theme(@blockbg, @title-bg-color, @text-color, @tip-color, @border-color, @primary-color, @primary-grey) {
  .report-table-node {
    width: 100%;
    height: 100%;
    border: 1px solid @border-color;
    border-radius: 6px;
    color: @text-color;
    background: @blockbg;
    overflow: hidden;
    user-select: none;
    .text-title {
      color: @text-color !important;
    }
    .text-grey {
      color: @tip-color !important;
    }
    .node-header {
      display: flex;
      align-items: center;
      height: 44px;
      padding: 6px 10px;
      border-bottom: 1px solid @border-color;
      background: @title-bg-color;
    }
    .node-fields {
      padding: 6px 0;
    }
    .node-fields > .ivu-tooltip {
      display: block;
    }
    .field-row {
      display: flex;
      align-items: center;
      width: 100%;
      height: 22px;
      padding: 0 8px;
      gap: 6px;
      box-sizing: border-box;
    }
    .field-row:hover {
      background: @title-bg-color;
    }
    .field-name {
      flex: 1;
      min-width: 0;
    }
    .field-index {
      flex: 0 0 auto;
      min-width: 22px;
      height: 16px;
      padding: 0 4px;
      border-radius: 3px;
      background: @primary-grey;
      color: @primary-color;
      font-size: 10px;
      line-height: 16px;
      text-align: center;
    }
    .field-type {
      width: 82px;
      text-align: right;
    }
    .field-tooltip-title {
      margin-bottom: 4px;
      font-weight: bold;
    }
    .field-tooltip-desc {
      line-height: 1.5;
      white-space: normal;
    }
  }
}
html {
  .theme(@default-blockbg, @default-th-bg-color, @default-text, @default-tip, @default-border, @default-primary-color, @default-primary-grey);

  &.theme-dark {
    .theme(@dark-blockbg, @dark-th-bg-color, @dark-text, @dark-tip, @dark-border, @dark-primary-color, @dark-primary-grey);
  }
}
</style>
