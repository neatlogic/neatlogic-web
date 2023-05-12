<template>
  <div>
    <TsDialog
      type="modal"
      :isShow.sync="showModal"
      width="900px"
      height="600px"
      title="添加数据"
      className="dynamicList-modal"
      @on-ok="okAdd"
    >
      <div class="edit-Modal">
        <Loading :loadingShow="editModalLoading" type="fix"></Loading>
        <!-- 搜索条件显示 -->
        <template v-if="searchItems[config.type + 'Search']">
          <component
            :is="config.type + 'Search'"
            :config="config"
            :searchColumnDetailList="editModalJson.searchColumnDetailList"
            @changeSearchCondition="changeSearchCondition"
          ></component>
        </template>
        <template v-else>
          <Search
            :config="config"
            :matrixType="matrixType"
            :searchColumnDetailList="editModalJson.searchColumnDetailList"
            :value="searchValueList"
            :filterList="config.filterList"
            :componentList="componentList"
            @changeConditionValue="changeConditionValue"
          ></Search>
        </template>
        <!-- table数据显示 -->
        <div v-show="!editModalLoading">
          <Button v-if="matrixType == 'custom'" @click="isShowAddTr = true">添加行</Button>
          <!-- 自定义矩阵添加行 -->
          <div v-if="editModalJson.tbodyList && editModalJson.tbodyList.length > 0" class="tstable-container" style="margin-top:15px;">
            <div style="width:100%;overflow:auto">
              <table class="table-list tstable-body">
                <thead>
                  <tr>
                    <th style="width:40px;text-align: center;">
                      <Checkbox v-model="editModalJson.isSelectAll" @on-change="selectAll"></Checkbox>
                    </th>
                    <th v-for="(th, thIndex) in editModalJson.theadList" :key="thIndex">{{ th.title }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(tr, tbIndex) in editModalJson.tbodyList"
                    :key="tbIndex+tr[uuidColumn].value"
                    style="cursor:pointer;"
                    @click="selectIndex(tbIndex, tr[uuidColumn].value)"
                  >
                    <td style="width:40px">
                      <Checkbox :value="tr._isSelected"></Checkbox>
                    </td>
                    <td v-for="(th, thIndex) in editModalJson.theadList" :key="thIndex">
                      <TdComponent
                        isReadonly
                        :item="tr[th.key]"
                        :editType="getEditType(th.key)"
                        :value="getTdValue(tr[uuidColumn].value, th.key,tr)"
                        :matrixType="matrixType"
                        :url="getUrl(th, tr)"
                        @on-updata="updateValue(arguments, th.key, tr[uuidColumn].value)"
                      ></TdComponent>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <Page
              class="page-container"
              transfer
              size="small"
              show-total
              :total="editModalJson.rowNum"
              :current="editModalJson.currentPage"
              :page-size="editModalJson.pageSize"
              @on-change="searchData(arguments, 'currentPage',true)"
              @on-page-size-change="searchData(arguments, 'pageSize',true)"
            />
          </div>
          <NoData v-else></NoData>
        </div>
      </div>
    </TsDialog>
    <!-- 添加行的弹出框 -->
    <AddCustomTr
      v-if="isShowAddTr && matrixType == 'custom'"
      :isShowModal.sync="isShowAddTr"
      :matrixType="matrixType"
      :matrixUuid="config.matrixUuid"
      @on-ok="AddCustomTr"
    ></AddCustomTr>
  </div>
</template>
<script>
import AddCustomTr from './add-custom-tr';
import TdComponent from './td-component';
import Search from './search';
import filtermixin from './filtermixin';
import searchItems from './search/search.js';
export default {
  name: 'FormdynamicList',
  components: { AddCustomTr, TdComponent, Search, ...searchItems},
  mixins: [filtermixin],
  props: {
    selectUuidList: [Object, Array], //选中的数据
    isShowModal: Boolean,
    config: Object, //组件对应的config数据
    componentList: Array
  },
  data() {
    let _this = this;
    return {
      uuidColumn: _this.config.uuidColumn ? _this.config.uuidColumn : 'uuid',
      matrixType: '',
      showModal: _this.isShowModal,
      isShowAddTr: false, //矩阵是自定义数据源时，添加行的弹出框
      editModalLoading: true,
      cancelAxios: null,
      currentSelectUuidList: _this.selectUuidList ? _this.$utils.deepClone(_this.selectUuidList) : {},
      editModalJson: {
        theadList: [],
        tbodyList: [],
        searchColumnDetailList: [],
        rowNum: null,
        currentPage: 1,
        pageSize: _this.config.pageSize,
        isSelectAll: false //是否全选
      },
      searchValueList: [],
      uuidValueConfig: {},
      searchItems: searchItems, //根据矩阵类型渲染搜索组件
      cmdbciSearchConfig: null, //cmdbci类型搜索条件
      filterList: [] //联动过滤
    };
  },
  beforeCreate() {},
  created() {
    this.searchData();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    this.cancelAxios && this.cancelAxios.cancel();
  },
  destroyed() {},
  methods: {
    //保存成功之后，回调重显列表数据
    okAdd() {
      let valueConfig = {};
      for (let key in this.currentSelectUuidList) {
        valueConfig[key] = this.uuidValueConfig[key] || {};
      }
      this.$emit('on-ok', valueConfig);
    },
    //选中一个
    selectIndex(index, uuid, val) {
      let isSelect = (this.editModalJson.tbodyList[index]._isSelected = !this.editModalJson.tbodyList[index]._isSelected);
      let _this = this;
      if (typeof this.currentSelectUuidList[uuid] == 'undefined') {
        this.currentSelectUuidList[uuid] = this.uuidValueConfig[uuid] || {};
      } else {
        delete this.currentSelectUuidList[uuid];
      }
      let selectNum = 0;
      this.editModalJson.tbodyList &&
        this.editModalJson.tbodyList.forEach(item => {
          let value = '';
          if (_this.config.uuidColumn) {
            value = item[_this.config.uuidColumn].value;
          } else {
            value = item.uuid.value;
          }
          if (typeof this.currentSelectUuidList[value] != 'undefined') {
            _this.$set(item, '_isSelected', true) && selectNum++;
          } else {
            _this.$set(item, '_isSelected', false);
          }
        });

      selectNum == this.editModalJson.tbodyList.length ? (this.editModalJson.isSelectAll = true) : (this.editModalJson.isSelectAll = false);
    },
    //选中所有的数据
    selectAll() {
      let _this = this;
      this.editModalJson.tbodyList &&
        this.editModalJson.tbodyList.forEach((item, index) => {
          _this.$set(item, '_isSelected', this.editModalJson.isSelectAll);
          let uuid = null;
          if (_this.config.uuidColumn) {
            uuid = this.editModalJson.tbodyList[index][_this.config.uuidColumn].value;
          } else {
            uuid = this.editModalJson.tbodyList[index].uuid.value;
          }
          let isSelect = this.editModalJson.tbodyList[index]._isSelected;

          if (typeof this.currentSelectUuidList[uuid] == 'undefined' && isSelect) {
            this.currentSelectUuidList[uuid] = this.uuidValueConfig[uuid] || {};
          } else if (typeof this.currentSelectUuidList[uuid] != 'undefined' && !isSelect) {
            delete this.currentSelectUuidList[uuid];
          }
        });
    },
    changeConditionValue(val) {
      this.searchValueList = val;
      this.searchData([1], 'currentPage', true);
    },
    //弹出框搜索值 参数组要用于分页的
    searchData(arg, type, isSearch) {
      let _this = this;
      if (type == 'pageSize') {
        _this.editModalJson.pageSize = arg[0];
        _this.editModalJson.currentPage = 1;
      } else if (type == 'currentPage') {
        _this.editModalJson.currentPage = arg[0];
      } else {
        _this.editModalJson.pageSize = _this.config.pageSize;
        _this.editModalJson.currentPage = 1;
      }
      let json = {
        matrixUuid: this.config.matrixUuid,
        columnList: [],
        searchColumnList: [],
        currentPage: _this.editModalJson.currentPage,
        pageSize: _this.editModalJson.pageSize,
        arrayColumnList: [],
        sourceColumnList: []
      };

      this.config.dataConfig &&
        this.config.dataConfig.forEach(function(item) {
          item.isPC && json.columnList.push(item.uuid);
          item.isSearch && json.searchColumnList.push(item.uuid);
          item.isEdit && json.arrayColumnList.push(item.uuid);
        });

      if (json.columnList && json.columnList <= 0) {
        this.editModalJson.tbodyList = [];
        this.editModalLoading = false;
        return false;
      }

      if (_this.config.matrixType == 'cmdbci') {
        //过滤条件
        let attrFilterList = _this.config.attrFilterList ? _this.config.attrFilterList.map(item => {
          return {
            attrId: item.attrId,
            expression: item.expression,
            valueList: item.valueList
          };
        }) : [];
        let relFilterList = _this.config.relFilterList ? _this.config.relFilterList.map(item => {
          return {
            relId: item.relId,
            expression: item.expression,
            valueList: item.valueList,
            direction: item.direction
          };
        }) : [];
        if (this.cmdbciSearchConfig) { //搜索
          attrFilterList = this.cmdbciSearchConfig.attrFilterList;
          relFilterList = this.cmdbciSearchConfig.relFilterList;
          this.cmdbciSearchConfig.filterCiEntityId && this.$set(json, 'filterCiEntityId', this.cmdbciSearchConfig.filterCiEntityId);
          this.cmdbciSearchConfig.filterCiId && this.$set(json, 'filterCiId', this.cmdbciSearchConfig.filterCiId);
        }
       
        this.$set(json, 'attrFilterList', attrFilterList);
        this.$set(json, 'relFilterList', relFilterList);
      } else {
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
          _this.config.sourceColumnList && this.$set(json, 'sourceColumnList', _this.config.sourceColumnList);
        }
      }
      
      //联动过滤
      if (_this.config.filterList) {
        this.$set(json, 'filterList', this.updateFilterList(_this.config.filterList));
      }
        
      this.$set(json, 'sourceColumnList', this.searchSourceColumnList(json.sourceColumnList, _this.config.filterList));
 
      //取消正在搜索的请求
      this.cancelAxios && this.cancelAxios.cancel();
      const CancelToken = this.$https.CancelToken;
      this.cancelAxios = CancelToken.source();
      
      this.editModalLoading = true;
      json.matrixUuid &&
        this.$https.post('/api/rest/matrix/column/data/search/fortable', json, {
          cancelToken: _this.cancelAxios.token
        }).then(res => {
          if (res.Status == 'OK') {
            if (isSearch) {
              _this.editModalJson.tbodyList = res.Return.tbodyList;
              _this.editModalJson.currentPage = res.Return.currentPage;
              _this.editModalJson.pageSize = res.Return.pageSize;
              _this.editModalJson.rowNum = res.Return.rowNum;
              !isSearch && (_this.editModalJson.searchColumnDetailList = res.Return.searchColumnDetailList || []);
            } else {
              res.Return.tbodyList = res.Return.tbodyList || [];
              _this.editModalJson = res.Return;
            }
            _this.matrixType = res.Return.type;
            //选中数据处理
            let selectNum = 0;
            _this.editModalJson.tbodyList &&
                _this.editModalJson.tbodyList.forEach(item => {
                  let value = '';
                  if (_this.config.uuidColumn) {
                    value = item[_this.config.uuidColumn].value;
                  } else {
                    value = item.uuid.value;
                  }

                  if (typeof _this.currentSelectUuidList[value] != 'undefined') {
                    _this.$set(item, '_isSelected', true) && selectNum++;
                  } else {
                    _this.$set(item, '_isSelected', false);
                  }
                  if (_this.config.dataConfig && _this.config.dataConfig.length > 0) {
                    let dataConfig = _this.config.dataConfig;
                    dataConfig.forEach(d => {
                      if (d.isEdit) {
                        let dataList = item[d.uuid].dataList || [];
                        if (dataList.length > 0) {
                          if (d.editType == 'selects') {
                            item[d.uuid].value = [dataList[0].value];
                            item[d.uuid].text = [dataList[0].text];
                          } else if (d.editType == 'select') {
                            item[d.uuid].value = dataList[0].value;
                            item[d.uuid].text = dataList[0].text;
                          }
                        }
                      }
                    });
                  }
                });

            if (_this.editModalJson.tbodyList && _this.editModalJson.tbodyList.length == selectNum) {
              _this.$set(_this.editModalJson, 'isSelectAll', true);
            } else {
              _this.$set(_this.editModalJson, 'isSelectAll', false);
            }

            //config数据转换
            if (!isSearch) {
              _this.searchValueList = _this.getSearchValueList(_this.editModalJson.searchColumnDetailList, _this.config.sourceColumnList, _this.config.filterList);
            }
          }
        }).finally(() => {
          this.editModalLoading = false;
        });
    },

    //自定义数据源的时候添加行
    AddCustomTr(tr) {
      this.searchData([1], 'currentPage', true);
    },
    updateValue(arg, tduuid, truuid) {
      if (this.uuidValueConfig[truuid]) {
        this.uuidValueConfig[truuid][tduuid] = arg[0];
      } else {
        this.uuidValueConfig[truuid] = {};
        this.uuidValueConfig[truuid][tduuid] = arg[0];
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
    getEditType() {
      return key => {
        let json = {};
        this.config.dataConfig &&
          (json = this.config.dataConfig.find(item => {
            return item.uuid == key;
          }));
        return json.editType || '';
      };
    },
    getTdValue() {
      return (truuid, tduuid, tr) => {
        if (this.currentSelectUuidList[truuid]) {
          return this.currentSelectUuidList[truuid][tduuid];
        } else {
          return this.uuidValueConfig[truuid] ? this.uuidValueConfig[truuid][tduuid] : tr[tduuid] ? tr[tduuid].value : '';
        }
      };
    },
    getUrl() {
      return (th, tr) => {
        let url = '';
        let finditem = this.config.dataConfig.find(item => item.uuid == th.key);
        if (finditem && finditem.urlAttributeValue) {
          url = tr[finditem.urlAttributeValue] ? tr[finditem.urlAttributeValue].text : '';
        }
        return url;
      };
    }
  },
  watch: {
    showModal: function(val) {
      this.$emit('update:isShowModal', val);
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
