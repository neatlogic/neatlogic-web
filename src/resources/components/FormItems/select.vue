<template>
  <TsFormSelect
    :value="value"
    v-bind="getSetting"
    search
    transfer
    :readonly="readonly"
    @on-change="updateval"
  ></TsFormSelect>
</template>

<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
import sheetCompontMixins from '@/resources/mixins/sheetCompontMixins.js';
export default {
  name: '',
  components: {
    TsFormSelect
  },
  mixins: [sheetCompontMixins],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    config: Object,
    value: [String, Boolean, Object, Array],
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
    };
  },

  beforeCreate() {},

  created() {},

  beforeMount() {},

  mounted() {},

  beforeUpdate() {},

  updated() {},

  methods: {
    updateval(val) {
      this.$emit('change', val);
    },
    dealDataByUrl(nodeList) {
      //当默认值的引用类型是自定义  处理默认值的数据结构
      return this.dealDataFilter(nodeList, this.config.config);
    }
  },
  computed: {
    getSetting() {
      let json = {};
      let setting = this.config.config || {};
      if (setting.dataSource == 'matrix') {
        let param = { matrixUuid: setting.matrixUuid };
        param.keywordColumn = setting.mapping.text;
        param.columnList = [setting.mapping.value, setting.mapping.text];
        param.valueField = this.setting.mapping.value;
        param.textField = this.setting.mapping.text;
        json.rootName = 'dataList';
        json = this.defaultSelfJson;
        json.params = param;
        json.dynamicUrl = json.defaultUrl;
        json.showName = 'html';
        json.readonlyClass = setting.readonlyClass;
        json.sperateText = setting.sperateText;
      } else {
        json = this.$utils.deepClone(setting);
      }

      if (this.config.handler == 'formselect') {
        json.multiple = !!setting.isMultiple;
      } else if (this.config.handler == 'formcheckbox') {
        json.multiple = true;
      } else if (this.config.handler == 'formradio') {
        json.multiple = false;
      }
      json.width = '100%';
      json.desc = '';
      json.isRequired = false;
      return json;
    }
  },
  watch: { 
    value: {
      handler(val) {
        if ((this.config.handler == 'formcheckbox' || (this.config.handler == 'formselect' && this.config.config.isMultiple)) && !(val instanceof Array)) {
          this.$emit('change', []);
        } else if ((this.config.handler == 'formradio' || (this.config.handler == 'formselect' && !this.config.config.isMultiple)) && (typeof val != 'string')) {
          this.$emit('change', '');
        }
      },
      deep: true,
      immediate: true
    }}

};

</script>
<style lang="less" scoped>
/deep/ .tsform-readonly{
  cursor: text;
}
</style>
