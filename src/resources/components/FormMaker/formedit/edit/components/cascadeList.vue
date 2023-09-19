<template>
  <div>
    <!-- start_必填 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey label-switch">
        必填
        <i-switch v-model="setting.isRequired" class="label-right" />
      </label>
    </div>
    <!-- end_必填 -->

    <!-- start_类型 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey">类型</label>
      <div class="formsetting-text bg-block">
        <RadioGroup v-model="setting.levelType" class="col-2" @on-change="changeLevel">
          <Radio label="2">二级下拉</Radio>
          <Radio label="3">三级下拉</Radio>
        </RadioGroup>
      </div>
    </div>
    <!-- end_类型 -->

    <!-- start_组件布局 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey">组件布局</label>
      <div class="formsetting-text bg-block">
        <RadioGroup v-model="setting.direction" class="col-2">
          <Radio label="transverse">横向排列</Radio>
          <Radio label="portrait">纵向排列</Radio>
        </RadioGroup>
      </div>
    </div>
    <!-- end_组件布局 -->
    <dataSource
      ref="dataSource"
      :setting="setting"
      :level="setting.levelType"
      :uuid="uuid"
      @changeDefaultValue="setDefaultJson"
    ></dataSource>

    <!-- start_默认值 -->
    <div class="formsetting-block">
      <label class="formsetting-label text-grey">默认值</label>
      <div class="formsetting-text bg-block">
        <RadioGroup v-model="setting.defaultValueType" class="col-2" @on-change="changeDefaultValueType">
          <Radio label="self">自定义</Radio>
          <Radio label="quote">引用</Radio>
        </RadioGroup>
        <!-- 自定义组件 -->
        <div v-if="setting.defaultValueType == 'quote'" style="padding-top:14px">
          <!-- 引用 -->
          <TsFormSelect
            v-model="setting.quoteUuid"
            :dataList="getComponentList"
            transfer
            placeholder="请选择引用组件"
          ></TsFormSelect>
        </div>
      </div>
    </div>
    <!-- end_默认值 -->
    <div v-if="setting.defaultValueType == 'self'">
      <div class="formsetting-block">
        <label class="formsetting-label text-grey">一级下拉框</label>
        <div class="formsetting-text">
          <TsFormSelect
            v-if="setting.levelType >= 1"
            v-model="setting.defaultValueList[0]"
            :dataList="level1DataList"
            :showName="setting.dataSource == 'matrix' ? 'html' : 'text'"
            search
            transfer
            @on-change="changeDefault(setting.defaultValueList[0], 1)"
          ></TsFormSelect>
        </div>
      </div>
      <div v-if="setting.levelType >= 2 && setting.defaultValueList[0]" class="formsetting-block">
        <label class="formsetting-label text-grey">二级下拉框</label>
        <div class="formsetting-text">
          <TsFormSelect
            v-model="setting.defaultValueList[1]"
            :dataList="level2DataList"
            :showName="setting.dataSource == 'matrix' ? 'html' : 'text'"
            search
            transfer
            @on-change="changeDefault(setting.defaultValueList[1], 2)"
          ></TsFormSelect>
        </div>
      </div>
      <div v-if="setting.levelType >= 3 && setting.defaultValueList[0] && setting.defaultValueList[1]" class="formsetting-block">
        <label class="formsetting-label text-grey">三级下拉框</label>
        <div class="formsetting-text">
          <TsFormSelect
            v-model="setting.defaultValueList[2]"
            :dataList="level3DataList"
            :showName="setting.dataSource == 'matrix' ? 'html' : 'text'"
            search
            transfer
          ></TsFormSelect>
        </div>
      </div>
    </div>
    <div v-if="setting.placeholder" class="formsetting-block">
      <label class="formsetting-label text-grey">输入提示</label>
      <div class="formsetting-text bg-block">
        <div class="formsetting-block">
          <label class="formsetting-label text-grey inner-label">一级输入提示</label>
          <div class="formsetting-text">
            <TsFormInput v-model="setting.placeholder[0]" :maxlength="placeholderMaxlength"></TsFormInput>
          </div>
        </div>
        <div v-if="setting.levelType>1" class="formsetting-block">
          <label class="formsetting-label text-grey inner-label">二级输入提示</label>
          <div class="formsetting-text">
            <TsFormInput v-model="setting.placeholder[1]" :maxlength="placeholderMaxlength"></TsFormInput>
          </div>
        </div>
        <div v-if="setting.levelType>2" class="formsetting-block">
          <label class="formsetting-label text-grey inner-label">三级级输入提示</label>
          <div class="formsetting-text">
            <TsFormInput v-model="setting.placeholder[2]" :maxlength="placeholderMaxlength"></TsFormInput>
          </div>
        </div>
      </div>
    </div>
  </div>
  
</template>

