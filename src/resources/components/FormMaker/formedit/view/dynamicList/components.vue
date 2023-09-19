<template>
  <div v-if="setting && setting.type" @click.stop>
    <components
      :is="getType"
      v-model="currentValue"
      v-bind="getInitSetting"
      :validateList="getValid"
      :dataList="defaultValueDataList"
      :transfer="true"
      style="min-width:130px"
      @on-change="changeValue"
    ></components>
  </div>
</template>
<script>
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import TsFormRadio from '@/resources/plugins/TsForm/TsFormRadio';
import TsFormCheckbox from '@/resources/plugins/TsForm/TsFormCheckbox';
import TsFormDatePicker from '@/resources/plugins/TsForm/TsFormDatePicker';
import sheetCompontMixins from '@/resources/mixins/sheetCompontMixins.js';
export default {
  name: 'ItemCom',
  components: { TsFormInput, TsFormSelect, TsFormRadio, TsFormCheckbox, TsFormDatePicker },
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
      currentValue: null,
      validJson: ['required'],
      defaultValueDataList: this.setting && this.setting.dataList ? this.setting.dataList : []
    };
  },
  mounted() {},
  destroyed() {},
  methods: {
    validateValue: function() {
      let isVaild = true;
      this.$children[0] && (isVaild = this.$children[0].valid());
      return isVaild;
    },
    dealDataByUrl(nodeList) { //当默认值的引用类型是自定义  处理默认值的数据结构
      return this.dealDataFilter(nodeList, this.setting.config);
    },
    getValue() {
      return this.currentValue;
    },
    changeValue(value) {
      this.$emit('on-updata', value);
    }
  },
  computed: {
    getType() {
      let type = this.setting.type;
      if (type == 'textarea' || type == 'text') {
        return 'TsFormInput';
      } else if (type == 'selects' || type == 'select') {
        return 'TsFormSelect';
      } else if (type == 'time' || type == 'date') {
        return 'TsFormDatePicker';
      } else if (type == 'radio') {
        return 'TsFormRadio';
      } else if (type == 'checkbox') {
        return 'TsFormCheckbox';
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
      config.dataSource = attr.config.dataSource;
      // config.readonly = this.isReadonly || false;
      config.readonlyClass = '';
      let setting = this.setting.config || null;
      let _this = this;
      _this.currentValue = setting.value || null;
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
      //只读
      if (_this.isReadonly) {
        config.disabled = true;
      } else {
        config.disabled = attr.config.disabled || false;
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
