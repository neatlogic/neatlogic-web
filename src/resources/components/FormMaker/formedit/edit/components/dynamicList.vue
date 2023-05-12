<template>
  <div class="dynamicList-container">
    <!-- start_必填 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey label-switch">
        必填
        <i-switch v-model="setting.isRequired" class="label-right" />
      </label>
    </div>
    <div class="formsetting-block">
      <label class="formsetting-label text-grey label-switch">
        组件样式
      </label>
      <div class="formsetting-text bg-block">
        <RadioGroup v-model="setting.mode" class="col-3" @on-change="setting.needPage=false">
          <Radio label="dialog">弹窗显示</Radio>
          <Radio label="normal">直接显示</Radio>
        </RadioGroup>
      </div>
    </div>
    <div class="formsetting-block">
      <label class="formsetting-label text-grey">数据源</label>
      <div class="formsetting-text bg-block">
        <RadioGroup v-model="setting.dataSource" class="col-3" @on-change="changeDataSource">
          <Radio label="matrix">矩阵数据源</Radio>
          <Radio label="integration">集成数据源</Radio>
        </RadioGroup>
      </div>
    </div>
    <!-- end_必填 -->
    <template v-if="setting.dataSource == 'matrix'">
      <div class="formsetting-block">
        <label class="formsetting-label text-grey require-label label-switch">
          矩阵
          <span class="label-right" style="top: 0px;">
            <i
              v-if="setting.matrixUuid"
              class="tsfont-edit text-tip-active"
              title="编辑选中数据源"
              @click="$utils.matrixDataSourceRedirect(setting.matrixUuid, dataSourceJson)"
            ></i>
            <i class="ts-refresh text-tip-active" title="刷新数据源" @click="refreshDataSource()"></i>
          </span>
        </label>
        <div class="formsetting-text">
          <TsFormSelect
            ref="matrixUuid"
            v-model="setting.matrixUuid"
            v-bind="matrixJson"
            :selectItemList.sync="dataSourceJson"
            @change-label="changeMatrixLabel"
            @on-change="changeMatrix()"
          >
            <template v-slot:first-ul>
              <li class="tsfont-plus text-href first-slot" @click="$utils.matrixDataSourceRedirect()">数据源</li>
            </template>
            <template v-slot:option="{item}">
              <div>{{ item[matrixJson.textName] }}<span class="text-grey cen-align">({{ item.type }})</span></div>
            </template>
          </TsFormSelect>
        </div>
      </div>
      <div v-if="setting.dataConfig && setting.dataConfig.length > 0" class="formsetting-block">
        <label class="formsetting-label text-grey">
          矩阵属性
          <Poptip
            trigger="hover"
            content="勾选PC端/移动端需要展示或搜索的属性，搜索和显示列的显示互不影响"
            width="200"
            transfer
            word-wrap
          >
            <i class="ts-m-problem text-href" style="padding-left:3px;"></i>
          </Poptip>
        </label>
        <div class="formsetting-text tstable-container bg-block">
          <table class="dynamic-table tstable-body">
            <thead>
              <tr>
                <th>属性</th>
                <th v-show="carouselNumber == 1"><i class="tsfont-desktop" title="pc端显示列"></i></th>
                <th v-show="carouselNumber == 1"><i class="tsfont-phone" title="移动端显示列"></i></th>
                <th v-show="carouselNumber == 1"><i class="tsfont-search" title="搜索条件"></i></th>
                <th v-if="setting.type && setting.type == 'external' && carouselNumber == 1" class="require-label"><i class="tsfont-attribute" title="唯一属性不能为空"></i></th>
                <th v-show="carouselNumber == 1"></th>
                <th v-show="carouselNumber == 2">
                  二次编辑
                  <Poptip
                    trigger="hover"
                    content="当存在多值的情况下面，可以进行编辑重新选择一个或者多个值，唯一值不可进行第二次编辑"
                    width="200"
                    transfer
                    word-wrap
                  >
                    <i class="ts-m-problem text-href" style="padding-left:3px;"></i>
                  </Poptip>
                </th>
                <th v-show="carouselNumber == 2">类型</th>
                <th></th>
              </tr>
            </thead>
            <draggable
              v-if="setting.dataConfig && setting.dataConfig.length > 0"
              tag="tbody"
              :list="setting.dataConfig"
              handle=".tsfont-bar"
              ghost-class="li-active"
            >
              <tr v-for="(data, index) in setting.dataConfig" :key="index">
                <td class="text-grey">
                  <span class="attrName">{{ data.name }}</span>
                </td>
                <td v-show="carouselNumber == 1">
                  <Checkbox v-model="data.isPC"></Checkbox>
                </td>
                <td v-show="carouselNumber == 1">
                  <Checkbox v-model="data.isMobile"></Checkbox>
                </td>
                <td v-show="carouselNumber == 1">
                  <div v-if="data.isSearchable == 1">
                    <Checkbox v-model="data.isSearch"></Checkbox>
                  </div>
                  <span v-else>-</span>
                </td>
                <td v-if="setting.type && setting.type == 'external' && carouselNumber == 1">
                  <span class="radio-style border-color" :class="setting.uuidColumn && setting.uuidColumn == data.uuid ? 'active' : ''" @click="selectExternalUuid(data)"></span>
                </td>
                <td v-show="carouselNumber == 2">
                  <i-switch
                    v-if="setting.uuidColumn != data.uuid"
                    v-model="data.isEdit"
                    class="label-right"
                    @on-change="changeEdit(data)"
                  />
                  <span v-else>-</span>
                </td>
                <td v-show="carouselNumber == 2">
                  <TsFormSelect
                    v-if="setting.uuidColumn != data.uuid"
                    v-model="data.editType"
                    :disabled="!data.isEdit"
                    :dataList="editList"
                    :validateList="validateList"
                    :clearable="false"
                  ></TsFormSelect>
                  <span v-else>-</span>
                </td>
                <td><i class="ts-setting text-action" @click="openAttrSetting(data)"></i></td>
                <td><i class="tsfont-bar" title="拖动排序"></i></td>
              </tr>
            </draggable>
          </table>
          <!-- 外部矩阵 -->
          <div v-if="dataSourceJson && dataSourceJson.type == 'external'" style="text-align: center;">
            <span type="button" :class="['check-cricle', { active: carouselNumber == 1 }]" @click="changeCarousel(1)"></span>
            <span type="button" :class="['check-cricle', { active: carouselNumber == 2 }]" @click="changeCarousel(2)"></span>
          </div>
        </div>
      </div>
      <!-- 扩展 -->
      <div class="formsetting-block">
        <label class="formsetting-label text-grey label-switch">
          扩展属性
          <i-switch v-model="setting.extendAttributes" class="label-right" @on-change="changeExtendAttributes" />
        </label>
        <!-- start_显示格式 -->
        <div v-if="setting.extendAttributes" class="formsetting-block">
          <div class="formsetting-text bg-block">
            <table class="list-table">
              <thead>
                <tr>
                  <th class="text-grey require-label" nowrap>属性</th>
                  <th class="text-grey require-label" width="100px" nowrap>组件类型</th>
                  <th class="text-grey" nowrap>必填</th>
                  <th></th>
                </tr>
              </thead>
              <draggable
                v-if="setting.attributeList && setting.attributeList.length > 0"
                tag="tbody"
                class="dataSource-ul"
                :list="setting.attributeList"
                handle=".ts-bars"
                ghost-class="li-active"
              >
                <tr v-for="(attr, index) in setting.attributeList" :key="index">
                  <td>
                    <TsFormInput
                      ref="attribute"
                      v-model="attr.attribute"
                      type="text"
                      style="width:75px"
                      maxlength="50"
                      :validateList="attributeValid"
                      @on-blur="autocompleteText(attr, index)"
                    ></TsFormInput>
                  </td>
                  <td width="113px">
                    <TsFormSelect
                      v-model="attr.type"
                      width="100%"
                      style="display: inline-block;width:80px"
                      :dataList="typeList"
                      :validateList="validateList"
                      :clearable="false"
                      @on-change="changeType(index)"
                    ></TsFormSelect>
                    <i
                      class="ts-setting span-btn"
                      :class="{ 'form-error-tip': !!attr.valid_o }"
                      title="数据源设置"
                      @click="setAttrConfig(index)"
                    ></i>
                  </td>
                  <td class="td-check">
                    <Checkbox v-model="attr.isRequired"></Checkbox>
                  </td>
                  <td>
                    <span class="tsfont-plus-o span-btn" title="添加" @click="addAttr(index)"></span>
                    <span
                      v-if="setting.attributeList && setting.attributeList.length > 1"
                      class="tsfont-close-o span-btn"
                      title="删除"
                      @click="removeAttr(index)"
                    ></span>
                    <span v-if="setting.attributeList && setting.attributeList.length > 1" class="ts-bars span-btn" title="拖动"></span>
                  </td>
                </tr>
              </draggable>
            </table>
          </div>
        </div>
      <!-- end_显示格式 -->
      </div>
      <!-- 扩展end -->
      <div v-if="setting.mode=='normal'" class="formsetting-block">
        <label class="formsetting-label text-grey label-switch">
          分页
          <i-switch v-model="setting.needPage" class="label-right" @on-change="changeNeedPage" />
        </label>
      </div>
      <div v-if="setting.dataConfig && setting.dataConfig.length > 0 && (setting.mode=='dialog' || (setting.needPage && setting.mode=='normal'))" class="formsetting-block">
        <label class="formsetting-label text-grey require-label">每页显示条数</label>
        <div class="formsetting-text ">
          <TsFormInput
            ref="pageSize"
            v-model="setting.pageSize"
            type="number"
            :validateList="validJson"
          ></TsFormInput>
        </div>
      </div>
      <div v-if="setting.matrixUuid" class="formsetting-block">
        <label class="formsetting-label text-grey">过滤条件</label>
        <div class="formsetting-text bg-block">
          <template v-if="filterItems[setting.type + 'Filter']">
            <component
              :is="setting.type + 'Filter'"
              :dataList="tbodyList"
              :value="filterList"
              @change="changeFilterList"
            ></component>
          </template>
          <template v-else>
            <DataFilter
              v-model="setting.sourceColumnList"
              :dataList="setting.dataConfig"
              :matrixUuid="setting.matrixUuid"
              :matrixType="setting.matrixType"
            ></DataFilter>
          </template>
        </div>
      </div>
    </template>
    <template v-else-if="setting.dataSource == 'integration'">
      <IntegrationSetting ref="integrationData" :setting="setting"></IntegrationSetting>
    </template>
    <TsDialog
      type="modal"
      :isShow.sync="showDialog"
      :title="modalTitle"
      height="400px"
      @on-ok="okAttrConfig"
    >
      <DataSetting
        v-if="attrType == 'select' || attrType == 'selects' || attrType == 'radio' || attrType == 'checkbox'"
        ref="DataSetting"
        :setting="dialogConfig"
        :isMultiple="isMultiple"
      ></DataSetting>
      <TypeSetting
        v-else-if="attrType == 'text' || attrType == 'textarea' || attrType == 'date' || attrType == 'time'"
        ref="DataSetting"
        :setting="dialogConfig"
        :type="attrType"
      ></TypeSetting>
    </TsDialog>
    <AttrSetting
      v-if="isShowAttrSetting"
      :attributeDataList="setting.dataConfig"
      :currentConfig="currentConfig"
      @closeSetting="closeSetting"
    ></AttrSetting>
  </div>
