<template>
  <div v-if="!loadingShow">
    <div v-if="!disabled && !readonly" class="mb-sm action-group">
      <div v-if="canAdd" class="action-item">
        <Button @click="addData()">{{ $t('dialog.title.addtarget',{'target':$t('page.data')}) }}</Button>
      </div>
      <div v-if="selectedIndexList && selectedIndexList.length > 0 && !$utils.isEmpty(tableData.tbodyList)" class="action-item">
        <Button @click="removeSelectedItem">{{ $t('dialog.title.deletetarget',{'target':$t('page.data')}) }}</Button>
      </div>
      <span v-if="isShowExportExcelTemplate" class="action-item tsfont-export" @click="exportExcelTemplate">{{ $t('term.pbc.exporttemplate') }}</span>
      <span v-else class="action-item">
        <Icon
          type="ios-loading"
          size="18"
          class="loading"
        ></Icon>
        {{ $t('term.pbc.exporttemplate') }}
      </span>
      <span v-if="isShowExportExcel" class="action-item tsfont-export" @click="exportExcel">{{ $t('term.framework.exporttable') }}</span>
      <span v-else class="action-item">
        <Icon
          type="ios-loading"
          size="18"
          class="loading"
        ></Icon>
        {{ $t('term.framework.exporttable') }}
      </span>
      <template v-if="canAdd">
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
          style="display: inline-block;"
        >
          <span class="tsfont-import">{{ $t('term.framework.importtable') }}</span>
        </Upload>
      </template>
    </div>
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
      <template v-slot:delete="{ row }">
        <span class="tsfont-close-o text-action" @click.stop="deleteItem(row)"></span>
      </template>
      <template v-if="config.isShowNumber" v-slot:number="{ index }">
        {{ index+1 }}
      </template>
      <template v-for="extra in extraList" :slot="extra.uuid" slot-scope="{ row, index }">
        <div :key="extra.uuid" @click.stop>
          <FormItem
            :ref="'formitem_' + extra.uuid + '_' + index"
            :formItem="getExtraFormItem(extra, row)"
            :value="getDefaultValue(extra.uuid, row)"
            :formData="{...filterUuid(initFormData), ...row}"
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
            style="min-width:130px"
            @change="(val)=>changeRow(val,extra.uuid, row)"
            @updateCurrentRow="(data)=>{
              updateCurrentRow(row, data);
            }"
          ></FormItem>
        </div>
      </template>
    </TsTable>
    <TsTable v-else :theadList="tableData.theadList"></TsTable>
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
      return formItem;
    },
    validConfig() {
      const errorList = [];
      if (!this.config.dataConfig || this.config.dataConfig.length == 0) {
        errorList.push({ field: 'dataConfig', error: this.$t('form.placeholder.pleaseadd', {'target': this.$t('page.thead')}) });
      } else {
        let isKey = true;
        this.config.dataConfig.forEach(element => {
          const config = element.config;
          if (this.$utils.isEmpty(element.key)) {
            isKey = false;
          }
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
            } else if (config.dataSource === 'formtableinputer') {
              //选择表单输入组件
              let findItem = this.formItemList.find(item => item.uuid === config.formtableinputerUuid);
              if (!findItem) {
                errorList.push({ field: 'dataConfig', error: '【' + element.label + '】' + this.$t('message.framework.datasourceselectmessage')});
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
                    errorList.push({ field: 'dataConfig', error: '【' + element.label + '】' + this.$t('form.placeholder.pleaseselect', {'target': this.$t('page.fieldmapping')}) });
                  }
                }
              }
            }
          } else if (['formdate', 'formtime'].includes(element.handler)) {
            if (!config.format) {
              errorList.push({ field: 'dataConfig', error: this.$t('form.placeholder.pleaseselect', {'target': this.$t('page.format')}) });
            }
          }
        });
        if (!isKey) {
          errorList.push({ field: 'dataConfig', error: this.$t('form.validate.required', {'target': this.$t('term.framework.compkeyname')}) });
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
      let {uniqueRuleConfig = [], dataConfig = []} = this.config || {};
      if (uniqueRuleConfig.length == 0) {
        //如果存在设置唯一标识的字段则校验是否重复
        const uniqueRuleList = dataConfig.filter((v) => v.config && v.config['isUnique']);
        if (!this.$utils.isEmpty(uniqueRuleList)) {
          let existMap = {};
          this.tableData.tbodyList.forEach((row) => {
            if (!this.$utils.isEmpty(row)) {
              Object.keys(row).forEach((key) => {
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
        let attrLabel = dataConfig.filter((v) => v['uuid'] && uniqueRuleConfig.includes(v['uuid']) && v.label).map((item) => item.label).join(',');
        let tempValue = '';
        let existList = [];
        this.tableData.tbodyList.forEach((row) => {
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
      this.tableData.theadList.forEach((item) => {
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
          color: {argb: '000'}
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
      let resultConfig = await this.handlePromiseAll(selectCpmponentList, theadUuidList);
      for (let [index, item] of this.extraList.entries()) {
        if (theadUuidList.includes(item.uuid) && selectCpmponentList.includes(item.handler)) {
          // 遍历每一行，设置数据有效性
          let {dataSource = '', dataList = [] } = item.config || {};
          let formulaeList = dataSource === 'matrix' ? resultConfig[item.uuid] || [] : this.handleDataList(dataList);
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
        new Promise((resolve, reject) => {
          try {
            FileSaver.saveAs(_file, `${this.$t('term.framework.excelinputtemplate')}.xlsx`);
            resolve(this.$t('page.success'));
          } catch (error) {
            reject(this.$t('page.fail'));
          }
        }).finally((message) => {
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
          let {dataSource, matrixUuid = '', mapping = {}} = item.config || {};
          if (dataSource === 'matrix') {
            ajaxResult.push(item.uuid);
            ajaxConfig[item.uuid] = {
              matrixUuid: matrixUuid,
              valueField: mapping.value,
              textField: mapping.text
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
            let {Status = '', Return = {}} = res || {};
            let {dataList = []} = Return || {};
            if (Status && Status == 'OK') {
              resultConfig[ajaxResult[index]] = [`"${dataList.filter((a) => this.handleSpecialValue(a.text)).map((b) => this.handleSpecialValue(b.text)).join(',')}"`];
            }
          });
        }
      } catch (error) {
        console.error('error', error);
      }
      return resultConfig;
    },
    handleDataList(dataList) {
      const resultArray = [
        `"${dataList
          .filter(item => item?.text)
          .map(item => item.text)
          .join(',')}"`
      ];
      return resultArray;
    },
    async exportExcel() {
      // 导出excel带表格数据
      this.isShowExportExcel = false;
      const _workbook = new ExcelJS.Workbook(); // 创建工作簿
      const _sheet1 = _workbook.addWorksheet('sheet1'); // 添加工作表
      let columnsList = [];
      let theadUuidList = []; // 获取所有表头的uuid列表
      this.tableData.theadList.forEach((item) => {
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
          color: {argb: '000'}
        };
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true // 单元格自动换行
        };
      });
      let tbodyList = this.$utils.deepClone(this.tableData.tbodyList);
      if (this.selectedIndexList.length > 0) { // 选中行导出
        tbodyList = tbodyList.filter((v, index) => this.selectedIndexList.includes(index));
      }
      tbodyList.forEach((item) => {
        // 添加数据
        if (item) {
          for (let key in item) {
            if (key != 'uuid' && key != '_selected') {
              let selectedItem = this.extraList.find((extraItem) => extraItem.uuid == key);
              let {handler = ''} = selectedItem || {};
              if (handler == 'formtable') {
                this.$set(item, [key], null);
              } else if ((handler == 'formradio' || handler == 'formcheckbox' || handler == 'formselect')) {
                this.$set(item, [key], this.handleSpecialValue(item[key]));
              } else if (handler == 'formupload') {
                if (item[key] && item[key].length > 0) {
                  this.$set(item, [key], item[key].map((v) => v.name).join(';'));
                } else {
                  this.$set(item, [key], '');
                }
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
      let resultConfig = await this.handlePromiseAll(selectCpmponentList, theadUuidList);
      for (let [index, item] of this.extraList.entries()) {
        if (theadUuidList.includes(item.uuid) && selectCpmponentList.includes(item.handler)) {
          // 遍历每一行，设置数据有效性
          let {dataSource = '', dataList = [] } = item.config || {};
          let formulaeList = dataSource === 'matrix' ? resultConfig[item.uuid] || [] : this.handleDataList(dataList);
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
        new Promise((resolve, reject) => {
          try {
            FileSaver.saveAs(_file, `${this.formItem?.label || ''}_${this.$utils.getCurrenttime('yyyyMMddHHmmss')}.xlsx`);
            resolve(this.$t('page.success'));
          } catch (error) {
            reject(this.$t('page.fail'));
          }
        }).finally((message) => {
          this.isShowExportExcel = true;
        });
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
    handleExcludeTable(uuid) {
      // 处理排除表格输入组件
      let componentsList = ['formtable'];
      const foundItem = this.extraList.find((item) => {
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
        valueList = value.map((item) => item['text']).filter(Boolean);
      }
      return valueList.join(',');
    },
    handleFormatError(file) {
      this.$Notice.warning({
        title: this.$t('message.incorrectformat'),
        desc: this.$t('form.validate.fileformat', {target: file.name})
      });
    },
    handleMaxSize(file) {
      this.$Notice.warning({
        title: this.$t('page.uploadfilelimit', {target: this.maxSize / 1024}),
        desc: `${file.name}`
      });
    },
    handleBeforeUpload(file) {
      const workbook = new ExcelJS.Workbook();
      workbook.xlsx.load(file).then((workbook) => {
        workbook?.eachSheet((sheet, id) => {
          sheet?.eachRow(async(row, rowIndex) => {
            if (rowIndex != 1) {
              let rowValue = {};
              let rowValuesList = this.$utils.deepClone(row.values);
              rowValuesList.splice(0, 1); // 删除excel第一列的序号
              for (let tIndex = 0; tIndex < this.tableData.theadList.length; tIndex++) {
                if (this.tableData.theadList[tIndex] && this.tableData.theadList[tIndex].key != 'selection' && this.tableData.theadList[tIndex].key != 'number') {
                  let value = await this.byComponentTypeSetValue(this.tableData.theadList[tIndex].key, rowValuesList[tIndex - 2]);
                  this.loading = false;
                  this.$set(rowValue, [this.tableData.theadList[tIndex].key], value);
                }
              }
              let item = {...(this.tableData.tbodyList[rowIndex - 2] || {}), ...rowValue};
              if (!this.$utils.isEmpty(this.tableData.tbodyList[rowIndex - 2])) {
                // 不为空时，修改数组对象里面的值
                this.tableData.tbodyList.splice(rowIndex - 2, 1, item);
              } else {
                // 空数组时，新增一条新的数据
                this.tableData.tbodyList.push({...item, uuid: this.$utils.setUuid() });
              }
            }
          });
        });
      });
    },
    async byComponentTypeSetValue(uuid, value) {
      // 根据组件的类型，设置回显值
      let resultValue;
      let selectedItem = this.extraList.find((extraItem) => extraItem.uuid == uuid);
      let {config = {}, handler = ''} = selectedItem || {};
      if (!this.$utils.isEmpty(value)) {
        let {dataSource = '', isMultiple = false, matrixUuid = '', mapping = {}} = config || {};
        if (dataSource === 'matrix' && (isMultiple || handler == 'formradio' || handler == 'formcheckbox')) {
        // 矩阵
          resultValue = [];
          if (matrixUuid && !this.$utils.isEmpty(mapping) && mapping.text && mapping.value) {
            this.loading = true;
            let params = {
              searchParamList: [
                {
                  matrixUuid: matrixUuid,
                  textField: mapping.text,
                  valueField: mapping.value,
                  defaultValue: value instanceof Array ? value : typeof value == 'string' ? value.split(',') : [value] // 逗号处理多个选项时传递的值
                }
              ]
            };
            await this.$api.framework.form.searchMatrixColumnData(params).then((res) => {
              if (res && res.Status == 'OK') {
                let tbodyList = res.Return && res.Return.tbodyList || [];
                tbodyList.forEach((item) => {
                  if (item && item.dataList) {
                    resultValue.push(...item.dataList);
                  }
                });
              }
            });
          }
        } else if (dataSource == 'static' && (isMultiple || (handler == 'formcheckbox'))) {
          resultValue = [];
          resultValue = typeof value == 'string' ? value.split(',') : [typeof value == 'number' ? String(value) : value];
        } else {
          resultValue = typeof value == 'number' ? String(value) : value;
        }
      }
      return resultValue;
    },
    getConditionFormItemList() { //获取可以作为联动的条件的组件(外部组件和当前行下组件的属性)
      this.conditionFormItemUuidList = [];
      let allFormItem = this.formItemList.concat(this.formItem.config.dataConfig);
      let formItemList = allFormItem.filter(d => d.hasValue && (!this.formItem || (this.formItem && d.uuid != this.formItem.uuid)) && !this.filterComponentList.includes(d.handler));
      if (formItemList && formItemList.length > 0) {
        this.conditionFormItemUuidList = this.$utils.mapArray(formItemList, 'uuid');
      }
      this.conditionFormItemUuidList.push('uuid');
    },
    updateConditionData() {
      let obj = {};
      Object.keys(this.formDataForWatch).forEach(key => {
        if (key !== 'uuid' && this.conditionFormItemUuidList.includes(key)) {
          obj[key] = this.formDataForWatch[key];
        }
      });
      if (!this.$utils.isSame(obj, this.initExternalData)) {
        this.initExternalData = this.$utils.deepClone(obj);
        this.tableData.tbodyList.forEach(item => {
          Object.keys(item).forEach(key => {
            //是否是当前组件的属性
            const currentItemKey = this.config.dataConfig.find(d => d.uuid === key);
            if (!currentItemKey && !this.conditionFormItemUuidList.includes(key) && key !== 'uuid') { //uuid作为每一行的唯一标识，不能删除
              //清除当前行下多余的属性（主要是外部组件联动属性）
              this.$delete(item, key);
            }
          });
          Object.assign(item, obj);
        });
      }
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
      if (this.mode != 'edit' && (this.mode != 'editSubform') && this.config.dataConfig && this.config.dataConfig.length > 0) {
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
                return {text: row[defaultValueField], value: row[defaultTextField]};
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
    formDataForWatch() {
      return JSON.parse(JSON.stringify(this.formData));
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
          this.updateConditionData();
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
  /deep/ .ivu-upload-drag {
    border: none;
    background: transparent;
  }
}
</style>
