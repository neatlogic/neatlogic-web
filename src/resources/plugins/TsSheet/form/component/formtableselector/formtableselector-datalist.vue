<template>
  <div class="table-datalist">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <template v-if="!disabled && matrixData.searchColumnDetailList && matrixData.searchColumnDetailList.length > 0">
      <CommonSearch
        :searchColumnDetailList="matrixData.searchColumnDetailList"
        :filter="filter"
        :searchConditionValueList="searchConditionValueList"
        :config="formItem.config"
        @changeConditionValue="changeConditionValue"
      ></CommonSearch>
      <!-- <div
        :is="formItem.config.matrixType === 'cmdbci'?'CmdbciSearch':'CommonSearch'"
        :searchColumnDetailList="matrixData.searchColumnDetailList"
        :filter="filter"
        :searchConditionValueList="searchConditionValueList"
        :config="formItem.config"
        @changeConditionValue="changeConditionValue"
      ></div> -->
    </template>
    <TsTable
      v-model="selectedIndexList"
      v-bind="matrixData"
      :theadList="theadList"
      :multiple="true"
      :fixedHeader="false"
      keyName="uuid"
      selectedRemain
      :disabled="disabled"
      @getSelected="getSelectedItem"
      @changeCurrent="searchMatrixData"
      @changePageSize="changePageSize"
      @operation="operation"
    >
      <template
        v-for="(extra) in extraList"
        :slot="extra.uuid"
        slot-scope="{ row }"
      >
        <div :key="extra.uuid" class="table-item" @click.stop>
          <FormItem
            :ref="'formitem_' + row._selected + '_' + row.uuid"
            :formItem="getExtraFormItem(extra,row)"
            :disabled="!row._selected || disabled"
            :value="row[extra.uuid]"
            :formData="row"
            :showStatusIcon="false"
            mode="read"
            :readonly="readonly"
            isCustomValue
            @change="changeRow(row)"
          ></FormItem>
        </div>
      </template>
    </TsTable>
  </div>
