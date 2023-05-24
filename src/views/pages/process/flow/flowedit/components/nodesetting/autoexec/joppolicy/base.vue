<script>
import Edit from '@/views/pages/autoexec/components/param/view';
export default {
  components: {
    ...Edit,
    ExecuteNodeReadonly: resolve => require(['@/views/pages/autoexec/form/component/formresoureces/index.vue'], resolve),
    ProtocolReadonly: resolve => require(['../protocol-readonly'], resolve),
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  props: {
    config: Object,
    allFormitemList: Array
  },
  data() {
    return {
      autoexecConfig: {},
      mappingModeList: [
        {
          text: this.$t('page.constant'),
          value: 'constant'
        },
        {
          text: this.$t('term.process.formcommonitem'),
          value: 'formCommonComponent'
        },
        {
          text: this.$t('term.process.formtableitem'),
          value: 'formTableComponent'
        }
      ],
      validateList: ['required'],
      formDataList: []
    };
  },
  created() {
    this.autoexecConfig = this.config;
    this.formDataList = this.$utils.deepClone(this.allFormitemList);
  },
  methods: {
    executeMappingModeList(key) {
      let list = this.$utils.deepClone(this.mappingModeList);
      if (key === 'executeNodeConfig') {
        return list.filter(item => {
          return item.value != 'constant';
        });
      } else {
        return list.filter(item => {
          return item.value != 'constant' && item.value != 'formTableComponent';
        });
      }
    },
    getRoundCountText(value) {
      let text = value;
      if (value === 0) {
        text = this.$t('page.fulllist');
      } else if (value === 1) {
        text = this.$t('page.allparallel');
      }
      return text;
    },
    getruntimeParamListText(value) {
      let findItem = this.autoexecConfig.runtimeParamList.find(item => item.key === value);
      if (findItem) {
        return findItem.name;
      } else {
        return '';
      }
    },
    changeMappingMode(item, val) {
      if (this.autoexecConfig.createJobPolicy === 'batch' && val === 'formTableComponent') {
        this.$set(item, 'value', this.batchJobDataSource.attributeUuid);
      } else {
        this.$set(item, 'value', null);
      }
      this.$set(item, 'column', null);
      this.$set(item, 'filterList', []);
      this.$set(item, 'isActive', false);
    },
    addFormParam() {
      let obj = {
        key: '',
        value: ''
      };
      this.autoexecConfig.formAttributeList.push(obj);
      this.changeFormItem();
    },
    delFormParam(index) {
      this.autoexecConfig.formAttributeList.splice(index, 1);
      this.changeFormItem();
    },
    changeFormItem() {
      this.formDataList.forEach(e => {
        let find = this.autoexecConfig.formAttributeList.find(f => f.key == e.uuid);
        if (find) {
          this.$set(e, '_disabled', true);
        } else {
          this.$set(e, '_disabled', false);
        }
      });
    }
  },
  computed: {
    getFormComponent() {
      return (type) => {
        let dataList = [];
        if (this.allFormitemList && this.allFormitemList.length > 0) {
          if (type === 'formCommonComponent') { //表单普通组件
            dataList = this.allFormitemList.filter(item => {
              return item.handler != 'formtableselector' && item.handler != 'formtableinputer' && item.handler != 'formcube';
            });
          } else if (type === 'formTableComponent') { //table组件（表格数据组件、表单选择组件）
            dataList = this.allFormitemList.filter(item => {
              return item.handler === 'formtableselector' || item.handler === 'formtableinputer';
            });
          }
        }
        return dataList;
      };
    },
    getAttrList() {
      return (value) => {
        let dataList = [];
        if (this.allFormitemList && this.allFormitemList.length > 0) {
          let find = this.allFormitemList.find(item => item.uuid === value);
          if (find && find.config && find.config.dataConfig) {
            find.config.dataConfig.forEach(d => {
              dataList.push({
                text: d.label,
                value: d.uuid
              });
            });
          }
        }
        return dataList;
      };
    },
    paramType() {
      return (type, key) => {
        let handler = type ? type + key : 'text' + key;
        return handler;
      };
    }
  },
  watch: {
    config: {
      handler: function(val) {
        this.$emit('update', val);
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.item-list {
  line-height: 32px;
}
.form-param-list{
  position: relative;
  padding-right: 20px;
  padding-bottom: 10px;
  .del-btn{
    position: absolute;
    right: 0;
    top: 6px;
    display: none;
  }
  &:hover{
    .del-btn{
      display: block;
    }
  }
}
.tip-eg {
  display: flex;
  align-items: center;
  .center-text {
    position: relative;
    border-bottom: 1px solid;
    margin: 0 16px;
    min-width: 50px;
    &:after {
      font-family: 'tsfont';
      content: '\e899';
      position: absolute;
      bottom: -15px;
      font-size: 18px;
      right: -11px;
    }
  }
}
.filter-top {
  display: flex;
  .label {
    flex: none;
  }
}
.formTableComponent {
  position: relative;
  .formTableComponent-tip {
    position: absolute;
    right: 0;
    top: 0;
  }
}
</style>
