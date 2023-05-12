<template>
  <div class="dynamicList-edit" :style="{width:setting.config.width}">
    <div v-if="!isReadonly" class="div-btn-contain">
      <i v-if="setting.config.isRequired" style="color: #ff625a;position: absolute;left: -8px; top: 17px;">*</i>
      <Button style="margin-right: 10px;" @click="addData">添加数据</Button>
      <Button v-if="tableData.selectUuidList && tableData.selectUuidList.length > 0" style="margin-right: 10px;" @click="removeBatch">批量删除</Button>
      <Button v-if="currentValue && Object.keys(currentValue).length > 0" @click="pageTable">刷新</Button>
    </div>
    <small v-if="message" class="text-tip">提示：{{ message }}</small>
    <div v-if="setting.config.desc" class="component-tips ts-info">{{ setting.config.desc }}</div>
    <div v-if="formView">
      <Loading :loadingShow="loadingShow" type="fix"></Loading>
      <div v-if="(tableData.tbodyList && tableData.tbodyList.length > 0) || !isReadonly" class="tstable-container">
        <div style="width:100%;overflow:auto">
          <table class="table-list tstable-body">
            <thead v-if="tableData.theadList.length > 0">
              <tr>
                <th v-if="!isReadonly" style="width:40px;text-align: center;">
                  <Checkbox v-model="tableData.isSelectAll" @on-change="selectAll(tableData)"></Checkbox>
                </th>
                <th v-for="(th, thIndex) in tableData.theadList" :key="thIndex">
                  <span :class="{ 'require-label': th.isRequired }">{{ th.title }}</span>
                </th>
                <th v-if="!isReadonly"></th>
              </tr>
            </thead>
            <tbody v-if="tableData.theadList.length > 0 && tableData.tbodyList.length > 0">
              <tr
                v-for="(tr, tbIndex) in tableData.tbodyList"
                :key="tbIndex+tr[uuidColumn].value"
                :style="{ cursor: isReadonly ? 'inherit' : 'pointer' }"
                @click="selectIndex(tableData, tbIndex, tr[uuidColumn].value)"
              >
                <td v-if="!isReadonly" style="width:40px">
                  <Checkbox :value="tr._isSelected"></Checkbox>
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
                <td v-if="!isReadonly" style="width:40px">
                  <i class="tsfont-trash-o btn-remove text-action" title="删除" @click.stop="removeData(tbIndex)"></i>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <template v-else-if="isReadonly">-</template>
      <transition name="fade">
        <span v-if="validMesage != ''" class="form-error-tip">{{ validMesage }}</span>
      </transition>
    </div>
    <!-- 添加弹出框 -->
    <AddDataDialog
      v-if="editModal"
      :isShowModal.sync="editModal"
      :selectUuidList="currentValue"
      :config="setting.config"
      :componentList="componentList"
      @on-ok="okAdd"
    ></AddDataDialog>
  </div>
