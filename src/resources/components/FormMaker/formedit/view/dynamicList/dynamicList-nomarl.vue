<template>
  <div class="dynamicList-edit" :style="getStyle">
    <!-- 搜索条件显示 -->
    <template v-if="!isReadonly">
      <template v-if="searchItems[setting.config.matrixType + 'Search']">
        <component
          :is="setting.config.matrixType + 'Search'"
          :config="setting.config"
          :searchColumnDetailList="tableData.searchColumnDetailList"
          @changeSearchCondition="changeSearchCondition"
        ></component>
      </template>
      <template v-else>
        <Search
          :config="setting.config"
          :matrixType="setting.config.matrixType"
          :searchColumnDetailList="tableData.searchColumnDetailList"
          :value="sourceColumnList"
          :filterList="filterList"
          :componentList="componentList"
          @changeConditionValue="changeConditionValue"
        ></Search>
      </template>
    </template>
    <small v-if="message" class="text-tip">提示：{{ message }}</small>
    <div v-else style=" text-align: left;">
      <Loading :loadingShow="loadingShow" type="fix"></Loading>
      <div v-if="tableData.tbodyList && tableData.tbodyList.length > 0" class="tstable-container">
        <div style="width:100%;overflow:auto">
          <table class="table-list tstable-body">
            <thead>
              <tr>
                <th style="width:40px;text-align: center;">
                  <Checkbox v-if="!isReadonly" v-model="tableData.isSelectAll" @on-change="selectAll()"></Checkbox>
                </th>
                <th v-for="(th, thIndex) in tableData.theadList" :key="thIndex">
                  <span :class="{ 'require-label': th.isRequired }">{{ th.title }}</span>
                </th>
              </tr>
            </thead>
            <tbody v-if="tableData.theadList.length > 0 && tableData.tbodyList.length > 0">
              <tr
                v-for="(tr, tbIndex) in tableData.tbodyList"
                :key="tbIndex+tr[uuidColumn].value"
                :style="{ cursor: isReadonly ? 'inherit' : 'pointer' }"
                @click="selectIndex(tbIndex, tr[uuidColumn].value, tr)"
              >
                <td style="width:40px">
                  <Checkbox :value="tr._isSelected" :disabled="isReadonly"></Checkbox>
                </td>
                <td v-for="(th, thIndex) in tableData.theadList" :key="thIndex">
                  <CellComponent
                    v-if="th.control"
                    :ref="'formComponent'+tbIndex+thIndex"
                    :setting="getArrtConfig(tr,th)"
                    :isReadonly="isReadonly"
                    @on-updata="updateCellValue(arguments, th.key, tr[uuidColumn].value)"
                  ></CellComponent>
                  <TdComponent
                    v-else
                    :isReadonly="isReadonly"
                    v-bind="getConfig(tr,th.key)"
                    :url="getUrl(th, tr)"
                    @on-updata="updateCellValue(arguments, th.key, tr[uuidColumn].value)"
                  ></TdComponent>
                </td>
              </tr>
            </tbody>
            <!-- 配置表单的简化模式 -->
            <tbody v-else>
              <tr>
                <td :colspan="tableData.theadList.length">
                  暂无数据
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Page
          v-if="setting.config.needPage"
          class="page-container"
          transfer
          size="small"
          show-total
          :total="tableData.rowNum"
          :current="tableData.currentPage"
          :page-size="tableData.pageSize"
          @on-change="searchData(arguments, 'currentPage',true)"
          @on-page-size-change="searchData(arguments, 'pageSize',true)"
        />
      </div>
      <template v-else-if="isReadonly">-</template>
      <template v-else>{{ $t('page.nodata') }}</template>
      <transition name="fade">
        <span v-if="validMesage != ''" class="form-error-tip">{{ validMesage }}</span>
      </transition>
    </div>
    <div v-if="setting.config.desc" class="component-tips tsfont-info-o">{{ setting.config.desc }}</div>
  </div>
