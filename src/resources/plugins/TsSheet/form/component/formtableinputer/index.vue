<template>
  <div>
    <div v-if="!disabled && !readonly" class="mb-sm action-group">
      <div v-if="!config.hasOwnProperty('isCanAdd') || config.isCanAdd" class="action-item">
        <Button @click="addData()">{{ $t('dialog.title.addtarget',{'target':$t('page.data')}) }}</Button>
      </div>
      <div v-if="selectedIndexList && selectedIndexList.length > 0" class="action-item">
        <Button @click="removeSelectedItem">{{ $t('dialog.title.deletetarget',{'target':$t('page.data')}) }}</Button>
      </div>
    </div>
    <TsTable
      v-if="hasColumn"
      v-bind="tableData"
      :multiple="true"
      :fixedHeader="false"
      :canDrag="!disabled && !readonly && config.isCanDrag"
      :readonlyTextIsHighlight="readonlyTextIsHighlight"
      @updateRowSort="updateRowSort"
      @getSelected="getSelectedItem"
    >
      <template v-if="config.isShowNumber" v-slot:number="{ index}">
        {{ index+1 }}
      </template>
      <template v-for="extra in extraList" :slot="extra.uuid" slot-scope="{ row, index }">
        <div :key="extra.uuid" @click.stop>
          <FormItem
            :ref="'formitem_' + extra.uuid + '_' + index"
            :formItem="getExtraFormItem(extra, row)"
            :value="getDefaultValue(extra.uuid, row)"
            :formData="row"
            :formItemList="$utils.deepClone(extraList)"
            :showStatusIcon="false"
            mode="read"
            :readonly="readonly"
            :disabled="disabled"
            style="min-width:130px"
            @change="changeRow(row,index)"
          ></FormItem>
        </div>
      </template>
      <template v-slot:action="{ row }">
        <div class="tstable-action">
          <ul class="tstable-action-ul">
            <li class="tsfont-trash-o" @click="deleteItem(row)">{{ $t('page.delete') }}</li>
          </ul>
        </div>
      </template>
    </TsTable>
    <TsTable v-else :theadList="tableData.theadList"></TsTable>
  </div>
</template>
<script>
import base from '../base.vue';
import validmixin from '../common/validate-mixin.js';
import TsTable from '@/resources/components/TsTable/TsTable.vue';

