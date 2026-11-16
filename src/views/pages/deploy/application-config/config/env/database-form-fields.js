// 两端共用 Schema 格式与数据库参数定义，查重规则由当前编辑入口提供。
export function schemaField(uniqueRule) {
  return {
    name: 'dbSchema',
    type: 'text',
    label: this.$t('term.deploy.databaseschema'),
    maxlength: 50,
    validateList: [
      'required',
      'key-special',
      {
        name: 'regex',
        message: this.$t('term.deploy.inputformatisnotstandardpleaseenter'),
        pattern: /^[A-Za-z\d_-]+[.]+[A-Za-z\d_-]+$/
      },
      {
        name: 'custom',
        trigger: 'change',
        message: this.$t('term.deploy.thereisoneandonlyonedot'),
        validator: (rule, value) => {
          // 验证有且只有一个点号
          let potsNumber = value ? value.split('.').length : 0;
          return !(potsNumber > 2);
        }
      },
      uniqueRule
    ],
    desc: this.$t('term.deploy.schemaformatdesc')
  };
}

// 每张表单使用独立字段数组，避免切换数据库类型时影响其他弹框。
export function databaseOptions() {
  return {
    common: [
      {
        name: 'custom',
        type: 'text',
        label: this.$t('term.deploy.customparameter'),
        maxlength: 256
      },
      {
        name: 'logonTimeout',
        type: 'text',
        label: this.$t('term.deploy.connectiontimeout'),
        maxlength: 256
      },
      {
        name: 'locale',
        type: 'text',
        label: 'DBLocale',
        maxlength: 256,
        validateList: ['key-special']
      },
      {
        name: 'fileCharset',
        type: 'text',
        label: this.$t('page.filecoding'),
        maxlength: 256
      },
      {
        name: 'autocommit',
        type: 'select',
        label: this.$t('term.deploy.autocommit'),
        transfer: true,
        dataList: [
          {
            text: this.$t('page.yes'),
            value: 1
          },
          {
            text: this.$t('page.no'),
            value: 0
          }
        ]
      },
      {
        name: 'dbVersion',
        type: 'text',
        label: this.$t('term.deploy.dbversion'),
        maxlength: 256
      },
      {
        name: 'ignoreErrors',
        type: 'text',
        label: this.$t('term.deploy.ignoreerrors'),
        maxlength: 256
      },
      {
        name: 'dbaRole',
        type: 'text',
        label: this.$t('term.deploy.dbarole'),
        maxlength: 256
      }
    ],
    oracle: [
      {
        name: 'oraWallet',
        type: 'select',
        label: 'oraWallet',
        transfer: true,
        dataList: [
          {
            text: this.$t('page.yes'),
            value: 1
          },
          {
            text: this.$t('page.no'),
            value: 0
          }
        ]
      }
    ],
    db2: [
      {
        name: 'db2SqlTerminator',
        type: 'text',
        label: 'db2SqlTerminator',
        maxlength: 256
      },
      {
        name: 'db2ProcTerminator',
        type: 'text',
        label: 'db2ProcTerminator',
        maxlength: 256
      }
    ]
  };
}