<script>
import dataSource from './dataSource/dataSource.vue';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
export default {
  name: 'CascadeList',
  components: { dataSource, TsFormSelect, TsFormInput },
  props: {
    uuid: String,
    setting: Object,
    controllerList: Array
  },
  data() {
    return {
      level1DataList: [],
      level2DataList: [],
      level3DataList: [],
      placeholderMaxlength: 50
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.$nextTick(function() {
      this.initLevel();
    });
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    changeLevel(level) {
      if (level == 2) {
        this.setting.dataList.forEach(item => {
          item.children &&
            item.children.forEach(child => {
              this.$delete(child, 'children');
            });
        });
        this.setting.mapping.splice(2, 1);
        this.setting.defaultValueList.splice(2, 1);
      } else {
        this.setting.mapping.push({ value: '', text: '' });
        this.setting.defaultValueList.push('');
      }
    },
    changeDefaultValueType() {
      this.setting.defaultValueList = ['', ''];
      this.setting.quoteUuid = '';
      this.setting.levelType == 3 && (this.setting.defaultValueList = ['', '', '']);
    },
    changeDefault(val, level) {
      if (level == 1) {
        this.setting.defaultValueList[1] = '';
        this.setting.levelType == 3 && (this.setting.defaultValueList[2] = '');
        this.level3DataList = [];
        if (this.setting.dataSource == 'static') {
          this.level2DataList = this.setting.dataList.find(item => item.value == val);
          this.level2DataList && (this.level2DataList = this.level2DataList.children || []);
        } else if (this.setting.dataSource == 'matrix') {
          this.getLevelDataList(2);
        }
      } else if (level == 2) {
        this.setting.levelType == 3 && (this.setting.defaultValueList[2] = '');
        if (this.setting.dataSource == 'static') {
          this.level3DataList = this.level2DataList ? this.level2DataList.find(item => item.value == val) : [];
          this.level3DataList && (this.level3DataList = this.level3DataList.children || []);
        } else if (this.setting.dataSource == 'matrix' && this.setting.levelType == 3) {
          this.getLevelDataList(3);
        }
      }
    },
    setDefaultJson(level, refresh) {
      //level 代表改变的映射字段    主要针对动态数据
      let _this = this;
      if (refresh) {
        //矩阵数据源的刷新
        this.initLevel();
        return;
      }

      if (!level) {
        //改变矩阵值，同时不是初始化情况
        this.setting.defaultValueList = ['', ''];
        this.setting.levelType == 3 && (this.setting.defaultValueList = ['', '', '']);
        _this.level1DataList = [];
        _this.level2DataList = [];
        _this.level3DataList = [];
      }
      if (this.setting.defaultValueType == 'self' && this.setting.dataSource == 'matrix') {
        if (level == 1) {
          //改变一级的映射字段
          this.setting.defaultValueList = ['', ''];
          this.setting.levelType == 3 && (this.setting.defaultValueList = ['', '', '']);
          this.getLevelDataList(1);
          //获取 level1DataList
        } else if (level == 2) {
          //改变二级的映射字段
          this.setting.defaultValueList[1] = '';
          this.setting.levelType == 3 && (this.setting.defaultValueList[2] = '');
          this.getLevelDataList(2);
          //获取 level2DataList
        } else if (level == 3) {
          //改变三级的映射字段
          this.setting.defaultValueList[2] = '';
          this.getLevelDataList(3);
          //获取 level3DataList
        }
      } else if (this.setting.defaultValueType == 'self' && this.setting.dataSource == 'static') {
        this.level1DataList = this.setting.dataList;
      }
    },
    getLevelDataList(level) {
      let _this = this;
      if (!_this.setting.matrixUuid) {
        return;
      }
      if (level == 1 && this.setting.mapping[0].value && this.setting.mapping[0].text) {
        //获取一级默认数据列表
        let param = {
          matrixUuid: _this.setting.matrixUuid,
          keywordColumn: _this.setting.mapping[0].text,
          valueField: _this.setting.mapping[0].value,
          textField: _this.setting.mapping[0].text
        };
        this.level1DataList = [];
        let columlist1 = [];
        this.$api.framework.matrix.getMatrixDataForSelect(param).then(res => {
          if (res.Status == 'OK' && !res.Return.isRepeat) {
            if (res.Return.dataList && res.Return.dataList.length > 0) {
              columlist1 = res.Return.dataList;
            }
            _this.level1DataList = columlist1 || [];
            _this.$set(_this.setting.mapping[0], 'message', '');
          } else if (res.Status == 'OK' && res.Return.isRepeat) {
            _this.level1DataList = [];
            _this.$set(_this.setting.mapping[0], 'message', '属性列存在相同数据');
          }
        });
      } else if (level == 2 && this.setting.mapping[1].value && this.setting.mapping[1].text) {
        let param = {
          matrixUuid: _this.setting.matrixUuid,
          keywordColumn: _this.setting.mapping[1].text,
          columnList: [_this.setting.mapping[1].value, _this.setting.mapping[1].text],
          sourceColumnList: []
        };
        this.setting.defaultValueList[0] &&
          param.sourceColumnList.push({
            column: _this.setting.mapping[0].value,
            value: _this.setting.defaultValueList[0] && _this.setting.defaultValueList[0].indexOf('&=&') > -1 ? _this.setting.defaultValueList[0].split('&=&')[0] : _this.setting.defaultValueList[0]
          });
        this.level2DataList = [];
        let columlist2 = [];
        this.$api.framework.matrix.getMatrixDataForSelect(param).then(res => {
          if (res.Status == 'OK' && !res.Return.isRepeat) {
            if (res.Return.dataList && res.Return.dataList.length > 0) {
              columlist2 = res.Return.dataList;
            }
            _this.level2DataList = this.setting.defaultValueList[0] ? columlist2 : [];
            _this.$set(_this.setting.mapping[1], 'message', '');
          } else if (res.Status == 'OK' && res.Return.isRepeat) {
            _this.level2DataList = [];
            _this.$set(_this.setting.mapping[1], 'message', '属性列存在相同数据');
          }
        });
      } else if (level == 3 && this.setting.mapping[2] && this.setting.mapping[2].value && this.setting.mapping[2].text) {
        let param = {
          matrixUuid: _this.setting.matrixUuid,
          keywordColumn: _this.setting.mapping[2].text,
          valueField: _this.setting.mapping[2].value,
          textField: _this.setting.mapping[2].text,
          sourceColumnList: []
        };

        param.sourceColumnList.push({
          column: _this.setting.mapping[0].value,
          value: _this.setting.defaultValueList[0] && _this.setting.defaultValueList[0].indexOf('&=&') > -1 ? _this.setting.defaultValueList[0].split('&=&')[0] : _this.setting.defaultValueList[0]
        });
        param.sourceColumnList.push({
          column: _this.setting.mapping[1].value,
          value: _this.setting.defaultValueList[1] && _this.setting.defaultValueList[1].indexOf('&=&') > -1 ? _this.setting.defaultValueList[1].split('&=&')[0] : _this.setting.defaultValueList[1]
        });
        let columlist3 = [];
        this.level3DataList = [];
        this.$api.framework.matrix.getMatrixDataForSelect(param).then(res => {
          if (res.Status == 'OK' && !res.Return.isRepeat) {
            if (res.Return.dataList && res.Return.dataList.length > 0) {
              columlist3 = res.Return.dataList;
            }
            _this.level3DataList = this.setting.defaultValueList[0] && this.setting.defaultValueList[1] ? columlist3 : [];
            _this.$set(_this.setting.mapping[1], 'message', '');
          } else if (res.Status == 'OK' && res.Return.isRepeat) {
            _this.level3DataList = [];
            _this.$set(_this.setting.mapping[1], 'message', '属性列存在相同数据');
          }
        });
      }      
    },
    initLevel() {
      //初始化层级数据
      let _this = this;
      if (this.setting.dataSource == 'static') {
        this.level1DataList = this.setting.dataList;
        this.setting.defaultValueList &&
          this.setting.defaultValueList.forEach((item, index) => {
            let arr = [];
            index == 0 ? (arr = _this.setting.dataList) : (arr = _this['level' + (index + 1) + 'DataList']);
            item && arr && (_this['level' + (index + 2) + 'DataList'] = arr.find(a => a.value == item));
            _this['level' + (index + 2) + 'DataList'] && (_this['level' + (index + 2) + 'DataList'] = _this['level' + (index + 2) + 'DataList'].children || []);
          });
      } else if (this.setting.dataSource == 'matrix') {
        this.setting.defaultValueList &&
          this.setting.defaultValueList.forEach((val, index) => {
            _this.getLevelDataList(index + 1);
          });
      }
    },
    validComponent() {
      let validList = [];
      if (this.$refs.dataSource && this.$refs.dataSource.validComponent) {
        validList = this.$refs.dataSource.validComponent();
      }
      let istrue2 = [];
      let istrue3 = [];
      validList.forEach(v => {
        if (v.indexOf('层级2') > -1) {
          istrue2.push(v);
        }

        if (v.indexOf('层级3') > -1) {
          istrue3.push(v);
        }
      });
      if (validList.length === istrue2.length && validList.length > 0) {
        this.$refs.dataSource._data.tabMappingValue = 'mapping2';
      }

      if (validList.length === istrue3.length && validList.length > 0) {
        this.$refs.dataSource._data.tabMappingValue = 'mapping3';
      }
      return validList;
    }
  },
  filter: {},
  computed: {
    getComponentList() {
      return this.controllerList.filter(item => {
        return item.handler == 'formcascadelist' && item.value != this.uuid;
      });
    },
    getMapping() {
      let _this = this;
      return function(type, level) {
        return _this.setting.mapping[level - 1][type] || type;
      };
    }
  },
  watch: {
    uuid: function(newValue, oldValue) {
      if (newValue != oldValue) {
        //相同組件，之間的切换时，调用的方法
        this.$refs.dataSource.initLevel();
        this.$nextTick(function() {
          this.initLevel();
        });
      }
    }
  }
};
</script>

<style lang="less" scoped>
  .inner-label{
        opacity: 0.6;
  }
</style>
