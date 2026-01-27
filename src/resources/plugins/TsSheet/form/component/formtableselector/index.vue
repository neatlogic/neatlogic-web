<template>
  <div>
    <div v-if="config.mode === 'dialog'">
      <div v-if="!readonly && !disabled" class="mb-sm action-group">
        <div v-if="canAddData" class="action-item">
          <Button @click="showTableSelectorDialog">{{ $t('dialog.title.addtarget',{'target':$t('page.data')}) }}</Button>
        </div>
        <div v-if="!config.disableDeleteData && selectedItemList && selectedItemList.length > 0" class="action-item">
          <Button @click="removeSelectedItem">{{ $t('dialog.title.deletetarget',{'target':$t('page.data')}) }}</Button>
        </div>
      </div>
      <div>
        <template v-if="showTable">
          <template v-if="hasColumn">
            <div class="tstable-container border bg-grey radius-lg tstable-no-fixedHeader">
              <div>
                <table class="tstable-body">
                  <thead>
                    <tr>
                      <th v-for="(col) in theadList" :key="col.key">
                        <div v-if="col.key === 'selection'">
                          <Checkbox
                            v-model="isSelectAllCurrentPage"
                            :disabled="readonly || disabled"
                            @on-change="selectAllCurrentPage"
                          ></Checkbox>
                        </div>
                        <template v-else-if="col.key === 'operation'">
                        </template>
                        <span v-else :class="col.isRequired ? 'require-label' : ''" :style="col.width ? {width: col.width} : {}">{{ col.title }}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(row) in pagedTbodyList"
                      :key="row.uuid"
                    >
                      <td v-if="canDeleteRow">
                        <div class="flex-start">
                          <span v-if="canAddData" class="tsfont-plus text-action mr-nm" @click.stop="showTableSelectorDialog"></span>
                          <span class="tsfont-close text-action mr-nm" @click.stop="deleteItem(row)"></span>
                        </div>
                      </td>
                      <td v-if="!readonly || !disabled">
                        <Checkbox
                          :value="selectedCurrentPageMap[row.uuid]"
                          :disabled="readonly || disabled"
                          @on-change="handleSelectedRow($event, row)"
                        ></Checkbox>
                      </td>
                      <td v-for="column in columnAttrList" :key="`${row.uuid}_ ${column.uuid}`" @click.stop>
                        <div v-if="column?.config?.urlAttributeValue">
                          <span class="text-href" @click="openRowLInkByType(row, column?.config.urlAttributeValue)">
                            {{ column.label }}
                          </span>
                        </div>
                        <ColumnItem
                          v-else
                          :ref="`columnItem_${row.uuid}${column.uuid}`"
                          :rowData="row"
                          :rowUuid="row.uuid"
                          :extraUuid="column.uuid"
                          :columnReadonly="getColumnReadonly(column.uuid)"
                          :reactionData="getReactionData(column, row)"
                          :reactionValueData="reactionValuesMap[column.uuid]"
                          :expressionData="getExpressionData(column)"
                          class="form-item-width"
                          @change="changeRow"
                          @getCurrentRowData="getCurrentRowData"
                        ></ColumnItem>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div v-if="tablePageConfig.rowNum > tablePageConfig.defaultShowSize && tablePageConfig.pageSize > 0" ref="tablepage" class="tstable-page text-right">
              <Page
                size="small"
                :showSizer="true"
                :showTotal="true"
                :total="tablePageConfig.rowNum"
                :current="tablePageConfig.currentPage"
                :page-size="tablePageConfig.pageSize"
                :page-size-opts="tablePageConfig.pageSizeOpts"
                :transfer="true"
                @on-change="changeCurrent"
                @on-page-size-change="changePageSize"
              />
            </div>
          </template>
          <TsSimpleTable v-else :theadList="theadList"></TsSimpleTable>
        </template>
      </div>
    </div>
    <div v-else-if="config.mode === 'normal'">
      <DataList
        ref="dataList"
        :formData="formData"
        :formItem="formItem"
        :formDataForWatch="formDataForWatch"
        :formItemList="formItemList"
        :value="tbodyList"
        :mode="mode"
        :filter="filter"
        :disabled="disabled"
        :readonly="readonly"
        :externalData="externalData"
        :extendConfigList="extendConfigList"
        :isClearSpecifiedAttr="isClearSpecifiedAttr"
        @resize="$emit('resize')"
        @change="getSelectedData"
      ></DataList>
    </div>
    <DataDialog
      v-if="isTableSelectorDialogShow"
      :formData="formData"
      :formDataForWatch="formDataForWatch"
      :formItem="formItem"
      :value="tbodyList"
      :mode="mode"
      :filter="filter"
      :formItemList="formItemList"
      :externalData="externalData"
      :extendConfigList="extendConfigList"
      @close="closeTableSelectorDialog"
    ></DataDialog>
  </div>
