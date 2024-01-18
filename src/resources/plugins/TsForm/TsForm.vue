<script>
import TsFormItem from '@/resources/plugins/TsForm/TsFormItem';
import item from './index.js';
const ITEMTYPELIST = {
  text: 'TsFormInput', //text类型
  textarea: 'TsFormInput', //textarea
  password: 'TsFormInput', //password
  number: 'TsFormInput', //number
  url: 'TsFormInput', //url
  email: 'TsFormInput', //email
  tel: 'TsFormInput', //tel
  select: 'TsFormSelect', //下拉选择框
  radio: 'TsFormRadio', //radio
  switch: 'TsFormSwitch', //
  checkbox: 'TsFormCheckbox',
  date: 'TsFormDatePicker', //年-月-日 时：分：秒
  datetime: 'TsFormDatePicker', //年-月-日 时：分：秒
  daterange: 'TsFormDatePicker', //年-月-日   范围
  datetimerange: 'TsFormDatePicker', //年-月-日 时：分：秒   范围
  year: 'TsFormDatePicker', //年
  month: 'TsFormDatePicker', //月
  time: 'TsFormDatePicker', //时间 时：分：秒
  timerange: 'TsFormDatePicker', //时间 时：分：秒  范围
  tree: 'TsFormTree', //ztree树形插件
  quartz: 'TsQuartz', //定时器插件
  textspan: '', //存文本显示
  userselect: 'UserSelect', //用户授权
  teamselect: 'UserSelect', //分组授权
  roleselect: 'UserSelect', //角色授权
  ckeditor: 'TsCkeditor', //富文本编辑框
  codemirror: 'TsCodemirror',
  timeselect: 'TimeSelect',
  cascader: 'TsFormCascader' //级联选择
};

