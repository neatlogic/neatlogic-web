export default {
  controller: ['minute', 'hour', 'dayofmonth', 'dayofweek', 'month', 'year'],
  second: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59'],
  minute: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59'],
  hour: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'],
  dayofmonth: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'],
  month: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
  dayofweek: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
  dict: {
    minute: '分钟',
    hour: '小时',
    dayofmonth: '天',
    dayofweek: '星期',
    month: '月',
    year: '年',
    JAN: '一月',
    FEB: '二月',
    MAR: '三月',
    APR: '四月',
    MAY: '五月',
    JUN: '六月',
    JUL: '七月',
    AUG: '八月',
    SEP: '九月',
    OCT: '十月',
    NOV: '十一月',
    DEC: '十二月',
    SUN: '星期日',
    MON: '星期一',
    TUE: '星期二',
    WED: '星期三',
    THU: '星期四',
    FRI: '星期五',
    SAT: '星期六',
    '*': '所有',
    '?': '不指定'
  },
  controllerList: {
    minute: [
      {
        type: 'label',
        text: '每'
      },
      {
        type: 'controller',
        get: 'type',
        datasource: 'controller',
        width: 'auto'
      }
    ],
    hour: [
      {
        type: 'label',
        text: '每'
      },
      {
        type: 'controller',
        get: 'type',
        datasource: 'controller',
        width: 'auto'
      },
      {
        type: 'label',
        text: ':'
      },
      {
        type: 'controller',
        get: 'value',
        datasource: 'minute',
        target: 'MINUTE',
        width: 380
      },
      {
        type: 'label',
        text: '分'
      }
    ],
    dayofmonth: [
      {
        type: 'label',
        text: '每'
      },
      {
        type: 'controller',
        get: 'type',
        datasource: 'controller',
        width: 'auto'
      },
      {
        type: 'label',
        text: ''
      },
      {
        type: 'controller',
        get: 'value',
        datasource: 'hour',
        target: 'HOUR',
        width: 380
      },
      {
        type: 'label',
        text: '时'
      },
      {
        type: 'controller',
        get: 'value',
        datasource: 'minute',
        target: 'MINUTE',
        width: 380
      },
      {
        type: 'label',
        text: '分'
      }
    ],
    dayofweek: [
      {
        type: 'label',
        text: '每'
      },
      {
        type: 'controller',
        get: 'type',
        datasource: 'controller',
        width: 'auto'
      },
      {
        type: 'label',
        text: ''
      },
      {
        type: 'controller',
        get: 'value',
        datasource: 'dayofweek',
        target: 'DAYOFWEEK',
        width: 210
      },
      {
        type: 'label',
        text: ''
      },
      {
        type: 'controller',
        get: 'value',
        datasource: 'hour',
        target: 'HOUR',
        width: 380
      },
      {
        type: 'label',
        text: '时'
      },
      {
        type: 'controller',
        get: 'value',
        datasource: 'minute',
        target: 'MINUTE',
        width: 490
      },
      {
        type: 'label',
        text: '分'
      }
    ],
    month: [
      {
        type: 'label',
        text: '每'
      },
      {
        type: 'controller',
        get: 'type',
        datasource: 'controller',
        width: 'auto'
      },
      {
        type: 'label',
        text: ''
      },
      {
        type: 'controller',
        get: 'value',
        datasource: 'dayofmonth',
        target: 'DAYOFMONTH',
        width: 380
      },
      {
        type: 'label',
        text: '日'
      },
      {
        type: 'controller',
        get: 'value',
        datasource: 'hour',
        target: 'HOUR',
        width: 380
      },
      {
        type: 'label',
        text: '时'
      },
      {
        type: 'controller',
        get: 'value',
        datasource: 'minute',
        target: 'MINUTE',
        width: 380
      },
      {
        type: 'label',
        text: '分'
      }
    ],
    year: [
      {
        type: 'label',
        text: '每'
      },
      {
        type: 'controller',
        get: 'type',
        datasource: 'controller',
        width: 'auto'
      },
      {
        type: 'label',
        text: ''
      },
      {
        type: 'controller',
        get: 'value',
        datasource: 'month',
        target: 'MONTH',
        width: 205
      },
      {
        type: 'label',
        text: ''
      },
      {
        type: 'controller',
        get: 'value',
        datasource: 'dayofmonth',
        target: 'DAYOFMONTH',
        width: 380
      },
      {
        type: 'label',
        text: '日'
      },
      {
        type: 'controller',
        get: 'value',
        datasource: 'hour',
        target: 'HOUR',
        width: 380
      },
      {
        type: 'label',
        text: '时'
      },
      {
        type: 'controller',
        get: 'value',
        datasource: 'minute',
        target: 'MINUTE',
        width: 380
      },
      {
        type: 'label',
        text: '分'
      }
    ]
  }
};
