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
                :key="tbIndex"
                :style="{ cursor: isReadonly ? 'inherit' : 'pointer' }"
                @click="selectIndex(tableData, tbIndex, tr[uuidColumn])"
              >
                <td v-if="!isReadonly" style="width:40px">
                  <Checkbox :value="tr._isSelected"></Checkbox>
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
    <AddIntegrationDialog
      v-if="editModal"
      :isShowModal.sync="editModal"
      :selectUuidList="currentValue"
      :config="setting.config"
      :componentList="componentList"
      @on-ok="okAdd"
    ></AddIntegrationDialog>
  </div>
</template>
<script>
import AddIntegrationDialog from './add-integration-dialog.vue';
import viewmixin from '../viewmixin.js';
export default {
  name: 'FormdynamicList',
  components: { 
    AddIntegrationDialog,
    TdFormitem: resolve => require(['../integration/td-formitem.vue'], resolve) 
   
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
      data && (this.currentValue = data.extendedData);
      this.tableData.isSelectAll = false;
      this.tableData.selectUuidList = [];
      this.initData(this.currentValue);
    },
    getValue() {
      let objJson = {selectUuidList: this.selectUuidList, extendedData: this.currentValue, detailData: {}};
      if (this.selectUuidList && this.selectUuidList.length > 0) {
        let detailData = this.saveIntegrationDetail(this.detailData, this.currentValue);
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
    //添加行
    addData() {
      this.defaultCurrentValue = this.$utils.deepClone(this.currentValue);
      this.editModal = true;
    },
    //保存成功之后，回调重显列表数据
    okAdd(value) {
      this.currentValue = this.$utils.deepClone(value);
      if (Object.keys(this.currentValue).length > 0) {
        this.validMesage = '';
        Object.keys(this.currentValue).forEach(key => { //扩展属性的值
          if (this.defaultCurrentValue[key]) {
            this.currentValue[key] = Object.assign(this.currentValue[key], this.defaultCurrentValue[key]);
          }
        });
      }
      this.pageTable();
      this.editModal = false;
    },
    //删除数据
    removeData(index) {
      let item = this.tableData.tbodyList[index];
      let i = this.tableData.selectUuidList.indexOf(item[this.uuidColumn]);
      i >= 0 && this.tableData.selectUuidList.splice(i, 1);
      this.tableData.tbodyList.splice(index, 1);
      this.tableData.rowNum = this.tableData.rowNum - 1;

      //删除value值
      delete this.currentValue[item[this.uuidColumn]];
      let findUuidIndex = this.selectUuidList.findIndex(s => s == item[this.uuidColumn]);
      findUuidIndex >= 0 && this.selectUuidList.splice(findUuidIndex, 1);
      if (this.setting.config.isRequired && !(this.currentValue && Object.keys(this.currentValue).length > 0)) {
        this.validMesage = '数据不能为空';
      }
      this.$delete(this.detailData, item[this.uuidColumn]);
    },
    removeBatch() {
      let _this = this;
      let arr = [];
      this.tableData.tbodyList &&
        this.tableData.tbodyList.forEach((item, index) => {
          let i = _this.tableData.selectUuidList.indexOf(item[this.uuidColumn]);
          if (i < 0) {
            arr.push(item);
          } else {
            delete this.currentValue[item[this.uuidColumn]];
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
          let value = item[_this.uuidColumn];
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
          let uuid = table.tbodyList[index][_this.uuidColumn];
          let isSelect = table.tbodyList[index]._isSelected;
          let i = table.selectUuidList.indexOf(uuid);
          i < 0 && isSelect && table.selectUuidList.push(uuid);
          i >= 0 && !isSelect && table.selectUuidList.splice(i, 1);
        });
    },
    //分页
    pageTable(val, type) {
      this.initData(this.currentValue);
    },
    //获取表格数据
    initData(dataUuidList) {
      let _this = this;
      if (!this.setting.config.integrationUuid || !dataUuidList || Object.keys(dataUuidList).length <= 0) {
        _this.tableData.theadList = [];
        _this.tableData.tbodyList = [];
        let dataConfig = this.setting.config.dataConfig;
        let theadList = [];
        dataConfig.length && dataConfig.forEach(item => {
          let th = {
            key: item.uuid,
            title: item.name,
            isRequired: item.isRequired || false,
            isPC: item.hasOwnProperty('isPC') ? item.isPC : true //pc端是否展示该字段
          };
          th.isPC && theadList.push(th);
        });
        _this.tableData.theadList = theadList;
        return;
      }
      let defaultValue = [];
      if (Object.keys(dataUuidList).length) {
        Object.keys(dataUuidList).forEach(k => {
          let n = Number(k);
          if (!isNaN(n)) {
            defaultValue.push(parseInt(k));
          } else {
            defaultValue.push(k);
          }
        });
      }
      this.loadingShow = true;
      this.selectUuidList = defaultValue;
      let params = {
        integrationUuid: this.setting.config.integrationUuid,
        columnList: [],
        defaultValue: defaultValue,
        needPage: false,
        arrayColumnList: []
      };
      this.setting.config.dataConfig &&
        this.setting.config.dataConfig.forEach((item) => {
          let isPC = item.hasOwnProperty('isPC') ? item.isPC : true;
          isPC && params.columnList.push(item.uuid);
          item.isEdit && params.arrayColumnList.push(item.uuid);
        });
      params.integrationUuid &&
        this.$api.process.integration.getIntegrationTableSearch(params).then(res => {
          if (res.Status == 'OK') {
            _this.loadingShow = false;
            _this.tableData.theadList = res.Return.theadList;
            _this.tableData.tbodyList = res.Return.tbodyList;
            _this.tableData.rowNum = res.Return.rowNum;
            _this.tableData.selectUuidList.length > 0 && _this.tableData.tbodyList && _this.tableData.tbodyList.forEach(item => {
              let value = item[_this.uuidColumn];
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
                  return item[_this.uuidColumn];
                });
                _this.currentValue = Object.keys(_this.currentValue).filter(key => _this.selectUuidList.indexOf(key) > -1);
              }
            } else {
              _this.message = '';
            }
            _this.getDetailData();
            _this.$forceUpdate();
          }
        });
      this.editModal = false;
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
        resultJson.disabled = this.isReadonly;
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
    getDetailData() {
      let _this = this;
      _this.detailData = {};
      _this.tableData.tbodyList && _this.tableData.tbodyList.length > 0 && _this.tableData.tbodyList.forEach(tr => {
        let truuid = tr[_this.uuidColumn];
        _this.$set(_this.detailData, truuid, tr);
      });
    }
  },
  filter: {},
  computed: {
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
