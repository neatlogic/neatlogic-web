<template>
  <div v-if="setting && setting.type" @click.stop>
    <StaticTable 
      v-if="setting.type=='table'" 
      ref="table"
      :value="setting.attrConfig.value" 
      :isReadonly="isReadonly"
      :attrList="setting.attrConfig.attributeList"
    ></StaticTable>
    
    <components
      :is="getType"
      v-else
      v-model="setting.attrConfig.value"
      v-bind="getInitSetting"
      :validateList="getValid"
      :disabled="isReadonly"
      :dataList="defaultValueDataList"
      :transfer="true"
      style="min-width:130px"
      @on-change="changeValue"
    ></components>
  </div>
</template>
<script>
import StaticTable from './staticList-table.vue';
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import TsFormRadio from '@/resources/plugins/TsForm/TsFormRadio';
import TsFormCheckbox from '@/resources/plugins/TsForm/TsFormCheckbox';
import TsFormDatePicker from '@/resources/plugins/TsForm/TsFormDatePicker';
import sheetCompontMixins from '@/resources/mixins/sheetCompontMixins.js';
export default {
  name: 'ItemCom',
  components: { TsFormInput, TsFormSelect, TsFormRadio, TsFormCheckbox, TsFormDatePicker, StaticTable },
  mixins: [sheetCompontMixins],
  props: {
    setting: {
      type: Object
    },
    isReadonly: Boolean
  },
  data() {
    var _this = this;
    return {
      validJson: ['required'],
      defaultValueDataList: this.setting && this.setting.dataList ? this.setting.dataList : []
    };
  },
  mounted() {
    // this.getDatalist();
  },
  destroyed() {},
  methods: {
    validateValue: function() {
      let isVaild = true;
      this.$children[0] && (isVaild = this.$children[0].valid());
      return isVaild;
    },
    dealDataByUrl(nodeList) { //当默认值的引用类型是自定义  处理默认值的数据结构
      return this.dealDataFilter(nodeList, this.setting.attrConfig);
    },
    getValue() {
      if (this.$refs.table && this.$refs.table.getValue) {
        return this.$refs.table.getValue();
      } else {
        return setting.attrConfig.value;
      }
    },
    changeValue(value) {
      this.$emit('on-updata', value);
    }
  },
  computed: {
    getType() {
      let type = this.setting.type;
      if (type == 'textarea' || type == 'text' || type == 'password') {
        return 'TsFormInput';
      } else if (type == 'selects' || type == 'select') {
        return 'TsFormSelect';
      } else if (type == 'time' || type == 'date') {
        return 'TsFormDatePicker';
      } else if (type == 'radio') {
        return 'TsFormRadio';
      } else if (type == 'checkbox') {
        return 'TsFormCheckbox';
      } else if (type == 'table') {
        return 'StaticTable';
      }
      return '';
    },
    getValid() {
      let validateList = [];
      this.setting.isRequired && validateList.push('required');
      return validateList;
    },
    
    getInitSetting() {
      let attr = this.setting;
      let config = this.defaultSelfJson;
      config.dataSource = attr.attrConfig.dataSource;
      // config.readonly = this.isReadonly || false;
      config.readonlyClass = '';
      config.disabled = attr.attrConfig.disabled || false;
      let setting = this.setting.attrConfig || null;
      let _this = this;
      if (setting && setting.dataSource == 'matrix' && setting.matrixUuid && setting.mapping.value && setting.mapping.text && (this.setting.type == 'selects' || this.setting.type == 'select')) {
        let param = { matrixUuid: setting.matrixUuid, keywordColumn: setting.mapping.text, columnList: [setting.mapping.value, setting.mapping.text]};
        config.params = param;
        config.dynamicUrl = config.defaultUrl;
        config.url = '';
        config.showName = 'html';
      } else if (setting && setting.dataSource == 'matrix' && setting.matrixUuid && setting.mapping.value && setting.mapping.text && (this.setting.type == 'radio' || this.setting.type == 'checkbox')) {
        let param = { matrixUuid: setting.matrixUuid, keywordColumn: setting.mapping.text, columnList: [setting.mapping.value, setting.mapping.text]};
        config.params = param;
        config.url = config.defaultUrl;
        config.dynamicUrl = '';
        config.showName = '';
      } else {
        config.dynamicUrl = '';
        config.url = '';
        config.showName = '';
        _this.defaultValueDataList = setting.dataList || [];
      }
      //类型设置
      config.type = attr.type;
      if (attr.type == 'selects') {
        config.type = 'select';
        config.multiple = true;
      } else if (attr.type == 'date') {
        config.format = 'yyyy-MM-dd';
      } else if (attr.type == 'textarea' || attr.type == 'text') {
        attr.type == 'text' ? config.maxlength = 50 : config.maxlength = 500;
      }
      return config;
    }
  },
  watch: {}
};

</script>
<style lang="less" scoped>
.hide-container {
  position: relative;
  .tsfont-eye-off {
    position: absolute;
  }
  .compontent-hide {
    filter: blur(4px);
  }
}
.componentlay {
  position: absolute;
  z-index: 10;
  width: 100%;
  height: 100%;
  top: 0px;
  left: 0px;
}
</style>
