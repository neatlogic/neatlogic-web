<template>
  <div>
    <TsTable
      v-bind="tableData"
      :multiple="true"
      :fixedHeader="false"
      :canDrag="true"
      @updateRowSort="updateRowSort"
    >
      <template v-for="extra in config.dataConfig" :slot="extra.uuid" slot-scope="{ row, index }">
        <div :key="extra.uuid" @click.stop>
          <FormItem
            :ref="'formitem_' + extra.uuid + '_' + index"
            :formItem="extra"
            :formData="{...filterUuid(initFormData), ...row}"
            :formItemList="$utils.deepClone(config.dataConfig.concat(formItemList))"
            :showStatusIcon="false"
            :readonly="readonly"
            :isCustomValue="isCustomValue"
            :externalData="externalData"
            :rowUuid="row.uuid"
            mode="read"
            style="min-width:130px"
            @change="(val)=>{changeRow(val, extra.uuid, row);}"
          ></FormItem>
        </div>
      </template>
      <template v-slot:btn="{ row }">
        <div v-if="!readonly && !disabled">
          <span class="ml-xs tsfont-plus-o text-action" @click.stop="addItem()"></span>
          <span v-if="tableData.tbodyList.length > 1" class="ml-xs tsfont-close-o text-action" @click.stop="deleteItem(row)"></span>
        </div>
      </template>
    </TsTable>
  </div>
</template>
<script>
import base from './base.vue';
import validmixin from './common/validate-mixin.js';
import TsTable from '@/resources/components/TsTable/TsTable.vue';
export default {
  name: '',
  components: {
    TsTable,
    FormItem: () => import('@/resources/plugins/TsSheet/form-item.vue')
  },
  extends: base,
  mixins: [validmixin],
  props: {
    readonly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
      isTableSelectorDialogShow: false,
      selectedIndexList: [],
      tableData: { theadList: [], tbodyList: [] },
      initFormData: this.$utils.deepClone(this.formData)
    };
  },
  beforeCreate() {},
  created() {
    this.init();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init() {
      this.$set(this.tableData, 'tbodyList', []);
      if (this.value && this.value instanceof Array && this.value.length > 0) {
        const value = this.$utils.deepClone(this.value);
        //去掉不存在的表头数据
        for (let i = value.length - 1; i >= 0; i--) {
          const element = value[i];
          for (let key in element) {
            if (key != 'uuid' && !this.config.dataConfig.find(d => d.uuid === key)) {
              this.$delete(element, key);
            }
          }
          let hasCol = false;
          for (let key in element) {
            if (key != 'uuid') {
              hasCol = true;
              break;
            }
          }
          if (!hasCol) {
            value.splice(i, 1);
          }
        }
        if (value.length > 0) {
          this.tableData.tbodyList.push(...value);
        }
      } else {
        //默认展示行
        this.addItem();
      }
    },
    changeRow(val, uuid, row) {
      if (!this.$utils.isSame(row[uuid], val)) {
        this.$set(row, uuid, val);
        this.setValue(this.tableData.tbodyList);
      }
    },
    deleteItem(row) {
      const index = this.tableData.tbodyList.findIndex(d => d.uuid === row.uuid);
      if (index > -1) {
        this.tableData.tbodyList.splice(index, 1);
      }
      this.setValue(this.tableData.tbodyList);
    },
    addItem() {
      const data = { uuid: this.$utils.setUuid() };
      this.config.dataConfig.forEach(d => {
        data[d.uuid] = (d.config && d.config.defaultValue) || null;
      });
      this.tableData.tbodyList.push(data);
      this.setValue(this.tableData.tbodyList);
    },
    async validData() {
      const errorList = [];
      if (this.$refs) {
        for (let name in this.$refs) {
          if (name.startsWith('formitem_')) {
            if (this.$refs[name]) {
              let formitem = null;
              if (this.$refs[name] instanceof Array) {
                formitem = this.$refs[name][0];
              } else {
                formitem = this.$refs[name];
              }
              if (formitem) {
                const err = await formitem.validData();
                if (err && err.length > 0) {
                  errorList.push(...err);
                }
              }
            }
          }
        }
      }
      errorList.push(...this.validDataForAllItem());
      return errorList;
    },
    updateRowSort(event) {
      let beforeVal = this.tableData.tbodyList.splice(event.oldIndex, 1)[0];
      this.tableData.tbodyList.splice(event.newIndex, 0, beforeVal);
      this.setValue(this.tableData.tbodyList);
    },
    filterUuid(obj) {
      if (obj.uuid) {
        delete obj.uuid;
      }
      return obj;
    }
  },
  filter: {},
  computed: {},
  watch: {
    value: {
      handler(val) {
        if (!this.$utils.isSame(this.tableData.tbodyList, val)) {
          this.init();
        }
      },
      deep: true,
      immediate: true
    },
    'config.dataConfig': {
      handler: function(val) {
        this.tableData.theadList = [];
        if (val) {
          val.forEach(d => {
            let item = {
              key: d.uuid,
              title: d.label
            };
            if (d.config && d.config.isRequired) {
              this.$set(item, 'isRequired', true);
            }
            this.tableData.theadList.push(item);
          });
          this.tableData.theadList.push({ key: 'btn' });
        }
      },
      deep: true,
      immediate: true
    },
    formData: {
      handler(val) {
        if (this.mode != 'edit' && this.mode != 'editSubform' && !this.$utils.isSame(val, this.initFormData)) {
          this.initFormData = this.$utils.deepClone(val) || {};
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less">
</style>
