<template>
  <div v-if="setting.config" :class="getClass" :style="getStyle">
    <i v-if="setting.config.isRequired" class="require-tip">*</i>
    <div>
      <!-- 一级 -->
      <div v-if="setting.config.levelType >= 1" :class="getItemClass">
        <TsFormSelect 
          ref="select"
          v-model="currentValue[0]" 
          :data-list="level1DataList"
          :value-name="setting.config.dataSource != 'matrix' && setting.config.mapping[0].value ? setting.config.mapping[0].value : 'value'" 
          :text-name="setting.config.dataSource != 'matrix' && setting.config.mapping[0].text ? setting.config.mapping[0].text : 'text'" 
          :show-name="setting.config.dataSource == 'matrix' ? 'html' : 'text'" 
          :disabled="isReadonly" 
          :readonlyClass="setting.config.readonlyClass || null" 
          :validate-list="setting.config.isRequired ? validJson : null" 
          :placeholder="setting.config.placeholder ? setting.config.placeholder[0] : ''" 
          search
          :dynamicUrl="setting.config.dataSource == 'matrix'?dynamicUrl:''"
          :params="setting.config.dataSource == 'matrix'?getParams(0):null"
          rootName="dataList"
          @on-change="changeDefault(currentValue[0], 1)"
        >
        </TsFormSelect>
      </div>

      <!-- 二级 -->
      <div v-if="setting.config.levelType >= 2 && currentValue[0]" :class="getItemClass">
        <TsFormSelect 
          v-model="currentValue[1]" 
          :data-list="level2DataList" 
          :value-name="setting.config.dataSource != 'matrix' && setting.config.mapping[1].value ? setting.config.mapping[1].value : 'value'" 
          :text-name="setting.config.dataSource != 'matrix' && setting.config.mapping[1].text ? setting.config.mapping[1].text : 'text'" 
          :show-name="setting.config.dataSource == 'matrix' ? 'html' : 'text'" 
          :disabled="isReadonly" 
          :readonlyClass="setting.config.readonlyClass || null"
          :validate-list="setting.config.isRequired ? validJson : null" 
          :placeholder="setting.config.placeholder ? setting.config.placeholder[1] : ''" 
          :dynamicUrl="setting.config.dataSource == 'matrix'?dynamicUrl:''"
          :params="setting.config.dataSource == 'matrix'?getParams(1):null"
          rootName="dataList"
          @on-change="changeDefault(currentValue[1], 2)"
        ></TsFormSelect>
      </div>

      <!-- 三级 -->
      <div v-if="setting.config.levelType >= 3 && currentValue[0] && currentValue[1]" :class="getItemClass">
        <TsFormSelect 
          v-model="currentValue[2]" 
          :data-list="level3DataList" 
          :value-name="setting.config.dataSource != 'matrix' && setting.config.mapping[2].value ? setting.config.mapping[2].value : 'value'" 
          :text-name="setting.config.dataSource != 'matrix' && setting.config.mapping[2].text ? setting.config.mapping[2].text : 'text'" 
          :show-name="setting.config.dataSource == 'matrix' ? 'html' : 'text'" 
          :disabled="isReadonly" 
          :readonlyClass="setting.config.readonlyClass || null" 
          :validate-list="setting.config.isRequired ? validJson : null" 
          :placeholder="setting.config.placeholder ? setting.config.placeholder[2] : ''" 
          :dynamicUrl="setting.config.dataSource == 'matrix'?dynamicUrl:''"
          :params="setting.config.dataSource == 'matrix'?getParams(2):null"
          rootName="dataList"
          @on-change="changeDefault(currentValue[2], 3)"
        ></TsFormSelect>
      </div>
    </div>
    <div v-if="setting.config.desc" class="component-tips tsfont-info-o">
      {{ setting.config.desc }}
    </div>
  </div>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import viewmixin from './viewmixin.js';
