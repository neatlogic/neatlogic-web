<template>
  <div class="selectContent dataSource">
    <div class="formsetting-block">
      <label class="formsetting-label text-grey">数据源</label>
      <div class="formsetting-text bg-block">
        <RadioGroup v-model="setting.dataSource" class="col-2" @on-change="changeDataSource">
          <Radio label="static">静态数据源</Radio>
          <Radio label="matrix">矩阵数据源</Radio>
        </RadioGroup>
      </div>
    </div>

    <!-- start_静态数据源 -->
    <div v-if="setting.dataSource == 'static'" class="static-block formsetting-block">
      <div class="static-top formsetting-label text-grey label-switch">
        下拉选项
        <a
          href="javascript:void(0);"
          class="label-right text-href"
          style="top:0px;"
          @click="showBatchedit = true"
        >批量编辑</a>
      </div>
      <div v-if="level == 1" class="formsetting-text input-border bg-block">
        <DataList ref="dataList" :dataList="setting.dataList" @changeDefaultValue="changeDefaultValue(false)"></DataList>
      </div>

      <!-- 级联静态数据 -->
      <div v-else class="formsetting-text bg-block">
        <Tabs v-model="tabValue" :animated="false" @on-click="changeTab">
          <TabPane v-if="level >= 1" label="一级" name="level1">
            <DataList
              v-if="level >= 1"
              ref="dataList"
              :dataList="setting.dataList"
              :level="1"
            ></DataList>
          </TabPane>

          <TabPane v-if="level >= 2" label="二级" name="level2">
            <div class="formsetting-block">
              <label class="formsetting-label text-grey">一级选项</label>
              <div class="formsetting-text">
                <TsFormSelect
                  v-model="leveValue1"
                  :dataList="setting.dataList"
                  :transfer="true"
                  @on-change="changeChild(leveValue1, 2, 2)"
                ></TsFormSelect>
              </div>
            </div>
            <DataList
              v-if="leveValue1"
              ref="dataList"
              :dataList="childDataList"
              :level="level"
            ></DataList>
          </TabPane>

          <TabPane v-if="level >= 3" label="三级" name="level3">
            <div class="formsetting-block">
              <label class="formsetting-label text-grey">一级选项</label>
              <div class="formsetting-text">
                <TsFormSelect
                  v-model="leveValue1"
                  :dataList="setting.dataList"
                  :transfer="true"
                  @on-change="changeChild(leveValue1, 1, 3)"
                ></TsFormSelect>
              </div>
            </div>
            <div v-if="leveValue1" class="formsetting-block">
              <label class="formsetting-label text-grey">二级选项</label>
              <div class="formsetting-text">
                <TsFormSelect
                  v-model="leveValue2"
                  :dataList="level2List"
                  :transfer="true"
                  @on-change="changeChild(leveValue2, 2, 3)"
                ></TsFormSelect>
              </div>
            </div>
            <DataList
              v-if="leveValue2"
              ref="dataList"
              :dataList="childDataList"
              :level="level"
            ></DataList>
          </TabPane>
        </Tabs>
      </div>
    </div>
    <!-- end_静态数据源 -->
    
    <!-- start_矩阵数据源 -->
    <div v-else-if="setting.dataSource == 'matrix'">
      <div class="formsetting-block">
        <label class="formsetting-label text-grey require-label label-switch">矩阵
          <span class="label-right" style="top: 0px;">
            <i
              v-if="setting.matrixUuid"
              class="tsfont-edit text-tip-active"
              title="编辑选中数据源"
              @click="$utils.matrixDataSourceRedirect(setting.matrixUuid, dataSourceJson)"
            ></i>
            <i class="tsfont-refresh text-tip-active" title="刷新数据源" @click="refreshDataSource()"></i>
          </span>
        </label>
        <div class="formsetting-text">
          <TsFormSelect
            ref="matrixUuid"
            v-model="setting.matrixUuid"
            v-bind="matrixJson"
            :validateList="validJson"
            :transfer="true"
            :selectItemList.sync="dataSourceJson"
            @on-change="changeMatrix()"
          >
            <template v-slot:first-ul>
              <li class="tsfont-plus text-href first-slot" @click="$utils.matrixDataSourceRedirect()">数据源</li>
            </template>
            <template v-slot:option="{item}">
              <div>{{ item[matrixJson.textName] }}<span v-if="item.type" class="text-grey cen-align">({{ item.type }})</span></div>
            </template>
          </TsFormSelect>
        </div>
      </div>
      <div v-if="level == 1 && setting.matrixUuid" class="formsetting-block">
        <label class="formsetting-label text-grey">字段映射</label>
        <div class="formsetting-text bg-block">
          <DataMapping
            ref="dataMapping1"
            :mapping="setting.mapping"
            :dataList="mappingDataList"
            @changeDefaultValue="changeDefaultValue(false)"
          ></DataMapping>
        </div>
      </div>
      <div v-if="level == 1 && setting.matrixUuid && dataSourceJson && dataSourceJson.type" class="formsetting-block">
        <label class="formsetting-label text-grey">过滤条件</label>
        <div class="formsetting-text bg-block">
          <template v-if="filterItems[setting.matrixType + 'Filter']">
            <component
              :is="setting.matrixType + 'Filter'"
              :dataList="mappingDataList"
              :value="filterList"
              @change="changeFilterList"
            ></component>
          </template>
          <template v-else>
            <DataFilter
              v-model="setting.sourceColumnList"
              :dataList="mappingDataList"
              :matrixUuid="setting.matrixUuid"
              :matrixType="setting.matrixType"
            ></DataFilter>
          </template>
        </div>
      </div>
      <!--级联字段映射  -->

      <div v-if="level > 1 && setting.matrixUuid" class="formsetting-block">
        <label class="formsetting-label text-grey label-switch">字段映射</label>
        <div v-if="level > 1" class="formsetting-text bg-block">
          <Tabs :value="tabMappingValue" :animated="false">
            <TabPane v-if="level >= 1" label="一级映射" name="mapping1">
              <DataMapping
                ref="dataMapping1"
                :mapping="setting.mapping[0]"
                :dataList="mappingDataList"
                @changeDefaultValue="changeDefaultValue(1)"
              ></DataMapping>
            </TabPane>
            <TabPane v-if="level >= 2" label="二级映射" name="mapping2">
              <DataMapping
                ref="dataMapping2"
                :mapping="setting.mapping[1]"
                :dataList="mappingDataList"
                @changeDefaultValue="changeDefaultValue(2)"
              ></DataMapping>
            </TabPane>
            <TabPane v-if="level >= 3" label="三级映射" name="mapping3">
              <DataMapping
                ref="dataMapping3"
                :mapping="setting.mapping[2]"
                :dataList="mappingDataList"
                @changeDefaultValue="changeDefaultValue(3)"
              ></DataMapping>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </div>
    <!-- end_矩阵数据源 -->
    <!-- 批量编辑模态框 -->
    <TsDialog
      type="modal"
      :isShow.sync="showBatchedit"
      height="450px"
      title="批量导入数据"
      @on-ok="confirmBatchedit"
    >
      <p class="text-grey">1、每一行代表一个选项,且每一行的值不可以重复；<br>2、值和显示文案用“,”分隔，可以只有值，显示文案会自动补充；<br>3、符号“-”代表层级关系，禁止在层级关系之外使用这个字符;<br>4、数组长度不可大于500</p>
      <batchData ref="divBatchData" :jsonList="setting.dataList" :level="level"></batchData>
    </TsDialog>
  </div>
