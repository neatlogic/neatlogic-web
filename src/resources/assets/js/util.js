/*
getCookie(name)                              获取cookie为name的值
setCookie(name, value, time)                 设置cookie为name的值为value，期限是time(如果是数字，单位为天；如果是字符串，直接赋值结束时间)
removeCookie(name)                           清除cookie为name的值
deepClone(data)                              复制数据（不改动原数据）
setUuid()                                    生成32位随机uuid
getCurrenttime(format)                       根据指定格式格式化当前时间输出格式
sortNumber()                                 数字排序
getDateByFormat(value, format, styleType)    通过时间戳获取指定格式的日期
toggleClass(el, classname, type)             修改class 1、el:目标元素  2、cls:需要操作的class  3、type:"add"代表添加对应的class  "remove"代码删除对应的class 如果不传则有则删除，没有则添加
getValueByPath(value, path, isArrary)        值的为空判断 如果是数组，数组的长度判断 //1、value：[Nothing]需要做判断的值, 2、path：[String]需要层层遍历的  3、isArrary:[Boolean]最终获取的值是数组，而且数组的长度大于0
checkType(value, type)                       检查value类型，如果type为空则返回值的类型
validForm($el,$scroll)                       整体表单控件校验,并且滚动到报错地方 可以传dom对象，也可以传选择器字符串
isSame(str1, str2)                           判断str1和str2是否相等
translateNumber(values, codeType)            将阿拉伯数字转为对应需要的格式（中文一二三或者英文ABCD）
getLightColor(colors, level, noOpacity)      将十六进制hex的colors按减淡level（小数点数字）后得到的颜色值，当noOpacity为true时为十六进制hex，默认是按百分比透明度处理
isEmptyObj(obj)                              判断对象是否为空
goBack(fromPath, url)                        返回上一步
isEmpty(val)                                 判断数据是否为空：null undefined '' []  {} 五中情况情况中的任何一种则为true
uniqueArr(list)                              数组对象去重，返回去重后的数组
uniqueByField(arr,filterField)               根据某个字段，数组去重，返回去重后的数组，filterField需要去重的字段
matrixDataSourceRedirect(dataSourceId,dataSourceJson) 根据矩阵不同数据源，跳转不同页面
copyText(id)                                 点击复制内容，id表示需要复制元素的id，使用方法：this.$utils.copyText('#codeContent')
mapArray(array, key)                         //从数组对象中挑出一个key，将其值作为数组返回
intersectionArr                              // 返回一个包含所有传入数组交集元素的新数组。
getComposedPath(e)                           // 返回事件流中元素的事件路径
removeHTMLTag(str)                           //去除html标签
evalWithLineNumber(e, code)                  //利用eval解析时，具体报错信息和行号
isImage(filename)                            //判断是否是图片
*/
import _ from 'lodash';
import store from '@/resources/store';
import ViewUI from 'neatlogic-ui/iview/index.js';
import { $t } from '@/resources/init.js';
const methods = {
  getCookie: function (name) {
    if (name) {
      let cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
        let ci = cookies[i];
        while (ci.charAt(0) == ' ') ci = ci.substring(1);
        if (ci.indexOf(name) >= 0) {
          return ci.substring(name.length + 1, ci.length);
        }
      }
    }
  },
  setCookie: function (name, value, time) {
    if (time) {
      if (typeof time == Number) {
        let d = new Date();
        d.setTime(d.getTime() + time * 24 * 60 * 60 * 1000);
        let expires = 'expires=' + d.toGMTString();
        document.cookie = name + '=' + value + '; ' + expires + ';path=' + HOME + ';';
      } else {
        document.cookie = name + '=' + value + '; expires=' + time + ';path=' + HOME + ';';
      }
    } else {
      document.cookie = name + '=' + encodeURIComponent(value);
    }
  },
  removeCookie: function (name) {
    this.setCookie(name, ' ', new Date(0).toUTCString());
  },
  deepClone(data) {
    return _.cloneDeep(data);
  },
  setUuid() {
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      let r = (Math.random() * 16) | 0;
      let v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  },
  getCurrenttime(format) {
    // 参数默认格式：年月日 时:分:秒，其他选项：["HH:mm:ss","yyyy-MM-dd","HH:mm","MMdd", "yyyyMMddHHmmss"]
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    if (month <= 9) {
      month = '0' + month;
    }
    if (day <= 9) {
      day = '0' + day;
    }
    if (hours <= 9) {
      hours = '0' + hours;
    }
    if (minutes <= 9) {
      minutes = '0' + minutes;
    }
    if (seconds <= 9) {
      seconds = '0' + seconds;
    }
    let timestr = year + $t('page.year') + month + $t('page.month') + day + $t('page.da') + hours + ':' + minutes + ':' + seconds;
    if (format == 'HH:mm:ss') {
      timestr = hours + ':' + minutes + ':' + seconds;
    } else if (format == 'yyyy-MM-dd') {
      timestr = year + '-' + month + '-' + day;
    } else if (format == 'HH:mm') {
      timestr = hours + ':' + minutes;
    } else if (format == 'MMdd') {
      timestr = [month, day].join('');
    } else if (format == 'yyyyMMddHHmmss') {
      timestr = `${year}${month}${day}${hours}${minutes}${seconds}`;
    }
    return timestr;
  },
  getDateByFormat(value, format, styleType) {
    // 时间戳，转成字符串
    value = new Date(value);
    styleType = styleType || '-';
    format = format || 'yyyy-MM-dd HH:mm:ss';
    let newValue = '';
    if (format.indexOf('yyyy') >= 0) {
      newValue = value.getFullYear();
    }

    if (format.indexOf('MM') >= 0) {
      let mm = value.getMonth() + 1;
      mm < 10 && (mm = '0' + mm);
      newValue = newValue ? newValue + styleType + mm : mm;
    }

    if (format.indexOf('dd') >= 0) {
      let dd = value.getDate();
      dd < 10 && (dd = '0' + dd);
      newValue = newValue ? newValue + styleType + dd : newValue + dd;
    }

    if (format.indexOf('HH') >= 0) {
      let HH = value.getHours();
      HH < 10 && (HH = '0' + HH);
      newValue = newValue ? newValue + ' ' + HH : newValue + HH;
    }

    if (format.indexOf('mm') >= 0) {
      let mm = value.getMinutes();
      mm < 10 && (mm = '0' + mm);
      newValue = format.indexOf('HH') >= 0 ? newValue + ':' + mm : newValue + ' ' + mm;
    }

    if (format.indexOf('ss') >= 0) {
      let ss = value.getSeconds();
      ss < 10 && (ss = '0' + ss);
      newValue = format.indexOf('mm') >= 0 ? newValue + ':' + ss : newValue + ' ' + ss;
    }
    return newValue.toString().trim();
  },
  sortNumber() {
    return function (a, b) {
      return a - b;
    };
  },
  concatArr(a, ...arr) {
    // 合并多个数组且去重
    return Array.from(new Set(a.concat(...arr)));
  },
  validForm($el, $scroll) {
    //校验表单插件 dom对象，选择器字符串
    let isVaild = true;
    let $error = null;
    if ($el) {
      //进行校验
      let childrendom = [];
      if (this.checkType($el, 'string')) {
        childrendom = document.querySelectorAll($el + ' .form-li');
      } else {
        childrendom = $el.querySelectorAll('.form-li');
      }

      if (childrendom && childrendom.length > 0) {
        childrendom.forEach(children => {
          if (children.__vue__ && children.__vue__.valid) {
            if (!children.__vue__.valid()) {
              isVaild && ($error = children);
              isVaild = false;
            }
          }
        });
      }
    }
    if (!isVaild && $scroll) {
      //如果校验不通过滚动到具体的位置
      this.checkType($scroll, 'string') && ($scroll = document.querySelector($scroll));
      let targetConfig = $error.getBoundingClientRect();
      let containConfig = $scroll.getBoundingClientRect();
      if (!(targetConfig.top > containConfig.top && targetConfig.top < containConfig.top + containConfig.height)) {
        $scroll.scrollTop = Math.abs(targetConfig.top - containConfig.top) + 50;
      }
    }
    return isVaild;
  },
  toggleClass(el, cls, type) {
    // 1、el:目标元素  2、cls:需要操作的class  3、type:"add"代表添加对应的class  "remove"代码删除对应的class 如果不传则有则删除，没有则添加
    if (!el || !cls) {
      return;
    }
    cls = cls.trim().split(' '); // 需要处理的class数组
    let curClass = el.className ? el.className.trim().split(' ') : []; // 现有的class数组

    for (let i = 0, j = cls.length; i < j; i++) {
      const clsName = cls[i];
      if (!clsName.trim()) {
        continue;
      }
      let index = curClass.indexOf(clsName);
      if (index >= 0 && type !== 'add') {
        curClass.splice(index, 1);
      } else if (index < 0 && type !== 'remove') {
        curClass.push(clsName);
      }
    }
    el.className = curClass.join(' ');
  },
  getValueByPath(value, path, isArrary) {
    //1、value：[Nothing]需要做判断的值, 2、path：[Array]需要层层遍历的  3、isArrary:[Boolean]最终获取的值是数组，而且数组的长度大于0
    let result = value;
    if (value === null || value === undefined) {
      result = false;
    } else if (path && !value) {
      result = false;
    } else if (typeof value == 'object' && path) {
      let pathList = path.split('.');
      let val = value;
      pathList &&
        pathList.forEach((item, i) => {
          val !== false && (val = this.getDeepData(val[item]));
        });
      result = val;
    } else if (path && typeof value !== 'object') {
      result = false;
    }
    if (!(result && isArrary && result instanceof Array && result.length > 0)) {
      result = false;
    }
    return result;
  },
  checkType(value, type) {
    // 检查数据类型 1、value:[nothing]需要检查的数据 2、type :[string]类型,如果type不存在直接返回类型 null undefined number boolean string object array set map function  date regexp  promise symbol error
    let result = false;
    let str = Object.prototype.toString.call(value).slice(8, -1);
    if (!type) {
      //如果type不存在则放回类型
      return str;
    }
    if (typeof type == 'string') {
      if (str.toUpperCase() == type.toUpperCase()) {
        result = true;
      }
    } else if (type instanceof Array) {
      type.find(item => {
        if (str.toUpperCase() == item.toUpperCase()) {
          result = true;
          return true;
        }
        return false;
      });
    }
    return result;
  },
  checkStringNotEmpty(value) {
    // 检查数据类型 1、value:[nothing]需要检查的数据 2、type :[string]类型,如果type不存在直接返回类型 null undefined number boolean string object array set map function  date regexp  promise symbol error
    return !this.checkType(value, ['null', 'undefined']) && value !== '';
  },
  equalStr(str1, str2) {
    //判断两个字符串是否是相同 主要是为了对 0 和 '0'需要判断相同的情况下面
    if (this.checkType(str1, 'null') || this.checkType(str1, 'undefined')) {
      //当两个值有
      if (this.checkType(str2, 'null') || this.checkType(str2, 'undefined')) {
        return true;
      }
    } else if (str1 === 0) {
      if ((this.checkType(str2, 'number') && str2 === 0) || (this.checkType(str2, 'string') && str2 === '0')) {
        return true;
      }
    } else if (str2 === 0) {
      if ((this.checkType(str1, 'number') && str1 === 0) || (this.checkType(str1, 'string') && str1 === '0')) {
        return true;
      }
    } else {
      return str1 == str2;
    }
    return false;
  },
  isEmpty(val) {
    // null undefined '' []  {} 五中情况情况中的任何一种则为true
    if (val === null || val === undefined || val === '') {
      return true;
    } else if (this.checkType(val, 'array') && val.length <= 0) {
      return true;
    } else if (this.checkType(val, 'object') && Object.keys(val).length == 0) {
      return true;
    }
    return false;
  },
  isSame(val1, val2) {
    let _this = this;
    let isEqual = _.isEqualWith(val1, val2, function (val1, val2) {
      if (_this.isEmpty(val1) && _this.isEmpty(val2)) {
        return true;
      } else if (_this.isEmpty(val1) || _this.isEmpty(val2)) {
        return false;
      }
    });
    return isEqual;
  },
  toChinese(values) {
    let arr = [];
    let val = typeof values == 'number' ? values.toString() : values;
    let len = val.length; //统计出长度
    let chin_list = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    let chin_lisp = ['万', '千', '百', '十'];

    for (let i = 0; i < len; i++) {
      arr.push(Math.floor(val[i])); //输入的数据按下标存进去   存进去的只是数字
      arr[i] = len == 2 && arr[i] == '1' && i == 0 ? '' : chin_list[arr[i]]; //是根据我们输入的输入的数字，对应着我们的chin_list这个数组
    }
    for (let i = len - 1, j = 1; i > 0; i--) {
      arr.splice(i, 0, chin_lisp[chin_lisp.length - j++]); //j=2
    }
    return arr.join('');
  },
  toEnglish(values) {
    let arr = [];
    let val = typeof values == 'number' ? values : parseInt(values);
    val = val - 1;
    //如果是英文，对应转英文
    let textLength = Math.floor(val / 26);
    if (textLength) {
      for (var i = 0; i < textLength; i++) {
        arr.push('A');
      }
    }
    arr.push(String.fromCharCode(Math.floor((val % 26) + 65)));
    return arr.join('');
  },
  translateNumber(values, codeType) {
    //将数字转为中文一二三或者英文ABCD,1\2\3这种数字
    if (codeType && codeType == 'en') {
      return this.toEnglish(values);
    } else {
      return this.toChinese(values);
    }
  },
  gotoHref(href, that) {
    //通过链接跳转时，需要做路由拦截等操作
    if (that && that.$options.beforeRouteLeave && that.$options.beforeRouteLeave.length > 0) {
      let length = that.$options.beforeRouteLeave.length;
      that.$options.beforeRouteLeave[length - 1].bind(that)(null, null, null, href);
    } else {
      window.location.href = href;
      // window.history.pushState(null, null, href);
      // window.history.forward();
    }
  },
  disabledRepeatSubmit(obj, key, trueval, falseval) {
    //全局处理禁止短时间内反复提交,obj：对应需要改变的数据，key:更新的值的key,trueval:正常的往下走的值（比如放开按钮的disable）,falseval:需要停止正常操作的值（比如禁用按钮）
    let limitTime = 5; //5秒内不可以反复提交
    try {
      let falseobj = {};
      falseobj[key] = falseval;
      Object.assign(obj, falseobj);
      setTimeout(() => {
        falseobj[key] = trueval;
        Object.assign(obj, falseobj);
      }, limitTime * 1000);
    } catch (e) {
      //
    }
  },
  jumpDialog(config, to, from, next, url) {
    //返回提示统一操作，目的统一文案，和统一按钮交互方式
    let _this = this; //需要被改变，为对应的vue对象
    let btnList = [
      {
        text: $t('page.cancel'),
        ghost: true,
        fn: vnode => {
          vnode.isShow = false;
          // url ? '' : next(false);
        }
      },
      {
        text: $t('page.notsave'),
        type: 'primary',
        ghost: true,
        fn: vnode => {
          vnode.isShow = false;
          url ? _this.$utils.gotoHref(url) : next();
        }
      },
      {
        text: $t('page.save'),
        type: 'primary',
        fn: async vnode => {
          if (config && config.save) {
            let res = await config.save.fn(vnode);
            if (res === false) {
              vnode.isShow = false;
              // url ? '' : next(false);
            } else {
              vnode.isShow = false;
              url ? _this.$utils.gotoHref(url) : next();
            }
          } else {
            vnode.isShow = false;
            url ? _this.$utils.gotoHref(url) : next();
          }
        }
      }
    ];
    if (config) {
      btnList[1] = config.noSave ? Object.assign(btnList[1], config.noSave) : btnList[1];
      // btnList[2] = config.save ? Object.assign(btnList[2],config.save):btnList[2];
      btnList[0] = config.close ? Object.assign(btnList[0], config.close) : btnList[0];
    }

    this.$createDialog({
      title: $t('page.tip'),
      content: $t('message.notsavedataupdateredirecttip'),
      btnList: btnList,
      'on-close': vnode => {
        // url ? '' :  next(false);
      }
    });
  },
  hexToRgb(str) {
    //十六进制hex转为rgb,如果是3位的先补齐6位
    var r = /^\#?[0-9A-F]{6}$/;
    if (!r.test(str)) {
      return;
    }
    str = str.replace('#', '');
    var hxs = str.match(/../g);
    for (var i = 0; i < 3; i++) {
      hxs[i] = parseInt(hxs[i], 16);
    }
    return hxs;
  },
  rgbToHex(a, b, c) {
    //再将rbg转为十六进制hex
    var r = /^\d{1,3}$/;
    if (!r.test(a) || !r.test(b) || !r.test(c)) {
      return;
    }
    var hexs = [a.toString(16), b.toString(16), c.toString(16)];
    for (var i = 0; i < 3; i++) if (hexs[i].length == 1) hexs[i] = '0' + hexs[i];
    return '#' + hexs.join('');
  },
  getLightColor(colors, level, noOpacity) {
    //告警颜色背景图减淡,需先转为rgb
    //color:十六进制hex,level:减淡到的百分比，用小数点形式,noOpacity:是否用透明度，默认否，如需要去掉透明度转为十六进制hex
    let color = colors.toUpperCase();
    let r = /^\#?[0-9A-F]{6}$/;
    if (!r.test(color)) {
      let fulltxt = '';
      for (var c = 0; c < color.length; c++) {
        fulltxt += c ? color[c] + color[c] : color[c];
      }
      color = fulltxt;
      if (!r.test(color)) {
        return;
      }
    }
    var rgbc = this.hexToRgb(color);
    if (noOpacity) {
      for (var i = 0; i < 3; i++) {
        rgbc[i] = Math.floor((255 - rgbc[i]) * (1 - level) + rgbc[i]);
      }
      return this.rgbToHex(rgbc[0], rgbc[1], rgbc[2]);
    } else {
      return `rgba(${rgbc[0]},${rgbc[1]},${rgbc[2]},${level})`;
    }
  },
  checkHasSomeitem(arr1, arr2) {
    //返回arr1里是否有跟arr2重复的数据（item不支持数组和对象）,arr2可以是一个item
    let hasSameitem = true;
    let arrNext = typeof arr2 == 'object' ? arr2 : [arr2]; //将对比的转为数组对比
    if (!arr1.length || !arrNext.length) {
      hasSameitem = false;
    } else {
      hasSameitem = _.difference(arr1, arrNext).length < arr1.length;
    }
    return hasSameitem;
  },
  isEmptyObj(obj) {
    const arr = obj ? Object.keys(obj) : []; // 解决obj为null或者undefined时，控制台报错
    return arr.length == 0;
  },
  mergeObj() {
    return _.merge(...arguments);
  },
  goBack(fromPath, url, _this) {
    // beforeRouteEnter(to, from, next) {
    //   next(vm => {
    //     // 通过 `vm` 访问组件实例,将值传入fromPath
    //     vm.fromPath = from.path;  //获取上层路由地址
    //   });
    // },

    // 假如说直接发一个详细页面的链接，点击进去，再点击返回的时候，就点不动了或者直接跳转到登陆页 ( 点击详细页面的链接，没登陆的话，就会到登陆页面 )。 主要是为了解决这个问题

    if (!fromPath || fromPath.length < 4) {
      //如果上层路由没有地址的话，就跳转页面
      _this.$router.push({
        path: url
      });
    } else {
      //如果上层路由有地址的话，就返回上一步
      _this.$router.back();
    }
  },
  download(that, url, data, typeHttp) {
    if (typeHttp == 'get') {
      that.$https.get(url, { responseType: 'blob' }).then(res => {
        if (res.status == '200') {
          const aLink = document.createElement('a');
          let blob = new Blob([res.data], {
            type: 'application/x-msdownload'
          });
          aLink.href = URL.createObjectURL(blob);
          let contentDisposition = decodeURI(res.headers['content-disposition']);
          let fileName = contentDisposition.substring(22, contentDisposition.length - 1);
          aLink.download = fileName;
          aLink.click();
          document.body.appendChild(aLink);
        }
      });
    } else {
      that.$https.post(url, data, { responseType: 'blob' }).then(res => {
        if (res.status == '200') {
          const aLink = document.createElement('a');
          let blob = new Blob([res.data], {
            type: 'application/x-msdownload'
          });
          aLink.href = URL.createObjectURL(blob);
          let contentDisposition = decodeURI(res.headers['content-disposition']);
          let fileName = contentDisposition.substring(22, contentDisposition.length - 1);
          aLink.download = fileName;
          aLink.click();
          document.body.appendChild(aLink);
        }
      });
    }
  },
  formatFileSize(bytes, decimalPoint = 2, type = 'MB') {
    /* 
      格式化文件大小
      bytes 传递文件大小，如：1818
      decimalPoint 保留小数点后多少位
      type: 文件类型，默认是M兆
    */
    if (!bytes) {
      return '';
    }
    switch (type) {
      case 'KB':
        return (bytes / 1024).toFixed(decimalPoint) + 'KB';
      case 'MB':
        return (bytes / (1024 * 1024)).toFixed(decimalPoint) + 'M';
      case 'GB':
        return bytes / (1024 * 1024 * 1024).toFixed(decimalPoint) + 'GB';
      default:
        return '';
    }
  },
  ipVerification(value) {
    //  验证ip合法性
    if (value != '') {
      return /^(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])$/.test(value);
    } else {
      return true;
    }
  },
  portVerfication(port) {
    // 端口合法性
    if (port != '' && !(/^[1-9]\d*$/.test(port) && 1 * port >= 1 && 1 * port <= 65535)) {
      return false;
    } else {
      return true;
    }
  },
  getProtocolDataList(nodeList) {
    // 处理连接协议默认值的数据结构
    let columlist = [];
    nodeList.forEach(v => {
      columlist.push({ text: v.name, value: v.id });
    });
    return columlist;
  },
  getAccountNodeList(nodeList) {
    // 账号下拉列表展示数据
    let columlist = [];
    nodeList &&
      nodeList.forEach(v => {
        let text = v.name;
        if (v.account && v.protocol != 'tagent') {
          text += '(' + v.account + ')';
        }
        if (v.protocol) {
          text += '/' + v.protocol;
        }
        if (v.protocolPort) {
          text += '(' + v.protocolPort + ')';
        }
        columlist.push({ text: text, value: v.id, config: v });
      });
    return columlist;
  },
  getRunnerGroupList(list) {
    let columlist = [];
    columlist.push({ text: $t('page.autoexecradomrunnergroup'), value: -1, config: {} });
    list &&
      list.forEach(v => {
        columlist.push({ text: v.name, value: v.id, config: v });
      });
    return columlist;
  },
  getRunnerGroupTagList(list) {
    let columlist = [];
    list &&
      list.forEach(v => {
        columlist.push({ text: v.name, value: v.id, config: v });
      });
    return columlist;
  },
  getAppForselect(nodeList) {
    //系统和模块下拉数据（资源中心）
    let columlist = [];
    nodeList &&
      nodeList.forEach(n => {
        let text = n.abbrName;
        if (n.name) {
          text += '(' + n.name + ')';
        }
        columlist.push({ text: text, value: n.id, config: n });
      });
    return columlist;
  },
  uniqueArr(arr) {
    // 数组对象去重
    return _.uniqWith(arr, _.isEqual);
  },
  uniqueByField(arr, filterField) {
    // 根据某个字段数组去重， filterField 需要去重的字段
    return _.uniqBy(arr, filterField);
  },
  matrixDataSourceRedirect(dataSourceId, dataSourceJson) {
    // 矩阵数据源跳转
    if (dataSourceId) {
      let type = dataSourceJson && dataSourceJson.type;
      let dataSourceType = {
        external: '/matrix-external-edit', // 外部矩阵
        view: '/matrix-view-edit', // 视图矩阵
        cmdbci: '/matrix-view-edit', //cmdb
        private: '/matrix-private', //私有数据源
        cmdbcustomview: '/matrix-view-edit' //cmdb自定义视图
      };
      let defaultType = '/matrix-edit'; // 自定义矩阵
      let path = dataSourceType[type] || defaultType;
      window.open(HOME + '/framework.html#' + path + '?uuid=' + dataSourceJson.uuid + '&name=' + dataSourceJson.name + '&type=' + dataSourceJson.type, '_blank');
    } else {
      window.open(HOME + '/framework.html#/matrix-overview?atrixFormDialogShow=true', '_blank');
    }
  },
  handleInvalidDate(timeValue, format, styleType) {
    // 处理时间格式错误问题
    let specialValue = '';
    let dateValue = timeValue && typeof timeValue == 'number' ? String(timeValue) : timeValue;
    if (styleType == '|' && format && dateValue && typeof dateValue != 'object') {
      // 处理特殊格式时间字符串
      if (format.indexOf('yyyy') >= 0) {
        specialValue = dateValue.substring(0, 4);
      }
      if (format.indexOf('MM') >= 0) {
        specialValue = specialValue + '-' + dateValue.substring(4, 6);
      }
      if (format.indexOf('dd') >= 0) {
        specialValue = specialValue + '-' + dateValue.substring(6, 8);
      }
      if (format.indexOf('HH') >= 0) {
        specialValue = specialValue + ' ' + dateValue.substring(9, 11);
      }
      if (format.indexOf('mm') >= 0) {
        specialValue = specialValue + ':' + dateValue.substring(12, 14);
      }
    } else {
      specialValue = dateValue ? new Date(dateValue) : new Date();
    }
    return specialValue;
  },
  timestampCalculation(unit = null, value = 0, timstamp = null, format = '', styleType = '-') {
    /*
      时间戳计算
      unit 单位 minute/hour/day/month/year
      value：时间值
      timstamp：时间戳
      format：时间格式
      styleType：时间样式格式
    */
    let returnDate = '';
    let dateValue = null;
    if (timstamp && (timstamp.indexOf('-') >= 0 || timstamp.indexOf('/') >= 0)) {
      dateValue = new Date(timstamp);
    } else if (styleType == '|' || new Date(timstamp) == 'Invalid Date') {
      styleType = '|';
      dateValue = new Date(this.handleInvalidDate(timstamp, format, styleType));
    } else {
      dateValue = new Date();
    }
    styleType && styleType == '|' && (styleType = '-');
    let timefn = dateValue;
    let dateTimeValue = dateValue.getTime();
    let dateMonthValue = dateValue.getMonth();
    let dateFullYearValue = dateValue.getFullYear();
    let millisecond = 60 * 1000 * value; // 毫秒
    let hour = 3600 * 1000 * value; // 小时
    let day = 24 * 3600 * 1000 * value; // 天
    if (unit == 'minute') {
      // 分钟
      timefn = dateValue.setTime(dateTimeValue + millisecond);
    } else if (unit == 'hour') {
      // 小时
      timefn = dateValue.setTime(dateTimeValue + hour);
    } else if (unit == 'day') {
      // 天
      timefn = dateValue.setTime(dateTimeValue + day);
    } else if (unit == 'month') {
      // 月份
      timefn = dateValue.setMonth(dateMonthValue + value);
    } else if (unit == 'year') {
      // 年份
      timefn = dateValue.setFullYear(dateFullYearValue + value);
    }
    returnDate = this.getDateByFormat(timefn, format, styleType);
    return returnDate.toString().trim();
  },
  isUserHasAuth(data) {
    // 全局权限方法
    return store.getters.userAuthList.includes(data);
  },
  calculateDate(unit = '', value = 0, timstamp = null) {
    /**
     * 根据 hour/day/month/year 计算时间
     * unit 时间单位：hour/day/month/year
     * value 累加值
     * timstamp 时间戳
     */

    let returnDate = null;
    let time = timstamp ? new Date(timstamp) : new Date();
    let dateObj = {
      minute: time.getTime() + 1 * 60 * 1000 * value,
      hour: time.getTime() + 1 * 60 * 60 * 1000 * value,
      day: time.getTime() + 24 * 3600 * 1000 * value,
      month: this.deepClone(time).setMonth(time.getMonth() + value),
      year: this.deepClone(time).setFullYear(time.getFullYear() + value),
      default: time
    };
    returnDate = dateObj[unit] ? dateObj[unit] : dateObj['default'];
    return returnDate;
  },
  mergeObj(obj1, obj2) {
    // 两个对象合并成一个对象
    let config = {};
    if (obj1 && Object.keys(obj1).length > 0) {
      Object.keys(obj1).forEach(v => {
        config[v] = obj1[v];
      });
    }

    if (obj2 && Object.keys(obj2).length > 0) {
      Object.keys(obj2).forEach(v => {
        config[v] = obj2[v];
      });
    }

    return config;
  },
  substr(name, len) {
    if (name != null && typeof name != 'undefined' && name.length > Number(len)) {
      return name.substr(0, Number(len));
    } else {
      return name;
    }
  },
  jumpTo(id, behavior, parent, block) {
    let element;
    if (parent) {
      element = parent.querySelector(id);
    } else {
      element = document.querySelector(id);
    }
    if (element) {
      element.scrollIntoView({
        block: block || 'center',
        behavior: behavior || 'instant'
      });
    }
  },
  scrollTo(parentId, childId, behavior) {
    //没用
    //debugger;
    const child = document.querySelector(childId);
    // Where is the parent on page
    const parent = document.querySelector(parentId);
    var parentRect = parent.getBoundingClientRect();
    // What can you see?
    var parentViewableArea = {
      height: parent.clientHeight,
      width: parent.clientWidth
    };

    // Where is the child
    var childRect = child.getBoundingClientRect();
    // Is the child viewable?
    var isViewable = childRect.top >= parentRect.top && childRect.bottom <= parentRect.top + parentViewableArea.height;

    // if you can't see the child try to scroll parent
    if (!isViewable) {
      // Should we scroll using top or bottom? Find the smaller ABS adjustment
      const scrollTop = childRect.top - parentRect.top;
      //const scrollBot = childRect.bottom - parentRect.bottom;
      //if (Math.abs(scrollTop) < Math.abs(scrollBot)) {
      // we're near the top of the list
      //parent.scrollTop += scrollTop;
      parent.scrollTo({ top: scrollTop });
      // } else {
      // we're near the bottom of the list
      //parent.scrollTop += scrollBot;
      //  parent.scrollTo({ top: scrollBot });
      //}
    }
  },
  copyText(id) {
    // 复制内容
    const dom = document.querySelector(id);
    if (dom && dom.innerText) {
      const value = dom.innerText.trim();
      const textarea = document.createElement('textarea');
      textarea.value = value;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      ViewUI.Message.success($t('message.copysuccess'));
    }
  },
  nameRegularValid(name) {
    //名称校验：仅支持汉字、字母、数字和特殊字符(._-)
    let regu = /^[A-Za-z._-\d\u4e00-\u9fa5]*$/;
    return regu.test(name);
  },
  mapArray(array, key) {
    //从数组对象中挑出一个key，将其值作为数组返回
    return _.map(array, key);
  },
  getToolClassificationList(list) {
    // 工具分类下拉列表数据（自动化）
    let dataList = [];
    list &&
      list.forEach(item => {
        if (item.name && item.id) {
          dataList.push({
            text: item.description ? `${item.name}[${item.description}]` : item.name,
            value: item.id
          });
        }
      });
    return dataList;
  },
  intersectionArr() {
    return _.intersection(...arguments);
  },
  getRoundCountList() {
    //分批数量下拉列表数据（自动化，自动发布）
    let num = 10;
    let dataList = [
      {
        text: $t('page.fulllist'),
        value: 0
      }
    ];
    for (let i = 0; i <= num; i++) {
      let value = Math.pow(2, i);
      let text = value === 1 ? $t('page.allparallel') : value.toString();
      dataList.push({
        value: value,
        text: text
      });
    }
    return dataList;
  },
  validParamValue(val, validateList) {
    //参数校验规则：判断值是否满足正则规则
    const validtorConfig = require('@/resources/plugins/TsForm/TsValidtor'); // 解决TsValidtor.js加载最快，导致拿不到$t，弹窗校验出不来的问题
    const validtorJson = validtorConfig.default; //require引入TsValidtor的默认为'export default validtor'，会包一层default
    let _this = this;
    let resultValidtorJson = [];
    let isValid = true;
    validateList.forEach(valid => {
      if (typeof valid == 'string') {
        //出入key值，利用默认数据
        validtorJson[valid] && (valid == 'required' ? resultValidtorJson.push(Object.assign({ required: true }, validtorJson[valid])) : resultValidtorJson.push(validtorJson[valid]));
      } else if (typeof valid == 'object') {
        if (validtorJson[valid.name] && valid.name == 'regex' && valid.pattern) {
          // ^[a-z]+$   正则表达式
          resultValidtorJson.push(Object.assign({}, validtorJson.regex, valid));
        } else if (validtorJson[valid.name]) {
          //利用默认key值，但是修改message提示
          valid.name == 'required' ? resultValidtorJson.push(Object.assign({ required: true }, validtorJson[valid.name], valid)) : resultValidtorJson.push(Object.assign({}, validtorJson[valid.name], valid));
        } else if (typeof valid.validator == 'function') {
          resultValidtorJson.push(Object.assign({}, validtorJson[valid.name], valid));
        }
      }
    });
    if (!this.isEmpty(resultValidtorJson)) {
      for (let i = 0; i < resultValidtorJson.length; i++) {
        let valid = resultValidtorJson[i];
        let value = val;
        !(value instanceof Array) && (value = [value]);
        for (let cindex = 0; cindex < value.length; cindex++) {
          let v = value[cindex];
          if (!valid.validator('', v, _this)) {
            isValid = false;
            break;
          }
        }
      }
    }
    return isValid;
  },
  getComposedPath(e) {
    /**
     * 用途：返回事件流中元素的事件路径
     * 最早从官方issue中可获知chromium内核团队早在21年就开始认为 Event.path 属于非标准 API,某些地方已经开始删除
     * 由于event.path 属性已被弃用
     */
    // 当前有直接return
    let pathList = e.path || (e.composedPath && e.composedPath()); // 优先判断 Event.composedPath() 方法是否为空数组
    if ((pathList || []).length) {
      return pathList;
    }
    // 不存在则遍历target节点
    let target = e.target;
    e.path = [];
    while (target.parentNode !== null) {
      e.path.push(target);
      target = target.parentNode;
    }
    // 最后在add进去 document 与 window对象
    e.path.push(document, window);
    return e.path;
  },
  //转换Hex颜色编码为RGBA
  convertHexToRGBA(hexCode, opacity = 1) {
    if (hexCode) {
      let hex = hexCode.replace('#', '');

      if (hex.length === 3) {
        hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
      }

      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      /* Backward compatibility for whole number based opacity values. */
      if (opacity > 1 && opacity <= 100) {
        opacity = opacity / 100;
      }

      return `rgba(${r},${g},${b},${opacity})`;
    }
    return '';
  },
  removeHTMLTag(str) {
    //去除html标签
    if (typeof str != 'string') {
      str = JSON.stringify(str);
    }
    str = str.replace(/<\/?[^>]*>/g, ''); //去除HTML tag
    str = str.replace(/[ | ]*\n/g, '\n'); //去除行尾空白
    str = str.replace(/\n[\s| | ]*\r/g, '\n'); //去除多余空行
    str = str.replace(/ /gi, '');
    str = str.replace(/&nbsp;/gi, ' '); //替换HTML空格
    return str;
  },
  getAbbrNameAndName(systemConfig) {
    // 获取简称(名称)
    let text = '';
    if (systemConfig && systemConfig.abbrName) {
      if (systemConfig.name) {
        text = `${systemConfig.abbrName}(${systemConfig.name})`;
      } else {
        text = systemConfig.abbrName;
      }
    } else if (systemConfig && systemConfig.name) {
      text = systemConfig.name;
    }
    return text;
  },
  handleTopoImagePath(nodesString) {
    if (!nodesString) {
      return '';
    }
    let newNodesString = nodesString.replace(/image="(?:\/resource\/img\/icons\/|\/)([^\/"]+)"/g, (match, imageName) => {
      return `image="/resource/img/topo/${imageName}"`;
    });
    return newNodesString;
  },
  cleanObject(obj) {
    let cleaned = {};

    for (let [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        continue;
      }

      if (typeof value === 'object' && !Array.isArray(value)) {
        value = cleanObject(value);
      }

      cleaned[key] = value;
    }

    return cleaned;
  },
  getTextWidth({ text, fontSize = 12, isBold = false }) {
    // 创建一个隐藏的SVG元素
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', 0);
    svg.setAttribute('height', 0);
    svg.style.position = 'absolute';
    svg.style.visibility = 'hidden';

    // 创建text元素并设置属性
    const svgText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    svgText.setAttribute('x', 0);
    svgText.setAttribute('y', 0);
    svgText.setAttribute('font-size', fontSize);
    if (isBold) {
      svgText.setAttribute('font-weight', 'bold');
    }
    svgText.textContent = text;

    // 将text元素添加到SVG，并将SVG添加到文档
    svg.appendChild(svgText);
    document.body.appendChild(svg);

    // 获取文本宽度
    const textWidth = Math.ceil(svgText.getBBox().width);

    // 从文档中移除SVG
    document.body.removeChild(svg);

    return textWidth;
  },
  merge(obj1, obj2) {
    const result = { ...obj1 }; // 初始时，result 是 obj1 的浅拷贝
    for (const key in obj2) {
      console.log(key);
      if (obj2.hasOwnProperty(key)) {
        if (typeof obj2[key] === 'object' && obj2[key] !== null && !Array.isArray(obj2[key])) {
          // 如果 obj2[key] 是一个对象，并且 obj1[key] 也是一个对象，递归合并
          result[key] = methods.merge(result[key] || {}, obj2[key]);
        } else {
          // 否则，直接将 obj2[key] 的值赋给 result[key]
          console.log(key, obj2[key]);
          result[key] = obj2[key];
        }
      }
    }
    return result;
  },
  evalWithLineNumber(e, code) {
    let error = '';
    if (e instanceof SyntaxError) {
      error = `SyntaxError: ${e.message}；`;
      console.error(`SyntaxError: ${e.message}`);
    } else if (e instanceof EvalError) {
      error = `EvalError: ${e.message}；`;
      console.error(`EvalError: ${e.message}`);
    } else {
      error = `Error: ${e.message}；`;
      console.error(`Error: ${e.message}`);
    }
    const lineMatch = e.stack.match(/<anonymous>:(\d+):\d+/);
    if (lineMatch) {
      const errorLineNumber = parseInt(lineMatch[1]);
      const codeLines = code.split('\n');
      const errorLinesContent = codeLines[errorLineNumber - 1];
      (error += `Error on line ${errorLineNumber}: ${errorLinesContent}`), console.log(`Error on line ${errorLineNumber}: ${errorLinesContent}`);
    } else {
      (error += 'Could not detarmine error line number'), console.error('Could not detarmine error line number');
    }
    return error;
  },
  isImage(fileName) {
    // 判断是否是图片
    const fileExtension = fileName.split('.').pop().toLowerCase(); // 使用split方法根据点（.）分割文件名，[-1]获取最后一个元素，即后缀
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico'];
    return imageExtensions.includes(fileExtension);
  },
  setInterval(callback, delay, alwaysRun = false) {
    let timer;
    let isStopped = false;
    const fn = async () => {
      if (!document.hidden || alwaysRun) {
        await callback();
      }
      if (!isStopped) {
        timer = setTimeout(fn, delay);
      } else {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      }
    };
    // 第一次立即执行
    fn();
    //timer = setTimeout(fn, delay);
    return {
      clear: () => {
        isStopped = true;
      } // 用于手动清除定时器
    };
  },
  sortByObj(obj) {
    //对象的属性按首字母排序
    if (this.isEmpty(obj)) {
      return {};
    }
    // 获取对象的键并排序
    const sortedKeys = _.sortBy(Object.keys(obj));

    // 根据排序后的键顺序，重新构建对象
    const sortedObj = {};
    sortedKeys.forEach(key => {
      sortedObj[key] = obj[key];
    });
    return sortedObj;
  }
};
export default methods;
