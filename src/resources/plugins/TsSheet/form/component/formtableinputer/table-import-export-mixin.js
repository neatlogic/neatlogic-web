import ExcelJS from 'exceljs';
import FileSaver from 'file-saver';
export default {
  // 处理表格导入导出的mixin
  data() {
    return {
      maxSize: 1024 * 10,
      isShowExportExcel: true,
      isShowExportExcelTemplate: true,
      isImportOperationLoading: false,
      dataValidateFormList: ['formselect', 'formradio', 'formcheckbox'] // 用于导出表格下拉列表数据有效性设置的组件列表：下拉框、单选框、多选框
    };
  },
  methods: {
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
    async exportExcelTemplate({ extraList = [], formItem } = {}) {
      // 导出模板
      this.isShowExportExcelTemplate = false;
      const _workbook = new ExcelJS.Workbook();
      const _sheet1 = _workbook.addWorksheet('sheet1'); // 添加工作表
      const { columnsList = [], columnsUuidList = [] } = this._generateExcelHeaderConfig({ extraList: extraList }) || {}; // 设置表头
      _sheet1.columns = columnsList;
      await this._setExportTableThead({ _workbook, _sheet1, columnsUuidList, extraList: extraList });
      _workbook.xlsx.writeBuffer().then(buffer => {
        // 导出表格
        let _file = new Blob([buffer], {
          type: 'application/octet-stream'
        });
        new Promise((resolve, reject) => {
          try {
            const tableName = formItem?.label ? `${formItem.label}_模板` : this.$t('term.framework.excelinputtemplate');
            FileSaver.saveAs(_file, `${tableName}_${this.$utils.getCurrenttime('yyyyMMddHHmmss')}.xlsx`);
            resolve(this.$t('page.success'));
          } catch (error) {
            reject(this.$t('page.fail'));
          }
        }).finally(message => {
          this.isShowExportExcelTemplate = true;
        });
      });
    },
    async exportExcelData({ tbodyList = [], extraList = [], selectedIndexList = [], formItem = {} } = {}) {
      // 导出excel带表格数据
      this.isShowExportExcel = false;
      const _workbook = new ExcelJS.Workbook(); // 创建工作簿
      let _sheet1 = _workbook.addWorksheet('sheet1'); // 添加工作表
      const { columnsList = [], columnsUuidList = [] } = this._generateExcelHeaderConfig({ extraList: extraList }) || {}; // 设置表头
      _sheet1.columns = columnsList;
      let deepClonetbodyList = this.$utils.deepClone(tbodyList);
      if (selectedIndexList && selectedIndexList.length > 0) {
        // 选中行导出
        deepClonetbodyList = deepClonetbodyList.filter((v, index) => selectedIndexList.includes(index));
      }
      deepClonetbodyList.forEach(item => {
        // 添加数据
        if (item) {
          for (let key in item) {
            if (key != 'uuid' && key != '_selected') {
              const selectedItem = extraList.find(extraItem => extraItem.uuid == key);
              const { handler = '' } = selectedItem || {};
              if (handler == 'formtable') {
                this.$set(item, [key], null);
              } else if (handler == 'formradio' || handler == 'formcheckbox' || handler == 'formselect') {
                this.$set(item, [key], this._convertToCommaSeparatedText(item[key]));
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
      await this._setExportTableThead({ _workbook, _sheet1, columnsUuidList, extraList });
      _workbook.xlsx.writeBuffer().then(buffer => {
        let _file = new Blob([buffer], {
          type: 'application/octet-stream'
        });
        new Promise((resolve, reject) => {
          try {
            const tableName = formItem?.label ? `${formItem.label}_数据` : '表格输入数据';
            FileSaver.saveAs(_file, `${tableName}_${this.$utils.getCurrenttime('yyyyMMddHHmmss')}.xlsx`);
            resolve(this.$t('page.success'));
          } catch (error) {
            reject(this.$t('page.fail'));
          }
        }).finally(() => {
          this.isShowExportExcel = true;
        });
      });
    },
    async handleBeforeUpload({ file, extraList = [], tbodyList = [] }) {
      // 导入表格
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(file);

      const sheet = workbook.getWorksheet(1);
      if (!sheet) return;

      const theadList = this._filterTheadColumns();
      const allRows = [];
      const matrixSearchParamMap = [];

      const firstRow = sheet.getRow(1);
      const excelTitles = firstRow.values.slice(1); // 去掉空的第 0 项，序号那一列

      // 1. 构建 enName => key 映射，例如： {"moduleName": "715fd0d0742a4b7badeaf147e2a9a1f6"}
      const keyMap = {};
      theadList.forEach(item => {
        if (item?.enName) {
          keyMap[item.enName] = item.key;
        }
      });

      // 2. 构建列索引 => 字段 key 映射（列号从 1 开始）
      const colIndexToKeyMap = {};
      excelTitles.forEach((title, index) => {
        // 使用正则表达式提取第一个 [] 中的内容
        const match = String(title).match(/^\[([^\]]+)\]/);
        const extractedTitle = match ? match[1] : title?.toString().trim();
        const key = keyMap[extractedTitle]; // 根据表单表格配置的key(英文名称)和导入表格的表头，进行匹配拿到对应列的序号
        if (key) {
          colIndexToKeyMap[index + 1] = key;
        }
      });
      for (let rowIndex = 2; rowIndex <= sheet.rowCount; rowIndex++) {
        // 从第二行开始读取数据，第一行是表头
        const row = sheet.getRow(rowIndex);
        const rowData = {
          rowIndex,
          rowValue: {},
          matrixKeys: []
        };
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const theadKey = colIndexToKeyMap[colNumber];
          if (!theadKey) return;

          const cellValue = cell.value;
          let value = '';

          if (this._getTableColumnConfigByUuid({ uuid: theadKey, extraList: extraList }).dataSource === 'matrix') {
            const matrixVal = this._generateMatrixSearchParams({ uuid: theadKey, value: cellValue, extraList: extraList });
            if (!this.$utils.isEmpty(matrixVal)) {
              rowData.matrixKeys.push(theadKey);
              matrixSearchParamMap.push({
                rowIndex,
                theadKey,
                list: matrixVal
              });
            }
          } else {
            value = this._setDisplayValueByCompType({ uuid: theadKey, value: cellValue, extraList: extraList });
            this.$set(rowData.rowValue, theadKey, value);
          }
        });
        allRows.push(rowData);
      }
      // matrix 一次性接口请求
      const matrixResultList = await this._searchMatrixColumnData(matrixSearchParamMap);
      const matrixResultMap = {};
      for (const item of matrixResultList) {
        if (!item.rowIndex || !item.theadKey) continue;
        matrixResultMap[`${item.rowIndex}::${item.theadKey}`] = item.list;
      }
      const newTbodyList = this.$utils.deepClone(tbodyList) || [];
      for (const rowData of allRows) {
        const { rowIndex, rowValue: rawRowValue, matrixKeys } = rowData;
        let tbodyIndex = rowIndex - 2;
        let tbodyRow = tbodyList[tbodyIndex];
        const rowValue = { ...rawRowValue };
        for (const theadKey of matrixKeys) {
          const list = matrixResultMap[`${rowIndex}::${theadKey}`] || [];
          const { isMultiple = false, handler = '' } = this._getTableColumnConfigByUuid({ uuid: theadKey, extraList: extraList });
          const value = isMultiple || handler === 'formcheckbox' ? list : list[0];
          this.$set(rowValue, theadKey, value);
        }
        let mergedItem = { ...(tbodyRow || {}), ...rowValue };
        // 如果有旧的，合并更新
        if (!this.$utils.isEmpty(tbodyRow)) {
          newTbodyList.splice(tbodyIndex, 1, { ...mergedItem });
        } else {
          // 没有旧的，新增一条
          newTbodyList.push({ ...mergedItem, uuid: this.$utils.setUuid() });
        }
      }
      this.tableData.tbodyList = newTbodyList;
    },
    async _fetchMatrixDataConcurrently({ columnsUuidList = [], extraList = [] }) {
      // 并发获取矩阵数据
      let searchParamConfig = {};
      let uuidList = [];
      let resultConfig = {};
      let ajaxRequest = [];
      extraList
        .filter(v => v && columnsUuidList.includes(v.uuid) && this.dataValidateFormList.includes(v.handler))
        .forEach(item => {
          const { dataSource, matrixUuid = '', mapping = {} } = item.config || {};
          if (dataSource === 'matrix') {
            uuidList.push(item.uuid);
            searchParamConfig[item.uuid] = {
              matrixUuid: matrixUuid,
              valueField: mapping.value,
              textField: mapping.text,
              needPage: false
            };
          }
        });
      for (let key in searchParamConfig) {
        ajaxRequest.push(this.$api.framework.matrix.getMatrixDataForSelect(searchParamConfig[key]));
      }
      try {
        const resultList = await Promise.all(ajaxRequest);
        if (resultList && resultList.length > 0) {
          resultList.forEach((res, index) => {
            let { Status = '', Return = {} } = res || {};
            let { dataList = [] } = Return || {};
            if (Status && Status == 'OK') {
              resultConfig[uuidList[index]] = this._generateExcelDropdownValuesList(dataList);
            }
          });
        }
      } catch (error) {
        console.error('error', error);
      }
      return resultConfig;
    },
    async _setExportTableThead({ _workbook, _sheet1, columnsUuidList = [], extraList = [] }) {
      // 设置导出表格的表头，以及设置(下拉、单选、多选、复选)数据有效性
      this._setTableHeaderFirstRowStyle(_sheet1); // 设置表头样式
      const startRow = 2;
      const endRow = 1000;
      const _worksheetDataSource = _workbook.addWorksheet('数据源勿删'); // 从第二个工作表开始
      const resultConfig = await this._fetchMatrixDataConcurrently({ columnsUuidList: columnsUuidList, extraList: extraList || [] });
      extraList.forEach((item, index) => {
        if (item && columnsUuidList.includes(item.uuid) && this.dataValidateFormList.includes(item.handler)) {
          const { dataSource = '', dataList = [] } = item.config || {};
          const formulaeList = dataSource === 'matrix' ? resultConfig[item.uuid] || [] : this._generateExcelDropdownValuesList(dataList);
          let columnsIndex = index + 1;
          _worksheetDataSource.getColumn(columnsIndex).values = formulaeList; // 设置数据有效性
          const columnsName = this.$utils.translateNumber(columnsIndex, 'en');
          for (let row = startRow; row <= endRow; row++) {
            const worksheetRow = _sheet1.getRow(row);
            const cell = worksheetRow.getCell(`${columnsName}`);
            cell.dataValidation = {
              type: 'list',
              allowBlank: false,
              formulae: [`数据源勿删!$${columnsName}$1:$${columnsName}$${formulaeList.length}`]
            };
          }
        }
      });
    },
    async _searchMatrixColumnData(searchParamList) {
      // 处理 Excel 导入数据：通过矩阵数据，依据显示名查询对应 value 值，用于数据回显
      let configList = [];
      let list = [];
      this.isImportOperationLoading = true;
      if (searchParamList && searchParamList.length > 0) {
        searchParamList.forEach(item => {
          if (item && item.list && item.list.length > 0) {
            list.push(...item.list);
          }
          if (item && item.theadKey) {
            configList.push({
              rowIndex: item.rowIndex,
              theadKey: item.theadKey,
              list: []
            });
          }
        });
      }
      if (list && list.length == 0) {
        this.isImportOperationLoading = false;
        return configList;
      }
      await this.$api.framework.form
        .searchMatrixColumnData({
          searchParamList: list
        })
        .then(res => {
          const { Status = '', Return = {} } = res || {};
          const { tbodyList = [] } = Return || {};
          if (Status == 'OK') {
            tbodyList.forEach((item, index) => {
              if (item && item.dataList && item.dataList.length > 0) {
                configList[index].list = item.dataList;
              }
            });
          }
        })
        .finally(() => {
          this.isImportOperationLoading = false;
        });
      return configList;
    },
    _generateExcelHeaderConfig({ extraList = [] } = {}) {
      // 生成 Excel 导出所需的表头配置
      let columnsList = [];
      let columnsUuidList = [];
      const tableTheadList = this._filterTheadColumns();
      tableTheadList.forEach(item => {
        if (item?.key && item?.title) {
          if (!this._findExcludedTableComponentByUuid({ uuid: item.key, extraList: extraList })) {
            let headerText = `[${item.enName}]`;
            if (headerText && item.title) {
              headerText += `${item.title}`;
            }
            columnsList.push({
              header: headerText,
              key: item.key,
              width: 35,
              style: this._getDateTimeCellFormat({ uuid: item.key, extraList: [] }) // 单元格格式为文本类型，解决日期和时间导入时类型是Date日期的类型
            });
            columnsUuidList.push(item.key);
          }
        }
      });
      return {
        columnsList: columnsList,
        columnsUuidList: columnsUuidList
      };
    },
    _setTableHeaderFirstRowStyle(_sheet1) {
      // 设置表格表头第一行的样式
      const headerRow = _sheet1.getRow(1); // 获取第一行
      headerRow.eachCell((cell, colNum) => {
        cell.font = {
          bold: true,
          size: 12,
          color: { argb: 'FFFFFFFF' }
        };
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: false
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF3368FF' }
        };
      });
    },
    _generateExcelDropdownValuesList(dataList) {
      // 处理数据列表，生成适用于 Excel 表格下拉列表的组合值列表
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
    _getDateTimeCellFormat({ uuid = '', extraList = [] } = {}) {
      // 设置日期或时间类型单元格的格式
      const componentsList = ['formdate', 'formtime'];
      const foundItem = extraList.find(item => {
        return item.uuid && item.uuid === uuid && componentsList.includes(item.handler);
      });
      const formatObj = foundItem ? { numFmt: '@' } : {};
      return formatObj;
    },
    _findExcludedTableComponentByUuid({ uuid = '', extraList = [] } = {}) {
      // 排除表格输入组件
      const componentsList = ['formtable'];
      const foundItem = extraList.find(item => {
        return item.uuid && item.uuid === uuid && componentsList.includes(item.handler);
      });
      return foundItem;
    },
    _convertToCommaSeparatedText(value) {
      // 将值转换为以逗号分隔文本字符串
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
    _getTableColumnConfigByUuid({ uuid = '', extraList = [] } = {}) {
      const selectedItem = extraList.find(extraItem => extraItem.uuid == uuid);
      const { config: { dataSource = '', isMultiple = false } = {}, handler = '' } = selectedItem || {};
      return {
        dataSource: dataSource,
        isMultiple: isMultiple,
        handler: handler
      };
    },
    _generateMatrixSearchParams({ uuid = '', value = '', extraList = [] } = {}) {
      // 生成矩阵搜索参数
      if (this.$utils.isEmpty(value)) {
        return [];
      }
      let list = [];
      const selectedItem = extraList.find(extraItem => extraItem.uuid == uuid);
      const { config: { dataSource = '', matrixUuid = '', mapping: { text: mappingText = '', value: mappingValue = '' } = {} } = {} } = selectedItem || {};
      if (dataSource === 'matrix' && matrixUuid && mappingText && mappingValue) {
        list = [
          {
            matrixUuid: matrixUuid,
            textField: mappingText,
            valueField: mappingValue,
            defaultValue: this._parseValueToArray(value) || value
          }
        ];
      }
      return list;
    },
    _parseValueToArray(value) {
      // 解析值并转换为数组
      if (this.$utils.isEmpty(value)) {
        return [];
      }
      let list = [];
      if (value && Array.isArray(value)) {
        value.forEach(v => {
          const currentValue = this._parseParenthesesContent(v);
          if (currentValue) {
            list.push(currentValue);
          } else {
            list.push(v);
          }
        });
      } else if (typeof value == 'string') {
        let tempList = value.split(',') || [];
        tempList.forEach(v => {
          const currentValue = this._parseParenthesesContent(v);
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
    _parseParenthesesContent(str) {
      // 解析括号前后的值
      if (typeof str === 'string') {
        const regex = /(.*?)\((.*?)\)/; // 获取：I级(e1605edbcd974284982cd69944adf2df) 括号前面的值和括号里面的值
        const match = str.match(regex);
        return match && match.length > 2 ? { text: match[1], value: match[2] } : '';
      }
      return '';
    },
    _setDisplayValueByCompType({uuid, value, extraList = []} = {}) {
      // 根据组件类型设置回显值
      if (this.$utils.isEmpty(value)) {
        return '';
      }
      const selectedItem = extraList.find(extraItem => extraItem.uuid == uuid);
      const { config: { dataSource = '', isMultiple = false } = {}, handler = '' } = selectedItem || {};
      const handleSingleValue = val => {
        const { text: tempText, value: tempValue } = this._parseParenthesesContent(val);
        return {
          text: tempText || val,
          value: tempValue || val
        };
      };
      if (dataSource == 'static') {
        if (isMultiple || handler == 'formcheckbox') {
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
    _filterTheadColumns() {
      // 过滤表头列属性
      return this.tableData.theadList.filter(v => v && v.key !== 'selection' && v.key !== 'number' && v.key !== 'delete');
    }
  }
};