</template>
<script>
import base from '../base.vue';
import validmixin from '../common/validate-mixin.js';
import ColumnItemMixin from '@/resources/plugins/TsSheet/form/component/formtableinputer/column-item-mixin.js';
import ExpressionMixin from '@/resources/plugins/TsSheet/form/component/formtableinputer/expression-mixin.js';
import conditionMixin from '@/resources/plugins/TsSheet/form/component/formtableinputer/condition-mixin.js';
import TableMixin from '@/resources/plugins/TsSheet/form/component/common/table-mixin.js';
import DataList from './formtableselector-datalist.vue';
import { buildValidateList } from '@/resources/plugins/TsSheet/form/component/common/table-utils.js';
export default {
  name: '',
  components: {
    DataList,
    DataDialog: () => import('./formtableselector-dialog.vue'),
    ColumnItem: () => import('@/resources/plugins/TsSheet/form/component/formtableinputer/column-item.vue'),
    TsSimpleTable: () => import('@/resources/components/TsSimpleTable/index.vue')
  },
  extends: base,
  mixins: [validmixin, conditionMixin, ExpressionMixin, ColumnItemMixin, TableMixin],
  props: {
    readonly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
      isTableSelectorDialogShow: false,
      selectedItemList: [],
      rowFormItem: {},
      tbodyList: [],
      isSelectAllCurrentPage: false,
      selectedCurrentPageMap: {},
      validateMap: {}, // {uuid: label: 'xxx', validateList: []} // 校验规则
      tablePageConfig: { //table分页配置
        currentPage: 1,
        pageSize: 5,
        rowNum: 0,
        pageSizeOpts: [5, 10, 15, 20, 50, 100],
        defaultShowSize: 5
      }
    };
  },
  beforeCreate() {},
  created() {
    this.reactionWatch();
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
    handleSelectedRow(isSelected, row) {
      const { uuid } = row || {};
      this.$set(this.selectAllCurrentPage, uuid, isSelected);
      const findItemIndex = this.selectedItemList.findIndex(d => d.uuid === uuid);
      if (isSelected) {
        this.selectedItemList.push(row);
      } else {
        this.selectedItemList.splice(findItemIndex, 1);
      }
      if (this.selectedItemList.length === 0 || this.selectedItemList.length !== this.pagedTbodyList.length) {
        this.isSelectAllCurrentPage = false;
      } else if (this.selectedItemList.length === this.pagedTbodyList.length) {
        this.isSelectAllCurrentPage = true;
      }
    },
    selectAllCurrentPage(selectedAll) {
      if (selectedAll) {
        this.pagedTbodyList.forEach((row) => {
          this.selectedCurrentPageMap[row.uuid] = true;
          this.selectedItemList.push(row);
        });
      } else {
        this.selectedCurrentPageMap = {};
        this.selectedItemList = [];
      }
    },
    changeCurrent(currentPage) {
      this.tablePageConfig.currentPage = currentPage;
      if (!this.readonly && !this.disabled) {
        this.$nextTick(() => {
          this.validData();
        });
      }
    },
    changePageSize(pageSize) {
      this.tablePageConfig.currentPage = 1;
      this.tablePageConfig.pageSize = pageSize;
    },
    deleteItem(row) {
      const { uuid } = row || {};
      if (this.selectedItemList && this.selectedItemList.length > 0) {
        const index = this.selectedItemList.findIndex(d => d.uuid === uuid);
        if (index > -1) {
          this.selectedItemList.splice(index, 1);
          this.$delete(this.selectedCurrentPageMap, uuid);
        }
      }
      if (this.tbodyList && this.tbodyList.length > 0) {
        const index = this.tbodyList.findIndex(d => d.uuid === uuid);
        if (index > -1) {
          this.tbodyList.splice(index, 1);
          this.setValue(this.tbodyList);
        }
      }
    },
    removeSelectedItem() {
      if (this.selectedItemList && this.selectedItemList.length > 0) {
        for (let i = this.tbodyList.length - 1; i >= 0; i--) {
          if (this.selectedItemList.find(d => d.uuid === this.tbodyList[i].uuid)) {
            this.$delete(this.selectedCurrentPageMap, this.tbodyList[i].uuid);
            this.tbodyList.splice(i, 1);
          }
        }
        this.setValue(this.tbodyList);
      }
      this.selectedItemList = [];
      this.selectedCurrentPageMap = {};
      this.isSelectAllCurrentPage = false;
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
      if (this.$refs.dataList && this.$refs.dataList.validData) {
        let dataListValid = await this.$refs.dataList.validData();
        errorList.push(...dataListValid);
      } else if (this.config.mode === 'dialog') {
        let itemError = [];
        if (this.$refs) {
          for (let name in this.$refs) {
            if (name.startsWith('columnItem_') && this.$refs[name]) {
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
        errorList.push(
          ...this.validTableTbodyListData({
            pageSize: this.tablePageConfig.pageSize,
            readonly: this.readonly,
            disabled: this.disabled,
            theadList: this.theadList,
            tbodyList: this.tbodyList,
            formData: this.formData,
            formItem: this.formItem,
            validateMap: this.validateMap,
            executeReaction: this.executeReaction
          }),
          ...this.validTableAttrUnique({
            pageSize: this.tablePageConfig.pageSize,
            config: this.config,
            formItem: this.formItem,
            tbodyList: this.tbodyList
          }));
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
            } else if (config.dataSource === 'formtableinputer') {
              //选择表单输入组件
              let findItem = this.formItemList.find(item => item.uuid === config.formtableinputerUuid);
              if (!findItem) {
                errorList.push({ field: 'dataConfig', error: '【' + element.label + '】' + this.$t('message.framework.datasourceselectmessage') });
              } else {
                if (findItem.config && findItem.config.dataConfig) {
                  let isValidMapping = true;
                  const valueUuid = config.mapping.value.split('##')[0];
                  const textUuid = config.mapping.text.split('##')[0];
                  if (!findItem.config.dataConfig.find(d => d.uuid === valueUuid)) {
                    isValidMapping = false;
                  }
                  if (!findItem.config.dataConfig.find(d => d.uuid === textUuid)) {
                    isValidMapping = false;
                  }
                  if (!isValidMapping) {
                    errorList.push({ field: 'dataConfig', error: '【' + element.label + '】' + this.$t('form.placeholder.pleaseselect', { target: this.$t('page.fieldmapping') }) });
                  }
                }
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
          if (this.$utils.isEmpty(this.config.sourceColumnList[i].column) || 
          this.$utils.isEmpty(this.config.sourceColumnList[i].expression) || 
          (this.config.sourceColumnList[i].expression != 'is-null' && this.config.sourceColumnList[i].expression != 'is-not-null' && this.$utils.isEmpty(this.config.sourceColumnList[i].valueList) && this.$utils.isEmpty(this.config.sourceColumnList[i].valueColumn))) {
            errorList.push({ field: 'sourceColumnList', error: this.$t('message.framework.plecompletecondition') });
            break;
          }
        }
      }
      return errorList;
    },
    openRowLInkByType(row, type) {
      if (type && row[type]) { //超链接跳转
        window.open(row[type], '_blank');
      }
    },
    getSelected(indexList) {
      let selectedArr = this.tbodyList.filter(val => {
        return indexList.includes(val.uuid); // 获取所有选中列表
      });
      this.selectedItemList = selectedArr;
    },
    changeRow(rowData) {
      const { value, extraUuid = '', row = {} } = rowData || {};
      if (!this.$utils.isSame(value, row[extraUuid])) {
        if (!row.hasOwnProperty(extraUuid)) {
          this.$set(row, extraUuid, value); // 修复条件赋值不生效问题
        } else {
          row[extraUuid] = value;
        }
        this.setValue(this.tbodyList);
      }
    },
    getCurrentRowData(currentRowData) {
      const { reactionData = {}, rowData = {} } = currentRowData || {};
      this.$nextTick(() => {
        if (reactionData) {
          Object.assign(rowData, reactionData);
        }
      });
    }
  },
  filter: {},
  computed: {
    theadList() {
      const theadList = [];
      if (!this.disabled && !this.readonly) {
        if (!(this.config.disableDeleteData && this.config.disableAddData)) {
          theadList.push({ key: 'operation' });
        }
      }
      if (!this.config.disableDeleteData && !this.disabled && !this.readonly) {
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
              isRequired: !!(thead.config && thead.config.isRequired),
              config: thead.config,
              reaction: thead.reaction
            });
            if (thead?.config) {
              const validateList = buildValidateList({columnAttrItem: thead, readonly: this.readonly, disabled: this.disabled});
              if (validateList.length > 0) {
                this.validateMap[thead.uuid] = {
                  label: thead.label,
                  validateList: validateList
                };
              }
              if (!this.$utils.isEmpty(thead?.config?.dataConfig)) {
                thead.config.dataConfig.forEach(c => {
                  if (c.config) {
                    const innerValidateList = buildValidateList({columnAttrItem: c, readonly: this.readonly, disabled: this.disabled});
                    if (innerValidateList.length > 0) {
                      this.validateMap[c.uuid] = {
                        label: c.label,
                        validateList: innerValidateList
                      };
                    }
                  }
                });
              }
            }
          }
        });
      }
      return theadList;
    },
    extraList() {
      return this.config.dataConfig.filter(d => d.isExtra && d.isPC);
    },
    canAddData() {
      return !this.config.disableAddData;
    },
    getColumnReadonly() {
      return (uuid) => {
        if (this.readonly || this.disabled) {
          return true;
        }
        const columnItem = this.extraList.find(d => d.uuid === uuid);
        if (columnItem) {
          return false;
        }
        return true;
      };
    },
    columnAttrList() {
      const columnAttrList = this.config.dataConfig.filter(d => d.isPC);
      return this.$utils.deepClone(columnAttrList);
    },
    canDeleteRow() {
      return !!((!this.config.disableDeleteData && !this.readonly && !this.disabled));
    },
    showTable() {
      const { hideHeaderWhenDataEmpty = false } = this.config || {};
      return hideHeaderWhenDataEmpty ? this.tbodyList.length > 0 : true;
    },
    hasColumn() {
      if (this.mode != 'edit' && this.mode != 'editSubform' && this?.config?.dataConfig?.length > 0) {
        return true;
      }
      return false;
    },
    pagedTbodyList: {
      get() {
        this.tablePageConfig.rowNum = this.tbodyList.length;
        const start = (this.tablePageConfig.currentPage - 1) * this.tablePageConfig.pageSize;
        const end = start + this.tablePageConfig.pageSize;
        if (this.tbodyList.length <= start) {
          return [];
        }
        return this.tbodyList.slice(start, end);
      },
      set(newPageList) {
        const start = (this.tablePageConfig.currentPage - 1) * this.tablePageConfig.pageSize;
        for (let i = 0; i < newPageList.length; i++) {
          this.$set(this.tbodyList, start + i, newPageList[i]);
        }
      } 
    }
  },
  watch: {
    value: {
      handler(val) {
        if (!this.$utils.isSame(val, this.tbodyList)) {
          this.tbodyList = this.$utils.deepClone(val) || [];
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.form-item-width {
  min-width: 130px;
}
::v-deep .tstable-container, .table-container {
  overflow-x: scroll;
  width: 100%;
}
</style>