</template>
<script>
import viewmixin from '../viewmixin.js';
import TdComponent from './td-component';
import Search from './search';
import filtermixin from './filtermixin';
import searchItems from './search/search.js';
export default {
  name: 'FormdynamicList',
  components: {
    Search,
    TdComponent,
    CellComponent: () => import('./components.vue'),
    ...searchItems
  },
  mixins: [viewmixin, filtermixin],
  props: {
    setting: Object,
    value: [Array, String, Object],
    isReadonly: Boolean,
    formView: {
      //是否通过form-view页面进行初始化，如果不是则需要把defaultValue值给 value
      type: Boolean,
      default: true
    },
    componentList: {
      //同一个表单的所有组件,主要用来做数据引用
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    let _this = this;
    return {
      uuidColumn: _this.setting.config.uuidColumn || 'uuid',
      validMesage: '', //必填校验文案
      loadingShow: false,
      tableData: {
        searchColumnDetailList: [],
        theadList: [],
        tbodyList: [],
        isSelectAll: false,
        selectUuidList: [],
        pageSize: _this.setting.config.pageSize,
        currentPage: 1
      },
      selectUuidList: [],
      sourceColumnList: [], //搜索值
      currentValue: {}, //后台传过来的数据会把值为null undefined的去掉，导致值回显失败
      message: '',
      detailData: {}, //表格详情
      searchItems: searchItems, //根据矩阵类型渲染搜索组件
      cmdbciSearchConfig: null, //cmdbci类型搜索条件
      filterList: [] //联动过滤
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    updateValue() {
      //情况数据
      this.selectUuidList = [];
      this.sourceColumnList = [];
      this.currentValue = {};
      this.detailData = {};
      //赋值
      let data = this.$utils.deepClone(this.value);
      if (data && data.table) { //val存在 保存表格
        this.tableData = data.table;
        this.sourceColumnList = data.sourceColumnList || [];
        this.currentValue = data.extendedData;
        this.matrixType = data.matrixType;
        this.selectUuidList = data.selectUuidList;
        this.detailData = data.detailData || {};
      } else if (data) { //val存在，保存uuid
        this.currentValue = data.extendedData;
        this.selectUuidList = data.selectUuidList || [];
        this.detailData = data.detailData || {};
        this.searchData();
      } else if (!data) { //val不存在通过接口初始化数据
        this.tableData.isSelectAll = false;
        this.selectUuidList = [];
        this.searchData();
      }
    },
    getValue() {
      let objJson = {selectUuidList: this.selectUuidList, extendedData: {}, detailData: {}, matrixType: this.matrixType};
      let extendedData = {};
      let detailData = {};
      if (this.selectUuidList && this.selectUuidList.length > 0) {
        detailData = this.saveDetailData(this.detailData);
        this.selectUuidList.forEach(item => {
          extendedData[item] = this.currentValue[item];
        });
      }
      this.$set(objJson, 'detailData', detailData);
      this.$set(objJson, 'extendedData', extendedData);
      if (!this.setting.config.needPage) { //不需要分页时，拿去整个表格数据
        let _this = this;
        let table = this.$utils.deepClone(_this.tableData);
        if (table.tbodyList && table.tbodyList.length > 0) {
          table.tbodyList.forEach(item => {
            let uuid = item[_this.uuidColumn].value;
            if (detailData[uuid]) {
              Object.keys(detailData[uuid]).forEach(key => {
                if (detailData[uuid][key] && item[key]) {
                  item[key].text = detailData[uuid][key].text || '';
                }
              });
            }
          });
        }
        objJson.table = table;
        objJson.sourceColumnList = this.sourceColumnList;
      }
      return objJson;
    },
    validateValue() {
      let isVaild = true;
      if (this.setting.config.isRequired && !(this.currentValue && Object.keys(this.currentValue).length > 0)) {
        isVaild = false;
        this.validMesage = '数据不能为空';
      }
      if (isVaild) {
        for (let key in this.$refs) {
          let item = this.$refs[key][0];
          item && !item.validateValue() && (isVaild = false);
        }
      }
      return isVaild;
    },
    updateCellValue(arg, tduuid, truuid) {
      this.currentValue = this.currentValue || {};
      if (this.currentValue[truuid]) {
        this.currentValue[truuid][tduuid] = arg[0];
      } else {
        this.currentValue[truuid] = {};
        this.currentValue[truuid][tduuid] = arg[0];
      }
      let findTr = this.tableData.tbodyList.find(item => item[this.uuidColumn].value == truuid);
      if (findTr) {
        this.$set(findTr[tduuid], 'value', arg[0]);
      }
    },
    changeConditionValue(val) {
      this.sourceColumnList = val;
      this.searchData([1], 'currentPage', true);
    },
    //选中一个
    selectIndex(index, uuid, tr) {
      if (this.isReadonly) {
        return;
      }
      let isSelect = (this.tableData.tbodyList[index]._isSelected = !this.tableData.tbodyList[index]._isSelected);
      let _this = this;
      let i = this.selectUuidList.indexOf(uuid);
      i < 0 && isSelect && this.selectUuidList.push(uuid) && (this.detailData[uuid] = tr);
      i >= 0 && !isSelect && this.selectUuidList.splice(i, 1) && this.$delete(this.detailData, uuid);
      let selectNum = 0;
      this.tableData.tbodyList &&
        this.tableData.tbodyList.forEach(item => {
          let value = item[_this.uuidColumn].value;
          if (_this.selectUuidList.indexOf(value) >= 0) {
            _this.$set(item, '_isSelected', true) && selectNum++;
          } else {
            _this.$set(item, '_isSelected', false);
            this.currentValue && this.currentValue[uuid] && this.$delete(this.currentValue, uuid);
          }
        });
      selectNum == this.tableData.tbodyList.length ? (this.tableData.isSelectAll = true) : (this.tableData.isSelectAll = false);
      //扩展
      this.tableData.theadList.forEach(th => {
        if (th.control) {
          if (isSelect) {
            this.tableData.tbodyList[index][th.key].disabled = false;
            if (_this.currentValue[uuid]) {
              _this.currentValue[uuid][th.key] = th.config.defaultValue;
            } else {
              _this.currentValue[uuid] = {};
              _this.currentValue[uuid][th.key] = th.config.defaultValue;
            }
          } else {
            this.tableData.tbodyList[index][th.key].disabled = true;
            this.tableData.tbodyList[index][th.key].value = th.config.defaultValue;
          }
        }
      });
      //二次编辑数据
      this.getDataConfig(uuid, tr);
    },
    //选中所有的数据
    selectAll() {
      let _this = this;
      this.tableData.tbodyList &&
        this.tableData.tbodyList.forEach((item, index) => {
          _this.$set(item, '_isSelected', this.tableData.isSelectAll);
          let uuid = this.tableData.tbodyList[index][_this.uuidColumn].value;
          let isSelect = this.tableData.tbodyList[index]._isSelected;
          let i = this.selectUuidList.indexOf(uuid);
          i < 0 && isSelect && this.selectUuidList.push(uuid) && (this.detailData[uuid] = item);
          i >= 0 && !isSelect && this.selectUuidList.splice(i, 1) && (this.$delete(this.detailData, uuid));
          _this.tableData.theadList.forEach(th => {
            if (th.control) {
              _this.$set(item[th.key], 'disabled', !isSelect);
              if (_this.currentValue[uuid]) {
                _this.currentValue[uuid][th.key] = th.config.defaultValue;
              } else {
                _this.currentValue[uuid] = {};
                _this.currentValue[uuid][th.key] = th.config.defaultValue;
              }
            }
          });
          isSelect && this.getDataConfig(uuid, item);
        });
    },
    searchData(arg, type, isSearch) {
      let _this = this;
      if (type == 'pageSize') {
        _this.tableData.pageSize = arg[0];
        _this.tableData.currentPage = 1;
      } else if (type == 'currentPage') {
        _this.tableData.currentPage = arg[0];
      } else {
        _this.tableData.pageSize = _this.setting.config.pageSize;
        _this.tableData.currentPage = 1;
      }
      let json = {
        matrixUuid: this.setting.config.matrixUuid,
        columnList: [],
        searchColumnList: [],
        currentPage: _this.tableData.currentPage,
        pageSize: _this.tableData.pageSize,
        arrayColumnList: [],
        needPage: _this.setting.config.needPage || false,
        sourceColumnList: []
      };
      this.setting.config.dataConfig &&
        this.setting.config.dataConfig.forEach(function(item) {
          item.isPC && json.columnList.push(item.uuid);
          item.isSearch && json.searchColumnList.push(item.uuid);
          item.isEdit && json.arrayColumnList.push(item.uuid);
        });

      if (json.columnList && json.columnList <= 0) {
        this.tableData.tbodyList = [];
        return false;
      }

      if (_this.setting.config.matrixType && _this.setting.config.matrixType == 'cmdbci') {
        let cmdbciFilterList = this.getFilterCondition(_this.setting.config);
        let attrFilterList = cmdbciFilterList.attrFilterList || [];
        let relFilterList = cmdbciFilterList.relFilterList || [];
        if (this.cmdbciSearchConfig) {
          attrFilterList = this.cmdbciSearchConfig.attrFilterList;
          relFilterList = this.cmdbciSearchConfig.relFilterList;
          this.cmdbciSearchConfig.filterCiEntityId && this.$set(json, 'filterCiEntityId', this.cmdbciSearchConfig.filterCiEntityId);
          this.cmdbciSearchConfig.filterCiId && this.$set(json, 'filterCiId', this.cmdbciSearchConfig.filterCiId);
        }
        this.$set(json, 'attrFilterList', attrFilterList);
        this.$set(json, 'relFilterList', relFilterList);
      } else {
        if (this.sourceColumnList && this.sourceColumnList.length > 0) {
          json.sourceColumnList = [];
          this.sourceColumnList.forEach(item => {
            if (!item.isFilterList) {
              if (Array.isArray(item.valueList)) {
                item.valueList.length > 0 && item.expression && json.sourceColumnList.push(item);
              } else {
                item.valueList && item.expression && json.sourceColumnList.push(item);
              }
            } else {
              json.sourceColumnList.push(item);
            }
          });
        } else {
          _this.setting.config.sourceColumnList && this.$set(json, 'sourceColumnList', _this.setting.config.sourceColumnList);
        }
      }

      //联动过滤
      if (this.filterList && this.filterList.length > 0) {
        this.$set(json, 'filterList', this.updateFilterList(this.filterList));
      }

      this.$set(json, 'sourceColumnList', this.searchSourceColumnList(json.sourceColumnList, this.filterList));

      //取消正在搜索的请求
      this.cancelAxios && this.cancelAxios.cancel();
      const CancelToken = this.$https.CancelToken;
      this.cancelAxios = CancelToken.source();

      this.loadingShow = true;
      json.matrixUuid && this.$https.post('/api/rest/matrix/column/data/search/fortable', json, {
        cancelToken: _this.cancelAxios.token
      }).then(res => {
        if (res && res.Status == 'OK' && !(!isSearch && _this.value && _this.value.table)) {
          if (isSearch) {
            _this.tableData.tbodyList = res.Return.tbodyList;
            _this.tableData.currentPage = res.Return.currentPage;
            _this.tableData.pageSize = res.Return.pageSize;
            _this.tableData.rowNum = res.Return.rowNum;
            _this.getAttributeTable();
          } else {
            res.Return.tbodyList = res.Return.tbodyList || [];
            _this.tableData = Object.assign({ isSelectAll: false, selectUuidList: []}, res.Return);
            _this.tableData.searchColumnDetailList = res.Return.searchColumnDetailList || [];
            _this.sourceColumnList = _this.getSearchValueList(_this.tableData.searchColumnDetailList, _this.setting.config.sourceColumnList, _this.setting.config.filterList);
            _this.getAttributeTable('init');
          }
          _this.matrixType = res.Return.type;
          //选中数据处理
          let selectNum = 0;
          _this.tableData.tbodyList && _this.tableData.tbodyList.forEach(item => {
            let value = '';
            if (_this.setting.config.uuidColumn) {
              value = item[_this.setting.config.uuidColumn].value;
            } else {
              value = item.uuid.value;
            }
            if (_this.selectUuidList.indexOf(value) >= 0) {
              this.$set(item, '_isSelected', true);
              ++selectNum;
            } else {
              this.$set(item, '_isSelected', false);
            }
          });

          if (_this.tableData.tbodyList && _this.tableData.tbodyList.length == selectNum) {
            _this.$set(_this.tableData, 'isSelectAll', true);
          } else {
            _this.$set(_this.tableData, 'isSelectAll', false);
          }
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    getConfig(tr, key) {
      let resultJson = {};
      let json = {};
      this.setting.config.dataConfig && (json = this.setting.config.dataConfig.find(item => {
        return item.uuid == key;
      }));
      let truuid = tr[this.uuidColumn].value;
      if (json) {
        resultJson.editType = json.editType;
        resultJson.item = tr[key];
        resultJson.value = this.currentValue && this.currentValue[truuid] ? this.currentValue[truuid][key] : null;
        resultJson.matrixType = this.matrixType;
        resultJson.disabled = !tr._isSelected;
      }

      return resultJson;
    },
    //扩展属性
    getAttributeTable(type) {
      let _this = this;
      if (_this.attributeList.length > 0) {
        _this.attributeList.forEach(item => {
          let json = _this.$utils.deepClone(item);
          let thItem = {
            title: item.attribute,
            key: item.attributeUuid,
            control: true, //表头扩展属性判断
            isRequired: item.isRequired,
            type: item.type,
            config: json.attrConfig
          };
          if (type && type == 'init') {
            _this.tableData.theadList.push(thItem);
          }
          _this.tableData.tbodyList && _this.tableData.tbodyList.forEach(tr => {
            let config = {
              type: item.type,
              text: item.attrConfig.defaultValue,
              value: item.attrConfig.defaultValue,
              defaultValue: item.attrConfig.defaultValue
            };
            _this.$set(tr, thItem.key, config);
            let truuid = tr[_this.uuidColumn].value;
            tr[thItem.key].value = _this.currentValue && _this.currentValue[truuid] && _this.currentValue[truuid][thItem.key] ? _this.currentValue[truuid][thItem.key] : json.attrConfig.defaultValue;
            tr[thItem.key].isRequired = thItem.isRequired;
          });
        });
      }
    },
    getDataConfig(uuid, tr) { //二次编辑
      let _this = this;
      let dataConfig = this.setting.config.dataConfig && this.setting.config.dataConfig.length > 0 ? this.setting.config.dataConfig : [];
      if (dataConfig.length > 0) {
        dataConfig.forEach(d => {
          if (d.isEdit && tr[d.uuid]) {
            let dataList = tr[d.uuid].dataList || [];
            let tdValue = '';
            if (dataList.length > 0) {
              if (d.editType == 'selects') {
                tdValue = [dataList[0].value];
              } else if (d.editType == 'select') {
                tdValue = dataList[0].value;
              }
            }
            if (_this.currentValue[uuid] && !_this.currentValue[uuid].hasOwnProperty([d.uuid])) {
              _this.currentValue[uuid][d.uuid] = tdValue;
            }
          }
        });
      }
    },
    changeSearchCondition(data) { //改变搜索条件
      if (data.type == 'cmdbci') {
        this.cmdbciSearchConfig = data || null;
      }
      this.searchData([1], 'currentPage', true);
    }
  },
  filter: {},
  computed: {
    getStyle() {
      let styleJson = {width: this.setting.config.width};
      return styleJson;
    },
    attributeList() {
      let list = this.setting.config.attributeList || [];
      return list;
    },
    getArrtConfig() {
      return (tr, th) => {
        let _this = this;
        let json = this.$utils.deepClone(th);
        if (json) {
          if (!tr._isSelected) {
            _this.$set(json.config, 'disabled', true);
          } else {
            _this.$set(json.config, 'disabled', false);
            json.config.value = tr[th.key].value;
          }
        }
        return json;
      };
    },
    getUrl() {
      return (th, tr) => {
        let url = '';
        let finditem = this.setting.config.dataConfig.find(item => item.uuid == th.key);
        if (finditem && finditem.urlAttributeValue) {
          url = tr[finditem.urlAttributeValue] ? tr[finditem.urlAttributeValue].text : '';
        }
        return url;
      };
    }
  },
  watch: {
    value: {
      handler: function(newValue, oldValue) {
        this.updateValue();
      },
      deep: true,
      immediate: true
    },
    setting: { //联动过滤
      handler: function(val, oldval) {
        let filterList = [];
        if (val && val.config && val.config.filterList) {
          filterList = this.$utils.deepClone(val.config.filterList);
        } else {
          filterList = [];
        }
        !this.$utils.isSame(filterList, this.filterList) && (this.filterList = filterList) && this.searchData();
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.tstable-container {
  .page-container {
    padding: 10px 0px;
    text-align: right;
  }
}
</style>
