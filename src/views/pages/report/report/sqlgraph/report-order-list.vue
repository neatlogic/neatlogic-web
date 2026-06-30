<template>
  <div class="report-order-list">
    <div class="section-title">
      <span>ORDER BY</span>
      <Button
        type="text"
        size="small"
        :disabled="!fieldList.length"
        @click="addOrder"
      >添加排序</Button>
    </div>
    <div v-if="!fieldList.length" class="text-grey">请先拖入数据表</div>
    <div v-else-if="!orderList.length" class="text-grey">暂无排序字段</div>
    <div
      v-for="(order, index) in orderList"
      :key="index"
      class="order-item"
    >
      <Select
        v-model="order.fieldKey"
        filterable
        transfer
        placeholder="选择字段"
        @on-change="changeField(order)"
      >
        <Option
          v-for="field in fieldList"
          :key="field.value"
          :value="field.value"
          :label="field.text"
        >
          <span :title="field.description">{{ field.text }}<span v-if="field.type" class="text-grey"> · {{ field.type }}</span></span>
        </Option>
      </Select>
      <div class="order-row mt-xs">
        <RadioGroup
          v-model="order.direction"
          type="button"
          size="small"
          @on-change="emitChange"
        >
          <Radio label="ASC">ASC</Radio>
          <Radio label="DESC">DESC</Radio>
        </RadioGroup>
        <Button type="text" size="small" @click="removeOrder(index)">删除</Button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'ReportOrderList',
  props: {
    value: { type: Array, default: () => [] },
    fieldList: { type: Array, default: () => [] }
  },
  data() {
    return {
      orderList: []
    };
  },
  methods: {
    getFieldKey(order) {
      if (!order) {
        return '';
      }
      const tableAlias = order.tableAlias || order.alias;
      const fieldName = order.fieldName || order.name;
      return tableAlias && fieldName ? `${tableAlias}.${fieldName}` : '';
    },
    getFieldByKey(fieldKey) {
      return this.fieldList.find(field => field.value === fieldKey) || null;
    },
    normalizeOrderList(list) {
      return (list || []).map(item => {
        const order = Object.assign({}, item);
        order.fieldKey = order.fieldKey || this.getFieldKey(order);
        order.direction = String(order.direction || 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        return order;
      });
    },
    addOrder() {
      const field = this.fieldList[0];
      if (!field) {
        return;
      }
      this.orderList.push({
        fieldKey: field.value,
        tableAlias: field.tableAlias,
        fieldName: field.fieldName,
        direction: 'ASC'
      });
      this.emitChange();
    },
    changeField(order) {
      const field = this.getFieldByKey(order.fieldKey);
      if (field) {
        order.tableAlias = field.tableAlias;
        order.fieldName = field.fieldName;
      }
      this.emitChange();
    },
    removeOrder(index) {
      this.orderList.splice(index, 1);
      this.emitChange();
    },
    emitChange() {
      const list = this.orderList
        .map(order => {
          const field = this.getFieldByKey(order.fieldKey) || {};
          const tableAlias = order.tableAlias || field.tableAlias;
          const fieldName = order.fieldName || field.fieldName;
          return {
            tableAlias: tableAlias,
            fieldName: fieldName,
            direction: String(order.direction || 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC'
          };
        })
        .filter(order => order.tableAlias && order.fieldName);
      this.$emit('change', list);
    }
  },
  watch: {
    value: {
      handler(val) {
        const nextList = this.normalizeOrderList(val);
        if (JSON.stringify(nextList) !== JSON.stringify(this.orderList)) {
          this.orderList = nextList;
        }
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.report-order-list {
  .section-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    font-weight: bold;
  }
  .order-item {
    margin-bottom: 10px;
  }
  .order-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
