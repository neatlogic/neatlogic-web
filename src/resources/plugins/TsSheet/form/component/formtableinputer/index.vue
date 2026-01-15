<template>
  <div v-if="isReady">
    <div v-if="!disabled && !readonly" class="mb-sm action-group">
      <div v-if="canAdd" class="action-item">
        <Button @click="addData()">{{ $t('dialog.title.addtarget', { target: $t('page.data') }) }}</Button>
      </div>
      <div v-if="isShowDeleteBtn && !$utils.isEmpty(pagedTbodyList)" class="action-item">
        <Button @click.stop="removeSelectedItem">{{ $t('dialog.title.deletetarget', { target: $t('page.data') }) }}</Button>
      </div>
      <template v-if="canShowImportExportBtn">
        <span
          v-if="isShowExportExcelTemplate"
          class="action-item tsfont-download"
          @click="() => exportExcelTemplate({
            extraList: extraList,
            formItem: formItem
          })"
        >
          {{ $t('term.pbc.exporttemplate') }}
        </span>
        <span v-else class="action-item">
          <Icon
            type="ios-loading"
            size="18"
            class="loading"
          ></Icon>
          {{ $t('term.pbc.exporttemplate') }}
        </span>
        <span
          v-if="isShowExportExcel"
          class="action-item tsfont-download"
          @click.stop="exportExcelData({
            extraList: extraList,
            formItem: formItem,
            tbodyList: tbodyList,
            selectedCurrentPageMap: selectedCurrentPageMap,
          })"
        >
          {{ $t('term.framework.exporttable') }}
        </span>
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
          :before-upload="(file)=> handleBeforeUpload({
            file: file,
            extraList: extraList,
            tbodyList: tbodyList
          })"
          type="drag"
          action=""
          class="forminputtable-upload ml-sm"
          style="display: inline-block"
        >
          <span class="tsfont-upload">{{ $t('term.framework.importtable') }}</span>
        </Upload>
      </template>
    </div>
    <Loading :loadingShow="isImportOperationLoading" type="fix"></Loading>
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
                    <span v-else :class="col.isRequired ? 'require-label' : ''" :style="col.width ? {width: col.width} : {}">{{ col.title }}</span>
                  </th>
                </tr>
              </thead>
              <VueDraggable
                v-model="pagedTbodyList"
                :disabled="readonly || disabled"
                :animation="150"
                tag="tbody"
                handle=".tsfont-drag"
                class="tbody-main"
                draggable="tr"
              >
                <tr
                  v-for="(row, index) in pagedTbodyList"
                  :key="row.uuid"
                >
                  <td v-if="config.isCanDrag && hasDragColumn">
                    <span class="tsfont-drag" style="cursor:move;"></span>
                  </td>
                  <td v-if="hasDelete">
                    <div class="flex-start">
                      <span class="tsfont-plus text-action mr-nm" @click.stop="addRow(index)"></span>
                      <span class="tsfont-close text-action mr-nm" @click.stop="deleteItem(row)"></span>
                    </div>
                  </td>
                  <td v-if="hasDelete">
                    <Checkbox
                      :value="selectedCurrentPageMap[row.uuid]"
                      :disabled="readonly || disabled"
                      @on-change="handleSelectedRow($event, row)"
                    ></Checkbox>
                  </td>
                  <td v-if="config.isShowNumber">
                    {{ index + 1 }}
                  </td>
                  <td v-for="extra in extraList" :key="`${row.uuid}_ ${extra.uuid}`" @click.stop>
                    <ColumnItem
                      :ref="`formitem_${row.uuid}${extra.uuid}`"
                      :rowData="row"
                      :rowUuid="row.uuid"
                      :extraUuid="extra.uuid"
                      :reactionData="getReactionData(extra, row)"
                      :reactionValueData="reactionValuesMap[extra.uuid]"
                      :expressionData="getExpressionData(extra)"
                      class="form-item-width"
                      @change="changeRow"
                      @getCurrentRowData="getCurrentRowData"
                    ></ColumnItem>
                  </td>
                </tr>
              </VueDraggable>
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
</template>
<script>
import base from '../base.vue';
import validmixin from '../common/validate-mixin.js';
import conditionMixin from './condition-mixin.js';
import expressionMixin from './expression-mixin.js';
import TableImportExportMixin from './table-import-export-mixin.js';
export default {
  name: '',
  components: {
    VueDraggable: () => import('vuedraggable'),
    TsSimpleTable: () => import('@/resources/components/TsSimpleTable/index.vue'),
    ColumnItem: () => import('@/resources/plugins/TsSheet/form/component/formtableinputer/column-item.vue')
  },
  extends: base,
  mixins: [validmixin, conditionMixin, expressionMixin, TableImportExportMixin],
  props: {
    readonly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },
  provide() {
    return {
      getFormDataForWatch: () => this.formDataForWatch,
      extraFormItemList: this.frozenExtraFormItemList,
      extendConfigList: this.frozenExtendConfigList,
      formItemList: this.frozenFormItemList,
      externalData: this.frozenExternalData,
      isClearSpecifiedAttr: this.isClearSpecifiedAttr,
      isClearEchoFailedDefaultValue: true,
      isCustomValue: true,
      showStatusIcon: false,
      readonly: this.readonly,
      disabled: this.disabled,
      mode: 'read'
    };
  },
  data() {
    return {
      isReady: false,
      loading: false,
      filterComponentList: ['formtableselector', 'formtableinputer', 'formsubassembly', 'formupload', 'formcube', 'formtable', 'formresoureces', 'formprotocol'], //过滤不参与规则的组件
      tablePageConfig: { //table分页配置
        currentPage: 1,
        pageSize: 5,
        rowNum: 0,
        pageSizeOpts: [5, 10, 15, 20, 50, 100],
        defaultShowSize: 5
      },
      theadList: [],
      tbodyList: [],
      validateMap: {},
      reactionValuesMap: {}, // { extraUuid: { uuid: value } }
      clonedExtrasMap: {},
      isSelectAllCurrentPage: false,
      selectedCurrentPageMap: {}
    };
  },
  beforeCreate() {},
  created() {
    if (this.mode !== 'edit') {
      this.init();
    }
    this.reactionWatch();
  },
  beforeMount() {},
  mounted() {
    this.$nextTick(() => {
      //避免初始化数据，联动过滤清空表格内数据
      this.isReady = true;
    });
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    handleSelectedRow(value, row) {
      this.$set(selectedCurrentPageMap, row.uuid, val);
    },
    selectAllCurrentPage(selectedAll) {
      if (selectedAll) {
        this.pagedTbodyList.forEach((row) => {
          this.selectedCurrentPageMap[row.uuid] = true;
        });
      } else {
        this.selectedCurrentPageMap = {};
      }
    },
    reactionWatch() {
      this.reactionValuesMap = {};
      this.extraList.forEach(extra => {
        const deps = this.reactionDepsMap[extra.uuid] || [];
        this.$set(this.reactionValuesMap, extra.uuid, {});
        this.$set(this.clonedExtrasMap, extra.uuid, this.$utils.deepClone(extra));
        deps.forEach(uuid => {
          this.$set(this.reactionValuesMap[extra.uuid], uuid, this.formData[uuid]);
          this.$watch(
            () => this.formData[uuid],
            (newVal, oldVal) => {
              if (newVal !== oldVal) {
                this.$set(this.reactionValuesMap[extra.uuid], uuid, newVal);
              }
            }
          );
        });
      });
    },
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
          this.tbodyList.push(...value);
        }
      } else if (this.config.lineNumber) {
        //默认展示行
        for (let i = 0; i < this.config.lineNumber; i++) {
          this.addData();
        }
      }
    },
    deleteItem(row) {
      const findIndex = this.tbodyList.findIndex(d => d.uuid === row.uuid);
      this.tbodyList.splice(findIndex, 1);
      if (!this.pagedTbodyList.length && this.tablePageConfig.currentPage > 1) {
        this.tablePageConfig.currentPage -= 1;
      }
    },
    addRow(index) {
      const data = { uuid: this.$utils.setUuid() };
      this.config.dataConfig.forEach(d => {
        data[d.uuid] = (d.config && d.config.defaultValue) || null;
      });
      this.tbodyList.splice(index + 1, 0, data);
    },
    removeSelectedItem() {
      for (let i = this.tbodyList.length - 1; i >= 0; i--) {
        const row = this.tbodyList[i];
        if (this.selectedCurrentPageMap[row.uuid]) {
          this.tbodyList.splice(i, 1);
          this.$delete(this.selectedCurrentPageMap, row.uuid);
        }
      }
      if (!this.pagedTbodyList.length && this.tablePageConfig.currentPage > 1) {
        this.tablePageConfig.currentPage -= 1;
      }
      if (this.isSelectAllCurrentPage) {
        this.isSelectAllCurrentPage = false;
      }
    },
    addData() {
      const data = { uuid: this.$utils.setUuid() };
      this.config.dataConfig.forEach(d => {
        data[d.uuid] = (d.config && d.config.defaultValue) || null;
      });
      this.tbodyList.unshift(data);
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
      //当前页校验样式
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
                await formitem.validData();
              }
            }
          }
        }
      }
      return [...this.validTbodyList(), ...this.validAttrUnique()];
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
          this.tbodyList.forEach((row, index) => {
            const pageCount = Math.ceil((index + 1) / this.tablePageConfig.pageSize);
            if (!this.$utils.isEmpty(row)) {
              Object.keys(row).forEach(key => {
                const findUnunique = uniqueRuleList.find(d => d.uuid === key);
                let value = row[key];
                if (!this.$utils.isEmpty(value)) {
                  if (Array.isArray(value)) {
                    value = this.$utils.mapArray(value, 'text').join('_');
                  } else if (typeof value === 'object') {
                    value = value['text'];
                  }
                  if (findUnunique) {
                    if (existMap[key] && existMap[key].includes(value)) {
                      let findItem = errorList.find(d => d.attrUuid === key);
                      if (findItem && !findItem.errorPageList.find(d => d === pageCount)) {
                        findItem.errorPageList.push(pageCount);
                        findItem.errorPageList = findItem.errorPageList.sort(this.$utils.sortNumber());
                        findItem.error = `${this.formItem.label}：第${findItem.errorPageList.join(',')}页【${findUnunique.label}】属性必须唯一`;
                      } else {
                        errorList.push({ uuid: this.formItem.uuid, attrUuid: key, errorPageList: [pageCount], error: `${this.formItem.label}：第${pageCount}页【${findUnunique.label}】属性必须唯一` });
                      }
                    } else {
                      existMap[key] = existMap[key] ? [...existMap[key], value] : [value];
                    }
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
        this.tbodyList.forEach((row, index) => {
          const pageCount = Math.ceil((index + 1) / this.tablePageConfig.pageSize);
          if (!this.$utils.isEmpty(row)) {
            tempValue = '';
            Object.keys(row).forEach((key, index) => {
              if (uniqueRuleConfig.includes(key) && row[key]) {
                tempValue += `${JSON.stringify(row[key])}${index < uniqueRuleConfig.length - 1 ? '_' : ''}`;
              }
            });
            if (tempValue) {
              if (existList.includes(tempValue)) {
                let findItem = errorList.find(d => d.uuid === uniqueRuleConfig[0]);
                if (findItem && !findItem.errorPageList.find(d => d === pageCount)) {
                  findItem.errorPageList.push(pageCount);
                  findItem.errorPageList = findItem.errorPageList.sort(this.$utils.sortNumber());
                  findItem.error = `${this.formItem.label}：第${findItem.errorPageList.join(',')}页【${attrLabel}】属性必须唯一`;
                } else {
                  errorList.push({ uuid: uniqueRuleConfig[0], errorPageList: [pageCount], error: `${this.formItem.label}：第${pageCount}页【${attrLabel}】属性必须唯一` });
                }
              } else {
                existList.push(tempValue);
              }
            }
          }
        });
        return errorList;
      }
    },
    changeRow(rowData) {
      const { value, extraUuid = '', row = {} } = rowData || {};
      if (!this.$utils.isSame(value, row[extraUuid])) {
        if (!row.hasOwnProperty(extraUuid)) {
          this.$set(row, extraUuid, value); // 修复条件赋值不生效问题
        } else {
          row[extraUuid] = value;
        }
      }
    },
    getCurrentRowData(currentRowData) {
      const { reactionData = {}, rowData = {} } = currentRowData || {};
      this.$nextTick(() => {
        if (reactionData) {
          Object.assign(rowData, reactionData);
        }
      });
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
    validTbodyList() { //验证表格数据
      let errorList = [];
      if (!this.readonly && !this.disabled && !this.$utils.isEmpty(this.tbodyList)) {
        this.tbodyList.forEach((row, index) => {
          const pageCount = Math.ceil((index + 1) / this.tablePageConfig.pageSize);
          const data = Object.assign({}, this.formData || {}, row);
          this.theadList.forEach(th => {
            errorList = this.getErrorList(row, data, pageCount, th, errorList);
          });
          //内嵌table
          Object.keys(row).forEach(key => {
            const findThead = this.theadList.find(th => th.key === key);
            if (findThead && findThead.config && !this.$utils.isEmpty(findThead.config.dataConfig)) {
              if (!this.$utils.isEmpty(row[key])) {
                for (let i = 0; i < row[key].length; i++) {
                  let item = row[key][i];
                  findThead.config.dataConfig.forEach(dc => {
                    const dValue = Object.assign({}, data, item);
                    const dcItem = {
                      key: dc.uuid,
                      title: dc.label,
                      reaction: dc.reaction
                    };
                    errorList = this.getErrorList(item, dValue, pageCount, dcItem, errorList);
                  });
                }
              }
            }
          });
        });
      }
      return errorList;
    },
    getErrorList(row, data, pageCount, th, defaultErrorList) { //获取校验错误列表
      const key = th.key;
      const reactionValid = this.validReaction(th.reaction, data);
      let isValid = true;
      let errorList = defaultErrorList || [];
      if (!reactionValid.isDisable && this.validateMap && this.validateMap[key]) {
        const validateList = this.validateMap[key].validateList;
        if (!this.$utils.isEmpty(validateList)) {
          isValid = this.$utils.validParamValue(row[key], validateList);
        }
      }
      if (!isValid || (this.$utils.isEmpty(row[th.key]) && reactionValid.isRequired)) {
        let findItem = errorList.find(d => d.attrUuid === th.key);
        if (!findItem) {
          errorList.push({
            errorPageList: [pageCount],
            label: th.title,
            uuid: this.formItem.key,
            attrUuid: th.key,
            error: this.formItem.label + '：第' + pageCount + '页' + this.$t('message.completerequired', {'target': '【' + th.title + '】'})
          });
        } else {
          if (!findItem.errorPageList.find(d => d === pageCount)) {
            findItem.errorPageList.push(pageCount);
            findItem.errorPageList = findItem.errorPageList.sort(this.$utils.sortNumber());
            findItem.error = this.formItem.label + '：第' + findItem.errorPageList.join(',') + '页' + this.$t('message.completerequired', {'target': '【' + th.title + '】'});
          }
        }
      }
      return errorList;
    },
    isValidRegex(regexString) { //判断正则表达式是否合法
      try {
        new RegExp(regexString); 
        return true; 
      } catch (error) {
        return false; 
      }
    },
    validReaction(reaction, formData) { //联动规则必填校验
      let reactionMap = {
        mask: false,
        hide: false,
        readonly: false,
        disable: false
      };
      let isRequired = false;
      let isDisable = false;
      if (!this.$utils.isEmpty(reaction)) {
        for (let key in reaction) {
          const reactionObj = reaction[key];
          if (!this.$utils.isEmpty(reactionObj)) {
            const result = this.executeReaction(reactionObj, formData, {}, reaction);
            if (reactionMap.hasOwnProperty(key)) {
              reactionMap[key] = result;
            }
            if (key === 'required') {
              isRequired = result;
            }
          }
        }
        // 当 mask、hide、readonly、disable 中任意一个为 true 时，设置 isDisable 为 true，isRequired 为 false
        for (let key in reactionMap) {
          if (reactionMap[key]) {
            isDisable = true;
            break;
          }
        }
      }
      // 当 isDisable 为 true 时，不用校验必填，设置 isRequired 为 false,
      if (isDisable) {
        isRequired = false;
      }
      return {
        isDisable: isDisable,
        isRequired: isRequired
      };
    },
    getValidateList(d) { //获取组件的基础校验规则
      let validateList = [];
      if (d.config.isRequired) {
        validateList.push('required');
      }
      if (!this.readonly && !this.disabled) {
        if (!this.$utils.isEmpty(d.config.validate)) {
          validateList.push(d.config.validate);
        }
        if (!this.$utils.isEmpty(d.config.regex) && this.isValidRegex(d.config.regex)) {
          let findRegex = validateList.find(item => item && item.name === 'regex');
          if (findRegex) {
            this.$set(findRegex, 'pattern', d.config.regex);
            this.$set(findRegex, 'message', d.config.regexMessage);
          } else {
            validateList.push({
              name: 'regex', 
              pattern: d.config.regex,
              message: d.config.regexMessage
            });
          }
        }
        if (!this.$utils.isEmpty(validateList)) {
          this.validateMap[d.uuid] = {
            label: d.label,
            validateList: validateList
          };
        }
      }
    }
  },
  filter: {},
  computed: {
    config() {
      return this.formItem?.config || {};
    },
    getReactionData() {
      return (extra, row) => {
        if (!extra || !row) return {};
        const deps = this.reactionDepsMap[extra.uuid] || [];
        if (!deps.length) return {};
        const result = {};
        deps.forEach(uuid => {
          result[uuid] = this.formData.hasOwnProperty(uuid)
            ? this.formData[uuid]
            : row[uuid];
        });
        return result;
      };
    },
    getExpressionData() {
      return (extra) => {
        const { handler, config = {} } = extra || {};
        const { expression } = config || {};
        let resultData = {};
        if (handler === 'formexpression') {
          resultData = this.handleExpressionData({expression: expression, formData: this.formData});
        }
        return resultData;
      };
    },
    frozenFormItemList() {
      return Object.freeze([...this.formItemList || []]); // 解构不影响原数据
    },
    frozenExtraFormItemList() {
      return Object.freeze([...this.dataConfigList || []]);
    },
    frozenExtendConfigList() {
      return Object.freeze([...this.extendConfigList || []]);
    },
    frozenExternalData() {
      return Object.freeze({ ...this.externalData || {} });
    },
    isShowDeleteBtn() {
      if (this.isSelectAllCurrentPage) {
        return true;
      } else if (!this.$utils.isEmpty(this.selectedCurrentPageMap)) {
        const selectedList = Object.values(this.selectedCurrentPageMap);
        return selectedList.every(item => item);
      }
      return false;
    },
    reactionDepsMap() {
      let map = {};
      this.extraList.forEach(extra => {
        if (extra?.uuid) {
          map[extra.uuid] = [];
        }
        const reactionValue = extra.reaction || {};
        for (const action in reactionValue) {
          const reaction = reactionValue[action];
          if (this.$utils.isEmpty(reaction)) continue;
          if (action !== 'filter') {
            let ruleList = [];
            if (Array.isArray(reaction)) {
              ruleList = reaction;
            } else {
              ruleList.push(reaction);
            }
            ruleList.forEach(item => {
              (item.conditionGroupList || []).forEach(group => {
                (group.conditionList || []).forEach(cond => {
                  const uuid = (cond.formItemUuid || '').split('#')[0];
                  if (uuid) {
                    map[extra.uuid].push(uuid);
                  }
                });
              });
            });
          } else {
            (reaction.ruleList || []).forEach(rule => {
              const uuid = (rule.formItemUuid || '').split('#')[0];
              if (uuid) {
                map[extra.uuid].push(uuid);
              }
            });
          }
        }
        const {dataConfig = []} = extra.config || {};
        if (dataConfig.length > 0) {
          dataConfig.forEach(d => {
            const innerReactionValue = d.reaction || {};
            for (const action in innerReactionValue) {
              const reactionRule = innerReactionValue[action];
              if (!reactionRule) continue;
              if (action !== 'filter') {
                let ruleList = [];
                if (Array.isArray(reactionRule)) {
                  ruleList = reactionRule;
                } else {
                  ruleList.push(reactionRule);
                }
                ruleList.forEach(item => {
                  (item.conditionGroupList || []).forEach(group => {
                    (group.conditionList || []).forEach(cond => {
                      const uuid = (cond.formItemUuid || '').split('#')[0];
                      if (uuid) {
                        map[extra.uuid].push(uuid);
                      }
                    });
                  });
                });
              } else {
                (reactionRule.ruleList || []).forEach(rule => {
                  const uuid = (rule.formItemUuid || '').split('#')[0];
                  if (uuid) {
                    map[extra.uuid].push(uuid);
                  }
                });
              }
            }
          });
        }
      });
      return map;
    },
    hasDelete() {
      return this.theadList.find(d => d.key === 'delete');
    },
    hasDragColumn() {
      return this.theadList.find(d => d.key === 'drag');
    },
    hasColumn() {
      if (this.mode != 'edit' && this.mode != 'editSubform' && this.config.dataConfig && this.config.dataConfig.length > 0) {
        return true;
      }
      return false;
    },
    extraList() {
      const list = this.$utils.deepClone(this.config.dataConfig.filter(d => d.isPC));
      return Object.freeze(list); // 浅冻结
    },
    dataConfigList() {
      // 表头配置列：PC端隐藏列需存配置，供过滤使用
      const list = this.$utils.deepClone(this.config.dataConfig);
      return Object.freeze(list);
    },
    canAdd() {
      return !this.config.hasOwnProperty('isCanAdd') || this.config.isCanAdd;
    },
    canShowImportExportBtn() {
      return !this.config.hasOwnProperty('isShowImportExportBtn') || this.config.isShowImportExportBtn;
    },
    showTable() {
      const { hideHeaderWhenDataEmpty = false } = this.config || {};
      const tbodyList = this.tbodyList || [];
      return hideHeaderWhenDataEmpty ? tbodyList.length > 0 : true;
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
    'config.dataConfig': {
      handler: function(val) {
        this.theadList = [];
        this.validateMap = {};
        if (!this.disabled && !this.readonly) {
          if (this.config.isCanDrag) {
            this.theadList.push({ key: 'drag', title: '拖拽行' });
          }
          if (!this.config.hasOwnProperty('isCanAdd') || this.config.isCanAdd) {
            this.theadList.push({ key: 'delete', title: '操作' });
            this.theadList.push({ key: 'selection' });
          }
        }
        if (this.config.isShowNumber) {
          this.theadList.push({ key: 'number', title: this.$t('page.ordernumber') });
        }
        this.config.dataConfig.forEach(d => {
          if (d.isPC) {
            let item = {
              key: d.uuid,
              title: d.label,
              reaction: d.reaction,
              config: d.config || {},
              enName: d.key
            };
            if (d.config) {
              if (d.config.isRequired) {
                this.$set(item, 'isRequired', true);
              }
              this.getValidateList(d);
              if (!this.$utils.isEmpty(d.config.dataConfig)) {
                d.config.dataConfig.forEach(c => {
                  if (c.config) {
                    this.getValidateList(c);
                  }
                });
              }
            }
            this.theadList.push(item);
          }
        });
        this.$emit('resize');
      },
      deep: true,
      immediate: true
    },
    tbodyList: {
      handler: function(val) {
        this.setValue(val);
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
.form-item-width {
  min-width: 130px;
}
::v-deep .tstable-container, .table-container {
  overflow-x: scroll;
  width: 100%;
}
</style>