</template>
<script>
import batchData from './batchData';
import DataList from './dataList';
import DataMapping from './dataMapping';
import DataFilter from './dataFilter';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import filterItems from './dataFilter/filters.js';
let _this;
export default {
  name: 'DataSource',
  components: {
    batchData,
    TsFormSelect,
    DataList,
    DataMapping,
    DataFilter,
    ...filterItems
  },
  props: {
    setting: Object,
    uuid: String,
    level: {
      type: [Number, String],
      default: 1
    }
  },

  data() {
    let _this = this;
    return {
      dataSourceJson: null, //选中数据源的object数据
      showBatchedit: false, //是否显示批量编辑弹窗
      validJson: ['required'],
      childDataList: [],
      level2List: [],
      leveValue1: '',
      leveValue2: '',
      tabValue: 'level1',
      tabMappingValue: 'mapping1',
      matrixJson: {
        dynamicUrl: '/api/rest/matrix/search',
        rootName: 'tbodyList',
        textName: 'name',
        valueName: 'uuid',
        validateList: ['required'],
        errorMessage: ''
      },
      mappingDataList: [],
      filterList: [],
      filterItems: filterItems
    };
  },
  created() {},
  mounted() {
    this.$nextTick(function() {
      this.initLevel(); //当矩阵的值存在时，需要初始化数据
    });
  },
  destroyed() {},
  methods: {
    confirmBatchedit() {
      //保存批量编辑 同时对数据进行校验
      let strArray = this.$refs.divBatchData && this.$refs.divBatchData.getValue ? this.$refs.divBatchData.getValue() : false;
      if (strArray === false) {
        return;
      }
      this.setting.dataList = strArray.length ? strArray : [{ value: '', text: '' }];
      this.showBatchedit = false;
      if (this.tabValue == 'level2' && this.leveValue1) {
        this.changeChild(this.leveValue1, 2, 2);
      } else if (this.tabValue == 'level3' && this.leveValue2) {
        this.changeChild(this.leveValue2, 2, 3);
      } else if (this.tabValue == 'level3' && this.leveValue1) {
        this.changeChild(this.leveValue1, 1, 3);
      }
      this.$emit('changeDefaultValue');
    },
    changeDataSource() {
      //改变数据源
      this.setting.matrixUuid = '';
      this.changeMapping();
      this.setting.dataSource == 'static' ? (this.setting.dataList = [{ value: '', text: '' }]) : (this.setting.dataList = []);
      this.$emit('changeDefaultValue');
      this.$set(this.setting, 'ruleList', []);
      this.$set(this.setting, 'sourceColumnList', []);
    },
    changeMapping() {
      this.level == 1 && (this.setting.mapping = { value: '', text: '' });
      this.level == 2 &&
        (this.setting.mapping = [
          { value: '', text: '' },
          { value: '', text: '' }
        ]);
      this.level == 3 &&
        (this.setting.mapping = [
          { value: '', text: '' },
          { value: '', text: '' },
          { value: '', text: '' }
        ]);
    },
    changeTab(val) {
      //切换tab触发方法
      this.leveValue1 = '';
      this.leveValue2 = '';
    },
    changeChild(value, changelevel, level) {
      //当值发生变化时
      let _this = this;
      if (level == 2 && value) {
        let json = this.setting.dataList.find(item => item.value == value);
        !json.hasOwnProperty('children') && this.$set(json, 'children', [{ value: '', text: '' }]);
        _this.childDataList = json.children;
      } else if (level == 3 && value) {
        if (changelevel == 1) {
          _this.childDataList = [];
          let json1 = this.setting.dataList.find(item => item.value == value);
          !json1.hasOwnProperty('children') && this.$set(json1, 'children', []);
          this.level2List = json1.children;
          this.leveValue2 = '';
        } else if (changelevel == 2) {
          let json2 = this.level2List.find(item => item.value == value);
          !json2.hasOwnProperty('children') && this.$set(json2, 'children', [{ value: '', text: '' }]);
          _this.childDataList = json2.children;
        }
      }
    },
    changeMatrixValid(refresh) {
      //refresh代表刷新操作，这个时候不需要清空值
      let _this = this;
      this.$api.framework.matrix.getMatrixAttributeByUuid({ matrixUuid: _this.setting.matrixUuid }).then(res => {
        if (res.Status == 'OK') {
          _this.mappingDataList = res.Return.tbodyList || [];
        }
      }).catch(error => {
        this.$Notice.error({ title: error.data.Message });
      });
    },
    changeMatrix(refresh) { //用来校验矩阵的有效性
      let _this = this;
      if (!refresh) {
        this.changeMapping();
        this.$set(this.setting, 'ruleList', []);
      }
      this.$emit('changeDefaultValue', null, refresh);
      this.$set(this.setting, 'sourceColumnList', []);
      if (_this.setting.matrixUuid) {
        let headers = {'neatlogic-validfield': 'matrixUuid'};
        this.$api.framework.matrix.getMatrixAttributeByUuid({ matrixUuid: _this.setting.matrixUuid }, {headers: headers}).then(res => {
          if (res.Status == 'OK') {
            _this.matrixJson.errorMessage = '';
            _this.changeMatrixValid(refresh);
          }
        }).catch(error => {
          _this.matrixJson.errorMessage = error;
          _this.mappingDataList = [];
        });
      } else {
        this.mappingDataList = [];
      }
      this.$forceUpdate();
    },
    changeDefaultValue(level) {
      this.$emit('changeDefaultValue', level);
    },
    initLevel() {
      //当同个插件切换时，导致层级关系没有变化
      let _this = this;
      this.leveValue1 = '';
      this.tabValue = 'level1';
      this.tabMappingValue = 'mapping1';
      this.childDataList = [];
      this.setting.matrixUuid &&
        this.$api.framework.matrix
          .getMatrixAttributeByUuid({ matrixUuid: _this.setting.matrixUuid })
          .then(res => {
            if (res.Status == 'OK') {
              _this.mappingDataList = res.Return.tbodyList || [];
              let type = res.Return.type || '';
              _this.getFilterList(type);
            }
          });
    },
    refreshDataSource() {
      //刷新数据源
      this.matrixJson.dynamicUrl = '/api/rest/matrix/search?refuuid' + this.$utils.setUuid();
      this.changeMatrix(true);
      this.$Message.success('刷新成功');
    },
    validComponent() {
      let _this = this;
      let componet = [{ ref: 'matrixUuid', message: '矩阵数据源:不可为空' }];
      let validList = [];
      componet.forEach(item => {
        _this.$refs[item.ref] && !_this.$refs[item.ref].valid() && validList.push('矩阵数据源:' + _this.$refs[item.ref].validMesage);
      });
      //当数据源选择静态数据源时
      if (_this.setting.dataSource == 'static') {
        if (this.level == 1) {
          _this.$refs.dataList && validList.push.apply(validList, _this.$refs.dataList.validComponent());
        } else if (this.level > 1) {
          let dataListValid = validDataList(_this.setting.dataList, '', _this.setting.mapping);
          _this.setting.dataList && validList.push.apply(validList, dataListValid);
          _this.$refs.dataList && dataListValid.length > 0 && _this.$refs.dataList.validComponent();
        }
      } else if (_this.setting.dataSource == 'matrix' && this.level > 1) {
        let hasSame = false;
        this.setting.mapping.forEach((item, i) => {
          item.value &&
            !hasSame &&
            this.setting.mapping.forEach((json, j) => {
              if (item.value == json.value && i != j) {
                hasSame = true;
              }
            });

          !item.value && validList.push('字段映射:层级' + (i + 1) + ',值不能为空');
          !item.text && validList.push('字段映射:层级' + (i + 1) + ',显示文字不能为空');
        });
        hasSame && validList.push('字段映射:层级之间值不能相同');
        for (let i = 1; i <= _this.level; i++) {
          _this.$refs['dataMapping' + i] && _this.$refs['dataMapping' + i].validComponent();
        }
      } else if (_this.setting.dataSource == 'matrix' && this.level == 1) {
        _this.$refs.dataMapping1 && validList.push.apply(validList, _this.$refs.dataMapping1.validComponent());
      }
      return validList;
    },
    getFilterList(type) {
      let list = [];
      if (type == 'cmdbci') {
        this.setting.attrFilterList && list.push(...this.setting.attrFilterList);
        this.setting.relFilterList && list.push(...this.setting.relFilterList);
      }
      this.filterList = list;
    },
    changeFilterList(list) {
      let attrFilterList = [];
      let relFilterList = [];
      if (list && list.length > 0) {
        list.forEach(item => {
          if (item.uuid) {
            let obj = Object.assign({}, item);
            if (item.direction) {
              relFilterList.push(obj);
            } else {
              attrFilterList.push(obj);
            }
          }
        });
      }
      this.$set(this.setting, 'attrFilterList', attrFilterList);
      this.$set(this.setting, 'relFilterList', relFilterList);
    }
  },
  computed: {
  },
  watch: {
    uuid: function() {
      this.initLevel(); //当矩阵的值存在时，需要初始化数据
    },
    dataSourceJson: {
      handler: function(val) {
        if (val) {
          Object.assign(this.setting, {
            matrixType: val.type || ''
          });
        }
      },
      deep: true,
      immediate: true
    }
  }
};

