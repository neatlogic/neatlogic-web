<script>
export default {
  props: {
    mode: { type: String, default: 'edit' }, //表单的模式edit或read或condition,edut模式才会显示异常、联动等辅助图标
    value: { type: [Object, Array, String, Number] }, //当前表单组件的值
    formItem: { type: Object },
    formItemList: { type: Array },
    filter: { type: Array }, //格式[{column:'矩阵属性uuid',expression:'equal',valueList:["value"]}]
    readonly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    formData: Object,
    readonlyTextIsHighlight: {type: Boolean, default: false}, // 只读模式下，是否需要高亮显示值
    isClearEchoFailedDefaultValue: {
      // 是否清空回显失败默认值
      type: Boolean,
      default: false
    },
    isCustomValue: {
      // 是否自定义值，单个字符串(value:1)可以自定义返回{text:1,value:1}，数组[1]可以自定义返回[{text:1,value:1}]
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      validateList: []
    };
  },
  created() {
    //在非条件模式下，用默认值替换空的value值
    if ((this.mode === 'read' || this.mode === 'readSubform') && this.value == null && this.config && this.config.hasOwnProperty('defaultValue')) {
      this.setValue(this.config['defaultValue']);
    }
  },
  methods: {
    validConfigBase() {
      const errorList = [];
      if (!this.formItem.label) {
        errorList.push({ field: 'label', error: this.$t('form.validate.required', {'target': this.$t('term.dashboard.widgetname')}) });
      } else {
        let findLabelItem = this.formItemList.find(item => item.uuid != this.formItem.uuid && item.label === this.formItem.label);
        if (findLabelItem) {
          errorList.push({ field: 'label', error: this.$t('message.targetisexists', {'target': this.$t('term.dashboard.widgetname')}) });
        }
      }
      if (this.validConfig && typeof this.validConfig === 'function') {
        const subErrorList = this.validConfig();
        if (subErrorList && subErrorList.length > 0) {
          subErrorList.forEach(e => {
            if (e.field && e.error) {
              errorList.push(e);
            } else if (!this.$utils.isEmpty(e.errorList)) { 
              //选项卡和折叠面板校验
              e.errorList.forEach(s => {
                errorList.push({
                  uuid: e.uuid,
                  ...s
                });
              });
            }
          });
        }
      }
      return errorList;
    },
    async validDataBase(validConifg) {
      const errorList = [];
      //组件默认ref是formitem
      if (this.$refs['formitem'] && this.$refs['formitem'].valid) {
        this.$refs['formitem'].valid();
      }
      errorList.push(...this.validDataForAllItem());
      if (this.validData && typeof this.validData === 'function') {
        const subErrorList = await this.validData(validConifg);
        if (subErrorList && subErrorList.length > 0) {
          subErrorList.forEach(e => {
            if (e.uuid && e.error) {
              errorList.push(e);
            }
          });
        }
      }
      return errorList;
    },
    setValue(val) {
      this.$emit('setValue', val);
      this.$emit('resize');
    },
    //验证配置，需要子组件继承，格式范例[{field:'label',error:'label不能为空'},{field:'dataSource',error:'数据源不能为空'}]
    validConfig() {
      return [];
    },
    //验证数据，需要子组件继承，格式范例[{field:'label',error:'label不能为空'},{field:'dataSource',error:'数据源不能为空'}]
    validData() {
      return [];
    },
    //添加子组件
    addComponent(item) {
      let isSuccess = false;
      if (!item.isContainer && this.formItem.isContainer && this.formItem.component && this.formItem.component instanceof Array) {
        if (!this.formItem.component.find(d => d.uuid === item.uuid)) {
          item.uuid = this.$utils.setUuid();
          this.formItem.component.push(item);
          isSuccess = true;
        }
      }
      return isSuccess;
    },
    //删除子组件
    removeComponent(uuid) {
      if (this.formItem.component && this.formItem.component.length > 0) {
        const index = this.formItem.component.findIndex(d => d.uuid === uuid);
        if (index > -1) {
          this.formItem.component.splice(index, 1);
        }
      }
    }
  },
  computed: {
    config() {
      //避免组件修改了config数据，所以复制一份数据
      //return this.$utils.deepClone(this.formItem.config) || {};
      return (this.formItem && this.formItem.config) || {};
    }
  },
  watch: {
    config: {
      handler: function(val) {
        this.$emit('resize');
      },
      deep: true
    },
    required: {
      handler(val) {
        this.validateList = [];
        if ((this.mode === 'read' || this.mode === 'readSubform') && val) {
          this.validateList.push({name: 'required', message: ' '});
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped></style>
