<template>
  <div v-if="!loadingShow">
    <div v-if="!disabled && !readonly" class="mb-sm action-group">
      <div v-if="canAdd" class="action-item">
        <Button @click="addData()">{{ $t('dialog.title.addtarget', { target: $t('page.data') }) }}</Button>
      </div>
      <div v-if="selectedIndexList && selectedIndexList.length > 0 && !$utils.isEmpty(tableData.tbodyList)" class="action-item">
        <Button @click="removeSelectedItem">{{ $t('dialog.title.deletetarget', { target: $t('page.data') }) }}</Button>
      </div>
      <template v-if="canShowImportExportBtn">
        <span v-if="isShowExportExcelTemplate" class="action-item tsfont-download" @click="exportExcelTemplate">{{ $t('term.pbc.exporttemplate') }}</span>
        <span v-else class="action-item">
          <Icon
            type="ios-loading"
            size="18"
            class="loading"
          ></Icon>
          {{ $t('term.pbc.exporttemplate') }}
        </span>
        <span v-if="isShowExportExcel" class="action-item tsfont-download" @click="exportExcel">{{ $t('term.framework.exporttable') }}</span>
        <span v-else class="action-item">
          <Icon
            type="ios-loading"
            size="18"
            class="loading"
          ></Icon>
          {{ $t('term.framework.exporttable') }}
        </span>
      </template>
      <template v-if="canShowImportExportBtn">
        <Upload
          ref="upload"
          :show-upload-list="false"
          :default-file-list="[]"
          :format="['xlsx']"
          :max-size="maxSize"
          :on-format-error="handleFormatError"
          :on-exceeded-size="handleMaxSize"
          :before-upload="handleBeforeUpload"
          type="drag"
          action=""
          class="forminputtable-upload ml-sm"
          style="display: inline-block"
        >
          <span class="tsfont-upload">{{ $t('term.framework.importtable') }}</span>
        </Upload>
      </template>
    </div>
    <template v-if="showTable">
      <TsTable
        v-if="hasColumn"
        v-bind="tableData"
        :loading="loading"
        :multiple="true"
        :fixedHeader="false"
        :canDrag="!disabled && !readonly && config.isCanDrag"
        :readonlyTextIsHighlight="readonlyTextIsHighlight"
        @updateRowSort="updateRowSort"
        @getSelected="getSelectedItem"
      >
        <template v-slot:delete="{ row, index }">
          <div class="flex-start">
            <span class="tsfont-plus text-action mr-nm" @click.stop="addRow(index)"></span>
            <span class="tsfont-close text-action" @click.stop="deleteItem(row)"></span>
          </div>
        </template>
        <template v-if="config.isShowNumber" v-slot:number="{ index }">
          {{ index + 1 }}
        </template>
        <template v-for="extra in extraList" :slot="extra.uuid" slot-scope="{ row, index }">
          <div :key="extra.uuid" @click.stop>
            <FormItem
              :ref="'formitem_' + extra.uuid + '_' + index"
              :formItem="getExtraFormItem(extra, row)"
              :value="getDefaultValue(extra.uuid, row)"
              :formData="{ ...filterUuid(initFormData), ...row }"
              :formItemList="$utils.deepClone(extraList.concat(formItemList))"
              :showStatusIcon="false"
              mode="read"
              :readonly="readonly"
              :disabled="disabled"
              :isClearEchoFailedDefaultValue="true"
              :isCustomValue="true"
              :isClearSpecifiedAttr="isClearSpecifiedAttr"
              :externalData="externalData"
              :rowUuid="row.uuid"
              style="min-width: 130px"
              @change="val => changeRow(val, extra.uuid, row)"
              @updateCurrentRow="
                data => {
                  updateCurrentRow(row, data);
                }
              "
            ></FormItem>
          </div>
        </template>
      </TsTable>
      <TsTable v-else :theadList="tableData.theadList"></TsTable>
    </template>
  </div>
