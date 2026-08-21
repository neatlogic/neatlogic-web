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
        <div :key="extra.uuid" @click.stop>
          <FormItem
            :ref="'formitem_' + row._selected + '_' + row.uuid"
            :formItem="getExtraFormItem(extra,row)"
            :formItemList="mergedFormItemList"
            :disabled="!row._selected || disabled"
            :value="row[extra.uuid]"
            :formData="{...$utils.deepClone(formData || {}), ...row}"
            :formDataForWatch="{...$utils.deepClone(formDataForWatch || {}),...(row || {})}"
            :showStatusIcon="false"
            mode="read"
            :readonly="readonly"
            :externalData="externalData"
            :extendConfigList="extendConfigList"
            :rowUuid="row.uuid"
            isCustomValue
            :isClearSpecifiedAttr="isClearSpecifiedAttr"
            @change="(val)=>{changeRow(row, extra.uuid, val)}"
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
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    FormItem: () => import('@/resources/plugins/TsSheet/form-item.vue'),
    ...search
  },
  extends: base,
  mixins: [validmixin],
  props: {
    disabled: {type: Boolean},
    readonly: {
      type: Boolean,
      default: false
    },
    isClearSpecifiedAttr: {//工单权限用户编辑表单时，需要清除表单设置的只读，禁用，隐藏等规则属性
      type: Boolean,
      default: false
    },
    formItemList: {type: Array},
    formData: {type: Object}
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
      searchConditionConfig: {},
      matrixAttrUuidMap: {}, //矩阵属性uuid与uuid的映射，用于获取矩阵属性
      matrixRequestId: 0, //矩阵请求序号，确保只有最后一次请求可以更新数据
      matrixAbortController: null //用于取消上一次尚未完成的矩阵请求
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
  beforeDestroy() {
    //组件销毁后使当前请求失效，避免异步响应继续更新已销毁组件的数据
    this.matrixRequestId += 1;
    if (this.matrixAbortController) {
      //释放尚未完成的请求，避免组件销毁后继续占用网络资源
      this.matrixAbortController.abort();
      this.matrixAbortController = null;
    }
  },
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
      //每次查询生成递增序号；即使旧请求未能及时取消，也只有最新序号可以更新页面
      const requestId = ++this.matrixRequestId;
      if (this.matrixAbortController) {
        //新查询开始时取消上一次尚未完成的查询，连续快速触发时始终保留最后一次
        this.matrixAbortController.abort();
        this.matrixAbortController = null;
      }
      //编辑模式
      if (this.mode.includes('edit')) {
        this.loadingShow = false;
        this.$emit('resize');
        return;
      }
      if (this.config.dataConfig) {
        this.config.dataConfig.forEach(d => {
          if (!d.isExtra && !this.matrixAttrUuidMap.hasOwnProperty(d.uuid)) {
          //uuid与矩阵属性uuid的映射，用于获取矩阵属性
            this.$set(this.matrixAttrUuidMap, d.uuid, d.matrixAttrUuid || d.uuid);
          } 
        });
      }
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
        this.matrixAttrUuidMap[d.uuid] && this.searchParam.columnList.push(this.matrixAttrUuidMap[d.uuid]);
        d.isSearch && this.searchParam.searchColumnList.push(this.matrixAttrUuidMap[d.uuid]);
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
      //使用独立参数快照，避免后续查询修改同一个searchParam对象
      const searchParam = this.$utils.deepClone(this.searchParam);
      //每次请求使用独立的AbortController，后续查询可通过signal取消当前请求
      const abortController = new AbortController();
      this.matrixAbortController = abortController;
      this.$api.framework.matrix.getNewMatrixDataForTable(searchParam, { signal: abortController.signal }).then(res => {
        //取消请求或过期请求均不处理，防止旧响应覆盖最后一次查询结果
        if (abortController.signal.aborted || requestId !== this.matrixRequestId || !res) {
          return;
        }
        this.matrixData = res.Return;
        if (!this.$utils.isEmpty(this.matrixData.tbodyList)) {
          let tbodyList = [];
          this.matrixData.tbodyList.forEach(d => {
            let td = {};
            //矩阵回来的数据包含了text,type,value三个属性，表格显示时只需要text属性
            for (let k in d) {
              d[k] = d[k].text;
            }
            if (d.uuid) {
              td.uuid = d.uuid;
            }
            Object.keys(this.matrixAttrUuidMap).forEach(uuid => {
              td[uuid] = d[this.matrixAttrUuidMap[uuid]];
            });
            tbodyList.push(td);
          });
          tbodyList.forEach(d => {
            if (!this.$utils.isEmpty(this.config.dataConfig.length)) {
              this.config.dataConfig.forEach(column => {
                if (column.isExtra) {
                  this.$set(d, column.uuid, null);
                }
              });
            }
            if (this.value && this.value.length > 0) {
              const valueitem = this.value.find(valuedata => valuedata.uuid === d.uuid);
              if (valueitem) {
                d['_selected'] = true;
                for (let key in valueitem) {
                  const column = this.config.dataConfig.find(c => c.uuid === key);
                  if (column && column.isExtra) {
                    this.$set(d, key, valueitem[key]);
                  }
                }
              }
            }
            //disableDeleteData 已选择的数据禁止删除
            if (d['_selected'] && this.config.disableDeleteData) {
              d['isDisabled'] = true;
            }
            //disableAddData 未选的数据禁止选择
            if (!d['_selected'] && this.config.disableAddData) {
              d['isDisabled'] = true;
            }
          });
          this.matrixData.tbodyList = tbodyList;
        }
   
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
      }).catch(error => {
        //主动取消属于正常流程，不作为接口异常继续抛出
        if (abortController.signal.aborted || (error && error.code === 'ERR_CANCELED')) {
          return;
        }
        return Promise.reject(error);
      }).finally(() => {
        //旧请求结束时不能关闭新请求的loading，也不能清理新请求的Controller
        if (requestId === this.matrixRequestId) {
          this.loadingShow = false;
          if (this.matrixAbortController === abortController) {
            this.matrixAbortController = null;
          }
        }
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
            const valueList = Array.isArray(row[sourceColumn.valueColumn]) ? row[sourceColumn.valueColumn] : [row[sourceColumn.valueColumn]];
            this.$set(sourceColumn, 'valueList', valueList);
            sourceColumn.expression = 'equal';
          }
        });
      }
      return {...formItem};
    },
    getSelectedItem(idList, itemList) {
      this.selectedItemList.push(...itemList);
      // 先过滤 selectedItemList 中的元素，只保留在 idList 中的
      const filteredItemList = this.selectedItemList.filter(item => idList.includes(item.uuid));
      // 使用 uniqueByField 去除重复项
      const uniqueFilteredItemList = this.$utils.uniqueByField(filteredItemList, 'uuid');
      // 更新 selectedItemList
      this.selectedItemList = uniqueFilteredItemList;
      // 如果需要，对 selectedItemList 中的元素设置默认值
      this.selectedItemList.forEach(d => {
        this.extraList.forEach(extra => {
          if (this.$utils.isEmpty(d[extra.uuid])) {
            d[extra.uuid] = this.getDefaultValue(extra.uuid, d);
          }
        });
      });
      // 触发 change 事件
      this.$emit('change', this.selectedItemList);
    },
    getDefaultValue(uuid, row) {
      const dataConfig = this.config.dataConfig.find(d => d.uuid === uuid);
      if (dataConfig && dataConfig.config) {
        const { defaultValue, defaultValueType, defaultValueField, defaultTextField } = dataConfig.config;
        if (!this.$utils.isEmpty(defaultValue) && this.$utils.isEmpty(row[uuid])) {
          let defaultValueObj; // 使用新的变量保存默认值

          // 判断defaultValueType
          if (defaultValueType === 'custom') {
            // 自定义默认值
            if (['formselect', 'formradio', 'formcheckbox'].includes(dataConfig.handler)) {
              if (Array.isArray(defaultValue)) {
                defaultValueObj = defaultValue.map(d => ({ text: d, value: d }));
              } else if (typeof defaultValue === 'object') {
                defaultValueObj = defaultValue;
              } else {
                defaultValueObj = { text: defaultValue, value: defaultValue };
              }
            } else {
              defaultValueObj = defaultValue;
            }
          } else if (defaultValueType === 'matrix') {
            // matrix类型的默认值
            if (['formselect', 'formradio', 'formcheckbox'].includes(dataConfig.handler)) {
              // 表单选择类型
              defaultValueObj = {
                text: row[defaultTextField] || '',
                value: row[defaultValueField] || ''
              };
            } else {
              defaultValueObj = row[defaultValue];
            }
          }
          return defaultValueObj;
        }
      }
      // 如果以上条件都不满足，则直接返回row中对应的字段值
      return row[uuid];
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
    changeRow(row, uuid, val) {
      this.$set(row, uuid, val);
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
    },
    mergedFormItemList() {
      const merged = [...this.extraList, ...this.formItemList];
      return this.$utils.deepClone(merged);
    }
  },
  watch: {
    filter: {
      handler: function(val) {
        console.log('----filter-watch', val);
        this.searchMatrixData(1);
      },
      deep: true,
      immediate: true
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
            console.log('config---watch');
            this.searchMatrixData(1);
          }
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.table-datalist {
   position: relative;
}
</style>
