export default {
  props: {
    config: Object,
    defaultValue: [String, Boolean, Object, Array, Number],
    value: [String, Boolean, Object, Array, Number],
    readonly: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    isRequired: {
      //是否必填，抽离出原组件的必填信息进行覆盖，当此选项为1时覆盖原来的config的validList里的required
      type: [Number, Boolean]
    },
    phaseList: Array //阶段列表
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  data() {
    let _this = this;
    return {};
  },
  created() {
  },
  mounted() {},
  beforeDestroy() {},
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
    getDatalist() {
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
      let setting = Object.assign({}, this.config);
      if (this.config && this.config.dataSource == 'matrix') {
        if (this.config && this.config.matrixUuid && this.config.mapping) {
          let columnList = [];
          let keywordColumn = '';
          if (this.config.mapping.value && this.config.mapping.text) {
            columnList = [this.config.mapping.value, this.config.mapping.text];
            keywordColumn = this.config.mapping.text;
          }
          let param = { matrixUuid: this.config.matrixUuid, keywordColumn: keywordColumn, columnList: columnList };
          setting.params = param;
          if (setting.type == 'radio' || setting.type == 'checkbox') {
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
      setting.type == 'multiselect' && (setting.multiple = true);
      return setting;
    }
  },
  watch: {
  }
};
