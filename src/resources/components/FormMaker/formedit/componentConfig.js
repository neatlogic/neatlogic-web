export var labelName = {
  forminput: '文本框',
  formtextarea: '文本域',
  formradio: '单选框',
  formcheckbox: '复选框',
  formswitch: '开关',
  formselect: '下拉选择',
  formdate: '日期',
  formtime: '时间',
  formnumber: '数字',
  formemail: '邮箱',
  formphone: '电话',
  formtext: '普通文本 ',
  formeditor: '富文本框',
  formdivider: '分割线',
  formstaticlist: '表格输入组件',
  formcascadelist: '级联下拉',
  formdynamiclist: '表格选择组件',
  formuserselect: '用户选择器',
  formlink: '超链接',
  formpriority: '修改优先级',
  formtreeselect: '多级下拉框',
  formcmdbcientity: '配置项组件',
  formaccounts: '账号组件',
  resourceinput: '资产输入组件',
  formresoureces: '执行目标',
  formupload: '附件上传',
  protocol: '连接协议'
};

// 公共参数
const componentSetting = {};

var component = {
  // 公共参数初始
  common: {
    defaultValueList: null, // 默认值
    quoteUuid: '', // 引用的值的uuid
    validList: [], //
    width: '100%', // 宽度
    isRequired: false, // 必填
    value: null, // 实际值
    defaultValueType: 'self', // 默认值的类型
    authorityConfig: ['common#alluser'] // 查看权限默认为所有人
  },
  // 下拉列表
  formselect: {
    placeholder: '请输入',
    dataSource: 'static', // 数据源类型
    dataList: [
      {
        value: '',
        text: ''
      }
    ],
    mapping: {
      // 静态数据源数据
      value: '',
      text: ''
    }, // 映射
    direction: 'transverse', // 方向 主要是为了做表单组件切换的参数的兼容
    isMultiple: false // 多选
  },

  // radio
  formradio: {
    dataSource: 'static', // 数据源类型
    dataList: [
      {
        value: '',
        text: ''
      }
    ],
    mapping: {
      // 静态数据源数据
      value: '',
      text: ''
    }, // 映射
    direction: 'transverse', // 方向
    isMultiple: false // 多选 主要是为了做表单组件切换的参数的兼容
  },

  // checkbox
  formcheckbox: {
    dataSource: 'static', // 数据源类型
    dataList: [
      {
        value: '',
        text: ''
      }
    ],
    mapping: {
      // 静态数据源数据
      value: '',
      text: ''
    }, // 映射
    direction: 'transverse', // 方向
    isMultiple: true // 多选 主要是为了做表单组件切换的参数的兼容
  },

  // 级联下拉
  formcascadelist: {
    placeholder: ['请选择一级下拉', '请选择二级下拉', '请选择三级下拉'],
    direction: 'transverse', // 方向
    dataSource: 'static', // 数据源类型
    levelType: '2', // 下拉层级
    dataList: [{ value: '', text: ''}],
    mapping: [
      {
        // 映射
        value: '',
        text: ''
      },
      {
        value: '',
        text: ''
      }
    ],
    defaultValueList: ['', ''] // 默认值
  },

  // 用户
  formuserselect: {
    placeholder: '请选择',
    isMultiple: false, // 多选
    groupList: []
  },

  // 日期
  formdate: {
    placeholder: '请选择日期',
    showType: 'yyyy-MM-dd HH:mm',
    nowExpression: 'others',
    nowValue: '',
    nowUnit: '',
    validType: [], // 校验类型  自定义  工作日 等
    validValueList: [] // 校验类型
  },

  // 时间
  formtime: {
    placeholder: '请选择时间',
    showType: 'HH:mm:ss',
    validType: [], // 校验类型  自定义  工作日 等
    validValueList: [] // 校验类型
  },

  // 文本框
  forminput: {
    placeholder: '请输入',
    inputMaxlength: 50,
    textType: 'none',
    minNumber: '',
    maxNumber: '',
    decimalNumber: ''
  },

  // 文本域
  formtextarea: {
    placeholder: '请输入',
    textareaMaxlength: 500
  },

  // 富文本框
  formeditor: {
    placeholder: '请输入',
    editorMaxlength: '',
    isRequired: false
  },

  // 线条
  formdivider: {
    dividerColor: '#333333',
    dividerWidth: '1',
    dividerType: 'solid'
  },

  // 静态列表
  formstaticlist: {
    width: '100%',
    attributeList: [
      {
        attributeUuid: setUuid(),
        attribute: '',
        isRequired: false,
        type: 'text',
        attrConfig: {
          dataSource: 'static',
          dataList: [
            {
              value: '',
              text: ''
            }
          ],
          mapping: {
            text: '',
            value: ''
          },
          matrixUuid: '',
          defaultValue: '',
          value: ''
        }
      }
    ]
  },

  // 动态态列表
  formdynamiclist: {
    matrixUuid: '',
    width: '100%',
    dataConfig: [],
    uuidColumn: null,
    pageSize: 10,
    mode: 'dialog',
    needPage: false,
    extendAttributes: false, //扩展属性按钮
    attributeList: [], //扩展属性数据
    dataSource: 'matrix', // 数据源类型:matrix(矩阵)；integration(集成)
    integrationUuid: '' //集成uuid
  },
  //超链接
  formlink: {
    target: '_self'
  },
  formtreeselect: {
    placeholder: '请选择下拉树'
    // defaultValueList: ['', ''] // 默认值
  },
  formcmdbcientity: {
    placeholder: '请选择配置项组件'
    // defaultValueList: ['', ''] // 默认值
  },
  formaccounts: {
    placeholder: '选择账号组件'
  },
  //资产输入组件
  resourceinput: {
    mode: 'normal'
  },
  //修改优先级
  formpriority: {
    isFooter: true, //代表是不用显示在表单的组件
    matrixUuid: '',
    mapping: {
      text: '',
      value: ''
    },
    fn: 'dealPriority'
  },
  //执行目标
  formresoureces: {
    placeholder: '选择执行目标'
  },
  //连接协议
  protocol: {
    placeholder: '选择连接协议'
  },
  // 附件上传
  formupload: {
    placeholder: '选择上传的附件',
    uploadType: 'one', // 默认为单例模式，more为多例模式
    defaultValueList: [],
    isTemplate: false //是否选择附件模板
  }
};

function setUuid() {
  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = (Math.random() * 16) | 0;
    let v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export var componentListConfig = {};

for (var key in component) {
  componentListConfig[key] = Object.assign({}, component.common, component[key]);
}