export default {
  name: '',
  components: {
    TsTable,
    FormItem: resolve => require(['@/resources/plugins/TsSheet/form-item.vue'], resolve)
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
      rowFormItem: {} //保存每行的定义数据，避免每次都deepClone新数据，导致reaction失效
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
          if (!this.$utils.isSame(this.value, value)) {
            //如果值发生变化，则重新设置值
            this.setValue(value);
          }
        }
      } else if (this.config.lineNumber) { 
        //默认展示行
        for (let i = 0; i < this.config.lineNumber; i++) {
          this.addData();
        }
      }
    },
    getSelectedItem(indexList) {
      this.selectedIndexList = indexList;
    },
    deleteItem(row) {
      const index = this.tableData.tbodyList.findIndex(d => d.uuid === row.uuid);
      if (index > -1) {
        this.tableData.tbodyList.splice(index, 1);
      }
    },
    removeSelectedItem() {
      for (let i = this.tableData.tbodyList.length - 1; i >= 0; i--) {
        const item = this.tableData.tbodyList[i];
        if (item._selected) {
          this.tableData.tbodyList.splice(i, 1);
        }
      }
    },
    getSelectedData(itemList) {
      const valueList = this.$utils.deepClone(itemList);
      valueList.forEach(d => {
        this.$delete(d, '_selected');
      });
      this.setValue(itemList);
    },
    addData() {
      const data = { uuid: this.$utils.setUuid() };
      this.config.dataConfig.forEach(d => {
        if (d.isPC) {
          data[d.uuid] = (d.config && d.config.defaultValue) || null;
        }
      });
      this.tableData.tbodyList.push(data);
    },
    //从表格选择列表行数据中获取指定字段作为扩展字段的过滤值
    getExtraFormItem(extraFormItem, row) {
      //由于每行的过滤值都不一样，所以需要复制，避免互相影响
      if (!this.rowFormItem[row.uuid]) {
        this.rowFormItem[row.uuid] = {};
      }
      if (!this.rowFormItem[row.uuid][extraFormItem.uuid]) {
        this.rowFormItem[row.uuid][extraFormItem.uuid] = this.$utils.deepClone(extraFormItem);
      }
      const formItem = this.rowFormItem[row.uuid][extraFormItem.uuid];
      const config = formItem.config;
      if (config && config.sourceColumnList && config.sourceColumnList.length > 0) {
        config.sourceColumnList.forEach(sourceColumn => {
          if (sourceColumn.valueColumn) {
            sourceColumn.valueList = [row[sourceColumn.valueColumn]];
            sourceColumn.expression = 'equal';
          }
        });
      }
      if (this.disabled || this.readonly) {
        this.$set(formItem.config, 'isDisabled', true);
      }
      return formItem;
    },
    validConfig() {
      const errorList = [];
      if (!this.config.dataConfig || this.config.dataConfig.length == 0) {
        errorList.push({ field: 'dataConfig', error: this.$t('form.placeholder.pleaseadd', {'target': this.$t('page.thead')}) });
      } else {
        this.config.dataConfig.forEach(element => {
          const config = element.config;
          if (['formselect', 'formradio', 'formcheckbox'].includes(element.handler)) {
            if (config.dataSource === 'static' && (!config.dataList || config.dataList.filter(d => d.value).length === 0)) {
              errorList.push({ field: 'dataConfig', error: this.$t('form.validate.leastonetarget', {'target': this.$t('page.staticdatasource')}) });
            } else if (config.dataSource === 'matrix') {
              if (!config.matrixUuid) {
                errorList.push({ field: 'dataConfig', error: this.$t('form.placeholder.pleaseselect', {'target': this.$t('page.matrix')}) });
              }
              if (!config.mapping.value) {
                errorList.push({ field: 'dataConfig', error: this.$t('form.placeholder.pleaseselect', {'target': this.$t('term.framework.valfieldmapping')}) });
              }
              if (!config.mapping.text) {
                errorList.push({ field: 'dataConfig', error: this.$t('form.placeholder.pleaseselect', {'target': this.$t('term.framework.showtextfieldmapping')}) });
              }
            }
          } else if (['formdate', 'formtime'].includes(element.handler)) {
            if (!config.format) {
              errorList.push({ field: 'dataConfig', error: this.$t('form.placeholder.pleaseselect', {'target': this.$t('page.format')}) });
            }
          }
        });
      }
      return errorList;
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
      return errorList;
    },
    changeRow(row, index) {
      this.$set(this.tableData.tbodyList, index, row);
    },
    updateRowSort(event) {
      let beforeVal = this.tableData.tbodyList.splice(event.oldIndex, 1)[0];
      this.tableData.tbodyList.splice(event.newIndex, 0, beforeVal);
    }
  },
  filter: {},
  computed: {
    hasColumn() {
      if (this.mode != 'edit' && this.config.dataConfig && this.config.dataConfig.length > 0) {
        return true;
      }
      return false;
    },
    extraList() {
      return this.config.dataConfig.filter(d => d.isPC);
    },
    getDefaultValue() {
      return (uuid, row) => {
        let dataConfig = null;
        if (!this.$utils.isEmpty(this.value) && Array.isArray(this.value)) {
          let valueItem = this.value.find(i => i.uuid === row.uuid);
          if (valueItem) {
            dataConfig = valueItem;
          }
        } 
        if (!dataConfig) {
          dataConfig = this.config.dataConfig.find(d => d.uuid === uuid);
        }
        if (dataConfig && dataConfig.config) {
          const defaultValue = dataConfig.config.defaultValue;
          if (dataConfig.config.defaultValueType === 'custom') {
            return defaultValue;
          } else if (dataConfig.config.defaultValueType === 'matrix') {
            if (['formselect', 'formradio', 'formcheckbox'].includes(dataConfig.handler)) {
              const defaultValueField = dataConfig.config.defaultValueField;
              const defaultTextField = dataConfig.config.defaultTextField;
              return row[defaultValueField] + '&=&' + row[defaultTextField];
            } else {
              return row[defaultValue];
            }
          } else {
            return defaultValue;
          }
        }
        return null;
      };
    }
  },
  watch: {
    'config.dataConfig': {
      handler: function(val) {
        this.tableData.theadList = [];
        if (!this.disabled && !this.readonly) {
          if (!this.config.hasOwnProperty('isCanAdd') || this.config.isCanAdd) {
            this.tableData.theadList.push({ key: 'selection' });
          }
        }
        if (this.config.isShowNumber) {
          this.tableData.theadList.push({ key: 'number', title: this.$t('page.ordernumber') });
        }
        this.config.dataConfig.forEach(d => {
          if (d.isPC) {
            let item = {
              key: d.uuid, 
              title: d.label 
            };
            if (d.config && d.config.isRequired) {
              this.$set(item, 'isRequired', true);
            }
            this.tableData.theadList.push(item);
          }
        });
        if (!this.disabled && !this.readonly) {
          if (!this.config.hasOwnProperty('isCanAdd') || this.config.isCanAdd) {
            this.tableData.theadList.push({ key: 'action' });
          }
        }
        this.$emit('resize');
      },
      deep: true,
      immediate: true
    },
    'tableData.tbodyList': {
      handler: function(val) {
        this.setValue(val);
        //console.log(JSON.stringify(val, null, 2));
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped></style>
