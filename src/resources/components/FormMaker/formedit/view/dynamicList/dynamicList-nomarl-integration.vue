<template>
  <div class="dynamicList-edit" :style="getStyle">
    <Search
      v-if="!isReadonly"
      :searchColumnDetailList="tableData.searchColumnDetailList"
      :value="searchValueList"
      @changeConditionValue="changeConditionValue"
    ></Search>
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
                :key="tbIndex"
                :style="{ cursor: isReadonly ? 'inherit' : 'pointer' }"
                @click="selectIndex(tbIndex, tr[uuidColumn], tr)"
              >
                <td style="width:40px">
                  <Checkbox :value="tr._isSelected" :disabled="isReadonly"></Checkbox>
                </td>
                <td v-for="(th, thIndex) in tableData.theadList" :key="thIndex">
                  <template v-if="th.type && th.config">
                    <TdFormitem
                      :ref="'formComponent_'+tr[uuidColumn]"
                      :setting="getConfig(tr,th)"
                      :isReadonly="isReadonly"
                      @on-updata="updateCellValue(arguments, th.key, tr[uuidColumn])"
                    ></TdFormitem>
                  </template>
                  <a
                    v-else-if="getUrl(th,tr)"
                    :href="getUrl(th,tr)"
                    class="text-href"
                    target="_blank"
                    @click.stop
                  >{{ tr[th.key] }}</a>
                  <template v-else>
                    {{ tr[th.key] }}
                  </template>
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
import filtermixin from './filtermixin';
import Search from './search';
export default {
  name: 'FormdynamicList',
  components: {
    Search,
    TdFormitem: () => import('../integration/td-formitem.vue')
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
      searchValueList: [],
      currentValue: {}, //后台传过来的数据会把值为null undefined的去掉，导致值回显失败
      message: '',
      detailData: {}, //表格详情
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
    updateValue: function() {
      //情况数据
      this.selectUuidList = [];
      this.searchValueList = [];
      this.currentValue = {};
      this.detailData = {};
      //赋值
      let data = this.$utils.deepClone(this.value);
      if (data && data.table) { //val存在 保存表格
        this.tableData = data.table;
        this.searchValueList = data.searchValueList;
        this.currentValue = data.extendedData;
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
    getValue: function() {
      let objJson = {selectUuidList: this.selectUuidList, extendedData: this.currentValue, detailData: {}};
      if (!this.setting.config.needPage) { //不需要分页时，拿去整个表格数据
        objJson.table = this.tableData;
        objJson.searchValueList = this.searchValueList;
      }
      if (this.selectUuidList && this.selectUuidList.length > 0) {
        let detailData = this.saveIntegrationDetail(this.detailData, this.currentValue);
        this.$set(objJson, 'detailData', detailData);
      }
      return objJson;
    },
    validateValue: function() {
      let isVaild = true;
      if (this.setting.config.isRequired && !(this.currentValue && Object.keys(this.currentValue).length > 0)) {
        isVaild = false;
        this.validMesage = '数据不能为空';
      }
      if (isVaild) {
        for (let key in this.$refs) {
          let item = this.$refs[key];
          if (item) {
            if (Array.isArray(item) && item.length) {
              item.forEach(k => {
                !k.validateValue() && (isVaild = false);
              });
            }
          } else {
            !item.validateValue() && (isVaild = false);
          }
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
    },
    changeConditionValue(val) {
      this.searchValueList = val;
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
          let value = item[_this.uuidColumn];
          if (_this.selectUuidList.indexOf(value) >= 0) {
            _this.$set(item, '_isSelected', true) && selectNum++;
          } else {
            _this.$set(item, '_isSelected', false);
            this.currentValue && this.currentValue[uuid] && this.$delete(this.currentValue, uuid);
          }
        });
      !isSelect && this.currentValue[uuid] && delete this.currentValue[uuid];
      selectNum == this.tableData.tbodyList.length ? (this.tableData.isSelectAll = true) : (this.tableData.isSelectAll = false);
      //扩展
      this.tableData.theadList.forEach(th => {
        let item = this.tableData.tbodyList[index][th.key] || {};
        if (isSelect) {
          if (_this.currentValue[uuid]) {
            th.config && (_this.currentValue[uuid][th.key] = item.hasOwnProperty('value') ? item.value : th.config.value);
          } else {
            _this.currentValue[uuid] = {};
            th.config && (_this.currentValue[uuid][th.key] = item.hasOwnProperty('value') ? item.value : th.config.value);
          }
        }
      });
    },
    //选中所有的数据
    selectAll() {
      let _this = this;
      this.tableData.tbodyList &&
        this.tableData.tbodyList.forEach((item, index) => {
          _this.$set(item, '_isSelected', this.tableData.isSelectAll);
          let uuid = this.tableData.tbodyList[index][_this.uuidColumn];
          let isSelect = this.tableData.tbodyList[index]._isSelected;
          let i = this.selectUuidList.indexOf(uuid);
          i < 0 && isSelect && this.selectUuidList.push(uuid) && (this.detailData[uuid] = item);
          i >= 0 && !isSelect && this.selectUuidList.splice(i, 1) && (this.$delete(this.detailData, uuid));
          !isSelect && _this.currentValue[uuid] && delete _this.currentValue[uuid];
          _this.tableData.theadList.forEach(th => {
            let config = item[th.key] || {};
            if (th.config) {
              if (_this.currentValue[uuid]) {
                _this.currentValue[uuid][th.key] = config.hasOwnProperty('value') ? config.value : th.config.value;
              } else {
                _this.currentValue[uuid] = {};
                _this.currentValue[uuid][th.key] = config.hasOwnProperty('value') ? config.value : th.config.value;
              }
            }
          });
        });
    },
    searchData(arg, type, isSearch) {
      let _this = this;
      let url = '/api/rest/integration/table/data/search';
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
        integrationUuid: this.setting.config.integrationUuid,
        columnList: [],
        searchColumnList: [],
        currentPage: _this.tableData.currentPage,
        pageSize: _this.tableData.pageSize,
        arrayColumnList: [],
        needPage: _this.setting.config.needPage || false,
        sourceColumnList: []
      };
      this.setting.config.dataConfig &&
        this.setting.config.dataConfig.forEach((item) => {
          let isPC = item.hasOwnProperty('isPC') ? item.isPC : true;
          isPC && json.columnList.push(item.uuid);
          item.isSearch && json.searchColumnList.push(item.uuid);
        });
      if (json.columnList && json.columnList <= 0) {
        this.tableData.tbodyList = [];
        return false;
      }
      if (this.searchValueList && this.searchValueList.length > 0) {
        this.searchValueList.forEach(item => {
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
        _this.setting.config.sourceColumnList && this.$set(json, 'sourceColumnList', this.$utils.deepClone(_this.setting.config.sourceColumnList));
      }

      //联动过滤
      if (this.filterList && this.filterList.length > 0) {
        this.$set(json, 'filterList', this.updateFilterList(this.filterList));
      }

      this.$set(json, 'sourceColumnList', this.searchSourceColumnList(json.sourceColumnList, this.filterList));

      //取消正在搜索的请求
      let cancel = this.cancelAxios;
      cancel && (this.cancelAxios = null) && cancel.cancel();

      const CancelToken = this.$https.CancelToken;
      this.cancelAxios = CancelToken.source();
      json.integrationUuid && this.$https.post(url, json, {
        cancelToken: _this.cancelAxios.token
      }).then(res => {
        if (res.Status == 'OK' && !(!isSearch && _this.value && _this.value.table)) {
          if (isSearch) {
            _this.tableData.tbodyList = res.Return.tbodyList;
            _this.tableData.currentPage = res.Return.currentPage;
            _this.tableData.pageSize = res.Return.pageSize;
            _this.tableData.rowNum = res.Return.rowNum;
          } else {
            res.Return.tbodyList = res.Return.tbodyList || [];
            _this.tableData = Object.assign({ isSelectAll: false, selectUuidList: []}, res.Return);
            _this.tableData.searchColumnDetailList = res.Return.searchColumnDetailList || [];
            _this.searchValueList = _this.getSearchValueList(_this.tableData.searchColumnDetailList, _this.setting.config.sourceColumnList, this.filterList);
          }
          //选中数据处理
          let selectNum = 0;
          _this.tableData.tbodyList && _this.tableData.tbodyList.forEach(item => {
            let value = '';
            if (_this.setting.config.uuidColumn) {
              value = item[_this.setting.config.uuidColumn];
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
      });
    },
    getConfig(tr, th) {
      let resultJson = {};
      let json = {};
      let rootName = 'dataList';
      let textName = 'text';
      let valueName = 'value';
      this.setting.config.dataConfig && (json = this.setting.config.dataConfig.find(item => {
        return item.uuid == th.key;
      }));
      let truuid = tr[this.uuidColumn];
      if (json) {
        Object.assign(resultJson, th);
        let item = tr[th.key] || {};
        resultJson.item = item;
        resultJson.value = this.currentValue && this.currentValue[truuid] ? this.currentValue[truuid][th.key] : item.hasOwnProperty('value') ? item.value : th.config.value;
        resultJson.disabled = !tr._isSelected;
        if (resultJson.config) {
          resultJson.config.rootName && (rootName = resultJson.config.rootName);
          resultJson.config.textName && (textName = resultJson.config.textName);
          resultJson.config.valueName && (valueName = resultJson.config.valueName);
        }
        if (item[rootName]) {
          let dataList = item[rootName].filter(d => d && d.hasOwnProperty(valueName) && d.hasOwnProperty(textName) && d[valueName].toString().trim() != '' && d[textName].toString().trim() != '');
          dataList.length > 0 && (resultJson.dataList = dataList);
        }
      }
      return resultJson;
    }
  },
  filter: {},
  computed: {
    getStyle() {
      let styleJson = {width: this.setting.config.width};
      return styleJson;
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
    'setting.config.filterList': { //联动过滤
      handler: function(val, oldval) {
        if (val) {
          this.filterList = this.$utils.deepClone(val);
        } else {
          this.filterList = [];
        }
        !this.$utils.isSame(val, oldval) && this.searchData();
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