</template>
<script>
import base from '../base.vue';
import search from './search/index.js';
import validmixin from '../common/validate-mixin.js';
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    FormItem: resolve => require(['@/resources/plugins/TsSheet/form-item.vue'], resolve),
    ...search
  },
  extends: base,
  mixins: [validmixin],
  props: {
    disabled: {type: Boolean},
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      searchParam: {columnList: [], currentPage: 1 },
      matrixData: {},
      rowFormItem: {}, //保存每行的定义数据，避免每次都deepClone新数据，导致reaction失效
      selectedIndexList: [],
      selectedItemList: [],
      loadingShow: true,
      searchConditionValueList: [], //搜索条件的值列表
      searchConditionConfig: {} 
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
      this.selectedIndexList = [];
      this.selectedItemList = [];
      if (!this.$utils.isEmpty(this.value)) {
        this.value.forEach(item => {
          this.selectedIndexList.push(item.uuid);
        });
        this.selectedItemList = this.$utils.deepClone(this.value);
      }
    },
    searchMatrixData(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      if (this.filter) {
        this.searchParam.filterList = this.filter.map(f => {
          return {
            uuid: f.uuid,
            valueList: f.valueList
          };
        });
      } else {
        this.searchParam.filterList = [];
      }
      this.searchParam.columnList = [];
      this.searchParam.searchColumnList = [];
      this.config.dataConfig.filter(d => !d.isExtra).forEach(d => {
        d.isPC && this.searchParam.columnList.push(d.uuid);
        d.isSearch && this.searchParam.searchColumnList.push(d.uuid);
      });
      if (!this.searchParam.columnList.length) {
        this.loadingShow = false;
        return;
      }
      if (this.config.sourceColumnList && this.config.sourceColumnList.length > 0) {
        this.config.sourceColumnList.forEach(sourceColumn => {
          if (sourceColumn.valueList && sourceColumn.column && sourceColumn.expression) {
            this.searchParam.filterList.push({
              uuid: sourceColumn.column,
              expression: sourceColumn.expression,
              valueList: sourceColumn.valueList
            });
          }
        });
      }
      this.loadingShow = true;
      if (this.searchConditionConfig && this.searchConditionConfig.sourceColumnList) {
        this.searchParam.filterList.push(...this.searchConditionConfig.sourceColumnList);
      }
      this.$api.framework.matrix.getNewMatrixDataForTable(this.searchParam).then(res => {
        //编辑模式下只显示表头
        if (this.mode === 'read') {
          this.matrixData = res.Return;
          this.matrixData.tbodyList && 
          this.matrixData.tbodyList.forEach(d => {
          //矩阵回来的数据包含了text,type,value三个属性，表格显示时只需要text属性
            for (let k in d) {
              d[k] = d[k].text;
            }
            if (this.value && this.value.length > 0) {
              const valueitem = this.value.find(valuedata => valuedata.uuid === d.uuid);
              if (valueitem) {
                d['_selected'] = true;
                for (let key in valueitem) {
                  const column = this.config.dataConfig.find(c => c.uuid === key);
                  if (column && column.isExtra && column.isPC) {
                    d[key] = valueitem[key];
                  }
                }
              }
            }
          });
          if (!this.$utils.isEmpty(this.matrixData.searchColumnDetailList)) {
            this.matrixData.searchColumnDetailList.forEach(item => {
              if (!this.searchConditionValueList.find(s => s.uuid === item.uuid)) {
                let isFilter = !!this.filter.find(f => f.uuid === item.uuid);
                this.searchConditionValueList.push({
                  uuid: item.uuid,
                  expression: '',
                  valueList: null,
                  isFilter: isFilter
                });
              }
            });
          }
        }
      }).finally(() => {
        if (this.mode === 'edit') {
          this.$emit('resize');
        }
        this.loadingShow = false;
      });
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchMatrixData(1);
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
    getSelectedItem(idList, itemList) {
      this.selectedItemList.push(...itemList);
      if (this.selectedItemList && this.selectedItemList.length) {
        this.selectedItemList = this.$utils.uniqueByField(this.selectedItemList, 'uuid');
      }
      let selectedArr = this.selectedItemList.filter(val => {
        return idList.includes(val.uuid);
      });
      this.selectedItemList = selectedArr || [];
      this.$emit('change', this.selectedItemList);
    },
    operation(row, type) {
      if (type && row[type]) { //超链接跳转
        window.open(row[type], '_blank');
      }
    },
    changeConditionValue(config) {
      this.searchConditionConfig = config;
      this.searchMatrixData(1);
    },
    async validData() {
      const errorList = [];
      if (this.$refs) {
        for (let name in this.$refs) {
          if (name.indexOf('formitem_true') > -1 && this.$refs[name]) {
            let formitem = null;
            if (this.$refs[name] instanceof Array) {
              formitem = this.$refs[name][0];
            } else {
              formitem = this.$refs[name];
            }
            if (formitem && formitem.validData) {
              const err = await formitem.validData();
              if (err && err.length > 0) {
                errorList.push(...err);
              }
            }
          }
        }
      }
      return errorList;
    },
    changeRow(row) {
      let index = this.selectedItemList.findIndex(s => s.uuid === row.uuid);
      if (index > -1) {
        this.$set(this.selectedItemList, index, row);
      }
      this.$emit('change', this.selectedItemList);
    }
  },
  filter: {},
  computed: {
    theadList() {
      let theadList = [];
      if (!this.disabled && !this.readonly) {
        theadList.push({ key: 'selection' });
      }
      if (this.config && !this.$utils.isEmpty(this.config.dataConfig)) {
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
      return theadList;
    },
    extraList() {
      return this.config.dataConfig.filter(d => d.isExtra && d.isPC);
    }
  },
  watch: {
    filter: {
      handler: function(val) {
        this.searchMatrixData(1);
      },
      deep: true
    },
    config: {
      handler: function(val) {
        if (!this.formItem.isEditing) {
          let needReload = false;
          if (this.config && this.config.matrixUuid && this.config.matrixUuid != this.searchParam.matrixUuid) {
            this.searchParam.matrixUuid = this.config.matrixUuid;
            needReload = true;
          } 
          if (needReload) {
            if (!this.searchParam.pageSize) {
              this.searchParam.pageSize = this.config.pageSize || 20;
            } 
            this.searchMatrixData(1);
          }
        }
      },
      deep: true,
      immediate: true
    }
    // 'matrixData.tbodyList': {
    //   handler: function(val) {
    //     if (val && val.length > 0) {
    //       const selectedList = val.filter(d => d['_selected']);
    //       this.$emit('change', selectedList);
    //     } else {
    //       this.$emit('change', []);
    //     }
    //   },
    //   deep: true
    // }

  }
};
</script>
<style lang="less" scope>
.table-datalist {
   position: relative;
}
.table-item {
  min-width: 60px;
}
</style>