</template>

<script>
import DataFilter from './dataSource/dataFilter.vue';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
import draggable from 'vuedraggable';
import IntegrationSetting from './integration/integration-setting.vue';
import filterItems from './dataSource/dataFilter/filters.js';
export default {
  name: 'FormdynamicList',
  components: { 
    TsFormSelect, 
    draggable, 
    TsFormInput, 
    DataFilter, 
    DataSetting: resolve => require(['./staticList/staticList-setting'], resolve),
    TypeSetting: resolve => require(['./staticList/staticList-type-setting'], resolve),
    IntegrationSetting,
    ...filterItems,
    AttrSetting: resolve => require(['./dynamicList/attr-setting'], resolve)
  },
  props: {
    uuid: String,
    setting: Object,
    controllerList: Array
  },
  data() {
    let _this = this;
    return {
      carouselNumber: 1,
      validJson: ['required', 'integer_p'],
      validateList: ['required'],
      dataSourceJson: null,
      matrixType: 'custom',
      matrixJson: {
        dynamicUrl: '/api/rest/matrix/search',
        rootName: 'tbodyList',
        textName: 'name',
        valueName: 'uuid',
        transfer: true,
        validateList: ['required']
      },
      editList: [
        { text: '下拉单选', value: 'select' },
        { text: '下拉多选', value: 'selects' }
      ],
      matrixConfig: {},
      typeList: [
        { text: '文本框', value: 'text' },
        { text: '文本域', value: 'textarea' },
        { text: '下拉单选', value: 'select' },
        { text: '下拉多选', value: 'selects' },
        { text: '单选框', value: 'radio' },
        { text: '复选框', value: 'checkbox' },
        { text: '日期', value: 'date' },
        { text: '时间', value: 'time' }
      ],
      attrType: null, //当前配置的类型
      attrIndex: null, //当前配置的属性index值
      isMultiple: false, //当前属性的类型是否是多选
      showDialog: false, //模态框显示
      modalTitle: '数据源设置',
      dialogConfig: null,
      attributeValid: ['required', 'non-special'],
      tbodyList: [],
      filterList: [], //过滤条件
      filterItems: filterItems,
      isShowAttrSetting: false,
      currentConfig: {}
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.$utils.isEmpty(this.setting.mode) && (this.setting.mode = 'dialog');
    this.$nextTick(function() {
      this.changeMatrix(true);
    });
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    changeCarousel(num) {
      this.carouselNumber = num;
    },
    changeMatrixLabel(label, json) {
      this.setting.matrixType = json.type;
    },
    changeMatrix(isInit) {
      //改变矩阵数据
      let _this = this;
      if (!isInit) {
        this.setting.dataConfig = [];
        this.setting.sourceColumnList = [];
        this.setting.filterList = [];
        this.setting.attrFilterList && (this.setting.attrFilterList = []);
        this.setting.relFilterList && (this.setting.relFilterList = []);
        this.$set(this.setting, 'uuidColumn', null);
        this.carouselNumber = 1;
      }
      
      if (_this.setting.matrixUuid) {
        this.tbodyList = [];
        this.$api.framework.matrix.getMatrixAttributeByUuid({ matrixUuid: _this.setting.matrixUuid }).then(res => {
          //获取矩阵的属性

          if (res.Status == 'OK') {
            let tbodyList = res.Return.tbodyList || [];
            this.tbodyList = tbodyList;
            let dataList = this.$utils.deepClone(tbodyList);
            let type = res.Return.type;
            this.$set(this.setting, 'type', type);
            let uuidList = [];
            //添加没有的数据
            dataList &&
              dataList.forEach(item => {
                uuidList.push(item.uuid);
                if (isInit && this.setting.dataConfig.length > 0) {
                  let hasItem = false;
                  this.setting.dataConfig.forEach(data => {
                    if (data.uuid == item.uuid) {
                      data.name = item.name;
                      data.isSearchable = item.isSearchable;
                      hasItem = true;
                      data.type = item.type || 'input';
                    }
                  });
                  !hasItem && this.setting.dataConfig.push({ uuid: item.uuid, name: item.name, isPC: true, isMobile: false, isSearch: false, isSearchable: item.isSearchable, type: item.type});
                } else {
                  this.setting.dataConfig.push({ uuid: item.uuid, name: item.name, isPC: true, isMobile: false, isSearch: false, isSearchable: item.isSearchable, type: item.type});
                }
              });
            if (isInit) {
              //删除没有的数据
              this.setting.dataConfig = this.setting.dataConfig.filter(data => {
                return uuidList.indexOf(data.uuid) >= 0;
              });
            }
            //如果唯一值没有则默认第一个是唯一值
            if (_this.setting.type && (_this.setting.type == 'external' || _this.setting.type == 'cmdbci') && !_this.setting.uuidColumn) {
              let findUuidConfig = dataList.find(u => u.primaryKey);
              if (findUuidConfig) {
                _this.setting.uuidColumn = findUuidConfig.uuid;
              } else {
                _this.setting.dataConfig.length > 0 && (_this.setting.uuidColumn = _this.setting.dataConfig[0].uuid);
              }
            }
            
            //cmdb矩阵
            if (type == 'cmdbci') {
              this.filterList = [];
              this.setting.attrFilterList && this.filterList.push(...this.setting.attrFilterList);
              this.setting.relFilterList && this.filterList.push(...this.setting.relFilterList);
            }
          }
        });
      }
    },
    refreshDataSource() {
      //刷新数据源
      this.matrixJson.dynamicUrl = '/api/rest/matrix/search?refuuid=' + this.$utils.setUuid();
      this.changeMatrix(true);
      this.$Message.success('刷新成功');
    },
    validComponent() {
      let _this = this;
      let componet = [
        { ref: 'pageSize', message: '分页：请填输入正整数' },
        { ref: 'matrixUuid', message: '矩阵：不能为空' }
      ];
      let validList = [];
      componet.forEach(item => {
        _this.$refs[item.ref] && !_this.$refs[item.ref].valid() && validList.push(item.message);
      });
      if (_this.setting.type && _this.setting.type == 'external') {
        if (!_this.setting.uuidColumn) {
          let uuidColumnMessage = '矩阵：唯一属性不能为空';
          validList.push(uuidColumnMessage);
        }
      }
      //扩展属性校验
      if (_this.setting.extendAttributes) {
        _this.$refs.attribute &&
        _this.$refs.attribute.forEach(item => {
          !item.valid() && validList.push('表头设置：请填写正确的属性设置');
        });
        let validType = ['select', 'selects', 'radio', 'checkbox'];
        if (_this.setting.attributeList && _this.setting.attributeList.length > 0) {
          _this.setting.attributeList.forEach(item => {
            !item.type && validList.push('表头设置：组件类型不能为空');
            if (validType.indexOf(item.type) >= 0) { //需要设置数据
              if (item.attrConfig.dataSource == 'static' && !(item.attrConfig.dataList && item.attrConfig.dataList.length > 0 && item.attrConfig.dataList[0].value != '')) {
                validList.push('属性' + item.attribute + '：数据源设置不能为空');
                item.valid_o = true;
              } else if (item.attrConfig.dataSource == 'matrix' && !item.attrConfig.matrixUuid) {
                validList.push('属性' + item.attribute + '：数据源设置不能为空');
                item.valid_o = true;
              }
            } else if (item.type == 'table') { //表格的校验
              if (!(item.attrConfig.attributeList && item.attrConfig.attributeList[0].attribute)) {
                validList.push('属性' + item.attribute + '：数据源设置不能为空');
              }
            }
          });
        } else {
          validList.push('表头设置：属性长度不能为空');
        }
      }
      //集成
      if (_this.$refs.integrationData && _this.$refs.integrationData.validComponent) {
        let list = _this.$refs.integrationData.validComponent();
        validList.push(...list);
      }
      return validList;
    },
    selectExternalUuid(item) {
      item.isEdit = false;
      item.editType = '';
      this.$set(this.setting, 'uuidColumn', item.uuid);
    },
    changeEdit(data) {
      if (data.isEdit) {
        data.editType = 'select';
      } else {
        data.editType = '';
      }
    },
    changeNeedPage() {
      this.setting.pageSize = 10;
    },
    //扩展属性
    autocompleteText(item, index) {
      //失焦后，如果属性名称相同则加一
      let value = item.attribute;
      if (value && !getDefaultValue(this.setting.attributeList, value, index)) {
        for (let a = 1; ; a++) {
          value = item.attribute + '_' + a;
          if (getDefaultValue(this.setting.attributeList, value)) {
            break;
          }
        }
      }
      item.attribute = value;
    },
    changeType(index) {
      //改变组件类型
      let config = this.setting.attributeList[index].attrConfig;
      let attrConfig = {
        dataSource: 'static',
        dataList: [{ value: '', text: '' }],
        mapping: { text: '', value: '' },
        matrixUuid: '',
        defaultValue: '',
        value: ''
      };
      let newConfig = null;
      let type = this.setting.attributeList[index].type;
      if (type == 'selects' || type == 'select' || type == 'radio' || type == 'checkbox') {
        //需要配置值之间的切换时
        newConfig = config;
        if (type == 'selects' || type == 'checkbox') {
          typeof newConfig.value == 'string' ? (newConfig.value == '' ? (newConfig.value = []) : (newConfig.value = [newConfig.value])) : '';
        } else if (type == 'select' || type == 'radio') {
          typeof newConfig.value == 'object' ? (newConfig.value = newConfig.value[0] || '') : '';
        }
      } else if (type == 'table') {
        newConfig = {attributeList: [{ attribute: '', type: 'text', isRequired: false, attrConfig: attrConfig }]};
      } else {
        newConfig = attrConfig;
      }
      this.setting.attributeList[index].attrConfig = newConfig;
    },
    setAttrConfig(index) {
      //设置属性配置值
      this.attrIndex = index;
      this.attrType = this.setting.attributeList[index].type;
      this.showDialog = true;
      this.dialogConfig = Object.assign({value: ''}, this.setting.attributeList[index].attrConfig);
      this.modalTitle = this.setting.attributeList[index].attribute + '数据源设置';
      let type = this.setting.attributeList[index].type;
      if (type == 'checkbox' || type == 'selects') {
        this.isMultiple = true;
      } else {
        this.isMultiple = false;
      }
    },
    addAttr(index) {
      //新增属性列表
      let _this = this;
      let config = {
        attribute: '',
        attributeUuid: this.$utils.setUuid(),
        type: 'text',
        isRequired: false,
        attrConfig: {
          dataSource: 'static',
          dataList: [{ value: '', text: '' }],
          mapping: { text: '', value: '' },
          matrixUuid: '',
          defaultValue: '',
          value: ''
        }
      };
      this.setting.attributeList.splice(index + 1, 0, config);
    },
    removeAttr(index) {
      //删除属性列表
      this.setting.attributeList.splice(index, 1);
    },
    okAttrConfig() {
      if (this.$refs.DataSetting.validComponent()) {
        this.showDialog = false;
        this.setting.attributeList[this.attrIndex].attrConfig = this.dialogConfig;
        this.setting.attributeList[this.attrIndex].valid_o = false;
      }
    },
    changeExtendAttributes(val) { //改变扩展属性
      this.setting.attributeList.splice(0);
      if (val) {
        this.addAttr(0);
      }
    },
    changeDataSource() {
      this.setting.dataConfig = [];
      this.setting.sourceColumnList = [];
      this.setting.filterList = [];
      this.setting.attrFilterList = [];
      this.setting.relFilterList = [];
      this.$set(this.setting, 'uuidColumn', null);
      this.carouselNumber = 1;
      this.setting.matrixUuid = '';
      this.setting.integrationUuid = '';
      this.setting.extendAttributes = false;
      this.setting.attributeList.splice(0);
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
    },
    openAttrSetting(data) {
      this.currentConfig = data;
      this.isShowAttrSetting = true;
    },
    closeSetting(needRefresh, value) {
      if (needRefresh) {
        this.setting.dataConfig.find(item => item.uuid == this.currentConfig.uuid);
        this.setting.dataConfig.forEach(item => {
          if (item.uuid == this.currentConfig.uuid) {
            value && this.$set(item, 'urlAttributeValue', value);
            !value && this.$delete(item, 'urlAttributeValue');
          }
        });
      }
      this.isShowAttrSetting = false;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
function getDefaultValue(list, value, index) {
  //判断是否有重复数据
  let isDefaultValue = true;
  for (let i = 0; i < list.length; i++) {
    if (typeof index != 'undefined' && index != i && list[i].attribute == value) {
      isDefaultValue = false;
      break;
    } else if (typeof index == 'undefined' && list[i].attribute == value) {
      isDefaultValue = false;
      break;
    }
  }
  return isDefaultValue;
}
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.dynamicList-container {
  .check-cricle {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 15px;
    display: inline-block;
    background: #8391a5;
    cursor: pointer;
    opacity: 0.3;
    &:hover {
      opacity: 0.5;
    }
    &.active {
      opacity: 1;
    }
  }
  .dynamic-table tbody,
  .dynamic-table thead,
  .dynamic-table th {
    background: transparent !important;
  }

  .dynamic-table {
    table-layout: fixed;
    .radio-style {
      cursor: pointer;
      display: inline-block;
      width: 16px;
      height: 16px;
      position: relative;
      top: 0;
      left: 0;
      border-radius: 50%;
      border: 1px solid;
      &.active {
        border-color: @primary-color !important;
        &::after {
          content: ' ';
          position: absolute;
          width: 8px;
          height: 8px;
          top: 3px;
          left: 3px;
          background-color: @primary-color;
          border-radius: 50%;
        }
      }
    }
    th {
      > i {
        font-size: 16px;
      }
    }
  }

  .dynamic-table td,
  .dynamic-table th,
  .tstable-container {
    border: none !important;
    overflow: inherit;
  }

  .tsfont-bar {
    cursor: move;
  }

  .attrName {
    max-width: 150px;
    display: block;
    word-break: break-all;
    overflow: hidden;
    text-overflow: ellipsis;
  }

}
.cen-align{
  vertical-align: baseline;
  margin-left: 3px;
}

.list-table {
  th {
    padding: 3px;
    font-weight: normal;
    text-align: left;
  }
  td {
    vertical-align: top;
    padding: 3px;
    .span-btn {
      padding: 2px 4px;
      cursor: pointer;
      font-size: 12px;
      line-height: 28px;
      height: 28px;
      display: inline-block;
    }
    &.td-check {
      padding-top: 8px;
      /deep/ .ivu-checkbox-checked .ivu-checkbox-inner:after {
        top: -2px;
        left: -2px;
      }
    }
  }
  .ivu-select-item {
    white-space: nowrap;
    word-break: keep-all;
  }
}
</style>
