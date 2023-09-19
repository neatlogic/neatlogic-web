<template>
  <div>
    <div>
      <div class="clearfix searchBox">
        <div v-if="dataCount" class="datacount"><span class="text-grey">{{ $t('page.datacapacity') }}</span><span class="ml-xs">{{ dataCount == dataLimit ? dataLimit - 1 + '+' : dataCount }}</span></div>
        <div class="search">
          <div v-if="!isAdvancedSearch" class="displayinline">
            <TsFormInput
              v-model="searchParam.keyword"
              border="border"
              :width="400"
              :placeholder="$t('page.keyword')"
              @on-enter="searchCustomViewData()"
            ></TsFormInput>
          </div>
          <div v-if="!isAdvancedSearch" class="displayinline marl10">
            <Button type="primary" class="mr-md" @click="searchCustomViewData()">{{ $t('page.search') }}</Button>
            <Button
              v-download="exportUrl()"
              type="primary"
              ghost
              :loading="isExporting"
              :disabled="isExporting"
            >{{ $t('page.export') }}</Button>
          </div>
          <div v-if="attrList && attrList.length > 0" class="advancedSearch">
            <span @click="isAdvancedSearch = !isAdvancedSearch">
              {{ $t('page.advancesearch') }}
              <i :class="isAdvancedSearch ? 'tsfont-drop-up' : 'tsfont-drop-down'"></i>
            </span>
          </div>
        </div>
      </div>
      <div v-if="isAdvancedSearch">
        <Card
          v-if="attrList && attrList.length > 0"
          dis-hover
          style="margin-bottom: 10px"
          class="radius-md"
        >
          <TsRow>
            <Col v-for="(attr, index) in searchAttrList" :key="index" span="12">
              <TsRow class="search-item">
                <Col span="6" class="search-label text-grey">{{ attr.alias }}</Col>
                <Col span="6" class="search-expression">
                  <TsFormSelect
                    v-if="attr.attrVo"
                    :transfer="true"
                    :value="attrFilterList['attr_' + attr.uuid] && attrFilterList['attr_' + attr.uuid]['expression']"
                    :dataList="attr.attrVo.expressionList"
                    @change="
                      (vals, opts) => {
                        setAttrData(attr, 'expression', opts);
                      }
                    "
                  ></TsFormSelect>
                  <TsFormSelect
                    v-else
                    :transfer="true"
                    :value="attrFilterList['constattr_' + attr.uuid] && attrFilterList['constattr_' + attr.uuid]['expression']"
                    :dataList="constAttrExpressionList"
                    @change="
                      (vals, opts) => {
                        setConstAttrData(attr, 'expression', opts);
                      }
                    "
                  ></TsFormSelect>
                </Col>
                <Col v-if="!attrConditionHideData[attr.uuid]" span="12" class="search-condition">
                  <AttrSearcher
                    v-if="attr.attrVo"
                    ref="attrHandler"
                    :attrData="attr.attrVo"
                    :valueList="attrFilterList['attr_' + attr.uuid] && attrFilterList['attr_' + attr.uuid]['valueList']"
                    @setData="
                      (val, actualValue) => {
                        setAttrData(attr, 'value', { value: val, actualValue: actualValue });
                      }
                    "
                  ></AttrSearcher>
                  <TsFormInput
                    v-else
                    @change="
                      val => {
                        setConstAttrData(attr, 'value', { value: val, actualValue: val });
                      }
                    "
                  ></TsFormInput>
                </Col>
              </TsRow>
            </Col>
          </TsRow>
          <div style="text-align: right" class="mt-md">
            <Button type="primary" class="mr-md" @click="searchCustomViewData()">{{ $t('page.search') }}</Button>
            <Button
              v-download="exportUrl()"
              type="primary"
              ghost
              :loading="isExporting"
              :disabled="isExporting"
            >{{ $t('page.export') }}</Button>
          </div>
        </Card>
      </div>
    </div>

    <div v-if="groupList && groupList.length > 0">
      <span class="text-grey">{{ $t('page.group') }}：</span>
      <Tag
        v-for="(group, index) in groupList"
        :key="index"
        closable
        @on-close="removeGroup(index)"
      >{{ group.alias }}</Tag>
    </div>
    <div ref="table">
      <TsTable
        v-if="viewData"
        v-bind="viewData"
        :showPager="false"
        :hideAction="false"
        :height="tableHeight"
      >
        <template v-for="(head, index) in viewData.theadList" :slot="head.key" slot-scope="{ row }">
          <div v-if="row[head.key] && row[head.key].length > 0" :key="index">
            <span v-for="(v, vindex) in row[head.key]" :key="vindex">{{ v }}</span>
          </div>
        </template>
        <template slot="id" slot-scope="{ row }">
          <div>
            <div v-if="!row._isPager">
              <span v-if="row._isGroup" :style="row._filterList ? 'padding-left:' + row._filterList.length * 8 + 'px' : ''">
                <i :class="!row._hasChild ? 'tsfont-right' : 'tsfont-down'" style="cursor: pointer" @click="showChild(row)"></i>
                <span class="text-grey">{{ row._attrAlias }}：</span>
                <span>{{ row._value }}</span>
                <span>（{{ row._count }}）</span>
              </span>
              <span v-else :style="row._filterList ? 'padding-left:' + (row._filterList.length * 8 + 8) + 'px' : ''">
                <a href="javascript:void(0)" @click="toViewDetail(row)">{{ row.id }}</a>
              </span>
            </div>
            <div v-else>
              <span
                class="text-grey"
                style="cursor: pointer"
                :style="row._filterList ? 'padding-left:' + (row._filterList.length * 8 + (row._pagerMode == 'normal' ? 8 : 0)) + 'px' : ''"
                @click="showMoreData(row)"
              >再显示{{ searchParam.pageSize }}条</span>
            </div>
          </div>
        </template>
        <template slot="action" slot-scope="{ row }">
          <div v-if="!row._isGroup && !row._isPager" class="tstable-action">
            <ul class="tstable-action-ul">
              <li class="icon tsfont-file-single" @click.stop="toViewDetail(row)">{{ $t('page.detail') }}</li>
            </ul>
          </div>
        </template>
      </TsTable>
    </div>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    AttrSearcher: resolve => require(['../cientity/attr-searcher.vue'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  directives: { download },
  props: {
    viewId: { type: Number }
  },
  data() {
    const _this = this;
    return {
      isExporting: false,
      searchParam: { id: _this.viewId, keyword: '', pageSize: 20, searchMode: 'normal' }, //视图查询参数
      viewData: { theadList: [], tbodyList: [] },
      tableHeight: 1000,
      dataCount: 0, //数据量
      dataLimit: 10000, //数据上限
      groupList: [],
      attrList: [], //属性列表,
      constAttrList: [], //内部属性列表
      attrFilterList: {}, //过滤条件列表
      constAttrFilterList: {}, //内部属性过滤条件列表
      attrConditionHideData: {}, //控制属性条件是否隐藏
      isAdvancedSearch: false,
      constAttrExpressionList: [
        { value: 'equal', text: this.$t('term.expression.eq') },
        { value: 'notequal', text: this.$t('term.expression.ne') },
        { value: 'like', text: this.$t('term.expression.like') },
        { value: 'notlike', text: this.$t('term.expression.notlike') }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchCustomViewData();
    this.getCustomViewAttr();
    this.setTableHeight();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    setTableHeight() {
      let tableHeight = window.innerHeight - (this.$refs.table ? this.$refs.table.getBoundingClientRect().top : 0);
      this.tableHeight = Math.max(tableHeight - 20 - 16, 40);
    },
    restoreHistory(historyData) {
      this.searchParam = historyData['searchParam'];
      this.groupList = historyData['groupList'];
      this.attrFilterList = historyData['attrFilterList'];
      this.constAttrFilterList = historyData['constAttrFilterList'];
      this.isAdvancedSearch = historyData['isAdvancedSearch'];
    },
    toViewDetail(row) {
      this.$router.push({ path: '/view-detail/' + this.viewId + '/' + row.id });
    },
    setConstAttrData(constattr, type, value) {
      if (!this.attrFilterList['constattr_' + constattr.uuid]) {
        this.attrFilterList['constattr_' + constattr.uuid] = {};
        this.$set(this.attrFilterList['constattr_' + constattr.uuid], 'attrUuid', constattr.uuid);
        this.$set(this.attrFilterList['constattr_' + constattr.uuid], 'alias', constattr.alias);
      }
      if (type == 'value') {
        const valObj = value;
        this.$set(this.attrFilterList['constattr_' + constattr.uuid], 'valueList', [valObj.value]);
        this.$set(this.attrFilterList['constattr_' + constattr.uuid], 'actualValueList', [valObj.actualValue]);
      } else if (type == 'expression') {
        const opt = value;
        this.$set(this.attrFilterList['constattr_' + constattr.uuid], 'expression', opt.value);
        this.$set(this.attrFilterList['constattr_' + constattr.uuid], 'expressionText', opt.text);
      }
    },
    setAttrData(attr, type, value) {
      if (!this.attrFilterList['attr_' + attr.uuid]) {
        this.attrFilterList['attr_' + attr.uuid] = {};
        this.$set(this.attrFilterList['attr_' + attr.uuid], 'attrUuid', attr.uuid);
        this.$set(this.attrFilterList['attr_' + attr.uuid], 'alias', attr.alias);
      }
      if (type == 'value') {
        const valObj = value;
        if (attr.attrVo.targetCiId) {
          //由于视图已经将id都转换成名字，所以需要直接用名字去搜索，而不是用配置项id
          this.$set(this.attrFilterList['attr_' + attr.uuid], 'valueList', valObj.actualValue);
          this.$set(this.attrFilterList['attr_' + attr.uuid], 'actualValueList', valObj.actualValue);
        } else {
          this.$set(this.attrFilterList['attr_' + attr.uuid], 'valueList', valObj.value);
          this.$set(this.attrFilterList['attr_' + attr.uuid], 'actualValueList', valObj.actualValue);
        }
      } else if (type == 'expression') {
        const opt = value;
        this.$set(this.attrFilterList['attr_' + attr.uuid], 'expression', opt.value);
        this.$set(this.attrFilterList['attr_' + attr.uuid], 'expressionText', opt.text);
        if (opt.value == 'is-null' || opt.value == 'is-not-null') {
          //先判断值，不一样才修改，避免触发下拉框重复绑定
          if (!this.attrConditionHideData[attr.uuid]) {
            this.$set(this.attrConditionHideData, attr.uuid, true);
          }
        } else {
          if (this.attrConditionHideData[attr.uuid]) {
            this.$set(this.attrConditionHideData, attr.uuid, false);
          }
        }
      }
    },
    getCustomViewAttr() {
      this.$api.cmdb.customview.getCustomViewAttrByCustomViewId(this.viewId, 0).then(res => {
        this.attrList = res.Return.attrList;
        this.constAttrList = res.Return.constAttrList;
        this.viewData.theadList.push({ key: 'id', title: '#' });
        const theadList = [...this.attrList, ...this.constAttrList];
        theadList.sort((a, b) => {
          return a.sort - b.sort;
        });
        if (theadList && theadList.length > 0) {
          theadList.forEach(attr => {
            this.viewData.theadList.push({
              key: attr.uuid,
              title: attr.alias,
              click: row => {
                if (
                  !this.groupList.some(a => {
                    return a.uuid == row.key;
                  })
                ) {
                  this.groupList.push({ uuid: row.key, alias: row.title });
                  this.searchCustomViewData();
                }
              }
            });
          });
          this.viewData.theadList.push({ key: 'action', title: '' });
        }
      });
    },
    /*activeGroup(attr) {
      this.searchParam.searchMode = 'group';
      this.searchParam.groupBy = attr.uuid;
      this.searchCustomViewData();
      this.groupList.push(attr);
    },*/
    removeGroup(index) {
      this.groupList.splice(index, 1);
      this.searchCustomViewData();
    },
    showChild(row) {
      if (!row._hasChild) {
        this.searchCustomViewData(row);
        row._hasChild = true;
      } else {
        row._hasChild = false;
        this.viewData.tbodyList = this.viewData.tbodyList.filter(attr => {
          return (
            !attr._filterList ||
            !attr._filterList.some(f => {
              return f.uuid == row._group && f.value == row._uuid;
            })
          );
        });
        this.viewData.tbodyList.forEach((element, index) => {
          element._index = index;
        });
      }
    },
    showMoreData(row) {
      const index = row._index;
      //this.viewData.tbodyList.splice(row._index, 1);//先删掉更多按钮
      //this.viewData.tbodyList.forEach((element, index) => {
      //  element._index = index;
      //});
      this.searchCustomViewData(row);
      this.setTableHeight();
    },
    exportUrl() {
      const params = { id: this.viewId, searchMode: 'normal', attrFilterList: [] };
      params.keyword = this.searchParam.keyword;
      for (const key in this.attrFilterList) {
        const d = this.attrFilterList[key];
        if (d.attrUuid && d.expression) {
          params.attrFilterList.push({
            attrUuid: d.attrUuid,
            valueList: d.valueList,
            expression: d.expression,
            type: key.startsWith('constattr_') ? 'constattr' : 'attr'
          });
        }
      }
      return {
        url: '/api/binary/cmdb/customview/data/export',
        params: params,
        changeStatus: status => {
          if (status == 'start') {
            this.isExporting = true;
          } else if (status == 'success' || status == 'error') {
            this.isExporting = false;
          }
        }
      };
    },
    searchCustomViewData(parentData) {
      //重置分页，不然多次操作后会串数据
      this.searchParam.currentPage = 1;
      let valueFilterList = [];
      if (parentData) {
        if (parentData._filterList) {
          valueFilterList = this.$utils.deepClone(parentData._filterList);
        }
        if (parentData._group && parentData._uuid) {
          valueFilterList.push({ uuid: parentData._group, value: parentData._uuid });
        }
      }
      this.loadingShow = true;
      this.searchParam.attrFilterList = [];
      for (const key in this.attrFilterList) {
        const d = this.attrFilterList[key];
        if (d.attrUuid && d.expression) {
          this.searchParam.attrFilterList.push({
            attrUuid: d.attrUuid,
            valueList: d.valueList,
            expression: d.expression,
            type: key.startsWith('constattr_') ? 'constattr' : 'attr'
          });
        }
      }
      if (!parentData) {
        this.searchParam.valueFilterList = [];
        if (this.groupList.length > 0) {
          this.searchParam.searchMode = 'group';
          this.searchParam.groupBy = this.groupList[0].uuid;
        } else {
          this.searchParam.searchMode = 'normal';
          delete this.searchParam.groupBy;
        }
      } else {
        var joinIndex = parentData._index;
        this.searchParam.valueFilterList = valueFilterList;
        if (parentData._currentPage) {
          this.searchParam.currentPage = parentData._currentPage + 1;
        }
        if (!parentData._isPager) {
          let gindex = 0;
          for (let i = 0; i < this.groupList.length; i++) {
            const g = this.groupList[i];
            if (g.uuid == parentData._group) {
              gindex = i;
              break;
            }
          }
          if (gindex < this.groupList.length - 1) {
            this.searchParam.searchMode = 'group';
            this.searchParam.groupBy = this.groupList[gindex + 1].uuid;
          } else {
            this.searchParam.searchMode = 'normal';
            delete this.searchParam.groupBy;
          }
        } else {
          this.searchParam.searchMode = parentData._pagerMode;
          if (this.searchParam.searchMode == 'group') {
            this.searchParam.groupBy = parentData._pagerGroup;
          } else {
            delete this.searchParam.groupBy;
          }
        }
      }
      //保存历史信息
      this.$addHistoryData('searchParam', this.searchParam);
      this.$addHistoryData('groupList', this.groupList);
      this.$addHistoryData('attrFilterList', this.attrFilterList);
      this.$addHistoryData('isAdvancedSearch', this.isAdvancedSearch);
      this.$api.cmdb.customview.searchCustomViewData(this.searchParam).then(res => {
        this.loadingShow = false;
        let valueList = [];
        this.dataCount = res.Return.dataCount || 0;
        this.dataLimit = res.Return.dataLimit || 0;
        if (this.searchParam.groupBy) {
          res.Return.dataList.forEach((d, index) => {
            if (index < res.Return.pageSize) {
              valueList.push({
                _attrAlias: d.attrAlias,
                _value: d.value,
                _count: d.count,
                _filterList: d.filterList,
                _group: d.attrUuid,
                _uuid: d.valueHash,
                _isGroup: true
              });
            } else if (index == res.Return.pageSize) {
              valueList.push({
                _isPager: true,
                _pagerMode: 'group',
                _pagerGroup: this.searchParam.groupBy,
                _currentPage: res.Return.currentPage,
                _filterList: d.filterList
              });
            }
          });
        } else {
          res.Return.dataList.forEach((d, index) => {
            if (index < res.Return.pageSize) {
              valueList.push(d);
            } else if (index == res.Return.pageSize) {
              valueList.push({
                _isPager: true,
                _pagerMode: 'normal',
                _currentPage: res.Return.currentPage,
                _filterList: d._filterList
              });
            }
          });
        }
        if (typeof joinIndex == 'undefined') {
          this.viewData.tbodyList = valueList;
        } else {
          if (joinIndex < this.viewData.tbodyList.length - 1) {
            valueList.forEach((element, index) => {
              this.viewData.tbodyList.splice(joinIndex + 1 + index, 0, element);
            });
          } else {
            valueList.forEach((element, index) => {
              this.viewData.tbodyList.push(element);
            });
          }
          //如果是通过分页按钮进来的，需要删除分页按钮
          if (parentData && parentData._isPager) {
            this.viewData.tbodyList.splice(parentData._index, 1);
          }
        }
        //给所有数据增加下标
        this.viewData.tbodyList.forEach((element, index) => {
          element._index = index;
        });
        // console.log(JSON.stringify(this.viewData.tbodyList, null, 2));
      });
    }
  },
  filter: {},
  computed: {
    searchAttrList: function() {
      if ((this.attrList && this.attrList.length > 0) || (this.constAttrList && this.constAttrList.length > 0)) {
        const searchAttrList = [
          ...this.attrList.filter(attr => {
            return attr.attrVo && attr.attrVo.canSearch;
          }),
          ...this.constAttrList
        ];
        searchAttrList.sort((a, b) => {
          return a.sort - b.sort;
        });
        return searchAttrList;
      } else {
        return null;
      }
    }
  },
  watch: {
    isAdvancedSearch: {
      handler: function(val) {
        if (!val) {
          this.attrFilterList = [];
          this.searchCustomViewData();
        } else {
          this.$set(this.searchParam, 'keyword', '');
        }
      }
    }
  }
};
</script>
<style lang="less" scope>
.search-item {
  height: 40px;
  line-height: 38px;
  .search-label {
    text-align: right;
  }
}
.searchBox {
  position: relative;
  margin-bottom: 10px;
  height: 30px;
  .datacount {
    position: absolute;
    left: 0;
    line-height:30px;
  }
  .search {
    position: absolute;
    right: 0;
    .displayinline {
      display: inline-block;
    }
    .marl10 {
      margin-left: 10px;
    }
    .advancedSearch {
      display: inline-block;
      cursor: pointer;
      line-height: 30px;
      margin-left: 10px;
    }
  }
}
</style>
