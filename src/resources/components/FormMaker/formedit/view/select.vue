<template>
  <div style="position: relative;">
    <i v-if="setting.config.isRequired" class="require-tip">*</i>
    <TsFormSelect 
      v-if="setting" 
      v-model="currentValue" 
      v-bind="getConfig" 
      :width="setting.config.width || null" 
      :name="setting.uuid || null" 
      :multiple="setting.config.isMultiple" 
      :dataList="defaultValueDataList || null" 
      :disabled="isReadonly || false" 
      :value="currentValue"
      :showName="setting.config.dataSource == 'matrix' ? 'html' : 'text'" 
      :placeholder="setting.config.placeholder"
      search 
      clearable 
      transfer 
      @on-change="(val)=>{updatethis(val)}"
      @change-label="changeLabel"
    ></TsFormSelect>
    <Select v-else placeholder="请选择"></Select>
    <div v-if="setting.config.desc" class="component-tips tsfont-info-o">{{ setting.config.desc }}</div>
  </div>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import sheetCompontMixins from '@/resources/mixins/sheetCompontMixins.js';
import viewmixin from './viewmixin.js';
export default {
  name: 'Formselect',
  components: { TsFormSelect },
  mixins: [sheetCompontMixins, viewmixin],
  props: {
    setting: Object,
    value: [Array, String],
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
      defaultValueDataList: [],
      filterList: []
    };
  },
  created() {},
  mounted() {
    this.getDatalist();
  },
  methods: {
    updatethis: function(val) {
      this.$emit('update', val);
    },
    changeLabel(label) {
      this.$emit('change-label', label);
    },
    updateValue: function(val) {
      this.$set(this, 'currentValue', val);
    },
    getValue(val) {
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
      let value = this.value || '';
      if (this.setting.config.isMultiple) {
        //多选使用数组
        if (typeof value == 'string' && value.trim() == '') {
          value = [];
        } else if (typeof value == 'string') {
          value = [value];
        }
      } else if (value instanceof Array) {
        //单选使用字符串
        value = value[0] || '';
      }
      this.setting.config.isMultiple ? (value = JSON.parse(JSON.stringify(value))) : '';
      // !this.$utils.isEmpty(value) && this.updatethis(value);
      return value;
    },
    dealDataByUrl(nodeList) { //当默认值的引用类型是自定义  处理默认值的数据结构
      return this.dealDataFilter(nodeList, this.setting.config);
    },
    getDatalist() {
      let config = this.setting.config || null;
      let _this = this;
      if (config && config.dataSource == 'matrix' && config.matrixUuid && config.mapping.value && config.mapping.text) {
        let param = {
          matrixUuid: config.matrixUuid,
          keywordColumn: config.mapping.text,
          columnList: [config.mapping.value, config.mapping.text],
          needPage: false
        };
        //过滤条件
        Object.assign(param, this.getFilterCondition(config)); 
        //联动过滤
        if (this.filterList.length > 0) { 
          Object.assign(param, {
            filterList: this.updateFilterList(this.filterList)
          });
        }

        this.defaultSelfJson.params = this.$utils.deepClone(param);
        this.defaultSelfJson.dynamicUrl = this.defaultSelfJson.defaultUrl;
        this.defaultSelfJson.showName = 'html';
      } else {
        _this.defaultValueDataList = config.dataList ? config.dataList.filter(d => d && d.value.toString().trim() != '') : [];
        this.defaultSelfJson.dynamicUrl = '';
        this.defaultSelfJson.showName = '';
      }
    }

  },
  computed: {
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
    'setting.config.defaultValueList': {
      handler: function() {
        this.getDatalist();
      },
      deep: true
    },
    // 'setting.config.filterList': {
    //   handler: function(val) {
    //     this.getDatalist();
    //   },
    //   deep: true,
    // },
    setting: {
      handler(val) {
        if (val && val.config && val.config.filterList) {
          this.filterList = val.config.filterList;
        } else {
          this.filterList = [];
        }
        this.getDatalist();
      },
      deep: true,
      immediate: true
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