export default {
  name: 'CascadeList',
  components: { TsFormSelect },
  mixins: [viewmixin],
  props: {
    setting: Object,
    value: [Array],
    isReadonly: Boolean
  },
  data() {
    const _this = this;
    return {
      currentValue: _this.getCurrentValue(_this.value),
      level1DataList: _this.setting.dataList || [],
      level2DataList: [],
      level3DataList: [],
      validJson: ['required'],
      dynamicUrl: '/api/rest/matrix/column/data/search/forselect'
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
    updatethis: function(val) {
      this.$emit('update', val);
    },
    updateValue: function(val) {
      this.currentValue = this.getCurrentValue(val);
      this.initLevel();
    },
    getValue: function(val) {
      let level = this.setting.config.levelType;
      let value = [];
      this.currentValue && this.currentValue.forEach(item => {
        item && value.push(item);
      });
      return value;
    },
    validateValue: function() {
      let isVaild = true;
      if (this.setting.config.isRequired) {
        isVaild = this.$refs.select.valid();
      }
      return isVaild;
    },
    initLevel() {
      // 初始化层级数据
      const _this = this;
      if (this.setting.config.dataSource == 'static') {
        this.level1DataList = this.setting.config.dataList;
        this.currentValue &&
          this.currentValue.forEach((item, index) => {
            let arr = [];
            index == 0 ? (arr = _this.setting.config.dataList) : (arr = _this['level' + (index + 1) + 'DataList']);
            item &&
              arr &&
              (_this['level' + (index + 2) + 'DataList'] = arr.find(a => {
                return a.value == item;
              }));
            _this['level' + (index + 2) + 'DataList'] && (_this['level' + (index + 2) + 'DataList'] = _this['level' + (index + 2) + 'DataList'].children || []);
          });
      }
    },
    changeDefault(val, level) {
      if (JSON.stringify(this.value) != JSON.stringify(this.currentValue)) {
        if (this.setting.config.dataSource == 'static') {
          if (level == 1) {
            this.level2DataList = this.setting.config.dataList.find(item => item.value == val);
            this.level2DataList && (this.level2DataList = this.level2DataList.children || []);
            this.currentValue[1] = '';
            this.setting.config.levelType == 3 && (this.currentValue[2] = '');
            this.level3DataList = [];
          } else if (level == 2) {
            this.level3DataList = this.level2DataList.find(item => item.value == val) || [];
            this.level3DataList && (this.level3DataList = this.level3DataList.children || []);
            this.setting.config.levelType == 3 && (this.currentValue[2] = '');
          }
          this.updatethis(JSON.parse(JSON.stringify(this.currentValue)));
        } else if (this.setting.config.dataSource == 'matrix') {
          if (level == 1) {
            this.currentValue[1] = '';
            this.setting.config.levelType == 3 && (this.currentValue[2] = '');
          } else if (level == 2) {
            this.setting.config.levelType == 3 && (this.currentValue[2] = '');
          }
        }
      }
      this.$emit('update', this.currentValue);
    },
    getCurrentValue(value) {
      let level = this.setting.config.levelType;
      let index = level - (value ? value.length : 0);
      let lists = value ? this.$utils.deepClone(value) : [];
      for (let i = 0; i < index; i++) {
        lists.push('');
      }
      return lists;
    },
    dealDataByUrl(nodeList, levelVal) {
      return this.dealDataFilter(nodeList, levelVal);
    },
    dealDataFilter(nodeList, levelVal) {
      //值的数据结构
      if (this.setting.config.dataSource != 'matrix') {
        return;
      }
      let _this = this;
      let columlist = [];
      let config = _this.setting.config || null;
      let level = levelVal || 0;
      if (config.mapping[level].value && config.mapping[level].text && nodeList && nodeList.length) {
        nodeList.forEach(co => {
          if (co[config.mapping[level].text]) {
            if (config.mapping[level].value != config.mapping[level].text) {
              columlist.push({
                text: co[config.mapping[level].text].text,
                value: co[config.mapping[level].value].value + '&=&' + co[config.mapping[level].text].text,
                html: co[config.mapping[level].text].text + "<small class='text-grey'>(" + co[config.mapping[level].value].text + ')</small>'
              });
            } else {
              columlist.push({
                text: co[config.mapping[level].text].text,
                value: co[config.mapping[level].value].value + '&=&' + co[config.mapping[level].text].text,
                html: co[config.mapping[level].text].text
              });
            }
          }
        });
      }
      return columlist;
    }
  },
  filter: {},
  computed: {
    getClass() {
      const classArr = ['cascadeList'];
      this.setting.config.direction == 'transverse' && classArr.push('transverse');
      return classArr;
    },
    getItemClass() {
      const classArr = [];
      this.setting.config.direction == 'transverse' ? classArr.push('item-line') : classArr.push('item-block');
      classArr.push('col-' + this.setting.config.levelType);
      return classArr;
    },
    getStyle: function() {
      const resultJson = {};

      if (typeof this.setting.config.width == 'number') {
        resultJson.width = this.setting.config.width + 'px';
      } else if (typeof this.setting.config.width == 'string') {
        resultJson.width = this.setting.config.width;
      }
      return resultJson;
    },
    getMapping() {
      const _this = this;
      return function(type, level) {
        return _this.setting.config.mapping[level - 1][type] || type;
      };
    },
    getParams() {
      return (val) => {
        let _this = this;
        let config = _this.setting.config;
        let param = {
          matrixUuid: config.matrixUuid,
          keywordColumn: config.mapping[val].text,
          valueField: config.mapping[val].value,
          textField: config.mapping[val].text,
          sourceColumnList: []
        };
        if (val == 1) {
          _this.currentValue[0] &&
          param.sourceColumnList.push({
            column: config.mapping[0].value,
            value: _this.currentValue[0] && _this.currentValue[0].indexOf('&=&') > -1 ? _this.currentValue[0].split('&=&')[0] : _this.currentValue[0]
          });
        } else if (val == 2) {
          param.sourceColumnList.push({
            column: config.mapping[0].value,
            value: this.currentValue[0] && _this.currentValue[0].indexOf('&=&') > -1 ? _this.currentValue[0].split('&=&')[0] : _this.currentValue[0]
          });
          param.sourceColumnList.push({
            column: config.mapping[1].value,
            value: _this.currentValue[1] && _this.currentValue[1].indexOf('&=&') > -1 ? _this.currentValue[1].split('&=&')[0] : _this.currentValue[1]
          });
        }
        return param;
      };
    }
  },
  watch: {
    value: {
      handler: function(newValue, oldValue) {
        if (JSON.stringify(newValue) != JSON.stringify(this.currentValue)) {
          this.currentValue = this.getCurrentValue(newValue);
          this.initLevel();
        }
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.cascadeList {
  .item-line {
    display: inline-block;
    padding: 0px 4px;
    &.col-2 {
      width: 50%;
    }
    &.col-3 {
      width: 33.3%;
    }
    &:last-of-type {
      padding-right: 0px;
    }
    &:first-of-type {
      padding-left: 0px;
    }
  }
  .item-block {
    padding-bottom: 8px;
  }
}
.component-tips {
  text-align: left;
  font-size: 90%;
  opacity: 0.6;
  display: block;
  word-break: break-all;
  display: block;
  &:before {
    margin-right: 3px;
  }
}
</style>