</template>
<script>
import base from '../base.vue';
import validmixin from '../common/validate-mixin.js';
import TsTable from '@/resources/components/TsTable/TsTable.vue'; //不能使用异步引入，会导致tssheet列高错位
import ExcelJS from 'exceljs';
import FileSaver from 'file-saver';

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
      loadingShow: true,
      isTableSelectorDialogShow: false,
      selectedIndexList: [],
      tableData: { theadList: [], tbodyList: [] },
      rowFormItem: {}, //保存每行的定义数据，避免每次都deepClone新数据，导致reaction失效
      maxSize: 1024 * 10,
      isShowExportExcelTemplate: true,
      isShowExportExcel: true,
      loading: false,
      conditionFormItemUuidList: [], //外部组件参与联动条件的uuid列表
      filterComponentList: ['formtableselector', 'formtableinputer', 'formsubassembly', 'formupload', 'formcube', 'formtable', 'formresoureces', 'formprotocol'], //过滤不参与规则的组件
      initExternalData: {}, //用于对比外部组件值变换
      initFormData: this.$utils.deepClone(this.formData)
    };
  },
  beforeCreate() {},
  created() {
    if (this.mode !== 'edit') {
      this.init();
      this.getConditionFormItemList();
    }
  },
  beforeMount() {},
  mounted() {
    this.$nextTick(() => {
      //避免初始化数据，联动过滤清空表格内数据
      this.loadingShow = false;
    });
  },
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
              let findKey = this.config.dataConfig.find(d => d.key === key);
              if (findKey) {
                //根据uuid不存在时根据key取值
                this.$set(element, findKey.uuid, element[key]);
              }
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
    addRow(index) {
      const data = { uuid: this.$utils.setUuid() };
      this.config.dataConfig.forEach(d => {
        if (d.isPC) {
          data[d.uuid] = (d.config && d.config.defaultValue) || null;
        }
      });
      Object.assign(data, this.initExternalData);
      this.tableData.tbodyList.splice(index + 1, 0, data);
    },
    removeSelectedItem() {
      for (let i = this.tableData.tbodyList.length - 1; i >= 0; i--) {
        const item = this.tableData.tbodyList[i];
        if (item._selected) {
          this.tableData.tbodyList.splice(i, 1);
        }
      }
    },
    addData() {
      const data = { uuid: this.$utils.setUuid() };
      this.config.dataConfig.forEach(d => {
        if (d.isPC) {
          data[d.uuid] = (d.config && d.config.defaultValue) || null;
        }
      });
      Object.assign(data, this.initExternalData);
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
      if (this.disabled) {
        this.$set(formItem.config, 'isDisabled', true);
      }
      if (this.readonly) {
        this.$set(formItem.config, 'isReadOnly', true);
      }
      return { ...formItem };
    },
    validConfig() {
      const errorList = [];
      if (!this.config.dataConfig || this.config.dataConfig.length == 0) {
        errorList.push({ field: 'dataConfig', error: this.$t('form.placeholder.pleaseadd', { target: this.$t('page.thead') }) });
      } else {
        let isKey = true;
        this.config.dataConfig.forEach(element => {
          const config = element.config;
          if (this.$utils.isEmpty(element.key)) {
            isKey = false;
          }
          if (['formselect', 'formradio', 'formcheckbox'].includes(element.handler)) {
            if (config.dataSource === 'static' && (!config.dataList || config.dataList.filter(d => d.value).length === 0)) {
              errorList.push({ field: 'dataConfig', error: this.$t('form.validate.leastonetarget', { target: this.$t('page.staticdatasource') }) });
            } else if (config.dataSource === 'matrix') {
              if (!config.matrixUuid) {
                errorList.push({ field: 'dataConfig', error: this.$t('form.placeholder.pleaseselect', { target: this.$t('page.matrix') }) });
              }
              if (!config.mapping.value) {
                errorList.push({ field: 'dataConfig', error: this.$t('form.placeholder.pleaseselect', { target: this.$t('term.framework.valfieldmapping') }) });
              }
              if (!config.mapping.text) {
                errorList.push({ field: 'dataConfig', error: this.$t('form.placeholder.pleaseselect', { target: this.$t('term.framework.showtextfieldmapping') }) });
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
              errorList.push({ field: 'dataConfig', error: this.$t('form.placeholder.pleaseselect', { target: this.$t('page.format') }) });
            }
          }
        });
        if (!isKey) {
          errorList.push({ field: 'dataConfig', error: this.$t('form.validate.required', { target: this.$t('term.framework.compkeyname') }) });
        }
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
      return [...errorList, ...this.validAttrUnique()];
    },
    validAttrUnique() {
      // 校验属性是否唯一
      let errorList = [];
      let { uniqueRuleConfig = [], dataConfig = [] } = this.config || {};
      if (uniqueRuleConfig.length == 0) {
        //如果存在设置唯一标识的字段则校验是否重复
        const uniqueRuleList = dataConfig.filter(v => v.config && v.config['isUnique']);
        if (!this.$utils.isEmpty(uniqueRuleList)) {
          let existMap = {};
          this.tableData.tbodyList.forEach(row => {
            if (!this.$utils.isEmpty(row)) {
              Object.keys(row).forEach(key => {
                const findUnunique = uniqueRuleList.find(d => d.uuid === key);
                if (findUnunique && row[key]) {
                  if (existMap[key] && existMap[key].includes(row[key])) {
                    errorList.push({ uuid: this.formItem.uuid, error: `属性唯一：${findUnunique.label}必须唯一` });
                  } else {
                    existMap[key] = existMap[key] ? [...existMap[key], row[key]] : [row[key]];
                  }
                }
              });
            }
          });
        }
        return errorList;
      } else {
        //组合属性是否唯一
        let attrLabel = dataConfig
          .filter(v => v['uuid'] && uniqueRuleConfig.includes(v['uuid']) && v.label)
          .map(item => item.label)
          .join(',');
        let tempValue = '';
        let existList = [];
        this.tableData.tbodyList.forEach(row => {
          if (!this.$utils.isEmpty(row)) {
            tempValue = '';
            Object.keys(row).forEach((key, index) => {
              if (uniqueRuleConfig.includes(key) && row[key]) {
                tempValue += `${JSON.stringify(row[key])}${index < uniqueRuleConfig.length - 1 ? '_' : ''}`;
              }
            });
            if (tempValue) {
              if (existList.includes(tempValue)) {
                errorList.push({ uuid: uniqueRuleConfig[0], error: `属性唯一：${attrLabel}必须唯一` });
              } else {
                existList.push(tempValue);
              }
            }
          }
        });
        return errorList;
      }
    },
    changeRow(val, uuid, row) {
      this.$set(row, uuid, val);
    },
    updateRowSort(event) {
      let beforeVal = this.tableData.tbodyList.splice(event.oldIndex, 1)[0];
      this.tableData.tbodyList.splice(event.newIndex, 0, beforeVal);
    },
    async exportExcelTemplate() {
      // 导出excel模板
      this.isShowExportExcelTemplate = false;
      const _workbook = new ExcelJS.Workbook();
      const _sheet1 = _workbook.addWorksheet('sheet1'); // 添加工作表
      // 设置表头
      let theadList = [];
      let theadUuidList = [];
      this.tableData.theadList.forEach(item => {
        if (item?.key && item?.title) {
          if (item.key != 'number' && !this.handleExcludeTable(item.key)) {
            // 序号是否需要显示
            theadList.push({
              header: item.title,
              key: item.key,
              width: 20,
              style: this.handleCellType(item.key)
            });
            theadUuidList.push(item.key);
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
          color: { argb: '000' }
        };
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true // 单元格自动换行
        };
      });
      // 数据验证
      let selectCpmponentList = ['formselect', 'formradio', 'formcheckbox']; // 数据有效性列表
      const startRow = 2;
      const endRow = 10;
      const _worksheetDataSource = _workbook.addWorksheet('数据源勿删'); // 从第二个工作表开始
      let resultConfig = await this.handlePromiseAll(selectCpmponentList, theadUuidList);
      for (let [index, item] of this.extraList.entries()) {
        if (theadUuidList.includes(item.uuid) && selectCpmponentList.includes(item.handler)) {
          // 遍历每一行，设置数据有效性
          let { dataSource = '', dataList = [] } = item.config || {};
          let formulaeList = dataSource === 'matrix' ? resultConfig[item.uuid] || [] : this.handleDataList(dataList);
          let columnsIndex = index + 1;
          _worksheetDataSource.getColumn(columnsIndex).values = formulaeList; // 设置数据有效性
          let columnsName = this.convertToExcelColumn(columnsIndex);
          for (let row = startRow; row <= endRow; row++) {
            const worksheetRow = _sheet1.getRow(row);
            const cell = worksheetRow.getCell(`${columnsName}`);
            cell.dataValidation = {
              type: 'list',
              allowBlank: false,
              formulae: [`数据源勿删!$${columnsName}:$${columnsName}`]
            };
          }
        }
      }
      // 导出表格
      _workbook.xlsx.writeBuffer().then(buffer => {
        let _file = new Blob([buffer], {
          type: 'application/octet-stream'
        });
        new Promise((resolve, reject) => {
          try {
            FileSaver.saveAs(_file, `${this.$t('term.framework.excelinputtemplate')}.xlsx`);
            resolve(this.$t('page.success'));
          } catch (error) {
            reject(this.$t('page.fail'));
          }
        }).finally(message => {
          this.isShowExportExcelTemplate = true;
        });
      });
    },
    async handlePromiseAll(selectCpmponentList, theadUuidList = []) {
      // 并发请求
      let ajaxConfig = {};
      let ajaxResult = [];
      let resultConfig = {};
      let ajaxRequest = [];
      for (let [index, item] of this.extraList.entries()) {
        if (theadUuidList.includes(item.uuid) && selectCpmponentList.includes(item.handler)) {
          let { dataSource, matrixUuid = '', mapping = {} } = item.config || {};
          if (dataSource === 'matrix') {
            ajaxResult.push(item.uuid);
            ajaxConfig[item.uuid] = {
              matrixUuid: matrixUuid,
              valueField: mapping.value,
              textField: mapping.text,
              needPage: false // 不需要分页，直接返回所有数据
            };
          }
        }
      }
      for (let key in ajaxConfig) {
        ajaxRequest.push(this.$api.framework.matrix.getMatrixDataForSelect(ajaxConfig[key]));
      }
      try {
        const resultList = await Promise.all(ajaxRequest);
        if (resultList && resultList.length > 0) {
          resultList.forEach((res, index) => {
            let { Status = '', Return = {} } = res || {};
            let { dataList = [] } = Return || {};
            if (Status && Status == 'OK') {
              resultConfig[ajaxResult[index]] = this.handleDataList(dataList);
            }
          });
        }
      } catch (error) {
        console.error('error', error);
      }
      return resultConfig;
    },
    handleDataList(dataList) {
      let resultList = [];
      for (const item of dataList) {
        if (!this.$utils.isEmpty(item.value)) {
          let combineValue = '';
          if (this.$utils.isSame(item.text, item.value)) {
            combineValue = item.value;
          } else {
            combineValue = item.text ? `${item.text}(${item.value})` : item.value;
          }
          if (!this.$utils.isEmpty(combineValue)) {
            resultList.push(combineValue);
          }
        }
      }
      return resultList;
    },
    async exportExcel() {
      // 导出excel带表格数据
      this.isShowExportExcel = false;
      const _workbook = new ExcelJS.Workbook(); // 创建工作簿
      const _sheet1 = _workbook.addWorksheet('sheet1'); // 添加工作表
      let columnsList = [];
      let theadUuidList = []; // 获取所有表头的uuid列表
      this.tableData.theadList.forEach(item => {
        if (item?.key && item?.title) {
          if (item.key != 'number' && !this.handleExcludeTable(item.key)) {
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
      let headerRow = _sheet1.getRow(1); // 获取第一行
      headerRow.eachCell((cell, colNum) => {
        cell.font = {
          bold: true,
          size: 12,
          name: '微软雅黑',
          color: { argb: '000' }
        };
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true // 单元格自动换行
        };
      });
      let tbodyList = this.$utils.deepClone(this.tableData.tbodyList);
      if (this.selectedIndexList.length > 0) {
        // 选中行导出
        tbodyList = tbodyList.filter((v, index) => this.selectedIndexList.includes(index));
      }
      tbodyList.forEach(item => {
        // 添加数据
        if (item) {
          for (let key in item) {
            if (key != 'uuid' && key != '_selected') {
              let selectedItem = this.extraList.find(extraItem => extraItem.uuid == key);
              let { handler = '' } = selectedItem || {};
              if (handler == 'formtable') {
                this.$set(item, [key], null);
              } else if (handler == 'formradio' || handler == 'formcheckbox' || handler == 'formselect') {
                this.$set(item, [key], this.handleSpecialValue(item[key]));
              } else if (handler == 'formupload') {
                if (item[key] && item[key].length > 0) {
                  this.$set(item, [key], item[key].map(v => v.name).join(';'));
                } else {
                  this.$set(item, [key], '');
                }
              }
            }
          }
          _sheet1.addRow({ ...item });
        }
      });
      // 数据验证
      let selectCpmponentList = ['formselect', 'formradio', 'formcheckbox']; // 数据有效性列表
      const startRow = 2;
      const endRow = 10;
      const _worksheetDataSource = _workbook.addWorksheet('数据源勿删'); // 下拉的数据源
      let resultConfig = await this.handlePromiseAll(selectCpmponentList, theadUuidList);
      for (let [index, item] of this.extraList.entries()) {
        if (theadUuidList.includes(item.uuid) && selectCpmponentList.includes(item.handler)) {
          // 遍历每一行，设置数据有效性
          let { dataSource = '', dataList = [] } = item.config || {};
          let formulaeList = dataSource === 'matrix' ? resultConfig[item.uuid] || [] : this.handleDataList(dataList);
          let columnsIndex = index + 1;
          _worksheetDataSource.getColumn(columnsIndex).values = formulaeList; // 设置数据有效性
          let columnsName = this.convertToExcelColumn(columnsIndex); // 数据校验的字符最大限制为255的字符，所以需要引用其他工作表作为下拉数据源
          for (let row = startRow; row <= endRow; row++) {
            const worksheetRow = _sheet1.getRow(row);
            const cell = worksheetRow.getCell(`${columnsName}`);
            cell.dataValidation = {
              type: 'list',
              allowBlank: false,
              formulae: [`数据源勿删!$${columnsName}:$${columnsName}`]
            };
          }
        }
      }
      // 导出表格
      _workbook.xlsx.writeBuffer().then(buffer => {
        let _file = new Blob([buffer], {
          type: 'application/octet-stream'
        });
        new Promise((resolve, reject) => {
          try {
            FileSaver.saveAs(_file, `${this.formItem?.label || ''}_${this.$utils.getCurrenttime('yyyyMMddHHmmss')}.xlsx`);
            resolve(this.$t('page.success'));
          } catch (error) {
            reject(this.$t('page.fail'));
          }
        }).finally(message => {
          this.isShowExportExcel = true;
        });
      });
    },
    handleCellType(uuid) {
      // 设置单元格类型
      let componentsList = ['formdate', 'formtime'];
      const foundItem = this.extraList.find(item => {
        return item.uuid && item.uuid === uuid && componentsList.includes(item.handler);
      });
      const formatObj = foundItem ? { numFmt: '@' } : {};
      return formatObj;
    },
    handleExcludeTable(uuid) {
      // 处理排除表格输入组件
      let componentsList = ['formtable'];
      const foundItem = this.extraList.find(item => {
        return item.uuid && item.uuid === uuid && componentsList.includes(item.handler);
      });
      return foundItem;
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

    handleSpecialValue(value) {
      let valueList = [];
      if (typeof value == 'string') {
        return value;
      } else if (typeof value == 'object' && value?.['text']) {
        return value['text'];
      } else if (Array.isArray(value)) {
        valueList = value.map(item => item['text']).filter(Boolean);
      }
      return valueList.join(',');
    },
    handleFormatError(file) {
      this.$Notice.warning({
        title: this.$t('message.incorrectformat'),
        desc: this.$t('form.validate.fileformat', { target: file.name })
      });
    },
    handleMaxSize(file) {
      this.$Notice.warning({
        title: this.$t('page.uploadfilelimit', { target: this.maxSize / 1024 }),
        desc: `${file.name}`
      });
    },
    handleBeforeUpload(file) {
      const workbook = new ExcelJS.Workbook();
      workbook.xlsx.load(file).then(workbook => {
        workbook?.eachSheet((sheet, id) => {
          if (id != 1) return; //只需要读取第一个sheet的内容，后面的sheet内容是做数据引用的，不需要读取
          sheet?.eachRow(async(row, rowIndex) => {
            if (rowIndex === 1) return; // 跳过第一行
            let rowValue = {};
            const rowValuesList = this.$utils.deepClone(row.values).slice(1); // 删除第一列序号
            let tbodyIndex = rowIndex - 2;
            let tbodyRow = this.tableData.tbodyList[tbodyIndex];
            let theadList = this.tableData.theadList.filter(v => v.key != 'selection' && v.key != 'number');
            let matrixSearchParamsList = [];
            for (let tIndex = 0; tIndex < theadList.length; tIndex++) {
              let theadKey = theadList[tIndex].key;
              let value = '';
              if (this.getDataByUuid(theadKey).dataSource == 'matrix') {
                if (!this.$utils.isEmpty(this.handleValueByMatrix(theadKey, rowValuesList[tIndex - 1]))) {
                  matrixSearchParamsList.push({
                    theadKey: theadKey,
                    list: this.handleValueByMatrix(theadKey, rowValuesList[tIndex - 1])
                  });
                }
              } else {
                value = this.byComponentTypeSetValue(theadKey, rowValuesList[tIndex - 1]);
              }
              this.loading = false;
              this.$set(rowValue, [theadKey], value);
            }
            let resultTemp = await this.getMatrixDataList(matrixSearchParamsList);
            for (let matrixData of resultTemp) {
              if (matrixData && matrixData.list && matrixData.list.length > 0) {
                let {isMultiple = false, handler = ''} = this.getDataByUuid(matrixData['theadKey']);
                this.$set(rowValue, matrixData['theadKey'], isMultiple == true || handler == 'formcheckbox' ? matrixData['list'] : matrixData['list'][0]);
              }
            }
            let item = { ...(tbodyRow || {}), ...rowValue };
            if (!this.$utils.isEmpty(tbodyRow)) {
              // 不为空时，修改数组对象里面的值
              this.tableData.tbodyList.splice(tbodyIndex, 1, item);
            } else {
              // 空数组时，新增一条新的数据
              this.tableData.tbodyList.push({ ...item, uuid: this.$utils.setUuid() });
            }
          });
        });
      });
    },
    getDataByUuid(uuid) {
      let selectedItem = this.extraList.find(extraItem => extraItem.uuid == uuid);
      let { config: {dataSource = '', isMultiple = false} = {}, handler = ''} = selectedItem || {};
      return {
        dataSource: dataSource,
        isMultiple: isMultiple,
        handler: handler
      };
    },
    async getMatrixDataList(searchParamList) {
      let configList = [];
      let list = [];
      if (searchParamList && searchParamList.length > 0) {
        searchParamList.forEach((item) => {
          if (item && item.list && item.list.length > 0) {
            list.push(...item.list);
          }
          if (item && item.theadKey) {
            configList.push({
              theadKey: item.theadKey,
              list: []
            });
          }
        });
      }
      await this.$api.framework.form.searchMatrixColumnData({
        searchParamList: list
      }).then(res => {
        if (res && res.Status == 'OK') {
          let tbodyList = (res.Return && res.Return.tbodyList) || [];
          tbodyList.forEach((item, index) => {
            if (item && item.dataList && item.dataList.length > 0) {
              configList[index].list = item.dataList;
            }
          });
        }
      });
      return configList;
    },
    handleValueByMatrix(uuid, value) {
      // 处理矩阵数据源
      if (this.$utils.isEmpty(value)) {
        return [];
      }
      let list = [];
      const selectedItem = this.extraList.find(extraItem => extraItem.uuid == uuid);
      const { config: {dataSource = '', matrixUuid = '', mapping: {text: mappingText = '', value: mappingValue = ''} = {}} = {} } = selectedItem || {};
      if (dataSource === 'matrix' && matrixUuid && mappingText && mappingValue) {
        list = [{
          matrixUuid: matrixUuid,
          textField: mappingText,
          valueField: mappingValue,
          defaultValue: this.handleDefaultValue(value) || value
        }];
      }
      return list;
    },
    handleDefaultValue(value) {
      if (this.$utils.isEmpty(value)) {
        return [];
      }
      let list = [];
      if (value && Array.isArray(value)) {
        value.forEach((v) => {
          const currentValue = this.getValueInParentheses(v);
          if (currentValue) {
            list.push(currentValue);
          } else {
            list.push(v);
          }
        });
      } else if (typeof value == 'string') {
        let tempList = value.split(',') || [];
        tempList.forEach((v) => {
          const currentValue = this.getValueInParentheses(v);
          if (currentValue) {
            list.push(currentValue);
          } else if (!this.$utils.isEmpty(v)) {
            list.push(v);
          }
        });
      } else {
        list = value ? [value] : [];
      }
      return list;
    },
    getValueInParentheses(str) {
      // 若输入为字符串，直接处理
      if (typeof str === 'string') {
        const regex = /(.*?)\((.*?)\)/; // 获取：I级(e1605edbcd974284982cd69944adf2df) 括号前面的值和括号里面的值
        const match = str.match(regex);
        return match && match.length > 2 ? {text: match[1], value: match[2]} : '';
      }
      return '';
    },
    byComponentTypeSetValue(uuid, value) {
      // 根据组件的类型，设置回显值
      if (this.$utils.isEmpty(value)) {
        return '';
      }
      const selectedItem = this.extraList.find(extraItem => extraItem.uuid == uuid);
      const { config: { dataSource = '', isMultiple = false } = {}, handler = '' } = selectedItem || {};
      const handleSingleValue = (val) => {
        const { text: tempText, value: tempValue } = this.getValueInParentheses(val);
        return {
          text: tempText || val,
          value: tempValue || val
        };
      };
      if (dataSource == 'static') {
        if ((isMultiple || handler == 'formcheckbox')) {
          if (typeof value == 'string') {
            return value.split(',').map(handleSingleValue);
          } else if (typeof value == 'number') {
            resultValue = [{ text: String(value), value: value }];
          } else {
            return [handleSingleValue(value)];
          }
        } else {
          return [handleSingleValue(value)];
        }
      }
      return typeof value == 'number' ? String(value) : value;
    },
    getConditionFormItemList() {
      //获取可以作为联动的条件的组件(外部组件和当前行下组件的属性)
      this.conditionFormItemUuidList = [];
      let allFormItem = this.formItemList.concat(this.formItem.config.dataConfig);
      let formItemList = allFormItem.filter(d => d.hasValue && (!this.formItem || (this.formItem && d.uuid != this.formItem.uuid)) && !this.filterComponentList.includes(d.handler));
      if (formItemList && formItemList.length > 0) {
        this.conditionFormItemUuidList = this.$utils.mapArray(formItemList, 'uuid');
      }
      this.conditionFormItemUuidList.push('uuid');
    },
    updateCurrentRow(row, val) {
      this.$nextTick(() => {
        if (val) {
          Object.assign(row, val);
        }
      });
    },
    filterUuid(obj) {
      if (obj.uuid) {
        delete obj.uuid;
      }
      return obj;
    }
  },
  filter: {},
  computed: {
    hasColumn() {
      if (this.mode != 'edit' && this.mode != 'editSubform' && this.config.dataConfig && this.config.dataConfig.length > 0) {
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
        if (dataConfig) {
          if (dataConfig.config) {
            const defaultValue = dataConfig.config.defaultValue;
            if (dataConfig.config.defaultValueType === 'custom') {
              return defaultValue;
            } else if (dataConfig.config.defaultValueType === 'matrix') {
              if (['formselect', 'formradio', 'formcheckbox'].includes(dataConfig.handler)) {
                const defaultValueField = dataConfig.config.defaultValueField;
                const defaultTextField = dataConfig.config.defaultTextField;
                return { text: row[defaultValueField], value: row[defaultTextField] };
              } else {
                return row[defaultValue];
              }
            } else {
              return defaultValue;
            }
          }
        }
        return null;
      };
    },
    canAdd() {
      return !this.config.hasOwnProperty('isCanAdd') || this.config.isCanAdd;
    },
    canShowImportExportBtn() {
      return !this.config.hasOwnProperty('isShowImportExportBtn') || this.config.isShowImportExportBtn;
    },
    formDataForWatch() {
      return JSON.parse(JSON.stringify(this.formData));
    },
    showTable() {
      const { hideHeaderWhenDataEmpty = false } = this.config || {};
      const { tbodyList = [] } = this.tableData || {};
      return hideHeaderWhenDataEmpty ? tbodyList.length > 0 : true;
    }
  },
  watch: {
    'config.dataConfig': {
      handler: function(val) {
        this.tableData.theadList = [];
        if (!this.disabled && !this.readonly) {
          if (!this.config.hasOwnProperty('isCanAdd') || this.config.isCanAdd) {
            this.tableData.theadList.push({ key: 'delete', width: 20 });
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
        this.$emit('resize');
      },
      deep: true,
      immediate: true
    },
    'tableData.tbodyList': {
      handler: function(val) {
        this.setValue(val);
      },
      deep: true,
      immediate: true
    },
    formDataForWatch: {
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
<style lang="less" scoped>
.forminputtable-upload {
  ::v-deep .ivu-upload-drag {
    border: none;
    background: transparent;
  }
}
</style>
