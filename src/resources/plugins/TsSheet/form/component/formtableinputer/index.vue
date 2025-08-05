<template>
  <div v-if="isReady">
    <div v-if="!disabled && !readonly" class="mb-sm action-group">
      <div v-if="canAdd" class="action-item">
        <Button @click="addData()">{{ $t('dialog.title.addtarget', { target: $t('page.data') }) }}</Button>
      </div>
      <div v-if="selectedIndexList && selectedIndexList.length > 0 && !$utils.isEmpty(tbodyList)" class="action-item">
        <Button @click="removeSelectedItem">{{ $t('dialog.title.deletetarget', { target: $t('page.data') }) }}</Button>
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
          @click.stop="() => exportExcelData({
            extraList: extraList,
            formItem: formItem,
            tbodyList: tbodyList,
            selectedIndexList: selectedIndexList,
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
          :before-upload="
            file =>
              handleBeforeUpload({
                file: file,
                extraList: extraList,
                tbodyList: tbodyList
              })
          "
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
      <TsTable
        v-if="hasColumn"
        :theadList="theadList"
        :tbodyList="pagedTbodyList"
        v-bind="tablePageConfig"
        :loading="loading"
        :multiple="true"
        :fixedHeader="false"
        :canDrag="!disabled && !readonly && config.isCanDrag"
        :readonlyTextIsHighlight="readonlyTextIsHighlight"
        @updateRowSort="updateRowSort"
        @getSelected="getSelectedItem"
        @changeCurrent="changeCurrent"
        @changePageSize="changePageSize"
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
              :formItem="$utils.deepClone(extra)"
              :formData="{...formData, ...row}"
              :isSetValue="false"
              :formItemList="formItemList"
              :extraFormItemList="extraList"
              :showStatusIcon="false"
              mode="read"
              :readonly="readonly"
              :disabled="disabled"
              :isClearEchoFailedDefaultValue="true"
              :isCustomValue="true"
              :isClearSpecifiedAttr="isClearSpecifiedAttr"
              :externalData="externalData"
              :rowUuid="row.uuid"
              :extendConfigList="extendConfigList"
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
      <TsTable v-else :theadList="theadList"></TsTable>
    </template>
  </div>
</template>
<script>
import base from '../base.vue';
import validmixin from '../common/validate-mixin.js';
import TsTable from '@/resources/components/TsTable/TsTable.vue'; //不能使用异步引入，会导致tssheet列高错位
import conditionMixin from './condition-mixin.js';
import TableImportExportMixin from './table-import-export-mixin.js';
export default {
  name: '',
  components: {
    TsTable,
    FormItem: () => import('@/resources/plugins/TsSheet/form-item.vue')
  },
  extends: base,
  mixins: [validmixin, conditionMixin, TableImportExportMixin],
  props: {
    readonly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
      isReady: false,
      selectedIndexList: [],
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
      validateMap: {}
    };
  },
  beforeCreate() {},
  created() {
    if (this.mode !== 'edit') {
      this.init();
    }
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
    getSelectedItem(indexList) {
      this.selectedIndexList = indexList;
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
        if (d.isPC) {
          data[d.uuid] = (d.config && d.config.defaultValue) || null;
        }
      });
      this.tbodyList.splice(index + 1, 0, data);
    },
    removeSelectedItem() {
      for (let i = this.tbodyList.length - 1; i >= 0; i--) {
        const item = this.tbodyList[i];
        if (item._selected) {
          this.tbodyList.splice(i, 1);
        }
      }
      if (!this.pagedTbodyList.length && this.tablePageConfig.currentPage > 1) {
        this.tablePageConfig.currentPage -= 1;
      }
    },
    addData() {
      const data = { uuid: this.$utils.setUuid() };
      this.config.dataConfig.forEach(d => {
        if (d.isPC) {
          data[d.uuid] = (d.config && d.config.defaultValue) || null;
        }
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
                if (findUnunique && row[key]) {
                  if (existMap[key] && existMap[key].includes(row[key])) {
                    let findItem = errorList.find(d => d.attrUuid === key);
                    if (findItem && !findItem.errorPageList.find(d => d === pageCount)) {
                      findItem.errorPageList.push(pageCount);
                      findItem.errorPageList = findItem.errorPageList.sort(this.$utils.sortNumber());
                      findItem.error = `${this.formItem.label}：第${findItem.errorPageList.join(',')}页【${findUnunique.label}】属性必须唯一`;
                    } else {
                      errorList.push({ uuid: this.formItem.uuid, attrUuid: key, errorPageList: [pageCount], error: `${this.formItem.label}：第${pageCount}页【${findUnunique.label}】属性必须唯一` });
                    }
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
    changeRow(val, uuid, row) {
      if (!this.$utils.isSame(val, row[uuid])) {
        this.$set(row, uuid, val);
      }
    },
    updateRowSort(event) {
      let beforeVal = this.tbodyList.splice(event.oldIndex, 1)[0];
      this.tbodyList.splice(event.newIndex, 0, beforeVal);
    },
    updateCurrentRow(row, val) {
      this.$nextTick(() => {
        if (val) {
          Object.assign(row, val);
        }
      });
    },
    changeCurrent(currentPage) {
      this.tablePageConfig.currentPage = currentPage;
      this.$nextTick(() => {
        if (!this.readonly && !this.disabled) {
          this.validData();
        }
      });
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
      if (this.validateMap && this.validateMap[key]) {
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
            isRequired = false;
            break;
          }
        }
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
    hasColumn() {
      if (this.mode != 'edit' && this.mode != 'editSubform' && this.config.dataConfig && this.config.dataConfig.length > 0) {
        return true;
      }
      return false;
    },
    extraList() {
      return this.config.dataConfig.filter(d => d.isPC);
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
    pagedTbodyList() {
      this.tablePageConfig.rowNum = this.tbodyList.length;
      const start = (this.tablePageConfig.currentPage - 1) * this.tablePageConfig.pageSize;
      const end = start + this.tablePageConfig.pageSize;
      if (this.tbodyList.length <= start) {
        return [];
      }
      return this.tbodyList.slice(start, end);
    }
  },
  watch: {
    'config.dataConfig': {
      handler: function(val) {
        this.theadList = [];
        this.validateMap = {};
        if (!this.disabled && !this.readonly) {
          if (!this.config.hasOwnProperty('isCanAdd') || this.config.isCanAdd) {
            this.theadList.push({ key: 'delete', width: 20 });
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
</style>