</template>
<script>
import TdComponent from './td-component';
import AddDataDialog from './add-data-dialog.vue';
import viewmixin from '../viewmixin.js';
export default {
  name: 'FormdynamicList',
  components: { 
    AddDataDialog, 
    TdComponent,
    CellComponent: resolve => require(['./components.vue'], resolve)
  },
  mixins: [viewmixin],
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
        theadList: [],
        tbodyList: [],
        isSelectAll: false,
        selectUuidList: [],
        rowNum: null,
        currentPage: 1
        //  pageSize: this.setting.config.pageSize
      },
      currentValue: {}, //后台传过来的数据会把值为null undefined的去掉，导致值回显失败
      selectUuidList: [], //弹框选中的值list
      editModal: false, //模态框是否显示
      message: '',
      defaultCurrentValue: {}, //回显属性的值
      detailData: {}//表格详情
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
    updatethis(val) {
      this.$emit('update', val);
    },
    updateValue(val) {
      let data = this.$utils.deepClone(val);
      if (data) {
        this.currentValue = data.extendedData || {};
        this.selectUuidList = data.selectUuidList || [];
      }
      this.tableData.isSelectAll = false;
      this.tableData.selectUuidList = [];
      this.initData();
    },
    getValue() {
      let objJson = {selectUuidList: this.selectUuidList, extendedData: {}, detailData: {}};
      if (this.currentValue && !this.$utils.isEmptyObj(this.currentValue)) {
        let extendedData = this.$utils.deepClone(this.currentValue);
        this.$set(objJson, 'extendedData', extendedData);
        //详细数据
        let detailData = this.saveDetailData(this.detailData);
        this.$set(objJson, 'detailData', detailData);
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
    //添加行
    addData() {
      this.defaultCurrentValue = this.$utils.deepClone(this.currentValue);
      this.editModal = true;
    },
    //保存成功之后，回调重显列表数据
    okAdd(value) {
      this.currentValue = this.$utils.deepClone(value);
      if (Object.keys(this.currentValue).length > 0) {
        this.selectUuidList = Object.keys(this.currentValue);
        this.validMesage = '';
        Object.keys(this.currentValue).forEach(key => { //扩展属性的值
          if (this.setting.config.attributeList && this.setting.config.attributeList.length > 0) {
            let attributeList = this.setting.config.attributeList;
            attributeList.forEach(a => {
              this.currentValue[key][a.attributeUuid] = a.attrConfig.value;
            });
          }
          if (this.defaultCurrentValue && this.defaultCurrentValue[key]) {
            this.currentValue[key] = Object.assign(this.currentValue[key], this.defaultCurrentValue[key]);
          }
        });
      } else {
        this.selectUuidList = [];
      }
      this.pageTable();
      this.editModal = false;
    },
    //删除数据
    removeData(index) {
      let item = this.tableData.tbodyList[index];
      let i = this.tableData.selectUuidList.indexOf(item[this.uuidColumn].value);
      i >= 0 && this.tableData.selectUuidList.splice(i, 1);
      this.tableData.tbodyList.splice(index, 1);
      this.tableData.rowNum = this.tableData.rowNum - 1;

      //删除value值
      delete this.currentValue[item[this.uuidColumn].value];
      let findUuidIndex = this.selectUuidList.findIndex(s => s == item[this.uuidColumn].value);
      findUuidIndex >= 0 && this.selectUuidList.splice(findUuidIndex, 1);
      if (this.setting.config.isRequired && !(this.currentValue && Object.keys(this.currentValue).length > 0)) {
        this.validMesage = '数据不能为空';
      }
      this.$delete(this.detailData, item[this.uuidColumn].value);
    },
    removeBatch() {
      let _this = this;
      let arr = [];
      this.tableData.tbodyList &&
        this.tableData.tbodyList.forEach((item, index) => {
          let i = _this.tableData.selectUuidList.indexOf(item[this.uuidColumn].value);
          if (i < 0) {
            arr.push(item);
          } else {
            delete this.currentValue[item[this.uuidColumn].value];
            let findUuidIndex = this.selectUuidList.findIndex(s => s == item[this.uuidColumn].value);
            findUuidIndex >= 0 && this.selectUuidList.splice(findUuidIndex, 1);
          }
        });
      this.tableData.rowNum = this.tableData.rowNum - _this.tableData.selectUuidList.length;
      _this.tableData.selectUuidList = [];
      this.tableData.tbodyList = arr;
      this.tableData.isSelectAll = false;
      if (this.tableData.tbodyList && this.tableData.tbodyList.length <= 0) {
        //如果删除之后列表为空，但是数据还有，则自动刷新获取数据
        this.pageTable();
      }
      if (this.setting.config.isRequired && !(this.currentValue && Object.keys(this.currentValue).length > 0)) {
        this.validMesage = '数据不能为空';
      }
    },
    //选中一个
    selectIndex(table, index, uuid, val) {
      if (this.isReadonly) {
        return;
      }
      let isSelect = (table.tbodyList[index]._isSelected = !table.tbodyList[index]._isSelected);
      let _this = this;
      let i = table.selectUuidList.indexOf(uuid);
      i < 0 && isSelect && table.selectUuidList.push(uuid);
      i >= 0 && !isSelect && table.selectUuidList.splice(i, 1);
      let selectNum = 0;
      table.tbodyList &&
        table.tbodyList.forEach(item => {
          let value = item[_this.uuidColumn].value;
          if (table.selectUuidList.indexOf(value) >= 0) {
            _this.$set(item, '_isSelected', true) && selectNum++;
          } else {
            _this.$set(item, '_isSelected', false);
          }
        });
      selectNum == table.tbodyList.length ? (table.isSelectAll = true) : (table.isSelectAll = false);
    },
    //选中所有的数据
    selectAll(table) {
      let _this = this;
      table.tbodyList &&
        table.tbodyList.forEach((item, index) => {
          _this.$set(item, '_isSelected', table.isSelectAll);
          let uuid = table.tbodyList[index][_this.uuidColumn].value;
          let isSelect = table.tbodyList[index]._isSelected;
          let i = table.selectUuidList.indexOf(uuid);
          i < 0 && isSelect && table.selectUuidList.push(uuid);
          i >= 0 && !isSelect && table.selectUuidList.splice(i, 1);
        });
    },
    //分页
    pageTable(val, type) {
      this.initData();
    },
    //获取表格数据
    initData() {
      let _this = this;
      if (!this.setting.config.matrixUuid || this.selectUuidList.length <= 0) {
        _this.tableData.theadList = [];
        _this.tableData.tbodyList = [];
        let dataConfig = this.setting.config.dataConfig;
        let theadList = [];
        dataConfig.length && dataConfig.forEach(item => {
          let th = {
            key: item.uuid,
            title: item.name
          };
          item.isPC && theadList.push(th);
        });
        if (_this.setting.config.extendAttributes) { //扩展属性
          let attributeList = _this.setting.config.attributeList;
          attributeList.length && attributeList.forEach(item => {
            if (item.attribute) {
              let th = {
                title: item.attribute,
                key: item.attributeUuid,
                isRequired: item.isRequired
              };
              theadList.push(th);
            }
          });
        }
        _this.tableData.theadList = theadList;
        return;
      }
      this.loadingShow = true;
      let params = {
        matrixUuid: this.setting.config.matrixUuid,
        columnList: [],
        defaultValue: this.selectUuidList,
        needPage: false,
        arrayColumnList: []
      };
      if (this.setting.config.uuidColumn) {
        this.$set(params, 'uuidColumn', this.setting.config.uuidColumn);
      }
      this.setting.config.dataConfig &&
        this.setting.config.dataConfig.forEach(function(item) {
          item.isPC && params.columnList.push(item.uuid);
          item.isEdit && params.arrayColumnList.push(item.uuid);
        });
      params.matrixUuid &&
        this.$api.framework.matrix.getMatrixDataForTable(params).then(res => {
          if (res.Status == 'OK') {
            _this.loadingShow = false;
            _this.tableData.theadList = res.Return.theadList;
            _this.tableData.tbodyList = res.Return.tbodyList;
            _this.tableData.rowNum = res.Return.rowNum;
            _this.matrixType = res.Return.type;
            _this.tableData.selectUuidList.length > 0 && _this.tableData.tbodyList && _this.tableData.tbodyList.forEach(item => {
              let value = item[_this.uuidColumn].value;
              if (_this.tableData.selectUuidList.indexOf(value) >= 0) {
                _this.$set(item, '_isSelected', true);
              } else {
                _this.$set(item, '_isSelected', false);
              }
            });
            if (params.defaultValue.length > 0 && (_this.tableData.tbodyList.length != params.defaultValue.length || _this.tableData.tbodyList.length == 0)) {
              // _this.message = '表格选择组件，矩阵的唯一属性没有唯一性，导致数据显示异常，请更换矩阵唯一属性';
              //过滤接口未返回的数据
              _this.selectUuidList = [];
              if (_this.tableData.tbodyList.length > 0) {
                _this.selectUuidList = _this.tableData.tbodyList.map((item) => {
                  return item[_this.uuidColumn].value;
                });
                _this.currentValue = Object.keys(_this.currentValue).filter(key => _this.selectUuidList.indexOf(key) > -1);
              }
            } else {
              _this.message = '';
            }
            _this.getDataConfig();
            _this.getAttributeTable('init');
            _this.getDetailData();
            _this.$forceUpdate();
          }
        });
      this.editModal = false;
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
      }
      return resultJson;
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
    //扩展属性
    getAttributeTable(type) { 
      let _this = this;
      if (_this.setting.config.attributeList && _this.setting.config.attributeList.length > 0) {
        _this.setting.config.attributeList.forEach(item => {
          let thItem = {
            title: item.attribute,
            key: item.attributeUuid,
            control: true,
            isRequired: item.isRequired,
            type: item.type,
            config: item.attrConfig
          };
          if (type && type == 'init') {
            _this.tableData.theadList.push(thItem);
          }
          _this.tableData.tbodyList && _this.tableData.tbodyList.forEach(tr => {
            let config = {
              type: item.type,
              text: item.attrConfig.value,
              value: item.attrConfig.value
            };
            _this.$set(tr, thItem.key, config);
            let truuid = tr[_this.uuidColumn].value;
            tr[thItem.key].value = _this.currentValue && _this.currentValue[truuid] && _this.currentValue[truuid][thItem.key] ? _this.currentValue[truuid][thItem.key] : item.attrConfig.defaultValue;
            tr[thItem.key].isRequired = thItem.isRequired;
          });
        });
      }
    },
    getDetailData() {
      let _this = this;
      _this.detailData = {};
      _this.tableData.tbodyList && _this.tableData.tbodyList && _this.tableData.tbodyList.forEach(tr => {
        let truuid = tr[_this.uuidColumn].value;
        _this.$set(_this.detailData, truuid, tr);
      });
    },
    getDataConfig() { //二次编辑
      let _this = this;
      let dataConfig = this.setting.config.dataConfig && this.setting.config.dataConfig.length > 0 ? this.setting.config.dataConfig : [];
      if (dataConfig.length > 0) { 
        this.tableData.tbodyList && this.tableData.tbodyList.forEach(item => {
          let key = item[_this.uuidColumn].value;
          dataConfig.forEach(d => {
            if (d.isEdit && item[d.uuid]) {
              let dataList = item[d.uuid].dataList || [];
              let tdValue = '';
              if (dataList.length > 0) {
                if (d.editType == 'selects') {
                  tdValue = [dataList[0].value];
                } else if (d.editType == 'select') {
                  tdValue = dataList[0].value;
                }
              }
              if (_this.currentValue[key] && !_this.currentValue[key].hasOwnProperty([d.uuid])) {
                _this.currentValue[key][d.uuid] = tdValue;
              }
            }
          });
        });
      }
    }
  },
  filter: {},
  computed: {
    getArrtConfig() {
      return (tr, th) => {
        let json = this.$utils.deepClone(th);
        let truuid = tr[this.uuidColumn].value;
        if (json) {
          json.config.value = this.currentValue && this.currentValue[truuid] && this.currentValue[truuid].hasOwnProperty(th.key) ? this.currentValue[truuid][th.key] : json.config.defaultValue;
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
        this.updateValue(newValue); // 解决工单转知识，表格选择组件，带扩展属性form表单数据不回显问题
        // if (JSON.stringify(newValue) != JSON.stringify(this.currentValue)) {
        //   this.updateValue(newValue);
        // }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.dynamicList-edit {
  .div-btn-contain {
    padding: 8px 0px;
  }
}

.tstable-container {
  .page-container {
    padding: 10px 0px;
    text-align: right;
  }
}
</style>
