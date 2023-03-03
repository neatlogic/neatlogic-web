export default {
  props: {
    config: Object,
    value: [String, Boolean, Object, Array, Number],
    isRequired: {
      //是否必填，抽离出原组件的必填信息进行覆盖，当此选项为1时覆盖原来的config的validList里的required
      type: [Number, Boolean]
    },
    readonly: {
      type: Boolean,
      default: false
    },
    type: String //组件类型
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  data() {
    return {
    };
  },
  mounted() {
  },
  beforeDestroy() {

  },
  methods: {
    updateval(val) {
      this.$emit('change', val);
    },
    valid() {
      if (this.$refs.item && this.$refs.item.valid) {
        return this.$refs.item.valid();
      } else {
        return true;
      }
    },
    dealDataByUrl(nodeList) { //当默认值的引用类型是自定义  处理默认值的数据结构
      if (this.config.matrixUuid) {
        return this.dealDataFilter(nodeList, this.config);
      }
    },
    dealDataFilter(nodeList, config) {
      //当默认值的引用类型是自定义  处理默认值的数据结构
      let columlist = [];
      config = config || null;
      if (config.mapping.value && config.mapping.text && nodeList) {
        if (nodeList && nodeList.length > 0) {
          nodeList.forEach(co => {
            if (co[config.mapping.text]) {
              columlist.push({
                text: co[config.mapping.text].text,
                value: co[config.mapping.value].value + '&=&' + co[config.mapping.text].text,
                html: co[config.mapping.text].text
              });
            }
          });
        }
      }
      return columlist;
    }
  },
  computed: {
    getSetting() {
      let setting = Object.assign({border: 'border'}, this.config);
      if (this.config.dataSource == 'matrix') {
        if (this.config && this.config.matrixUuid && this.config.mapping) {
          let columnList = [];
          let keywordColumn = '';
          if (this.config.mapping.value && this.config.mapping.text) {
            columnList = [this.config.mapping.value, this.config.mapping.text];
            keywordColumn = this.config.mapping.text;
          }
          let param = { matrixUuid: this.config.matrixUuid, keywordColumn: keywordColumn, columnList: columnList };
          setting.params = param;
          if (this.type == 'radio' || this.type == 'checkbox') {
            setting.url = '/api/rest/matrix/column/data/search/forselect/new';
          } else {
            setting.dynamicUrl = '/api/rest/matrix/column/data/search/forselect/new';
          }
          setting.rootName = 'tbodyList';
          setting.dealDataByUrl = this.dealDataByUrl || null;
        }
      }
      setting.validateList = setting.validateList || [];
      if (typeof this.isRequired == 'boolean') {
        //当从别的判断带过来的关于这个组件是否必填的选项时，进行原来required的覆盖
        if (this.isRequired && setting.validateList.indexOf('required') < 0) {
          setting.validateList.push('required');
        } else if (!this.isRequired && setting.validateList.indexOf('required') > -1) {
          setting.validateList = setting.validateList.filter(v => {
            return v != 'required';
          });
        }
      }
      (this.type == 'multiselect' || this.type == 'checkbox') && (setting.multiple = true) && (setting.sperateText = '、');
      return setting;
    }
  },
  watch: {
  }
};
