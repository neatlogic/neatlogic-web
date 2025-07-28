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
            tbodyList: tableData.tbodyList,
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
                tbodyList: tableData.tbodyList
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
              :formItem="$utils.deepClone(extra)"
              :formData="{ ...filterUuid(formData), ...row }"
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
      <TsTable v-else :theadList="tableData.theadList"></TsTable>
    </template>
  </div>
</template>
<script>
import base from '../base.vue';
import validmixin from '../common/validate-mixin.js';
import TsTable from '@/resources/components/TsTable/TsTable.vue'; //不能使用异步引入，会导致tssheet列高错位
import TableImportExportMixin from './table-import-export-mixin.js';
export default {
  name: '',
  components: {
    TsTable,
    FormItem: () => import('@/resources/plugins/TsSheet/form-item.vue')
  },
  extends: base,
  mixins: [validmixin, TableImportExportMixin],
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
      loading: false,
      filterComponentList: ['formtableselector', 'formtableinputer', 'formsubassembly', 'formupload', 'formcube', 'formtable', 'formresoureces', 'formprotocol'], //过滤不参与规则的组件
      initExternalData: {} //用于对比外部组件值变换
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
      if (!this.$utils.isSame(val, row[uuid])) {
        this.$set(row, uuid, val);
      }
    },
    updateRowSort(event) {
      let beforeVal = this.tableData.tbodyList.splice(event.oldIndex, 1)[0];
      this.tableData.tbodyList.splice(event.newIndex, 0, beforeVal);
    },
    updateCurrentRow(row, val) {
      this.$nextTick(() => {
        if (val) {
          Object.assign(row, val);
        }
      });
    },
    filterUuid(obj) {
      let formData = this.$utils.deepClone(obj);
      if (formData.uuid) {
        delete formData.uuid;
      }
      if (formData.hasOwnProperty(this.formItem.uuid)) {
        delete formData[this.formItem.uuid];
      }
      return formData;
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
              title: d.label,
              enName: d.key
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
