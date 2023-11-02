<template>
  <div>
    <div v-if="!disabled && !readonly" class="mb-sm action-group">
      <div v-if="!config.hasOwnProperty('isCanAdd') || config.isCanAdd" class="action-item">
        <Button @click="addData()">{{ $t('dialog.title.addtarget',{'target':$t('page.data')}) }}</Button>
      </div>
      <div v-if="selectedIndexList && selectedIndexList.length > 0" class="action-item">
        <Button @click="removeSelectedItem">{{ $t('dialog.title.deletetarget',{'target':$t('page.data')}) }}</Button>
      </div>
      <span class="action-item tsfont-export" @click="exportExcelTemplate">{{ $t('term.pbc.exporttemplate') }}</span>
      <span class="action-item tsfont-export" @click="exportExcel">{{ $t('term.framework.exporttable') }}</span>
      <Upload
        ref="upload"
        :show-upload-list="false"
        :default-file-list="[]"
        :format="['xlsx']"
        :max-size="2048"
        :on-format-error="handleFormatError"
        :on-exceeded-size="handleMaxSize"
        :before-upload="handleBeforeUpload"
        type="drag"
        action=""
        class="forminputtable-upload ml-sm"
        style="display: inline-block;"
      >
        <span class="tsfont-import">{{ $t('term.framework.importtable') }}</span>
      </Upload>
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
import ExcelJS from 'exceljs';
import FileSaver from 'file-saver';

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
    },
    exportExcelTemplate() {
      // 导出excel模板
      const _workbook = new ExcelJS.Workbook();
      const _sheet1 = _workbook.addWorksheet('sheet1'); // 添加工作表
      // 设置表头
      let theadList = [];
      this.tableData.theadList.forEach((item) => {
        if (item?.key && item?.title) {
          if (item.key != 'number') {
            // 序号是否需要显示
            theadList.push({
              header: item.title,
              key: item.key,
              width: 20
            });
          }
        }
      });
      _sheet1.columns = theadList;
      let headerRow = _sheet1.getRow(1); // 获取第一行
      headerRow.eachCell((cell, colNum) => {
        cell.font = {
          bold: true,
          size: 12,
          name: '微软雅黑',
          color: {argb: '000'}
        };
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true // 单元格自动换行
        };
      });
      // 导出表格
      _workbook.xlsx.writeBuffer().then((buffer) => {
        let _file = new Blob([buffer], {
          type: 'application/octet-stream'
        });
        FileSaver.saveAs(_file, `${this.$t('term.framework.excelinputtemplate')}.xlsx`);
      });
    },
    async exportExcel() {
      // 导出excel带表格数据
      const _workbook = new ExcelJS.Workbook(); // 创建工作簿
      const _sheet1 = _workbook.addWorksheet('sheet1'); // 添加工作表
      let columnsList = [];
      let theadUuidList = []; // 获取所有表头的uuid列表
      this.tableData.theadList.forEach((item) => {
        if (item?.key && item?.title) {
          if (item.key != 'number') {
            columnsList.push({
              header: item.title,
              key: item.key,
              width: 20,
              style: this.handleCellType(item.key) // 单元格格式为文本类型，解决日期和时间导入时类型是Date日期的类型
            });
            theadUuidList.push(item.key);
          }
        }
      });
      _sheet1.columns = columnsList;
      let tbodyList = this.$utils.deepClone(this.tableData.tbodyList);
      tbodyList.forEach((item) => {
        // 添加数据
        if (item) {
          for (let key in item) {
            if (key != 'uuid' && key != '_selected') {
              let selectedItem = this.extraList.find((extraItem) => extraItem.uuid == key);
              let {config = {}, handler = ''} = selectedItem || {};
              let {dataSource = '', isMultiple = false} = config;
              if (dataSource == 'matrix' && isMultiple) {
                // 矩阵数据源并且是多选，需要处理值去掉&=&
                this.$set(item, [key], this.handleSpecialValue(item[key]));
              } else if (dataSource == 'static' && (isMultiple || handler == 'formcheckbox')) {
                // 静态数据源并且是多选
                this.$set(item, [key], item[key].join(','));
              }
            }
          }
          _sheet1.addRow({...item});
        }
      });
      // 数据验证
      let selectCpmponentList = ['formselect', 'formradio', 'formcheckbox']; // 数据有效性列表
      const startRow = 2;
      const endRow = 10;
      for (let [index, item] of this.extraList.entries()) {
        if (theadUuidList.includes(item.uuid) && selectCpmponentList.includes(item.handler)) {
          // 遍历每一行，设置数据有效性
          let formulaeList = await this.handleFormulae(item.config);
          for (let row = startRow; row <= endRow; row++) {
            const worksheetRow = _sheet1.getRow(row);
            const cell = worksheetRow.getCell(`${this.convertToExcelColumn(index + 1)}`);
            cell.dataValidation = {
              type: 'list',
              allowBlank: false,
              formulae: formulaeList
            };
          }
        }
      }

      // 导出表格
      _workbook.xlsx.writeBuffer().then((buffer) => {
        let _file = new Blob([buffer], {
          type: 'application/octet-stream'
        });
        FileSaver.saveAs(_file, `${this.formItem?.label || ''}_${this.$utils.getCurrenttime('yyyyMMddHHmmss')}.xlsx`);
      });
    },
    handleCellType(uuid) {
      // 设置单元格类型
      let componentsList = ['formdate', 'formtime'];
      const foundItem = this.extraList.find((item) => {
        return item.uuid && item.uuid === uuid && componentsList.includes(item.handler);
      });
      const formatObj = foundItem ? { numFmt: '@' } : {};
      return formatObj;
    },
    convertToExcelColumn(number) {
      // 将数字转化成A-Z的值
      let result = '';
      while (number > 0) {
        const remainder = (number - 1) % 26;
        result = String.fromCharCode(65 + remainder) + result;
        number = Math.floor((number - 1) / 26);
      }
      return result;
    },
    async handleFormulae(config) {
      // 处理数据有效性下拉
      let {dataSource = '', matrixUuid = '', mapping = {}, dataList = [] } = config || {};
      if (dataSource === 'matrix') {
        let param = {
          matrixUuid: matrixUuid,
          valueField: mapping.value,
          textField: mapping.text
        };
        return await this.$api.framework.matrix.getMatrixDataForSelect(param).then(res => {
          if (res.Status == 'OK') {
            return [`"${res.Return?.dataList?.filter((item) => this.handleSpecialValue(item.value)).map((item) => this.handleSpecialValue(item.value)).join(',')}"`];
          }
        });
      } else {
        const resultArray = [
          `"${dataList
            .filter(item => item?.value)
            .map(item => item.value)
            .join(',')}"`
        ];
        return resultArray;
      }
    },
    handleSpecialValue(value) {
      let valueList = [];

      if (typeof value == 'string') {
        return value?.split('&=&')?.[0] || value;
      } else if (Array.isArray(value)) {
        valueList = value.map((item) => item?.split('&=&')?.[0] || item).filter(Boolean);
      }

      return valueList.join(',');
    },
    handleFormatError(file) {
      this.$Notice.warning({
        title: '格式不正确',
        desc: `格式${file.name}不正确，请选择正确的格式`
      });
    },
    handleMaxSize(file) {
      this.$Notice.warning({
        title: '超出文件大小限制',
        desc: `${file.name}`
      });
    },
    async handleBeforeUpload(file) {
      const workbook = new ExcelJS.Workbook();
      workbook.xlsx.load(file).then((workbook) => {
        workbook?.eachSheet((sheet, id) => {
          sheet?.eachRow((row, rowIndex) => {
            if (rowIndex != 1) {
              let rowValue = {};
              let rowValuesList = this.$utils.deepClone(row.values);
              rowValuesList.splice(0, 1); // 删除excel第一列的序号
              this.tableData.theadList.forEach((item, tIndex) => {
                if (item.key != 'selection' && item.key != 'number') {
                  this.$set(rowValue, [item.key], this.byComponentTypeSetValue(item.key, rowValuesList[tIndex - 2]));
                }
              });
              let item = {...(this.tableData.tbodyList[rowIndex - 2] || {}), ...rowValue};
              if (!this.$utils.isEmpty(this.tableData.tbodyList[rowIndex - 2])) {
                // 不为空时，修改数组对象里面的值
                this.tableData.tbodyList.splice(rowIndex - 2, 1, item);
              } else {
                // 空数组时，新增一条新的数据
                this.tableData.tbodyList.push(item);
              }
            }
          });
        });
      });
    },
    byComponentTypeSetValue(uuid, item) {
      // 根据组件的类型，设置回显值
      let resultValue;
      let selectedItem = this.extraList.find((extraItem) => extraItem.uuid == uuid);
      let {config = {}, handler = ''} = selectedItem || {};
      if (item) {
        let {dataSource = '', isMultiple = false} = config || {};
        if (dataSource === 'matrix' && isMultiple) {
        // 矩阵
          resultValue = [];
          let valueList = [];
          if (typeof item == 'string') {
            valueList = item.split(',');
            valueList.forEach((valueItem) => {
              if (valueItem) {
                resultValue.push(`${valueItem}&=&${valueItem}`);
              }
            });
          } else {
            resultValue.push(`${item}&=&${item}`);
          }
        } else if (dataSource == 'static' && (isMultiple || (handler == 'formcheckbox'))) {
          resultValue = [];
          resultValue.push(item);
        } else {
          resultValue = item;
        }
      }
      return resultValue;
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
<style lang="less" scoped>
.forminputtable-upload {
  /deep/ .ivu-upload-drag {
    border: none;
    background: transparent;
  }
}
</style>
