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
        <Search
          :config="config"
          :searchColumnDetailList="editModalJson.searchColumnDetailList"
          :value="searchValueList"
          :filterList="config.filterList"
          :componentList="componentList"
          @changeConditionValue="changeConditionValue"
        ></Search>

        <!-- table数据显示 -->
        <div v-show="!editModalLoading">
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
                    :key="tbIndex"
                    style="cursor:pointer;"
                    @click="selectIndex(tbIndex, tr[uuidColumn])"
                  >
                    <td style="width:40px">
                      <Checkbox :value="tr._isSelected"></Checkbox>
                    </td>
                    <td v-for="(th, thIndex) in editModalJson.theadList" :key="thIndex">
                      <template v-if="th.type &&th.config">
                        <TdFormitem :setting="getConfig(tr,th)"></TdFormitem>
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
  </div>
</template>
<script>
import Search from './search';
import filtermixin from './filtermixin';
export default {
  name: 'FormdynamicList',
  components: {
    Search,
    TdFormitem: () => import('../integration/td-formitem.vue')
  },
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
      showModal: _this.isShowModal,
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
      searchValueList: []
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
      this.$emit('on-ok', this.currentSelectUuidList);
    },
    //选中一个
    selectIndex(index, uuid, val) {
      let isSelect = (this.editModalJson.tbodyList[index]._isSelected = !this.editModalJson.tbodyList[index]._isSelected);
      let _this = this;
      let selectNum = 0;
      this.editModalJson.tbodyList &&
        this.editModalJson.tbodyList.forEach(item => {
          let value = '';
          if (_this.config.uuidColumn) {
            value = item[_this.config.uuidColumn];
          } else {
            value = item.uuid.value;
          }
          if (typeof this.currentSelectUuidList[value] != 'undefined') {
            _this.$set(item, '_isSelected', true) && selectNum++;
          } else {
            _this.$set(item, '_isSelected', false);
          }
        });
      !isSelect && this.currentSelectUuidList[uuid] && delete this.currentSelectUuidList[uuid];
      selectNum == this.editModalJson.tbodyList.length ? (this.editModalJson.isSelectAll = true) : (this.editModalJson.isSelectAll = false);
      //扩展
      _this.editModalJson.theadList.forEach(th => {
        let item = _this.editModalJson.tbodyList[index][th.key] || {};
        if (isSelect) {
          if (_this.currentSelectUuidList[uuid]) {
            th.config && (_this.currentSelectUuidList[uuid][th.key] = item.hasOwnProperty('value') ? item.value : th.config.value);
          } else {
            _this.currentSelectUuidList[uuid] = {};
            th.config && (_this.currentSelectUuidList[uuid][th.key] = item.hasOwnProperty('value') ? item.value : th.config.value);
          }
        }
      });
    },
    //选中所有的数据
    selectAll() {
      let _this = this;
      this.editModalJson.tbodyList &&
        this.editModalJson.tbodyList.forEach((item, index) => {
          _this.$set(item, '_isSelected', this.editModalJson.isSelectAll);
          let uuid = null;
          if (_this.config.uuidColumn) {
            uuid = this.editModalJson.tbodyList[index][_this.config.uuidColumn];
          } else {
            uuid = this.editModalJson.tbodyList[index].uuid.value;
          }
          let isSelect = this.editModalJson.tbodyList[index]._isSelected;
          !isSelect && this.currentSelectUuidList[uuid] && delete this.currentSelectUuidList[uuid];
          _this.editModalJson.theadList.forEach(th => {
            let config = item[th.key] || {};
            if (isSelect) {
              if (_this.currentSelectUuidList[uuid]) {
                th.config && (_this.currentSelectUuidList[uuid][th.key] = config.hasOwnProperty('value') ? config.value : th.config.value);
              } else {
                _this.currentSelectUuidList[uuid] = {};
                th.config && (_this.currentSelectUuidList[uuid][th.key] = config.hasOwnProperty('value') ? config.value : th.config.value);
              }
            }
          });
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
        integrationUuid: this.config.integrationUuid,
        columnList: [],
        searchColumnList: [],
        currentPage: _this.editModalJson.currentPage,
        pageSize: _this.editModalJson.pageSize,
        arrayColumnList: [],
        sourceColumnList: []
      };
      _this.config.dataConfig &&
        _this.config.dataConfig.forEach((item) => {
          let isPC = item.hasOwnProperty('isPC') ? item.isPC : true;
          isPC && json.columnList.push(item.uuid);
          item.isSearch && json.searchColumnList.push(item.uuid);
        });

      if (json.columnList && json.columnList <= 0) {
        this.editModalJson.tbodyList = [];
        this.editModalLoading = false;
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
        _this.config.sourceColumnList && this.$set(json, 'sourceColumnList', _this.config.sourceColumnList);
      }
      //联动过滤
      if (_this.config.filterList) {
        this.$set(json, 'filterList', this.updateFilterList(_this.config.filterList));
      }
      this.$set(json, 'sourceColumnList', this.searchSourceColumnList(json.sourceColumnList, _this.config.filterList));

      //取消正在搜索的请求
      let cancel = this.cancelAxios;
      cancel && (this.cancelAxios = null) && cancel.cancel();

      const CancelToken = this.$https.CancelToken;
      this.cancelAxios = CancelToken.source();
      json.integrationUuid &&
        this.$https.post('/api/rest/integration/table/data/search', json, {
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
            //选中数据处理
            let selectNum = 0;
            _this.editModalJson.tbodyList &&
                _this.editModalJson.tbodyList.forEach(item => {
                  let value = '';
                  if (_this.config.uuidColumn) {
                    value = item[_this.config.uuidColumn];
                  } else {
                    value = item.uuid.value;
                  }

                  if (typeof _this.currentSelectUuidList[value] != 'undefined') {
                    _this.$set(item, '_isSelected', true) && selectNum++;
                  } else {
                    _this.$set(item, '_isSelected', false);
                  }
                });
            if (_this.editModalJson.tbodyList && _this.editModalJson.tbodyList.length == selectNum) {
              _this.$set(_this.editModalJson, 'isSelectAll', true);
            } else {
              _this.$set(_this.editModalJson, 'isSelectAll', false);
            }

            //config数据转换
            if (!isSearch) {
              _this.searchValueList = _this.getSearchValueList(_this.editModalJson.searchColumnDetailList, _this.config.sourceColumnList);
            }
            _this.editModalLoading = false;
          }
        });
    },
    getConfig(tr, th) {
      let resultJson = {};
      let json = {};
      this.config && this.config.dataConfig && (json = this.config.dataConfig.find(item => {
        return item.uuid == th.key;
      }));
      let truuid = tr[this.uuidColumn];
      if (json) {
        Object.assign(resultJson, th);
        let item = tr[th.key] || {};
        resultJson.item = item;
        resultJson.value = this.currentSelectUuidList && this.currentSelectUuidList[truuid] ? this.currentSelectUuidList[truuid][th.key] : item.hasOwnProperty('value') ? item.value : th.config.value;
        resultJson.disabled = true;
        if (item.dataList) {
          let dataList = item.dataList;
          resultJson.dataList = this.$utils.deepClone(dataList);
        }
      }

      return resultJson;
    }
  },
  filter: {},
  computed: {
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
