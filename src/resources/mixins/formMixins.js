import validtorJson from '@/resources/plugins/TsForm/TsValidtor';
export default {
  props: {
    forbidContent: {//禁止输入的字符串，主要用于通过allowCreate来创建选项时，主要是为了防止xss攻击 一般情况下面值为 ['<', '>', '"', "'", '&'] , 生效情况search 时
      type: [String, Array],
      default: ''
    },
    readonlyClass: {
      type: String,
      default: 'tsform-readonly'
    },
    errorMessage: String, //从外部设置校验信息
    validateList: {
      type: Array
    },
    readonly: {
      type: Boolean,
      default: false
    },
    disabled: {
      //true  false  默认为false
      type: Boolean,
      default: false
    },
    className: {
      //额外添加class
      type: String
    },
    size: String, // large  small  default   默认为default
    border: {//控件的样式 none(默认值，只有背景) border(有边框背景) bottom(有下边框无背景) nobg(无背景) nobdbg(无边框背景)
      type: String
    }, 
    width: {
      //small  medium   large  block    输入数值    输入百分比
      type: [String, Number],
      default: '100%'
    },
    desc: String,
    descType: String, //描述用alert组件进行包裹  info、success、warning、error
    clearable: Boolean,
    readonlyTextIsHighlight: { type: Boolean, default: false } // 只读模式下，是否需要高亮显示值
  },
  methods: {
    dispatch(componentName, eventName, params) {
      let parent = this.$parent || this.$root;
      let name = parent.$options.name;

      while (parent && (!name || name !== componentName)) {
        parent = parent.$parent;

        if (parent) {
          name = parent.$options.name;
        }
      }
      if (parent) {
        parent.$emit.apply(parent, [eventName].concat(params));
      }
    },
    broadcast(componentName, eventName, params) {
      broadcast.call(this, componentName, eventName, params);
    },
    filterValid(validateList) { //预处理validateList，使其格式统一方便统一校验
      let _this = this;
      this.isRequired = false;
      let resultValidtorJson = [];
      if (validateList && validateList.length > 0) {
        //默认值的初始化
        //表单验证 对required进行特殊处理添加 required: true属性

        validateList.forEach(function(valid, c) {
          if (typeof valid == 'string') {
            //出入key值，利用默认数据         
            validtorJson[valid] && (valid == 'required' ? resultValidtorJson.push(Object.assign({ required: true }, validtorJson[valid])) : resultValidtorJson.push(validtorJson[valid]));
            if (valid == 'required') {
              _this.isRequired = true;
            }
          } else if (typeof valid == 'object') {
            if (validtorJson[valid.name] && valid.name == 'regex' && valid.pattern) {
              // ^[a-z]+$   正则表达式
              resultValidtorJson.push(Object.assign({}, validtorJson.regex, valid));
            } else if (validtorJson[valid.name]) {
              //利用默认key值，但是修改message提示
              valid.name == 'required' ? resultValidtorJson.push(Object.assign({ required: true }, validtorJson[valid.name], valid)) : resultValidtorJson.push(Object.assign({}, validtorJson[valid.name], valid));
              if (valid.name == 'required') {
                _this.isRequired = true;
              }
            } else if (typeof valid.validator == 'function') {
              resultValidtorJson.push(Object.assign({}, validtorJson[valid.name], valid));
            }
          }
        });
      }
      return resultValidtorJson;
    },
    valid(val, isForm) { //isForm从TsForm最终校验 现阶段主要过滤searchUrl 校验
      let _this = this;
      let isValid = true;
     
      if (_this.currentValidList && _this.currentValidList.length > 0 && !this.readonly && !this.disabled) {
        for (let i = 0; i < _this.currentValidList.length; i++) {
          let valid = _this.currentValidList[i];
          isValid = true;
          let value = val || _this.currentValue;
          if (Array.isArray(value)) {
            let valueList = [];
            value.forEach(v => {
              if (v != false && !this.$utils.isEmpty(v)) {
                valueList.push(v);
              }
            });
            value = valueList;
            if ((value.length == 0) && valid.required) {
              _this.$set(_this, 'validMesage', valid.message);
              isValid = false;
            }
          } else {
            value = [value];
          }
      
          for (let cindex = 0; cindex < value.length; cindex++) {
            let v = value[cindex];
          
            if (isForm && valid.isSearch) { //isSearch: TsForm校验 判断searchUrl 校验
              if (valid.isValid === false) {
                _this.$set(_this, 'validMesage', valid.errorMessage);
                isValid = false;
              }
            } else if (!valid.validator('', v, _this)) {
              _this.$set(_this, 'validMesage', valid.message);
              isValid = false;
              break;
            }
          }
          if (isValid && !!this.errorMessage) {
            _this.$set(_this, 'validMesage', this.errorMessage);
            isValid = false;
            break;
          }
          if (isValid && !!_this.validMesage) {
            _this.$set(_this, 'validMesage', '');
          } else if (!isValid) {
            break;
          }
        }
      }
      if (this.$slots.validMessage) { //校验卡槽存在则为false 移到后面的原因是 this.$slots.validMessage为空的设置需要等下一次render，这个时候validMessage为空导致插件校验显示出错
        isValid = false;
      }
      if (isValid && this.currentValidDate) {
        isValid = this.currentValidDate(val || this.currentValue);
        !isValid && this.$set(this, 'validMesage', this.currentValidMesage);
      }
      if (isValid && this.currentValidTimeSelect) {
        // timeSelect 下拉验证
        isValid = this.currentValidTimeSelect(val || this.currentValue);
        !isValid && this.$set(this, 'validMesage', this.validMesage);
      }
      return isValid;
    },
    canValid(way, validateList) { //是否可以触发校验 way 触发校验的类型 change blur
      let canWary = false;
      for (let i = 0; i < validateList.length; i++) {
        if (validateList[i] && validateList[i].trigger.indexOf(way) >= 0) {
          canWary = true;
          break;
        }
      }
      return canWary;
    }
  },
  computed: {
    getForbidContent: function() { //获取被禁止字符串的正则表达式
      let list = this.forbidContent || [];
      if (this.forbidContent && typeof this.forbidContent == 'string') {
        list = [];
        for (let key of this.forbidContent) {
          list.push(key);
        }
      }
      let regStr = '';
      if (list.length > 0) {
        list.forEach(item => {
          regStr = regStr + (regStr ? '|' : '') + item;
        });
        regStr = regStr ? '(' + regStr + ')' : regStr;
      }
      return regStr;
    },
    getStyle: function() { //主要计算组件的宽度
      let _this = this;
      let resultJson = {};
  
      if (typeof _this.width == 'number') {
        resultJson.width = _this.width + 'px';
      } else if (typeof _this.width == 'string') {
        resultJson.width = _this.width;
      }
      return resultJson;
    },
    borderClass: function() {
      let resultJson = {};
      if (this.border) {
        resultJson['tsForm-border-' + this.border] = true;
        resultJson['tsForm-item'] = true;
      }
      this.className && (resultJson[this.className] = true);
      return resultJson;
    },
    readonlyTextHighlightClass() {
      // 只读模式下，文案是否需要高亮
      let className = '';
      if (this.readonlyTextIsHighlight) {
        className = 'text-warning';
      }
      return className;
    }
  },

  watch: {
    errorMessage(newValue) {
      this.validMesage = newValue;
    },
    validateList() {
      let _this = this;
      _this.currentValidList = _this.filterValid(_this.validateList) || [];
      _this.validMesage = '';
    }
  }
};