function getDefaultValue(list, value, index) {
  //判断是否有重复数据
  let isDefaultValue = true;
  for (let i = 0; i < list.length; i++) {
    if (typeof index != 'undefined' && index != i && list[i].value == value) {
      isDefaultValue = false;
      break;
    } else if (typeof index == 'undefined' && list[i].value == value) {
      isDefaultValue = false;
      break;
    }
  }
  return isDefaultValue;
}
function validDataList(dataList, parent) {
  let validList = [];
  let hasNull = false;
  if (!dataList) {
    return validList;
  }
  for (let a = 0; a < dataList.length;) {
    let item = dataList[a];
    item.index = parent ? (parent.index + 1) : 1;
    if (item.index > 1 && item.value == '' && item.text == '') { //其他层级可以两个同时为空
      dataList.length > 1 && dataList.splice(a, 1);
      if (dataList.length == 1) {
        break;
      }
      continue;
    }
    if (item.value == '' && !hasNull) {
      hasNull = true;
      validList.push('静态数据源：' + item.index + '级值为' + (parent ? parent.text : '') + '的子集，值不可以为空');
    }
    if (item.text == '' && !hasNull) {
      hasNull = true;
      validList.push('静态数据源：' + item.index + '级值为' + (parent ? parent.text : '') + '的子集，显示值不可以为空');
    }
    if (item.isDefaultValue) {
      //默认选中数据处理
      val.push(item.value);
    }
    item.children && validList.push.apply(validList, validDataList(item.children, item));
    a++;
  }
  return validList;
}

</script>
<style lang="less" scope>
.dataSource {
  .static-block {
    .text-right {
      text-align: right;
    }
    .static-title {
      padding-right: 70px;
      opacity: 0.6;
    }
    .dataSource-ul {
      list-style: none;
      > li {
        position: relative;
        padding-right: 70px;
        margin-bottom: 8px;
        .span-btn {
          width: 20px;
          height: 28px;
          line-height: 28px;
          text-align: center;
          position: absolute;
          top: 2px;
          right: 0;
          cursor: ns-resize;
          vertical-align: middle;
          &.btn-add {
            right: 40px;
            cursor: pointer;
          }
          &.btn-remove {
            right: 20px;
            cursor: pointer;
          }
        }
      }
    }
  }
}
.cen-align{
  vertical-align: baseline;
  margin-left: 3px;
}
</style>
