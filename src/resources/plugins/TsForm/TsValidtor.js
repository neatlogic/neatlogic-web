//true 代表校验通过，  false代表校验不通过
import axios from '@/resources/api/http.js';
import utils from '@/resources/assets/js/util.js';
import {$t} from '@/resources/init.js';

let validtor = {
  required: {
    trigger: 'change',
    message: $t('form.placeholder.pleaseinput', {target: $t('page.content')}),
    validator: function(rule, value) {
      if (typeof value == 'string') {
        return value.trim() != '';
      } else if (typeof value == 'undefined' || value === null || value === '') {
        return false;
      } else if (value instanceof Array && value.length === 0) {
        return false;
      }
      return true;
    }
  },
  number: {
    validator: function(rule, value) {
      if (value == '') {
        return true;
      }
      return /^[0-9]\d*$/.test(value);
    },
    trigger: 'change',
    message: $t('form.placeholder.pleaseinput', {target: $t('term.plugin.intgreaterthan0')})
  },
  float: {
    validator: function(rule, value) {
      if (value == '') {
        return true;
      }
      
      return /^-?\d+(\.\d+)?$/.test(value + '');
    },
    trigger: 'change',
    message: $t('form.placeholder.pleaseinput', {target: $t('term.plugin.floatpointnumber')})
  },
  mail: {
    validator: function(rule, value) {
      if (value == '') {
        return true;
      }
      return /^[_a-zA-Z0-9-]{1}([\._a-zA-Z0-9-]+)(\.[_a-zA-Z0-9-]+)*@[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+){1,3}$/.test(value);
    },
    trigger: 'change',
    message: $t('form.placeholder.pleaseinput', {target: $t('page.emailaddress')})
  },
  char: {
    validator: function(rule, value) {
      return /^[a-zA-Z]*$/.test(value);
    },
    trigger: 'change',
    message: $t('form.placeholder.pleaseinput', {target: $t('page.alphabet')})
  },
  chinese: {
    validator: function(rule, value) {
      return /^[\u4e00-\u9fff]$/.test(value);
    },
    trigger: 'change',
    message: $t('form.placeholder.pleaseinput', {target: $t('page.chinesecharacter')})
  },
  dbindex: {
    validator: function(rule, value) {
      return /^[\d]+,[\d]+$/.test(value);
    },
    trigger: 'change',
    message: $t('message.incorrectformat')
  },
  smtp: {
    validator: function(rule, value) {
      return /^smtp\.[a-zA-Z0-9]+(\.[a-zA-Z0-9]+){1,3}(\:[0-9]+){0,1}$/.test(value);
    },
    trigger: 'change',
    message: $t('message.pleaseentertruetarget', {target: $t('term.plugin.smtpserver')})
  },
  pop: {
    validator: function(rule, value) {
      return /^pop\.[a-zA-Z0-9]+(\.[a-zA-Z0-9]+){1,3}(\:[0-9]+){0,1}$/.test(value);
    },
    trigger: 'change',
    message: $t('message.pleaseentertruetarget', {target: $t('term.plugin.popserver')})
  },
  imap: {
    validator: function(rule, value) {
      return /^imap\.[a-zA-Z0-9]+(\.[a-zA-Z0-9]+){1,3}(\:[0-9]+){0,1}$/.test(value);
    },
    trigger: 'change',
    message: $t('message.pleaseentertruetarget', {target: $t('term.plugin.imapserver')})
  },
  ip: {
    validator: function(rule, value) {
      if (value != '') {
        return /^(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])$/.test(value);
      } else {
        return true;
      }
    },
    trigger: 'change',
    message: $t('message.pleaseentertruetarget', {target: $t('page.ipaddress')})
  },
  ipAndPort: {
    validator: function(rule, value) {
      let hasComma = value.indexOf('\n'); // 逗号
      let hasColon = value.indexOf(':'); // 冒号
      if (hasComma != -1) {
        let str = value.split('\n')[1];
        if (str.indexOf(':') != -1) {
          // 验证端口合法性
          return utils.portVerfication(str.split(':')[1]);
        } else {
          // 验证IP合法性
          return utils.ipVerification(str);
        }
      } else if (hasColon != -1) {
        // 验证端口合法性
        return utils.portVerfication(value.split(':')[1]);
      } else {
        // 验证ip合法性
        return utils.ipVerification(value);
      }
    },
    trigger: 'change',
    message: $t('message.pleaseentertruetarget', {target: $t('term.plugin.ipadressandport')})
  },
  cidr: {
    validator: function(rule, value) {
      if (value != '' && value != '*') {
        return /^(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])\/(\d{1}|[0-2]{1}\d{1}|3[0-2])$/.test(value);
      } else {
        return true;
      }
    },
    trigger: 'change',
    message: $t('message.pleaseentertruetarget', {target: $t('page.cidradress')})
  },
  url: {
    validator: function(rule, value) {
      if (value != '') {
        return /^((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+$/.test(value);
      } else {
        return true;
      }
    },
    trigger: 'change',
    message: $t('message.pleaseentertruetarget', {target: 'URL'})
  },
  phone: {
    validator: function(rule, value) {
      if (value != '') {
        return /^[1][3,4,5,7,8][0-9]{9}$/.test(value);
      } else {
        return true;
      }
    },
    trigger: 'change',
    message: $t('message.pleaseentertruetarget', {target: $t('page.phonenumber')})
  },
  maxNum: {
    validator: function(rule, value) {
      return /^[0-9]\d*|(\-1)$/.test(value);
    },
    trigger: 'change',
    message: $t('message.pleaseentertruetarget', {target: $t('term.plugin.positivenumberor-1')})
  },
  PeriodOfTime: {
    validator: function(rule, value) {
      return /^(?:[0-1]?[0-9]|2[0-3]):[0-5]?[0-9]-(?:[0-1]?[0-9]|2[0-3]):[0-5]?[0-9](?: +(?:[0-1]?[0-9]|2[0-3]):[0-5]?[0-9]-(?:[0-1]?[0-9]|2[0-3]):[0-5]?[0-9])*$/.test(value);
    },
    trigger: 'change',
    message: $t('message.plugin.correcttimerangedesc')
  },
  exclude: {
    validator: function(rule, value) {
      if (value == '') {
        return true;
      }
      if (/^(((\d)(-\d)?(,)?)*)$/.test(value)) {
        var flag = true;
        var arr = new Array();
        arr = value.trim().split(/-|,/);
        for (var i = 0; i < arr.length; i++) {
          if (arr[i] < 0 || arr[i] > 255 || arr[i] > arr[i + 1]) {
            flag = false;
          }
        }
        if (flag) {
          return true;
        }
      }
      return false;
    },
    trigger: 'change',
    message: $t('message.pleaseentertruetarget', {target: $t('term.plugin.adress')})

  },
  port: {
    validator: function(rule, value) {
      if (value == '') {
        return true;
      }
      if (isNaN(value)) {
        return false;
      }

      if (parseInt(value, 10) != value) {
        return false;
      }

      if (parseInt(value, 10) < 0 || parseInt(value) > 65535) {
        return false;
      }
      return true;
    },
    trigger: 'change',
    message: $t('form.placeholder.pleaseinput', {target: $t('term.plugin.65535')})
  },
  mask: {
    validator: function(rule, value) {
      if (value == '') {
        return true;
      }
      if (isNaN(value)) {
        return false;
      }

      if (parseInt(value, 10) != value) {
        return false;
      }

      if (parseInt(value, 10) < 0 || parseInt(value) > 32) {
        return false;
      }
      return true;
    },
    trigger: 'change',
    message: $t('message.pleaseentertruetarget', {target: $t('term.plugin.mask')})

  },
  integer_p: {
    validator: function(rule, value) {
      if (value == '') return true;
      if (isNaN(value)) return false;
      if (parseInt(value) != value) return false;
      if (parseInt(value) <= 0) return false;
      return true;
    },
    trigger: 'change',
    message: $t('form.placeholder.pleaseinput', {target: $t('page.positiveinteger')})

  },
  integer_natural: {
    validator: function(rule, value) {
      if (value == '') return true;
      if (isNaN(value)) return false;
      if (parseInt(value) != value) return false;
      if (parseInt(value) < 0) return false;
      return true;
    },
    trigger: 'change',
    message: $t('form.placeholder.pleaseinput', {target: $t('term.plugin.nonnegativeint')})

  },
  integer: {
    validator: function(rule, value) {
      if (isNaN(value)) return false;
      if (parseInt(value) != value) return false;
      return true;
    },
    trigger: 'change',
    message: $t('form.placeholder.pleaseinput', {target: $t('term.plugin.int')})
  },
  range: {
    validator: function(rule, value) {
      if (value.indexOf('-') == -1) {
        return false;
      } else {
        var vs = value.split('-');
        if (vs.length != 2) {
          return false;
        }
        if (isNaN(parseFloat(vs[0])) || isNaN(parseFloat(vs[1]))) {
          return false;
        }
        if (parseFloat(vs[0]) > parseFloat(vs[1])) {
          return false;
        }
      }
      return true;
    },
    trigger: 'change',
    message: $t('message.accordingformat')
  },
  stepindex: {
    validator: function(rule, value) {
      value = value.trim();
      if (value != '') {
        if (value.indexOf('.') > -1) {
          var vl = value.split('.');
          for (var v in vl) {
            if (v % 2 == 0) {
              if (isNaN(parseInt(vl[v], 10))) {
                return false;
              }
            } else {
              if (vl[v].length != 1) {
                return false;
              }
              var cc = vl[v].charCodeAt();
              if ((cc >= 65 && cc <= 90) || (cc >= 97 && cc <= 122)) {
                //
              } else {
                return false;
              }
            }
          }
        } else {
          if (isNaN(parseInt(value, 10))) {
            return false;
          }
        }
      }
      return true;
    },
    trigger: 'change',
    message: $t('message.plugin.serialnumberdesc')
  },
  enchar: {
    validator: function(rule, value) {
      return /^[a-zA-Z\d]*$/.test(value);
    },
    trigger: 'change',
    message: $t('form.placeholder.pleaseinput', {target: $t('term.plugin.alphabetornumber')})

  },
  enchar_space: {
    name: 'enchar_space',
    validator: function(rule, value) {
      return /^[a-zA-Z\d\.\ \_]*$/.test(value);
    },
    trigger: 'change',
    message: $t('form.placeholder.pleaseinput', {target: $t('term.plugin.alphabetnumberempty')})

  },
  unique_ident: {
    name: 'unique_ident',
    validator: function(rule, value) {
      return /^[a-zA-Z_]*$/.test(value);
    },
    trigger: 'change',
    message: $t('form.placeholder.pleaseinput', {target: $t('page.alphabet')})

  },
  uppercase: {
    name: 'uppercase',
    validator: function(rule, value) {
      return /^[A-Z]*$/.test(value);
    },
    trigger: 'change',
    message: $t('form.placeholder.pleaseinput', {target: $t('term.plugin.capalphabet')})

  },
  lowercase: {
    name: 'lowercase',
    validator: function(rule, value) {
      return /^[a-z]*$/.test(value);
    },
    trigger: 'change',
    message: $t('form.placeholder.pleaseinput', {target: $t('term.plugin.loweralphabet')})

  },
  parameter: {
    validator: function(rule, value) {
      return /^[a-zA-Z_][a-zA-Z0-9_\.]*$/.test(value);
    },
    trigger: 'change',
    message: $t('message.plugin.variablenamedesc')
  },
  month: {
    validator: function(rule, value) {
      if (value == '') {
        return false;
      }
      if (isNaN(value)) {
        return false;
      }
      if (parseInt(value) < 1 || parseInt(value) > 12) {
        return false;
      }
      return true;
    },
    trigger: 'change',
    message: $t('form.placeholder.pleaseinput', {target: $t('term.plugin.1to12')})

  },
  check: {
    validator: function(rule, value) {
      if (!value) {
        return false;
      }
      return true;
    },
    trigger: 'change',
    message: $t('page.pleaseselect')
  },
  'non-special': {
    validator: function(rule, value) {
      if (value) {
        return !/[<>"']/.test(value);
      }
      return true;
    },
    trigger: 'change',
    message: $t('message.plugin.donotinput')
  },
  passcode: {
    validator: function(rule, value) {
      return /(?!.*[\u4E00-\u9FA5\s])(?!^[a-zA-Z]+$)(?!^[\d]+$)(?!^[^a-zA-Z\d]+$)^.{8,20}$/.test(value);
    },
    trigger: 'change',
    message: $t('message.passcode')
  },
  'name-special': {
    validator: function(rule, value) {
      return /^[A-Za-z._-\d\u4e00-\u9fa5]*$/.test(value);
    },
    trigger: 'change',
    message: $t('message.plugin.supporttype1')
  },
  'key-special': {
    validator: function(rule, value) {
      return /^[A-Za-z._-\d]*$/.test(value);
    },
    trigger: 'change',
    message: $t('message.plugin.supporttype2')
  },
  token: {
    validator: function(rule, value) {
      return /^[A-Za-z\d_/]+$/.test(value);
    },
    trigger: 'change',
    message: $t('message.plugin.supporttype3')
  },
  regex: {
    validator: function(rule, value) {
      let pattern = rule.pattern || this.pattern;
      if (typeof value != 'undefined' && value != null && typeof value == 'string' && value.trim() != '') {
        var reg = new RegExp(pattern);
        return reg.test(value);
      }
      return true;
    },
    pattern: '', //  ^ [a - z] + $ 正则表达式
    trigger: 'change',
    message: $t('form.placeholder.pleaseinput', {target: $t('term.plugin.properlyformattestring')})

  },
  searchUrl: {  
    validator: function(rule, value, vueNode) {
      rule = rule || this;
      let _this = this;
      this.searchTime && clearTimeout(this.searchTime);
      if (utils.isEmpty(value)) { //值为空时不进行调用接口，校验通过
        _this.searchTime = null;
        _this.cancelAxios = null;
        _this.isValid = true;
        vueNode.$set(vueNode, 'validMesage', '');
        return true;
      }
   
      this.searchTime = setTimeout(function() {
        //调用接口的预处理
        let cancel = _this.cancelAxios;
        cancel && (_this.cancelAxios = null) && cancel.cancel();
        const CancelToken = axios.CancelToken;
        _this.cancelAxios = CancelToken.source();
        let params = typeof rule.params === 'function' ? rule.params(value, rule) || {} : rule.params || {};
        let headers = {unConsole: 1 };
        let key = rule.key || vueNode.name;
        if (key) {
          params[key] = value;
          headers['neatlogic-validfield'] = key;
        }
        let errorMessage = '';
        axios.post(rule.url, params, { cancelToken: _this.cancelAxios.token, headers: headers}).then(res => {
          _this.isValid = true;
          if (res.Status == 'OK') {
            if (!res.Return) {
              vueNode.validMesage == _this.errorMessage ? errorMessage = '' : errorMessage = vueNode.validMesage;
              _this.isValid = true;
            } else {
              _this.errorMessage = errorMessage = rule.message || res.Message;
              _this.isValid = false;
            }
          } else {
            _this.errorMessage = errorMessage = rule.message || res.Message;
            _this.isValid = false;
          }
        }).catch(res => {
          if (res.response.status == 530) {
            //翻译处理
            let text = res.response.data.Message;
            let arr = text.split('.');
            let text1 = vueNode.$i18n.t(text, res.response.data.Param);
            if (!(arr.length < 1 || text1 == text)) {
              text = text1;
            } 
            _this.errorMessage = errorMessage = _this.message || text;
            _this.isValid = false;
          }
        }).finally(() => {
          _this.searchTime = null;
          _this.cancelAxios = null;
          vueNode.$set(vueNode, 'validMesage', errorMessage);
          rule.validSearchUrl && rule.validSearchUrl(_this.isValid, errorMessage);
        });
      }, 500);
      return true;
    },
    isSearch: true,
    url: '',
    trigger: 'change'
  },
  highriskcode: {
    name: 'highriskcode',
    validator: function(rule, value) {
      var flag = true;
      if (value) {
        let arr = ['shutdown', 'reboot', 'rm'];
        for (var i = 0; i < arr.length; i++) {
          if (value.indexOf(arr[i]) > -1) {
            flag = false;
            break;
          }
        }
        return flag;
      }
      return true;
    },
    trigger: 'change',
    message: $t('message.plugin.highriskcode')
  }
};

//module.exports.default =module.exports = validtor;

export default validtor;
