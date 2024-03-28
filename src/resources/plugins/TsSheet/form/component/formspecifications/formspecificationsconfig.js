let formspecificationsconfig = {
  mapping: {
    moduleName: {
      attrUuid: '78ced1a81eab42d497c628ca361e95bb',
      matrixUuid: 'bb3415c7570c4f8097f44613a812800b',
      textField: '1c00c937480749029ba0fdc8238eff04',
      valueField: '1c00c937480749029ba0fdc8238eff04'
    }
  },
  table1: {
    configurationName: {
      theadTitle: '服务/配置名称',
      type: 'select',
      textName: 'text', // 名称
      valueName: 'value', // 名称
      transfer: true,
      firstSelect: false,
      dynamicUrl: '/api/rest/matrix/column/data/search/forselect',
      rootName: 'dataList',
      params: {},
      validateList: [{ name: 'required', message: '' }]
    },
    osVersion: {
      theadTitle: 'OS版本',
      type: 'select',
      textName: 'text',
      valueName: 'value',
      transfer: true,
      firstSelect: false,
      validateList: [{ name: 'required', message: '' }],
      rootName: 'dataList',
      dynamicUrl: '/api/rest/matrix/column/data/search/forselect',
      params: {
        matrixUuid: 'b4933945c67b4121993d4a48862f801e',
        textField: 'osName', // 映射字段，操作系统名称
        valueField: 'osName'
      }
    },
    deliveryStandards: {
      theadTitle: '交付标准',
      type: 'select',
      transfer: true,
      firstSelect: false,
      validateList: [{ name: 'required', message: '' }],
      rootName: 'dataList',
      dynamicUrl: '/api/rest/matrix/column/data/search/forselect',
      params: {
        filterAttrUuid: 'osName', // 过滤属性uuid
        matrixUuid: 'b4933945c67b4121993d4a48862f801e',
        textField: 'lineName', // 映射字段
        valueField: 'lineName' // 映射字段
      }
    },
    networkArea: {
      theadTitle: '网络区域',
      type: 'text',
      validateList: [{ name: 'required', message: '' }]
    },
    serverConfiguration: {
      theadTitle: '服务器配置',
      type: 'select',
      transfer: true,
      firstSelect: false,
      validateList: [{ name: 'required', message: '' }],
      rootName: 'dataList',
      dynamicUrl: '/api/rest/matrix/column/data/search/forselect',
      params: {
        matrixUuid: '38c0adf869e3414094ff9086a51f913c',
        textField: 'f7b1b3be893544dd970a045a80779432', // 映射字段
        valueField: 'f7b1b3be893544dd970a045a80779432' // 映射字段
      }
    },
    productionEnvironmentQuantity: {
      theadTitle: '生产环境数量',
      type: 'text'
    },
    numberOfDevelopmentEnvironments: {
      theadTitle: '开发环境数量',
      type: 'text'
    },
    numberOfTestingEnvironments: {
      theadTitle: '测试环境数量',
      type: 'text'
    },
    numberOfReturnedEnvironments: {
      theadTitle: '回归环境数量',
      type: 'text'
    }
  },
  table2: {
    configurationName: {
      theadTitle: '服务/配置名称',
      type: 'select',
      textName: 'text',
      valueName: 'value',
      transfer: true,
      firstSelect: false,
      validateList: [{ name: 'required', message: '' }],
      dynamicUrl: '/api/rest/matrix/column/data/search/forselect',
      rootName: 'dataList',
      params: {
        attrUuid: '78ced1a81eab42d497c628ca361e95bb',
        matrixUuid: 'bb3415c7570c4f8097f44613a812800b',
        textField: '1c00c937480749029ba0fdc8238eff04',
        valueField: '1c00c937480749029ba0fdc8238eff04'
      }
    },
    middlewareVersion: {
      theadTitle: '中间件版本',
      type: 'select',
      textName: 'text',
      valueName: 'value',
      transfer: true,
      firstSelect: false,
      dynamicUrl: '/api/rest/matrix/column/data/search/forselect',
      rootName: 'dataList',
      validateList: [{ name: 'required', message: '' }],
      params: {
        matrixUuid: '0d1639a0edfd4846b0cc2315eb66753d',
        textField: 'lineName',
        valueField: 'lineName'
      }
    },
    JDKVersion: {
      theadTitle: 'JDK版本',
      type: 'select',
      transfer: true,
      firstSelect: false,
      dynamicUrl: '/api/rest/matrix/column/data/search/forselect',
      rootName: 'dataList',
      validateList: [{ name: 'required', message: '' }],
      params: {
        matrixUuid: 'a1a43fd5b90f4789a9129cf5ca3b9ce0',
        textField: 'lineName',
        valueField: 'lineName'
      }
    },
    deliveryStandards: {
      theadTitle: '交付标准',
      validateList: [{ name: 'required', message: '' }],
      transfer: true,
      firstSelect: false,
      type: 'select',
      dynamicUrl: '/api/rest/matrix/column/data/search/forselect',
      rootName: 'dataList',
      params: {
        matrixUuid: 'b4933945c67b4121993d4a48862f801e',
        textField: 'lineName',
        valueField: 'lineName'
      }
    },
    architecture: {
      theadTitle: '架构',
      type: 'select',
      transfer: true,
      firstSelect: false,
      validateList: [{ name: 'required', message: '' }],
      dynamicUrl: '/api/rest/matrix/column/data/search/forselect',
      rootName: 'dataList',
      params: {
        matrixUuid: 'a48a1c0f314d4f9190b9223cade70724',
        textField: 'f4462c76398748a6b52c13b32ecb7719',
        valueField: 'f4462c76398748a6b52c13b32ecb7719'
      }
    },
    servicePort: {
      theadTitle: '服务端口',
      validateList: [{ name: 'required', message: '' }],
      placeholder: '多个端口用英文逗号隔开',
      type: 'text'
    },
    serviceName: {
      theadTitle: '服务名称'
    }
  },
  table3: {
    configurationName: {
      theadTitle: '服务/配置名称',
      type: 'select',
      textName: 'text',
      valueName: 'value',
      transfer: true,
      firstSelect: false,
      dynamicUrl: '/api/rest/matrix/column/data/search/forselect',
      rootName: 'dataList',
      validateList: [{ name: 'required', message: '' }],
      params: {
        attrUuid: '78ced1a81eab42d497c628ca361e95bb',
        matrixUuid: 'bb3415c7570c4f8097f44613a812800b',
        textField: '1c00c937480749029ba0fdc8238eff04',
        valueField: '1c00c937480749029ba0fdc8238eff04'
      }
    },
    dataBaseVersion: {
      theadTitle: '数据库版本',
      type: 'select',
      textName: 'text',
      valueName: 'value',
      transfer: true,
      firstSelect: false,
      dynamicUrl: '/api/rest/matrix/column/data/search/forselect',
      rootName: 'dataList',
      validateList: [{ name: 'required', message: '' }],
      params: {
        matrixUuid: '3af5990116d945318328e0de56152c9e',
        textField: 'lineName',
        valueField: 'lineName'
      }
    },
    dataBaseType: {
      theadTitle: '数据库类型',
      type: 'select',
      textName: 'text',
      valueName: 'value',
      transfer: true,
      firstSelect: false,
      dynamicUrl: '/api/rest/matrix/column/data/search/forselect',
      rootName: 'dataList',
      validateList: [{ name: 'required', message: '' }],
      params: {
        matrixUuid: '455852b8dab4433d9505fe5fe7115fde',
        textField: '93516c1454e04785932fa158235b9a10',
        valueField: '93516c1454e04785932fa158235b9a10'
      }
    },
    JDKVersion: {
      theadTitle: 'JDK版本',
      type: 'select',
      dynamicUrl: '/api/rest/matrix/column/data/search/forselect',
      rootName: 'dataList',
      validateList: [{ name: 'required', message: '' }],
      transfer: true,
      firstSelect: false,
      params: {
        matrixUuid: 'a1a43fd5b90f4789a9129cf5ca3b9ce0',
        textField: 'lineName',
        valueField: 'lineName'
      }
    },
    deliveryStandards: {
      theadTitle: '交付标准',
      type: 'select',
      validateList: [{ name: 'required', message: '' }],
      dynamicUrl: '/api/rest/matrix/column/data/search/forselect',
      rootName: 'dataList',
      transfer: true,
      firstSelect: false,
      params: {
        matrixUuid: 'b4933945c67b4121993d4a48862f801e',
        textField: 'lineName',
        valueField: 'lineName'
      }
    },
    architecture: {
      theadTitle: '字符集',
      type: 'select',
      validateList: [{ name: 'required', message: '' }],
      dynamicUrl: '/api/rest/matrix/column/data/search/forselect',
      rootName: 'dataList',
      transfer: true,
      firstSelect: false,
      params: {
        matrixUuid: 'eb563b18764144c68b9edf6dd9654f40',
        textField: '4f16334832244b7db9ffdd73cb4ba802',
        valueField: '4f16334832244b7db9ffdd73cb4ba802'
      }
    },
    servicePort: {
      theadTitle: '生产环境架构（同城）'
    },
    serviceName: {
      theadTitle: '生产环境空间'
    },
    devEnvironmentArchitecture: {
      theadTitle: '开发环境架构'
    },
    testEnvironmentArchitecture: {
      theadTitle: '测试环境架构'
    },
    returnToEnvironmentalArchitecture: {
      theadTitle: '回归环境架构'
    }
  }
};

export { formspecificationsconfig };
