<template>
  <div>
    <div v-if="config.mode === 'dialog'">
      <div v-if="!readonly && !disabled" class="mb-sm action-group">
        <div class="action-item">
          <Button @click="showTableSelectorDialog">{{ $t('dialog.title.addtarget',{'target':$t('page.data')}) }}</Button>
        </div>
        <div v-if="selectedItemList && selectedItemList.length > 0" class="action-item">
          <Button @click="removeSelectedItem">{{ $t('dialog.title.deletetarget',{'target':$t('page.data')}) }}</Button>
        </div>
      </div>
      <div v-if="value && value.length > 0">
        <TsTable
          :multiple="true"
          :theadList="theadList"
          :tbodyList="value"
          keyName="uuid"
          selectedRemain
          :disabled="readonly || disabled"
          :fixedHeader="false"
          :readonlyTextIsHighlight="readonlyTextIsHighlight"
          @getSelected="getSelected"
          @operation="operation"
        >
          <template
            v-for="(extra) in extraList"
            :slot="extra.uuid"
            slot-scope="{ row }"
          >
            <div :key="extra.uuid" class="table-item" @click.stop>
              <FormItem
                :ref="'formitem_true_' + row.uuid"
                :formItem="getExtraFormItem(extra,row)"
                :disabled="disabled"
                :readonly="readonly"
                :value="getDefaultValue(extra.uuid,row)"
                :formData="row"
                :showStatusIcon="false"
                mode="read"
                isCustomValue
                style="min-width:100px"
              ></FormItem>
            </div>
          </template>
          <template v-slot:action="{ row }">
            <div class="tstable-action">
              <ul v-if="!readonly && !disabled" class="tstable-action-ul">
                <li
                  class="tsfont-trash-o"
                  @click="deleteItem(row)"
                >{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
    </div>
    <div v-else-if="config.mode === 'normal'">
      <DataList
        ref="dataList"
        :formItem="formItem"
        :value="value"
        :mode="mode"
        :filter="filter"
        :disabled="disabled"
        :readonly="readonly"
        @resize="$emit('resize')"
        @change="getSelectedData"
      ></DataList>
    </div>
    <DataDialog
      v-if="isTableSelectorDialogShow"
      :formItem="formItem"
      :value="value"
      :mode="mode"
      :filter="filter"
      @close="closeTableSelectorDialog"
    ></DataDialog>
  </div>
</template>
<script>
import base from '../base.vue';
import validmixin from '../common/validate-mixin.js';
import DataList from './formtableselector-datalist.vue';
import TsTable from '@/resources/components/TsTable/TsTable.vue';
export default {
  name: '',
  components: {
    DataList,
    TsTable,
    DataDialog: () => import('./formtableselector-dialog.vue'),
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
      selectedItemList: [],
      rowFormItem: {}
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    deleteItem(row) {
      if (this.selectedItemList && this.selectedItemList.length > 0) {
        const index = this.selectedItemList.findIndex(d => d.uuid === row.uuid);
        if (index > -1) {
          this.selectedItemList.splice(index, 1);
        }
      }
      if (this.value && this.value.length > 0) {
        const index = this.value.findIndex(d => d.uuid === row.uuid);
        if (index > -1) {
          this.value.splice(index, 1);
          this.setValue(this.value);
        }
      }
    },
    removeSelectedItem() {
      if (this.selectedItemList && this.selectedItemList.length > 0) {
        for (let i = this.value.length - 1; i >= 0; i--) {
          if (this.selectedItemList.find(d => d.uuid === this.value[i].uuid)) {
            this.value.splice(i, 1);
          }
        }
        this.setValue(this.value);
      }
      this.selectedItemList = [];
    },
    getSelectedData(itemList) {
      const valueList = this.$utils.deepClone(itemList);
      valueList.forEach(d => {
        this.$delete(d, '_selected');
      });
      this.setValue(valueList);
    },
    showTableSelectorDialog() {
      this.isTableSelectorDialogShow = true;
    },
    closeTableSelectorDialog(selectedItemList) {
      this.isTableSelectorDialogShow = false;
      if (selectedItemList) {
        selectedItemList.forEach(d => {
          this.$delete(d, '_selected');
          this.$delete(d, 'isSelected');
        });
        this.setValue(selectedItemList);
      }
    },
    async validData() {
      const errorList = [];
      //TODO 需要补充校验方法
      if (this.$refs.dataList && this.$refs.dataList.validData) {
        let dataListValid = await this.$refs.dataList.validData();
        errorList.push(...dataListValid);
      } else if (this.config.mode === 'dialog') {
        let itemError = [];
        if (this.$refs) {
          for (let name in this.$refs) {
            if (name.indexOf('formitem_true') > -1 && this.$refs[name]) {
              let formitem = null;
              if (this.$refs[name] instanceof Array) {
                formitem = this.$refs[name][0];
              } else {
                formitem = this.$refs[name];
              }
              if (formitem) {
                const err = await formitem.validData();
                if (err && err.length > 0) {
                  itemError.push(...err);
                }
              }
            }
          }
        }
        errorList.push(...itemError);
      }
      return errorList;
    },
    validConfig() {
      const errorList = [];
      if (!this.config.matrixUuid) {
        errorList.push({ field: 'matrixUuid', error: this.$t('form.placeholder.pleaseselect', {'target': this.$t('page.matrix')}) });
      }
      let isKey = true;
      if (this.config.dataConfig && this.config.dataConfig.length > 0) {
        let attrUuidList = []; //矩阵固有属性
        this.config.dataConfig.forEach(element => {
          const config = element.config;
          if (element.isPC && !element.isExtra) {
            attrUuidList.push(element.uuid);
          }
          if (this.$utils.isEmpty(element.key)) {
            isKey = false;
          }
          if (['formselect', 'formradio', 'formcheckbox'].includes(element.handler)) {
            if (config.dataSource === 'static' && (!config.dataList || config.dataList.filter(d => d.value).length === 0)) {
              errorList.push({ field: 'dataConfig', error: this.$t('message.framework.atleastonestaticsource') });
            } else if (config.dataSource === 'matrix') {
              if (!config.matrixUuid) {
                errorList.push({field: 'dataConfig', error: this.$t('form.placeholder.pleaseselect', {'target': this.$t('page.matrix')})});
              }
              if (!config.mapping.value) {
                errorList.push({field: 'dataConfig', error: this.$t('form.placeholder.pleaseselect', {'target': this.$t('term.framework.valfieldmapping')})});
              }
              if (!config.mapping.text) {
                errorList.push({field: 'dataConfig', error: this.$t('form.placeholder.pleaseselect', {'target': this.$t('term.framework.showtextfieldmapping')})});
              }
            }
          } else if (['formdate', 'formtime'].includes(element.handler)) {
            if (!config.format) {
              errorList.push({field: 'dataConfig', error: this.$t('form.placeholder.pleaseselect', {'target': this.$t('page.format')})});
            }
          }
        });
        if (!isKey) {
          errorList.push({ field: 'dataConfig', error: this.$t('form.validate.required', {'target': this.$t('term.framework.compkeyname')}) });
        }
        if (!attrUuidList.length) {
          errorList.push({ field: 'dataConfig', error: this.$t('message.framework.leastoneselectattr') });
        }
      }
      if (this.config.sourceColumnList && this.config.sourceColumnList.length > 0) {
        for (let i = 0; i < this.config.sourceColumnList.length; i++) {
          if (this.$utils.isEmpty(this.config.sourceColumnList[i].column) || this.$utils.isEmpty(this.config.sourceColumnList[i].expression) || (this.config.sourceColumnList[i].expression != 'is-null' && this.config.sourceColumnList[i].expression != 'is-not-null' && this.$utils.isEmpty(this.config.sourceColumnList[i].valueList))) {
            errorList.push({ field: 'sourceColumnList', error: this.$t('message.framework.plecompletecondition') });
            break;
          }
        }
      }
      return errorList;
    },
    operation(row, type) {
      if (type && row[type]) { //超链接跳转
        window.open(row[type], '_blank');
      }
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
      return formItem;
    },
    //从表格选择列表行数据中获取指定字段作为扩展字段的默认值
    getDefaultValue(uuid, row) {
      const dataConfig = this.config.dataConfig.find(d => d.uuid === uuid);
      if (dataConfig && dataConfig.config) {
        const defaultValue = dataConfig.config.defaultValue;
        if (dataConfig.config.defaultValueType === 'custom') {
          return defaultValue;
        } else if (dataConfig.config.defaultValueType === 'matrix') {
          if (['formselect', 'formradio', 'formcheckbox'].includes(dataConfig.handler)) {
            const defaultValueField = dataConfig.config.defaultValueField;
            const defaultTextField = dataConfig.config.defaultTextField;
            return {text: row[defaultTextField], value: row[defaultValueField]};
          } else {
            return row[defaultValue];
          }
        }
      }
      return null;
    },
    getSelected(indexList) {
      let selectedArr = this.value.filter(val => {
        return indexList.includes(val.uuid); // 获取所有选中列表
      });
      this.selectedItemList = selectedArr;
    }
  },
  filter: {},
  computed: {
    theadList() {
      const theadList = [];
      if (!this.disabled && !this.readonly) {
        theadList.push({ key: 'selection' });
      }
      if (this?.config?.dataConfig && this.config.dataConfig.length > 0) {
        this.config.dataConfig.forEach(thead => {
          if (thead.isPC) {
            theadList.push({
              key: thead.uuid,
              title: thead.label,
              type: thead.config && thead.config.urlAttributeValue ? 'linktext' : '',
              textValue: thead.config && thead.config.urlAttributeValue ? thead.config.urlAttributeValue : '',
              isRequired: !!(thead.config && thead.config.isRequired)
            });
          }
        });
      }
      theadList.push({ key: 'action' });
      return theadList;
    },
    extraList() {
      return this.config.dataConfig.filter(d => d.isExtra && d.isPC);
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped></style>
