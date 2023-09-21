<template>
  <div :style="getContentStyle">
    <i v-if="setting.config.isRequired" class="require-tip">*</i>
    <TsFormCheckbox 
      v-if="setting" 
      v-model="currentValue" 
      class="overflow-ellipsis" 
      v-bind="getConfig" 
      :value="currentValue" 
      :width="setting.config.width" 
      :name="setting.uuid" 
      :dataList="defaultValueDataList" 
      :vertical="setting.config.direction == 'portrait' ? true : false" 
      :disabled="isReadonly || false" 
      @on-change="updatethis(currentValue)"
      @change-label="changeLabel"
    ></TsFormCheckbox>
    <Checkbox v-else>Checkbox</Checkbox>
    <div v-if="setting.config.desc" class="component-tips tsfont-info-o">{{ setting.config.desc }}</div>
  </div>
</template>
<script>
import TsFormCheckbox from '@/resources/plugins/TsForm/TsFormCheckbox';
import sheetCompontMixins from '@/resources/mixins/sheetCompontMixins.js';
import viewmixin from './viewmixin.js';
export default {
  name: 'Formcheckbox',
  components: { TsFormCheckbox },
  mixins: [sheetCompontMixins, viewmixin],
  props: {
    setting: Object,
    value: [Array],
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
      currentValue: _this.initCurrentValue(),
      defaultValueDataList: _this.setting.config.dataList || []
    };
  },
  created() {
    this.getDatalist();
  },
  methods: {
    updatethis: function(val) {
      this.$emit('update', val);
    },
    updateValue: function(val) {
      this.$set(this, 'currentValue', val);
    },
    getValue: function(val) {
      return this.currentValue;
    },
    validateValue: function() {
      let isVaild = true;
      if (this.setting.config.isRequired) {
        isVaild = this.$children[0].valid();
      }
      return isVaild;
    },
    initCurrentValue() {
      let value = this.value || [];
      if (typeof value == 'string' && value.trim() == '') {
        value = [];
      } else if (typeof value == 'string') {
        value = [value];
      }
      return JSON.parse(JSON.stringify(value));
    },
    dealDataByUrl(nodeList) { //当默认值的引用类型是自定义  处理默认值的数据结构
      return this.dealDataFilter(nodeList, this.setting.config);
    },
    getDatalist() {
      let config = this.setting.config || null;
      let _this = this;
      if (config && config.dataSource == 'matrix' && config.matrixUuid && config.mapping.value && config.mapping.text) {
        let param = { matrixUuid: config.matrixUuid, keywordColumn: config.mapping.text, valueField: config.mapping.value, textField: config.mapping.text, needPage: false };
        //过滤条件
        Object.assign(param, this.getFilterCondition(config));  
        //联动过滤
        if (config.filterList && config.filterList.length > 0) { 
          Object.assign(param, {
            filterList: this.updateFilterList(config.filterList)
          });
        }
         
        this.defaultSelfJson.params = param;
        this.defaultSelfJson.rootName = 'dataList';
        this.defaultSelfJson.url = this.defaultSelfJson.defaultUrl;
      } else {
        _this.defaultValueDataList = config.dataList || [];
        this.defaultSelfJson.url = '';
      }
    }
  },
  computed: {
    getContentStyle() {
      return { position: 'relative', width: this.setting.config.width };
    },
    getConfig: function() {
      let config = this.defaultSelfJson;
      config.validateList = this.setting.config.isRequired ? ['required'] : [];
      config.readonlyClass = '';
      return config;
    }
  },
  watch: {
    value: function(newValue, oldValue) {
      if (JSON.stringify(newValue) != JSON.stringify(this.currentValue)) {
        this.currentValue = this.initCurrentValue();
      }
    },
    'setting.config.matrixUuid': function() {
      this.getDatalist();
    },
    'setting.config.mapping': {
      handler: function() {
        this.getDatalist();
      },
      deep: true
    },
    'setting.config.filterList': {
      handler: function() {
        this.getDatalist();
      },
      deep: true
    }
  }
};

</script>
<style lang="less" scoped>
.readonly-container {
  position: relative;
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0;
  }
}
.component-tips {
  text-align: left;
  font-size: 90%;
  opacity: 0.6;
  word-break: break-all;
  display: block;
  &:before {
    margin-right: 3px;
  }
}
</style>
<style lang="less">
.overflow-ellipsis {
  .ivu-checkbox-group {
    > label {
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: keep-all;
      padding-left: 20px;
      position: relative;
      min-height: 20px;
      > span.ivu-checkbox {
        position: absolute;
        top: 3px;
        left: 0px;
      }
    }
  }
  .ivu-checkbox-group-vertical {
    label.ivu-checkbox-group-item {
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: keep-all;
      display: block;
      padding-left: 20px;
      position: relative;
      > span.ivu-checkbox {
        position: absolute;
        top: 6px;
        left: 0px;
      }
    }
  }
}
</style>