export default {
  name: 'TsForm',
  components: {
    ...item
  },
  model: {
    prop: 'dataConfig',
    event: 'change'
  },
  props: {
    labelPosition: {
      //取值  top  right
      type: String,
      default: 'right'
    },
    labelAlign: {
      type: String,
      default: 'top',
      validator(value) {
        return ['top', 'center'].includes(value);
      }
    },
    tooltip: {
      type: String, //label右侧的tooltip提示文本
      default: ''
    },
    tipPlacement: {
      type: String, //label右侧的tooltip提示文本方向
      default: 'top-start'
    },
    itemList: { type: [Array, Object], required: true },
    dataConfig: {
      type: [Object, String, Boolean]
    }, //格式{name1:value1,name2:value2}
    labelWidth: {
      type: Number,
      default: 120
    },
    border: {
      //控件的样式
      type: String, //border bottom none
      default: 'border'
    },
    itemWidth: {
      type: [Number, String], //数字和百分比
      default: '100%'
    },
    width: {
      type: [String, Number],
      default: '100%' // 默认改为100%，之前是75%
    },
    readonly: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    isHidden: {
      type: Boolean,
      default: false
    },
    filterEmpty: {
      //当属性对应的值胃口时是否需要把属性从dataConfig中移除
      type: Boolean,
      default: false
    },
    theme: Object //主题
  },
  data: function() {
    let _this = this;
    let formSetting = _this.getFormSetting(_this.itemList);
    return {
      ref: new Date().toString() + Math.random(),
      formItem: _this.getFormSetting(_this.itemList),
      initItem: _this.getFormSetting(_this.itemList, true),
      textConfig: {},
      valueConfig: {}
    };
  },
  created() {},
  methods: {
    getFormSetting: function(itemList, isRest) {
      let _this = this;
      let isArray = itemList instanceof Array;
      let resultItemJson = {};
      if (itemList) {
        let isArray = _this.itemList instanceof Array;
        for (let key in itemList) {
          let item = itemList[key];
          let keyName = isArray ? item.name : key;
          if ((typeof item.value == 'undefined' || item.value == null || (typeof item.value == 'string' && item.value.trim() == '')) && !isRest) {
            resultItemJson[keyName] = null;
          } else {
            resultItemJson[keyName] = item.value;
          }
        }
      }
      return resultItemJson;
    },
    getFormValue: function() {
      let _this = this;
      _this.formItem = _this.getFormSetting(_this.itemList);
      return _this.formItem;
    },
    getItemByName: function(name) {
      var _this = this;
      var resultJson = null;
      let isArray = _this.itemList instanceof Array;
      for (let key in _this.itemList) {
        let item = _this.itemList[key];
        let keyName = isArray ? item.name : key;
        if (keyName == name) {
          resultJson = item;
          return false;
        }
      }
      return resultJson;
    },
    resetForm: function() {
      let _this = this;
      let isArray = _this.itemList instanceof Array;
      for (let key in _this.itemList) {
        let item = _this.itemList[key];
        let keyName = isArray ? item.name : key;
        item.value = _this.initItem[keyName];
      }
    },
    clearForm: function(val, name) {
      var _this = this;
      for (let key in _this.itemList) {
        let item = _this.itemList[key];
        if ((item.type == 'select' && item.multiple == true) || item.type == 'checkbox' || item.type == 'datetimerange' || item.type == 'timerange' || (item.multiple == true && item.type == 'userselect')) {
          item.value = [];
        } else {
          item.value = '';
        }
      }
    },
    valid: function(isMessage) {
      this.$children[0] && this.$children[0].$options.customOption;
      let _this = this;
      let isValid = true;
      let messageList = [];
      this.$children.forEach(item => {
        item.$children.forEach(component => {
          let message = { label: item.label };
          if (component.$options.tagComponent == 'TsForm' && component.valid) {
            if (!component.valid(null, true)) {
              isValid = false;
              message.text = component.validMesage;
              messageList.push(message);
            }
          }
        });
      });
      return isMessage ? messageList : isValid;
    },
    clearFormInput() {
      // 解决CombineSearcher组件，input输入框组件，清空值失效的问题
      this.textConfig = {};
    }
  },
  computed: {
    widthClass() {
      let _this = this;
      let returnClass = { tsForm: true };
      returnClass['tsForm-border-' + _this.border] = true; // 边框的样式
      _this.itemWidth != '100%' && (returnClass.formFlex = true);
      returnClass['ivu-form-label-' + _this.labelPosition] = true;
      return returnClass;
    }
  },
  watch: {
    textConfig: {
      handler(val) {
        this.$emit('update:textConfig', val);
      },
      deep: true,
      immediate: true
    },
    dataConfig: {
      handler(currentval) {
        let _this = this;
        if (currentval && typeof currentval == 'object') {
          let isArray = false;
          let isSame = this.$utils.isSame(currentval, _this.valueConfig);
          let val = this.$utils.deepClone(currentval);
          if (!isSame) {
            _this.valueConfig = this.$utils.deepClone(val);
          }
          _this.itemList instanceof Array ? (isArray = true) : ''; //判断值是array还是object
          if (val && Object.keys(val).length) {
            for (let key in _this.itemList) {
              let item = _this.itemList[key];
              !isArray && (item.name = key);
              if (val[item.name] || typeof val[item.name] == 'number' || typeof val[item.name] == 'boolean') {
                _this.$set(item, 'value', val[item.name]);
              } else {
                if ((item.type == 'select' && item.multiple == true) || item.type == 'checkbox' || item.type == 'datetimerange' || item.type == 'timerange' || (item.multiple == true && item.type == 'userselect')) {
                  _this.$set(item, 'value', []);
                } else {
                  _this.$set(item, 'value', null);
                }
              }
            }
          } else {
            for (let key in _this.itemList) {
              let item = _this.itemList[key];
              !isArray && (item.name = key);
              if ((item.type == 'select' && item.multiple == true) || item.type == 'checkbox' || item.type == 'datetimerange' || item.type == 'timerange' || (item.multiple == true && item.type == 'userselect')) {
                _this.$set(item, 'value', []);
              } else {
                _this.$set(item, 'value', null);
              }
            }
          }
        }
      },
      deep: true,
      immediate: true
    },
    valueConfig: {
      handler(val, oldval) {
        let _this = this;
        let isSame = this.$utils.isSame(val, _this.dataConfig);
        if (!isSame) {
          this.$emit('change', val);
        }
      },
      deep: true
    }
  },
  render(h, cx) {
    let $formItem = [];
    let _this = this;
    let isArray = false;
    _this.itemList instanceof Array ? (isArray = true) : ''; //判断值是array还是object
    for (let i in _this.itemList) {
      let item = _this.itemList[i];
      let $handler = null;
      !isArray && (item.name = i);
      //当不含有value值时,需要动态的设置值
      if (!item.hasOwnProperty('value')) {
        if ((item.type == 'select' && item.multiple == true) || item.type == 'checkbox' || item.type == 'datetimerange' || item.type == 'timerange' || (item.multiple == true && item.type == 'userselect')) {
          _this.$set(item, 'value', []);
        } else {
          _this.$set(item, 'value', null);
        }
      }

      if (item.isHidden) {
        continue;
      }
      if (item.type == 'slot') {
        //卡槽类型的判断
        $handler = _this.$scopedSlots[item.name]
          ? _this.$scopedSlots[item.name]({
            valueConfig: _this.valueConfig,
            textConfig: _this.textConfig
          })
          : null;
      } else if (item.type == 'textspan') {
        //纯文本的显示
        $handler = h('div', { domProps: { innerHTML: item.value } });
      } else if (ITEMTYPELIST[item.type]) {
        //主要用来回显input框的数据
        item.width = item.width || _this.width;
        item.theme = _this.$utils.deepClone(_this.theme);
        $handler = h(ITEMTYPELIST[item.type], {
          key: item.name,
          props: item,
          on: {
            change(val) {
              //实现v-model功能
              let isRemove = false; //如果是空的需要从值的数组里移除
              if ((!val && typeof val != 'number' && typeof val != 'boolean') || (typeof val == 'object' && !val.length)) {
                isRemove = true;
              }
              if (_this.filterEmpty) {
                if (isRemove && (_this.valueConfig[item.name] || typeof _this.valueConfig[item.name] == 'boolean' || typeof _this.valueConfig[item.name] == 'number')) {
                  if (typeof val == 'object') {
                    // 解决change的值是对象时，combieSearch 组件，双向绑定值失效的问题
                    _this.$set(_this.valueConfig, item.name, val);
                  } else {
                    _this.$delete(_this.valueConfig, item.name);
                    _this.textConfig && _this.textConfig[item.name] && _this.$delete(_this.textConfig, item.name);
                  }
                } else if (!isRemove && _this.valueConfig && typeof _this.valueConfig == 'object') {
                  _this.$set(_this.valueConfig, item.name, val);
                  _this.textConfig && _this.$set(_this.textConfig, item.name, val);
                } else if (isRemove) {
                  // 解决change的值是对象时，combieSearch 组件，双向绑定值失效的问题
                  _this.$set(_this.valueConfig, item.name, val);
                }
              } else {
                _this.$set(_this.valueConfig, item.name, val);
                _this.textConfig && _this.$set(_this.textConfig, item.name, val);
              }

              item.value = val;
            },
            'change-label'(val) {
              let isRemove = false; //如果是空的需要从值的数组里移除
              if ((!val && typeof value != 'number' && typeof value != 'boolean') || (typeof val == 'object' && !val.length)) {
                isRemove = true;
              }
              if (_this.filterEmpty) {
                if (isRemove && _this.textConfig[item.name]) {
                  _this.$delete(_this.textConfig, item.name);
                } else if (!isRemove) {
                  _this.$set(_this.textConfig, item.name, val);
                }
              } else {
                _this.$set(_this.textConfig, item.name, val);
              }
            }
          }
        });
      }
      let con = item.hideLabel ? 'div' : TsFormItem;
      let $item = h(
        con,
        {
          props: {
            label: item.label,
            type: ITEMTYPELIST[item.type] || 'slot',
            theme: _this.theme,
            validateList: item.validateList,
            itemWidth: item.itemWidth || _this.itemWidth,
            labelPosition: item.labelPosition || _this.labelPosition,
            contentAlign: item.contentAlign,
            labelAlign: item.labelAlign || _this.labelAlign,
            tooltip: item.tooltip || _this.tooltip,
            tipPlacement: item.tipPlacement || _this.tipPlacement,
            labelWidth: item.labelWidth || _this.labelWidth,
            name: item.name,
            readonly: item.hasOwnProperty('readonly') ? item.readonly : _this.readonly,
            disabled: item.hasOwnProperty('disabled') ? item.disabled : _this.disabled,
            isHidden: item.hasOwnProperty('isHidden') ? item.isHidden : _this.isHidden
          }
        },
        [$handler]
      );

      $formItem.push($item);
    }
    return h('div', { class: _this.widthClass }, $formItem);
  }
};
</script>
<style scoped>
.formFlex {
  display: -webkit-flex;
  justify-content: space-between;
  flex-direction: row;
  flex-wrap: wrap;
}
.formFlex > .ivu-form-item {
  padding: 0px 10px;
}
</style>
